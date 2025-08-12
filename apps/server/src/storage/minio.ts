import {
	CreateBucketCommand,
	GetObjectCommand,
	HeadBucketCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "minio"; // docker compose service name
const MINIO_PORT = Number(process.env.MINIO_PORT || 9000);
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || "minioadmin";
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || "minioadmin";
const MINIO_BUCKET = process.env.MINIO_BUCKET || "pdfs";
const MINIO_USE_SSL =
	String(process.env.MINIO_USE_SSL || "false").toLowerCase() === "true";

export const s3 = new S3Client({
	forcePathStyle: true, // needed for MinIO
	region: "us-east-1",
	endpoint: `${MINIO_USE_SSL ? "https" : "http"}://${MINIO_ENDPOINT}:${MINIO_PORT}`,
	credentials: {
		accessKeyId: MINIO_ACCESS_KEY,
		secretAccessKey: MINIO_SECRET_KEY,
	},
});

export async function ensureBucketExists(bucket = MINIO_BUCKET) {
	try {
		await s3.send(new HeadBucketCommand({ Bucket: bucket }));
	} catch (_err) {
		await s3.send(new CreateBucketCommand({ Bucket: bucket }));
	}
}

export async function uploadPdf(opts: {
	key: string;
	body: Buffer | Uint8Array | string;
	contentType: string;
	bucket?: string;
}) {
	const bucket = opts.bucket || MINIO_BUCKET;
	await s3.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: opts.key,
			Body: opts.body,
			ContentType: opts.contentType,
		}),
	);
	return { bucket, key: opts.key };
}

export async function getPdfStream(opts: { key: string; bucket?: string }) {
	const bucket = opts.bucket || MINIO_BUCKET;
	const res = await s3.send(
		new GetObjectCommand({ Bucket: bucket, Key: opts.key }),
	);
	return {
		bucket,
		key: opts.key,
		body: res.Body as ReadableStream | null,
		contentType: res.ContentType || "application/pdf",
	};
}

export const MINIO_DEFAULT_BUCKET = MINIO_BUCKET;

// Convert Node.js Readable or Web ReadableStream to Uint8Array
export async function readBodyToBytes(
	body:
		| ReadableStream
		| (NodeJS.ReadableStream & { arrayBuffer?: never })
		| { arrayBuffer: () => Promise<ArrayBuffer> }
		| null
		| undefined,
): Promise<Uint8Array> {
	if (!body) return new Uint8Array();
	// If it's a Web ReadableStream
	if (
		typeof (body as ReadableStream & { getReader?: () => unknown })
			.getReader === "function"
	) {
		const resp = new Response(body as unknown as ReadableStream);
		const ab = await resp.arrayBuffer();
		return new Uint8Array(ab);
	}
	// If it's a Node.js Readable
	if (typeof (body as NodeJS.ReadableStream).on === "function") {
		const chunks: Buffer[] = [];
		await new Promise<void>((resolve, reject) => {
			(body as NodeJS.ReadableStream).on("data", (chunk: Buffer) =>
				chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)),
			);
			(body as NodeJS.ReadableStream).on("end", () => resolve());
			(body as NodeJS.ReadableStream).on("error", (err: unknown) =>
				reject(err),
			);
		});
		return new Uint8Array(Buffer.concat(chunks));
	}
	// Fallback: try arrayBuffer if present
	if (
		typeof (body as { arrayBuffer?: () => Promise<ArrayBuffer> })
			.arrayBuffer === "function"
	) {
		const ab = await (
			body as { arrayBuffer: () => Promise<ArrayBuffer> }
		).arrayBuffer();
		return new Uint8Array(ab);
	}
	// Last resort: toString
	const str = String(body);
	return new Uint8Array(Buffer.from(str));
}

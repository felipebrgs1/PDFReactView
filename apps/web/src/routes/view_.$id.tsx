import { createFileRoute, useParams } from "@tanstack/react-router";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
	"pdfjs-dist/build/pdf.worker.min.mjs",
	import.meta.url,
).toString();

const options = {
	cMapUrl: "/cmaps/",
	standardFontDataUrl: "/standard_fonts/",
	wasmUrl: "/wasm/",
};

export const Route = createFileRoute("/view_/$id")({
	component: PDFViewPage,
});

function PDFViewPage() {
	const { id } = useParams({ from: "/view_/$id" });
	const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
	const fileUrl = `${apiBase}/pdf/${id}`;

	const [numPages, setNumPages] = useState<number>();
	const [pageNumber, setPageNumber] = useState<number>(1);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [containerWidth, setContainerWidth] = useState<number>(1000);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const ro = new ResizeObserver((entries) => {
			const width = entries[0]?.contentRect.width;
			if (width) setContainerWidth(Math.min(width, 1200));
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	const onDocumentLoadSuccess = useCallback(
		({ numPages: nextNumPages }: PDFDocumentProxy) => {
			setNumPages(nextNumPages);
			// Reset to first page after a new document loads
			setPageNumber(1);
		},
		[],
	);

	return (
		<div className="min-h-screen bg-background text-foreground">
			<header className="border-b bg-card text-card-foreground">
				<div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
					<a href="/" className="text-sm text-muted-foreground hover:underline">
						← Voltar
					</a>
					<h1 className="text-base font-medium">Visualizador de PDF</h1>
					<div />
				</div>
			</header>

			<main className="mx-auto max-w-5xl px-4 py-6">
				{/* Controls */}
				<div className="mb-4 flex items-center justify-center gap-3">
					<button
						className="px-3 py-1 rounded border text-sm disabled:opacity-50"
						onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
						disabled={!numPages || pageNumber <= 1}
						aria-label="Página anterior"
					>
						← Anterior
					</button>
					<span className="text-sm text-muted-foreground">
						Página {pageNumber} {numPages ? `de ${numPages}` : ""}
					</span>
					<button
						className="px-3 py-1 rounded border text-sm disabled:opacity-50"
						onClick={() =>
							setPageNumber((p) =>
								numPages ? Math.min(numPages, p + 1) : p + 1,
							)
						}
						disabled={!numPages || (numPages ? pageNumber >= numPages : false)}
						aria-label="Próxima página"
					>
						Próxima →
					</button>
				</div>

				<div className="flex justify-center">
					<div ref={containerRef} className="w-full" style={{ maxWidth: 1200 }}>
						<Document
							file={fileUrl}
							onLoadSuccess={onDocumentLoadSuccess}
							options={options}
							className="flex flex-col items-center"
						>
							{numPages && numPages > 0 ? (
								<Page
									key={`page_${pageNumber}`}
									pageNumber={pageNumber}
									width={containerWidth}
									className="my-4 mx-0 shadow"
									renderTextLayer={false}
									renderAnnotationLayer={false}
									loading={
										<div className="p-8 text-sm text-muted-foreground">
											Carregando página…
										</div>
									}
								/>
							) : null}
						</Document>
					</div>
				</div>
			</main>
		</div>
	);
}

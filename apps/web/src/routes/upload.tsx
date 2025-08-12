import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";
import FileUploader from "../components/FileUploader";

export const Route = createFileRoute("/upload")({
    component: UploadPage,
});

type UploadResult = { id: number; filename: string };

function UploadPage() {
    const apiBase = useMemo(() => import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000", []);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<UploadResult | null>(null);
    const [hint, setHint] = useState<string | null>(null);
    const copiedRef = useRef<HTMLButtonElement | null>(null);

    // Limite simples para evitar PDFs muito grandes na base (ver "Gotchas" do README)
    const MAX_MB = 25; // ajuste se necessário

    const onFileSelect = useCallback((f: File) => {
        setResult(null);
        setError(null);
        setHint(null);

        const sizeMb = f.size / 1024 / 1024;
        if (sizeMb > MAX_MB) {
            setFile(null);
            setError(`Arquivo muito grande (${sizeMb.toFixed(2)} MB). Limite: ${MAX_MB} MB.`);
            return;
        }

        if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
            setFile(null);
            setError("Apenas arquivos PDF são permitidos.");
            return;
        }

        setFile(f);
        setHint("Pronto para enviar. Revise o arquivo e clique em Enviar.");
    }, []);

    async function handleUpload() {
        if (!file) return;
        setUploading(true);
        setError(null);
        setResult(null);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch(`${apiBase}/upload`, { method: "POST", body: fd });
            if (!res.ok) throw new Error(`Falha no upload: ${res.status}`);
            const json = (await res.json()) as UploadResult;
            setResult(json);
            setHint("Upload concluído com sucesso.");
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setUploading(false);
        }
    }

    function handleReset() {
        setFile(null);
        setResult(null);
        setError(null);
        setHint(null);
    }

    async function handleCopyLink() {
        if (!result) return;
        const url = `${window.location.origin}/view/${result.id}`;
        try {
            await navigator.clipboard.writeText(url);
            if (copiedRef.current) {
                copiedRef.current.innerText = "Copiado";
                setTimeout(() => {
                    if (copiedRef.current) copiedRef.current.innerText = "Copiar link";
                }, 1500);
            }
        } catch {
            // fallback silencioso
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60 text-card-foreground sticky top-0 z-10">
                <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">P</span>
                        <h1 className="text-lg sm:text-xl font-semibold">Enviar PDF</h1>
                    </div>
                    <nav className="flex items-center gap-4 text-sm">
                        <Link to="/" className="text-muted-foreground hover:underline">Início</Link>
                        <a
                            href="https://github.com/felipebrgs1/PDFReactView"
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:underline"
                        >
                            Repo
                        </a>
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <section className="lg:col-span-2 rounded-lg border bg-card text-card-foreground p-5">
                        <div className="mb-3">
                            <p className="text-sm text-muted-foreground">Selecione um PDF e faça upload para visualizar no app.</p>
                        </div>

                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <FileUploader onFileSelect={onFileSelect} currentFile={file ?? undefined} />
                        </div>


                        <div className="flex flex-wrap items-center gap-3 justify-end">
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={uploading && !error}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border bg-background hover:bg-accent/50 text-foreground disabled:opacity-50"
                            >
                                Limpar
                            </button>
                            <button
                                type="button"
                                disabled={!file || uploading}
                                onClick={handleUpload}
                                aria-busy={uploading}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary disabled:opacity-50 hover:bg-primary/90 transition-colors"
                            >
                                {uploading && (
                                    <output aria-live="polite" className="inline-flex">
                                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                        </svg>
                                    </output>
                                )}
                                {uploading ? "Enviando…" : "Enviar"}
                            </button>
                        </div>

                        <div className="mt-4 min-h-[1.5rem]" aria-live="polite">
                            {error && <div className="text-sm text-red-600">{error}</div>}
                            {!error && hint && <div className="text-sm text-muted-foreground">{hint}</div>}
                        </div>

                        {result && (
                            <div className="mt-4 rounded-md border bg-muted/40 p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                    <div className="flex-1">
                                        <p className="text-sm">
                                            Upload concluído: {" "}
                                            <Link
                                                to="/view/$id"
                                                params={{ id: String(result.id) }}
                                                className="text-primary hover:underline"
                                            >
                                                {result.filename}
                                            </Link>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to="/view/$id"
                                            params={{ id: String(result.id) }}
                                            className="inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90"
                                        >
                                            Abrir agora
                                        </Link>
                                        <button
                                            type="button"
                                            ref={copiedRef}
                                            onClick={handleCopyLink}
                                            className="inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-md border hover:bg-accent/50"
                                        >
                                            Copiar link
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    <aside className="lg:col-span-1 space-y-4">
                        <div className="rounded-lg border bg-card text-card-foreground p-4">
                            <h2 className="text-sm font-semibold mb-2">Dicas</h2>
                            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                                <li>Apenas PDF (.pdf).</li>
                                <li>Tamanho máximo sugerido: {MAX_MB} MB.</li>
                                <li>Após enviar, use o link para compartilhar a visualização.</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}

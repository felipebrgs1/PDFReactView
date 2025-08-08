import { useCallback, useState } from 'react';
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import { pdfjs, Document, Page } from 'react-pdf';

import FileUploader from '../components/FileUploader';

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
    component: PDFViewer,
})

import type { PDFDocumentProxy } from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const options = {
    cMapUrl: '/cmaps/',
    standardFontDataUrl: '/standard_fonts/',
    wasmUrl: '/wasm/',
};

const resizeObserverOptions = {};

const maxWidth = 1200;

type PDFFile = string | File | null;

export default function PDFViewer() {
    const [file, setFile] = useState<PDFFile>(null);
    const [numPages, setNumPages] = useState<number>();
    const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
    const [containerWidth, setContainerWidth] = useState<number>();
    const [remoteUrl, setRemoteUrl] = useState<string | null>(null);

    const onResize = useCallback<ResizeObserverCallback>((entries) => {
        const [entry] = entries;

        if (entry) {
            setContainerWidth(entry.contentRect.width);
        }
    }, []);

    useResizeObserver(containerRef, resizeObserverOptions, onResize);

    async function handleFileSelect(selectedFile: File): Promise<void> {
        setFile(selectedFile);
        setRemoteUrl(null);

        // Upload to backend
        try {
            const form = new FormData();
            form.append('file', selectedFile);

            const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
            const res = await fetch(`${apiBase}/upload`, {
                method: 'POST',
                body: form,
            });
            if (!res.ok) throw new Error('Falha no upload');
            const data: { id: number; filename: string } = await res.json();
            const fileUrl = `${apiBase}/pdf/${data.id}`;
            setRemoteUrl(fileUrl);
            // Switch to remote URL for viewing to ensure using canonical stored copy
            setFile(fileUrl);
        } catch (err) {
            console.error(err);
            // Keep local preview even if upload failed
        }
    }

    function onDocumentLoadSuccess({ numPages: nextNumPages }: PDFDocumentProxy): void {
        setNumPages(nextNumPages);
    }

    return (
        <div className="min-h-screen bg-background font-sans m-0">
            <header className="bg-card text-card-foreground p-5 shadow-lg">
                <div className="flex justify-between items-center">
                    <h1 className="text-inherit m-0">react-pdf sample page</h1>
                    {file && (
                        <button
                            onClick={() => setFile(null)}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                        >
                            Carregar outro arquivo
                        </button>
                    )}
                </div>
            </header>

            {/* Renderizar FileUploader apenas quando não há arquivo selecionado */}
            {!file && (
                <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-background/80 z-50">
                    <FileUploader
                        onFileSelect={handleFileSelect}
                        currentFile={null}
                    />
                </div>
            )}

            {/* Renderizar PDF apenas quando há arquivo selecionado */}
            {file && (
                <div className="flex flex-col items-center my-2.5 mx-0 p-2.5">
                    <div
                        className="w-full max-w-[calc(100%-2em)] my-4 mx-0"
                        ref={setContainerRef}
                    >
                        <Document
                            file={file}
                            onLoadSuccess={onDocumentLoadSuccess}
                            options={options}
                            className="flex flex-col items-center"
                        >
                            {Array.from(new Array(numPages), (_el, index) => (
                                <Page
                                    key={`page_${index + 1}`}
                                    pageNumber={index + 1}
                                    width={containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth}
                                    className="my-4 mx-0 shadow-lg"
                                />
                            ))}
                        </Document>
                    </div>
                    {remoteUrl && (
                        <div className="mt-2 text-sm text-muted-foreground">Armazenado em: <a className="underline" href={remoteUrl} target="_blank" rel="noreferrer">{remoteUrl}</a></div>
                    )}
                </div>
            )}
        </div>
    );
}

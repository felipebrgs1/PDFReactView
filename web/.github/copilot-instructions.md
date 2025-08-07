# Copilot Instructions for PDFReactView

## Project Overview

-   **PDFReactView** is a React + TypeScript app for viewing and uploading PDF files, using the `react-pdf` library.
-   Built with Vite and styled with Tailwind CSS. Main entry: `src/main.tsx` renders `PDFViewer` from `src/page.tsx`.
-   Key user features: PDF viewing, file upload, responsive UI, page navigation.

## Key Files & Structure

-   `src/page.tsx`: Main PDF viewer logic (loads, renders, paginates PDFs, manages state).
-   `src/components/FileUploader.tsx`: Drag-and-drop/upload component for PDF files.
-   `src/components/index.ts`: Exports components for easy imports.
-   `src/styles/PDFViewer.css`: Custom and required styles for PDF rendering.
-   `vite.config.ts`: Handles static asset copying (PDF.js cmaps, fonts, wasm) and sets up aliases.
-   `src/assets/sample.pdf`: Example PDF for demo/testing.

## Build & Run

-   Install: `npm install`
-   Dev server: `npm run dev` (default: http://localhost:5173)
-   Production build: `npm run build`
-   Preview build: `npm run preview`

## Patterns & Conventions

-   **Component Exports:** All components are exported via `src/components/index.ts`.
-   **PDF.js Worker:** Worker is set in `src/page.tsx` using `pdfjs.GlobalWorkerOptions.workerSrc`.
-   **Static Assets:** PDF.js assets (cmaps, fonts, wasm) are copied at build via `vite-plugin-static-copy`.
-   **Styling:** Uses Tailwind CSS and custom properties in `PDFViewer.css`. React-PDF required CSS is imported here.
-   **TypeScript:** All logic/components are typed. Use `PDFFile` type for PDF sources.
-   **File Upload:** Use `FileUploader` for all PDF file input; it supports drag-and-drop and file selection.

## External Integrations

-   `react-pdf` for PDF rendering
-   `@wojtekmaj/react-hooks` for resize observer
-   `vite-plugin-static-copy` for asset management

## Examples

-   To add a new PDF-related feature, extend `PDFViewer` in `src/page.tsx`.
-   To add a new UI component, place it in `src/components/` and export via `index.ts`.

## Troubleshooting

-   If PDFs do not render, check that PDF.js assets are copied (see `vite.config.ts`).
-   For styling issues, verify Tailwind and custom CSS imports in `PDFViewer.css`.

---

For more details, see `README.md` or the referenced files above.

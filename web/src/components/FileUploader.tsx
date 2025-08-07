import { useId, useState } from 'react';

interface FileUploaderProps {
    onFileSelect: (file: File) => void;
    currentFile?: File | null;
    accept?: string;
    title?: string;
    description?: string;
}

export default function FileUploader({
    onFileSelect,
    currentFile,
    accept = '.pdf,application/pdf',
    title = 'Carregar arquivo PDF',
    description = 'Clique aqui ou arraste um arquivo PDF'
}: FileUploaderProps) {
    const fileId = useId();
    const [isDragging, setIsDragging] = useState(false);

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const { files } = event.target;
        const selectedFile = files?.[0];

        if (selectedFile) {
            onFileSelect(selectedFile);
        }
    }

    function handleDragOver(event: React.DragEvent<HTMLDivElement>): void {
        event.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave(event: React.DragEvent<HTMLDivElement>): void {
        event.preventDefault();
        setIsDragging(false);
    }

    function handleDrop(event: React.DragEvent<HTMLDivElement>): void {
        event.preventDefault();
        setIsDragging(false);

        const { files } = event.dataTransfer;
        const droppedFile = files?.[0];

        if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.name.endsWith('.pdf'))) {
            onFileSelect(droppedFile);
        }
    }

    function handleClick(): void {
        document.getElementById(fileId)?.click();
    }

    return (
        <div className="mt-4 mb-6 w-full max-w-md">
            <div
                className={`bg-card border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${isDragging
                    ? 'border-primary bg-primary/5 scale-105'
                    : 'border-border hover:border-primary hover:bg-red-50/50'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <div className="mb-4">
                    <svg
                        className="mx-auto h-12 w-12 text-muted-foreground"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                    >
                        <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>

                <div className="mb-4">
                    <span className="text-lg font-medium text-foreground">
                        {isDragging ? 'Solte o arquivo aqui' : title}
                    </span>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {isDragging ? 'Solte para fazer upload' : description}
                    </p>
                </div>

                <input
                    id={fileId}
                    onChange={handleFileChange}
                    type="file"
                    accept={accept}
                    className="hidden"
                />

                {!isDragging && (
                    <div className="mt-4">
                        <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
                            Selecionar Arquivo
                        </span>
                    </div>
                )}

                {currentFile && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                        <p className="text-sm text-foreground font-medium">
                            📄 {currentFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {(currentFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

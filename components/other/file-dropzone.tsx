import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Download, FileSpreadsheet, Upload, X, type LucideIcon } from 'lucide-react';
import { ChangeEvent, DragEvent, useRef, useState } from 'react';

interface FileDropzoneLabels {
    drop: string;
    replace: string;
    remove: string;
    constraints: string;
    invalidType: string;
    emptyFile: string;
    tooLarge: string;
}

interface FileDropzoneProps {
    file: File | null;
    onFileChange: (file: File | null) => void;
    /** Comma-separated extensions, e.g. ".xlsx,.csv,.xls". Also fed to the
     *  native file input's `accept` attribute. */
    accept: string;
    maxBytes: number;
    labels: FileDropzoneLabels;
    /** Filled-state icon. Defaults to FileSpreadsheet since both current
     *  consumers upload XLSX/CSV; pass a different lucide icon for other
     *  content types (e.g. FileImage for image uploads, FileText for plain
     *  text exports). */
    icon?: LucideIcon;
    /** Optional template-download link rendered next to the constraints text
     *  (= used by the structure-import wizard; profile import has no template). */
    templateDownloadUrl?: string;
    templateDownloadLabel?: string;
    disabled?: boolean;
}

/**
 * Display a byte count in the largest unit that keeps the value < 1024.
 * Avoids the "25600.0 KB" ugliness when a 25 MB file is shown as KB.
 */
function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Shared file-picker + drag/drop dropzone for tabular uploads (XLSX/CSV).
 *
 * Controlled component — the parent owns `file` state. Local state covers
 * only the drag-hover visual and the client-side validation error message,
 * which is reset every time the user picks/drops a new file.
 */
export function FileDropzone({
    file,
    onFileChange,
    accept,
    maxBytes,
    labels,
    icon: Icon = FileSpreadsheet,
    templateDownloadUrl,
    templateDownloadLabel,
    disabled = false,
}: FileDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const validate = (candidate: File): string | null => {
        const exts = accept.split(',').map((s) => s.trim().toLowerCase());
        const lower = candidate.name.toLowerCase();
        if (!exts.some((ext) => lower.endsWith(ext))) return labels.invalidType;
        // Catch 0-byte client-side so we never reach the BE with a file whose
        // `mimes:` check would fail with a generic 422.
        if (candidate.size === 0) return labels.emptyFile;
        if (candidate.size > maxBytes) return labels.tooLarge;
        return null;
    };

    const acceptCandidate = (candidate: File) => {
        const err = validate(candidate);
        if (err) {
            setError(err);
            return;
        }
        setError(null);
        onFileChange(candidate);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const picked = e.target.files?.[0] ?? null;
        if (picked) acceptCandidate(picked);
        // Reset the input value so picking the SAME file again still fires
        // onChange (browsers de-dupe by default).
        e.target.value = '';
    };

    const openPicker = () => {
        if (!disabled) inputRef.current?.click();
    };

    const clearFile = () => {
        setError(null);
        onFileChange(null);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;
        const dropped = e.dataTransfer.files?.[0] ?? null;
        if (dropped) acceptCandidate(dropped);
    };

    return (
        <div className="space-y-2">
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleInputChange}
                className="hidden"
                disabled={disabled}
            />
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    if (!disabled) setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                    'rounded-md border-2 border-dashed transition-colors',
                    isDragging
                        ? 'border-main_color bg-main_color/5'
                        : file
                          ? 'border-solid border-input'
                          : 'border-input',
                    disabled && 'opacity-60',
                )}
            >
                {file ? (
                    <div className="flex items-center justify-between gap-3 p-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-main_color/10 text-main_color">
                                <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex min-w-0 flex-col">
                                <span className="truncate text-sm font-medium">{file.name}</span>
                                <span className="text-xs text-muted-foreground">
                                    {formatFileSize(file.size)}
                                </span>
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={openPicker}
                                disabled={disabled}
                            >
                                {labels.replace}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={clearFile}
                                aria-label={labels.remove}
                                disabled={disabled}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={openPicker}
                        disabled={disabled}
                        className="flex w-full flex-col items-center justify-center gap-2 p-8 text-center disabled:cursor-not-allowed"
                    >
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{labels.drop}</p>
                    </button>
                )}
            </div>
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">{labels.constraints}</p>
                {templateDownloadUrl && templateDownloadLabel && (
                    <a
                        href={templateDownloadUrl}
                        className="inline-flex items-center gap-1 text-xs text-main_color hover:underline"
                    >
                        <Download className="h-3 w-3" />
                        {templateDownloadLabel}
                    </a>
                )}
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

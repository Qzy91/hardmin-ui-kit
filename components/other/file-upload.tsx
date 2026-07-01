import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/language-context';
import { CloudUpload, FileText, X } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface FileUploadProps {
    value: File | string | null;
    onChange: (file: File | null) => void;
    onRemove?: () => void;
    error?: string;
    label?: string;
    accept?: string;
    maxSize?: number;
    className?: string;
    mode?: 'image' | 'file';
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;

export const FileUpload: React.FC<FileUploadProps> = ({
    value,
    onChange,
    onRemove,
    error,
    label,
    accept = 'image/*',
    maxSize = DEFAULT_MAX_SIZE,
    mode = 'image',
}) => {
    const { t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const previewUrl = React.useMemo(() => {
        if (!value) return null;
        if (typeof value === 'string') return value;
        return URL.createObjectURL(value);
    }, [value]);

    const handleFileSelect = (file: File) => {
        if (file.size > maxSize) {
            alert(t('documents.errors.fileTooBig'));
            return;
        }
        onChange(file);
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleDrag = (e: React.DragEvent, dragging: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const clearFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        if (onRemove) onRemove();
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="w-full space-y-2">
            {label && <Label>{label}</Label>}

            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => handleDrag(e, true)}
                onDragLeave={(e) => handleDrag(e, false)}
                onDrop={handleDrop}
                className={`relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                    isDragging
                        ? 'border-main_color bg-main_color/5'
                        : 'border-muted-foreground/25 hover:border-main_color hover:bg-muted/50'
                } ${previewUrl ? 'border-solid border-muted bg-bg_primary' : 'bg-bg_primary'} ${error ? 'border-red-500 bg-red-50 dark:bg-red-500/10' : ''}`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileChange}
                    accept={accept}
                    className="hidden"
                />

                {previewUrl ? (
                    <div className="flex w-full flex-col items-center p-2">
                        {mode === 'image' ? (
                            <div className="group relative aspect-video max-h-[200px] w-full">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="h-full w-full rounded-md object-contain"
                                />
                                <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                    <p className="text-xs font-medium text-white">
                                        {t('documents.form.clickToReplace')}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -right-2 -top-2 z-10 h-7 w-7 rounded-full shadow-lg"
                                    onClick={clearFile}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex w-full items-center justify-between gap-3 rounded-md border border-bg_border_element bg-bg_primary p-3 shadow-sm">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-main_color/10 text-main_color">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col truncate">
                                        <span className="truncate text-sm font-medium">
                                            {value instanceof File ? value.name : t('common.file')}
                                        </span>
                                        {value instanceof File && (
                                            <span className="text-xs text-muted-foreground">
                                                {(value.size / 1024).toFixed(1)} KB
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                    onClick={clearFile}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 p-6 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg_secondary text-text_secondary">
                            <CloudUpload className="h-6 w-6" />
                        </div>
                        <div className="text-sm">
                            <span className="font-semibold text-main_color">
                                {t('documents.form.clickToUpload')}
                            </span>{' '}
                            {t('documents.form.dragDropText')}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {accept.includes('image') ? 'JPG, PNG, WEBP' : ''} (max.{' '}
                            {(maxSize / 1024 / 1024).toFixed(0)}MB)
                        </p>
                    </div>
                )}
            </div>
            {error && <p className="text-sm font-medium text-red-500">{error}</p>}
        </div>
    );
};

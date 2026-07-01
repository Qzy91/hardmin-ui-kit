import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/language-context';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { KeyboardEvent, useEffect, useState } from 'react';

export interface PreviewImage {
    src: string;
    name?: string;
    alt?: string;
}

interface ImagePreviewDialogProps {
    images: PreviewImage[];
    initialIndex: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function useImagePreview() {
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);

    return {
        previewIndex,
        openPreview: (index: number) => setPreviewIndex(index),
        closePreview: () => setPreviewIndex(null),
        dialogProps: {
            initialIndex: previewIndex ?? 0,
            open: previewIndex !== null,
            onOpenChange: (o: boolean) => {
                if (!o) setPreviewIndex(null);
            },
        },
    };
}

export function ImagePreviewDialog({
    images,
    initialIndex,
    open,
    onOpenChange,
}: ImagePreviewDialogProps) {
    const { t } = useLanguage();
    const [index, setIndex] = useState(initialIndex);

    useEffect(() => {
        if (open) {
            setIndex(initialIndex);
        }
    }, [open, initialIndex]);

    if (images.length === 0) return null;

    const safeIndex = Math.min(Math.max(index, 0), images.length - 1);
    const current = images[safeIndex];
    const showNav = images.length > 1;
    const title = current.name?.trim() || current.alt?.trim() || t('common.preview');

    const goPrev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
    const goNext = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (!showNav) return;
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goPrev();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            goNext();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="flex max-h-[95vh] max-w-6xl flex-col overflow-hidden p-0"
                onKeyDown={handleKeyDown}
            >
                <div className="flex items-center justify-between border-b px-6 py-3 pr-12">
                    <DialogTitle className="truncate text-sm font-medium">{title}</DialogTitle>
                    {showNav && (
                        <span className="ml-4 shrink-0 text-sm tabular-nums text-muted-foreground">
                            {safeIndex + 1} / {images.length}
                        </span>
                    )}
                </div>
                <div className="relative flex-1 overflow-auto bg-slate-100">
                    <div className="flex h-full min-h-[60vh] items-center justify-center p-6">
                        <img
                            src={current.src}
                            alt={current.alt ?? current.name ?? ''}
                            className="max-h-[80vh] w-auto max-w-full rounded object-contain shadow-sm"
                        />
                    </div>
                    {showNav && (
                        <>
                            <button
                                type="button"
                                onClick={goPrev}
                                aria-label={t('common.previous')}
                                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 transition-colors hover:bg-background"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                                type="button"
                                onClick={goNext}
                                aria-label={t('common.next')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 transition-colors hover:bg-background"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

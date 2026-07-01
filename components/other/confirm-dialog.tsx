import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import React from 'react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: React.ReactNode;
    description: React.ReactNode;
    confirmText?: string;
    variant?: 'main' | 'destructive' | 'outline' | 'default';
    isLoading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText,
    variant = 'main',
    isLoading = false,
}: ConfirmDialogProps) {
    const { t } = useLanguage();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="gap-6 p-8 sm:max-w-[480px]">
                <DialogHeader className="space-y-4">
                    <DialogTitle className="text-left text-2xl font-bold tracking-tight">
                        {title}
                    </DialogTitle>
                    <div className="text-left text-[15px] leading-relaxed text-[#5c7c99]">
                        {description}
                    </div>
                </DialogHeader>

                <div className="flex flex-col gap-6">
                    <Button
                        variant={variant}
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={cn(
                            'h-12 w-full text-base font-semibold transition-all',
                            variant === 'main' && 'bg-[#d4bc82] text-black hover:bg-[#c5ad75]',
                        )}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            confirmText || t('common.confirm')
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

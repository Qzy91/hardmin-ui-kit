import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/language-context';

interface ConfirmDeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName?: string;
    description?: React.ReactNode;
    isLoading?: boolean;
}

export function ConfirmDeleteDialog({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    description,
    isLoading,
}: ConfirmDeleteDialogProps) {
    const { t } = useLanguage();

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('common.confirmDeleteTitle')}</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="text-sm text-muted-foreground">
                            {description ? (
                                description
                            ) : (
                                <>
                                    {t('common.confirmDeleteDescription')}
                                    {itemName && (
                                        <>
                                            {' '}
                                            <strong className="text-text_primary">
                                                "{itemName}"
                                            </strong>
                                            ?
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={isLoading}
                        onClick={onConfirm}
                        className="bg-destructive font-bold text-white hover:bg-destructive/80"
                    >
                        {t('common.delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

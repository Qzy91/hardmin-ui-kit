import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/language-context';

interface ContactOwnerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    planName: string | null;
}

export function ContactOwnerDialog({ open, onOpenChange, planName }: ContactOwnerDialogProps) {
    const { t } = useLanguage();

    const getDescription = () => {
        const text = t('subscription.contactOwner.description');
        return text.replace('{plan}', planName || '');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="flex gap-4 sm:text-left">
                    <div className="space-y-2">
                        <DialogTitle className="text-left text-xl">
                            {t('subscription.contactOwner.title')}
                        </DialogTitle>
                        <DialogDescription className="text-left">
                            {getDescription()}
                        </DialogDescription>
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}

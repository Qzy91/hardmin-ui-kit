import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import { Edit2, Save, X } from 'lucide-react';

interface FormFooterActionsProps {
    isEditing: boolean;
    isNewEntry: boolean;
    isProcessing: boolean;
    onEdit: () => void;
    onCancel: () => void;
}

export const FormFooterActions = ({
    isEditing,
    isNewEntry,
    isProcessing,
    onEdit,
    onCancel,
}: FormFooterActionsProps) => {
    const { t } = useLanguage();

    if (!isEditing) {
        return (
            <div className="mt-6 flex justify-end">
                <Button key="edit-button" type="button" variant="main" onClick={onEdit}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    {t('common.edit')}
                </Button>
            </div>
        );
    }

    return (
        <div className="mt-6 flex justify-end gap-4">
            {!isNewEntry && (
                <Button
                    key="cancel-button"
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isProcessing}
                >
                    <X className="mr-2 h-4 w-4" />
                    {t('common.cancel')}
                </Button>
            )}

            <Button key="save-button" type="submit" variant="main" disabled={isProcessing}>
                {isProcessing ? (
                    t('common.saving')
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" />
                        {isNewEntry ? t('common.create') : t('common.save')}
                    </>
                )}
            </Button>
        </div>
    );
};

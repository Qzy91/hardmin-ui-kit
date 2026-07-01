import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface TableFiltersClearButtonProps {
    onClick: () => void;
    className?: string;
}

export function TableFiltersClearButton({ onClick, className }: TableFiltersClearButtonProps) {
    const { t } = useLanguage();

    return (
        <Button
            type="button"
            variant="ghost"
            onClick={onClick}
            className={cn(
                'h-10 w-full justify-center gap-2 px-3 text-muted-foreground hover:text-foreground sm:w-auto sm:justify-start',
                className,
            )}
        >
            <X className="h-4 w-4" />
            {t('common.clearFilters')}
        </Button>
    );
}

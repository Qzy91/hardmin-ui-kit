import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/contexts/language-context';
import { cn, localeMap } from '@/lib/utils';

const dateFormatMap = {
    cs: 'd. M. yyyy',
    en: 'P',
};

interface DatePickerSimpleProps {
    label?: string;
    value?: Date | null;
    onChange?: (date: Date | undefined) => void;
    className?: string;
    labelClassName?: string;
    buttonClassName?: string;
    hideLabel?: boolean;
}

export function DatePickerSimple({
    label,
    value,
    onChange,
    className,
    labelClassName,
    buttonClassName,
    hideLabel = false,
}: DatePickerSimpleProps) {
    const { language, t } = useLanguage();
    const [open, setOpen] = React.useState(false);
    const reactId = React.useId();
    const inputId = `date-simple-${reactId}`;

    const currentLocale = localeMap[language as keyof typeof localeMap] || enUS;
    const currentDateFormat = dateFormatMap[language as keyof typeof dateFormatMap] || 'P';

    return (
        <div className={cn('flex flex-col gap-3', className)}>
            {!hideLabel && label ? (
                <Label htmlFor={inputId} className={cn('px-1', labelClassName)}>
                    {label}
                </Label>
            ) : null}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id={inputId}
                        className={cn(
                            'w-full justify-start text-left font-normal',
                            !value && 'text-muted-foreground',
                            buttonClassName,
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value ? (
                            format(value, currentDateFormat, { locale: currentLocale })
                        ) : (
                            <span>{t('common.selectDate')}</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={value || undefined}
                        onSelect={(currentDate) => {
                            onChange?.(currentDate);
                            setOpen(false);
                        }}
                        locale={currentLocale}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

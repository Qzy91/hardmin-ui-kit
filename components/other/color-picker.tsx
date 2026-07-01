import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import { Check, Paintbrush } from 'lucide-react';
import React, { useState } from 'react';

export const PRESET_COLORS = [
    '#f8fafc',
    '#f1f5f9',
    '#e2e8f0',
    '#fef2f2',
    '#fee2e2',
    '#fff7ed',
    '#ffedd5',
    '#fefce8',
    '#fef9c3',
    '#f0fdf4',
    '#dcfce7',
    '#eff6ff',
    '#dbeafe',
    '#f5f3ff',
    '#ede9fe',
];

interface ColorPickerProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    disabled?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
    value,
    onChange,
    className,
    disabled = false,
}) => {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        'w-full justify-start bg-bg_primary px-3 font-normal shadow-sm',
                        !value && 'text-muted-foreground',
                        className,
                    )}
                >
                    <div className="flex w-full items-center gap-2">
                        {value ? (
                            <div
                                className="h-4 w-4 shrink-0 rounded-full border border-bg_border_element shadow-inner"
                                style={{ backgroundColor: value }}
                            />
                        ) : (
                            <Paintbrush className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <span className="flex-1 truncate text-left">
                            {value || t('common.select_color')}
                        </span>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-3" align="start">
                <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground">
                        {t('common.palette')}
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                        {PRESET_COLORS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                className={cn(
                                    'group flex h-8 w-8 items-center justify-center rounded-md border border-bg_border_element transition-all hover:scale-110',
                                    value === color ? 'ring-2 ring-main_color ring-offset-1' : '',
                                )}
                                style={{ backgroundColor: color }}
                                disabled={disabled}
                                onClick={() => {
                                    onChange(color);
                                    setOpen(false);
                                }}
                                title={color}
                            >
                                {value === color && (
                                    <Check className="h-4 w-4 text-slate-600 opacity-70" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="mt-2 border-t border-bg_border_element pt-3">
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                            {t('common.custom_color')}
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md border border-bg_border_element">
                                <input
                                    type="color"
                                    value={value || '#ffffff'}
                                    onChange={(event) => onChange(event.target.value)}
                                    disabled={disabled}
                                    className="absolute -inset-2 h-[200%] w-[200%] cursor-pointer border-0 p-0"
                                />
                            </div>
                            <Input
                                value={value}
                                onChange={(event) => onChange(event.target.value)}
                                placeholder="#hex"
                                disabled={disabled}
                                className="h-8 text-xs"
                            />
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

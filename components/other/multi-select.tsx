import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useMemo, useState } from 'react';

export interface MultiSelectOption {
    label: string;
    value: string;
}

interface MultiSelectProps {
    options: MultiSelectOption[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    className?: string;
    showBadges?: boolean;
}

export const MultiSelect = ({
    options,
    selectedValues,
    onChange,
    placeholder,
    searchPlaceholder,
    emptyMessage,
    className,
    showBadges = true,
}: MultiSelectProps) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredOptions = useMemo(() => {
        if (!searchQuery) return options;
        return options.filter((option) =>
            option.label.toLowerCase().includes(searchQuery.toLowerCase()),
        );
    }, [options, searchQuery]);

    const toggleOption = (value: string) => {
        const newSelected = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [...selectedValues, value];
        onChange(newSelected);
    };

    const getLabel = (value: string) => {
        const option = options.find((o) => o.value === value);
        return option ? option.label : value;
    };

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isOpen}
                        className="w-full justify-between"
                    >
                        {selectedValues.length === 0
                            ? placeholder || t('common.all', 'Vše')
                            : `${selectedValues.length} ${t('common.selected', 'vybráno')}`}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                >
                    <div className="flex flex-col gap-2 p-2">
                        <Input
                            placeholder={searchPlaceholder || t('common.search', 'Hledat...')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 focus-visible:ring-main_color"
                        />
                        <div
                            className="max-h-[200px] space-y-1 overflow-y-auto"
                            onWheel={(e) => e.stopPropagation()}
                        >
                            {filteredOptions.length === 0 && (
                                <p className="py-2 text-center text-sm text-muted-foreground">
                                    {emptyMessage || t('common.noData', 'Žádná data')}
                                </p>
                            )}
                            {filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className="flex cursor-pointer items-center space-x-2 rounded-sm p-1 hover:bg-muted"
                                    onClick={() => toggleOption(option.value)}
                                >
                                    <div
                                        className={cn(
                                            'flex h-4 w-4 items-center justify-center rounded border border-primary',
                                            selectedValues.includes(option.value)
                                                ? 'bg-primary text-primary-foreground'
                                                : 'opacity-50 [&_svg]:invisible',
                                        )}
                                    >
                                        <Check className={cn('h-3 w-3')} />
                                    </div>
                                    <span className="text-sm">{option.label}</span>
                                </div>
                            ))}
                        </div>
                        {selectedValues.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto py-1 text-xs hover:text-destructive"
                                onClick={() => onChange([])}
                            >
                                {t('common.clear', 'Vymazat')}
                            </Button>
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            {showBadges && selectedValues.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {selectedValues.slice(0, 3).map((value) => (
                        <Badge
                            key={value}
                            variant="secondary"
                            className="gap-1 rounded-sm border-bg_border_element bg-bg_primary px-2 py-1 text-xs font-normal"
                        >
                            {getLabel(value)}
                            <button
                                className="ml-1 rounded-full p-0.5 hover:bg-main_color/20 hover:text-destructive"
                                onClick={() => toggleOption(value)}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                    {selectedValues.length > 3 && (
                        <Badge
                            variant="secondary"
                            className="bg-muted text-xs text-muted-foreground"
                        >
                            +{selectedValues.length - 3}
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
};

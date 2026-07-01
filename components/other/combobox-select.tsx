import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

export interface ComboboxSelectProps<T> {
    items: T[];
    value: string | null;
    onSelect: (id: string) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    placeholder: string;
    searchPlaceholder: string;
    getKey: (item: T) => string;
    getSearchValue: (item: T) => string;
    renderItem: (item: T) => ReactNode;
    renderSelected: (item: T) => ReactNode;
    disabled?: boolean;
    isLoading?: boolean;
}

export function ComboboxSelect<T>({
    items,
    value,
    onSelect,
    open,
    onOpenChange,
    placeholder,
    searchPlaceholder,
    getKey,
    getSearchValue,
    renderItem,
    renderSelected,
    disabled = false,
    isLoading = false,
}: ComboboxSelectProps<T>) {
    const selectedItem = items.find((item) => getKey(item) === value);
    const { t } = useLanguage();

    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled || isLoading}
                    className={cn(
                        'w-full justify-between font-normal',
                        !value && 'text-muted-foreground',
                    )}
                >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : selectedItem ? (
                        renderSelected(selectedItem)
                    ) : (
                        placeholder
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                onWheel={(e) => e.stopPropagation()}
            >
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList className="max-h-60 overflow-y-auto">
                        <CommandEmpty>{t('common.no_results_found')}</CommandEmpty>
                        <CommandGroup>
                            {items.map((item) => (
                                <CommandItem
                                    key={getKey(item)}
                                    value={getSearchValue(item)}
                                    onSelect={() => {
                                        onSelect(getKey(item));
                                        onOpenChange(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            value === getKey(item) ? 'opacity-100' : 'opacity-0',
                                        )}
                                    />
                                    {renderItem(item)}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

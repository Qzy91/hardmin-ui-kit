import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

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

export interface CreatableComboboxProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    searchPlaceholder?: string;
    createLabel?: (input: string) => string;
    className?: string;
    error?: boolean;
    id?: string;
    disabled?: boolean;
}

export function CreatableCombobox({
    value,
    onChange,
    options,
    placeholder,
    searchPlaceholder,
    createLabel,
    className,
    error,
    id,
    disabled,
}: CreatableComboboxProps) {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const triggerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) {
            setQuery('');
        }
    }, [open]);

    const normalisedOptions = useMemo(() => {
        const set = new Set<string>();
        const out: string[] = [];
        for (const o of options) {
            const v = (o ?? '').trim();
            if (v && !set.has(v)) {
                set.add(v);
                out.push(v);
            }
        }
        return out;
    }, [options]);

    const trimmedQuery = query.trim();
    const lowerQuery = trimmedQuery.toLowerCase();

    const filteredOptions = useMemo(() => {
        if (!trimmedQuery) return normalisedOptions;
        return normalisedOptions.filter((o) => o.toLowerCase().includes(lowerQuery));
    }, [normalisedOptions, trimmedQuery, lowerQuery]);

    const canCreate =
        trimmedQuery.length > 0 && !normalisedOptions.some((o) => o.toLowerCase() === lowerQuery);

    const commit = (next: string) => {
        onChange(next.trim());
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    ref={triggerRef}
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        'w-full justify-between font-normal',
                        !value && 'text-muted-foreground',
                        error && 'border-red-500',
                        className,
                    )}
                >
                    <span className="truncate">{value || placeholder || ''}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                onWheel={(e) => e.stopPropagation()}
            >
                <Command shouldFilter={false}>
                    <CommandInput
                        value={query}
                        onValueChange={setQuery}
                        placeholder={searchPlaceholder || placeholder || ''}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && canCreate) {
                                e.preventDefault();
                                commit(trimmedQuery);
                            }
                        }}
                    />
                    <CommandList className="max-h-60 overflow-y-auto">
                        {filteredOptions.length === 0 && !canCreate && (
                            <CommandEmpty>{t('common.no_results_found')}</CommandEmpty>
                        )}

                        {filteredOptions.length > 0 && (
                            <CommandGroup>
                                {filteredOptions.map((option) => (
                                    <CommandItem
                                        key={option}
                                        value={option}
                                        onSelect={() => commit(option)}
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-4 w-4',
                                                value === option ? 'opacity-100' : 'opacity-0',
                                            )}
                                        />
                                        <span className="truncate">{option}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {canCreate && (
                            <CommandGroup>
                                <CommandItem
                                    value={`__create_${trimmedQuery}`}
                                    onSelect={() => commit(trimmedQuery)}
                                    className="text-main_color"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    <span className="truncate">
                                        {(createLabel ?? ((v) => `+ ${v}`))(trimmedQuery)}
                                    </span>
                                </CommandItem>
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

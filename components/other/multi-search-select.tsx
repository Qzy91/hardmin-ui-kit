import { Badge } from '@/components/ui/badge';
import { Command, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';
import * as React from 'react';

export interface MultiSelectProps<T> {
    value: T[];
    onChange: (value: T[]) => void;
    options: T[];
    onSearch?: (query: string) => void;
    getKey: (item: T) => string;
    getLabel: (item: T) => string;
    renderBadge?: (item: T, onRemove: () => void) => React.ReactNode;
    renderOption?: (item: T, isSelected: boolean) => React.ReactNode;
    onCreate?: (query: string) => T | null;
    validateCreate?: (query: string) => boolean;
    placeholder?: string;
    className?: string;
    isLoading?: boolean;
    disabled?: boolean;
    error?: string;
}

export function MultiSearchSelect<T>({
    value,
    onChange,
    options,
    onSearch,
    getKey,
    getLabel,
    renderBadge,
    renderOption,
    onCreate,
    validateCreate,
    placeholder,
    className,
    isLoading = false,
    disabled = false,
    error,
}: MultiSelectProps<T>) {
    const { t } = useLanguage();
    const inputRef = React.useRef<HTMLInputElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [inputValue, setInputValue] = React.useState('');
    const [isOpen, setIsOpen] = React.useState(false);

    const getSafeKey = React.useCallback(
        (item: T) => {
            const key = getKey(item);
            return typeof key === 'string' ? key.toLowerCase().trim() : key;
        },
        [getKey],
    );

    const handleSelect = React.useCallback(
        (item: T) => {
            const itemKey = getSafeKey(item);
            const isAlreadySelected = value.some((v) => getSafeKey(v) === itemKey);

            if (!isAlreadySelected) {
                onChange([...value, item]);
            }
            setInputValue('');

            setTimeout(() => inputRef.current?.focus(), 0);
        },
        [value, onChange, getSafeKey],
    );

    const handleRemove = React.useCallback(
        (itemToRemove: T) => {
            const keyToRemove = getSafeKey(itemToRemove);
            onChange(value.filter((item) => getSafeKey(item) !== keyToRemove));
        },
        [value, onChange, getSafeKey],
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
            handleRemove(value[value.length - 1]);
        }

        if (e.key === 'Enter') {
            e.preventDefault();

            if (isOpen && filteredOptions.length === 0 && showCreateOption) {
                handleCreate();
            } else if (isOpen && filteredOptions.length > 0) {
                handleSelect(filteredOptions[0]);
            }
        }
    };

    const handleCreate = () => {
        if (!onCreate) return;
        const newItem = onCreate(inputValue);
        if (newItem) {
            handleSelect(newItem);
        }
    };

    const filteredOptions = React.useMemo(() => {
        const selectedKeys = value.map((v) => getSafeKey(v));

        let filtered = options.filter((opt) => !selectedKeys.includes(getSafeKey(opt)));

        if (!onSearch && inputValue) {
            const query = inputValue.toLowerCase().trim();
            filtered = filtered.filter((opt) => getLabel(opt).toLowerCase().includes(query));
        }
        return filtered;
    }, [options, value, inputValue, onSearch, getSafeKey, getLabel]);

    const showCreateOption =
        onCreate &&
        inputValue.trim().length > 0 &&
        !filteredOptions.some(
            (opt) => getLabel(opt).toLowerCase().trim() === inputValue.trim().toLowerCase(),
        ) &&
        !value.some((v) => getLabel(v).toLowerCase().trim() === inputValue.trim().toLowerCase()) &&
        (!validateCreate || validateCreate(inputValue));

    const defaultRenderBadge = (item: T, onRemove: () => void) => (
        <Badge
            variant="secondary"
            className="gap-1 rounded-sm border-bg_border_element bg-bg_primary px-2 py-1.5"
        >
            {getLabel(item)}
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                className="ml-1 rounded-full p-0.5 outline-none hover:bg-main_color/20 hover:text-red-500 focus:bg-main_color/20"
            >
                <X className="h-3 w-3" />
            </button>
        </Badge>
    );

    const defaultRenderOption = (item: T) => <span>{getLabel(item)}</span>;

    const actualRenderBadge = renderBadge || defaultRenderBadge;
    const actualRenderOption = renderOption || defaultRenderOption;

    return (
        <div className="relative space-y-2">
            <div
                ref={containerRef}
                className={cn(
                    'group flex min-h-[42px] w-full flex-wrap items-center gap-1.5 rounded-md border bg-background bg-bg_primary px-3 py-2 text-sm transition-all',
                    'border-bg_border_element hover:border-main_color/50',
                    isOpen && 'border-main_color ring-1 ring-main_color',
                    error && 'border-destructive ring-destructive',
                    disabled && 'cursor-not-allowed opacity-50',
                    className,
                )}
                onClick={() => !disabled && inputRef.current?.focus()}
            >
                {value.map((item) => (
                    <React.Fragment key={getKey(item)}>
                        {actualRenderBadge(item, () => handleRemove(item))}
                    </React.Fragment>
                ))}

                <Input
                    ref={inputRef}
                    type="text"
                    disabled={disabled}
                    className="min-w-[120px] flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
                    placeholder={value.length === 0 ? placeholder : ''}
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        if (onSearch) onSearch(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => {
                        setIsOpen(true);
                        if (onSearch) onSearch(inputValue);
                    }}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            {isOpen && (filteredOptions.length > 0 || showCreateOption) && (
                <div className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-md border border-bg_border_element bg-bg_primary text-text_primary shadow-md animate-in fade-in-0 zoom-in-95">
                    <Command className="bg-transparent">
                        <CommandList className="max-h-[200px] overflow-y-auto p-1">
                            {filteredOptions.map((option) => (
                                <div
                                    key={getKey(option)}
                                    className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-main_color/10 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleSelect(option);
                                    }}
                                >
                                    {actualRenderOption(option, false)}
                                </div>
                            ))}

                            {filteredOptions.length > 0 && showCreateOption && (
                                <div className="my-1 h-px bg-muted" />
                            )}

                            {showCreateOption && (
                                <div
                                    className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleCreate();
                                    }}
                                >
                                    <Plus className="mr-2 h-3.5 w-3.5" />
                                    <span>
                                        {t('common.create')}:{' '}
                                        <span className="font-medium text-foreground">
                                            "{inputValue}"
                                        </span>
                                    </span>
                                </div>
                            )}

                            {filteredOptions.length === 0 && !showCreateOption && (
                                <div className="py-6 text-center text-xs text-muted-foreground">
                                    {t('common.noData')}
                                </div>
                            )}
                        </CommandList>
                    </Command>
                </div>
            )}
        </div>
    );
}

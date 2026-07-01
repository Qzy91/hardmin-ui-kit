import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchInputProps {
    initialValue: string;
    routeName: string;
    filters: Record<string, any>;
    placeholder?: string;
    className?: string;
    onClose?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
    initialValue,
    routeName,
    filters,
    placeholder,
    className,
    onClose,
}) => {
    const [query, setQuery] = useState(initialValue);

    const debouncedSearch = useDebouncedCallback((value: string) => {
        router.get(
            routeName,
            { ...filters, search: value || undefined, page: 1 },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    }, 300);

    useEffect(() => {
        setQuery(initialValue || '');
    }, [initialValue]);

    return (
        <div className={cn('relative w-full', className)}>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-text_primary" />
            </div>
            <Input
                type="search"
                placeholder={placeholder || 'Search'}
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    debouncedSearch(e.target.value);
                }}
                className={cn(
                    'block w-full rounded-md border-bg_border_element bg-bg_primary py-2 pl-10',
                    onClose ? 'pr-10' : 'pr-3',
                )}
            />
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-text_secondary hover:text-text_primary"
                    aria-label="Close search"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
};

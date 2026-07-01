import { cn } from '@/lib/utils';
import React from 'react';

export interface FilterPillItem<TValue extends string = string> {
    value: TValue;
    label: React.ReactNode;
    count?: number;
    disabled?: boolean;
}

interface FilterPillsProps<TValue extends string = string> {
    items: FilterPillItem<TValue>[];
    value: TValue;
    onValueChange: (value: TValue) => void;
    showCounts?: boolean;
    separateFirst?: boolean;
    className?: string;
}

export function FilterPills<TValue extends string = string>({
    items,
    value,
    onValueChange,
    showCounts = false,
    separateFirst = true,
    className,
}: FilterPillsProps<TValue>) {
    return (
        <div className={cn('flex flex-wrap items-center gap-2', className)}>
            {items.map((item, index) => {
                const isActive = value === item.value;

                return (
                    <React.Fragment key={item.value}>
                        {separateFirst && index === 1 && (
                            <div className="mx-1 h-6 w-px shrink-0 bg-bg_border_element" />
                        )}

                        <button
                            type="button"
                            disabled={item.disabled}
                            onClick={() => onValueChange(item.value)}
                            className={cn(
                                'inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors',
                                isActive
                                    ? 'border-main_color bg-main_color/15 text-text_primary'
                                    : 'border-bg_border_element bg-bg_primary text-text_secondary hover:border-main_color/40 hover:bg-bg_secondary hover:text-text_primary',
                                item.disabled && 'cursor-not-allowed opacity-50',
                            )}
                        >
                            <span>{item.label}</span>
                            {showCounts && typeof item.count === 'number' && (
                                <span
                                    className={cn(
                                        'rounded-full px-2 py-0.5 text-xs font-semibold',
                                        isActive
                                            ? 'bg-main_color/20 text-text_primary'
                                            : 'bg-bg_secondary text-text_secondary',
                                    )}
                                >
                                    {item.count}
                                </span>
                            )}
                        </button>
                    </React.Fragment>
                );
            })}
        </div>
    );
}

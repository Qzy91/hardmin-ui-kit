import { cn } from '@/lib/utils';

import { WhatsNewType } from '@/components/whats-new/api';

export const ALL_VALUE = '__all__';

export const TYPE_DOT_CLASSES: Record<WhatsNewType, string> = {
    [WhatsNewType.NEW_FEATURE]: 'bg-emerald-500',
    [WhatsNewType.IMPROVEMENT]: 'bg-amber-500',
    [WhatsNewType.BUG_FIX]: 'bg-rose-500',
};

export interface FilterItem {
    value: string;
    label: string;
    count?: number;
    dotClass?: string;
}

interface FilterGroupProps {
    label: string;
    items: FilterItem[];
    selected: string;
    onSelect: (value: string) => void;
}

export function FilterGroup({ label, items, selected, onSelect }: FilterGroupProps) {
    return (
        <div className="rounded-xl border border-bg_border_element bg-bg_primary p-2">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-text_secondary">
                {label}
            </div>
            <ul className="flex flex-col">
                {items.map((item) => {
                    const isActive = selected === item.value;
                    return (
                        <li key={item.value}>
                            <button
                                type="button"
                                onClick={() => onSelect(item.value)}
                                className={cn(
                                    'flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                                    isActive
                                        ? 'bg-main_color/10 font-medium text-text_primary'
                                        : 'text-text_secondary hover:bg-bg_secondary',
                                )}
                            >
                                <span className="flex items-center gap-2 truncate">
                                    {item.dotClass && (
                                        <span
                                            className={cn(
                                                'inline-block h-2 w-2 rounded-full',
                                                item.dotClass,
                                            )}
                                        />
                                    )}
                                    <span className="truncate">{item.label}</span>
                                </span>
                                {item.count !== undefined && (
                                    <span
                                        className={cn(
                                            'rounded-md px-1.5 py-0.5 text-[11px] font-semibold',
                                            isActive
                                                ? 'bg-main_color/20 text-main_color'
                                                : 'bg-bg_secondary text-text_secondary',
                                        )}
                                    >
                                        {item.count}
                                    </span>
                                )}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { WhatsNewItem, WhatsNewType } from '@/components/whats-new/api';
import { cn } from '@/lib/utils';
import { Calendar, ChevronDown, Edit2, Tag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface WhatsNewCardProps {
    item: WhatsNewItem;
    defaultOpen: boolean;
    onEdit?: (item: WhatsNewItem) => void;
    onDelete?: (id: string) => void;
    isSuperAdmin?: boolean;
}

const TYPE_ACCENT_CLASSES: Record<WhatsNewType, string> = {
    [WhatsNewType.NEW_FEATURE]: 'before:bg-emerald-500',
    [WhatsNewType.IMPROVEMENT]: 'before:bg-amber-500',
    [WhatsNewType.BUG_FIX]: 'before:bg-rose-500',
};

const TYPE_BADGE_CLASSES: Record<WhatsNewType, string> = {
    [WhatsNewType.NEW_FEATURE]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    [WhatsNewType.IMPROVEMENT]: 'bg-amber-50 text-amber-700 border-amber-200',
    [WhatsNewType.BUG_FIX]: 'bg-rose-50 text-rose-700 border-rose-200',
};

const TYPE_BULLET_CLASSES: Record<WhatsNewType, string> = {
    [WhatsNewType.NEW_FEATURE]: 'bg-emerald-500',
    [WhatsNewType.IMPROVEMENT]: 'bg-amber-500',
    [WhatsNewType.BUG_FIX]: 'bg-rose-500',
};

export const WhatsNewCard = ({
    item,
    defaultOpen,
    onEdit,
    onDelete,
    isSuperAdmin,
}: WhatsNewCardProps) => {
    const [isExpanded, setIsExpanded] = useState(defaultOpen);
    const { t } = useTranslation();

    const accentClass = TYPE_ACCENT_CLASSES[item.type] ?? 'before:bg-gray-300';
    const badgeClass = TYPE_BADGE_CLASSES[item.type] ?? 'bg-gray-50 text-gray-700 border-gray-200';
    const bulletClass = TYPE_BULLET_CLASSES[item.type] ?? 'bg-gray-400';

    const hasDetails = item.details && item.details.length > 0;

    return (
        <div
            className={cn(
                'group relative flex flex-col overflow-hidden rounded-xl border border-bg_border_element bg-bg_primary transition-all duration-200 hover:shadow-md',
                'before:absolute before:bottom-0 before:left-0 before:top-0 before:w-1',
                accentClass,
            )}
        >
            {item.banner_image_url && (
                <div className="relative flex h-[220px] w-full items-center justify-center overflow-hidden bg-bg_secondary sm:h-[260px]">
                    {item.banner_media_type === 'video' ? (
                        <video
                            src={item.banner_image_url}
                            className="relative z-10 h-full w-auto max-w-full bg-black object-contain"
                            controls
                            playsInline
                            preload="metadata"
                            onError={(e) => {
                                (
                                    e.currentTarget.parentElement as HTMLElement | null
                                )?.classList.add('hidden');
                            }}
                        />
                    ) : (
                        <>
                            <img
                                src={item.banner_image_url}
                                alt=""
                                aria-hidden="true"
                                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl"
                            />

                            <img
                                src={item.banner_image_url}
                                alt={item.title}
                                className="relative z-10 h-full w-auto max-w-full object-contain"
                                loading="lazy"
                                onError={(e) => {
                                    (
                                        e.currentTarget.parentElement as HTMLElement | null
                                    )?.classList.add('hidden');
                                }}
                            />
                        </>
                    )}
                </div>
            )}

            <div className="pl-5">
                <div className="flex flex-col gap-4 p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-1 flex-col gap-2">
                            <h3 className="text-lg font-bold tracking-tight text-text_primary">
                                {item.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        'rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                                        badgeClass,
                                    )}
                                >
                                    {t(`whats_new.types.${item.type}`)}
                                </Badge>
                                <div className="flex items-center gap-1.5 rounded-md bg-bg_secondary px-2 py-1 text-[11px] font-bold text-text_secondary">
                                    <Tag className="h-3 w-3" />
                                    <span>{item.version}</span>
                                </div>
                                <div className="flex items-center gap-1.5 rounded-md bg-bg_secondary px-2 py-1 text-[11px] font-bold text-text_secondary">
                                    <Calendar className="h-3 w-3" />
                                    <span>{item.released_at}</span>
                                </div>
                            </div>
                            {item.description && (
                                <p className="mt-1 text-sm leading-relaxed text-text_secondary">
                                    {item.description}
                                </p>
                            )}
                        </div>

                        {isSuperAdmin && (
                            <div className="flex shrink-0 items-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                <TooltipProvider delayDuration={200}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-md bg-bg_secondary text-text_secondary hover:bg-bg_secondary/80 hover:text-main_color"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit?.(item);
                                                }}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{t('common.edit')}</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-md bg-red-50 text-red-600 hover:bg-red-500 hover:text-white dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete?.(item.id);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{t('common.delete')}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        )}
                    </div>

                    {hasDetails && (
                        <button
                            type="button"
                            onClick={() => setIsExpanded((prev) => !prev)}
                            className="flex items-center justify-center gap-1 border-t border-bg_border_element pt-3 text-[11px] font-bold uppercase tracking-widest text-text_secondary/70 transition-colors hover:text-main_color"
                        >
                            {isExpanded ? t('whats_new.show_less') : t('whats_new.show_more')}
                            <ChevronDown
                                className={cn(
                                    'h-4 w-4 transition-transform duration-300',
                                    isExpanded ? 'rotate-180' : 'rotate-0',
                                )}
                            />
                        </button>
                    )}
                </div>

                {hasDetails && (
                    <div
                        className={cn(
                            'grid transition-[grid-template-rows] duration-300 ease-in-out',
                            isExpanded
                                ? 'grid-rows-[1fr] opacity-100'
                                : 'grid-rows-[0fr] opacity-0',
                        )}
                    >
                        <div className="overflow-hidden">
                            <div className="border-t border-bg_border_element bg-bg_secondary/40 p-6 pt-4">
                                <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-text_secondary/70">
                                    {t('whats_new.details')}
                                </h4>
                                <ul className="grid grid-cols-1 gap-4">
                                    {item.details.map((detail, idx) => (
                                        <li
                                            key={idx}
                                            className="flex flex-col gap-2 text-sm text-text_primary"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={cn(
                                                        'mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full',
                                                        bulletClass,
                                                    )}
                                                />
                                                <span className="leading-relaxed">
                                                    {detail.text}
                                                </span>
                                            </div>
                                            {detail.image_url && (
                                                <div className="relative ml-5 flex h-[200px] w-full items-center justify-center overflow-hidden rounded-lg border border-bg_border_element bg-bg_secondary sm:h-[240px]">
                                                    {detail.media_type === 'video' ? (
                                                        <video
                                                            src={detail.image_url}
                                                            className="relative z-10 h-full w-auto max-w-full bg-black object-contain"
                                                            controls
                                                            playsInline
                                                            preload="metadata"
                                                            onError={(e) => {
                                                                (
                                                                    e.currentTarget
                                                                        .parentElement as HTMLElement | null
                                                                )?.classList.add('hidden');
                                                            }}
                                                        />
                                                    ) : (
                                                        <>
                                                            <img
                                                                src={detail.image_url}
                                                                alt=""
                                                                aria-hidden="true"
                                                                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl"
                                                            />

                                                            <img
                                                                src={detail.image_url}
                                                                alt=""
                                                                className="relative z-10 h-full w-auto max-w-full object-contain"
                                                                loading="lazy"
                                                                onError={(e) => {
                                                                    (
                                                                        e.currentTarget
                                                                            .parentElement as HTMLElement | null
                                                                    )?.classList.add('hidden');
                                                                }}
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

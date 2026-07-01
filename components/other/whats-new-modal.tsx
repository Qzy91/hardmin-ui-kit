import { useMemo, useState } from 'react';

import { router } from '@inertiajs/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WhatsNewItem, WhatsNewType, whatsNewApi } from '@/components/whats-new/api';
import { ALL_VALUE, FilterGroup, TYPE_DOT_CLASSES } from '@/components/whats-new/filter-group';
import { WhatsNewCard } from '@/components/whats-new/whats-new-card';
import { useLanguage } from '@/contexts/language-context';

interface WhatsNewModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: WhatsNewItem[];
}

export function WhatsNewModal({ isOpen, onClose, items }: WhatsNewModalProps) {
    const { t } = useLanguage();
    const [localItems] = useState(items);
    const [isChecked, setIsChecked] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [selectedType, setSelectedType] = useState<string>(ALL_VALUE);
    const [selectedVersion, setSelectedVersion] = useState<string>(ALL_VALUE);

    const typeCounts = useMemo(() => {
        const counts: Record<string, number> = {
            [WhatsNewType.NEW_FEATURE]: 0,
            [WhatsNewType.IMPROVEMENT]: 0,
            [WhatsNewType.BUG_FIX]: 0,
        };
        for (const item of localItems) {
            if (counts[item.type] !== undefined) counts[item.type]++;
        }
        return counts;
    }, [localItems]);

    const versionCounts = useMemo(() => {
        const map = new Map<string, number>();
        for (const item of localItems) {
            map.set(item.version, (map.get(item.version) ?? 0) + 1);
        }
        return Array.from(map.entries()).sort(([a], [b]) => {
            const pa = a
                .replace(/^v/i, '')
                .split('.')
                .map((n) => parseInt(n, 10) || 0);
            const pb = b
                .replace(/^v/i, '')
                .split('.')
                .map((n) => parseInt(n, 10) || 0);
            for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
                const diff = (pb[i] ?? 0) - (pa[i] ?? 0);
                if (diff !== 0) return diff;
            }
            return 0;
        });
    }, [localItems]);

    const filteredItems = useMemo(() => {
        return localItems.filter((item) => {
            if (selectedType !== ALL_VALUE && item.type !== selectedType) return false;
            if (selectedVersion !== ALL_VALUE && item.version !== selectedVersion) return false;
            return true;
        });
    }, [localItems, selectedType, selectedVersion]);

    const handleClose = () => {
        onClose();
        if (!isChecked) {
            whatsNewApi
                .markSeenInSession()
                .then(() => router.reload({ only: ['auth'] }))
                .catch(() => {});
        }
    };

    const handleCheckboxChange = async (checked: boolean) => {
        if (isPending) return;
        setIsPending(true);
        try {
            if (checked) {
                await whatsNewApi.markAllAsRead();
            } else {
                await whatsNewApi.restoreSeen();
            }
            setIsChecked(checked);
            router.reload({ only: ['auth'] });
        } catch (e) {
            toast.error(t('common.error'));
        } finally {
            setIsPending(false);
        }
    };

    const handleGoToAll = () => {
        onClose();
        if (!isChecked) {
            whatsNewApi.markSeenInSession().catch(() => {});
        }
        router.visit('/whats-new/page');
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
            <DialogContent className="flex h-[80vh] max-w-[1340px] flex-col gap-0 overflow-hidden p-0">
                <DialogHeader className="shrink-0 border-b border-bg_border_element px-8 py-5">
                    <DialogTitle className="flex items-center gap-3 text-xl font-bold">
                        {t('whats_new.title')}
                        {localItems.length > 0 && (
                            <span className="rounded-full bg-main_color/10 px-2.5 py-0.5 text-sm font-semibold text-main_color">
                                {localItems.length}
                            </span>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden">
                    <aside className="w-48 shrink-0 space-y-3 overflow-y-auto border-r border-bg_border_element p-3">
                        <FilterGroup
                            label={t('whats_new.page.filter_type')}
                            items={[
                                {
                                    value: ALL_VALUE,
                                    label: t('whats_new.page.filter_all'),
                                    count: localItems.length,
                                },
                                {
                                    value: WhatsNewType.NEW_FEATURE,
                                    label: t('whats_new.types.NEW_FEATURE'),
                                    count: typeCounts[WhatsNewType.NEW_FEATURE],
                                    dotClass: TYPE_DOT_CLASSES[WhatsNewType.NEW_FEATURE],
                                },
                                {
                                    value: WhatsNewType.IMPROVEMENT,
                                    label: t('whats_new.types.IMPROVEMENT'),
                                    count: typeCounts[WhatsNewType.IMPROVEMENT],
                                    dotClass: TYPE_DOT_CLASSES[WhatsNewType.IMPROVEMENT],
                                },
                                {
                                    value: WhatsNewType.BUG_FIX,
                                    label: t('whats_new.types.BUG_FIX'),
                                    count: typeCounts[WhatsNewType.BUG_FIX],
                                    dotClass: TYPE_DOT_CLASSES[WhatsNewType.BUG_FIX],
                                },
                            ]}
                            selected={selectedType}
                            onSelect={setSelectedType}
                        />

                        <FilterGroup
                            label={t('whats_new.page.filter_version')}
                            items={[
                                {
                                    value: ALL_VALUE,
                                    label: t('whats_new.page.filter_all_versions'),
                                },
                                ...versionCounts.map(([version, count]) => ({
                                    value: version,
                                    label: version,
                                    count,
                                })),
                            ]}
                            selected={selectedVersion}
                            onSelect={setSelectedVersion}
                        />
                    </aside>

                    <ScrollArea className="flex-1 px-6 py-5">
                        <div className="flex flex-col gap-5">
                            {filteredItems.map((item, index) => (
                                <WhatsNewCard
                                    key={item.id}
                                    item={item}
                                    defaultOpen={index === 0}
                                    isSuperAdmin={false}
                                />
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                <div className="shrink-0 flex items-center justify-between border-t border-bg_border_element px-8 py-4">
                    <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-text_secondary">
                        <Checkbox
                            checked={isChecked}
                            disabled={isPending}
                            onCheckedChange={(checked) => void handleCheckboxChange(checked === true)}
                        />
                        <span>{t('whats_new.dont_show_again')}</span>
                    </label>
                    <Button variant="main" size="sm" onClick={handleGoToAll}>
                        {t('whats_new.all_news')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

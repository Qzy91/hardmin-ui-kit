import { Link, router, usePage } from '@inertiajs/react';
import { ChevronLeft, FlaskConical, MessageSquarePlus, RotateCw, Star } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { AclDialog } from '@/components/acl/acl-dialog';
import { FeedbackFormDialog } from '@/components/feedback/feedback-form-dialog';
import { RatingDialog } from '@/components/feedback/rating-dialog';
import { badgeVariants } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { SupportTrigger } from '@/components/widgets/guide/support-trigger';
import { useLanguage } from '@/contexts/language-context';
import { useModules } from '@/hooks/use-modules';
import { FeedbackModule } from '@/lib/feedback-config';
import { HelpContextKey } from '@/lib/help-config';
import { TourContextKey } from '@/lib/onboarding-config';
import { cn } from '@/lib/utils';
import { SharedPageProps } from '@/types';
import { Module } from '@/types/acl';

interface BreadcrumbItemData {
    label: React.ReactNode;
    href?: string;
    onClick?: () => void;
}

interface PageHeaderProps {
    breadcrumbs?: BreadcrumbItemData[];
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    actions?: React.ReactNode;
    onBackClick?: () => void;
    onRefresh?: () => void;
    className?: string;
    tourContextKey?: TourContextKey;
    helpKey?: HelpContextKey;
    feedbackModule?: FeedbackModule;
    module: Module;
    /** Format: "module#anchor", e.g. "ems#page-analyzing-points". Only shown to Super Admins. */
    wikiAnchor?: string;
}

export const PageHeader = ({
    breadcrumbs = [],
    title,
    subtitle,
    actions,
    onBackClick,
    onRefresh,
    className = '',
    tourContextKey,
    helpKey,
    feedbackModule,
    module,
    wikiAnchor,
}: PageHeaderProps) => {
    const { t, language } = useLanguage();
    const { url, props } = usePage<SharedPageProps>();
    const { hasBetaAccess } = useModules();

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [timeAgo, setTimeAgo] = useState<string>('');
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isBetaInfoOpen, setIsBetaInfoOpen] = useState(false);
    const [isBetaFeedbackOpen, setIsBetaFeedbackOpen] = useState(false);
    const [isBetaRatingOpen, setIsBetaRatingOpen] = useState(false);

    const processedBreadcrumbs = useMemo(() => {
        const p = props as SharedPageProps & {
            organization?: { id?: string | number | null };
        };
        const orgId = p.selectedClientId || p.organization?.id || p.activeOrganizationId;

        if (!orgId) return breadcrumbs;

        return breadcrumbs.map((item) => {
            if (item.href === '/dashboard' || item.href === '/dashboard/') {
                return {
                    ...item,
                    href: `/dashboard?organization_id=${orgId}`,
                };
            }
            return item;
        });
    }, [breadcrumbs, props]);

    const formatRelativeTime = (date: Date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        const currentLang = language || 'cs';

        if (diffInSeconds < 10) return t('common.just_now');

        const agoText = t('common.ago');
        let timeValue = '';

        if (diffInSeconds < 60) {
            timeValue = `${Math.floor(diffInSeconds / 10) * 10} s`;
        } else if (diffInSeconds < 3600) {
            timeValue = `${Math.floor(diffInSeconds / 60)} min`;
        } else if (diffInSeconds < 86400) {
            timeValue = `${Math.floor(diffInSeconds / 3600)} h`;
        } else {
            return date.toLocaleDateString();
        }

        if (currentLang === 'pl' || currentLang === 'en') {
            return `${timeValue} ${agoText}`;
        }
        return `${agoText} ${timeValue}`;
    };

    useEffect(() => {
        setLastUpdated(new Date());
    }, [url]);

    useEffect(() => {
        setTimeAgo(formatRelativeTime(lastUpdated));

        const interval = setInterval(() => {
            setTimeAgo(formatRelativeTime(lastUpdated));
        }, 10000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastUpdated, language]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        if (onRefresh) {
            onRefresh();
            setLastUpdated(new Date());
            setIsRefreshing(false);
        } else {
            router.reload({
                only: [],
                onFinish: () => {
                    setIsRefreshing(false);
                    setLastUpdated(new Date());
                },
            });
        }
    };

    const handleBackClick = () => {
        if (onBackClick) {
            onBackClick();
        } else {
            window.history.back();
        }
    };

    const visibleBreadcrumbs = useMemo(() => {
        return processedBreadcrumbs.filter((item) => String(item.label) !== String(title));
    }, [processedBreadcrumbs, title]);

    const moduleHasBetaAccess = module !== 'core' && hasBetaAccess(module);
    const betaFeedbackKey = feedbackModule || helpKey;

    return (
        <div
            className={cn(
                'mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between',
                className,
            )}
        >
            <div className="flex items-center gap-2 sm:gap-3">
                <button
                    onClick={handleBackClick}
                    className="group -ml-2 rounded-full p-1.5 transition-colors hover:bg-bg_secondary"
                >
                    <ChevronLeft className="h-6 w-6 text-text_secondary transition-colors group-hover:text-text_primary" />
                </button>

                <div className="flex flex-wrap items-center gap-2 text-xl sm:text-2xl">
                    {visibleBreadcrumbs.map((item, index) => (
                        <React.Fragment key={index}>
                            {item.onClick ? (
                                <button
                                    type="button"
                                    onClick={item.onClick}
                                    className="cursor-pointer font-medium text-text_secondary transition-colors hover:text-text_primary hover:underline"
                                >
                                    {item.label}
                                </button>
                            ) : item.href ? (
                                <Link
                                    href={item.href}
                                    className="font-medium text-text_secondary transition-colors hover:text-text_primary hover:underline"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="font-medium text-text_secondary">
                                    {item.label}
                                </span>
                            )}
                            <span className="select-none text-text_secondary/50">-</span>
                        </React.Fragment>
                    ))}
                    <div className="flex flex-col">
                        <div className="flex flex-col gap-y-1 sm:flex-row sm:items-center sm:gap-x-2">
                            <div className="flex items-center gap-2">
                                <h1 className="mr-2 font-bold text-text_primary">{title}</h1>
                                {moduleHasBetaAccess && (
                                    <button
                                        type="button"
                                        onClick={() => setIsBetaInfoOpen(true)}
                                        className={cn(
                                            badgeVariants({ variant: 'warning' }),
                                            'cursor-pointer hover:bg-amber-500/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                        )}
                                    >
                                        {t('users.betaAccess.beta')}
                                    </button>
                                )}
                                <div className="mr-2 flex items-center justify-center gap-1">
                                    <SupportTrigger
                                        open={isHelpOpen}
                                        onOpenChange={setIsHelpOpen}
                                        tourContextKey={tourContextKey}
                                        helpKey={helpKey}
                                        feedbackModule={feedbackModule}
                                        wikiAnchor={wikiAnchor}
                                    />
                                    <AclDialog module={module} />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className="flex items-center gap-2 px-2 text-text_secondary hover:text-text_primary"
                                    title={t('common.refresh')}
                                >
                                    <RotateCw
                                        className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
                                    />
                                    <span className="text-sm">{t('common.refresh')}</span>
                                </Button>

                                <span className="text-sm font-medium tabular-nums tracking-tight text-text_secondary/60">
                                    {isRefreshing ? (
                                        <span className="animate-pulse">
                                            {t('common.refreshing')}
                                        </span>
                                    ) : (
                                        <span className="whitespace-nowrap">
                                            {t('common.last_updated')}: {timeAgo}
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                        {subtitle && <p className="text-base text-text_secondary">{subtitle}</p>}
                    </div>
                </div>
            </div>

            {actions && <div className="w-full flex-shrink-0 sm:w-auto">{actions}</div>}

            <Dialog open={isBetaInfoOpen} onOpenChange={setIsBetaInfoOpen}>
                <DialogContent className="max-w-lg gap-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 pb-2">
                            <FlaskConical className="h-5 w-5 text-main_color" />
                            {t('users.betaAccess.infoTitle')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('users.betaAccess.infoDescription')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={!betaFeedbackKey}
                            className="h-auto w-full justify-start gap-4 border px-6 py-4 transition-all duration-200 hover:border-main_color hover:bg-main_color/5"
                            onClick={() => {
                                setIsBetaInfoOpen(false);
                                setIsBetaFeedbackOpen(true);
                            }}
                        >
                            <MessageSquarePlus className="!h-6 !w-6 text-main_color" />
                            <div className="text-left">
                                <div className="font-semibold text-text_primary">
                                    {t(
                                        'onboarding.dialog.feedback_title',
                                        'Přidat nápad/zpětnou vazbu',
                                    )}
                                </div>
                                <div className="text-xs text-main_color">
                                    {t(
                                        'onboarding.dialog.feedback_subtitle',
                                        'Nahlaste problém nebo navrhněte zlepšení',
                                    )}
                                </div>
                            </div>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            disabled={!betaFeedbackKey}
                            className="h-auto w-full justify-start gap-4 border px-6 py-4 transition-all duration-200 hover:border-main_color hover:bg-main_color/5"
                            onClick={() => {
                                setIsBetaInfoOpen(false);
                                setIsBetaRatingOpen(true);
                            }}
                        >
                            <Star className="!h-6 !w-6 text-main_color" />
                            <div className="text-left">
                                <div className="font-semibold text-text_primary">
                                    {t('onboarding.dialog.rating_title', 'Ohodnotit tuto sekci')}
                                </div>
                                <div className="text-xs text-main_color">
                                    {t(
                                        'onboarding.dialog.rating_subtitle',
                                        'Řekněte nám, jak se vám tato část líbí',
                                    )}
                                </div>
                            </div>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <FeedbackFormDialog
                isOpen={isBetaFeedbackOpen}
                onClose={() => setIsBetaFeedbackOpen(false)}
                module={betaFeedbackKey}
            />

            <RatingDialog
                isOpen={isBetaRatingOpen}
                onClose={() => setIsBetaRatingOpen(false)}
                module={betaFeedbackKey}
            />
        </div>
    );
};

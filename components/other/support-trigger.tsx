import { FeedbackFormDialog } from '@/components/feedback/feedback-form-dialog';
import { RatingDialog } from '@/components/feedback/rating-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTrigger,
    modalHeaderIconButtonClassName,
} from '@/components/ui/dialog';
import { HelpContentRenderer } from '@/components/widgets/guide/help-content-renderer';
import { useGuide } from '@/contexts/guide-context';
import { useLanguage } from '@/contexts/language-context';
import { FeedbackModule } from '@/lib/feedback-config';
import { HelpContextKey } from '@/lib/help-config';
import { TourContextKey } from '@/lib/onboarding-config';
import { cn } from '@/lib/utils';
import { documentationApi } from '@/sections/documentation/api';
import { ArticleView } from '@/sections/documentation/components/article-view';
import { InlineArticleEditor } from '@/sections/documentation/components/inline-article-editor';
import { TreeSidebar } from '@/sections/documentation/components/tree-sidebar';
import { articleTitle } from '@/sections/documentation/helpers';
import { DocumentationArticle, DocumentationSection } from '@/sections/documentation/types';
import { RoleList } from '@/sections/users/types';
import { SharedPageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    ChevronRight,
    FileText,
    Info,
    Loader2,
    MessageSquarePlus,
    Navigation,
    Pencil,
    PlayCircle,
    Star,
    Volume2,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tourContextKey?: TourContextKey;
    helpKey?: HelpContextKey;
    feedbackModule?: FeedbackModule;
    /** Format: "module#anchor", e.g. "ems#page-analyzing-points". Only shown to Super Admins. */
    wikiAnchor?: string;
}

export function SupportTrigger({
    open,
    onOpenChange,
    tourContextKey,
    helpKey,
    feedbackModule,
    wikiAnchor,
}: Props) {
    const { t, language } = useLanguage();
    const uiLocale = language ?? 'cs';
    const { startTour } = useGuide();
    const { props } = usePage<SharedPageProps>();
    const isSuperAdmin = props.auth.user.global_role === RoleList.SUPER_ADMIN;
    const activeHelpKey = helpKey || tourContextKey;
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [isRatingOpen, setIsRatingOpen] = useState(false);
    const feedbackKey = feedbackModule || helpKey;
    const wikiHref = wikiAnchor ? `/wiki/${wikiAnchor}` : undefined;

    // Documentation article state (loaded lazily when modal opens).
    const [docArticles, setDocArticles] = useState<DocumentationArticle[]>([]);
    const [canManage, setCanManage] = useState(false);
    const [isLoadingDoc, setIsLoadingDoc] = useState(false);
    const [docFetched, setDocFetched] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeArticleId, setActiveArticleId] = useState<string | null>(null);

    // Lazy fetch documentation articles for the help key when the dialog opens.
    useEffect(() => {
        if (!open || !helpKey || docFetched) return;
        let cancelled = false;
        setIsLoadingDoc(true);
        documentationApi
            .fetchByHelpKey(helpKey)
            .then((res) => {
                if (cancelled) return;
                const articles = res.articles ?? (res.article ? [res.article] : []);
                setDocArticles(articles);
                setCanManage(res.canManage);
                setDocFetched(true);
                setActiveArticleId(articles[0]?.id ?? null);
            })
            .catch((e) => {
                console.error('Failed to fetch documentation by help key:', e);
            })
            .finally(() => {
                if (!cancelled) setIsLoadingDoc(false);
            });
        return () => {
            cancelled = true;
        };
    }, [open, helpKey, docFetched]);

    const docArticle = docArticles[0] ?? null;

    // Reset edit state when the dialog closes.
    useEffect(() => {
        if (!open) {
            setIsEditing(false);
        }
    }, [open]);

    const handleStartTour = () => {
        if (!tourContextKey) return;
        onOpenChange(false);
        setTimeout(() => {
            startTour(tourContextKey);
        }, 100);
    };

    const handleOpenFeedback = () => {
        setIsFeedbackOpen(true);
    };

    const handleOpenRating = () => {
        setIsRatingOpen(true);
    };

    const tree: DocumentationSection[] = useMemo(() => {
        if (docArticles.length === 0) return [];
        const groups: DocumentationSection[] = [];
        const indexBySection = new Map<string, number>();
        for (const article of docArticles) {
            const key = article.menu_section_id ?? '__none__';
            const existing = indexBySection.get(key);
            if (existing === undefined) {
                indexBySection.set(key, groups.length);
                groups.push({
                    section: article.section ?? null,
                    articles: [article],
                });
            } else {
                groups[existing].articles.push(article);
            }
        }
        return groups;
    }, [docArticles]);

    const displayedArticle = docArticle;
    const articleScrollRef = useRef<HTMLDivElement | null>(null);
    const breadcrumbsTrail = useMemo(() => [] as DocumentationArticle[], []);

    useEffect(() => {
        if (docArticles.length === 0 || !activeArticleId) return;

        const handle = window.requestAnimationFrame(() => {
            const container = articleScrollRef.current;
            if (!container) return;

            const selector = `#article-${CSS.escape(activeArticleId)}`;
            const target = container.querySelector<HTMLElement>(selector);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }
            if (activeArticleId === docArticles[0]?.id) {
                container.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        return () => window.cancelAnimationFrame(handle);
    }, [activeArticleId, docArticles]);

    const supportOptions = [
        {
            key: 'guide',
            icon: Navigation,
            title: t('onboarding.dialog.guide_btn_title'),
            subtitle: t('onboarding.dialog.guide_btn_subtitle'),
            onClick: handleStartTour,
            disabled: !tourContextKey,
            activeColor: true,
            isComingSoon: false,
        },
        {
            key: 'read_aloud',
            icon: Volume2,
            title: t('onboarding.dialog.read_aloud', 'Přečíst nahlas'),
            subtitle: t('common.comming_soon'),
            onClick: undefined,
            disabled: true,
            activeColor: false,
            isComingSoon: true,
        },
        {
            key: 'video',
            icon: PlayCircle,
            title: t('onboarding.dialog.video_btn_title'),
            subtitle: t('common.comming_soon'),
            onClick: undefined,
            disabled: true,
            activeColor: false,
            isComingSoon: true,
        },
        {
            key: 'docs',
            icon: FileText,
            title: t('onboarding.dialog.docs_title', 'Celková dokumentace'),
            subtitle: docArticle
                ? t('onboarding.dialog.docs_subtitle_open', 'Otevřít v plné dokumentaci')
                : t('onboarding.dialog.docs_subtitle_full', 'Přejít na seznam článků'),
            href: docArticle ? `/documentation?article=${docArticle.id}` : '/documentation',
            disabled: false,
            activeColor: true,
            isComingSoon: false,
        },
        ...(isSuperAdmin && wikiHref
            ? [
                  {
                      key: 'wiki',
                      icon: BookOpen,
                      title: t('onboarding.dialog.wiki_title', 'AI Wiki'),
                      subtitle: t(
                          'onboarding.dialog.wiki_subtitle',
                          'Otevřít wiki sekci pro tuto stránku',
                      ),
                      onClick: () => {
                          window.open(wikiHref, '_blank');
                          onOpenChange(false);
                      },
                      disabled: false,
                      activeColor: true,
                      isComingSoon: false,
                  },
              ]
            : []),
        {
            key: 'feedback',
            icon: MessageSquarePlus,
            title: t('onboarding.dialog.feedback_title', 'Přidat nápad/zpětnou vazbu'),
            subtitle: t(
                'onboarding.dialog.feedback_subtitle',
                'Nahlaste problém nebo navrhněte zlepšení',
            ),
            onClick: handleOpenFeedback,
            disabled: !feedbackKey,
            activeColor: true,
            isComingSoon: false,
        },
        {
            key: 'rating',
            icon: Star,
            title: t('onboarding.dialog.rating_title', 'Ohodnotit modul'),
            subtitle: t(
                'onboarding.dialog.rating_subtitle',
                'Řekněte nám, jak se vám tato část líbí',
            ),
            onClick: handleOpenRating,
            disabled: !feedbackKey,
            activeColor: true,
            isComingSoon: false,
        },
    ];

    const hasTree =
        docArticles.length > 1 || (docArticle !== null && (docArticle.children?.length ?? 0) > 0);

    // Whether the module is bound to a help context that has no documentation article yet.
    // Only relevant once the fetch has completed; while it's still loading we render the
    // spinner instead and never flash an empty / fallback state.
    const moduleHasNoArticle = docArticles.length === 0 && !!helpKey && docFetched;

    // The "create article" / "missing documentation" notice is *only* meaningful for
    // platform admins — regular users can't act on it, so showing the banner to them
    // adds noise. Hiding it for non-admins also resolves the visual inconsistency where
    // some modules showed the banner and others didn't depending on whether they had
    // a helpKey vs a tourContextKey only.
    const showAdminMissingDocNotice = moduleHasNoArticle && canManage;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogTrigger asChild>
                    <button
                        className="rounded-full p-2 text-text_secondary transition-colors hover:bg-bg_border_element"
                        title={t('onboarding.dialog.guide')}
                    >
                        <Info className="h-5 w-5" />
                    </button>
                </DialogTrigger>

                <DialogContent
                    showCloseButton={false}
                    className={cn(
                        'flex max-h-[88vh] w-full flex-col gap-0 overflow-hidden bg-bg_primary p-0 transition-all duration-200',
                        'sm:max-w-6xl',
                        hasTree && !isEditing
                            ? 'lg:max-w-[1280px]'
                            : !isEditing
                              ? 'lg:max-w-[1120px]'
                              : '',
                    )}
                >
                    {/* === FULL-WIDTH DIALOG TITLE ===
                        Single source of truth for the dialog title. Spans the entire
                        dialog width above the column grid below. */}
                    <div className="relative flex shrink-0 items-center gap-2 border-b border-bg_border_element bg-bg_primary px-5 py-3 md:px-6">
                        <BookOpen className="h-5 w-5 shrink-0 text-main_color" />
                        <h2 className="truncate text-base font-semibold text-text_primary">
                            {t('common.info_module', 'Informační modul')}
                        </h2>

                        {/* Custom close button: anchored to the title bar but pulled
                            up by ~1em relative to the default Radix close (which sits
                            at top-4 / sm:top-6 of the dialog). Keeps the cross tight
                            with the top edge of the dialog without overlapping the
                            "Informační modul" title visually. */}
                        <DialogClose
                            className={cn(
                                modalHeaderIconButtonClassName,
                                'absolute right-3 top-1 h-8 w-8 ring-offset-bg_primary sm:right-4 sm:top-2',
                            )}
                        >
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close</span>
                        </DialogClose>
                    </div>

                    {isEditing && docArticle && (
                        <InlineArticleEditor
                            article={docArticle}
                            className="min-h-0 flex-1"
                            onSaved={(next) => {
                                setDocArticles((prev) =>
                                    prev.map((a) => (a.id === next.id ? { ...a, ...next } : a)),
                                );
                                setIsEditing(false);
                            }}
                            onCancel={() => setIsEditing(false)}
                        />
                    )}

                    {/* === READ MODE: tree (optional) + article content + actions ===
                        Each column owns a sub-header that sits on the same horizontal
                        band right under the full-width dialog title. The three labels
                        share the same typography so they read as one continuous
                        sub-header strip across the columns. */}
                    {!isEditing && (
                        <div
                            className={cn(
                                'grid min-h-0 flex-1 grid-cols-1',
                                hasTree
                                    ? 'md:grid-cols-[220px_1fr_320px]'
                                    : 'md:grid-cols-[1fr_320px]',
                            )}
                        >
                            {hasTree && (
                                <aside className="flex min-h-0 min-w-0 flex-col overflow-hidden border-r border-bg_border_element bg-bg_secondary/30">
                                    <div className="flex h-12 shrink-0 items-center border-b border-bg_border_element px-4">
                                        <h3 className="truncate text-xs font-semibold text-text_secondary">
                                            {t('documentation.modal.tree_title', 'Obsah článku')}
                                        </h3>
                                    </div>
                                    <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3">
                                        <TreeSidebar
                                            tree={tree}
                                            currentArticleId={activeArticleId}
                                            linkMode={false}
                                            onSelect={(a) => setActiveArticleId(a.id)}
                                            searchPlaceholder={t(
                                                'documentation.modal.tree_search',
                                                'Hledat sekci…',
                                            )}
                                        />
                                    </div>
                                </aside>
                            )}

                            <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
                                {/* Middle column sub-header: breadcrumbs once the user
                                    has navigated into a sub-article, otherwise an empty
                                    placeholder of identical height so the three column
                                    sub-headers stay vertically aligned. */}
                                <div className="flex h-12 shrink-0 items-center border-b border-bg_border_element bg-bg_primary px-5 md:px-6">
                                    {breadcrumbsTrail.length > 0 && displayedArticle ? (
                                        <nav
                                            aria-label="breadcrumbs"
                                            className="flex min-w-0 flex-1 flex-wrap items-center gap-1 text-xs font-semibold text-text_secondary"
                                        >
                                            {breadcrumbsTrail.map((node) => (
                                                <span
                                                    key={node.id}
                                                    className="flex items-center gap-1"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveArticleId(node.id)}
                                                        className="max-w-[180px] truncate rounded px-1 py-0.5 hover:bg-bg_secondary hover:text-text_primary"
                                                        title={articleTitle(
                                                            node,
                                                            uiLocale,
                                                            node.slug,
                                                        )}
                                                    >
                                                        {articleTitle(node, uiLocale, node.slug)}
                                                    </button>
                                                    <ChevronRight className="h-3 w-3 text-text_secondary/50" />
                                                </span>
                                            ))}
                                            <span
                                                className="max-w-[280px] truncate text-text_primary"
                                                title={articleTitle(
                                                    displayedArticle,
                                                    uiLocale,
                                                    displayedArticle.slug,
                                                )}
                                            >
                                                {articleTitle(
                                                    displayedArticle,
                                                    uiLocale,
                                                    displayedArticle.slug,
                                                )}
                                            </span>
                                        </nav>
                                    ) : (
                                        <span className="truncate text-xs font-semibold text-text_secondary/50">
                                            {displayedArticle
                                                ? articleTitle(
                                                      displayedArticle,
                                                      uiLocale,
                                                      displayedArticle.slug,
                                                  )
                                                : ' '}
                                        </span>
                                    )}
                                </div>

                                {/* Scrollable content area */}
                                <div
                                    ref={articleScrollRef}
                                    className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 md:px-6 md:py-5"
                                >
                                    {isLoadingDoc && (
                                        <div className="flex h-full items-center justify-center gap-2 text-text_secondary">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span className="text-sm">
                                                {t('documentation.modal.loading', 'Načítám obsah…')}
                                            </span>
                                        </div>
                                    )}

                                    {!isLoadingDoc && docArticles.length > 0 && (
                                        <div className="space-y-10">
                                            {docArticles.map((art, idx) => (
                                                <ArticleView
                                                    key={art.id}
                                                    article={art}
                                                    numbering={`${idx + 1}.`}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Admin-only inline notice: this module has a helpKey but no
                                        documentation article yet. Regular users never see this
                                        banner — they just see the static help silently. */}
                                    {!isLoadingDoc && showAdminMissingDocNotice && (
                                        <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-900">
                                            <span>
                                                {t(
                                                    'documentation.inline_editor.fallback_notice',
                                                    'Pro tento modul zatím není připravený článek v dokumentaci. Zobrazujeme statickou nápovědu.',
                                                )}
                                            </span>
                                            <Link
                                                href={`/documentation/create?help_context_key=${helpKey}`}
                                                className="font-medium text-amber-900 underline-offset-2 hover:underline"
                                            >
                                                {t(
                                                    'documentation.inline_editor.create_for_module',
                                                    'Vytvořit článek pro tento modul',
                                                )}
                                            </Link>
                                        </div>
                                    )}

                                    {/* Static fallback help — rendered any time we don't have a
                                        documentation article (regardless of whether the module is
                                        bound to a helpKey or only a tourContextKey). This keeps the
                                        user-facing behaviour consistent across all modules. */}
                                    {!isLoadingDoc && !displayedArticle && (
                                        <HelpContentRenderer contextKey={activeHelpKey} />
                                    )}
                                </div>
                            </div>

                            <div className="flex min-h-0 min-w-0 flex-col overflow-hidden border-l border-bg_border_element bg-bg_primary">
                                <div className="flex h-12 shrink-0 items-center border-b border-bg_border_element bg-bg_primary px-4">
                                    <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-text_secondary">
                                        {t(
                                            'onboarding.dialog.subtitle',
                                            'Vyberte si, jak se chcete seznámit s tímto modulem.',
                                        )}
                                    </h3>
                                </div>

                                <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overflow-x-hidden bg-bg_secondary/10 p-3 md:p-4">
                                    {/* Platform admin: prominent inline-edit affordance at the top. */}
                                    {canManage && docArticle && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsEditing(true)}
                                            className="h-auto w-full justify-start gap-3 border-main_color/40 bg-main_color/5 px-3.5 py-2.5 transition-all hover:border-main_color hover:bg-main_color/10"
                                        >
                                            <Pencil className="!h-5 !w-5 shrink-0 text-main_color" />
                                            <div className="min-w-0 text-left">
                                                <div className="truncate text-sm font-semibold text-text_primary">
                                                    {t(
                                                        'documentation.inline_editor.title',
                                                        'Upravit článek zde',
                                                    )}
                                                </div>
                                                <div className="truncate text-xs text-main_color">
                                                    {t(
                                                        'documentation.inline_editor.subtitle',
                                                        'Inline editace bez opuštění modulu',
                                                    )}
                                                </div>
                                            </div>
                                        </Button>
                                    )}

                                    {canManage && !docArticle && helpKey && (
                                        <Link
                                            href={`/documentation/create?help_context_key=${helpKey}`}
                                        >
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="h-auto w-full justify-start gap-3 border-main_color/40 bg-main_color/5 px-3.5 py-2.5 hover:border-main_color hover:bg-main_color/10"
                                            >
                                                <BookOpen className="!h-5 !w-5 shrink-0 text-main_color" />
                                                <div className="min-w-0 text-left">
                                                    <div className="truncate text-sm font-semibold text-text_primary">
                                                        {t(
                                                            'documentation.inline_editor.create_for_module',
                                                            'Vytvořit článek pro tento modul',
                                                        )}
                                                    </div>
                                                    <div className="truncate text-xs text-main_color">
                                                        {t(
                                                            'documentation.inline_editor.create_subtitle',
                                                            'Zatím není navázán žádný obsah',
                                                        )}
                                                    </div>
                                                </div>
                                            </Button>
                                        </Link>
                                    )}

                                    {supportOptions.map((option) => {
                                        const Wrapper: React.FC<{ children: React.ReactNode }> = ({
                                            children,
                                        }) =>
                                            option.href && !option.disabled ? (
                                                <Link href={option.href} className="block">
                                                    {children as any}
                                                </Link>
                                            ) : (
                                                <>{children}</>
                                            );
                                        return (
                                            <Wrapper key={option.key}>
                                                <Button
                                                    variant="outline"
                                                    disabled={option.disabled}
                                                    className={cn(
                                                        'h-auto w-full justify-start gap-3 border px-3.5 py-2.5 transition-all duration-200',
                                                        !option.disabled
                                                            ? 'hover:border-main_color hover:bg-main_color/5'
                                                            : 'cursor-not-allowed bg-bg_secondary/40 opacity-70 hover:border-bg_border_element hover:bg-bg_secondary/40',
                                                    )}
                                                    onClick={option.onClick}
                                                >
                                                    <option.icon
                                                        className={cn(
                                                            '!h-5 !w-5 shrink-0',
                                                            option.activeColor && !option.disabled
                                                                ? 'text-main_color'
                                                                : 'text-text_secondary',
                                                        )}
                                                    />
                                                    <div className="min-w-0 text-left">
                                                        <div
                                                            className={cn(
                                                                'truncate text-sm font-semibold',
                                                                option.disabled
                                                                    ? 'text-text_secondary'
                                                                    : 'text-text_primary',
                                                            )}
                                                        >
                                                            {option.title}
                                                        </div>
                                                        <div
                                                            className={cn(
                                                                'truncate text-xs',
                                                                option.activeColor ||
                                                                    option.isComingSoon
                                                                    ? 'text-main_color'
                                                                    : 'text-text_secondary',
                                                            )}
                                                        >
                                                            {option.subtitle}
                                                        </div>
                                                    </div>
                                                </Button>
                                            </Wrapper>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <FeedbackFormDialog
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
                module={feedbackKey}
            />

            <RatingDialog
                isOpen={isRatingOpen}
                onClose={() => setIsRatingOpen(false)}
                module={feedbackKey}
            />
        </>
    );
}

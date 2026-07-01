import { router } from '@inertiajs/react';
import {
    Bot,
    Building,
    ChevronRight,
    FunctionSquare,
    Home,
    ListChecks,
    Monitor,
    Radio,
    Search,
    Server,
    Settings2,
    ShieldCheck,
    SlidersHorizontal,
    TerminalSquare,
    User,
    Users,
    X,
} from 'lucide-react';
import { type ComponentType, useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { Button } from '@/components/ui/button';
import {
    CommandDialog,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { useLanguage } from '@/contexts/language-context';
import { useSearch } from '@/contexts/search-context';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
    Users,
    User,
    ShieldCheck,
    Home,
    Server,
    Settings2,
    Bot,
    SlidersHorizontal,
    Radio,
    TerminalSquare,
    FunctionSquare,
    ListChecks,
    Building,
    Monitor,
    Contact: Users,
};

interface SearchResultItem {
    id: string;
    label: string;
    description: string;
    url: string;
    type: string;
}

interface SearchResultGroup {
    id: string;
    title: string;
    icon: string;
    items: SearchResultItem[];
}

export function CommandPalette() {
    const isMobile = useIsMobile();
    const { t, language } = useLanguage();
    const { isOpen, closeSearch, toggleSearch } = useSearch();
    const [query, setQuery] = useState('');
    const [debouncedQuery] = useDebounce(query, 300);
    const [results, setResults] = useState<SearchResultGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('all');
    const searchCache = useRef<Record<string, SearchResultGroup[]>>({});

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                toggleSearch();
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [toggleSearch]);

    useEffect(() => {
        if (!debouncedQuery || debouncedQuery.length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }

        const fetchResults = async () => {
            if (searchCache.current[debouncedQuery]) {
                setResults(searchCache.current[debouncedQuery]);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(
                    `/global/search/data?q=${encodeURIComponent(debouncedQuery)}`,
                    {
                        method: 'GET',
                        headers: {
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                    },
                );

                if (!response.ok) throw new Error('Network response was not ok');

                const data = await response.json();
                searchCache.current[debouncedQuery] = data;
                setResults(data);

                setActiveTab('all');
            } catch (error) {
                console.error('Chyba při globálním vyhledávání:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [debouncedQuery]);

    const handleSelect = (url: string) => {
        if (url && url !== '#') {
            router.visit(url);
            closeSearch();
        }
    };

    const handleOpenInNewWindow = () => {
        closeSearch();
        router.visit(`/search?q=${encodeURIComponent(query)}`);
    };

    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setResults([]);
            setActiveTab('all');
        }
    }, [isOpen]);

    useEffect(() => {
        searchCache.current = {};
    }, [language]);

    const filteredResults =
        activeTab === 'all' ? results : results.filter((group) => group.id === activeTab);

    return (
        <CommandDialog open={isOpen} onOpenChange={closeSearch}>
            <div className="relative flex items-center border-b border-bg_border_element px-3 py-3 sm:px-6 sm:py-6">
                <Search className="mr-2 h-6 w-6 shrink-0 text-text_secondary opacity-50 sm:mr-4 sm:h-7 sm:w-7" />
                <CommandInput
                    placeholder={t('common.global_search')}
                    value={query}
                    onValueChange={setQuery}
                    className="h-12 flex-1 border-none bg-transparent p-0 text-base font-medium placeholder:text-text_secondary/60 focus:ring-0 sm:h-16 sm:text-xl"
                />

                <div className="flex items-center gap-2">
                    {!isMobile && (
                        <button
                            onClick={handleOpenInNewWindow}
                            className="text-main_color hover:underline"
                        >
                            {t('common.open_in_new_window')}
                        </button>
                    )}
                    <Button onClick={closeSearch} variant="ghost">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {results.length > 0 && (
                <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto border-b border-bg_border_element bg-bg_secondary/30 px-4 py-2">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={cn(
                            'flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium transition-colors',
                            activeTab === 'all'
                                ? 'bg-main_color text-white shadow-sm'
                                : 'border border-bg_border_element bg-bg_primary text-text_secondary hover:bg-bg_secondary hover:text-text_primary',
                        )}
                    >
                        <span>{t('common.all')}</span>
                        <span className="ml-1 opacity-70">
                            {results.reduce((acc, group) => acc + group.items.length, 0)}
                        </span>
                    </button>

                    {results.map((group) => {
                        const Icon = iconMap[group.icon] || Home;
                        return (
                            <button
                                key={group.id}
                                onClick={() => setActiveTab(group.id)}
                                className={cn(
                                    'flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium transition-colors',
                                    activeTab === group.id
                                        ? 'bg-main_color text-white shadow-sm'
                                        : 'border border-bg_border_element bg-bg_primary text-text_secondary hover:bg-main_color/20 hover:text-text_primary',
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{t(group.title)}</span>
                                <span className="ml-1 opacity-70">{group.items.length}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            <CommandList>
                {debouncedQuery && (
                    <div className="min-h-[100px] py-2">
                        {!loading && filteredResults.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-8 text-text_secondary">
                                <div className="mb-3 rounded-full bg-bg_secondary p-3">
                                    <Search className="h-6 w-6 opacity-50" />
                                </div>
                                <p className="text-sm font-medium">
                                    {t('common.no_results_found')}
                                </p>
                            </div>
                        )}

                        {filteredResults.map((group) => {
                            const GroupIcon = iconMap[group.icon] || Home;

                            return (
                                <div key={group.title} className="mb-2 last:mb-0">
                                    <div className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-text_secondary/80">
                                        <GroupIcon className="h-4 w-4 text-main_color" />
                                        <span>{t(group.title)}</span>
                                        <span className="rounded-full bg-bg_secondary px-2 py-0.5 text-sm">
                                            {group.items.length}
                                        </span>
                                    </div>

                                    <CommandGroup>
                                        {group.items.map((item) => (
                                            <CommandItem
                                                key={item.id}
                                                onSelect={() => handleSelect(item.url)}
                                                value={`${item.label} ${item.description}`}
                                                className="group mx-2 flex cursor-pointer items-center justify-between rounded-md px-3 py-2.5 hover:bg-main_color/20 data-[selected=true]:bg-transparent data-[selected=true]:hover:bg-main_color/20"
                                            >
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-medium text-text_primary">
                                                        {item.label}
                                                    </span>
                                                    {item.description && (
                                                        <span className="truncate text-xs text-text_secondary">
                                                            {item.description}
                                                        </span>
                                                    )}
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-text_secondary/50 transition-transform group-hover:translate-x-0.5 group-hover:text-main_color" />
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CommandList>
        </CommandDialog>
    );
}

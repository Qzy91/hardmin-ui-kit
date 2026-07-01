import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

export interface TabItem {
    value: string;
    label: React.ReactNode;
    visible?: boolean;
    disabled?: boolean;
}

interface ResponsiveTabsProps {
    value: string;
    onValueChange: (value: string) => void;
    tabs: TabItem[];
    children: React.ReactNode;
    className?: string;
}

export const ResponsiveTabs: React.FC<ResponsiveTabsProps> = ({
    value,
    onValueChange,
    tabs,
    children,
    className,
}) => {
    const tabsListRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const visibleTabs = tabs.filter((tab) => tab.visible !== false);

    const checkScroll = () => {
        if (tabsListRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = tabsListRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
        }
    };

    useEffect(() => {
        const ref = tabsListRef.current;
        if (ref) {
            ref.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
            checkScroll();
            const timeout = setTimeout(checkScroll, 100);
            return () => {
                ref.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
                clearTimeout(timeout);
            };
        }
    }, [visibleTabs.length]);

    const scrollTabs = (direction: 'left' | 'right') => {
        if (tabsListRef.current) {
            const scrollAmount = 200;
            tabsListRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    useEffect(() => {
        const scrollToActiveTab = () => {
            const container = tabsListRef.current;
            if (!container) return;

            const activeTabEl = container.querySelector(`[data-state="active"]`) as HTMLElement;

            if (activeTabEl) {
                activeTabEl.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center',
                });
            }
            setTimeout(checkScroll, 300);
        };

        const timer = setTimeout(() => {
            scrollToActiveTab();
            checkScroll();
        }, 150);

        return () => clearTimeout(timer);
    }, [value]);

    return (
        <Tabs
            value={value}
            onValueChange={onValueChange}
            className={cn('min-h-0 w-full', className)}
        >
            <div className="relative flex w-full shrink-0 items-center">
                {showLeftArrow && (
                    <div className="absolute left-0 z-10 flex h-full items-center bg-gradient-to-r from-background via-background to-transparent pl-1 pr-6">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                scrollTabs('left');
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-muted shadow-sm hover:bg-muted/80"
                            aria-label="Scroll left"
                            type="button"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <TabsList
                    ref={tabsListRef}
                    className="scrollbar-hide flex w-full items-center justify-start overflow-x-auto px-1 md:w-auto md:gap-2"
                >
                    {visibleTabs.map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            disabled={tab.disabled}
                            className="whitespace-nowrap"
                        >
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {showRightArrow && (
                    <div className="absolute right-0 z-10 flex h-full items-center bg-gradient-to-l from-background via-background to-transparent pl-6 pr-1">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                scrollTabs('right');
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-muted shadow-sm hover:bg-muted/80"
                            aria-label="Scroll right"
                            type="button"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            {children}
        </Tabs>
    );
};

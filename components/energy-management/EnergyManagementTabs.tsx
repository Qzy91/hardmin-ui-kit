import { DynamicIcon } from '@/components/other/dynamic-icon'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export interface EnergyManagementTabItem {
  id: string
  label: string
  icon?: LucideIcon
  iconName?: string
  colorClass?: string
  textColorClass?: string
  borderColorClass?: string
}

interface EnergyManagementTabsProps {
  tabs: EnergyManagementTabItem[]
  activeTabId: string
  onTabChange: (tabId: string) => void
  className?: string
}

export function EnergyManagementTabs({
  tabs,
  activeTabId,
  onTabChange,
  className,
}: EnergyManagementTabsProps) {
  const tabsListRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  const checkScroll = () => {
    if (tabsListRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsListRef.current
      setShowLeftArrow(scrollLeft > 2)
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 2)
    }
  }

  useEffect(() => {
    const ref = tabsListRef.current
    if (ref) {
      ref.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)
      checkScroll()
      setTimeout(checkScroll, 100)
      return () => {
        ref.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
      }
    }
  }, [])

  useEffect(() => {
    const container = tabsListRef.current
    if (container) {
      const activeTabEl = container.querySelector('[aria-current="page"]') as HTMLElement
      if (activeTabEl) {
        activeTabEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
      setTimeout(checkScroll, 350)
    }
  }, [activeTabId])

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsListRef.current) {
      tabsListRef.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div
      className={cn(
        'relative flex w-full max-w-full items-center overflow-hidden rounded-xl border border-bg_border_element bg-bg_primary',
        className,
      )}
    >
      {showLeftArrow && (
        <div className="absolute bottom-0 left-0 top-0 z-10 flex w-20 items-center justify-start rounded-l-xl bg-gradient-to-r from-bg_primary from-40% via-bg_primary/80 to-transparent pl-2">
          <button
            onClick={() => scrollTabs('left')}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-bg_secondary text-text_secondary shadow-sm transition-colors hover:bg-bg_secondary/80 hover:text-text_primary"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      )}

      <nav
        ref={tabsListRef}
        className="scrollbar-hide flex w-full items-center gap-2 overflow-x-auto p-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab) => {
          const isActive = activeTabId === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                isActive
                  ? cn(
                      tab.colorClass ?? 'bg-bg_secondary',
                      tab.textColorClass ?? 'text-text_primary',
                      tab.borderColorClass ?? 'border-bg_border_element',
                      'shadow-sm',
                    )
                  : 'border-transparent text-text_secondary hover:bg-bg_secondary/50 hover:text-text_primary',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.icon && <tab.icon className="h-4 w-4" />}
              {!tab.icon && tab.iconName && (
                <DynamicIcon name={tab.iconName} className="h-4 w-4" />
              )}
              <span>{tab.label}</span>
            </button>
          )
        })}
      </nav>

      {showRightArrow && (
        <div className="absolute bottom-0 right-0 top-0 z-10 flex w-20 items-center justify-end rounded-r-xl bg-gradient-to-l from-bg_primary from-40% via-bg_primary/80 to-transparent pr-2">
          <button
            onClick={() => scrollTabs('right')}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-bg_secondary text-text_secondary shadow-sm transition-colors hover:bg-bg_secondary/80 hover:text-text_primary"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

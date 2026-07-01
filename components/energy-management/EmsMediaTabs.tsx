import { BarChart3, ChevronLeft, ChevronRight, Droplets, Flame, Leaf, Thermometer, Zap } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

// Source: energyTabsData() + energyColorMap in HardminCloud mock.ts
const TABS = [
  {
    id: 'overview',
    label: 'Přehled',
    Icon: BarChart3,
    colorClass: 'bg-main_color/20',
    textColorClass: 'text-text_dark_main_color',
    borderColorClass: 'border-main_color/45',
  },
  {
    id: 'electricity',
    label: 'Elektřina',
    Icon: Zap,
    colorClass: 'bg-red-100/50',
    textColorClass: 'text-red-600',
    borderColorClass: 'border-red-300/70',
  },
  {
    id: 'water',
    label: 'Voda',
    Icon: Droplets,
    colorClass: 'bg-blue-100/50',
    textColorClass: 'text-blue-600',
    borderColorClass: 'border-blue-300/70',
  },
  {
    id: 'gas',
    label: 'Plyn',
    Icon: Flame,
    colorClass: 'bg-purple-100/50',
    textColorClass: 'text-purple-600',
    borderColorClass: 'border-purple-300/70',
  },
  {
    id: 'heat',
    label: 'Teplo',
    Icon: Thermometer,
    colorClass: 'bg-orange-100/50',
    textColorClass: 'text-orange-600',
    borderColorClass: 'border-orange-300/70',
  },
  {
    id: 'esg',
    label: 'ESG',
    Icon: Leaf,
    colorClass: 'bg-green-100/50',
    textColorClass: 'text-green-600',
    borderColorClass: 'border-green-300/70',
  },
]

interface EmsMediaTabsProps {
  activeId: string
  onTabChange?: (id: string) => void
}

export function EmsMediaTabs({ activeId, onTabChange }: EmsMediaTabsProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)

  const checkScroll = () => {
    const el = ref.current
    if (!el) return
    setShowLeft(el.scrollLeft > 2)
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)
    checkScroll()
    setTimeout(checkScroll, 100)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    ref.current?.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' })
  }

  return (
    <div className="relative flex w-full items-center overflow-hidden rounded-xl border border-bg_border_element bg-bg_primary">
      {showLeft && (
        <div className="absolute bottom-0 left-0 top-0 z-10 flex w-20 items-center justify-start rounded-l-xl bg-gradient-to-r from-bg_primary from-40% via-bg_primary/80 to-transparent pl-2">
          <button
            onClick={() => scroll('left')}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-bg_secondary text-text_secondary shadow-sm hover:bg-bg_secondary/80 hover:text-text_primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      )}

      <nav
        ref={ref}
        className="flex w-full items-center gap-2 overflow-x-auto p-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {TABS.map(({ id, label, Icon, colorClass, textColorClass, borderColorClass }) => {
          const isActive = id === activeId
          return (
            <button
              key={id}
              onClick={() => onTabChange?.(id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                isActive
                  ? cn(colorClass, textColorClass, borderColorClass, 'shadow-sm')
                  : 'border-transparent text-text_secondary hover:bg-bg_secondary/50 hover:text-text_primary',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          )
        })}
      </nav>

      {showRight && (
        <div className="absolute bottom-0 right-0 top-0 z-10 flex w-20 items-center justify-end rounded-r-xl bg-gradient-to-l from-bg_primary from-40% via-bg_primary/80 to-transparent pr-2">
          <button
            onClick={() => scroll('right')}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-bg_secondary text-text_secondary shadow-sm hover:bg-bg_secondary/80 hover:text-text_primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

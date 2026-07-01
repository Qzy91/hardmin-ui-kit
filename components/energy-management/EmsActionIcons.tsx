import {
  AreaChart,
  BarChartHorizontal,
  ChevronDown,
  Clock,
  FileText,
  Gauge,
  GitCompareArrows,
  Map,
  Power,
  Share2,
  Sun,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

// Source: EmsTemplateService::default_functions() — ids 1-4 shown inline, rest in overflow
const FUNCTIONS = [
  { id: 1,  Icon: BarChartHorizontal, label: 'Graf spotřeby',        color: '#f97316' },
  { id: 2,  Icon: Map,                label: 'Heatmapa',             color: '#22c55e' },
  { id: 3,  Icon: TrendingUp,         label: 'Predikce',             color: '#a855f7' },
  { id: 4,  Icon: Gauge,              label: 'Efektivita práce',     color: '#343aeb' },
  { id: 5,  Icon: AreaChart,          label: 'Čtvrthodiny (mapa)',   color: '#22c55e' },
  { id: 6,  Icon: Clock,              label: 'Čtvrthodiny (graf)',   color: '#ef4444' },
  { id: 7,  Icon: TrendingUp,         label: 'Výkonnostní graf',     color: '#3b82f6' },
  { id: 8,  Icon: GitCompareArrows,   label: 'Porovnání',            color: '#60a5fa' },
  { id: 10, Icon: Share2,             label: 'Sdílet',               color: '#22c55e' },
  { id: 11, Icon: Zap,                label: 'Technické hodnoty',    color: '#fb923c' },
  { id: 12, Icon: FileText,           label: 'Dokumenty',            color: '#c084fc' },
  { id: 20, Icon: Sun,                label: 'FVE doporučení',       color: '#f59e0b' },
  { id: 21, Icon: Power,              label: 'Ruční odečet',         color: '#6b7280' },
]

const INLINE = FUNCTIONS.slice(0, 4)
const OVERFLOW = FUNCTIONS.slice(4)

export function EmsActionIcons() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative flex h-full w-full items-center justify-center gap-2 px-2">
      {INLINE.map(({ id, Icon, label, color }) => (
        <button
          key={id}
          title={label}
          className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-bg_secondary"
          style={{ color }}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}

      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="ml-[-4px] flex h-6 w-6 items-center justify-center rounded text-text_secondary hover:bg-bg_border_element"
        >
          <ChevronDown className="h-4 w-4" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-7 z-20 grid grid-cols-4 gap-1 rounded-xl border border-bg_border_element bg-bg_primary p-2 shadow-md">
              {FUNCTIONS.map(({ id, Icon, label, color }) => (
                <button
                  key={id}
                  title={label}
                  className={cn('flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-bg_secondary')}
                  style={{ color }}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

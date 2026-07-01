import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, type PropsWithChildren } from 'react'
import { Sidebar } from './Sidebar'
import type { SectionEntry } from './use-pages'

const STORAGE_KEY = 'sidebar-collapsed'

interface Props extends PropsWithChildren {
  sections: SectionEntry[]
}

export function AppLayout({ children, sections }: Props) {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  })

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg_secondary">
      <aside className="relative z-30 flex-shrink-0">
        <Sidebar collapsed={collapsed} sections={sections} />
        <button
          onClick={toggle}
          className="absolute left-0 top-[4rem] z-20 rounded-full bg-bg_primary p-1.5 shadow-md transition-all duration-300 hover:bg-zinc-100"
          style={{
            transform: `translateX(${collapsed ? '48px' : '240px'}) translateY(-50%)`,
          }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 text-zinc-600" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-zinc-600" />
          )}
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto scroll-smooth bg-bg_secondary">
        {children}
      </main>
    </div>
  )
}

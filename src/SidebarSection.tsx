import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface Props {
  title?: string
  collapsed: boolean
  children: ReactNode
  className?: string
}

export function SidebarSection({ title, collapsed, children, className }: Props) {
  return (
    <div className={cn('my-2 px-2', className)}>
      {!collapsed && title && (
        <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text_secondary">
          {title}
        </h3>
      )}
      <nav>{children}</nav>
    </div>
  )
}

import { cn } from '@/lib/utils'
import { ChevronDown, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
  label: string
  icon?: LucideIcon
  collapsed: boolean
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  hasActiveItem?: boolean
  children: ReactNode
}

export function SidebarNavGroup({
  label,
  icon: Icon,
  collapsed,
  isOpen,
  onOpenChange,
  hasActiveItem = false,
  children,
}: Props) {
  return (
    <div className={cn('my-1', collapsed && 'flex justify-center')}>
      <button
        onClick={() => !collapsed && onOpenChange(!isOpen)}
        className={cn(
          'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
          'hover:bg-main_color/50 hover:text-text_primary',
          collapsed ? 'justify-center' : 'justify-between text-left',
          hasActiveItem ? 'text-text_primary' : 'text-text_secondary',
        )}
        aria-expanded={isOpen}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
          {!collapsed && (
            <span className="min-w-0 flex-1 truncate">{label}</span>
          )}
        </div>
        {!collapsed && (
          <ChevronDown
            size={16}
            className={cn(
              'flex-shrink-0 transition-transform duration-300',
              isOpen && 'rotate-180',
              hasActiveItem ? 'text-text_primary' : 'text-text_secondary',
            )}
          />
        )}
      </button>

      {!collapsed && (
        <div
          className={cn(
            'grid transition-[grid-template-rows,opacity] duration-300 ease-in-out',
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
          )}
          aria-hidden={!isOpen}
        >
          <div className="overflow-hidden">
            <div className="ml-5 mt-1 flex flex-col border-l-2 border-main_color pl-2">
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

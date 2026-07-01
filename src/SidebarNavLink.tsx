import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

interface Props {
  to: string
  label: string
  icon?: LucideIcon
  collapsed: boolean
}

export function SidebarNavLink({ to, label, icon: Icon, collapsed }: Props) {
  const { pathname } = useLocation()
  const isActive = pathname === to

  return (
    <Link
      to={to}
      title={label}
      className={cn(
        'group flex w-full items-center gap-3 rounded-md text-sm font-medium transition-all duration-200',
        collapsed ? 'my-2 justify-center px-2 py-2' : 'my-0.5 px-3 py-2',
        isActive
          ? 'bg-main_color text-white'
          : 'text-text_secondary hover:bg-main_color/50 hover:text-text_primary',
      )}
    >
      {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  )
}

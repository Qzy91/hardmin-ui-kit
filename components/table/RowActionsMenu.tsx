import { MoreHorizontal } from 'lucide-react'
import React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface MenuItem {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  isDestructive?: boolean
  disabled?: boolean
}

export type MenuSeparator = { type: 'separator' }

interface RowActionsMenuProps {
  items: (MenuItem | MenuSeparator)[]
}

export function RowActionsMenu({ items }: RowActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 rounded-full p-0 hover:bg-bg_secondary">
          <MoreHorizontal className="h-4 w-4 text-text_primary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 border-bg_border_element bg-bg_secondary">
        {items.map((item, index) => {
          if ('type' in item) {
            return <DropdownMenuSeparator key={`sep-${index}`} className="bg-bg_border_element" />
          }
          return (
            <DropdownMenuItem
              key={index}
              disabled={item.disabled}
              onClick={(e) => { e.stopPropagation(); item.onClick() }}
              className={`flex cursor-pointer items-center ${item.isDestructive ? 'text-red-600' : ''}`}
            >
              {item.icon && <span className="mr-4">{item.icon}</span>}
              <span className="flex-1">{item.label}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

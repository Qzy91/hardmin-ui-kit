import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { EmsActionIcons } from './EmsActionIcons'
import { EmsMetadataIcons } from './EmsMetadataIcons'
import type { EmsColumn, EmsRow } from './types'

interface EmsTableRowProps {
  row: EmsRow
  columns: EmsColumn[]
  levelColors: string[]
}

export function EmsTableRow({ row, columns, levelColors }: EmsTableRowProps) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = (row.children?.length ?? 0) > 0
  const color = levelColors[row.level % levelColors.length]

  return (
    <>
      <TableRow className={cn('group border-b border-bg_border_element last:border-0 hover:bg-bg_secondary/50')}>
        {/* Client cell */}
        <TableCell className="border-r border-bg_border_element">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${row.level * 20}px` }}>
            <div
              className="w-1 h-6 flex-shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            {hasChildren && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex h-4 w-4 flex-shrink-0 items-center justify-center text-text_secondary hover:text-text_primary transition-colors"
              >
                <ChevronRight
                  className={cn('h-4 w-4 transition-transform', expanded && 'rotate-90')}
                />
              </button>
            )}
            {!hasChildren && <div className="w-4 flex-shrink-0" />}
            <span className="font-medium text-text_primary text-sm">{row.label}</span>
          </div>
        </TableCell>

        {/* Data cells */}
        {columns.map((col) => {
          const value = row.data[col.id] ?? null
          return (
            <TableCell
              key={col.id}
              className="border-r border-bg_border_element text-right text-sm"
            >
              {value === null ? (
                <span className="text-text_secondary">—</span>
              ) : (
                <span className={cn(col.dataType === 'consumption' ? 'text-text_primary font-medium' : 'text-text_secondary')}>
                  {value}
                </span>
              )}
            </TableCell>
          )
        })}

        {/* Metadata cell */}
        <TableCell className="border-r border-bg_border_element">
          <EmsMetadataIcons metadata={row.metadata} />
        </TableCell>

        {/* Actions cell */}
        <TableCell className="p-0">
          <EmsActionIcons />
        </TableCell>
      </TableRow>

      {/* Children rows */}
      {expanded && row.children?.map((child) => (
        <EmsTableRow
          key={child.id}
          row={child}
          columns={columns}
          levelColors={levelColors}
        />
      ))}
    </>
  )
}

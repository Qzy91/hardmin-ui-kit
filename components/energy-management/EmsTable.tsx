import { BarChart3, Euro, Settings2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmsTableRow } from './EmsTableRow'
import type { EmsColumn, EmsRow } from './types'

const LEVEL_COLORS = ['#DB1922', '#55ABF6', '#2A8207', '#F7C280', '#2A217C']

interface EmsTableProps {
  columns: EmsColumn[]
  rows: EmsRow[]
}

export function EmsTable({ columns, rows }: EmsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-bg_border_element">
      <Table>
        <TableHeader style={{ backgroundColor: '#3d3d3d' }}>
          <TableRow className="border-b-0 hover:bg-transparent">
            <TableHead className="border-r border-white/10 text-center text-white font-semibold">
              Klient
            </TableHead>
            {columns.map((col) => (
              <TableHead
                key={col.id}
                className="relative border-r border-white/10 text-white"
              >
                <div className="flex flex-col items-center justify-center gap-1 py-2">
                  {col.dataType === 'consumption'
                    ? <BarChart3 className="h-4 w-4 text-white/70" />
                    : <Euro className="h-4 w-4 text-white/70" />
                  }
                  <span className="text-center text-xs font-medium leading-tight">
                    <span className="block text-white/50 text-[10px] font-normal">{col.period}</span>
                    {col.label}
                  </span>
                </div>
                <button className="absolute right-0 top-0 p-1 text-white/30 hover:text-white/70 transition-colors">
                  <Settings2 className="h-3 w-3" />
                </button>
              </TableHead>
            ))}
            <TableHead className="border-r border-white/10 text-center text-white font-semibold">
              Metadata
            </TableHead>
            <TableHead className="text-center text-white font-semibold">
              Akce
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <EmsTableRow
              key={row.id}
              row={row}
              columns={columns}
              levelColors={LEVEL_COLORS}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, Columns } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { PaginationControls } from './PaginationControls'

export interface UnifiedTableProps<TData extends object> {
  data: TData[]
  columns: ColumnDef<TData, unknown>[]
  onRowClick?: (row: TData) => void
  noDataMessage?: string
  renderRowActions?: (row: TData) => React.ReactNode
  rowTone?: (row: TData) => 'deleted' | undefined
  pageSize?: number
  showColumnSelector?: boolean
  showResultsCount?: boolean
}

const ROW_TONE_CLASS = {
  deleted: 'bg-red-50/90 hover:!bg-red-100',
}

export function UnifiedTable<TData extends object>({
  data,
  columns,
  onRowClick,
  noDataMessage = 'Žádné výsledky.',
  renderRowActions,
  rowTone,
  pageSize = 10,
  showColumnSelector = true,
  showResultsCount = true,
}: UnifiedTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pageIndex, setPageIndex] = useState(0)
  const [currentPageSize, setCurrentPageSize] = useState(pageSize)

  const allColumns: ColumnDef<TData, unknown>[] = renderRowActions
    ? [
        ...columns,
        {
          id: 'actions',
          header: () => <div className="text-right">Akce</div>,
          cell: ({ row }) => (
            <div className="flex justify-end">{renderRowActions(row.original)}</div>
          ),
          enableSorting: false,
          enableHiding: false,
          size: 80,
        },
      ]
    : columns

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting, pagination: { pageIndex, pageSize: currentPageSize } },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  })

  const totalItems = data.length
  const from = pageIndex * currentPageSize + 1
  const to = Math.min(from + currentPageSize - 1, totalItems)
  const totalPages = Math.ceil(totalItems / currentPageSize)

  return (
    <div className="w-full space-y-4">
      {(showResultsCount || showColumnSelector) && (
        <div className="flex items-center justify-between gap-4">
          {showResultsCount && (
            <span className="text-sm text-text_secondary px-1">
              Celkem výsledků: <span className="font-semibold text-text_primary">{totalItems}</span>
            </span>
          )}
          {showColumnSelector && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto h-8 shadow-sm">
                  <Columns className="mr-2 h-4 w-4 text-text_secondary" />
                  Sloupce
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 border-bg_border_element bg-bg_primary">
                {table.getAllColumns()
                  .filter((col) => col.getCanHide())
                  .map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      className="cursor-pointer capitalize text-text_primary hover:bg-bg_secondary"
                      checked={col.getIsVisible()}
                      onCheckedChange={(v) => col.toggleVisibility(!!v)}
                    >
                      {typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-bg_border_element bg-bg_primary">
        <Table className="w-full">
          <TableHeader style={{ backgroundColor: '#3d3d3d' }}>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="border-b-0 hover:bg-transparent">
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() ? `${header.getSize()}px` : undefined }}
                    className={cn(
                      'group h-12 px-4 text-sm font-medium text-white',
                      header.column.getCanSort() && 'cursor-pointer select-none hover:!bg-[#4a4a4a] transition-colors',
                      header.id === 'actions' && 'text-right',
                    )}
                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                  >
                    {header.isPlaceholder ? null : (
                      <div className={cn('flex items-center gap-2', header.id === 'actions' && 'justify-end')}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="flex h-4 w-4 items-center justify-center">
                            {{
                              asc: <ArrowUp className="h-4 w-4 text-white" />,
                              desc: <ArrowDown className="h-4 w-4 text-white" />,
                            }[header.column.getIsSorted() as string] ?? (
                              <ArrowUpDown className="h-4 w-4 text-white/70 opacity-50 transition-opacity group-hover:opacity-100" />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                const tone = rowTone?.(row.original)
                return (
                  <TableRow
                    key={row.id}
                    onClick={() => onRowClick?.(row.original)}
                    className={cn(
                      'border-b border-bg_border_element transition-colors',
                      onRowClick && 'cursor-pointer',
                      'hover:bg-bg_secondary',
                      tone ? ROW_TONE_CLASS[tone] : undefined,
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3 text-sm text-text_primary">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={allColumns.length} className="py-8 text-center text-text_secondary">
                  {noDataMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationControls
        currentPage={pageIndex + 1}
        totalPages={Math.max(totalPages, 1)}
        onPageChange={(p) => setPageIndex(p - 1)}
        pageSize={currentPageSize}
        onPageSizeChange={(s) => { setCurrentPageSize(s); setPageIndex(0) }}
        totalItems={totalItems}
        itemsFrom={totalItems === 0 ? 0 : from}
        itemsTo={to}
      />
    </div>
  )
}

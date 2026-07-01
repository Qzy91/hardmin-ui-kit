import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize: number
  onPageSizeChange: (size: number) => void
  pageSizeOptions?: number[]
  totalItems: number
  itemsFrom: number
  itemsTo: number
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 50],
  totalItems,
  itemsFrom,
  itemsTo,
}: PaginationControlsProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-4 px-2 sm:flex-row">
      <div className="text-sm text-text_secondary">
        Zobrazeno {itemsFrom}–{itemsTo} z {totalItems} výsledků
      </div>

      <div className="flex items-center space-x-6">
        {totalItems > 10 && (
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-text_secondary">Řádků na stránku</p>
            <Select
              value={pageSize.toString()}
              onValueChange={(v) => onPageSizeChange(parseInt(v))}
            >
              <SelectTrigger className="h-8 w-[70px] border-bg_border_element bg-bg_primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-bg_border_element bg-bg_primary">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex w-[100px] items-center justify-center text-sm font-medium text-text_secondary">
          Stránka {currentPage} z {totalPages}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

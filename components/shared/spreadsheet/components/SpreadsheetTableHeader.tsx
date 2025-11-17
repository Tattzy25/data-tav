import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, Copy, Trash2, Plus } from "lucide-react"
import type { ColumnConfig } from "@/lib/data-generator"

interface SpreadsheetTableHeaderProps {
  columns: ColumnConfig[]
  onColumnNameChange: (index: number, name: string) => void
  onSort: (columnId: string) => void
  onCopyColumn: (colIndex: number) => void
  onRemoveColumn: (colIndex: number) => void
  onAddColumn: () => void
}

export function SpreadsheetTableHeader({
  columns,
  onColumnNameChange,
  onSort,
  onCopyColumn,
  onRemoveColumn,
  onAddColumn,
}: SpreadsheetTableHeaderProps) {
  return (
    <thead>
      <tr className="bg-muted/50">
        <th className="border border-border p-2 w-12 text-center font-medium">#</th>
        {columns.map((col, colIndex) => (
          <th key={col.id} className="border border-border p-0 min-w-[150px] relative group">
            <div className="flex items-center">
              <Input
                value={col.name}
                onChange={(e) => onColumnNameChange(colIndex, e.target.value)}
                className="border-0 rounded-none font-medium text-center bg-transparent"
                placeholder="Column name"
              />
              <div className="flex items-center gap-1 absolute right-1 text-white">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:bg-white/10"
                  onClick={() => onSort(col.id)}
                  title="Sort column"
                >
                  <ArrowUpDown className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:bg-white/10"
                  onClick={() => onCopyColumn(colIndex)}
                  title="Copy column"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:bg-white/10"
                  onClick={() => onRemoveColumn(colIndex)}
                  title="Delete column"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </th>
        ))}
        <th className="border border-border p-2 w-12">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onAddColumn} title="Add column">
            <Plus className="w-4 h-4" />
          </Button>
        </th>
      </tr>
    </thead>
  )
}
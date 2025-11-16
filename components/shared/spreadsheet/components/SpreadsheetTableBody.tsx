import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"
import type { ColumnConfig } from "@/lib/data-generator"

interface SpreadsheetTableBodyProps {
  filteredData: Record<string, any>[]
  data: Record<string, any>[]
  columns: ColumnConfig[]
  selectedCell: { row: number; col: number } | null
  editingCell: { row: number; col: number } | null
  editValue: string
  inputRef: React.RefObject<HTMLInputElement>
  onCellClick: (rowIndex: number, colIndex: number) => void
  onCellChange: (value: string) => void
  onCellBlur: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onRemoveRow: (index: number) => void
}

export function SpreadsheetTableBody({
  filteredData,
  data,
  columns,
  selectedCell,
  editingCell,
  editValue,
  inputRef,
  onCellClick,
  onCellChange,
  onCellBlur,
  onKeyDown,
  onRemoveRow,
}: SpreadsheetTableBodyProps) {
  return (
    <tbody>
      {filteredData.map((row, rowIndex) => {
        const originalIndex = data.indexOf(row)
        return (
          <tr key={row.id} className="hover:bg-muted/30 group">
            <td className="border border-border p-2 text-center text-sm text-muted-foreground font-medium bg-muted/30">
              <div className="flex items-center justify-center gap-1">
                {originalIndex + 1}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemoveRow(originalIndex)}
                  title="Delete row"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </td>
            {columns.map((col, colIndex) => (
              <td
                key={col.id}
                className={`border border-border p-0 cursor-cell ${
                  selectedCell?.row === originalIndex && selectedCell?.col === colIndex
                    ? "ring-2 ring-primary ring-inset"
                    : ""
                }`}
                onClick={() => onCellClick(originalIndex, colIndex)}
              >
                {editingCell?.row === originalIndex && editingCell?.col === colIndex ? (
                  <Input
                    ref={inputRef}
                    value={editValue}
                    onChange={(e) => onCellChange(e.target.value)}
                    onBlur={onCellBlur}
                    onKeyDown={onKeyDown}
                    className="border-0 rounded-none h-full"
                  />
                ) : (
                  <div className="px-3 py-2 min-h-10">{String(row[col.id] || "")}</div>
                )}
              </td>
            ))}
            <td className="border border-border p-2"></td>
          </tr>
        )
      })}
    </tbody>
  )
}
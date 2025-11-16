import { SpreadsheetTableHeader } from "./components/SpreadsheetTableHeader"
import { SpreadsheetTableBody } from "./components/SpreadsheetTableBody"
import type { ColumnConfig } from "@/lib/data-generator"
import type React from "react"

interface SpreadsheetTableProps {
  data: Record<string, any>[]
  filteredData: Record<string, any>[]
  columns: ColumnConfig[]
  selectedCell: { row: number; col: number } | null
  editingCell: { row: number; col: number } | null
  editValue: string
  inputRef: React.RefObject<HTMLInputElement>
  onColumnNameChange: (index: number, name: string) => void
  onSort: (columnId: string) => void
  onCopyColumn: (colIndex: number) => void
  onRemoveColumn: (colIndex: number) => void
  onAddColumn: () => void
  onCellClick: (rowIndex: number, colIndex: number) => void
  onCellChange: (value: string) => void
  onCellBlur: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onRemoveRow: (index: number) => void
}

export function SpreadsheetTable({
  data,
  filteredData,
  columns,
  selectedCell,
  editingCell,
  editValue,
  inputRef,
  onColumnNameChange,
  onSort,
  onCopyColumn,
  onRemoveColumn,
  onAddColumn,
  onCellClick,
  onCellChange,
  onCellBlur,
  onKeyDown,
  onRemoveRow,
}: SpreadsheetTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <SpreadsheetTableHeader
            columns={columns}
            onColumnNameChange={onColumnNameChange}
            onSort={onSort}
            onCopyColumn={onCopyColumn}
            onRemoveColumn={onRemoveColumn}
            onAddColumn={onAddColumn}
          />
          <SpreadsheetTableBody
            filteredData={filteredData}
            data={data}
            columns={columns}
            selectedCell={selectedCell}
            editingCell={editingCell}
            editValue={editValue}
            inputRef={inputRef}
            onCellClick={onCellClick}
            onCellChange={onCellChange}
            onCellBlur={onCellBlur}
            onKeyDown={onKeyDown}
            onRemoveRow={onRemoveRow}
          />
        </table>
      </div>
    </div>
  )
}
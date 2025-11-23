"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Undo2, Redo2, ArrowUpDown, Search, Copy, Upload, Download } from "lucide-react"
import type { ColumnConfig } from "@/lib/data-generator"
import { useToast } from "@/hooks/use-toast"
import { sortData } from "./utils"
import { useHistory } from "./hooks/useHistory"
import { SpreadsheetToolbar } from "./SpreadsheetToolbar"
import { SpreadsheetTable } from "./SpreadsheetTable"
import { SpreadsheetFooter } from "./SpreadsheetFooter"
import type { SpreadsheetProps } from "./types"

export function Spreadsheet({
  data,
  columns,
  onDataChange,
  onColumnsChange,
  onImportData,
  onExportCsv,
  onExportJson,
  onExportSql,
  onExportNeonSql,
  onExportSupabaseSql,
  onExportPdf,
  onRefreshData,
  onClearData,
}: SpreadsheetProps) {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null)
  const [editValue, setEditValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const [searchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{ columnId: string; direction: "asc" | "desc" } | null>(null)

  const { saveToHistory, undo: undoHistory, redo: redoHistory, canUndo, canRedo } = useHistory(data, columns)

  const handleSort = (columnId: string) => {
    const direction = sortConfig?.columnId === columnId && sortConfig.direction === "asc" ? "desc" : "asc"
    setSortConfig({ columnId, direction })
    const sortedData = sortData(data, columnId, direction)
    onDataChange(sortedData)
    toast({ description: `Sorted by ${columns.find((c) => c.id === columnId)?.name}` })
  }

  const handleCopyColumn = (colIndex: number) => {
    const column = columns[colIndex]
    const values = data.map((row) => String(row[column.id] || "")).join("\n")
    navigator.clipboard.writeText(values)
    toast({ description: `Copied ${data.length} values` })
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        const state = undoHistory()
        if (state) {
          onDataChange(state.data)
          onColumnsChange(state.columns)
          toast({ description: "Undo successful" })
        }
      } else if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") || (e.ctrlKey && e.key === "y")) {
        e.preventDefault()
        const state = redoHistory()
        if (state) {
          onDataChange(state.data)
          onColumnsChange(state.columns)
          toast({ description: "Redo successful" })
        }
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedCell && !editingCell) {
        e.preventDefault()
        const newData = [...data]
        const column = columns[selectedCell.col]
        newData[selectedCell.row][column.id] = ""
        onDataChange(newData)
        saveToHistory(newData, columns)
      } else if ((e.ctrlKey || e.metaKey) && e.key === "c" && selectedCell && !editingCell) {
        e.preventDefault()
        const column = columns[selectedCell.col]
        const value = String(data[selectedCell.row][column.id] || "")
        navigator.clipboard.writeText(value)
        toast({ description: "Copied to clipboard" })
      } else if ((e.ctrlKey || e.metaKey) && e.key === "v" && selectedCell && !editingCell) {
        e.preventDefault()
        navigator.clipboard.readText().then((text) => {
          const newData = [...data]
          const column = columns[selectedCell.col]
          newData[selectedCell.row][column.id] = text
          onDataChange(newData)
          saveToHistory(newData, columns)
          toast({ description: "Pasted from clipboard" })
        })
      } else if (selectedCell && !editingCell) {
        if (e.key === "ArrowUp" && selectedCell.row > 0) {
          e.preventDefault()
          setSelectedCell({ ...selectedCell, row: selectedCell.row - 1 })
        } else if (e.key === "ArrowDown" && selectedCell.row < data.length - 1) {
          e.preventDefault()
          setSelectedCell({ ...selectedCell, row: selectedCell.row + 1 })
        } else if (e.key === "ArrowLeft" && selectedCell.col > 0) {
          e.preventDefault()
          setSelectedCell({ ...selectedCell, col: selectedCell.col - 1 })
        } else if (e.key === "ArrowRight" && selectedCell.col < columns.length - 1) {
          e.preventDefault()
          setSelectedCell({ ...selectedCell, col: selectedCell.col + 1 })
        } else if (e.key === "Enter") {
          e.preventDefault()
          setEditingCell(selectedCell)
          const column = columns[selectedCell.col]
          setEditValue(String(data[selectedCell.row][column.id] || ""))
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedCell, editingCell, data, columns, onDataChange, saveToHistory, undoHistory, redoHistory, toast])

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingCell])

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    setSelectedCell({ row: rowIndex, col: colIndex })
    setEditingCell({ row: rowIndex, col: colIndex })
    const column = columns[colIndex]
    setEditValue(String(data[rowIndex][column.id] || ""))
  }

  const handleCellChange = (value: string) => {
    setEditValue(value)
  }

  const handleCellBlur = () => {
    if (editingCell) {
      const newData = [...data]
      const column = columns[editingCell.col]
      const oldValue = newData[editingCell.row][column.id]
      if (oldValue !== editValue) {
        newData[editingCell.row][column.id] = editValue
        onDataChange(newData)
        saveToHistory(newData, columns)
      }
    }
    setEditingCell(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleCellBlur()
      if (selectedCell && selectedCell.row < data.length - 1) {
        setSelectedCell({ ...selectedCell, row: selectedCell.row + 1 })
      }
    } else if (e.key === "Escape") {
      setEditingCell(null)
      setEditValue("")
    } else if (e.key === "Tab") {
      e.preventDefault()
      handleCellBlur()
      if (selectedCell && selectedCell.col < columns.length - 1) {
        setSelectedCell({ ...selectedCell, col: selectedCell.col + 1 })
      }
    }
  }

  const addRow = () => {
    const newRow: Record<string, any> = { id: String(Date.now()) }
    columns.forEach((col) => {
      newRow[col.id] = ""
    })
    const newData = [...data, newRow]
    onDataChange(newData)
    saveToHistory(newData, columns)
    toast({ description: "Row added" })
  }

  const removeRow = (index: number) => {
    if (data.length <= 1) {
      toast({ description: "Cannot delete the last row", variant: "destructive" })
      return
    }
    const newData = data.filter((_, i) => i !== index)
    onDataChange(newData)
    saveToHistory(newData, columns)
    toast({ description: "Row deleted" })
  }

  const addColumn = () => {
    const newCol: ColumnConfig = {
      id: String(Date.now()),
      name: `Column ${columns.length + 1}`,
      type: "text",
    }
    const newColumns = [...columns, newCol]
    onColumnsChange(newColumns)
    const newData = data.map((row) => ({ ...row, [newCol.id]: "" }))
    onDataChange(newData)
    saveToHistory(newData, newColumns)
    toast({ description: "Column added" })
  }

  const removeColumn = (index: number) => {
    if (columns.length <= 1) {
      toast({ description: "Cannot delete the last column", variant: "destructive" })
      return
    }
    const colToRemove = columns[index]
    const newColumns = columns.filter((_, i) => i !== index)
    onColumnsChange(newColumns)
    const newData = data.map((row) => {
      const { [colToRemove.id]: removed, ...rest } = row
      return rest
    })
    onDataChange(newData)
    saveToHistory(newData, newColumns)
    toast({ description: "Column deleted" })
  }

  const updateColumnName = (index: number, newName: string) => {
    const newColumns = [...columns]
    newColumns[index].name = newName
    onColumnsChange(newColumns)
    saveToHistory(data, newColumns)
  }

  const filteredData = searchTerm
    ? data.filter((row) =>
        columns.some((col) =>
          String(row[col.id] || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
        ),
      )
    : data

  return (
    <div className="space-y-4">
      <SpreadsheetToolbar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => {
          const state = undoHistory()
          if (state) {
            onDataChange(state.data)
            onColumnsChange(state.columns)
            toast({ description: "Undo successful" })
          }
        }}
        onRedo={() => {
          const state = redoHistory()
          if (state) {
            onDataChange(state.data)
            onColumnsChange(state.columns)
            toast({ description: "Redo successful" })
          }
        }}
        onImportData={onImportData}
        onExportCsv={onExportCsv}
        onExportJson={onExportJson}
        onExportSql={onExportSql}
        onExportNeonSql={onExportNeonSql}
        onExportSupabaseSql={onExportSupabaseSql}
        onExportPdf={onExportPdf}
        onRefreshData={onRefreshData}
        onClearData={onClearData}
      />
      <SpreadsheetTable
        data={data}
        filteredData={filteredData}
        columns={columns}
        selectedCell={selectedCell}
        editingCell={editingCell}
        editValue={editValue}
        inputRef={inputRef}
        onColumnNameChange={updateColumnName}
        onSort={handleSort}
        onCopyColumn={handleCopyColumn}
        onRemoveColumn={removeColumn}
        onAddColumn={addColumn}
        onCellClick={handleCellClick}
        onCellChange={setEditValue}
        onCellBlur={handleCellBlur}
        onKeyDown={handleKeyDown}
        onRemoveRow={removeRow}
      />
      <SpreadsheetFooter
        onAddRow={addRow}
        searchTerm={searchTerm}
        filteredDataLength={filteredData.length}
        dataLength={data.length}
      />
    </div>
  )
}
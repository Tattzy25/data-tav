"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Undo2, Redo2, ArrowUpDown, Search, Copy } from "lucide-react"
import type { ColumnConfig } from "@/lib/data-generator"
import { useToast } from "@/hooks/use-toast"

interface SpreadsheetProps {
  data: Record<string, any>[]
  columns: ColumnConfig[]
  onDataChange: (data: Record<string, any>[]) => void
  onColumnsChange: (columns: ColumnConfig[]) => void
}

interface HistoryState {
  data: Record<string, any>[]
  columns: ColumnConfig[]
}

export function Spreadsheet({ data, columns, onDataChange, onColumnsChange }: SpreadsheetProps) {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null)
  const [editValue, setEditValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const [history, setHistory] = useState<HistoryState[]>([{ data, columns }])
  const [historyIndex, setHistoryIndex] = useState(0)

  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{ columnId: string; direction: "asc" | "desc" } | null>(null)

  const saveToHistory = useCallback(
    (newData: Record<string, any>[], newColumns: ColumnConfig[]) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1)
        newHistory.push({ data: newData, columns: newColumns })
        // Limit history to 50 states
        if (newHistory.length > 50) {
          newHistory.shift()
          return newHistory
        }
        return newHistory
      })
      setHistoryIndex((prev) => Math.min(prev + 1, 49))
    },
    [historyIndex],
  )

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      const state = history[newIndex]
      onDataChange(state.data)
      onColumnsChange(state.columns)
      toast({ description: "Undo successful" })
    }
  }, [historyIndex, history, onDataChange, onColumnsChange, toast])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      const state = history[newIndex]
      onDataChange(state.data)
      onColumnsChange(state.columns)
      toast({ description: "Redo successful" })
    }
  }, [historyIndex, history, onDataChange, onColumnsChange, toast])

  const handleSort = (columnId: string) => {
    const direction = sortConfig?.columnId === columnId && sortConfig.direction === "asc" ? "desc" : "asc"

    setSortConfig({ columnId, direction })

    const sortedData = [...data].sort((a, b) => {
      const aVal = a[columnId]
      const bVal = b[columnId]

      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      const comparison = aVal < bVal ? -1 : 1
      return direction === "asc" ? comparison : -comparison
    })

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
      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      // Redo: Ctrl+Shift+Z or Cmd+Shift+Z or Ctrl+Y
      else if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") || (e.ctrlKey && e.key === "y")) {
        e.preventDefault()
        redo()
      }
      // Delete: Delete or Backspace when cell is selected but not editing
      else if ((e.key === "Delete" || e.key === "Backspace") && selectedCell && !editingCell) {
        e.preventDefault()
        const newData = [...data]
        const column = columns[selectedCell.col]
        newData[selectedCell.row][column.id] = ""
        onDataChange(newData)
        saveToHistory(newData, columns)
      }
      // Copy: Ctrl+C or Cmd+C
      else if ((e.ctrlKey || e.metaKey) && e.key === "c" && selectedCell && !editingCell) {
        e.preventDefault()
        const column = columns[selectedCell.col]
        const value = String(data[selectedCell.row][column.id] || "")
        navigator.clipboard.writeText(value)
        toast({ description: "Copied to clipboard" })
      }
      // Paste: Ctrl+V or Cmd+V
      else if ((e.ctrlKey || e.metaKey) && e.key === "v" && selectedCell && !editingCell) {
        e.preventDefault()
        navigator.clipboard.readText().then((text) => {
          const newData = [...data]
          const column = columns[selectedCell.col]
          newData[selectedCell.row][column.id] = text
          onDataChange(newData)
          saveToHistory(newData, columns)
          toast({ description: "Pasted from clipboard" })
        })
      }
      // Arrow navigation
      else if (selectedCell && !editingCell) {
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
  }, [selectedCell, editingCell, data, columns, onDataChange, saveToHistory, undo, redo, toast])

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
      <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex === 0} title="Undo (Ctrl+Z)">
            <Undo2 className="w-4 h-4 mr-2" />
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={historyIndex === history.length - 1}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4 mr-2" />
            Redo
          </Button>
        </div>
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="text-xs text-muted-foreground hidden lg:block">
          Ctrl+C (Copy) • Ctrl+V (Paste) • Delete (Clear) • Enter (Edit) • Tab (Next) • Arrows (Navigate)
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border p-2 w-12 text-center font-medium">#</th>
                {columns.map((col, colIndex) => (
                  <th key={col.id} className="border border-border p-0 min-w-[150px] relative group">
                    <div className="flex items-center">
                      <Input
                        value={col.name}
                        onChange={(e) => updateColumnName(colIndex, e.target.value)}
                        className="border-0 rounded-none font-medium text-center bg-transparent"
                        placeholder="Column name"
                      />
                      <div className="flex items-center gap-1 absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleSort(col.id)}
                          title="Sort column"
                        >
                          <ArrowUpDown className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleCopyColumn(colIndex)}
                          title="Copy column"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeColumn(colIndex)}
                          title="Delete column"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </th>
                ))}
                <th className="border border-border p-2 w-12">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={addColumn} title="Add column">
                    <Plus className="w-4 h-4" />
                  </Button>
                </th>
              </tr>
            </thead>
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
                          onClick={() => removeRow(originalIndex)}
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
                        onClick={() => handleCellClick(originalIndex, colIndex)}
                      >
                        {editingCell?.row === originalIndex && editingCell?.col === colIndex ? (
                          <Input
                            ref={inputRef}
                            value={editValue}
                            onChange={(e) => handleCellChange(e.target.value)}
                            onBlur={handleCellBlur}
                            onKeyDown={handleKeyDown}
                            className="border-0 rounded-none h-full"
                          />
                        ) : (
                          <div className="px-3 py-2 min-h-[40px]">{String(row[col.id] || "")}</div>
                        )}
                      </td>
                    ))}
                    <td className="border border-border p-2"></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="p-2 border-t border-border bg-muted/30">
          <Button variant="outline" size="sm" onClick={addRow} className="w-full bg-transparent">
            <Plus className="w-4 h-4 mr-2" />
            Add Row
          </Button>
        </div>
      </div>

      {searchTerm && (
        <p className="text-sm text-muted-foreground text-center">
          Showing {filteredData.length} of {data.length} rows
        </p>
      )}
    </div>
  )
}

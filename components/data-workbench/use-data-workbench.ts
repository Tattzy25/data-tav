"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { exportToCSV, exportToJSON, type ColumnConfig } from "@/lib/data-generator"

type ToastArgs = {
  description: string
  title?: string
  variant?: "default" | "destructive"
}

type UseDataWorkbenchOptions = {
  storageKey?: string
  onNotifyAction?: (args: ToastArgs) => void
}

type ExportFormat = "csv" | "json"

type UseDataWorkbenchResult = {
  data: Record<string, any>[]
  columns: ColumnConfig[]
  setData: React.Dispatch<React.SetStateAction<Record<string, any>[]>>
  setColumns: React.Dispatch<React.SetStateAction<ColumnConfig[]>>
  exportData: (format: ExportFormat) => void
  clearData: () => void
  importFile: (file: File) => Promise<void>
  hasData: boolean
}

const DEFAULT_STORAGE_KEY = "brigit_ai_data"

export function useDataWorkbench({ storageKey = DEFAULT_STORAGE_KEY, onNotifyAction }: UseDataWorkbenchOptions = {}): UseDataWorkbenchResult {
  const [data, setData] = useState<Record<string, any>[]>([])
  const [columns, setColumns] = useState<ColumnConfig[]>([])

  const notify = useCallback(
    (args: ToastArgs) => {
      if (onNotifyAction) {
        onNotifyAction(args)
      }
    },
    [onNotifyAction],
  )

  // hydrate from storage on mount
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey)
      if (!saved) return
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed?.data) && Array.isArray(parsed?.columns)) {
        setData(parsed.data)
        setColumns(parsed.columns)
        notify({ description: "Previous session restored" })
      }
    } catch (error) {
      console.error("Failed to load saved data", error)
    }
  }, [notify, storageKey])

  // persist incremental changes
  useEffect(() => {
    if (data.length === 0 && columns.length === 0) {
      window.localStorage.removeItem(storageKey)
      return
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ data, columns }))
    } catch (error) {
      console.error("Failed to persist data", error)
    }
  }, [data, columns, storageKey])

  const exportData = useCallback(
    (format: ExportFormat) => {
      if (data.length === 0) {
        notify({ description: "No data to export", variant: "destructive" })
        return
      }

      try {
        const content = format === "csv" ? exportToCSV(data, columns) : exportToJSON(data)
        const blob = new Blob([content], { type: format === "csv" ? "text/csv" : "application/json" })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement("a")
        anchor.href = url
        anchor.download = `data-workbench-${Date.now()}.${format}`
        anchor.click()
        URL.revokeObjectURL(url)
        notify({ description: `Exported as ${format.toUpperCase()}` })
      } catch (error) {
        console.error("Failed to export data", error)
        notify({ description: "Failed to export data", variant: "destructive" })
      }
    },
    [columns, data, notify],
  )

  const clearData = useCallback(() => {
    setData([])
    setColumns([])
    window.localStorage.removeItem(storageKey)
    notify({ description: "Data cleared" })
  }, [notify, storageKey])

  const importFile = useCallback(
    async (file: File) => {
      const content = await file.text()
      try {
        let importedData: Record<string, any>[]

        if (file.name.endsWith(".json")) {
          const parsed = JSON.parse(content)
          importedData = Array.isArray(parsed) ? parsed : [parsed]
        } else if (file.name.endsWith(".csv")) {
          importedData = parseCsv(content)
        } else {
          throw new Error("Unsupported file format. Please use CSV or JSON.")
        }

        if (importedData.length === 0) {
          throw new Error("No data found in file")
        }

        const first = importedData[0]
        const detectedColumns = Object.keys(first).map((key, index) => ({
          id: String(index),
          name: key,
          type: inferDataType(first[key]),
        }))

        setColumns(detectedColumns)
        setData(importedData.map((row, index) => ({ id: row.id ?? String(index), ...row })))
        notify({ description: `Imported ${importedData.length} rows` })
      } catch (error) {
        console.error("Failed to import file", error)
        notify({ description: error instanceof Error ? error.message : "Failed to import file", variant: "destructive" })
      }
    },
    [notify],
  )

  const hasData = useMemo(() => data.length > 0 && columns.length > 0, [columns.length, data.length])

  return {
    data,
    columns,
    setData,
    setColumns,
    exportData,
    clearData,
    importFile,
    hasData,
  }
}

function parseCsv(content: string): Record<string, any>[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length === 0) return []

  const headers = lines[0].split(",").map((header) => header.trim())

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim())
    return headers.reduce<Record<string, any>>((acc, header, index) => {
      acc[header] = values[index] ?? ""
      return acc
    }, {})
  })
}

function inferDataType(value: any): ColumnConfig["type"] {
  if (typeof value === "boolean") return "boolean"
  if (typeof value === "number") return "number"

  if (typeof value === "string") {
    const trimmed = value.trim().toLowerCase()

    if (trimmed.includes("@") && trimmed.includes(".")) return "email"
    if (/^\+?[\d\s\-()]+$/.test(trimmed) && trimmed.replace(/\D/g, "").length >= 10) return "phone"
    if (!Number.isNaN(Date.parse(trimmed))) return "date"
    if (/(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd)/i.test(trimmed)) return "address"
    if (/(name|firstname|lastname|fullname)/i.test(trimmed)) return "name"
    if (/(company|organization|business|corp|inc|ltd)/i.test(trimmed)) return "company"
  }

  return "text"
}

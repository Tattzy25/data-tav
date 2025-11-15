import type { ColumnConfig } from "./data-types"

export function exportToCSV(data: Record<string, any>[], columns: ColumnConfig[]): string {
  if (data.length === 0) return ""

  const headers = columns.map((col) => col.name).join(",")
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.id]
        // Escape values that contain commas or quotes
        if (typeof value === "string" && (value.includes(",") || value.includes("\""))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      })
      .join(","),
  )

  return [headers, ...rows].join("\n")
}

export function exportToJSON(data: Record<string, any>[]): string {
  return JSON.stringify(data, null, 2)
}

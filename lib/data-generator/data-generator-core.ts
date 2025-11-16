import type { ColumnConfig } from "./data-types"
import { generateValue } from "./value-generator"

export function generateData(columns: ColumnConfig[], rowCount: number): Record<string, any>[] {
  const data: Record<string, any>[] = []

  for (let i = 0; i < rowCount; i++) {
    const row: Record<string, any> = {}
    columns.forEach((column) => {
      row[column.id] = generateValue(column.type)
    })
    data.push(row)
  }

  return data
}

import type { ColumnConfig } from "@/lib/data-generator"

export interface SpreadsheetProps {
  data: Record<string, any>[]
  columns: ColumnConfig[]
  onDataChange: (data: Record<string, any>[]) => void
  onColumnsChange: (columns: ColumnConfig[]) => void
  onImportData?: () => void
  onExportCsv?: () => void
  onExportJson?: () => void
  onClearData?: () => void
}

export interface HistoryState {
  data: Record<string, any>[]
  columns: ColumnConfig[]
}
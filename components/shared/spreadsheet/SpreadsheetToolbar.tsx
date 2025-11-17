import { ButtonGroupInput } from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import { Undo2, Redo2, Upload, Download, Trash2 } from "lucide-react"

interface SpreadsheetToolbarProps {
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  searchTerm: string
  onSearchChange: (value: string) => void
  onImportData?: () => void
  onExportCsv?: () => void
  onExportJson?: () => void
  onClearData?: () => void
}

export function SpreadsheetToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  searchTerm,
  onSearchChange,
  onImportData,
  onExportCsv,
  onExportJson,
  onClearData,
}: SpreadsheetToolbarProps) {
  return (
    <div className="flex h-[100px] flex-wrap items-center gap-4 rounded-lg border border-border/80 bg-muted/50 px-3 py-2">
      <ButtonGroupInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Search data"
        className="w-64"
      />
      <div className="ml-auto flex flex-wrap items-center gap-2 py-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="h-20 w-20 rounded-2xl border-2 border-border p-0 text-white shadow-[0_6px_16px_rgba(0,0,0,0.6)] transition-colors hover:border-yellow-400 hover:bg-yellow-200/20 focus-visible:ring-2 focus-visible:ring-yellow-400 active:bg-yellow-300 active:text-foreground"
        >
          <Undo2 className="h-5 w-5" />
          <span className="sr-only">Undo</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          className="h-20 w-20 rounded-2xl border-2 border-border p-0 text-white shadow-[0_6px_16px_rgba(0,0,0,0.6)] transition-colors hover:border-yellow-400 hover:bg-yellow-200/20 focus-visible:ring-2 focus-visible:ring-yellow-400 active:bg-yellow-300 active:text-foreground"
        >
          <Redo2 className="h-4 w-4" />
          <span className="sr-only">Redo</span>
        </Button>
        {(onImportData || onExportCsv || onExportJson || onClearData) && (
          <div className="flex items-center gap-2">
            {onImportData && (
              <Button
                variant="outline"
                size="sm"
                onClick={onImportData}
                title="Import CSV or JSON"
                className="h-20 w-20 rounded-2xl border-2 border-border p-0 text-white shadow-[0_6px_16px_rgba(0,0,0,0.6)] transition-colors hover:border-yellow-400 hover:bg-yellow-200/20 focus-visible:ring-2 focus-visible:ring-yellow-400 active:bg-yellow-300 active:text-foreground"
              >
                <Upload className="h-4 w-4" />
                <span className="sr-only">Import</span>
              </Button>
            )}
            {onExportCsv && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportCsv}
                title="Export as CSV"
                className="h-20 w-20 rounded-2xl border-2 border-border p-0 text-white shadow-[0_6px_16px_rgba(0,0,0,0.6)] transition-colors hover:border-yellow-400 hover:bg-yellow-200/20 focus-visible:ring-2 focus-visible:ring-yellow-400 active:bg-yellow-300 active:text-foreground"
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Export CSV</span>
              </Button>
            )}
            {onExportJson && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportJson}
                title="Export as JSON"
                className="h-20 w-20 rounded-2xl border-2 border-border p-0 text-white shadow-[0_6px_16px_rgba(0,0,0,0.6)] transition-colors hover:border-yellow-400 hover:bg-yellow-200/20 focus-visible:ring-2 focus-visible:ring-yellow-400 active:bg-yellow-300 active:text-foreground"
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Export JSON</span>
              </Button>
            )}
            {onClearData && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearData}
                title="Clear data"
                className="h-20 w-20 rounded-2xl border-2 border-border p-0 text-white shadow-[0_6px_16px_rgba(0,0,0,0.6)] transition-colors hover:border-yellow-400 hover:bg-yellow-200/20 focus-visible:ring-2 focus-visible:ring-yellow-400 active:bg-yellow-300 active:text-foreground"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Clear data</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
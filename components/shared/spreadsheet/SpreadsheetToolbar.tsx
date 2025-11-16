import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Undo2, Redo2, Search, Upload, Download, Trash2 } from "lucide-react"

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
    <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border flex-wrap gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          <Undo2 className="w-4 h-4 mr-2" />
          Undo
        </Button>
        <Button variant="outline" size="sm" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
          <Redo2 className="w-4 h-4 mr-2" />
          Redo
        </Button>
      </div>
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search data..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9"
        />
      </div>
      <div className="flex items-center gap-3 flex-wrap justify-end">
        <div className="text-xs text-muted-foreground hidden xl:block">
          Ctrl+C (Copy) • Ctrl+V (Paste) • Delete (Clear) • Enter (Edit) • Tab (Next) • Arrows (Navigate)
        </div>
        {(onImportData || onExportCsv || onExportJson || onClearData) && (
          <div className="flex items-center gap-2 flex-wrap">
            {onImportData && (
              <Button variant="outline" size="sm" onClick={onImportData} title="Import CSV or JSON">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            )}
            {onExportCsv && (
              <Button variant="outline" size="sm" onClick={onExportCsv} title="Export as CSV">
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
            )}
            {onExportJson && (
              <Button variant="outline" size="sm" onClick={onExportJson} title="Export as JSON">
                <Download className="w-4 h-4 mr-2" />
                JSON
              </Button>
            )}
            {onClearData && (
              <Button variant="outline" size="sm" onClick={onClearData} title="Clear data">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
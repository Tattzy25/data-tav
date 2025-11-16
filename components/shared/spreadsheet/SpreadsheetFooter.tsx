import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface SpreadsheetFooterProps {
  onAddRow: () => void
  searchTerm: string
  filteredDataLength: number
  dataLength: number
}

export function SpreadsheetFooter({
  onAddRow,
  searchTerm,
  filteredDataLength,
  dataLength,
}: SpreadsheetFooterProps) {
  return (
    <>
      <div className="p-2 border-t border-border bg-muted/30">
        <Button variant="outline" size="sm" onClick={onAddRow} className="w-full bg-transparent">
          <Plus className="w-4 h-4 mr-2" />
          Add Row
        </Button>
      </div>
      {searchTerm && (
        <p className="text-sm text-muted-foreground text-center">
          Showing {filteredDataLength} of {dataLength} rows
        </p>
      )}
    </>
  )
}
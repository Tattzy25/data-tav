"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export type ManualPanelProps = {
  onGenerateAction: (headers: string, rows: number, orientation: "horizontal" | "vertical") => void
}

export function ManualPanel({ onGenerateAction }: ManualPanelProps) {
  const [headers, setHeaders] = useState("Name, Email, Company, Phone")
  const [rows, setRows] = useState(10)
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal")

  const handleGenerate = () => {
    onGenerateAction(headers, rows, orientation)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Data Generation</CardTitle>
        <CardDescription>Enter headers and generate realistic data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="manual-headers">Headers (comma-separated)</Label>
          <Input
            id="manual-headers"
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleGenerate()
              }
            }}
          />
          <p className="text-xs text-muted-foreground">Example: Name, Email, Company, Phone, Address</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="manual-orientation">Header Orientation</Label>
          <Select value={orientation} onValueChange={(value) => setOrientation(value as "horizontal" | "vertical")}>
            <SelectTrigger id="manual-orientation">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="horizontal">Horizontal (Columns)</SelectItem>
              <SelectItem value="vertical">Vertical (Rows)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="manual-rows">Number of Rows</Label>
          <Input
            id="manual-rows"
            type="number"
            min="1"
            max="10000"
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
          />
        </div>
        <Button onClick={handleGenerate} disabled={!headers.trim()} className="w-full">
          Generate Data
        </Button>
      </CardContent>
    </Card>
  )
}

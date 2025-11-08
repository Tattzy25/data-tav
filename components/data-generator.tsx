"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Wand2 } from "lucide-react"
import { generateData, type ColumnConfig, type DataType } from "@/lib/data-generator"
import { DataGrid } from "./data-grid"

const dataTypes: { value: DataType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email" },
  { value: "date", label: "Date" },
  { value: "boolean", label: "Boolean" },
  { value: "phone", label: "Phone" },
  { value: "address", label: "Address" },
  { value: "name", label: "Name" },
  { value: "company", label: "Company" },
]

export function DataGenerator() {
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { id: "1", name: "Name", type: "name" },
    { id: "2", name: "Email", type: "email" },
    { id: "3", name: "Company", type: "company" },
  ])
  const [rowCount, setRowCount] = useState(10)
  const [generatedData, setGeneratedData] = useState<Record<string, any>[]>([])

  const addColumn = () => {
    const newId = String(Date.now())
    setColumns([...columns, { id: newId, name: `Column ${columns.length + 1}`, type: "text" }])
  }

  const removeColumn = (id: string) => {
    if (columns.length > 1) {
      setColumns(columns.filter((col) => col.id !== id))
    }
  }

  const updateColumn = (id: string, field: "name" | "type", value: string) => {
    setColumns(columns.map((col) => (col.id === id ? { ...col, [field]: value } : col)))
  }

  const handleGenerate = () => {
    const data = generateData(columns, rowCount)
    setGeneratedData(data)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configure Data Structure</CardTitle>
          <CardDescription>Define your columns and data types</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {columns.map((column, index) => (
              <div key={column.id} className="flex items-end gap-3">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`col-name-${column.id}`}>Column Name</Label>
                  <Input
                    id={`col-name-${column.id}`}
                    value={column.name}
                    onChange={(e) => updateColumn(column.id, "name", e.target.value)}
                    placeholder="Enter column name"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`col-type-${column.id}`}>Data Type</Label>
                  <Select
                    value={column.type}
                    onValueChange={(value) => updateColumn(column.id, "type", value as DataType)}
                  >
                    <SelectTrigger id={`col-type-${column.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dataTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeColumn(column.id)}
                  disabled={columns.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button onClick={addColumn} variant="outline" className="w-full bg-transparent">
            <Plus className="w-4 h-4 mr-2" />
            Add Column
          </Button>

          <div className="space-y-2">
            <Label htmlFor="row-count">Number of Rows</Label>
            <Input
              id="row-count"
              type="number"
              min="1"
              max="1000"
              value={rowCount}
              onChange={(e) => setRowCount(Math.max(1, Number.parseInt(e.target.value) || 1))}
            />
          </div>

          <Button onClick={handleGenerate} className="w-full" size="lg">
            <Wand2 className="w-4 h-4 mr-2" />
            Generate Data
          </Button>
        </CardContent>
      </Card>

      {generatedData.length > 0 && <DataGrid data={generatedData} columns={columns} />}
    </div>
  )
}

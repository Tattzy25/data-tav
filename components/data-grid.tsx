"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileJson, FileSpreadsheet, BarChart3, Edit2, Check, X } from "lucide-react"
import { exportToCSV, exportToJSON, type ColumnConfig } from "@/lib/data-generator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface DataGridProps {
  data: Record<string, any>[]
  columns: ColumnConfig[]
}

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function DataGrid({ data: initialData, columns }: DataGridProps) {
  const [data, setData] = useState(initialData)
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; columnId: string } | null>(null)
  const [editValue, setEditValue] = useState("")

  const downloadCSV = () => {
    const csv = exportToCSV(data, columns)
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "data.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadJSON = () => {
    const json = exportToJSON(data)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "data.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const startEdit = (rowIndex: number, columnId: string) => {
    setEditingCell({ rowIndex, columnId })
    setEditValue(String(data[rowIndex][columnId]))
  }

  const saveEdit = () => {
    if (editingCell) {
      const newData = [...data]
      newData[editingCell.rowIndex][editingCell.columnId] = editValue
      setData(newData)
      setEditingCell(null)
    }
  }

  const cancelEdit = () => {
    setEditingCell(null)
    setEditValue("")
  }

  // Prepare chart data for numeric columns
  const numericColumns = columns.filter((col) => col.type === "number")
  const chartData =
    numericColumns.length > 0
      ? data.slice(0, 10).map((row, index) => ({
          name: `Row ${index + 1}`,
          ...numericColumns.reduce((acc, col) => ({ ...acc, [col.name]: row[col.id] }), {}),
        }))
      : []

  // Prepare pie chart data for boolean columns
  const booleanColumns = columns.filter((col) => col.type === "boolean")
  const pieData =
    booleanColumns.length > 0
      ? [
          { name: "True", value: data.filter((row) => row[booleanColumns[0].id] === true).length },
          { name: "False", value: data.filter((row) => row[booleanColumns[0].id] === false).length },
        ]
      : []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Generated Data</CardTitle>
            <CardDescription>{data.length} rows generated</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={downloadCSV} variant="outline" size="sm">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={downloadJSON} variant="outline" size="sm">
              <FileJson className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="table" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="charts">Visualizations</TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="mt-4">
            <div className="rounded-md border overflow-auto max-h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead key={column.id} className="font-semibold">
                        {column.name}
                      </TableHead>
                    ))}
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {columns.map((column) => (
                        <TableCell key={column.id}>
                          {editingCell?.rowIndex === rowIndex && editingCell?.columnId === column.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="h-8"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit()
                                  if (e.key === "Escape") cancelEdit()
                                }}
                              />
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={saveEdit}>
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEdit}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <span>{String(row[column.id])}</span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => startEdit(rowIndex, columns[0].id)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="charts" className="mt-4 space-y-6">
            {numericColumns.length > 0 && chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Numeric Data Distribution</CardTitle>
                  <CardDescription>First 10 rows visualized</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {numericColumns.map((col, index) => (
                        <Bar key={col.id} dataKey={col.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {booleanColumns.length > 0 && pieData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Boolean Distribution - {booleanColumns[0].name}</CardTitle>
                  <CardDescription>True vs False values</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {numericColumns.length === 0 && booleanColumns.length === 0 && (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No numeric or boolean columns to visualize</p>
                    <p className="text-sm mt-2">Add number or boolean type columns to see charts</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link2, Table2, Download, Loader2, AlertCircle, Sparkles } from "lucide-react"
import { Spreadsheet } from "./spreadsheet"
import { generateData, type ColumnConfig, exportToCSV, exportToJSON } from "@/lib/data-generator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"

const STORAGE_KEY = "brigit_ai_data"

export function SpreadsheetApp() {
  const [data, setData] = useState<Record<string, any>[]>([])
  const [columns, setColumns] = useState<ColumnConfig[]>([])
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.data && parsed.columns) {
          setData(parsed.data)
          setColumns(parsed.columns)
          toast({ description: "Previous session restored" })
        }
      }
    } catch (err) {
      console.error("Failed to load saved data:", err)
    }
  }, [toast])

  useEffect(() => {
    if (data.length > 0 && columns.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, columns }))
      } catch (err) {
        console.error("Failed to save data:", err)
      }
    }
  }, [data, columns])

  const handleGenerateFromURL = async () => {
    if (!url) {
      setError("Please enter a valid URL")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("URL must return JSON data")
      }

      const jsonData = await response.json()

      // Handle array of objects
      if (Array.isArray(jsonData) && jsonData.length > 0) {
        const firstItem = jsonData[0]
        const detectedColumns: ColumnConfig[] = Object.keys(firstItem).map((key, index) => ({
          id: String(index),
          name: key,
          type: detectDataType(firstItem[key]),
        }))
        setColumns(detectedColumns)
        setData(jsonData.map((item, idx) => ({ id: String(idx), ...item })))
        toast({ description: `Successfully loaded ${jsonData.length} rows` })
      } else if (typeof jsonData === "object" && jsonData !== null) {
        // Handle single object
        const detectedColumns: ColumnConfig[] = Object.keys(jsonData).map((key, index) => ({
          id: String(index),
          name: key,
          type: detectDataType(jsonData[key]),
        }))
        setColumns(detectedColumns)
        setData([{ id: "0", ...jsonData }])
        toast({ description: "Successfully loaded 1 row" })
      } else {
        throw new Error("Invalid JSON format. Expected an array of objects or a single object.")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch data from URL"
      setError(errorMessage)
      toast({
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleManualGenerate = (headerInput: string, rowCount: number, orientation: "horizontal" | "vertical") => {
    const headers = headerInput
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean)

    if (headers.length === 0) {
      toast({ description: "Please enter at least one header", variant: "destructive" })
      return
    }

    if (rowCount < 1 || rowCount > 10000) {
      toast({ description: "Row count must be between 1 and 10,000", variant: "destructive" })
      return
    }

    const newColumns: ColumnConfig[] = headers.map((header, index) => ({
      id: String(index),
      name: header,
      type: detectDataType(header),
    }))

    const generatedData = generateData(newColumns, rowCount)
    setColumns(newColumns)
    setData(generatedData.map((row, idx) => ({ id: String(idx), ...row })))
    toast({ description: `Generated ${rowCount} rows with ${headers.length} columns` })
  }

  const handleAIGenerate = async (headerInput: string, rowCount: number, context: string, model: string) => {
    const headers = headerInput
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean)

    if (headers.length === 0) {
      toast({ description: "Please enter at least one header", variant: "destructive" })
      return
    }

    if (rowCount < 1 || rowCount > 100) {
      toast({ description: "AI generation supports 1-100 rows", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/generate-ai-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headers, rowCount, context, model }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate data")
      }

      const { data: aiData } = await response.json()

      const newColumns: ColumnConfig[] = headers.map((header, index) => ({
        id: String(index),
        name: header,
        type: detectDataType(header),
      }))

      setColumns(newColumns)
      setData(aiData.map((row: any, idx: number) => ({ id: String(idx), ...row })))
      toast({ description: `AI generated ${aiData.length} rows with realistic data` })
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : "Failed to generate AI data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = (format: "csv" | "json") => {
    if (data.length === 0) {
      toast({ description: "No data to export", variant: "destructive" })
      return
    }

    try {
      const content = format === "csv" ? exportToCSV(data, columns) : exportToJSON(data)
      const blob = new Blob([content], { type: format === "csv" ? "text/csv" : "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `brigit_ai_export_${Date.now()}.${format}`
      a.click()
      URL.revokeObjectURL(url)
      toast({ description: `Exported as ${format.toUpperCase()}` })
    } catch (err) {
      toast({ description: "Failed to export data", variant: "destructive" })
    }
  }

  const handleClearData = () => {
    setData([])
    setColumns([])
    localStorage.removeItem(STORAGE_KEY)
    toast({ description: "Data cleared" })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="url" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
          <TabsTrigger value="url" className="gap-2">
            <Link2 className="w-4 h-4" />
            From URL
          </TabsTrigger>
          <TabsTrigger value="manual" className="gap-2">
            <Table2 className="w-4 h-4" />
            Manual
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Sparkles className="w-4 h-4" />
            AI Generate
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate from URL</CardTitle>
              <CardDescription>Enter any API URL to fetch data and automatically extract headers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="url-input">API URL</Label>
                <Input
                  id="url-input"
                  placeholder="https://jsonplaceholder.typicode.com/users"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    setError(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleGenerateFromURL()
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">Try: https://jsonplaceholder.typicode.com/users</p>
              </div>
              <Button onClick={handleGenerateFromURL} disabled={loading || !url} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  "Fetch & Generate"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="mt-6">
          <ManualGenerator onGenerate={handleManualGenerate} />
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <AIGenerator onGenerate={handleAIGenerate} loading={loading} />
        </TabsContent>
      </Tabs>

      {data.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold">Data Sheet</h2>
              <p className="text-sm text-muted-foreground">
                {data.length} rows × {columns.length} columns
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => handleExport("csv")} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={() => handleExport("json")} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
              <Button onClick={handleClearData} variant="outline" size="sm">
                Clear Data
              </Button>
            </div>
          </div>
          <Spreadsheet data={data} columns={columns} onDataChange={setData} onColumnsChange={setColumns} />
        </div>
      )}
    </div>
  )
}

function ManualGenerator({
  onGenerate,
}: { onGenerate: (headers: string, rows: number, orientation: "horizontal" | "vertical") => void }) {
  const [headers, setHeaders] = useState("")
  const [rows, setRows] = useState(10)
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Data Generation</CardTitle>
        <CardDescription>Enter headers and generate realistic data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="headers">Headers (comma-separated)</Label>
          <Input
            id="headers"
            placeholder="Name, Email, Company, Phone"
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onGenerate(headers, rows, orientation)
              }
            }}
          />
          <p className="text-xs text-muted-foreground">Try: Name, Email, Company, Phone, Address</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="orientation">Header Orientation</Label>
          <Select value={orientation} onValueChange={(v) => setOrientation(v as "horizontal" | "vertical")}>
            <SelectTrigger id="orientation">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="horizontal">Horizontal (Columns)</SelectItem>
              <SelectItem value="vertical">Vertical (Rows)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rows">Number of Rows</Label>
          <Input
            id="rows"
            type="number"
            min="1"
            max="10000"
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
          />
        </div>
        <Button onClick={() => onGenerate(headers, rows, orientation)} disabled={!headers} className="w-full">
          Generate Data
        </Button>
      </CardContent>
    </Card>
  )
}

function AIGenerator({
  onGenerate,
  loading,
}: { onGenerate: (headers: string, rows: number, context: string, model: string) => void; loading: boolean }) {
  const [headers, setHeaders] = useState("")
  const [rows, setRows] = useState(10)
  const [context, setContext] = useState("")
  const [model, setModel] = useState("groq/openai/gpt-oss-120b")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI-Powered Data Generation
        </CardTitle>
        <CardDescription>Use AI to generate highly realistic, context-aware data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ai-headers">Headers (comma-separated)</Label>
          <Input
            id="ai-headers"
            placeholder="Product Name, Price, Category, Description"
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Try: Product Name, Price, Category, Description, Stock Quantity
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ai-context">Context (optional)</Label>
          <Textarea
            id="ai-context"
            placeholder="E.g., Generate data for an e-commerce electronics store with products like laptops, phones, and accessories"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Provide context to make the AI generate more relevant and realistic data
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ai-model">AI Model</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger id="ai-model">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai/gpt-5-mini-2025-08-07">OpenAI GPT-5 Mini</SelectItem>
              <SelectItem value="openai/gpt-5-nano-2025-08-07">OpenAI GPT-5 Nano</SelectItem>
              <SelectItem value="groq/qwen-qwq-32b">Groq Qwen QWQ 32B</SelectItem>
              <SelectItem value="groq/openai/gpt-oss-120b">Groq OpenAI GPT OSS 120B</SelectItem>
              <SelectItem value="groq/openai/gpt-oss-20b">Groq OpenAI GPT OSS 20B</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ai-rows">Number of Rows (max 100)</Label>
          <Input
            id="ai-rows"
            type="number"
            min="1"
            max="100"
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
          />
        </div>
        <Button onClick={() => onGenerate(headers, rows, context, model)} disabled={!headers || loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate with AI
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

function detectDataType(
  value: any,
): "text" | "number" | "email" | "date" | "boolean" | "phone" | "address" | "name" | "company" {
  if (typeof value === "boolean") return "boolean"
  if (typeof value === "number") return "number"
  if (typeof value === "string") {
    const lower = value.toLowerCase()

    // Email detection
    if (value.includes("@") && value.includes(".")) return "email"

    // Phone detection
    if (/^\+?[\d\s\-()]+$/.test(value) && value.replace(/\D/g, "").length >= 10) return "phone"

    // Date detection
    if (!isNaN(Date.parse(value)) && /\d{4}/.test(value)) return "date"

    // Address detection (contains street indicators)
    if (/(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd)/i.test(value)) return "address"

    // Name detection (header name contains name-related words)
    if (/(name|firstname|lastname|fullname)/i.test(lower)) return "name"

    // Company detection
    if (/(company|organization|business|corp|inc|ltd)/i.test(lower)) return "company"
  }
  return "text"
}

"use client"

import { useEffect, useRef, useState } from "react"
import { Spreadsheet } from "./shared/spreadsheet/index"
import { generateData, type ColumnConfig } from "@/lib/data-generator"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDataWorkbench } from "@/components/data-workbench/use-data-workbench"
import { ModelConfigPanel } from "@/components/data-workbench/model-config-panel"
import { StepIndicator } from "@/components/data-workbench/step-indicator"
import { SourceTabs } from "@/components/data-workbench/source-tabs"
import type { AIConfig } from "@/components/ui/popover"

const DEFAULT_MODEL_ID = "openai/gpt-oss-120b"

export function SpreadsheetApp() {
  const { toast } = useToast()
  const { data, columns, setData, setColumns, exportData, clearData, importFile, hasData } = useDataWorkbench({
    onNotifyAction: toast,
  })

  const [url, setUrl] = useState("")
  const [headers, setHeaders] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [model, setModel] = useState(DEFAULT_MODEL_ID)
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null)
  const [activeTab, setActiveTab] = useState("url")

  const fileInputRef = useRef<HTMLInputElement>(null)

  const resolvedModel = aiConfig?.modelId || model || ""
  const modelReady = Boolean(resolvedModel)
  const currentStep = hasData ? 3 : modelReady ? 2 : 1
  const steps = [
    { label: "Model", description: "Connect or pick a provider" },
    { label: "Source", description: "Define fields & headers" },
    { label: "Preview", description: "Edit, export, share" },
  ]

  // Keyboard shortcuts for power users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "e") {
        e.preventDefault()
        exportData("csv")
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "E") {
        e.preventDefault()
        exportData("json")
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "i") {
        e.preventDefault()
        fileInputRef.current?.click()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        if (hasData) {
          setShowClearDialog(true)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [exportData, hasData])

  const handleGenerateFromURL = async () => {
    if (!url) {
      setError("Please enter a valid URL")
      return
    }

    if (!resolvedModel) {
      setError("Please select an AI model first")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const prompt = `Generate sample data for the following API endpoint: ${url}${
        headers ? `\n\nUse these column headers: ${headers}` : ""
      }\n\nGenerate 10 rows of realistic sample data in JSON format.`

      const response = await fetch("/api/generate-ai-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          model: resolvedModel,
          maxTokens: aiConfig?.maxTokens || 1000,
          temperature: aiConfig?.temperature || 0.7,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate data: ${response.status}`)
      }

      const result = await response.json()

      let generatedData
      try {
        const jsonMatch =
          result.data.match(/```json\s*([\s\S]*?)\s*```/) ||
          result.data.match(/```\s*([\s\S]*?)\s*```/) ||
          result.data.match(/(\[[\s\S]*\])/)

        const jsonString = jsonMatch ? jsonMatch[1] : result.data
        generatedData = JSON.parse(jsonString.trim())
      } catch (parseError) {
        throw new Error("Failed to parse generated data as JSON")
      }

      if (Array.isArray(generatedData) && generatedData.length > 0) {
        const firstItem = generatedData[0]
        const detectedColumns: ColumnConfig[] = Object.keys(firstItem).map((key, index) => ({
          id: String(index),
          name: key,
          type: detectDataType(firstItem[key]),
        }))
        setColumns(detectedColumns)
        setData(generatedData.map((item, idx) => ({ id: String(idx), ...item })))
        toast({ description: `Generated ${generatedData.length} rows` })
      } else {
        throw new Error("Generated data is not a valid array")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate data from URL"
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
    if (!resolvedModel) {
      toast({ description: "Select an AI model before generating.", variant: "destructive" })
      return
    }

    const manualHeaders = headerInput
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean)

    if (manualHeaders.length === 0) {
      toast({ description: "Please enter at least one header", variant: "destructive" })
      return
    }

    if (rowCount < 1 || rowCount > 10000) {
      toast({ description: "Row count must be between 1 and 10,000", variant: "destructive" })
      return
    }

    const newColumns: ColumnConfig[] = manualHeaders.map((header, index) => ({
      id: String(index),
      name: header,
      type: detectDataType(header),
    }))

    const generatedData = generateData(newColumns, rowCount)
    setColumns(newColumns)
    setData(generatedData.map((row, idx) => ({ id: String(idx), ...row })))
    toast({ description: `Generated ${rowCount} rows with ${manualHeaders.length} columns` })
  }

  const handleAIGenerate = async (headerInput: string, rowCount: number, context: string, _model: string) => {
    const aiHeaders = headerInput
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean)

    if (aiHeaders.length === 0) {
      toast({ description: "Please enter at least one header", variant: "destructive" })
      return
    }

    if (rowCount < 1 || rowCount > 100) {
      toast({ description: "AI generation supports 1-100 rows", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const payload: Record<string, unknown> = {
        headers: aiHeaders,
        rowCount,
        context,
        model: resolvedModel,
      }

      if (aiConfig) {
        payload.provider = aiConfig.provider || null
        payload.apiKey = aiConfig.apiKey || null
        payload.maxTokens = aiConfig.maxTokens
        payload.temperature = aiConfig.temperature
        payload.reasoning = aiConfig.reasoning
      }

      const response = await fetch("/api/generate-ai-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate data")
      }

      const { data: aiData } = await response.json()

      const newColumns: ColumnConfig[] = aiHeaders.map((header, index) => ({
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

  const handleClearData = () => {
    clearData()
    setShowClearDialog(false)
  }

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    void importFile(file)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <input ref={fileInputRef} type="file" accept=".csv,.json" onChange={handleImportFile} className="hidden" />

      <ModelConfigPanel
        model={model}
        onModelChangeAction={setModel}
        aiConfig={aiConfig}
        onConfigChangeAction={setAiConfig}
      />

      <StepIndicator steps={steps} currentStep={currentStep} />

      <SourceTabs
        value={activeTab}
        onValueChangeAction={setActiveTab}
        url={url}
        headers={headers}
        loading={loading}
        error={error}
        resolvedModel={resolvedModel}
        onUrlChangeAction={(value) => {
          setUrl(value)
          setError(null)
        }}
        onHeadersChangeAction={setHeaders}
        onUrlGenerateAction={handleGenerateFromURL}
        onManualGenerateAction={handleManualGenerate}
        onAiGenerateAction={handleAIGenerate}
      />

      <div className="space-y-4">
        {hasData ? (
          <div className="space-y-3 rounded-lg border bg-muted/40 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Data Sheet</h2>
                <p className="text-sm text-muted-foreground">
                  {data.length} rows × {columns.length} columns
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 rounded-lg border bg-muted/40 p-4 text-center">
            <h2 className="text-2xl font-bold">Data Sheet</h2>
            <p className="text-sm text-muted-foreground">No data yet. Use the steps above to generate or import data.</p>
          </div>
        )}
        <Spreadsheet
          data={data}
          columns={columns}
          onDataChange={setData}
          onColumnsChange={setColumns}
          onImportData={() => fileInputRef.current?.click()}
          onExportCsv={() => exportData("csv")}
          onExportJson={() => exportData("json")}
          onClearData={() => setShowClearDialog(true)}
        />
      </div>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your data and cannot be undone. Your session will also be cleared from
              storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData}>Clear Data</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function detectDataType(
  value: any,
): "text" | "number" | "email" | "date" | "boolean" | "phone" | "address" | "name" | "company" {
  if (typeof value === "boolean") return "boolean"
  if (typeof value === "number") return "number"
  if (typeof value === "string") {
    const lower = value.toLowerCase()

    if (value.includes("@") && value.includes(".")) return "email"

    if (/^\+?[\d\s\-()]+$/.test(value) && value.replace(/\D/g, "").length >= 10) return "phone"

    if (!isNaN(Date.parse(value)) && /\d{4}/.test(value)) return "date"

    if (/(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd)/i.test(value)) return "address"

    if (/(name|firstname|lastname|fullname)/i.test(lower)) return "name"

    if (/(company|organization|business|corp|inc|ltd)/i.test(lower)) return "company"
  }
  return "text"
}

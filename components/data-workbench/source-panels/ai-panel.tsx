"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles } from "lucide-react"

export type AiPanelProps = {
  model: string
  loading: boolean
  onGenerateAction: (headers: string, rows: number, context: string, model: string) => void
}

export function AiPanel({ model, loading, onGenerateAction }: AiPanelProps) {
  const [headers, setHeaders] = useState("Product Name, Price, Category, Description")
  const [context, setContext] = useState("")
  const [rows, setRows] = useState(10)

  const handleGenerate = () => {
    onGenerateAction(headers, rows, context, model)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI-Powered Data Generation
        </CardTitle>
        <CardDescription>Use AI to generate highly realistic, context-aware data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ai-headers">Headers (comma-separated)</Label>
          <Input id="ai-headers" value={headers} onChange={(e) => setHeaders(e.target.value)} />
          <p className="text-xs text-muted-foreground">Try: SKU, Product Name, Price, Stock, Category</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ai-context">Context (optional)</Label>
          <Textarea
            id="ai-context"
            rows={3}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="E.g., Generate data for an e-commerce electronics store"
          />
          <p className="text-xs text-muted-foreground">Provide context to make the AI more accurate.</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Using model: <span className="font-mono break-all">{model || "Select a model"}</span>
        </p>
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
        <Button onClick={handleGenerate} disabled={!headers.trim() || loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating with AI...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate with AI
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link2, Table2, Sparkles } from "lucide-react"
import { FromUrlPanel } from "@/components/data-workbench/source-panels/from-url-panel"
import { ManualPanel } from "@/components/data-workbench/source-panels/manual-panel"
import { AiPanel } from "@/components/data-workbench/source-panels/ai-panel"

export type ManualGenerateHandler = (headers: string, rows: number, orientation: "horizontal" | "vertical") => void
export type AiGenerateHandler = (headers: string, rows: number, context: string, model: string) => void

export type SourceTabsProps = {
  value: string
  onValueChangeAction: (value: string) => void
  url: string
  headers: string
  loading: boolean
  error: string | null
  resolvedModel: string
  onUrlChangeAction: (value: string) => void
  onHeadersChangeAction: (value: string) => void
  onUrlGenerateAction: () => void
  onManualGenerateAction: ManualGenerateHandler
  onAiGenerateAction: AiGenerateHandler
}

export function SourceTabs({
  value,
  onValueChangeAction,
  url,
  headers,
  loading,
  error,
  resolvedModel,
  onUrlChangeAction,
  onHeadersChangeAction,
  onUrlGenerateAction,
  onManualGenerateAction,
  onAiGenerateAction,
}: SourceTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChangeAction} className="w-full">
      <TabsList className="mx-auto grid w-full max-w-3xl grid-cols-3">
        <TabsTrigger value="url" className="gap-2">
          <Link2 className="h-4 w-4" />
          From URL
        </TabsTrigger>
        <TabsTrigger value="manual" className="gap-2">
          <Table2 className="h-4 w-4" />
          Manual
        </TabsTrigger>
        <TabsTrigger value="ai" className="gap-2">
          <Sparkles className="h-4 w-4" />
          AI Generate
        </TabsTrigger>
      </TabsList>

      <TabsContent value="url" className="mt-6">
        <FromUrlPanel
          url={url}
          headers={headers}
          error={error}
          loading={loading}
          resolvedModel={resolvedModel}
          onUrlChangeAction={onUrlChangeAction}
          onHeadersChangeAction={onHeadersChangeAction}
          onSubmitAction={onUrlGenerateAction}
        />
      </TabsContent>

      <TabsContent value="manual" className="mt-6">
        <ManualPanel onGenerateAction={onManualGenerateAction} />
      </TabsContent>

      <TabsContent value="ai" className="mt-6">
        <AiPanel model={resolvedModel} loading={loading} onGenerateAction={onAiGenerateAction} />
      </TabsContent>
    </Tabs>
  )
}

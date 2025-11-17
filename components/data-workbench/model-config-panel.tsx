"use client"

import { Info, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ModelSelect } from "@/components/ui/model-select"
import { AIConfigPopover, type AIConfig } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export type ModelConfigPanelProps = {
  model: string
  onModelChangeAction: (value: string) => void
  aiConfig: AIConfig | null
  onConfigChangeAction: (config: AIConfig | null) => void
}

export function ModelConfigPanel({ model, onModelChangeAction, aiConfig, onConfigChangeAction }: ModelConfigPanelProps) {
  const resolvedModel = aiConfig?.modelId || model
  const statusLabel = resolvedModel ? "Model ready" : "Model required"
  const statusVariant = resolvedModel ? "default" : "destructive"

  return (
    <Card className="border-2 border-primary/20 bg-muted/40">
      <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Step 1 · Select model</p>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <ShieldCheck className="h-5 w-5 text-primary" />
            AI Data Engine
          </div>
          <p className="text-sm text-muted-foreground">
            Choose a provider above or connect your own custom endpoint. We only store encrypted tokens locally.
          </p>
          <Badge variant={statusVariant === "default" ? "outline" : "destructive"}>{statusLabel}</Badge>
        </div>

        <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-[320px]">
          <ModelSelect
            value={model}
            onValueChange={onModelChangeAction}
            className="h-11 min-w-[260px] text-sm md:text-base"
            placeholder="Select a model..."
          />
          <div className="flex items-center gap-2">
            <AIConfigPopover onConfigChange={onConfigChangeAction} />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-sm">
                  Configure custom providers, API keys, temperature, and reasoning tokens. Settings are stored only in
                  your browser.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {resolvedModel && (
            <p className="text-xs text-muted-foreground">
              Active: <span className="font-mono text-foreground">{resolvedModel}</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

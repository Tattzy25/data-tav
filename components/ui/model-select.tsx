"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type ModelOption = {
  value: string
  label: string
  provider?: string
}

export type ModelSelectProps = {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
}

/**
 * Reusable AI model combobox built on shadcn/ui Command + Popover.
 *
 * Can be used in a controlled way (value + onValueChange) or uncontrolled.
 */
export function ModelSelect({
  value: controlledValue,
  onValueChange,
  placeholder = "Select model...",
  className,
}: ModelSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState("")
  const [options, setOptions] = React.useState<ModelOption[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false

    async function loadModels() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/model-registry")
        if (!response.ok) {
          throw new Error(`Failed to load models (${response.status})`)
        }

        const payload = await response.json()
        if (!cancelled) {
          const models: ModelOption[] = (payload.models || []).map((model: any) => ({
            value: model.id,
            label: model.label,
            provider: model.provider,
          }))
          setOptions(models)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load AI models")
          setOptions([])
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadModels()
    return () => {
      cancelled = true
    }
  }, [])

  const value = controlledValue ?? internalValue

  const handleSelect = (currentValue: string) => {
    const nextValue = currentValue === value ? "" : currentValue

    if (controlledValue === undefined) {
      setInternalValue(nextValue)
    }

    onValueChange?.(nextValue)
    setOpen(false)
  }

  const selectedLabel = value
    ? options.find((model) => model.value === value)?.label ?? value
    : null

  const buttonLabel = (() => {
    if (isLoading) {
      return "Loading models..."
    }
    if (error) {
      return "Models unavailable"
    }
    return selectedLabel ?? placeholder
  })()

  const isDisabled = isLoading || !!error || options.length === 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={isDisabled}
          className={cn("w-[260px] justify-between", className)}
        >
          {buttonLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0">
        <Command>
          <CommandInput placeholder="Search model..." className="h-9" />
          <CommandList>
            <CommandEmpty>
              {error ? error : isLoading ? "Loading models..." : "No models configured."}
            </CommandEmpty>
            <CommandGroup>
              {options.map((model) => (
                <CommandItem key={model.value} value={model.value} onSelect={handleSelect}>
                  <div className="flex flex-col">
                    <span>{model.label}</span>
                    {model.provider && (
                      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {model.provider}
                      </span>
                    )}
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === model.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Backwards-compatible export for any existing usages.
export function ComboboxDemo(props: ModelSelectProps) {
  return <ModelSelect {...props} />
}

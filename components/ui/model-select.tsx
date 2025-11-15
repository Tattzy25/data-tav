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

// AI model options derived from the AI generator models
const aiModels = [
  {
    value: "openai/gpt-5-mini-2025-08-07",
    label: "OpenAI GPT-5 Mini",
  },
  {
    value: "openai/gpt-5-nano-2025-08-07",
    label: "OpenAI GPT-5 Nano",
  },
  {
    value: "groq/qwen-qwq-32b",
    label: "Groq Qwen QWQ 32B",
  },
  {
    value: "groq/openai/gpt-oss-120b",
    label: "Groq OpenAI GPT OSS 120B",
  },
  {
    value: "groq/openai/gpt-oss-20b",
    label: "Groq OpenAI GPT OSS 20B",
  },
]

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
    ? aiModels.find((model) => model.value === value)?.label ?? value
    : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[260px] justify-between", className)}
        >
          {selectedLabel ?? placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0">
        <Command>
          <CommandInput placeholder="Search model..." className="h-9" />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {aiModels.map((model) => (
                <CommandItem
                  key={model.value}
                  value={model.value}
                  onSelect={handleSelect}
                >
                  {model.label}
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

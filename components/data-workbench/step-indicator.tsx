"use client"

import { cn } from "@/lib/utils"

export type Step = {
  label: string
  description?: string
}

export type StepIndicatorProps = {
  steps: Step[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card/60 p-4 shadow-sm">
      <div className="text-sm font-medium text-muted-foreground">Progress</div>
      <div className="grid gap-3 md:grid-cols-3">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isActive = currentStep === stepNumber
          const isCompleted = currentStep > stepNumber

          return (
            <div
              key={step.label}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 transition",
                isActive && "border-primary bg-primary/10",
                isCompleted && "border-green-500 bg-green-500/10 text-green-600",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold",
                  isCompleted && "border-green-500 bg-green-500 text-white",
                  isActive && "border-primary bg-primary text-primary-foreground",
                )}
              >
                {isCompleted ? "✓" : stepNumber}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold">{step.label}</p>
                {step.description && <p className="text-xs text-muted-foreground">{step.description}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

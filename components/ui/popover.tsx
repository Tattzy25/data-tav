"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        asChild
        {...props}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.3, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: [0, -4, 4, -3, 3, -2, 2, -1, 1, 0] }}
          exit={{
            opacity: 0,
            scale: 0.8,
            y: 10,
            x: [0, -3, 3, -2, 2, -1, 1, 0],
            transition: {
              opacity: { duration: 0.25 },
              scale: { duration: 0.25, ease: "easeIn" },
              y: { duration: 0.25, ease: "easeIn" },
              x: {
                duration: 0.4,
                ease: "easeOut",
                times: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 1],
              },
            },
          }}
          transition={{
            opacity: { duration: 0.2 },
            scale: { duration: 0.6, type: "spring", damping: 12, stiffness: 400, mass: 0.8 },
            y: { duration: 0.5, type: "spring", damping: 10, stiffness: 300, mass: 0.9 },
            x: {
              duration: 0.7,
              delay: 0.2,
              ease: "easeOut",
              times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1],
            },
          }}
          className={cn(
            "bg-popover text-popover-foreground z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
            className,
          )}
        >
          {children}
        </motion.div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export type AIConfig = {
  apiKey: string;
  provider: string;
  modelId: string;
  maxTokens: number;
  temperature: number;
  reasoning: "low" | "medium" | "high";
};

export const AI_CONFIG_STORAGE_KEY = "brigit_ai_model_config";

const defaultConfig: AIConfig = {
  apiKey: "",
  provider: "",
  modelId: "",
  maxTokens: 5000,
  temperature: 1,
  reasoning: "medium",
};

type AIConfigPopoverProps = {
  onConfigChange?: (config: AIConfig | null) => void;
};

function AIConfigPopover({ onConfigChange }: AIConfigPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [config, setConfig] = React.useState<AIConfig>(defaultConfig);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(AI_CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const merged: AIConfig = {
          ...defaultConfig,
          ...parsed,
          maxTokens: Number(parsed.maxTokens) || defaultConfig.maxTokens,
          temperature:
            typeof parsed.temperature === "number" ? parsed.temperature : defaultConfig.temperature,
          reasoning: (parsed.reasoning as AIConfig["reasoning"]) || defaultConfig.reasoning,
        };
        setConfig(merged);
        onConfigChange?.(merged);
      }
    } catch {
      // ignore malformed storage
    }
  }, [onConfigChange]);

  const updateField = <K extends keyof AIConfig>(key: K, value: AIConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const sanitized: AIConfig = {
      ...config,
      maxTokens:
        !Number.isFinite(config.maxTokens) || config.maxTokens <= 0
          ? defaultConfig.maxTokens
          : Math.floor(config.maxTokens),
      temperature:
        typeof config.temperature !== "number" ? defaultConfig.temperature : config.temperature,
    };

    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(sanitized));
      } catch {
        // ignore storage errors
      }
    }

    setConfig(sanitized);
    onConfigChange?.(sanitized);
    setOpen(false);
  };

  const handleDelete = () => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(AI_CONFIG_STORAGE_KEY);
      } catch {
        // ignore storage errors
      }
    }

    setConfig(defaultConfig);
    onConfigChange?.(null);
    setOpen(false);
  };

  const reasoningLabels: Record<AIConfig["reasoning"], string> = {
    low: "Low",
    medium: "Med",
    high: "High",
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="px-4 py-2 text-sm md:text-base">
          Custom API
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0">
        <Card className="rounded-xl border shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Custom API</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Configure provider, keys, and model tuning for this data session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4 pt-0 pb-2">
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="model-config-api-key" className="text-sm md:text-base">
                API Key
              </Label>
              <Input
                id="model-config-api-key"
                type="password"
                value={config.apiKey}
                onChange={(e) => updateField("apiKey", e.target.value)}
                placeholder="sk-..."
                className="h-10 text-sm md:text-base"
              />
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="model-config-provider" className="text-sm md:text-base">
                Provider
              </Label>
              <Input
                id="model-config-provider"
                value={config.provider}
                onChange={(e) => updateField("provider", e.target.value)}
                placeholder="e.g. openai, groq"
                className="h-10 text-sm md:text-base"
              />
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="model-config-model-id" className="text-sm md:text-base">
                Model ID
              </Label>
              <Input
                id="model-config-model-id"
                value={config.modelId}
                onChange={(e) => updateField("modelId", e.target.value)}
                placeholder="e.g. gpt-4.1"
                className="h-10 text-sm md:text-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="model-config-max-tokens" className="text-sm md:text-base">
                  Max Completion Tokens
                </Label>
                <Input
                  id="model-config-max-tokens"
                  type="number"
                  min={1}
                  value={Number.isFinite(config.maxTokens) ? config.maxTokens : ""}
                  onChange={(e) =>
                    updateField("maxTokens", Number(e.target.value) || defaultConfig.maxTokens)
                  }
                  className="h-10 text-sm md:text-base"
                />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="model-config-temperature" className="text-sm md:text-base">
                  Temperature
                </Label>
                <Input
                  id="model-config-temperature"
                  type="number"
                  step="0.1"
                  min={0}
                  max={2}
                  value={config.temperature}
                  onChange={(e) =>
                    updateField(
                      "temperature",
                      parseFloat(e.target.value) || defaultConfig.temperature,
                    )
                  }
                  className="h-10 text-sm md:text-base"
                />
              </div>
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <Label className="text-sm md:text-base">Reasoning</Label>
              <div className="flex gap-2">
                {(Object.keys(reasoningLabels) as AIConfig["reasoning"][]).map((level) => (
                  <Button
                    key={level}
                    type="button"
                    variant={config.reasoning === level ? "default" : "outline"}
                    size="sm"
                    className="flex-1 text-xs md:text-sm"
                    onClick={() => updateField("reasoning", level)}
                  >
                    {reasoningLabels[level]}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between pt-2">
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Delete
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, AIConfigPopover };

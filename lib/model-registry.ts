import fs from "node:fs"
import path from "node:path"

import { z } from "zod"

const ModelDefinitionSchema = z.object({
  /**
   * Identifier exposed to the UI, e.g. "groq/llama-3.1-70b".
   */
  id: z.string().min(1),
  /**
   * Human friendly label for dropdowns.
   */
  label: z.string().min(1),
  /**
   * Upstream provider identifier (groq, openai, mcp, etc).
   */
  provider: z.string().min(1),
  /**
   * Optional backend model name when it differs from the exposed id.
   */
  model: z.string().min(1).optional(),
  /**
   * Optional fully-qualified endpoint to hit for proxy/MCP connectors.
   */
  endpoint: z.string().url().optional(),
  /**
   * Default temperature override for this model.
   */
  temperature: z.number().min(0).max(2).optional(),
  /**
   * Default max completion tokens for this model.
   */
  maxTokens: z.number().int().positive().optional(),
})

const RegistrySchema = z.array(ModelDefinitionSchema).min(1, "AI model registry must include at least one model")

export type ModelDefinition = z.infer<typeof ModelDefinitionSchema>

let cachedRegistry: ModelDefinition[] | null = null

/**
 * Hardcoded fallback model registry for production deployments
 * Used when no registry file or environment variable is configured
 */
const FALLBACK_MODEL_REGISTRY: ModelDefinition[] = [
  {
    id: "groq/llama-3.3-70b-versatile",
    label: "Llama 3.3 70B (Groq)",
    provider: "groq",
    model: "llama-3.3-70b-versatile",
    maxTokens: 4096,
    temperature: 0.4,
  },
  {
    id: "groq/llama-3.1-70b-versatile",
    label: "Llama 3.1 70B (Groq)",
    provider: "groq",
    model: "llama-3.1-70b-versatile",
    maxTokens: 2048,
    temperature: 0.4,
  },
]

function resolveRegistrySource(): string | null {
  // Try file-based registry first
  if (process.env.AI_MODEL_REGISTRY_FILE) {
    try {
      const registryPath = process.env.AI_MODEL_REGISTRY_FILE
      const absolutePath = path.isAbsolute(registryPath)
        ? registryPath
        : path.join(process.cwd(), registryPath)

      if (fs.existsSync(absolutePath)) {
        return fs.readFileSync(absolutePath, "utf8")
      }
      console.warn(
        `AI_MODEL_REGISTRY_FILE points to non-existent file: ${absolutePath}. Falling back to default registry.`,
      )
    } catch (error) {
      console.warn(`Failed to read AI_MODEL_REGISTRY_FILE:`, error)
    }
  }

  // Try environment variable registry
  if (process.env.AI_MODEL_REGISTRY) {
    return process.env.AI_MODEL_REGISTRY
  }

  // Return null to use fallback
  return null
}

function parseRegistry(raw: string): ModelDefinition[] {
  const parsed = JSON.parse(raw)
  return RegistrySchema.parse(parsed)
}

export function listModelDefinitions(): ModelDefinition[] {
  if (cachedRegistry) {
    return cachedRegistry
  }

  const raw = resolveRegistrySource()

  // Use hardcoded fallback if no registry is configured
  if (!raw) {
    console.warn(
      "No AI model registry configured (AI_MODEL_REGISTRY or AI_MODEL_REGISTRY_FILE). Using fallback registry.",
    )
    cachedRegistry = FALLBACK_MODEL_REGISTRY
    return cachedRegistry
  }

  try {
    cachedRegistry = parseRegistry(raw)
    return cachedRegistry
  } catch (error) {
    console.error("Failed to parse AI model registry, using fallback:", error)
    cachedRegistry = FALLBACK_MODEL_REGISTRY
    return cachedRegistry
  }
}

export function getModelDefinition(modelId: string): ModelDefinition {
  const registry = listModelDefinitions()
  const definition = registry.find((model) => model.id === modelId)

  if (!definition) {
    throw new Error(`Model \"${modelId}\" is not registered. Update AI_MODEL_REGISTRY to include it.`)
  }

  return definition
}

export function resetModelRegistryCache() {
  cachedRegistry = null
}
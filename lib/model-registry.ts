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
  /**
   * Optional capabilities and integration flags for this model.
   * These are used by the UI / API layer to decide
   * whether to enable browser search, MCP, etc.
   */
  capabilities: z
    .object({
      /** Built-in browser search tools available for this model. */
      browserSearch: z
        .object({
          enabled: z.boolean().default(false),
        })
        .optional(),
      /** Code interpreter / sandbox availability. */
      codeInterpreter: z
        .object({
          enabled: z.boolean().default(false),
        })
        .optional(),
      /** MCP server wiring (e.g. Tavily). */
      mcp: z
        .object({
          tavily: z
            .object({
              enabled: z.boolean().default(false),
            })
            .optional(),
        })
        .optional(),
      /** Whether the model supports function calling tools. */
      functions: z
        .object({
          enabled: z.boolean().default(false),
        })
        .optional(),
      /** Default streaming preference for this model. */
      modes: z
        .object({
          streamDefault: z.boolean().default(true),
        })
        .optional(),
      /** Optional default random seed. */
      seed: z.number().int().optional(),
      /** Optional default top_p value. */
      topP: z.number().min(0).max(1).optional(),
    })
    .optional(),
})

const RegistrySchema = z.array(ModelDefinitionSchema).min(1, "AI model registry must include at least one model")

export type ModelDefinition = z.infer<typeof ModelDefinitionSchema>

let cachedRegistry: ModelDefinition[] | null = null

function resolveRegistrySource(): string {
  if (process.env.AI_MODEL_REGISTRY_FILE) {
    const registryPath = process.env.AI_MODEL_REGISTRY_FILE
    const absolutePath = path.isAbsolute(registryPath)
      ? registryPath
      : path.join(process.cwd(), registryPath)

    return fs.readFileSync(absolutePath, "utf8")
  }

  if (process.env.AI_MODEL_REGISTRY) {
    return process.env.AI_MODEL_REGISTRY
  }

  throw new Error(
    "AI model registry is not configured. Set AI_MODEL_REGISTRY or AI_MODEL_REGISTRY_FILE to continue.",
  )
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
  cachedRegistry = parseRegistry(raw)
  return cachedRegistry
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
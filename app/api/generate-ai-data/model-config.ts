import { getModelDefinition, listModelDefinitions, type ModelDefinition } from "@/lib/model-registry"

export function requireModelDefinition(model: unknown): ModelDefinition {
  if (typeof model !== "string" || !model.trim()) {
    throw new Error("Model is required")
  }

  return getModelDefinition(model)
}

export function listAllowedModels(): ModelDefinition[] {
  return listModelDefinitions()
}

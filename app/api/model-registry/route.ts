import { listAllowedModels } from "../generate-ai-data/model-config"

/**
 * GET /api/model-registry
 * Returns the list of available AI models
 */
export async function GET() {
  try {
    const models = listAllowedModels()

    if (!models || models.length === 0) {
      return Response.json(
        {
          error: "No AI models are currently available.",
          suggestion:
            "Configure AI_MODEL_REGISTRY_FILE or AI_MODEL_REGISTRY environment variable, or the system will use fallback models.",
          models: [],
        },
        { status: 200 },
      )
    }

    return Response.json({ models })
  } catch (error) {
    console.error("Model registry error:", error)
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load model registry. Using fallback models.",
        suggestion: "Check your AI_MODEL_REGISTRY or AI_MODEL_REGISTRY_FILE configuration.",
        models: [],
      },
      { status: 200 }, // Return 200 with empty models array rather than 500
    )
  }
}
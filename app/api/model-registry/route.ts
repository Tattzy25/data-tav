import { listAllowedModels } from "../generate-ai-data/model-config"

export async function GET() {
  try {
    const models = listAllowedModels()
    return Response.json({ models })
  } catch (error) {
    console.error("Model registry error:", error)
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Model registry is not configured. Set AI_MODEL_REGISTRY or AI_MODEL_REGISTRY_FILE.",
      },
      { status: 500 },
    )
  }
}
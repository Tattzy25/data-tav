import { listAllowedModels } from "../generate-ai-data/model-config"

/**
 * GET /api/health
 * Health check endpoint for monitoring and load balancers
 * Returns system status and configuration state
 */
export async function GET() {
  const healthStatus: {
    status: string
    timestamp: string
    version: string
    checks: {
      modelRegistry: {
        status: string
        modelCount: number
        error?: string
      }
      environment: {
        status: string
        hasGroqKey: boolean
        hasOpenAIKey: boolean
      }
    }
  } = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
    checks: {
      modelRegistry: {
        status: "unknown",
        modelCount: 0,
      },
      environment: {
        status: "ok",
        hasGroqKey: !!process.env.GROQ_API_KEY,
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      },
    },
  }

  // Check model registry
  try {
    const models = listAllowedModels()
    healthStatus.checks.modelRegistry = {
      status: models.length > 0 ? "ok" : "warning",
      modelCount: models.length,
    }
  } catch (error) {
    healthStatus.checks.modelRegistry = {
      status: "error",
      modelCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    }
    healthStatus.status = "degraded"
  }

  // Overall health status
  if (
    healthStatus.checks.modelRegistry.status === "error" ||
    (!healthStatus.checks.environment.hasGroqKey && !healthStatus.checks.environment.hasOpenAIKey)
  ) {
    healthStatus.status = "unhealthy"
  } else if (
    healthStatus.checks.modelRegistry.status === "warning" ||
    healthStatus.checks.modelRegistry.modelCount === 0
  ) {
    healthStatus.status = "degraded"
  }

  const statusCode = healthStatus.status === "healthy" ? 200 : healthStatus.status === "degraded" ? 200 : 503

  return Response.json(healthStatus, { status: statusCode })
}

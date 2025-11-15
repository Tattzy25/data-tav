import { checkRateLimit, getClientIp } from "./rate-limit"
import { requireModelDefinition } from "./model-config"
import { sanitizeContext, buildPromptPayload } from "./prompt-builder"
import { generateWithGroq } from "./ai-provider-groq"
import { generateWithOpenAI } from "./ai-provider-openai"
import { extractJsonArrayFromText } from "./json-extractor"

type GenerateRequestBody = {
  headers: unknown
  rowCount: unknown
  context?: unknown
  model?: string
  provider?: string
  apiKey?: string
  maxTokens?: unknown
  temperature?: unknown
  reasoning?: unknown
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)

    if (!checkRateLimit(ip, 10, 60000)) {
      return Response.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 },
      )
    }

    const {
      headers,
      rowCount,
      context,
      model,
      provider,
      apiKey,
      maxTokens,
      temperature,
      reasoning,
    }: GenerateRequestBody = await request.json()

    // Validate and sanitize inputs
    if (!headers || !Array.isArray(headers) || headers.length === 0) {
      return Response.json({ error: "Headers are required" }, { status: 400 })
    }

    if (headers.length > 50) {
      return Response.json({ error: "Maximum 50 headers allowed" }, { status: 400 })
    }

    const sanitizedHeaders = (headers as unknown[])
      .map((h) => String(h).trim())
      .filter((h) => h.length > 0)

    if (sanitizedHeaders.length === 0) {
      return Response.json({ error: "Valid headers are required" }, { status: 400 })
    }

    const numericRowCount = typeof rowCount === "number" ? rowCount : Number(rowCount)

    if (!numericRowCount || numericRowCount < 1 || numericRowCount > 100) {
      return Response.json({ error: "Row count must be between 1 and 100" }, { status: 400 })
    }

    const sanitizedContext = sanitizeContext(context)

    let modelDefinition
    try {
      modelDefinition = requireModelDefinition(model)
    } catch (modelError) {
      return Response.json(
        { error: modelError instanceof Error ? modelError.message : "Model is not registered" },
        { status: 400 },
      )
    }

    if (provider && provider.toLowerCase() !== modelDefinition.provider.toLowerCase()) {
      return Response.json(
        {
          error: `Provider mismatch. Expected \"${modelDefinition.provider}\" but received \"${provider}\".`,
        },
        { status: 400 },
      )
    }

    const numericMaxTokens =
      typeof maxTokens === "number" && Number.isFinite(maxTokens) && maxTokens > 0
        ? Math.floor(maxTokens)
        : undefined
    if (maxTokens !== undefined && numericMaxTokens === undefined) {
      return Response.json({ error: "maxTokens must be a positive number" }, { status: 400 })
    }

    const numericTemperature =
      typeof temperature === "number" && temperature >= 0 && temperature <= 2 ? temperature : undefined
    if (temperature !== undefined && numericTemperature === undefined) {
      return Response.json({ error: "temperature must be between 0 and 2" }, { status: 400 })
    }

    const normalizedReasoning =
      typeof reasoning === "string" && ["low", "medium", "high"].includes(reasoning)
        ? (reasoning as "low" | "medium" | "high")
        : undefined
    if (reasoning && !normalizedReasoning) {
      return Response.json({ error: "reasoning must be low, medium, or high" }, { status: 400 })
    }

    const { systemPrompt, userPrompt } = buildPromptPayload(sanitizedHeaders, numericRowCount, sanitizedContext)
    const messages = [
      {
        role: "system" as const,
        content: systemPrompt,
      },
      {
        role: "user" as const,
        content: userPrompt,
      },
    ]

    const providerName = modelDefinition.provider.toLowerCase()
    const baseModelId = modelDefinition.model ?? modelDefinition.id
    const targetModel = baseModelId.startsWith(`${providerName}/`)
      ? baseModelId.slice(providerName.length + 1)
      : baseModelId
    const overrideApiKey = typeof apiKey === "string" && apiKey.trim().length > 0 ? apiKey.trim() : undefined
    const runtimeTemperature = numericTemperature ?? modelDefinition.temperature ?? 1
    const runtimeMaxTokens = numericMaxTokens ?? modelDefinition.maxTokens

    let text: string

    if (providerName === "groq") {
      const groqApiKey = overrideApiKey ?? process.env.GROQ_API_KEY

      if (!groqApiKey) {
        return Response.json(
          {
            error: "Groq API key not configured. Provide apiKey in the request or set GROQ_API_KEY.",
          },
          { status: 500 },
        )
      }

      text = await generateWithGroq({
        model: targetModel,
        messages,
        apiKey: groqApiKey,
        temperature: runtimeTemperature,
        maxTokens: runtimeMaxTokens,
        reasoningEffort: normalizedReasoning,
      })
    } else if (providerName === "openai") {
      const openaiApiKey = overrideApiKey ?? process.env.OPENAI_API_KEY

      if (!openaiApiKey) {
        return Response.json(
          {
            error: "OpenAI API key not configured. Provide apiKey in the request or set OPENAI_API_KEY.",
          },
          { status: 500 },
        )
      }

      text = await generateWithOpenAI({
        model: targetModel,
        prompt,
        apiKey: openaiApiKey,
        temperature: runtimeTemperature,
        maxTokens: runtimeMaxTokens,
        reasoning: normalizedReasoning,
      })
    } else {
      return Response.json(
        {
          error: `Provider \"${modelDefinition.provider}\" is not supported yet. Extend the API handler to integrate it.`,
        },
        { status: 400 },
      )
    }

    const data = extractJsonArrayFromText(text)

    return Response.json({ data })
  } catch (error) {
    console.error("AI generation error:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to generate data" },
      { status: 500 },
    )
  }
}

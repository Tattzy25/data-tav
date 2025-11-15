import { checkRateLimit, getClientIp } from "./rate-limit"
import { sanitizeModel, DEFAULT_MODEL } from "./model-config"
import { sanitizeContext, buildPrompt } from "./prompt-builder"
import { generateWithGroq } from "./ai-provider-groq"
import { generateWithOpenAI } from "./ai-provider-openai"
import { extractJsonArrayFromText } from "./json-extractor"

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
      model = DEFAULT_MODEL,
    }: {
      headers: unknown
      rowCount: unknown
      context?: unknown
      model?: string
    } = await request.json()

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
    const sanitizedModel = sanitizeModel(model)

    const prompt = buildPrompt(sanitizedHeaders, numericRowCount, sanitizedContext)

    let text: string

    if (sanitizedModel.startsWith("groq/")) {
      const groqApiKey = process.env.GROQ_API_KEY

      if (!groqApiKey) {
        return Response.json(
          { error: "Groq API key not configured. Please contact the administrator." },
          { status: 500 },
        )
      }

      text = await generateWithGroq(sanitizedModel, prompt, groqApiKey)
    } else if (sanitizedModel.startsWith("openai/")) {
      const openaiModel = sanitizedModel.replace("openai/", "")
      text = await generateWithOpenAI(`openai/${openaiModel}`, prompt)
    } else {
      // This branch should be unreachable due to sanitizeModel
      return Response.json({ error: "Invalid model configuration" }, { status: 400 })
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

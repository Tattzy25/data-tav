type OpenAIGenerationOptions = {
  model: string
  prompt: string
  apiKey: string
  temperature?: number
  maxTokens?: number
  reasoning?: "low" | "medium" | "high"
}

const reasoningEffortMap: Record<NonNullable<OpenAIGenerationOptions["reasoning"]>, "low" | "medium" | "high"> = {
  low: "low",
  medium: "medium",
  high: "high",
}

function extractResponseText(payload: any): string {
  if (!payload || !Array.isArray(payload.output)) {
    return ""
  }

  const chunks: string[] = []

  for (const item of payload.output) {
    if (item?.type !== "message" || !Array.isArray(item.content)) {
      continue
    }

    for (const content of item.content) {
      if (content?.type === "output_text" && typeof content.text === "string") {
        chunks.push(content.text)
      }
    }
  }

  return chunks.join("").trim()
}

export async function generateWithOpenAI({
  model,
  prompt,
  apiKey,
  temperature,
  maxTokens,
  reasoning,
}: OpenAIGenerationOptions): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: prompt,
      temperature,
      max_output_tokens: maxTokens,
      reasoning: reasoning ? { effort: reasoningEffortMap[reasoning] } : undefined,
    }),
  })

  if (!response.ok) {
    let errorMessage = "OpenAI request failed"
    try {
      const errorBody = await response.json()
      errorMessage = errorBody?.error?.message || errorMessage
    } catch {
      // Ignore JSON parsing issues, keep default error
    }
    throw new Error(errorMessage)
  }

  const body = await response.json()
  return extractResponseText(body)
}

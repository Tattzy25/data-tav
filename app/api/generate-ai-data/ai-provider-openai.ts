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

/**
 * Generate data using OpenAI API with timeout and enhanced error handling
 */
export async function generateWithOpenAI({
  model,
  prompt,
  apiKey,
  temperature,
  maxTokens,
  reasoning,
}: OpenAIGenerationOptions): Promise<string> {
  try {
    // Create timeout promise (30 seconds)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("OpenAI API request timeout after 30 seconds")), 30000)
    })

    // Create API call promise
    const apiPromise = fetch("https://api.openai.com/v1/responses", {
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

    // Race between timeout and API call
    const response = await Promise.race([apiPromise, timeoutPromise])

    if (!response.ok) {
      let errorMessage = `OpenAI request failed with status ${response.status}`
      try {
        const errorBody = await response.json()
        errorMessage = errorBody?.error?.message || errorMessage

        // Provide specific guidance for common errors
        if (response.status === 401) {
          errorMessage = "Invalid OpenAI API key. Please check your API key configuration."
        } else if (response.status === 429) {
          errorMessage = "OpenAI API rate limit exceeded. Please wait a moment and try again."
        } else if (response.status === 404) {
          errorMessage = `OpenAI model "${model}" not found. Please select a different model.`
        } else if (response.status === 503) {
          errorMessage = "OpenAI service is temporarily unavailable. Please try again later."
        }
      } catch {
        // Ignore JSON parsing issues, keep default error
      }
      throw new Error(errorMessage)
    }

    const body = await response.json()
    const text = extractResponseText(body)

    if (!text || text.trim().length === 0) {
      throw new Error("OpenAI API returned empty response. Please try again.")
    }

    return text
  } catch (error) {
    // Enhanced error handling
    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        throw new Error("OpenAI API request timed out. Please try again or use a smaller row count.")
      }
      // Re-throw with original message if it's already descriptive
      throw error
    }
    throw new Error("Unknown error occurred while calling OpenAI API")
  }
}

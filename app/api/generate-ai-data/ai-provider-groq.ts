import Groq from "groq-sdk"

type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool"
  content: string
}

type GroqGenerationOptions = {
  model: string
  messages: ChatMessage[]
  apiKey: string
  temperature?: number
  maxTokens?: number
  reasoningEffort?: "low" | "medium" | "high"
}

/**
 * Generate data using Groq API with timeout and enhanced error handling
 */
export async function generateWithGroq({
  model,
  messages,
  apiKey,
  temperature,
  maxTokens,
  reasoningEffort,
}: GroqGenerationOptions): Promise<string> {
  const groq = new Groq({ apiKey })

  try {
    // Create timeout promise (30 seconds)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Groq API request timeout after 30 seconds")), 30000)
    })

    // Create API call promise
    const apiPromise = groq.chat.completions.create({
      model,
      messages,
      temperature,
      max_completion_tokens: maxTokens,
      top_p: 1,
      stream: false,
      reasoning: reasoningEffort ? { effort: reasoningEffort } : undefined,
      tools: [{ type: "browser_search" }],
    })

    // Race between timeout and API call
    const completion = await Promise.race([apiPromise, timeoutPromise])

    // Validate response
    if (!completion.choices || completion.choices.length === 0) {
      throw new Error("Groq API returned no choices in response")
    }

    const content = completion.choices[0]?.message?.content
    if (!content || typeof content !== "string") {
      throw new Error("Groq API returned empty or invalid content")
    }

    return content
  } catch (error) {
    // Enhanced error handling with specific messages
    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        throw new Error("Groq API request timed out. Please try again or use a smaller row count.")
      }
      if (error.message.includes("rate_limit") || error.message.includes("429")) {
        throw new Error("Groq API rate limit exceeded. Please wait a moment and try again.")
      }
      if (error.message.includes("invalid_api_key") || error.message.includes("401")) {
        throw new Error("Invalid Groq API key. Please check your API key configuration.")
      }
      if (error.message.includes("model_not_found") || error.message.includes("404")) {
        throw new Error(`Groq model "${model}" not found. Please select a different model.`)
      }
      // Re-throw with original message if it's already descriptive
      throw error
    }
    throw new Error("Unknown error occurred while calling Groq API")
  }
}

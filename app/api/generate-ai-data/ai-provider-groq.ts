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

export async function generateWithGroq({
  model,
  messages,
  apiKey,
  temperature,
  maxTokens,
  reasoningEffort,
}: GroqGenerationOptions): Promise<string> {
  const groq = new Groq({ apiKey })

  const completion = await groq.chat.completions.create({
    model,
    messages,
    temperature,
    max_completion_tokens: maxTokens,
    top_p: 1,
    stream: false,
    reasoning: reasoningEffort ? { effort: reasoningEffort } : undefined,
    tools: [{ type: "browser_search" }],
  })

  return completion.choices[0]?.message?.content || ""
}

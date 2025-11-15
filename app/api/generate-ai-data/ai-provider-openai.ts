import { generateText } from "ai"

export async function generateWithOpenAI(model: string, prompt: string): Promise<string> {
  const result = await generateText({
    model,
    prompt,
    temperature: 0.8,
  })

  return result.text
}

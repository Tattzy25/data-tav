import Groq from "groq-sdk"

export async function generateWithGroq(model: string, prompt: string, apiKey: string): Promise<string> {
  const groq = new Groq({
    apiKey,
  })

  const groqModel = model.replace("groq/", "")

  const completion = await groq.chat.completions.create({
    model: groqModel,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.6,
    max_tokens: 32768,
    top_p: 0.95,
    stream: false,
    stop: null,
  })

  return completion.choices[0]?.message?.content || ""
}

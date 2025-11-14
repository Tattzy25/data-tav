import { generateText } from "ai"
import Groq from "groq-sdk"

// Simple in-memory rate limiting (for production, use Redis or a proper rate limiting service)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(identifier: string, limit = 10, windowMs = 60000): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(identifier)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (userLimit.count >= limit) {
    return false
  }

  userLimit.count++
  return true
}

export async function POST(request: Request) {
  try {
    // Rate limiting by IP (in production, consider using a more robust solution)
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : "unknown"
    
    if (!checkRateLimit(ip, 10, 60000)) {
      return Response.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }
    const { headers, rowCount, context, model = "groq/openai/gpt-oss-120b" } = await request.json()

    // Validate and sanitize inputs
    if (!headers || !Array.isArray(headers) || headers.length === 0) {
      return Response.json({ error: "Headers are required" }, { status: 400 })
    }

    if (headers.length > 50) {
      return Response.json({ error: "Maximum 50 headers allowed" }, { status: 400 })
    }

    // Sanitize headers
    const sanitizedHeaders = headers.map((h) => String(h).trim()).filter(Boolean)
    if (sanitizedHeaders.length === 0) {
      return Response.json({ error: "Valid headers are required" }, { status: 400 })
    }

    if (!rowCount || rowCount < 1 || rowCount > 100) {
      return Response.json({ error: "Row count must be between 1 and 100" }, { status: 400 })
    }

    // Sanitize context if provided
    const sanitizedContext = context ? String(context).slice(0, 500) : ""

    // Validate model
    const allowedModels = [
      "groq/qwen-qwq-32b",
      "groq/openai/gpt-oss-120b",
      "groq/openai/gpt-oss-20b",
      "openai/gpt-5-mini-2025-08-07",
      "openai/gpt-5-nano-2025-08-07",
    ]
    const sanitizedModel = allowedModels.includes(model) ? model : "groq/openai/gpt-oss-120b"

    const prompt = `Generate ${rowCount} rows of realistic sample data in JSON format for the following columns: ${sanitizedHeaders.join(", ")}.
${sanitizedContext ? `Context: ${sanitizedContext}` : ""}

Requirements:
- Return ONLY a valid JSON array of objects
- Each object should have keys matching the column names exactly
- Generate realistic, diverse data that makes sense for each column
- For names, use realistic full names
- For emails, use realistic email addresses
- For dates, use ISO format (YYYY-MM-DD)
- For numbers, use appropriate ranges
- For addresses, use complete realistic addresses
- Make the data varied and realistic

Example format:
[
  {"Name": "John Smith", "Email": "john.smith@example.com", "Age": 32},
  {"Name": "Jane Doe", "Email": "jane.doe@example.com", "Age": 28}
]`

    let text: string

    if (sanitizedModel.startsWith("groq/")) {
      if (!process.env.GROQ_API_KEY) {
        return Response.json(
          { error: "Groq API key not configured. Please contact the administrator." },
          { status: 500 }
        )
      }
      
      const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      })
      
      const groqModel = sanitizedModel.replace("groq/", "")
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
      text = completion.choices[0]?.message?.content || ""
    } else if (sanitizedModel.startsWith("openai/")) {
      const openaiModel = sanitizedModel.replace("openai/", "")
      const result = await generateText({
        model: `openai/${openaiModel}`,
        prompt,
        temperature: 0.8,
      })
      text = result.text
    } else {
      // Fallback to default
      const result = await generateText({
        model: "openai/gpt-5-mini-2025-08-07",
        prompt,
        temperature: 0.8,
      })
      text = result.text
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text.trim()
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "")
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "")
    }

    const data = JSON.parse(jsonText)

    if (!Array.isArray(data)) {
      throw new Error("Response is not an array")
    }

    return Response.json({ data })
  } catch (error) {
    console.error("AI generation error:", error)
    return Response.json({ error: error instanceof Error ? error.message : "Failed to generate data" }, { status: 500 })
  }
}

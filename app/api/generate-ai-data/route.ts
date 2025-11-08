import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { headers, rowCount, context } = await request.json()

    if (!headers || !Array.isArray(headers) || headers.length === 0) {
      return Response.json({ error: "Headers are required" }, { status: 400 })
    }

    if (!rowCount || rowCount < 1 || rowCount > 100) {
      return Response.json({ error: "Row count must be between 1 and 100" }, { status: 400 })
    }

    const prompt = `Generate ${rowCount} rows of realistic sample data in JSON format for the following columns: ${headers.join(", ")}.
${context ? `Context: ${context}` : ""}

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

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.8,
    })

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

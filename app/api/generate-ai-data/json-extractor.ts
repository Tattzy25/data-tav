export function extractJsonArrayFromText(text: string): unknown[] {
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

  return data
}

/**
 * Extract JSON array from AI-generated text with multiple fallback strategies
 * Handles markdown code blocks, plain JSON, and malformed responses
 */
export function extractJsonArrayFromText(text: string): unknown[] {
  if (!text || text.trim().length === 0) {
    throw new Error("Cannot extract JSON from empty text")
  }

  let jsonText = text.trim()

  // Strategy 1: Remove markdown code blocks
  if (jsonText.startsWith("```json")) {
    jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?$/g, "")
  } else if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/```\n?/g, "")
  }

  jsonText = jsonText.trim()

  // Strategy 2: Try to find JSON array within the text
  // Look for patterns like [...] that might be embedded in other text
  const arrayMatch = jsonText.match(/\[[\s\S]*\]/)
  if (arrayMatch) {
    jsonText = arrayMatch[0]
  }

  // Strategy 3: Try parsing as-is
  try {
    const data = JSON.parse(jsonText)

    if (!Array.isArray(data)) {
      // If we got an object, try to find an array property
      if (typeof data === "object" && data !== null) {
        // Check common property names
        const arrayProps = ["data", "results", "items", "rows"]
        for (const prop of arrayProps) {
          if (Array.isArray(data[prop])) {
            return data[prop]
          }
        }
        // If object has values, try to extract array values
        const values = Object.values(data)
        const firstArray = values.find((v) => Array.isArray(v))
        if (firstArray) {
          return firstArray as unknown[]
        }
      }
      throw new Error("Response is not an array and does not contain a data array")
    }

    if (data.length === 0) {
      throw new Error("Response array is empty")
    }

    return data
  } catch (parseError) {
    // Strategy 4: Try to fix common JSON issues
    try {
      // Remove trailing commas
      const fixedJson = jsonText.replace(/,(\s*[}\]])/g, "$1")
      const data = JSON.parse(fixedJson)
      if (Array.isArray(data) && data.length > 0) {
        return data
      }
    } catch {
      // Continue to next strategy
    }

    // If all strategies fail, provide a helpful error message
    const errorMessage =
      parseError instanceof Error
        ? `Failed to parse JSON: ${parseError.message}`
        : "Failed to parse JSON from AI response"

    // Include a preview of what we tried to parse (first 200 chars)
    const preview = jsonText.slice(0, 200)
    throw new Error(
      `${errorMessage}. Response preview: "${preview}${jsonText.length > 200 ? "..." : ""}". Please try again or contact support if the issue persists.`,
    )
  }
}

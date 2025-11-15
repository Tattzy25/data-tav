export function sanitizeContext(rawContext: unknown): string {
  return rawContext ? String(rawContext).slice(0, 500) : ""
}

export function buildPrompt(headers: string[], rowCount: number, context: string): string {
  return `Generate ${rowCount} rows of realistic sample data in JSON format for the following columns: ${headers.join(", ")}.
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
}

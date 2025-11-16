export interface ParsedCSV {
  headers: string[]
  data: string[][]
}

export function parseCSV(csv: string): ParsedCSV {
  const lines = csv.trim().split("\n")
  if (lines.length === 0) return { headers: [], data: [] }

  const headers = lines[0].split(",").map((h) => h.trim())
  const data = lines.slice(1).map((line) => line.split(",").map((cell) => cell.trim()))

  return { headers, data }
}

export type DataType = "text" | "number" | "email" | "date" | "boolean" | "phone" | "address" | "name" | "company"

export interface ColumnConfig {
  id: string
  name: string
  type: DataType
}

const firstNames = [
  "James",
  "Mary",
  "John",
  "Patricia",
  "Robert",
  "Jennifer",
  "Michael",
  "Linda",
  "William",
  "Elizabeth",
  "David",
  "Barbara",
  "Richard",
  "Susan",
  "Joseph",
  "Jessica",
  "Thomas",
  "Sarah",
  "Charles",
  "Karen",
  "Christopher",
  "Nancy",
  "Daniel",
  "Lisa",
  "Matthew",
  "Betty",
  "Anthony",
  "Margaret",
  "Mark",
  "Sandra",
  "Donald",
  "Ashley",
  "Steven",
  "Kimberly",
  "Paul",
  "Emily",
  "Andrew",
  "Donna",
  "Joshua",
  "Michelle",
]

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
]

const companies = [
  "Tech Corp",
  "Data Systems",
  "Cloud Solutions",
  "Digital Ventures",
  "Innovation Labs",
  "Smart Industries",
  "Future Tech",
  "Global Dynamics",
  "Quantum Systems",
  "Nexus Group",
  "Apex Technologies",
  "Vertex Solutions",
  "Horizon Enterprises",
  "Summit Corp",
  "Prime Industries",
  "Elite Systems",
  "Vanguard Tech",
  "Pinnacle Group",
  "Catalyst Ventures",
  "Zenith Solutions",
]

const streets = [
  "Main St",
  "Oak Ave",
  "Maple Dr",
  "Cedar Ln",
  "Pine Rd",
  "Elm St",
  "Washington Blvd",
  "Park Ave",
  "Lake Dr",
  "Hill St",
  "Forest Rd",
  "River Ln",
  "Mountain View",
  "Sunset Blvd",
  "Broadway",
  "Market St",
  "Church St",
  "School Rd",
  "Mill Ln",
  "Spring St",
]

const cities = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Phoenix",
  "Philadelphia",
  "San Antonio",
  "San Diego",
  "Dallas",
  "San Jose",
  "Austin",
  "Jacksonville",
  "Fort Worth",
  "Columbus",
  "Charlotte",
  "San Francisco",
  "Indianapolis",
  "Seattle",
  "Denver",
  "Boston",
  "Portland",
  "Nashville",
  "Atlanta",
  "Miami",
]

const states = ["NY", "CA", "IL", "TX", "AZ", "PA", "FL", "OH", "NC", "MI", "WA", "CO", "MA", "TN", "GA"]

const domains = ["gmail.com", "yahoo.com", "outlook.com", "company.com", "email.com", "mail.com"]

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomItem<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)]
}

function generateValue(type: DataType): string | number | boolean {
  switch (type) {
    case "text":
      return `Sample text ${randomInt(1, 1000)}`
    case "number":
      return randomInt(1, 10000)
    case "email": {
      const firstName = randomItem(firstNames).toLowerCase()
      const lastName = randomItem(lastNames).toLowerCase()
      const domain = randomItem(domains)
      return `${firstName}.${lastName}${randomInt(1, 99)}@${domain}`
    }
    case "date": {
      const year = randomInt(2020, 2025)
      const month = String(randomInt(1, 12)).padStart(2, "0")
      const day = String(randomInt(1, 28)).padStart(2, "0")
      return `${year}-${month}-${day}`
    }
    case "boolean":
      return Math.random() > 0.5
    case "phone": {
      const areaCode = randomInt(200, 999)
      const prefix = randomInt(200, 999)
      const lineNumber = randomInt(1000, 9999)
      return `(${areaCode}) ${prefix}-${lineNumber}`
    }
    case "address": {
      const streetNumber = randomInt(100, 9999)
      const street = randomItem(streets)
      const city = randomItem(cities)
      const state = randomItem(states)
      const zip = randomInt(10000, 99999)
      return `${streetNumber} ${street}, ${city}, ${state} ${zip}`
    }
    case "name":
      return `${randomItem(firstNames)} ${randomItem(lastNames)}`
    case "company":
      return randomItem(companies)
    default:
      return "N/A"
  }
}

export function generateData(columns: ColumnConfig[], rowCount: number): Record<string, any>[] {
  const data: Record<string, any>[] = []

  for (let i = 0; i < rowCount; i++) {
    const row: Record<string, any> = {}
    columns.forEach((column) => {
      row[column.id] = generateValue(column.type)
    })
    data.push(row)
  }

  return data
}

export function exportToCSV(data: Record<string, any>[], columns: ColumnConfig[]): string {
  if (data.length === 0) return ""

  const headers = columns.map((col) => col.name).join(",")
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.id]
        // Escape values that contain commas or quotes
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      })
      .join(","),
  )

  return [headers, ...rows].join("\n")
}

export function exportToJSON(data: Record<string, any>[]): string {
  return JSON.stringify(data, null, 2)
}

export function parseCSV(csv: string): { headers: string[]; data: string[][] } {
  const lines = csv.trim().split("\n")
  if (lines.length === 0) return { headers: [], data: [] }

  const headers = lines[0].split(",").map((h) => h.trim())
  const data = lines.slice(1).map((line) => line.split(",").map((cell) => cell.trim()))

  return { headers, data }
}

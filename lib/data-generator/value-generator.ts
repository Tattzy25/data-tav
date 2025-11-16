import type { DataType } from "./data-types"
import { firstNames, lastNames, companies, streets, cities, states, domains } from "./data-constants"
import { randomInt, randomItem } from "./random-utils"

export function generateValue(type: DataType): string | number | boolean {
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

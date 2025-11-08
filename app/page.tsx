import { SpreadsheetApp } from "@/components/spreadsheet-app"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <SpreadsheetApp />
      </main>
    </div>
  )
}

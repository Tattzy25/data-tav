import { SpreadsheetApp } from "@/components/spreadsheet-app"
import { ErrorBoundary } from "@/components/error-boundary"

export default function Home() {
  return (
    <ErrorBoundary>
      <div className="w-full h-full">
        <main className="w-full h-full">
          <SpreadsheetApp />
        </main>
      </div>
    </ErrorBoundary>
  )
}

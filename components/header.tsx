import { Database } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
            <Database className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Brigit AI</h1>
            <p className="text-sm text-muted-foreground">The Next Era of Data Generation</p>
          </div>
        </div>
      </div>
    </header>
  )
}

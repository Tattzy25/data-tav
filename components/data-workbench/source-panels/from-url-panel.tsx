"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export type FromUrlPanelProps = {
  url: string
  headers: string
  error: string | null
  loading: boolean
  resolvedModel: string
  onUrlChangeAction: (value: string) => void
  onHeadersChangeAction: (value: string) => void
  onSubmitAction: () => void
}

export function FromUrlPanel({
  url,
  headers,
  error,
  loading,
  resolvedModel,
  onUrlChangeAction,
  onHeadersChangeAction,
  onSubmitAction,
}: FromUrlPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate from URL</CardTitle>
        <CardDescription>Enter a URL and optional headers to generate AI data based on that endpoint</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="url-input">URL</Label>
          <Input
            id="url-input"
            placeholder="https://api.example.com/users"
            value={url}
            onChange={(e) => onUrlChangeAction(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSubmitAction()
              }
            }}
          />
          <p className="text-xs text-muted-foreground">Enter the API endpoint you want to mirror with synthetic data.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="headers-input">Headers (optional)</Label>
          <Textarea
            id="headers-input"
            placeholder="name, email, age, city"
            value={headers}
            onChange={(e) => onHeadersChangeAction(e.target.value)}
            rows={2}
          />
          <p className="text-xs text-muted-foreground">Comma-separated list of column headers to generate.</p>
        </div>
        <Button onClick={onSubmitAction} disabled={loading || !url || !resolvedModel} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Data"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

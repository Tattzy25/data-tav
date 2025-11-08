"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link2, FileCode, Upload } from "lucide-react"
import { parseCSV } from "@/lib/data-generator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function AdditionalTools() {
  const [url, setUrl] = useState("")
  const [urlData, setUrlData] = useState<any>(null)
  const [csvInput, setCsvInput] = useState("")
  const [jsonOutput, setJsonOutput] = useState("")
  const [parsedData, setParsedData] = useState<{ headers: string[]; data: string[][] } | null>(null)

  const handleUrlImport = async () => {
    try {
      const response = await fetch(url)
      const data = await response.json()
      setUrlData(data)
    } catch (error) {
      console.error("[Brigit AI] Error fetching URL:", error)
      setUrlData({ error: "Failed to fetch data from URL" })
    }
  }

  const handleConvert = () => {
    try {
      const parsed = parseCSV(csvInput)
      setParsedData(parsed)

      // Convert to JSON
      const jsonData = parsed.data.map((row) => {
        const obj: Record<string, string> = {}
        parsed.headers.forEach((header, index) => {
          obj[header] = row[index] || ""
        })
        return obj
      })
      setJsonOutput(JSON.stringify(jsonData, null, 2))
    } catch (error) {
      console.error("[Brigit AI] Error converting CSV:", error)
      setJsonOutput("Error: Invalid CSV format")
    }
  }

  const downloadJSON = () => {
    const blob = new Blob([jsonOutput], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "converted.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Tools</CardTitle>
        <CardDescription>Import data from URLs and convert between formats</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="url-import" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url-import">URL Importer</TabsTrigger>
            <TabsTrigger value="converter">CSV to JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="url-import" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="url-input">API URL</Label>
              <div className="flex gap-2">
                <Textarea
                  id="url-input"
                  placeholder="https://api.example.com/data"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
            </div>
            <Button onClick={handleUrlImport} className="w-full">
              <Link2 className="w-4 h-4 mr-2" />
              Import from URL
            </Button>

            {urlData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Imported Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[400px] text-sm">
                    {JSON.stringify(urlData, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="converter" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="csv-input">CSV Input</Label>
              <Textarea
                id="csv-input"
                placeholder="Name,Email,Age&#10;John Doe,john@example.com,30&#10;Jane Smith,jane@example.com,25"
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                className="min-h-[150px] font-mono text-sm"
              />
            </div>

            <Button onClick={handleConvert} className="w-full">
              <FileCode className="w-4 h-4 mr-2" />
              Convert to JSON
            </Button>

            {parsedData && parsedData.headers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-auto max-h-[300px] mb-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {parsedData.headers.map((header, index) => (
                            <TableHead key={index}>{header}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedData.data.slice(0, 5).map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <TableCell key={cellIndex}>{cell}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {jsonOutput && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>JSON Output</Label>
                  <Button onClick={downloadJSON} size="sm" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Download JSON
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[300px] text-sm">{jsonOutput}</pre>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

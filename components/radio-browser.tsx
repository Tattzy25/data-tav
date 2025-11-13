"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Radio, Search, Play, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

// Default genres as specified in requirements
const DEFAULT_GENRES = [
  "edm",
  "hip hop",
  "r&b",
  "electronic",
  "house",
  "top 100 club",
  "top 100 charts",
  "reggaeton",
  "slow jams"
]

interface RadioStation {
  stationuuid: string
  name: string
  url: string
  urlResolved: string
  homepage: string
  favicon: string
  tags: string
  countrycode: string
  state: string
  language: string
  votes: number
  codec: string
  bitrate: number
  lastCheckTime: string
  lastCheckOk: number
  clickTrend: number
  clickCount: number
}

export function RadioBrowser() {
  const [stations, setStations] = useState<RadioStation[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedGenre, setSelectedGenre] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const fetchStations = async (tag: string = "") => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (tag) {
        params.append('tag', tag)
      }
      params.append('limit', '50')
      params.append('minBitrate', '120')

      const response = await fetch(`/api/radio-stations?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch stations')
      }

      const data = await response.json()
      setStations(data.stations || [])
      
      toast({
        description: `Found ${data.count || 0} stations${tag ? ` for ${tag}` : ''}`
      })
    } catch (error) {
      console.error('Error fetching stations:', error)
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "Failed to load stations"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGenreClick = (genre: string) => {
    setSelectedGenre(genre)
    setSearchQuery("")
    fetchStations(genre)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSelectedGenre("")
      fetchStations(searchQuery.trim())
    }
  }

  const playStation = (station: RadioStation) => {
    // Open station in new tab to play
    window.open(station.urlResolved || station.url, '_blank')
  }

  return (
    <div className="w-full h-full p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-6 w-6" />
            Radio Browser
          </CardTitle>
          <CardDescription>
            Browse thousands of radio stations worldwide. Min bitrate: 120kbps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search for genres, stations, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>

          {/* Default Genres */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Default Genres</h3>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_GENRES.map((genre) => (
                <Button
                  key={genre}
                  variant={selectedGenre === genre ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleGenreClick(genre)}
                  disabled={loading}
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>

          {/* Stations List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : stations.length > 0 ? (
            <ScrollArea className="h-[500px] w-full rounded-md border p-4">
              <div className="space-y-3">
                {stations.map((station) => (
                  <Card key={station.stationuuid} className="p-4">
                    <div className="flex items-start gap-3">
                      {station.favicon && (
                        <img
                          src={station.favicon}
                          alt=""
                          className="h-12 w-12 rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{station.name}</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {station.countrycode && (
                            <Badge variant="outline" className="text-xs">
                              {station.countrycode}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {station.bitrate}kbps
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {station.codec}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            ❤️ {station.votes}
                          </Badge>
                        </div>
                        {station.tags && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {station.tags}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => playStation(station)}
                          title="Play station"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        {station.homepage && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(station.homepage, '_blank')}
                            title="Visit homepage"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Radio className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Select a genre or search to find radio stations</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

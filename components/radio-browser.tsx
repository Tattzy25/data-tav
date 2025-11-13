"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Radio, Search, Play, Pause, SkipForward, ExternalLink, Volume2 } from "lucide-react"
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
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStationIndex, setCurrentStationIndex] = useState<number>(-1)
  const audioRef = useRef<HTMLAudioElement | null>(null)
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

  const playStation = (station: RadioStation, index: number) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = station.urlResolved || station.url
      audioRef.current.load()
      audioRef.current.play().catch((error) => {
        console.error('Error playing station:', error)
        toast({
          variant: "destructive",
          description: "Failed to play station. Try another one."
        })
      })
      setCurrentStation(station)
      setCurrentStationIndex(index)
      setIsPlaying(true)
    }
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play().catch((error) => {
          console.error('Error playing:', error)
          toast({
            variant: "destructive",
            description: "Failed to play station"
          })
        })
        setIsPlaying(true)
      }
    }
  }

  const playNext = () => {
    if (stations.length === 0) return
    
    const nextIndex = (currentStationIndex + 1) % stations.length
    playStation(stations[nextIndex], nextIndex)
  }

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio()
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  useEffect(() => {
    if (!audioRef.current) return

    const handleEnded = () => {
      // Auto-play next station when current ends (shouldn't happen with radio streams, but just in case)
      playNext()
    }
    
    const handleError = () => {
      setIsPlaying(false)
      toast({
        variant: "destructive",
        description: "Stream error. Trying next station..."
      })
      setTimeout(() => playNext(), 1000)
    }
    
    audioRef.current.addEventListener('ended', handleEnded)
    audioRef.current.addEventListener('error', handleError)
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded)
        audioRef.current.removeEventListener('error', handleError)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stations, currentStationIndex])

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

          {/* Now Playing Controls */}
          {currentStation && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {currentStation.favicon && (
                    <img
                      src={currentStation.favicon}
                      alt=""
                      className="h-16 w-16 rounded object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{currentStation.name}</h4>
                    <div className="flex gap-2 mt-1">
                      {currentStation.countrycode && (
                        <Badge variant="outline" className="text-xs">
                          {currentStation.countrycode}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {currentStation.bitrate}kbps
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="lg"
                      variant="default"
                      onClick={togglePlayPause}
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={playNext}
                      disabled={stations.length === 0}
                      title="Next station"
                    >
                      <SkipForward className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stations List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : stations.length > 0 ? (
            <ScrollArea className="h-[500px] w-full rounded-md border p-4">
              <div className="space-y-3">
                {stations.map((station, index) => (
                  <Card 
                    key={station.stationuuid} 
                    className={`p-4 ${currentStation?.stationuuid === station.stationuuid ? 'border-primary' : ''}`}
                  >
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
                          onClick={() => playStation(station, index)}
                          title="Play station"
                          variant={currentStation?.stationuuid === station.stationuuid && isPlaying ? "default" : "outline"}
                        >
                          {currentStation?.stationuuid === station.stationuuid && isPlaying ? (
                            <Volume2 className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
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

// API route to fetch radio stations from radio-browser.info
// Implements filtering for bitrate, broken stations, and inactive stations
// Uses uuid fields as recommended (not deprecated id fields)
// Uses countrycode as recommended (not deprecated country fields)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tag = searchParams.get('tag') || ''
  const limit = parseInt(searchParams.get('limit') || '100', 10)
  const minBitrate = parseInt(searchParams.get('minBitrate') || '120', 10)

  try {
    // Get server list first
    const serversResponse = await fetch('https://all.api.radio-browser.info/json/servers')
    let servers: string[] = []
    
    if (serversResponse.ok) {
      const serverList = await serversResponse.json()
      servers = serverList.map((s: any) => `https://${s.name}`)
    } else {
      // Fallback servers
      servers = [
        'https://de1.api.radio-browser.info',
        'https://nl1.api.radio-browser.info',
        'https://at1.api.radio-browser.info',
        'https://de2.api.radio-browser.info',
        'https://fi1.api.radio-browser.info',
        'https://us1.api.radio-browser.info',
        'https://fr1.api.radio-browser.info'
      ]
    }

    // Try servers one by one until we get a successful response
    let stations = null
    let lastError = null

    for (const serverUrl of servers) {
      try {
        const endpoint = tag 
          ? `${serverUrl}/json/stations/bytag/${encodeURIComponent(tag)}`
          : `${serverUrl}/json/stations/search`

        const params = new URLSearchParams({
          limit: limit.toString(),
          hidebroken: 'true', // Exclude broken stations
          order: 'votes', // Order by popularity
          reverse: 'true'
        })

        const url = `${endpoint}?${params.toString()}`
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'BrigitAI/1.0'
          }
        })

        if (!response.ok) {
          lastError = new Error(`Server ${serverUrl} returned ${response.status}`)
          continue
        }

        stations = await response.json()
        
        if (stations && Array.isArray(stations)) {
          break // Success, exit the loop
        }
      } catch (error) {
        lastError = error
        continue // Try next server
      }
    }

    if (!stations) {
      throw lastError || new Error('All servers failed')
    }

    // Filter stations based on requirements
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    const filteredStations = stations
      .filter((station: any) => {
        // Minimum bitrate requirement
        if (station.bitrate < minBitrate) return false
        
        // Exclude stations not played in 2+ weeks
        if (station.lastcheckok === 0) return false
        if (station.lastchecktime) {
          const lastCheck = new Date(station.lastchecktime)
          if (lastCheck < twoWeeksAgo) return false
        }
        
        return true
      })
      .map((station: any) => ({
        // Use uuid fields (not deprecated id fields)
        stationuuid: station.stationuuid,
        name: station.name,
        url: station.url,
        urlResolved: station.url_resolved,
        homepage: station.homepage,
        favicon: station.favicon,
        tags: station.tags,
        // Use countrycode (not deprecated country field)
        countrycode: station.countrycode,
        state: station.state,
        language: station.language,
        votes: station.votes,
        codec: station.codec,
        bitrate: station.bitrate,
        lastCheckTime: station.lastchecktime,
        lastCheckOk: station.lastcheckok,
        clickTrend: station.clicktrend,
        clickCount: station.clickcount
      }))

    return Response.json({ 
      stations: filteredStations,
      count: filteredStations.length 
    })

  } catch (error) {
    console.error('Radio stations fetch error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch radio stations' },
      { status: 500 }
    )
  }
}

// API route to fetch the list of available radio-browser.info servers
// This implements the server discovery mechanism as recommended by radio-browser.info

export async function GET() {
  try {
    // Fetch all available server IPs from DNS
    const dnsResponse = await fetch('https://all.api.radio-browser.info/json/servers')
    
    if (!dnsResponse.ok) {
      throw new Error('Failed to fetch server list')
    }

    const servers = await dnsResponse.json()
    
    // Transform to include full URLs
    const serverUrls = servers.map((server: any) => ({
      name: server.name,
      url: `https://${server.name}/`
    }))

    return Response.json({ servers: serverUrls })
  } catch (error) {
    console.error('Radio servers fetch error:', error)
    
    // Fallback to known servers if DNS lookup fails
    const fallbackServers = [
      { name: 'de1.api.radio-browser.info', url: 'https://de1.api.radio-browser.info/' },
      { name: 'nl1.api.radio-browser.info', url: 'https://nl1.api.radio-browser.info/' },
      { name: 'at1.api.radio-browser.info', url: 'https://at1.api.radio-browser.info/' }
    ]
    
    return Response.json({ servers: fallbackServers })
  }
}

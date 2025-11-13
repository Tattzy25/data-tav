# Radio Browser Integration

This document describes the Radio Browser feature integrated into Brigit AI.

## Overview

The Radio Browser feature allows users to browse and play thousands of radio stations from around the world using the [radio-browser.info](https://radio-browser.info/) API.

## Features

### Default Genres
The application comes pre-configured with these popular genres:
- EDM
- Hip Hop
- R&B
- Electronic
- House
- Top 100 Club
- Top 100 Charts
- Reggaeton
- Slow Jams

### Filters Applied
- **Minimum Bitrate**: 120 kbps (configurable)
- **Broken Stations**: Automatically excluded
- **Inactive Stations**: Stations not played in 2+ weeks are excluded
- **All Countries**: Stations from all countries are included

### Search Functionality
Users can search for any genre, tag, or station name beyond the default genres.

## Technical Implementation

### API Routes

#### `/api/radio-servers`
- Fetches the list of available radio-browser.info servers
- Implements fallback to known servers if DNS lookup fails
- Returns server URLs for load balancing

#### `/api/radio-stations`
- Fetches radio stations with filtering
- Supports query parameters:
  - `tag`: Filter by genre/tag
  - `limit`: Number of stations to return (default: 100)
  - `minBitrate`: Minimum bitrate filter (default: 120)
- Implements server fallback mechanism (tries multiple servers)
- Uses recommended `uuid` fields instead of deprecated `id` fields
- Uses `countrycode` instead of deprecated `country` field

### Best Practices Implemented

Following the radio-browser.info recommendations:

1. **Server Discovery**: Uses DNS-based server list instead of hardcoded URLs
2. **UUID Fields**: Uses `stationuuid`, `checkuuid`, `clickuuid` instead of deprecated `id` fields
3. **Country Codes**: Uses ISO 3166-1 alpha-2 `countrycode` instead of deprecated `country` field
4. **Server Fallback**: Tries multiple servers (up to 7) if one fails
5. **Data Types**: Properly handles JSON field types (numbers, booleans, strings)

### UI Component

The `RadioBrowser` component (`components/radio-browser.tsx`) provides:
- Genre selection buttons for default genres
- Search input for custom queries
- **Built-in audio player with playback controls**:
  - **Play/Pause button** - Toggle playback of current station
  - **Next button** - Skip to the next station in the list
  - **Now Playing card** - Displays currently playing station with controls
- Station list with:
  - Station name and favicon
  - Country code badge
  - Bitrate and codec information
  - Vote count
  - Tags display
  - Play button (starts playing the station)
  - Visual indicator for currently playing station
  - Homepage link (if available)

## Usage

1. Navigate to the "Radio" tab in the application
2. Click on a default genre button or use the search bar
3. Browse the filtered station list
4. Click the Play button on any station to start listening
5. Use the **Play/Pause** button in the Now Playing card to control playback
6. Use the **Next** button to skip to the next station
7. Click the External Link icon to visit a station's homepage

## API Examples

### Get stations for a specific genre
```
GET /api/radio-stations?tag=edm&limit=50&minBitrate=128
```

### Search all stations
```
GET /api/radio-stations?limit=100&minBitrate=120
```

### Get server list
```
GET /api/radio-servers
```

## Future Enhancements

Potential improvements:
- Favorite stations functionality
- Volume control slider
- Station recommendations
- Country/language filters in UI
- Sort options (by bitrate, votes, etc.)
- Export station lists
- Previous button to go back in history
- Shuffle mode

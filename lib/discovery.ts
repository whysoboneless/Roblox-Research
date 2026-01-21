/**
 * Multi-source game discovery system
 * Fetches games from Roblox charts, web search, and third-party APIs
 */

// Roblox Games API - Get top games by sort
export async function fetchRobloxCharts(options: {
  sort?: 'TopEarning' | 'MostPopular' | 'TopRated' | 'MostVisited' | 'TopGrossing'
  genre?: string
  limit?: number
}) {
  const { sort = 'TopEarning', genre, limit = 50 } = options

  try {
    // Use Roblox's games API v2 for sorts
    // This endpoint returns games sorted by various metrics
    const params = new URLSearchParams({
      sortToken: sort,
      startRows: '0',
      maxRows: limit.toString(),
    })

    if (genre) {
      params.append('genre', genre)
    }

    // Try the games list endpoint
    const res = await fetch(
      `https://games.roblox.com/v1/games/list?${params}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    )

    if (!res.ok) {
      throw new Error(`Roblox API error: ${res.status}`)
    }

    const data = await res.json()
    return data.games || []
  } catch (error) {
    console.error('Roblox charts fetch failed:', error)
    return []
  }
}

// Fetch game details by universe IDs
export async function fetchGameDetails(universeIds: number[]) {
  if (universeIds.length === 0) return []

  try {
    const res = await fetch(
      `https://games.roblox.com/v1/games?universeIds=${universeIds.join(',')}`
    )
    const data = await res.json()
    return data.data || []
  } catch {
    return []
  }
}

// Fetch votes for games
export async function fetchGameVotes(universeIds: number[]) {
  if (universeIds.length === 0) return []

  try {
    const res = await fetch(
      `https://games.roblox.com/v1/games/votes?universeIds=${universeIds.join(',')}`
    )
    const data = await res.json()
    return data.data || []
  } catch {
    return []
  }
}

// Get universe ID from place ID
export async function getUniverseId(placeId: string | number): Promise<number | null> {
  try {
    const res = await fetch(
      `https://apis.roblox.com/universes/v1/places/${placeId}/universe`
    )
    const data = await res.json()
    return data.universeId
  } catch {
    return null
  }
}

// Search games using Roblox autocomplete
export async function searchGames(query: string, limit = 20) {
  try {
    const res = await fetch(
      `https://apis.roblox.com/games-autocomplete/v1/get-suggestion/${encodeURIComponent(query)}`
    )
    const data = await res.json()
    return (data.entries || []).slice(0, limit)
  } catch {
    return []
  }
}

// Rolimons API - Get game values and trade data
export async function fetchRolimonsData() {
  try {
    // Rolimons has a public API for limited items
    // For games, we'd need to scrape their site
    // This is a placeholder - actual implementation would need their API
    const res = await fetch('https://www.rolimons.com/api/activity')
    const data = await res.json()
    return data
  } catch {
    return null
  }
}

// Web search for Roblox games (using our existing web capabilities)
export async function discoverGamesFromWeb(query: string): Promise<{
  games: Array<{ name: string; placeId?: string; source: string }>
  sources: string[]
}> {
  // This would be called from an API route that has web search capability
  // Returns game names and potential place IDs found from web articles
  return {
    games: [],
    sources: []
  }
}

// Parse Place IDs from text (URLs, descriptions, etc.)
export function extractPlaceIds(text: string): string[] {
  const patterns = [
    /roblox\.com\/games\/(\d+)/gi,
    /place[_\-]?id[:\s=]+(\d+)/gi,
    /\b(\d{8,12})\b/g // Generic large numbers that could be place IDs
  ]

  const ids = new Set<string>()

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const id = match[1]
      // Place IDs are typically 7-12 digits
      if (id.length >= 7 && id.length <= 12) {
        ids.add(id)
      }
    }
  }

  return Array.from(ids)
}

// Fetch trending games from multiple genres
export async function fetchTrendingByGenre() {
  const genres = [
    'Action', 'Adventure', 'Simulator', 'RPG', 'Tycoon',
    'Horror', 'Survival', 'Sports', 'Shooting', 'Racing'
  ]

  const results: Record<string, any[]> = {}

  for (const genre of genres) {
    try {
      const games = await fetchRobloxCharts({ genre, limit: 20 })
      results[genre] = games
    } catch {
      results[genre] = []
    }
  }

  return results
}

// Combined discovery - try multiple sources
export async function discoverGames(options: {
  query?: string
  genre?: string
  limit?: number
}): Promise<Array<{
  placeId: string
  universeId?: number
  name: string
  source: string
}>> {
  const { query, genre, limit = 30 } = options
  const discovered: Array<{
    placeId: string
    universeId?: number
    name: string
    source: string
  }> = []

  // Source 1: Search if query provided
  if (query) {
    const searchResults = await searchGames(query, limit)
    for (const result of searchResults) {
      if (result.placeId) {
        discovered.push({
          placeId: result.placeId.toString(),
          name: result.name,
          source: 'roblox_search'
        })
      }
    }
  }

  // Source 2: Charts by genre
  if (genre || !query) {
    const chartGames = await fetchRobloxCharts({
      genre: genre || undefined,
      limit,
      sort: 'TopEarning'
    })

    for (const game of chartGames) {
      if (game.placeId && !discovered.find(d => d.placeId === game.placeId.toString())) {
        discovered.push({
          placeId: game.placeId.toString(),
          universeId: game.universeId,
          name: game.name,
          source: 'roblox_charts'
        })
      }
    }
  }

  return discovered.slice(0, limit)
}

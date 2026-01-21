import { NextResponse } from 'next/server'

// Roblox Games API endpoints for fetching sorted game lists
const SORT_ENDPOINTS = {
  popular: 'https://games.roblox.com/v1/games/list?sortToken=&startRows=0&maxRows=50',
  topEarning: 'https://games.roblox.com/v1/games/list?sortToken=&startRows=0&maxRows=50',
  topRated: 'https://games.roblox.com/v1/games/list?sortToken=&startRows=0&maxRows=50',
}

// Use the games sorts API to get available sort tokens
async function getGameSorts() {
  try {
    const res = await fetch('https://games.roblox.com/v1/games/sorts?GameSortsContext=HomeSorts', {
      headers: { 'Accept': 'application/json' }
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.sorts || []
  } catch {
    return []
  }
}

// Fetch games using a sort token
async function fetchSortedGames(sortToken: string, limit = 30) {
  try {
    const res = await fetch(
      `https://games.roblox.com/v1/games/list?sortToken=${sortToken}&startRows=0&maxRows=${limit}`,
      { headers: { 'Accept': 'application/json' } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.games || []
  } catch {
    return []
  }
}

// Get game details by universe IDs
async function getGameDetails(universeIds: number[]) {
  if (universeIds.length === 0) return []
  try {
    const res = await fetch(
      `https://games.roblox.com/v1/games?universeIds=${universeIds.join(',')}`,
      { headers: { 'Accept': 'application/json' } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.data || []
  } catch {
    return []
  }
}

// Get votes for games
async function getGameVotes(universeIds: number[]) {
  if (universeIds.length === 0) return []
  try {
    const res = await fetch(
      `https://games.roblox.com/v1/games/votes?universeIds=${universeIds.join(',')}`,
      { headers: { 'Accept': 'application/json' } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.data || []
  } catch {
    return []
  }
}

// Get place ID from universe ID
async function getPlaceId(universeId: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://games.roblox.com/v1/games/${universeId}/root-place`,
      { headers: { 'Accept': 'application/json' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.placeId?.toString() || null
  } catch {
    return null
  }
}

function estimateRevenue(ccu: number, likeRatio: number): number {
  let revenuePerPlayer = 2.0
  if (likeRatio > 85) revenuePerPlayer = 5.0
  else if (likeRatio < 70) revenuePerPlayer = 0.5
  return Math.round(ccu * revenuePerPlayer * 30)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sortType = searchParams.get('sort') || 'popular'
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

  try {
    // Get available sorts from Roblox
    const sorts = await getGameSorts()

    // Find the requested sort type
    let targetSort = sorts.find((s: any) =>
      s.name?.toLowerCase().includes(sortType.toLowerCase()) ||
      s.displayName?.toLowerCase().includes(sortType.toLowerCase())
    )

    // Default to first sort if not found
    if (!targetSort && sorts.length > 0) {
      targetSort = sorts[0]
    }

    if (!targetSort) {
      return NextResponse.json({
        error: 'Could not fetch game sorts from Roblox',
        sorts: [],
        games: []
      })
    }

    // Fetch games with the sort token
    const gamesRaw = await fetchSortedGames(targetSort.token, limit)

    if (gamesRaw.length === 0) {
      return NextResponse.json({
        sort: targetSort.displayName || sortType,
        games: [],
        message: 'No games returned from Roblox API'
      })
    }

    // Get universe IDs and fetch full details
    const universeIds = gamesRaw.map((g: any) => g.universeId).filter(Boolean)

    const [details, votes] = await Promise.all([
      getGameDetails(universeIds),
      getGameVotes(universeIds)
    ])

    // Create a map for quick lookup
    const detailsMap = new Map<number, any>(details.map((d: any) => [d.id, d]))
    const votesMap = new Map<number, { upVotes: number; downVotes: number }>(votes.map((v: any) => [v.id, v]))

    // Build enriched game list
    const games = await Promise.all(
      gamesRaw.slice(0, limit).map(async (raw: any) => {
        const detail = detailsMap.get(raw.universeId)
        const vote = votesMap.get(raw.universeId)

        // Get place ID
        const placeId = await getPlaceId(raw.universeId)

        const likeRatio = vote
          ? (vote.upVotes / (vote.upVotes + vote.downVotes)) * 100
          : 0

        return {
          placeId: placeId || raw.placeId?.toString() || '',
          universeId: raw.universeId,
          name: detail?.name || raw.name || 'Unknown',
          creator: {
            name: detail?.creator?.name || 'Unknown',
            type: detail?.creator?.type || 'User'
          },
          metrics: {
            visits: detail?.visits || 0,
            currentPlayers: detail?.playing || raw.playerCount || 0,
            likeRatio: likeRatio.toFixed(1),
            estimatedRevenue: estimateRevenue(detail?.playing || 0, likeRatio)
          },
          dates: {
            created: detail?.created || null,
            updated: detail?.updated || null
          },
          genre: detail?.genre || 'All'
        }
      })
    )

    // Filter out games without placeId
    const validGames = games.filter(g => g.placeId)

    return NextResponse.json({
      sort: targetSort.displayName || sortType,
      availableSorts: sorts.map((s: any) => ({ name: s.name, displayName: s.displayName })),
      games: validGames,
      source: 'roblox_api'
    })

  } catch (error: any) {
    console.error('Chart scraper error:', error)
    return NextResponse.json({
      error: error.message,
      games: []
    }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'

// External game tracking services integration
// Note: These are public APIs, no authentication required for basic data

interface ExternalGameData {
  placeId: string
  source: string
  metrics: {
    ccu?: number
    ccuPeak24h?: number
    ccuPeak7d?: number
    visits?: number
    revenue?: number
    rating?: number
  }
  history?: {
    date: string
    ccu: number
  }[]
}

// RoMonitor Stats API (public endpoints)
async function fetchRoMonitorStats(placeId: string): Promise<ExternalGameData | null> {
  try {
    // RoMonitor provides game statistics
    const res = await fetch(`https://api.romonitorstats.com/v1/games/${placeId}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RobloxResearchTool/1.0'
      }
    })

    if (!res.ok) return null

    const data = await res.json()

    return {
      placeId,
      source: 'romonitor',
      metrics: {
        ccu: data.currentPlayers,
        ccuPeak24h: data.peak24h,
        ccuPeak7d: data.peak7d,
        visits: data.totalVisits,
        revenue: data.estimatedRevenue
      },
      history: data.history || []
    }
  } catch {
    return null
  }
}

// Blox API (alternative stats provider)
async function fetchBloxStats(placeId: string): Promise<ExternalGameData | null> {
  try {
    const res = await fetch(`https://blox.link/api/game/${placeId}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RobloxResearchTool/1.0'
      }
    })

    if (!res.ok) return null

    const data = await res.json()

    return {
      placeId,
      source: 'blox',
      metrics: {
        ccu: data.players,
        visits: data.visits,
        rating: data.rating
      }
    }
  } catch {
    return null
  }
}

// Direct Roblox API for comparison
async function fetchRobloxDirectStats(placeId: string): Promise<ExternalGameData | null> {
  try {
    // Get universe ID first
    const universeRes = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`)
    const universeData = await universeRes.json()
    const universeId = universeData.universeId

    if (!universeId) return null

    // Get game details
    const detailsRes = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`)
    const detailsData = await detailsRes.json()
    const game = detailsData.data?.[0]

    if (!game) return null

    // Get votes
    const votesRes = await fetch(`https://games.roblox.com/v1/games/votes?universeIds=${universeId}`)
    const votesData = await votesRes.json()
    const vote = votesData.data?.[0]

    const likeRatio = vote
      ? (vote.upVotes / (vote.upVotes + vote.downVotes)) * 100
      : 0

    return {
      placeId,
      source: 'roblox',
      metrics: {
        ccu: game.playing,
        visits: game.visits,
        rating: parseFloat(likeRatio.toFixed(1))
      }
    }
  } catch {
    return null
  }
}

// Aggregate data from multiple sources
async function aggregateGameStats(placeId: string) {
  const [robloxStats, romonitorStats, bloxStats] = await Promise.all([
    fetchRobloxDirectStats(placeId),
    fetchRoMonitorStats(placeId),
    fetchBloxStats(placeId)
  ])

  // Combine data, preferring more detailed sources
  const combined: ExternalGameData = {
    placeId,
    source: 'aggregated',
    metrics: {
      ccu: robloxStats?.metrics.ccu || romonitorStats?.metrics.ccu || bloxStats?.metrics.ccu || 0,
      ccuPeak24h: romonitorStats?.metrics.ccuPeak24h,
      ccuPeak7d: romonitorStats?.metrics.ccuPeak7d,
      visits: robloxStats?.metrics.visits || romonitorStats?.metrics.visits || bloxStats?.metrics.visits || 0,
      revenue: romonitorStats?.metrics.revenue,
      rating: robloxStats?.metrics.rating || bloxStats?.metrics.rating
    },
    history: romonitorStats?.history
  }

  return {
    aggregated: combined,
    sources: {
      roblox: robloxStats,
      romonitor: romonitorStats,
      blox: bloxStats
    }
  }
}

// Fetch trending games from external trackers
async function fetchExternalTrending(): Promise<string[]> {
  const placeIds: string[] = []

  try {
    // Try RoMonitor trending
    const res = await fetch('https://api.romonitorstats.com/v1/trending', {
      headers: { 'Accept': 'application/json' }
    })

    if (res.ok) {
      const data = await res.json()
      data.games?.forEach((g: any) => {
        if (g.placeId) placeIds.push(g.placeId.toString())
      })
    }
  } catch {
    // External API unavailable, use fallback
  }

  return placeIds
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const placeId = searchParams.get('placeId')
  const mode = searchParams.get('mode') || 'single' // 'single' or 'trending'

  try {
    if (mode === 'trending') {
      // Fetch trending games from external sources
      const trendingIds = await fetchExternalTrending()

      // If external APIs fail, use known popular games
      const fallbackIds = [
        '2753915549',  // Blox Fruits
        '8737899170',  // Pet Simulator 99
        '4996049426',  // Anime Adventures
        '6516141723',  // Doors
        '4924922222',  // Brookhaven
        '17017769292', // Anime Defenders
        '16732694052', // Fisch
      ]

      const idsToFetch = trendingIds.length > 0 ? trendingIds : fallbackIds

      // Fetch stats for each
      const games = []
      for (const id of idsToFetch.slice(0, 10)) {
        const stats = await fetchRobloxDirectStats(id)
        if (stats) {
          games.push({
            placeId: id,
            ...stats.metrics
          })
        }
        await new Promise(r => setTimeout(r, 100))
      }

      return NextResponse.json({
        mode: 'trending',
        source: trendingIds.length > 0 ? 'external' : 'fallback',
        games
      })
    }

    // Single game mode
    if (!placeId) {
      return NextResponse.json({
        error: 'placeId parameter required',
        usage: '/api/external-stats?placeId=123456 or /api/external-stats?mode=trending'
      }, { status: 400 })
    }

    const stats = await aggregateGameStats(placeId)

    return NextResponse.json({
      placeId,
      ...stats
    })

  } catch (error: any) {
    console.error('External stats error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

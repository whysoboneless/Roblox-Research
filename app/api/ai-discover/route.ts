import { NextResponse } from 'next/server'

// This endpoint uses intelligent keyword expansion and multiple search strategies
// to discover games that might not show up in simple searches

interface DiscoveryStrategy {
  name: string
  keywords: string[]
  filters: {
    minCcu?: number
    maxAgeMonths?: number
    genres?: string[]
  }
}

const DISCOVERY_STRATEGIES: DiscoveryStrategy[] = [
  {
    name: 'Rising Simulators',
    keywords: ['simulator 2024', 'simulator 2025', 'clicker simulator', 'idle simulator', 'tapping simulator'],
    filters: { minCcu: 500, maxAgeMonths: 6 }
  },
  {
    name: 'New Anime Games',
    keywords: ['anime game 2024', 'anime rpg', 'anime fighting', 'anime tower', 'anime defenders', 'anime adventures'],
    filters: { minCcu: 1000, maxAgeMonths: 8 }
  },
  {
    name: 'Trending Horror',
    keywords: ['horror game roblox', 'scary game', 'escape horror', 'monster game', 'survival horror'],
    filters: { minCcu: 200, maxAgeMonths: 12 }
  },
  {
    name: 'Popular Tycoons',
    keywords: ['tycoon 2024', 'business tycoon', 'factory tycoon', 'empire tycoon', 'idle tycoon'],
    filters: { minCcu: 300, maxAgeMonths: 6 }
  },
  {
    name: 'Roleplay Hits',
    keywords: ['roleplay game', 'life sim roblox', 'city roleplay', 'school roleplay'],
    filters: { minCcu: 1000, maxAgeMonths: 12 }
  },
  {
    name: 'Emerging Tower Defense',
    keywords: ['tower defense 2024', 'td game', 'tower defense anime', 'wave defense'],
    filters: { minCcu: 500, maxAgeMonths: 6 }
  }
]

// Roblox API helpers
async function getUniverseId(placeId: string): Promise<number | null> {
  try {
    const res = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`)
    const data = await res.json()
    return data.universeId
  } catch {
    return null
  }
}

async function getGameDetails(universeIds: number[]) {
  if (universeIds.length === 0) return []
  try {
    const res = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeIds.join(',')}`)
    const data = await res.json()
    return data.data || []
  } catch {
    return []
  }
}

async function getGameVotes(universeIds: number[]) {
  if (universeIds.length === 0) return []
  try {
    const res = await fetch(`https://games.roblox.com/v1/games/votes?universeIds=${universeIds.join(',')}`)
    const data = await res.json()
    return data.data || []
  } catch {
    return []
  }
}

async function searchGames(query: string) {
  try {
    const res = await fetch(
      `https://apis.roblox.com/games-autocomplete/v1/get-suggestion/${encodeURIComponent(query)}`
    )
    const data = await res.json()
    return data.entries || []
  } catch {
    return []
  }
}

function estimateRevenue(ccu: number, likeRatio: number): number {
  let revenuePerPlayer = 2.0
  if (likeRatio > 85) revenuePerPlayer = 5.0
  else if (likeRatio < 70) revenuePerPlayer = 0.5
  return Math.round(ccu * revenuePerPlayer * 30)
}

function getAgeInMonths(dateString: string): number {
  if (!dateString) return 999
  const created = new Date(dateString)
  const now = new Date()
  return (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 30)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const strategy = searchParams.get('strategy') || ''
  const customQuery = searchParams.get('query') || ''
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

  try {
    // Find matching strategy or use all
    const strategies = strategy
      ? DISCOVERY_STRATEGIES.filter(s => s.name.toLowerCase().includes(strategy.toLowerCase()))
      : DISCOVERY_STRATEGIES

    if (strategies.length === 0 && !customQuery) {
      return NextResponse.json({
        strategies: DISCOVERY_STRATEGIES.map(s => s.name),
        message: 'No matching strategy found. Use one of the available strategies or provide a custom query.',
        games: []
      })
    }

    const allPlaceIds = new Set<string>()
    const searchTerms: string[] = []

    // Collect all keywords from matched strategies
    if (strategies.length > 0) {
      strategies.forEach(s => {
        s.keywords.forEach(k => searchTerms.push(k))
      })
    }

    // Add custom query if provided
    if (customQuery) {
      searchTerms.push(customQuery)
      // Also add related terms
      searchTerms.push(`${customQuery} 2024`)
      searchTerms.push(`${customQuery} simulator`)
      searchTerms.push(`${customQuery} game`)
    }

    // Search with all terms
    for (const term of searchTerms.slice(0, 10)) { // Limit to avoid rate limiting
      const results = await searchGames(term)
      results.forEach((r: any) => {
        if (r.placeId) allPlaceIds.add(r.placeId.toString())
      })
      await new Promise(r => setTimeout(r, 100))
    }

    // Get filter criteria
    const activeStrategy = strategies[0]
    const minCcu = activeStrategy?.filters.minCcu || 100
    const maxAgeMonths = activeStrategy?.filters.maxAgeMonths || 12

    // Fetch details for collected games
    const games = []
    const placeIdsArray = Array.from(allPlaceIds).slice(0, 40)

    for (const placeId of placeIdsArray) {
      try {
        const universeId = await getUniverseId(placeId)
        if (!universeId) continue

        const [details, votes] = await Promise.all([
          getGameDetails([universeId]),
          getGameVotes([universeId])
        ])

        const game = details[0]
        const vote = votes[0]
        if (!game) continue

        const likeRatio = vote
          ? (vote.upVotes / (vote.upVotes + vote.downVotes)) * 100
          : 0

        const ccu = game.playing || 0
        const ageMonths = getAgeInMonths(game.created)

        // Apply filters
        if (ccu < minCcu) continue
        if (ageMonths > maxAgeMonths) continue

        const revenueEstimate = estimateRevenue(ccu, likeRatio)

        // Calculate discovery score (prioritizes new, high CCU, high engagement games)
        const recencyBonus = Math.max(0, 1 - (ageMonths / maxAgeMonths))
        const engagementBonus = likeRatio / 100
        const discoveryScore = Math.round(
          (ccu / 100) * recencyBonus * engagementBonus * 100
        )

        games.push({
          placeId,
          universeId,
          name: game.name,
          creator: {
            name: game.creator?.name || 'Unknown',
            type: game.creator?.type || 'User'
          },
          metrics: {
            visits: game.visits || 0,
            currentPlayers: ccu,
            likeRatio: likeRatio.toFixed(1),
            estimatedRevenue: revenueEstimate
          },
          dates: {
            created: game.created,
            updated: game.updated
          },
          genre: game.genre,
          ageMonths: Math.round(ageMonths * 10) / 10,
          discoveryScore
        })

        await new Promise(r => setTimeout(r, 50))
      } catch (err) {
        console.error(`Failed to fetch ${placeId}:`, err)
      }
    }

    // Sort by discovery score
    games.sort((a, b) => b.discoveryScore - a.discoveryScore)

    return NextResponse.json({
      strategy: activeStrategy?.name || 'Custom Search',
      query: customQuery || searchTerms.slice(0, 3).join(', '),
      filters: {
        minCcu,
        maxAgeMonths
      },
      availableStrategies: DISCOVERY_STRATEGIES.map(s => s.name),
      games: games.slice(0, limit),
      totalMatches: games.length
    })

  } catch (error: any) {
    console.error('AI Discovery error:', error)
    return NextResponse.json({ error: error.message, games: [] }, { status: 500 })
  }
}

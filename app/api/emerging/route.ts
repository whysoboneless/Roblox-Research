import { NextResponse } from 'next/server'

// Fetch universe ID from place ID
async function getUniverseId(placeId: string): Promise<number | null> {
  try {
    const res = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`)
    const data = await res.json()
    return data.universeId
  } catch {
    return null
  }
}

// Get game details
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

// Get votes
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

// Search for games
async function searchGames(keyword: string) {
  try {
    const res = await fetch(
      `https://apis.roblox.com/games-autocomplete/v1/get-suggestion/${encodeURIComponent(keyword)}`
    )
    const data = await res.json()
    return data.entries || []
  } catch {
    return []
  }
}

// Get current year for dynamic keyword generation
const currentYear = new Date().getFullYear()

// Keywords that often indicate emerging/trending games - dynamically updated
const TRENDING_KEYWORDS = [
  `simulator ${currentYear}`,
  `simulator ${currentYear - 1}`,
  `tycoon ${currentYear}`,
  `tycoon ${currentYear - 1}`,
  'new anime',
  'new tower defense',
  'anime defenders',
  'anime simulator',
  'pet sim',
  'clicker',
  'obby new',
  'survival game',
  'fighting simulator',
  'racing simulator',
  'horror game new',
  'tower defense new',
  'idle simulator',
  'merge game',
]

// Seed games that are known to be active - these help bootstrap searches
const SEED_GAMES: Record<string, string[]> = {
  'anime': ['17017769292', '16132924982', '4996049426', '4587034896'],
  'simulator': ['16732694052', '8737899170', '6284583030', '4490140733'],
  'horror': ['6516141723', '6839171747', '5765928606'],
  'tycoon': ['17277709498', '920587237', '3527629287'],
  'tower defense': ['17017769292', '4996049426', '4587034896', '5591597781'],
}

function estimateRevenue(ccu: number, likeRatio: number): number {
  let revenuePerPlayer = 2.0
  if (likeRatio > 85) revenuePerPlayer = 5.0
  else if (likeRatio < 70) revenuePerPlayer = 0.5
  return Math.round(ccu * revenuePerPlayer * 30)
}

function isRecent(dateString: string, maxMonths = 6): boolean {
  if (!dateString) return false
  const created = new Date(dateString)
  const now = new Date()
  const monthsDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 30)
  return monthsDiff <= maxMonths
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || ''
  const maxMonths = parseInt(searchParams.get('maxMonths') || '6')
  const minCcu = parseInt(searchParams.get('minCcu') || '100')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

  try {
    const allPlaceIds = new Set<string>()

    // 1. Search using trending keywords
    const keywordsToSearch = category
      ? TRENDING_KEYWORDS.filter(k => k.includes(category.toLowerCase()))
      : TRENDING_KEYWORDS.slice(0, 5)

    for (const keyword of keywordsToSearch) {
      const results = await searchGames(keyword)
      results.forEach((r: any) => {
        if (r.placeId) allPlaceIds.add(r.placeId.toString())
      })
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 50))
    }

    // 2. Add seed games for the category to ensure we have results
    if (category && SEED_GAMES[category.toLowerCase()]) {
      SEED_GAMES[category.toLowerCase()].forEach(id => allPlaceIds.add(id))
    } else {
      // Add seed games from all categories if no category specified
      Object.values(SEED_GAMES).flat().forEach(id => allPlaceIds.add(id))
    }

    // 3. Fetch details for all collected games
    const placeIdsArray = Array.from(allPlaceIds).slice(0, 50)
    const games = []

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

        // Filter: must have minimum CCU
        if (ccu < minCcu) continue

        // Calculate "emerging score" based on recency and growth
        const isNew = isRecent(game.created, maxMonths)
        const revenueEstimate = estimateRevenue(ccu, likeRatio)

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
          isRecent: isNew,
          emergingScore: isNew ? Math.round(ccu * (likeRatio / 100) * (revenueEstimate / 10000)) : 0
        })

        await new Promise(r => setTimeout(r, 50))
      } catch (err) {
        console.error(`Failed to fetch ${placeId}:`, err)
      }
    }

    // Sort by emerging score (prioritize new high-performing games)
    games.sort((a, b) => b.emergingScore - a.emergingScore)

    // Filter to only recent games if requested
    const filteredGames = category
      ? games.filter(g => g.isRecent).slice(0, limit)
      : games.slice(0, limit)

    return NextResponse.json({
      category: category || 'all',
      maxMonths,
      minCcu,
      games: filteredGames,
      totalFound: games.length,
      recentCount: games.filter(g => g.isRecent).length
    })

  } catch (error: any) {
    console.error('Emerging games error:', error)
    return NextResponse.json({ error: error.message, games: [] }, { status: 500 })
  }
}

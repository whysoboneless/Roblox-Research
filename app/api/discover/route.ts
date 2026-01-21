import { NextResponse } from 'next/server'

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
  try {
    const res = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeIds.join(',')}`)
    const data = await res.json()
    return data.data || []
  } catch {
    return []
  }
}

async function getGameVotes(universeIds: number[]) {
  try {
    const res = await fetch(`https://games.roblox.com/v1/games/votes?universeIds=${universeIds.join(',')}`)
    const data = await res.json()
    return data.data || []
  } catch {
    return []
  }
}

async function searchRobloxGames(query: string) {
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

// Fetch games from Roblox's games sorts API
async function fetchGamesSorted(sortToken: string, limit = 50) {
  try {
    // Use the games API to get sorted lists
    const res = await fetch(
      `https://games.roblox.com/v1/games/list?sortToken=${sortToken}&startRows=0&maxRows=${limit}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    )

    if (!res.ok) return []

    const data = await res.json()
    return data.games || []
  } catch {
    return []
  }
}

// Known popular games database (fallback when APIs fail)
const KNOWN_POPULAR_GAMES: Record<string, string[]> = {
  'simulator': [
    '2753915549',  // Blox Fruits
    '8737899170',  // Pet Simulator 99
    '6284583030',  // Muscle Legends
    '4520749081',  // King Legacy
    '5511882441',  // Murder Mystery 2
  ],
  'tower defense': [
    '4996049426',  // Anime Adventures
    '4587034896',  // All Star Tower Defense
    '17017769292', // Anime Defenders
    '5591597781',  // Toilet Tower Defense
  ],
  'horror': [
    '6516141723',  // Doors
    '6839171747',  // Apeirophobia
    '5765928606',  // The Mimic
    '3260590327',  // Piggy
  ],
  'tycoon': [
    '4490140733',  // Arm Wrestle Simulator
    '3527629287',  // My Restaurant
    '920587237',   // Retail Tycoon 2
  ],
  'roleplay': [
    '4924922222',  // Brookhaven RP
    '185655149',   // Welcome to Bloxburg
    '3351674303',  // Livetopia
  ],
  'adventure': [
    '2753915549',  // Blox Fruits
    '16732694052', // Fisch
    '4520749081',  // King Legacy
  ],
  'anime': [
    '4996049426',  // Anime Adventures
    '4587034896',  // All Star Tower Defense
    '2753915549',  // Blox Fruits
    '17017769292', // Anime Defenders
    '2809202155',  // Anime Fighting Simulator
  ],
}

function getKnownGames(query: string): string[] {
  const q = query.toLowerCase()
  const ids = new Set<string>()

  for (const [category, placeIds] of Object.entries(KNOWN_POPULAR_GAMES)) {
    if (q.includes(category) || category.includes(q)) {
      placeIds.forEach(id => ids.add(id))
    }
  }

  // If no specific match, return top games from each category
  if (ids.size === 0) {
    for (const placeIds of Object.values(KNOWN_POPULAR_GAMES)) {
      placeIds.slice(0, 2).forEach(id => ids.add(id))
    }
  }

  return Array.from(ids)
}

function estimateRevenue(ccu: number, likeRatio: number): number {
  let revenuePerPlayer = 2.0
  if (likeRatio > 85) revenuePerPlayer = 5.0
  else if (likeRatio < 70) revenuePerPlayer = 0.5
  return Math.round(ccu * revenuePerPlayer * 30)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || ''
  const genre = searchParams.get('genre') || ''
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    let placeIds: string[] = []

    // Try Roblox search API first
    if (query) {
      const searchResults = await searchRobloxGames(query)
      placeIds = searchResults
        .filter((r: any) => r.placeId)
        .map((r: any) => r.placeId.toString())
        .slice(0, limit)
    }

    // If search returns nothing, use known games database
    if (placeIds.length === 0) {
      placeIds = getKnownGames(query || genre || 'popular').slice(0, limit)
    }

    // Fetch full details for each game
    const games = []

    for (const placeId of placeIds.slice(0, limit)) {
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

        games.push({
          placeId,
          universeId,
          name: game.name,
          description: game.description,
          creator: {
            id: game.creator?.id,
            name: game.creator?.name,
            type: game.creator?.type
          },
          metrics: {
            visits: game.visits,
            favorites: game.favoritedCount,
            currentPlayers: game.playing,
            likes: vote?.upVotes || 0,
            dislikes: vote?.downVotes || 0,
            likeRatio: likeRatio.toFixed(1),
            estimatedRevenue: estimateRevenue(game.playing || 0, likeRatio)
          },
          dates: {
            created: game.created,
            updated: game.updated
          },
          genre: game.genre,
        })

        // Rate limit
        await new Promise(r => setTimeout(r, 50))
      } catch (err) {
        console.error(`Failed to fetch ${placeId}:`, err)
      }
    }

    return NextResponse.json({
      games,
      query,
      genre,
      source: placeIds.length > 0 ? 'roblox_api' : 'known_games'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

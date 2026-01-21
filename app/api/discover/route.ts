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

// CURATED list of quality games with actual player counts
// These are REAL popular Roblox games that we know work
const CURATED_GAMES: Record<string, { placeId: string; name: string }[]> = {
  'popular': [
    { placeId: '2753915549', name: 'Blox Fruits' },
    { placeId: '8737899170', name: 'Pet Simulator 99' },
    { placeId: '6516141723', name: 'DOORS' },
    { placeId: '4924922222', name: 'Brookhaven RP' },
    { placeId: '4996049426', name: 'Anime Adventures' },
    { placeId: '16732694052', name: 'Fisch' },
    { placeId: '5511882441', name: 'Murder Mystery 2' },
    { placeId: '286090429', name: 'Arsenal' },
    { placeId: '920587237', name: 'Retail Tycoon 2' },
    { placeId: '185655149', name: 'Welcome to Bloxburg' },
    { placeId: '17017769292', name: 'Anime Defenders' },
    { placeId: '6284583030', name: 'Muscle Legends' },
  ],
  'simulator': [
    { placeId: '2753915549', name: 'Blox Fruits' },
    { placeId: '8737899170', name: 'Pet Simulator 99' },
    { placeId: '6284583030', name: 'Muscle Legends' },
    { placeId: '4520749081', name: 'King Legacy' },
    { placeId: '5511882441', name: 'Murder Mystery 2' },
    { placeId: '3956818381', name: 'Ninja Legends' },
    { placeId: '4490140733', name: 'Arm Wrestle Simulator' },
    { placeId: '3527629287', name: 'My Restaurant' },
  ],
  'tower defense': [
    { placeId: '4996049426', name: 'Anime Adventures' },
    { placeId: '4587034896', name: 'All Star Tower Defense' },
    { placeId: '17017769292', name: 'Anime Defenders' },
    { placeId: '5591597781', name: 'Toilet Tower Defense' },
    { placeId: '3260590327', name: 'Tower Defense Simulator' },
  ],
  'horror': [
    { placeId: '6516141723', name: 'DOORS' },
    { placeId: '6839171747', name: 'Apeirophobia' },
    { placeId: '5765928606', name: 'The Mimic' },
    { placeId: '3260590327', name: 'Piggy' },
    { placeId: '7551121821', name: 'Pressure' },
  ],
  'tycoon': [
    { placeId: '4490140733', name: 'Arm Wrestle Simulator' },
    { placeId: '3527629287', name: 'My Restaurant' },
    { placeId: '920587237', name: 'Retail Tycoon 2' },
    { placeId: '2414851778', name: 'Restaurant Tycoon 2' },
  ],
  'roleplay': [
    { placeId: '4924922222', name: 'Brookhaven RP' },
    { placeId: '185655149', name: 'Welcome to Bloxburg' },
    { placeId: '3351674303', name: 'Livetopia' },
    { placeId: '5774831100', name: 'Berry Avenue' },
  ],
  'adventure': [
    { placeId: '2753915549', name: 'Blox Fruits' },
    { placeId: '16732694052', name: 'Fisch' },
    { placeId: '4520749081', name: 'King Legacy' },
    { placeId: '6516141723', name: 'DOORS' },
  ],
  'anime': [
    { placeId: '4996049426', name: 'Anime Adventures' },
    { placeId: '4587034896', name: 'All Star Tower Defense' },
    { placeId: '2753915549', name: 'Blox Fruits' },
    { placeId: '17017769292', name: 'Anime Defenders' },
    { placeId: '2809202155', name: 'Anime Fighting Simulator' },
    { placeId: '4520749081', name: 'King Legacy' },
  ],
  'obby': [
    { placeId: '7991599693', name: 'Tower of Hell' },
    { placeId: '3527629287', name: 'Escape Room' },
  ],
}

function getCuratedGames(query: string): string[] {
  const q = query.toLowerCase().trim()
  const ids = new Set<string>()

  // First check for direct category match
  for (const [category, games] of Object.entries(CURATED_GAMES)) {
    if (q === category || q.includes(category) || category.includes(q)) {
      games.forEach(g => ids.add(g.placeId))
    }
  }

  // If no match, return popular games
  if (ids.size === 0) {
    CURATED_GAMES['popular'].forEach(g => ids.add(g.placeId))
  }

  return Array.from(ids)
}

// Better revenue estimation based on CCU and engagement
function estimateRevenue(ccu: number, likeRatio: number, visits: number): number {
  // Base: $2-5 per CCU per month depending on engagement
  // High like ratio = better monetization
  let revenuePerPlayer = 2.5

  if (likeRatio >= 90) revenuePerPlayer = 5.0
  else if (likeRatio >= 80) revenuePerPlayer = 3.5
  else if (likeRatio >= 70) revenuePerPlayer = 2.5
  else if (likeRatio >= 60) revenuePerPlayer = 1.5
  else revenuePerPlayer = 0.5

  // Factor in visits for maturity bonus
  const visitBonus = visits > 1_000_000_000 ? 1.5 : visits > 100_000_000 ? 1.2 : 1.0

  return Math.round(ccu * revenuePerPlayer * 30 * visitBonus)
}

// Minimum quality thresholds
const MIN_CCU = 50
const MIN_VISITS = 10000

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || ''
  const genre = searchParams.get('genre') || ''
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    // Always use curated games for reliability
    const placeIds = getCuratedGames(query || genre || 'popular').slice(0, limit + 5)

    // Fetch full details for each game
    const games = []

    for (const placeId of placeIds) {
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

        // QUALITY FILTER: Skip games with low player counts
        const ccu = game.playing || 0
        const visits = game.visits || 0

        if (ccu < MIN_CCU && visits < MIN_VISITS) {
          console.log(`Skipping ${game.name}: CCU=${ccu}, Visits=${visits}`)
          continue
        }

        const upVotes = vote?.upVotes || 0
        const downVotes = vote?.downVotes || 0
        const totalVotes = upVotes + downVotes
        const likeRatio = totalVotes > 0 ? (upVotes / totalVotes) * 100 : 0

        games.push({
          placeId,
          universeId,
          name: game.name,
          description: game.description,
          creator: {
            id: game.creator?.id,
            name: game.creator?.name || 'Unknown',
            type: game.creator?.type || 'User'
          },
          metrics: {
            visits: visits,
            favorites: game.favoritedCount || 0,
            currentPlayers: ccu,
            likes: upVotes,
            dislikes: downVotes,
            likeRatio: likeRatio.toFixed(1),
            estimatedRevenue: estimateRevenue(ccu, likeRatio, visits)
          },
          dates: {
            created: game.created,
            updated: game.updated
          },
          genre: game.genre || 'All',
        })

        // Rate limit to avoid API throttling
        await new Promise(r => setTimeout(r, 100))
      } catch (err) {
        console.error(`Failed to fetch ${placeId}:`, err)
      }
    }

    // Sort by CCU descending to show best games first
    games.sort((a, b) => b.metrics.currentPlayers - a.metrics.currentPlayers)

    return NextResponse.json({
      games: games.slice(0, limit),
      query,
      genre,
      source: 'curated'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

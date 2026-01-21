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

async function getGameThumbnails(universeIds: number[]) {
  try {
    const res = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeIds.join(',')}&size=512x512&format=Png`)
    const data = await res.json()
    return data.data || []
  } catch {
    return []
  }
}

function estimateRevenue(ccu: number, likeRatio: number): number {
  // More realistic revenue estimation
  // Based on ~$0.50-2.00 per 1000 daily visits
  const estimatedDailyVisits = ccu * 15 // CCU to daily visits multiplier

  let revenuePerThousand = 0.50
  if (likeRatio > 95) revenuePerThousand = 2.00
  else if (likeRatio > 90) revenuePerThousand = 1.50
  else if (likeRatio > 85) revenuePerThousand = 1.00
  else if (likeRatio < 70) revenuePerThousand = 0.25

  return Math.round((estimatedDailyVisits / 1000) * revenuePerThousand * 30)
}

function classifyGame(game: any) {
  const name = (game.name || '').toLowerCase()
  const desc = (game.description || '').toLowerCase()
  const genre = game.genre || 'Unknown'

  // Template detection
  let template = 'Unknown'
  let theme = 'Unknown'
  let coreLoop = 'Unknown'
  let subGenre = 'Unknown'

  // Simulator detection
  if (name.includes('simulator') || name.includes('sim')) {
    template = 'Simulator'
    coreLoop = 'Collect → Upgrade → Prestige'
    subGenre = 'Incremental'
  }
  // Tower Defense
  else if (name.includes('tower defense') || name.includes('td') || desc.includes('tower defense')) {
    template = 'Tower Defense'
    coreLoop = 'Place → Upgrade → Defend'
    subGenre = 'Tower Defense'
  }
  // Tycoon
  else if (name.includes('tycoon')) {
    template = 'Tycoon'
    coreLoop = 'Build → Manage → Expand'
    subGenre = 'Tycoon'
  }
  // RPG / Adventure
  else if (genre === 'Adventure' || genre === 'RPG') {
    template = 'Adventure RPG'
    coreLoop = 'Fight → Loot → Level Up'
    subGenre = 'Action RPG'
  }
  // Obby
  else if (name.includes('obby') || name.includes('obstacle')) {
    template = 'Obby'
    coreLoop = 'Navigate → Complete → Progress'
    subGenre = 'Obby'
  }
  // Horror
  else if (name.includes('horror') || desc.includes('horror') || desc.includes('scary')) {
    template = 'Horror'
    coreLoop = 'Survive → Escape → Win'
    subGenre = 'Horror Multiplayer'
  }

  // Theme detection
  if (name.includes('anime') || desc.includes('anime')) theme = 'Anime'
  else if (name.includes('pet') || desc.includes('pet')) theme = 'Pet/Animal'
  else if (name.includes('medieval') || desc.includes('medieval')) theme = 'Medieval'
  else if (name.includes('space') || desc.includes('space')) theme = 'Sci-Fi'
  else if (name.includes('superhero') || desc.includes('superhero')) theme = 'Superhero'

  return {
    genre,
    subGenre,
    theme,
    template,
    coreLoop
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { placeIds } = body

    if (!placeIds || !Array.isArray(placeIds) || placeIds.length === 0) {
      return NextResponse.json({ error: 'placeIds array is required' }, { status: 400 })
    }

    // Collect game data
    const games = []

    for (const placeId of placeIds) {
      try {
        const universeId = await getUniverseId(placeId.toString())
        if (!universeId) continue

        const [details, votes, thumbnails] = await Promise.all([
          getGameDetails([universeId]),
          getGameVotes([universeId]),
          getGameThumbnails([universeId])
        ])

        const game = details[0]
        const vote = votes[0]
        const thumbnail = thumbnails[0]

        if (!game) continue

        const likeRatio = vote
          ? (vote.upVotes / (vote.upVotes + vote.downVotes)) * 100
          : 0

        const classification = classifyGame(game)

        games.push({
          placeId: placeId.toString(),
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
          thumbnailUrl: thumbnail?.imageUrl,
          classification
        })

        // Delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 200))
      } catch (err) {
        console.error(`Failed to fetch game ${placeId}:`, err)
      }
    }

    if (games.length === 0) {
      return NextResponse.json({ error: 'No valid games found' }, { status: 404 })
    }

    // Analyze the group
    const dominantClassification = games[0].classification
    const qualificationChecks = []

    // Check 1: Revenue
    const highRevenueGames = games.filter(g => g.metrics.estimatedRevenue >= 10000)
    qualificationChecks.push({
      step: 'Revenue Check',
      passed: highRevenueGames.length > 0,
      detail: `${highRevenueGames.length}/${games.length} games estimated at $10k+/month`
    })

    // Check 2: Recency
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const recentGames = games.filter(g =>
      g.dates.created && new Date(g.dates.created) > sixMonthsAgo
    )
    qualificationChecks.push({
      step: 'Recency Check',
      passed: recentGames.length > 0,
      detail: `${recentGames.length}/${games.length} games created in last 6 months`
    })

    // Check 3: Recent successes
    const recentSuccesses = recentGames.filter(g =>
      g.metrics.estimatedRevenue >= 10000 &&
      parseFloat(g.metrics.likeRatio) >= 70
    )
    qualificationChecks.push({
      step: 'Recent Success Check',
      passed: recentSuccesses.length >= 2,
      detail: `${recentSuccesses.length} recent games are successful (need 2+)`
    })

    // Calculate score
    let score = 35 // Base score
    if (qualificationChecks[0].passed) score += 25
    if (qualificationChecks[1].passed) score += 20
    if (qualificationChecks[2].passed) score += 20

    const qualified = score >= 60 && recentSuccesses.length >= 2

    // Identify emerging stars
    const emergingStars = recentGames.filter(g =>
      g.metrics.currentPlayers >= 100 &&
      parseFloat(g.metrics.likeRatio) >= 70
    )

    return NextResponse.json({
      games,
      analysis: {
        groupName: `${dominantClassification.theme} ${dominantClassification.subGenre}`.trim(),
        classification: dominantClassification,
        qualified,
        score,
        checks: qualificationChecks,
        emergingStars: emergingStars.map(g => ({
          name: g.name,
          placeId: g.placeId,
          ccu: g.metrics.currentPlayers,
          revenue: g.metrics.estimatedRevenue
        })),
        recommendations: qualified
          ? ['This niche appears viable - look for differentiation opportunities']
          : ['Consider finding more recent successful games in this niche', 'Look for underserved variations of this format']
      }
    })
  } catch (error: any) {
    console.error('Analyze error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

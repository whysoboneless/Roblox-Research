import { NextResponse } from 'next/server'

// Roblox Explore API
const EXPLORE_API_BASE = 'https://apis.roblox.com/explore-api/v1'

async function getSortContent(sortId: string) {
  try {
    const url = `${EXPLORE_API_BASE}/get-sort-content?sessionId=0&sortId=${sortId}`
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 }
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

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

// Classification logic
function classifyGame(name: string, description: string, genre: string) {
  const n = name.toLowerCase()
  const d = (description || '').toLowerCase()

  let template = 'Unknown'
  let theme = 'Unknown'
  let coreLoop = 'Unknown'

  // Template detection
  if (n.includes('simulator') || n.includes('sim')) {
    template = 'Simulator'
    coreLoop = 'Collect → Upgrade → Prestige'
  } else if (n.includes('tower defense') || n.includes('td') || d.includes('tower defense') || d.includes('place units')) {
    template = 'Tower Defense'
    coreLoop = 'Place → Upgrade → Defend'
  } else if (n.includes('tycoon')) {
    template = 'Tycoon'
    coreLoop = 'Build → Manage → Expand'
  } else if (n.includes('obby') || n.includes('obstacle')) {
    template = 'Obby'
    coreLoop = 'Navigate → Complete → Progress'
  } else if (n.includes('horror') || d.includes('horror') || d.includes('scary') || d.includes('escape')) {
    template = 'Horror/Escape'
    coreLoop = 'Survive → Escape → Win'
  } else if (genre === 'Adventure' || genre === 'RPG' || d.includes('fight') || d.includes('battle')) {
    template = 'Action RPG'
    coreLoop = 'Fight → Loot → Level Up'
  }

  // Theme detection
  if (n.includes('anime') || d.includes('anime')) theme = 'Anime'
  else if (n.includes('pet') || d.includes('pet') || d.includes('hatch')) theme = 'Pet/Creature'
  else if (n.includes('brainrot') || d.includes('brainrot') || d.includes('skibidi')) theme = 'Meme/Brainrot'
  else if (n.includes('superhero') || d.includes('superhero')) theme = 'Superhero'
  else if (n.includes('medieval') || d.includes('medieval')) theme = 'Medieval'
  else if (n.includes('space') || d.includes('space')) theme = 'Sci-Fi'
  else if (n.includes('lucky') || n.includes('luck') || d.includes('lucky block')) theme = 'Lucky/Gacha'

  return { template, theme, coreLoop, genre }
}

function calculateLikeRatio(upVotes: number, downVotes: number): number {
  const total = upVotes + downVotes
  if (total === 0) return 0
  return (upVotes / total) * 100
}

function estimateRevenue(ccu: number, likeRatio: number): number {
  const estimatedDailyVisits = ccu * 15
  let revenuePerThousand = 0.50
  if (likeRatio > 95) revenuePerThousand = 2.00
  else if (likeRatio > 90) revenuePerThousand = 1.50
  else if (likeRatio > 80) revenuePerThousand = 1.00
  else if (likeRatio < 70) revenuePerThousand = 0.25
  return Math.round((estimatedDailyVisits / 1000) * revenuePerThousand * 30)
}

function getDaysOld(dateString: string | null): number {
  if (!dateString) return 999
  const created = new Date(dateString)
  const now = new Date()
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
}

// Auto-cluster games by template + theme
function clusterGames(games: any[]) {
  const clusters: Record<string, any[]> = {}

  for (const game of games) {
    // Create cluster key from template + theme
    const key = `${game.classification.template}::${game.classification.theme}`
    if (!clusters[key]) {
      clusters[key] = []
    }
    clusters[key].push(game)
  }

  // Convert to array and sort by cluster size
  return Object.entries(clusters)
    .map(([key, games]) => {
      const [template, theme] = key.split('::')
      const qualified = games.filter(g =>
        g.metrics.estimatedRevenue >= 10000 &&
        parseFloat(g.metrics.likeRatio) >= 70 &&
        g.daysOld <= 180
      )

      return {
        clusterId: key,
        template,
        theme,
        games,
        gameCount: games.length,
        qualifiedCount: qualified.length,
        isHotNiche: qualified.length >= 2, // 2+ qualified emerging = hot
        avgCCU: Math.round(games.reduce((sum, g) => sum + g.metrics.currentPlayers, 0) / games.length),
        avgRevenue: Math.round(games.reduce((sum, g) => sum + g.metrics.estimatedRevenue, 0) / games.length),
        avgLikeRatio: (games.reduce((sum, g) => sum + parseFloat(g.metrics.likeRatio), 0) / games.length).toFixed(1),
        emergingStars: qualified.map(g => ({
          name: g.name,
          placeId: g.placeId,
          ccu: g.metrics.currentPlayers,
          revenue: g.metrics.estimatedRevenue,
          daysOld: g.daysOld
        }))
      }
    })
    .filter(c => c.gameCount >= 1) // At least 1 game
    .sort((a, b) => {
      // Sort by: hot niches first, then by qualified count, then by game count
      if (a.isHotNiche !== b.isHotNiche) return b.isHotNiche ? 1 : -1
      if (a.qualifiedCount !== b.qualifiedCount) return b.qualifiedCount - a.qualifiedCount
      return b.gameCount - a.gameCount
    })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const maxMonths = parseInt(searchParams.get('maxMonths') || '6')
  const minCcu = parseInt(searchParams.get('minCcu') || '100')

  try {
    // Fetch emerging games
    const upAndComingData = await getSortContent('up-and-coming')

    if (!upAndComingData || !upAndComingData.games) {
      return NextResponse.json({
        error: 'Failed to fetch emerging games',
        clusters: []
      })
    }

    // Get detailed info
    const universeIds = upAndComingData.games.map((g: any) => g.universeId)
    const detailedGames = await getGameDetails(universeIds)
    const detailsMap = new Map(detailedGames.map((d: any) => [d.id, d]))

    // Process and classify games
    const games = upAndComingData.games
      .map((raw: any) => {
        const detail = detailsMap.get(raw.universeId) as any
        const likeRatio = calculateLikeRatio(raw.totalUpVotes || 0, raw.totalDownVotes || 0)
        const ccu = raw.playerCount || detail?.playing || 0
        const created = detail?.created || null
        const daysOld = getDaysOld(created)
        const classification = classifyGame(
          raw.name || detail?.name || '',
          detail?.description || '',
          detail?.genre || 'All'
        )

        return {
          placeId: raw.rootPlaceId?.toString() || '',
          universeId: raw.universeId,
          name: raw.name || detail?.name || 'Unknown',
          creator: detail?.creator?.name || 'Unknown',
          metrics: {
            visits: detail?.visits || 0,
            currentPlayers: ccu,
            likeRatio: likeRatio.toFixed(1),
            estimatedRevenue: estimateRevenue(ccu, likeRatio)
          },
          daysOld,
          isRecent: daysOld <= maxMonths * 30,
          classification
        }
      })
      .filter((g: any) => g.metrics.currentPlayers >= minCcu)

    // Auto-cluster by template + theme
    const clusters = clusterGames(games)

    // Find hot niches (2+ qualified emerging stars)
    const hotNiches = clusters.filter(c => c.isHotNiche)

    return NextResponse.json({
      totalGames: games.length,
      totalClusters: clusters.length,
      hotNicheCount: hotNiches.length,
      clusters,
      hotNiches,
      filters: { maxMonths, minCcu }
    })

  } catch (error: any) {
    console.error('Auto-cluster error:', error)
    return NextResponse.json({ error: error.message, clusters: [] }, { status: 500 })
  }
}

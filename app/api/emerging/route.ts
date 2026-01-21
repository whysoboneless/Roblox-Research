import { NextResponse } from 'next/server'

// Roblox Explore API - the official source for trending/emerging games
const EXPLORE_API_BASE = 'https://apis.roblox.com/explore-api/v1'

// Available sort types from Roblox
const SORT_IDS = {
  upAndComing: 'up-and-coming',    // NEW games gaining traction - THIS IS THE KEY ONE
  topTrending: 'top-trending',      // Currently trending
  topPlaying: 'top-playing-now',    // Highest CCU right now
}

// Get games from a specific sort
async function getSortContent(sortId: string, pageToken = '') {
  try {
    const url = `${EXPLORE_API_BASE}/get-sort-content?sessionId=0&sortId=${sortId}&pageToken=${pageToken}`
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 } // Cache for 5 minutes
    })
    if (!res.ok) return null
    return await res.json()
  } catch (err) {
    console.error('Failed to fetch sort content:', err)
    return null
  }
}

// Get detailed game info
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

// Estimate monthly revenue - more conservative/realistic
// Based on industry data: ~$0.50-2.00 per 1000 daily visits, varies by engagement
// CCU to daily visits ratio is roughly 10-20x (players come and go throughout day)
function estimateRevenue(ccu: number, likeRatio: number): number {
  // Estimate daily visits from CCU (CCU × average sessions per day factor)
  const estimatedDailyVisits = ccu * 15 // rough multiplier

  // Revenue per 1000 visits based on engagement (like ratio as proxy)
  let revenuePerThousand = 0.50 // base rate
  if (likeRatio > 95) revenuePerThousand = 2.00 // exceptional engagement
  else if (likeRatio > 90) revenuePerThousand = 1.50
  else if (likeRatio > 80) revenuePerThousand = 1.00
  else if (likeRatio < 70) revenuePerThousand = 0.25 // poor engagement

  // Monthly revenue = (daily visits / 1000) × rate × 30 days
  const monthlyRevenue = (estimatedDailyVisits / 1000) * revenuePerThousand * 30

  return Math.round(monthlyRevenue)
}

// Calculate like ratio from votes
function calculateLikeRatio(upVotes: number, downVotes: number): number {
  const total = upVotes + downVotes
  if (total === 0) return 0
  return (upVotes / total) * 100
}

// Check if game is recent (within maxMonths)
function isRecent(dateString: string | null, maxMonths: number): boolean {
  if (!dateString) return false
  const created = new Date(dateString)
  const now = new Date()
  const monthsDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 30)
  return monthsDiff <= maxMonths
}

// Calculate days since creation
function getDaysOld(dateString: string | null): number {
  if (!dateString) return 999
  const created = new Date(dateString)
  const now = new Date()
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || ''
  const maxMonths = parseInt(searchParams.get('maxMonths') || '6')
  const minCcu = parseInt(searchParams.get('minCcu') || '100')
  const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 50)

  try {
    // Fetch from the "Up-and-Coming" sort - this is Roblox's official emerging games list
    const upAndComingData = await getSortContent(SORT_IDS.upAndComing)

    if (!upAndComingData || !upAndComingData.games) {
      return NextResponse.json({
        error: 'Failed to fetch emerging games from Roblox',
        category,
        maxMonths,
        minCcu,
        games: [],
        totalFound: 0,
        recentCount: 0,
        source: 'roblox_explore_api'
      })
    }

    // Get universe IDs for detailed info
    const universeIds = upAndComingData.games.map((g: any) => g.universeId)
    const detailedGames = await getGameDetails(universeIds)

    // Create lookup map
    const detailsMap = new Map(detailedGames.map((d: any) => [d.id, d]))

    // Process games
    const games = upAndComingData.games
      .map((raw: any) => {
        const detail = detailsMap.get(raw.universeId) as any
        const likeRatio = calculateLikeRatio(raw.totalUpVotes || 0, raw.totalDownVotes || 0)
        const ccu = raw.playerCount || detail?.playing || 0
        const created = detail?.created || null
        const daysOld = getDaysOld(created)
        const recent = isRecent(created, maxMonths)

        // Calculate emerging score - prioritize newer games with high engagement
        // Formula: CCU * likeRatio% * (recency bonus) * (engagement multiplier)
        const recencyMultiplier = daysOld < 30 ? 3 : daysOld < 90 ? 2 : daysOld < 180 ? 1.5 : 1
        const engagementMultiplier = likeRatio > 90 ? 1.5 : likeRatio > 80 ? 1.2 : 1
        const emergingScore = Math.round(
          ccu * (likeRatio / 100) * recencyMultiplier * engagementMultiplier
        )

        return {
          placeId: raw.rootPlaceId?.toString() || '',
          universeId: raw.universeId,
          name: raw.name || detail?.name || 'Unknown',
          creator: {
            name: detail?.creator?.name || 'Unknown',
            type: detail?.creator?.type || 'User'
          },
          metrics: {
            visits: detail?.visits || 0,
            currentPlayers: ccu,
            likeRatio: likeRatio.toFixed(1),
            upVotes: raw.totalUpVotes || 0,
            downVotes: raw.totalDownVotes || 0,
            estimatedRevenue: estimateRevenue(ccu, likeRatio)
          },
          dates: {
            created: created,
            updated: detail?.updated || null
          },
          daysOld,
          genre: detail?.genre || 'All',
          isRecent: recent,
          emergingScore,
          ageRating: raw.ageRecommendationDisplayName || null
        }
      })
      // Filter by minimum CCU
      .filter((g: any) => g.metrics.currentPlayers >= minCcu)
      // Sort by emerging score (best opportunities first)
      .sort((a: any, b: any) => b.emergingScore - a.emergingScore)

    // Filter by category if specified (simple keyword match on name)
    const filteredGames = category
      ? games.filter((g: any) =>
          g.name.toLowerCase().includes(category.toLowerCase()) ||
          g.genre.toLowerCase().includes(category.toLowerCase())
        )
      : games

    // Get only recent games for the main list
    const recentGames = filteredGames.filter((g: any) => g.isRecent)

    return NextResponse.json({
      category: category || 'all',
      maxMonths,
      minCcu,
      games: recentGames.slice(0, limit),
      allGames: filteredGames.slice(0, limit), // Also include non-recent for context
      totalFound: filteredGames.length,
      recentCount: recentGames.length,
      source: 'roblox_explore_api',
      sortDescription: upAndComingData.topicLayoutData?.infoText || 'New experiences gaining traction'
    })

  } catch (error: any) {
    console.error('Emerging games error:', error)
    return NextResponse.json({
      error: error.message,
      games: [],
      source: 'roblox_explore_api'
    }, { status: 500 })
  }
}

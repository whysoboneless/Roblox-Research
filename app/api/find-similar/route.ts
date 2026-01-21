import { NextResponse } from 'next/server'

// Find Similar Games API
// Takes ONE game's Place ID and finds similar games to form a competitor group

interface GameData {
  placeId: string
  universeId: number
  name: string
  description: string
  genre: string
  creator: { name: string; type: string }
  metrics: {
    visits: number
    currentPlayers: number
    likeRatio: string
    estimatedRevenue: number
  }
}

// Detect game vertical from name/description
function detectVertical(name: string, description: string): string {
  const combined = `${name} ${description}`.toLowerCase()

  if (combined.includes('tower defense') || combined.includes(' td ') || combined.includes('defenders')) return 'tower-defense'
  if (combined.includes('simulator') || combined.includes('sim')) return 'simulator'
  if (combined.includes('tycoon')) return 'tycoon'
  if (combined.includes('obby') || combined.includes('parkour')) return 'obby'
  if (combined.includes('horror') || combined.includes('scary') || combined.includes('backroom')) return 'horror'
  if (combined.includes('rpg') || combined.includes('sword') || combined.includes('dungeon')) return 'rpg'
  if (combined.includes('pet') || combined.includes('hatch') || combined.includes('egg')) return 'pet'
  if (combined.includes('roleplay') || combined.includes(' rp')) return 'roleplay'
  if (combined.includes('fighting') || combined.includes('pvp') || combined.includes('battle')) return 'fighting'
  if (combined.includes('racing') || combined.includes('car') || combined.includes('drive')) return 'racing'

  return 'other'
}

// Detect theme from name/description
function detectTheme(name: string, description: string): string {
  const combined = `${name} ${description}`.toLowerCase()

  if (combined.includes('anime') || combined.includes('manga')) return 'anime'
  if (combined.includes('brainrot') || combined.includes('skibidi') || combined.includes('meme') || combined.includes('gyatt')) return 'brainrot'
  if (combined.includes('horror') || combined.includes('scary')) return 'horror'
  if (combined.includes('cute') || combined.includes('kawaii')) return 'cute'
  if (combined.includes('military') || combined.includes('army') || combined.includes('war')) return 'military'
  if (combined.includes('space') || combined.includes('galaxy') || combined.includes('alien')) return 'scifi'
  if (combined.includes('fantasy') || combined.includes('magic') || combined.includes('wizard')) return 'fantasy'

  return 'general'
}

// Build search keywords from game characteristics
function buildSearchKeywords(vertical: string, theme: string, name: string): string[] {
  const keywords: string[] = []

  // Vertical-based keywords
  const verticalKeywords: Record<string, string[]> = {
    'simulator': ['simulator 2025', 'simulator new', 'sim game'],
    'tower-defense': ['tower defense', 'td game', 'defenders'],
    'tycoon': ['tycoon', 'tycoon 2025', 'business simulator'],
    'obby': ['obby', 'parkour', 'obstacle course'],
    'horror': ['horror game', 'scary game', 'horror 2025'],
    'rpg': ['rpg roblox', 'sword game', 'dungeon game'],
    'pet': ['pet simulator', 'pet game', 'hatching game'],
    'roleplay': ['roleplay', 'rp game', 'life simulator'],
    'fighting': ['fighting game', 'pvp game', 'battle game'],
    'racing': ['racing game', 'car game', 'driving game'],
    'other': ['new game', 'popular game']
  }

  // Theme-based keywords
  const themeKeywords: Record<string, string[]> = {
    'anime': ['anime', 'anime game'],
    'brainrot': ['brainrot', 'skibidi', 'meme game'],
    'horror': ['horror', 'scary'],
    'cute': ['cute game', 'kawaii'],
    'military': ['military', 'war game'],
    'scifi': ['space game', 'sci-fi'],
    'fantasy': ['fantasy', 'magic game'],
    'general': []
  }

  keywords.push(...(verticalKeywords[vertical] || []))
  keywords.push(...(themeKeywords[theme] || []))

  // Add combined keyword
  if (theme !== 'general') {
    keywords.push(`${theme} ${vertical}`)
  }

  return keywords.slice(0, 3) // Limit to 3 searches
}

// Search Roblox for games
async function searchRoblox(keyword: string): Promise<GameData[]> {
  try {
    const searchRes = await fetch(
      `https://games.roblox.com/v1/games/list?sortToken=&gameFilter=1&pageNumber=1&startRows=0&maxRows=20&keyword=${encodeURIComponent(keyword)}`,
      { next: { revalidate: 300 } }
    )

    if (!searchRes.ok) return []

    const searchData = await searchRes.json()
    const games = searchData.games || []

    return games.map((g: any) => ({
      placeId: g.placeId?.toString() || '',
      universeId: g.universeId || 0,
      name: g.name || 'Unknown',
      description: g.gameDescription || '',
      genre: g.genre || '',
      creator: { name: g.creatorName || 'Unknown', type: g.creatorType || '' },
      metrics: {
        visits: g.placeVisits || 0,
        currentPlayers: g.playerCount || 0,
        likeRatio: g.totalUpVotes && g.totalDownVotes
          ? ((g.totalUpVotes / (g.totalUpVotes + g.totalDownVotes)) * 100).toFixed(1)
          : '0',
        estimatedRevenue: Math.round((g.playerCount || 0) * 50) // Rough estimate
      }
    }))
  } catch (err) {
    console.error(`Search failed for "${keyword}":`, err)
    return []
  }
}

// Get full game details
async function getGameDetails(placeId: string): Promise<GameData | null> {
  try {
    // Get universe ID first
    const placeRes = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`)
    if (!placeRes.ok) return null
    const placeData = await placeRes.json()
    const universeId = placeData.universeId

    // Get game details
    const detailsRes = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`)
    if (!detailsRes.ok) return null
    const detailsData = await detailsRes.json()
    const game = detailsData.data?.[0]
    if (!game) return null

    // Get votes
    const votesRes = await fetch(`https://games.roblox.com/v1/games/votes?universeIds=${universeId}`)
    const votesData = await votesRes.json()
    const votes = votesData.data?.[0]
    const likeRatio = votes?.upVotes && votes?.downVotes
      ? ((votes.upVotes / (votes.upVotes + votes.downVotes)) * 100).toFixed(1)
      : '0'

    return {
      placeId,
      universeId,
      name: game.name,
      description: game.description || '',
      genre: game.genre || '',
      creator: { name: game.creator?.name || 'Unknown', type: game.creator?.type || '' },
      metrics: {
        visits: game.visits || 0,
        currentPlayers: game.playing || 0,
        likeRatio,
        estimatedRevenue: Math.round((game.playing || 0) * 50)
      }
    }
  } catch (err) {
    console.error(`Failed to get details for ${placeId}:`, err)
    return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const placeId = searchParams.get('placeId')
  const limit = parseInt(searchParams.get('limit') || '5')

  if (!placeId) {
    return NextResponse.json({ error: 'placeId required' }, { status: 400 })
  }

  try {
    // Step 1: Get the source game details
    const sourceGame = await getGameDetails(placeId)
    if (!sourceGame) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Step 2: Detect vertical and theme
    const vertical = detectVertical(sourceGame.name, sourceGame.description)
    const theme = detectTheme(sourceGame.name, sourceGame.description)

    // Step 3: Build search keywords
    const keywords = buildSearchKeywords(vertical, theme, sourceGame.name)

    // Step 4: Search for similar games
    const allGames: GameData[] = []
    const seenIds = new Set<string>([placeId]) // Exclude source game

    for (const keyword of keywords) {
      const results = await searchRoblox(keyword)
      for (const game of results) {
        if (!seenIds.has(game.placeId) && game.placeId) {
          seenIds.add(game.placeId)
          allGames.push(game)
        }
      }
    }

    // Step 5: Score and rank similar games
    const scoredGames = allGames.map(game => {
      const gameVertical = detectVertical(game.name, game.description)
      const gameTheme = detectTheme(game.name, game.description)

      let score = 0

      // Same vertical = big bonus
      if (gameVertical === vertical) score += 50

      // Same theme = bonus
      if (gameTheme === theme) score += 30

      // CCU bonus (normalized)
      score += Math.min(20, game.metrics.currentPlayers / 500)

      return { ...game, similarityScore: score }
    })

    // Sort by similarity score, then by CCU
    scoredGames.sort((a, b) => {
      if (b.similarityScore !== a.similarityScore) {
        return b.similarityScore - a.similarityScore
      }
      return b.metrics.currentPlayers - a.metrics.currentPlayers
    })

    // Take top N similar games
    const similarGames = scoredGames.slice(0, limit)

    return NextResponse.json({
      sourceGame,
      detectedVertical: vertical,
      detectedTheme: theme,
      searchKeywords: keywords,
      similarGames,
      totalFound: scoredGames.length,
      // Include all place IDs for easy analysis
      allPlaceIds: [placeId, ...similarGames.map(g => g.placeId)]
    })

  } catch (err) {
    console.error('Find similar error:', err)
    return NextResponse.json({ error: 'Failed to find similar games' }, { status: 500 })
  }
}

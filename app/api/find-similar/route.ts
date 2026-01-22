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

// Detect game vertical from name/description - more specific for better matching
function detectVertical(name: string, description: string): string {
  const combined = `${name} ${description}`.toLowerCase()

  // Escape/Survival/Disaster games - check FIRST (high priority keywords)
  if (combined.includes('escape') || combined.includes('tsunami') || combined.includes('flood') ||
      combined.includes('survive') || combined.includes('disaster') || combined.includes('run from') ||
      combined.includes('avoid') || combined.includes('hide from') || combined.includes('run away') ||
      combined.includes('earthquake') || combined.includes('volcano') || combined.includes('meteor')) {
    return 'escape-survival'
  }

  // Lucky block / breaking games
  if (combined.includes('lucky block') || combined.includes('mystery box') ||
      combined.includes('break a') || combined.includes('break the') ||
      (combined.includes('break') && combined.includes('block'))) {
    return 'lucky-block'
  }

  // Card collection games
  if (combined.includes('card collection') || combined.includes('card game') ||
      combined.includes('trading card') || combined.includes('collect card') ||
      (combined.includes('card') && combined.includes('collection'))) {
    return 'card-collection'
  }

  // Spin/gacha games
  if (combined.includes('spin a') || combined.includes('spin the') || combined.includes('gacha') ||
      combined.includes('wheel') || combined.includes('spinner') ||
      (combined.includes('spin') && !combined.includes('spider'))) {
    return 'spin-gacha'
  }

  // Mining/digging games
  if (combined.includes('mine') || combined.includes('mining') || combined.includes('dig') ||
      combined.includes('drill') || combined.includes('excavate')) {
    return 'mining-simulator'
  }

  // Specific mechanics
  if (combined.includes('clicker') || combined.includes('click to')) return 'clicker'
  if (combined.includes('collect') || combined.includes('collector')) return 'collector'
  if (combined.includes('merge') || combined.includes('combining') || combined.includes('fuse')) return 'merge'

  // Tower defense
  if (combined.includes('tower defense') || combined.includes(' td ') ||
      combined.includes('defenders') || combined.includes('defend')) {
    return 'tower-defense'
  }

  // Simulators (check after more specific types)
  if (combined.includes('simulator') || combined.includes('sim ')) return 'simulator'
  if (combined.includes('tycoon')) return 'tycoon'
  if (combined.includes('obby') || combined.includes('parkour') || combined.includes('obstacle')) return 'obby'
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

  // Extract key words from the game name itself
  const nameWords = name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !['game', 'the', 'for', 'and'].includes(w))

  // Add the most distinctive word from the name
  if (nameWords.length > 0) {
    keywords.push(nameWords[0])
  }

  // Vertical-based keywords
  const verticalKeywords: Record<string, string[]> = {
    'simulator': ['simulator', 'simulator 2025'],
    'tower-defense': ['tower defense', 'defenders', 'anime defenders'],
    'tycoon': ['tycoon', 'tycoon 2025'],
    'obby': ['obby', 'parkour'],
    'horror': ['horror', 'scary', 'backrooms'],
    'rpg': ['rpg', 'sword', 'dungeon'],
    'pet': ['pet simulator', 'hatching'],
    'roleplay': ['roleplay', 'brookhaven'],
    'fighting': ['fighting', 'pvp', 'battle'],
    'racing': ['racing', 'car', 'driving'],
    'escape-survival': ['escape tsunami', 'survive disaster', 'escape flood', 'escape game'],
    'mining-simulator': ['mining simulator', 'mine', 'dig'],
    'clicker': ['clicker', 'clicking simulator'],
    'collector': ['collect', 'collector'],
    'merge': ['merge', 'merge game'],
    'lucky-block': ['lucky block', 'break a lucky'],
    'card-collection': ['card collection', 'anime card', 'trading card'],
    'spin-gacha': ['spin a', 'gacha', 'spinner'],
    'other': ['simulator', 'game 2025']
  }

  // Theme-based keywords
  const themeKeywords: Record<string, string[]> = {
    'anime': ['anime', 'anime game'],
    'brainrot': ['brainrot', 'skibidi', 'toilet tower'],
    'horror': ['horror', 'scary'],
    'cute': ['cute', 'kawaii'],
    'military': ['military', 'war'],
    'scifi': ['space', 'galaxy'],
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

// Search Roblox using the Games Discovery API
async function searchRoblox(keyword: string): Promise<GameData[]> {
  try {
    // Use the Roblox Games Search API (v1/games/search is deprecated, use omni-search)
    const searchUrl = `https://apis.roblox.com/games-omni-search/v1/search?searchQuery=${encodeURIComponent(keyword)}&pageToken=&sessionId=0&maxRows=30`
    console.log(`[find-similar] Searching via omni-search: ${keyword}`)

    const searchRes = await fetch(searchUrl, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 }
    })

    if (!searchRes.ok) {
      console.log(`[find-similar] Omni-search failed: ${searchRes.status}`)
      // Fallback: try the discovery API with keyword sort
      return await searchViaDiscovery(keyword)
    }

    const searchData = await searchRes.json()
    const entries = searchData.entries || []
    console.log(`[find-similar] Omni-search found ${entries.length} results for "${keyword}"`)

    // Get universe details for the found games
    const universeIds = entries
      .filter((e: any) => e.contentType === 'Game' && e.universeId)
      .map((e: any) => e.universeId)
      .slice(0, 20)

    if (universeIds.length === 0) {
      return await searchViaDiscovery(keyword)
    }

    // Get detailed info
    const detailsRes = await fetch(
      `https://games.roblox.com/v1/games?universeIds=${universeIds.join(',')}`,
      { headers: { 'Accept': 'application/json' } }
    )
    if (!detailsRes.ok) return []
    const detailsData = await detailsRes.json()
    const games = detailsData.data || []

    return games.map((g: any) => ({
      placeId: g.rootPlaceId?.toString() || '',
      universeId: g.id || 0,
      name: g.name || 'Unknown',
      description: g.description || '',
      genre: g.genre || '',
      creator: { name: g.creator?.name || 'Unknown', type: g.creator?.type || '' },
      metrics: {
        visits: g.visits || 0,
        currentPlayers: g.playing || 0,
        likeRatio: '0', // Will be updated
        estimatedRevenue: Math.round((g.playing || 0) * 50)
      }
    }))
  } catch (err) {
    console.error(`Search failed for "${keyword}":`, err)
    return await searchViaDiscovery(keyword)
  }
}

// Fallback: Search via the Explore/Discovery API
async function searchViaDiscovery(keyword: string): Promise<GameData[]> {
  try {
    // Get "Up-and-Coming" games and filter by keyword
    const discoverUrl = `https://apis.roblox.com/explore-api/v1/get-sort-content?sessionId=0&sortId=up-and-coming&pageToken=`
    console.log(`[find-similar] Fallback: searching Up-and-Coming for "${keyword}"`)

    const discoverRes = await fetch(discoverUrl, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 }
    })

    if (!discoverRes.ok) {
      console.log(`[find-similar] Discovery API failed: ${discoverRes.status}`)
      return []
    }

    const discoverData = await discoverRes.json()
    const allGames = discoverData.games || []

    // Filter games that match the keyword in name
    const keywordLower = keyword.toLowerCase()
    const matchingGames = allGames.filter((g: any) => {
      const name = (g.name || '').toLowerCase()
      return name.includes(keywordLower) ||
             keywordLower.split(' ').some((word: string) => word.length > 3 && name.includes(word))
    })

    console.log(`[find-similar] Discovery found ${matchingGames.length} matches for "${keyword}"`)

    // Get universe details
    const universeIds = matchingGames.slice(0, 20).map((g: any) => g.universeId)
    if (universeIds.length === 0) return []

    const detailsRes = await fetch(
      `https://games.roblox.com/v1/games?universeIds=${universeIds.join(',')}`,
      { headers: { 'Accept': 'application/json' } }
    )
    if (!detailsRes.ok) return []
    const detailsData = await detailsRes.json()

    // Create lookup map
    const detailsMap = new Map((detailsData.data || []).map((d: any) => [d.id, d]))

    return matchingGames.slice(0, 20).map((raw: any) => {
      const detail = detailsMap.get(raw.universeId) as any
      return {
        placeId: raw.rootPlaceId?.toString() || detail?.rootPlaceId?.toString() || '',
        universeId: raw.universeId || 0,
        name: raw.name || detail?.name || 'Unknown',
        description: detail?.description || '',
        genre: detail?.genre || '',
        creator: { name: detail?.creator?.name || 'Unknown', type: detail?.creator?.type || '' },
        metrics: {
          visits: detail?.visits || 0,
          currentPlayers: raw.playerCount || detail?.playing || 0,
          likeRatio: raw.totalUpVotes && raw.totalDownVotes
            ? ((raw.totalUpVotes / (raw.totalUpVotes + raw.totalDownVotes)) * 100).toFixed(1)
            : '0',
          estimatedRevenue: Math.round((raw.playerCount || detail?.playing || 0) * 50)
        }
      }
    })
  } catch (err) {
    console.error(`Discovery search failed for "${keyword}":`, err)
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

    // Step 5: NO FALLBACK - don't add random unrelated games
    // If keyword search fails, that's fine - return fewer or no results
    // Bad competitors are worse than no competitors

    // Step 6: Score and rank similar games
    // CRITICAL: Games must have similar MECHANICS to be true competitors
    // Theme is secondary - you can have a brainrot TD and a brainrot simulator, those are NOT competitors
    const scoredGames = allGames.map(game => {
      const gameVertical = detectVertical(game.name, game.description)
      const gameTheme = detectTheme(game.name, game.description)

      let score = 0

      // SAME VERTICAL/MECHANIC = MUST HAVE (70 points)
      // This is the core requirement for being a competitor
      if (gameVertical === vertical) {
        score += 70
      } else {
        // Different vertical = likely NOT a real competitor
        // Still give some points if at least related
        const relatedVerticals: Record<string, string[]> = {
          'simulator': ['clicker', 'collector', 'mining-simulator', 'tycoon'],
          'mining-simulator': ['simulator', 'collector', 'clicker'],
          'escape-survival': ['obby', 'horror', 'other'], // escape games often mis-detected
          'lucky-block': ['simulator', 'mining-simulator', 'collector', 'clicker', 'spin-gacha'],
          'clicker': ['simulator', 'collector', 'mining-simulator'],
          'collector': ['simulator', 'pet', 'clicker', 'card-collection'],
          'card-collection': ['collector', 'pet', 'spin-gacha'],
          'spin-gacha': ['lucky-block', 'collector', 'card-collection'],
          'obby': ['escape-survival', 'parkour'],
          'horror': ['escape-survival', 'other'],
          'tycoon': ['simulator', 'clicker'],
          'tower-defense': ['rpg', 'fighting'],
          'pet': ['collector', 'simulator', 'card-collection'],
          'other': ['escape-survival', 'obby', 'horror'] // 'other' often means undetected escape games
        }
        if (relatedVerticals[vertical]?.includes(gameVertical)) {
          score += 30 // Related but not same
        }
        // Otherwise gets 0 for vertical - they're different game types
      }

      // Same theme = small bonus (15 points)
      // Nice to have but NOT required for competitor grouping
      if (gameTheme === theme) score += 15

      // CCU bonus (normalized, max 15 points)
      // More popular = more relevant as competitor
      score += Math.min(15, game.metrics.currentPlayers / 1000)

      return { ...game, similarityScore: score, detectedVertical: gameVertical, detectedTheme: gameTheme }
    })

    // Filter out games with low scores (not real competitors)
    // Threshold: 70 = SAME VERTICAL required
    // Don't show loosely related games - that's not helpful
    const qualifiedGames = scoredGames.filter(g => g.similarityScore >= 70)

    // Sort by similarity score, then by CCU
    qualifiedGames.sort((a, b) => {
      if (b.similarityScore !== a.similarityScore) {
        return b.similarityScore - a.similarityScore
      }
      return b.metrics.currentPlayers - a.metrics.currentPlayers
    })

    // Take top N similar games
    const similarGames = qualifiedGames.slice(0, limit)

    return NextResponse.json({
      sourceGame,
      detectedVertical: vertical,
      detectedTheme: theme,
      searchKeywords: keywords,
      similarGames,
      totalFound: scoredGames.length,
      qualifiedCount: qualifiedGames.length,
      // Include all place IDs for easy analysis
      allPlaceIds: [placeId, ...similarGames.map(g => g.placeId)]
    })

  } catch (err) {
    console.error('Find similar error:', err)
    return NextResponse.json({ error: 'Failed to find similar games' }, { status: 500 })
  }
}

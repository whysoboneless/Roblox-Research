import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { checkRateLimit, getClientIdentifier, rateLimitResponse } from '@/lib/rate-limit'

// Only create Anthropic client if API key is available
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null

// Unified Group Analysis API
// Takes array of Place IDs → AI classifies each → Finds overlaps → Generates replication guide

interface GameData {
  placeId: string
  universeId?: number
  name: string
  description: string
  metrics: {
    ccu: number
    visits: number
    likeRatio: number
    estimatedRevenue: number
  }
  daysOld: number
  gamepasses?: any[]
  badges?: any[]
}

interface GameClassification {
  // Structural Characteristics
  category: string
  vertical: string
  subVertical: string
  theme: string
  complexity: string
  targetAge: string

  // Game Formula
  coreMechanic: string
  loopSteps: string[]
  engagementHook: string

  // Patterns (vertical-specific)
  retention: string[]
  monetization: string[]
  viral: string[]

  // Meta
  similarTo: string[]
}

// Get game details from Roblox API
async function fetchGameData(placeId: string): Promise<GameData | null> {
  try {
    // Get universe ID
    const universeRes = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`)
    const universeData = await universeRes.json()
    const universeId = universeData.universeId

    if (!universeId) return null

    // Fetch details, votes, gamepasses in parallel
    const [detailsRes, votesRes, gamepassesRes] = await Promise.all([
      fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`),
      fetch(`https://games.roblox.com/v1/games/votes?universeIds=${universeId}`),
      fetch(`https://games.roblox.com/v1/games/${universeId}/game-passes?limit=50`)
    ])

    const [detailsData, votesData, gamepassesData] = await Promise.all([
      detailsRes.json(),
      votesRes.json(),
      gamepassesRes.json()
    ])

    const details = detailsData.data?.[0]
    const votes = votesData.data?.[0]

    if (!details) return null

    const likeRatio = votes
      ? (votes.upVotes / (votes.upVotes + votes.downVotes)) * 100
      : 0

    const daysOld = Math.floor(
      (Date.now() - new Date(details.created).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Revenue estimation
    const estimatedDailyVisits = details.playing * 15
    let revenuePerThousand = 0.50
    if (likeRatio > 95) revenuePerThousand = 2.00
    else if (likeRatio > 90) revenuePerThousand = 1.50
    else if (likeRatio > 80) revenuePerThousand = 1.00
    else if (likeRatio < 70) revenuePerThousand = 0.25

    return {
      placeId,
      universeId,
      name: details.name,
      description: details.description || '',
      metrics: {
        ccu: details.playing,
        visits: details.visits,
        likeRatio: parseFloat(likeRatio.toFixed(1)),
        estimatedRevenue: Math.round((estimatedDailyVisits / 1000) * revenuePerThousand * 30)
      },
      daysOld,
      gamepasses: gamepassesData.data || []
    }
  } catch (err) {
    console.error(`Failed to fetch game ${placeId}:`, err)
    return null
  }
}

// Fallback classifier using pattern matching (when AI is not available)
function classifyGameFallback(game: GameData): GameClassification {
  const nameLower = game.name.toLowerCase()
  const descLower = game.description.toLowerCase()
  const combined = `${nameLower} ${descLower}`

  // Detect vertical
  let vertical = 'Simulator'
  let category = 'Simulation'
  if (combined.includes('tower defense') || combined.includes('td')) {
    vertical = 'Tower Defense'; category = 'Strategy'
  } else if (combined.includes('tycoon')) {
    vertical = 'Tycoon'; category = 'Simulation'
  } else if (combined.includes('obby') || combined.includes('parkour')) {
    vertical = 'Obby'; category = 'Adventure'
  } else if (combined.includes('horror') || combined.includes('scary')) {
    vertical = 'Horror'; category = 'Adventure'
  } else if (combined.includes('rpg') || combined.includes('sword') || combined.includes('fight')) {
    vertical = 'Action RPG'; category = 'Action'
  } else if (combined.includes('pet') || combined.includes('hatch')) {
    vertical = 'Pet Collection'; category = 'Simulation'
  } else if (combined.includes('roleplay') || combined.includes('rp')) {
    vertical = 'Roleplay'; category = 'Social'
  }

  // Detect theme
  let theme = 'Fantasy'
  if (combined.includes('anime')) theme = 'Anime'
  else if (combined.includes('brainrot') || combined.includes('skibidi') || combined.includes('meme')) theme = 'Meme-Brainrot'
  else if (combined.includes('horror') || combined.includes('scary')) theme = 'Horror'
  else if (combined.includes('cute') || combined.includes('kawaii')) theme = 'Cute'
  else if (combined.includes('space') || combined.includes('sci-fi')) theme = 'Sci-Fi'

  // Detect patterns from gamepasses
  const monetization: string[] = []
  const gamepassNames = game.gamepasses?.map((gp: any) => gp.name.toLowerCase()).join(' ') || ''
  if (gamepassNames.includes('2x') || gamepassNames.includes('double')) monetization.push('2x multiplier pass')
  if (gamepassNames.includes('auto')) monetization.push('Auto-collect')
  if (gamepassNames.includes('vip')) monetization.push('VIP bundle')
  if (gamepassNames.includes('skip')) monetization.push('Skip content')
  if (monetization.length === 0) monetization.push('Standard gamepasses')

  // Default patterns based on vertical
  const retentionMap: Record<string, string[]> = {
    'Simulator': ['Prestige system', 'Daily rewards', 'Leaderboards'],
    'Tower Defense': ['Unit collection', 'Challenge modes', 'Clans'],
    'Tycoon': ['Automation unlocks', 'Expansion areas', 'Prestige'],
    'Pet Collection': ['Egg hatching', 'Evolution', 'Trading'],
    'Horror': ['Story completion', 'Multiple endings', 'Collectibles'],
    'Obby': ['Checkpoints', 'Speed runs', 'Unlockable trails'],
    'Action RPG': ['Level progression', 'Gear collection', 'PvP ranks'],
    'Roleplay': ['Housing', 'Jobs', 'Social connections']
  }

  const viralMap: Record<string, string[]> = {
    'Simulator': ['Big number flexing', 'Leaderboard competition', 'Promo codes'],
    'Tower Defense': ['Trading communities', 'Tier list discussions', 'Update hype'],
    'Tycoon': ['Base showcasing', 'Speedruns', 'Collaboration'],
    'Pet Collection': ['Trading economy', 'Rare pet flexing', 'Giveaways'],
    'Horror': ['Jump scare reactions', 'Lore theories', 'Speedrun community'],
    'Obby': ['Speedrun records', 'Rage compilations', 'Challenge videos'],
    'Action RPG': ['Build showcasing', 'PvP clips', 'Boss guides'],
    'Roleplay': ['Roleplay content', 'Building showcases', 'Drama content']
  }

  // Determine complexity based on vertical
  const complexityMap: Record<string, string> = {
    'Simulator': 'Low-Medium',
    'Obby': 'Low',
    'Tycoon': 'Low-Medium',
    'Tower Defense': 'Medium',
    'Horror': 'Medium',
    'Pet Collection': 'Medium',
    'Action RPG': 'Medium-High',
    'Roleplay': 'Medium-High'
  }

  return {
    category,
    vertical,
    subVertical: `${theme} ${vertical}`,
    theme,
    complexity: complexityMap[vertical] || 'Medium',
    targetAge: '8-12',
    coreMechanic: vertical === 'Simulator' ? 'Collect → Upgrade → Prestige' :
                  vertical === 'Tower Defense' ? 'Place → Defend → Upgrade' :
                  vertical === 'Tycoon' ? 'Build → Earn → Expand' :
                  vertical === 'Pet Collection' ? 'Hatch → Evolve → Trade' :
                  'Play → Progress → Unlock',
    loopSteps: ['Start', 'Progress', 'Unlock', 'Repeat'],
    engagementHook: 'Progression satisfaction',
    retention: retentionMap[vertical] || ['Daily rewards', 'Collection'],
    monetization,
    viral: viralMap[vertical] || ['Social sharing', 'Promo codes'],
    similarTo: [`Popular ${vertical} games`]
  }
}

// AI classify a single game (with fallback)
async function classifyGame(game: GameData): Promise<GameClassification | null> {
  // If no AI available, use fallback classifier
  if (!anthropic) {
    console.log(`Using fallback classifier for ${game.name} (no API key)`)
    return classifyGameFallback(game)
  }

  try {
    const gamepassInfo = game.gamepasses?.length
      ? game.gamepasses.map((gp: any) => `${gp.name} (${gp.price}R$)`).join(', ')
      : 'None detected'

    const prompt = `Analyze this Roblox game and extract its classification and patterns.

GAME:
Name: ${game.name}
Description: ${game.description.slice(0, 1000)}
CCU: ${game.metrics.ccu}
Est. Revenue: $${game.metrics.estimatedRevenue}/month
Like Ratio: ${game.metrics.likeRatio}%
Days Old: ${game.daysOld}
Gamepasses: ${gamepassInfo}

Return JSON only (no markdown):
{
  "category": "Simulation/Action/Strategy/Adventure/Social",
  "vertical": "Simulator/Tower Defense/Tycoon/Survival/Pet Collection/Obby/Horror/etc",
  "subVertical": "Theme + Vertical, e.g. 'Brainrot Simulator' or 'Anime Tower Defense'",
  "theme": "Meme-Brainrot/Anime/Horror/Fantasy/Cute/Realistic/Sci-Fi",
  "complexity": "Low/Low-Medium/Medium/Medium-High/High",
  "targetAge": "6-9/8-12/10-14/13-17/15+",

  "coreMechanic": "The gameplay loop in ACTION → ACTION → ACTION format",
  "loopSteps": ["step1", "step2", "step3", "step4"],
  "engagementHook": "The psychological reason players keep playing",

  "retention": ["list specific retention mechanics - prestige/daily/collection/etc"],
  "monetization": ["list specific monetization - 2x pass/auto-collect/gacha/etc"],
  "viral": ["list specific viral mechanics - trading/leaderboards/codes/etc"],

  "similarTo": ["2-3 well-known games with similar formula"]
}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    // Fall back if AI returns empty
    return classifyGameFallback(game)
  } catch (err) {
    console.error(`AI classification failed for ${game.name}, using fallback:`, err)
    return classifyGameFallback(game)
  }
}

// Find overlapping patterns across games
function findOverlaps(classifications: GameClassification[]): {
  mustHave: { retention: string[], monetization: string[], viral: string[] }
  shouldHave: { retention: string[], monetization: string[], viral: string[] }
  all: { retention: any[], monetization: any[], viral: any[] }
} {
  const total = classifications.length

  const countPatterns = (items: string[]): Array<{ pattern: string, count: number, percentage: number }> => {
    const counts: Record<string, number> = {}
    for (const item of items) {
      if (item) counts[item] = (counts[item] || 0) + 1
    }
    return Object.entries(counts)
      .map(([pattern, count]) => ({
        pattern,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count)
  }

  const retention = countPatterns(classifications.flatMap(c => c.retention || []))
  const monetization = countPatterns(classifications.flatMap(c => c.monetization || []))
  const viral = countPatterns(classifications.flatMap(c => c.viral || []))

  return {
    mustHave: {
      retention: retention.filter(p => p.percentage >= 80).map(p => p.pattern),
      monetization: monetization.filter(p => p.percentage >= 80).map(p => p.pattern),
      viral: viral.filter(p => p.percentage >= 80).map(p => p.pattern)
    },
    shouldHave: {
      retention: retention.filter(p => p.percentage >= 50 && p.percentage < 80).map(p => p.pattern),
      monetization: monetization.filter(p => p.percentage >= 50 && p.percentage < 80).map(p => p.pattern),
      viral: viral.filter(p => p.percentage >= 50 && p.percentage < 80).map(p => p.pattern)
    },
    all: { retention, monetization, viral }
  }
}

// Determine dominant group characteristics
function getDominantCharacteristics(classifications: GameClassification[]) {
  const getMostCommon = (arr: string[]) => {
    const counts: Record<string, number> = {}
    for (const item of arr) {
      if (item) counts[item] = (counts[item] || 0) + 1
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
    return sorted[0]?.[0] || 'Unknown'
  }

  return {
    category: getMostCommon(classifications.map(c => c.category)),
    vertical: getMostCommon(classifications.map(c => c.vertical)),
    subVertical: getMostCommon(classifications.map(c => c.subVertical)),
    theme: getMostCommon(classifications.map(c => c.theme)),
    complexity: getMostCommon(classifications.map(c => c.complexity)),
    coreMechanic: getMostCommon(classifications.map(c => c.coreMechanic))
  }
}

// Calculate qualification score
function calculateQualification(games: GameData[], classifications: GameClassification[]) {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const hasRevenueProof = games.some(g => g.metrics.estimatedRevenue >= 10000)
  const recentGames = games.filter(g => g.daysOld <= 180)
  const hasRecentSuccess = recentGames.some(g => g.metrics.estimatedRevenue >= 5000)
  const multipleSuccesses = games.filter(g => g.metrics.estimatedRevenue >= 10000).length >= 2
  const hasHighEngagement = games.some(g => g.metrics.likeRatio >= 90)

  let score = 0
  if (hasRevenueProof) score += 30
  if (hasRecentSuccess) score += 30
  if (multipleSuccesses) score += 25
  if (hasHighEngagement) score += 15

  return {
    score,
    isQualified: score >= 60,
    checks: {
      hasRevenueProof,
      hasRecentSuccess,
      multipleSuccesses,
      hasHighEngagement
    },
    emergingStarCount: recentGames.filter(g =>
      g.metrics.ccu >= 1000 || g.metrics.estimatedRevenue >= 5000
    ).length
  }
}

// Fallback replication guide generator
function generateReplicationGuideFallback(
  characteristics: any,
  overlaps: any
): any {
  const vertical = characteristics.vertical || 'Simulator'
  const complexity = characteristics.complexity || 'Medium'

  // Complexity to dev time mapping
  const devTimeMap: Record<string, string> = {
    'Low': '1-3 weeks',
    'Low-Medium': '4-6 weeks',
    'Medium': '6-10 weeks',
    'Medium-High': '10-16 weeks',
    'High': '16+ weeks'
  }

  const teamSizeMap: Record<string, string> = {
    'Low': 'Solo',
    'Low-Medium': '1-2 developers',
    'Medium': '2-3 developers',
    'Medium-High': '3-5 developers',
    'High': '5+ developers'
  }

  // Vertical-specific pitfalls
  const pitfallsMap: Record<string, string[]> = {
    'Simulator': ['Progression wall too early', 'Prestige feels unrewarding', 'No visual variety', 'P2W perception'],
    'Tower Defense': ['Gacha too predatory', 'Power creep in units', 'Lack of content updates', 'Unbalanced meta'],
    'Tycoon': ['Performance issues at scale', 'Boring idle phase', 'No meaningful choices', 'Lack of social features'],
    'Pet Collection': ['Pet values crash too fast', 'Duping exploits', 'Market saturation', 'Boring progression'],
    'Horror': ['Scares become predictable', 'Low replay value', 'Too difficult/easy balance', 'Performance with effects'],
    'Obby': ['Difficulty spikes', 'Unfair checkpoints', 'Lack of variety', 'No social incentive'],
    'Action RPG': ['Combat feels clunky', 'Unbalanced PvP', 'Gear grind too long', 'Lack of endgame']
  }

  // Combine must-haves
  const mustHave = [
    characteristics.coreMechanic || 'Core gameplay loop',
    ...overlaps.mustHave.retention.slice(0, 2),
    ...overlaps.mustHave.monetization.slice(0, 2)
  ].filter(Boolean)

  // Combine should-haves
  const shouldHave = [
    ...overlaps.shouldHave.retention.slice(0, 2),
    ...overlaps.shouldHave.monetization.slice(0, 2),
    ...overlaps.mustHave.viral.slice(0, 2)
  ].filter(Boolean)

  return {
    mustHave: mustHave.length > 0 ? mustHave : ['Core loop implementation', 'Basic progression system', 'Monetization gamepasses'],
    shouldHave: shouldHave.length > 0 ? shouldHave : ['Daily rewards', 'Leaderboards', 'Social features'],
    differentiation: ['Unique theme twist', 'Better UX/polish', 'Novel mechanics', 'Stronger social features'],
    coreRequirements: ['Satisfying core loop', 'Clear progression', 'Performance optimization', 'Mobile-friendly UI'],
    pitfalls: pitfallsMap[vertical] || ['Lack of content', 'Poor balancing', 'No retention hooks', 'Weak monetization'],
    devTime: devTimeMap[complexity] || '6-10 weeks',
    teamSize: teamSizeMap[complexity] || '2-3 developers'
  }
}

// Generate replication guide
async function generateReplicationGuide(
  characteristics: any,
  overlaps: any,
  qualification: any
) {
  // If no AI available, use fallback
  if (!anthropic) {
    console.log('Using fallback replication guide generator (no API key)')
    return generateReplicationGuideFallback(characteristics, overlaps)
  }

  try {
    const prompt = `Based on this competitor group analysis, generate a replication guide.

GROUP: ${characteristics.subVertical}
VERTICAL: ${characteristics.vertical}
THEME: ${characteristics.theme}
COMPLEXITY: ${characteristics.complexity}
CORE MECHANIC: ${characteristics.coreMechanic}

MUST HAVE (80%+ of games):
- Retention: ${overlaps.mustHave.retention.join(', ') || 'None identified'}
- Monetization: ${overlaps.mustHave.monetization.join(', ') || 'None identified'}
- Viral: ${overlaps.mustHave.viral.join(', ') || 'None identified'}

SHOULD HAVE (50-80%):
- Retention: ${overlaps.shouldHave.retention.join(', ') || 'None identified'}
- Monetization: ${overlaps.shouldHave.monetization.join(', ') || 'None identified'}
- Viral: ${overlaps.shouldHave.viral.join(', ') || 'None identified'}

Return JSON only:
{
  "mustHave": ["list essential features combining retention+monetization+viral must-haves"],
  "shouldHave": ["list recommended features"],
  "differentiation": ["list ways to stand out while using same formula"],
  "coreRequirements": ["list technical/design requirements for this vertical"],
  "pitfalls": ["list common mistakes to avoid in this vertical"],
  "devTime": "estimated development time",
  "teamSize": "recommended team size"
}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    // Fall back if AI returns empty
    return generateReplicationGuideFallback(characteristics, overlaps)
  } catch (err) {
    console.error('AI replication guide failed, using fallback:', err)
    return generateReplicationGuideFallback(characteristics, overlaps)
  }
}

export async function POST(request: Request) {
  // Rate limiting - this is an expensive endpoint
  const clientId = getClientIdentifier(request)
  const { allowed, resetIn } = checkRateLimit(clientId, 'analyze-group')
  if (!allowed) {
    return rateLimitResponse(resetIn)
  }

  try {
    const body = await request.json()
    const { placeIds, groupName } = body

    if (!placeIds || !Array.isArray(placeIds) || placeIds.length === 0) {
      return NextResponse.json({ error: 'placeIds array is required' }, { status: 400 })
    }

    if (placeIds.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 games per analysis' }, { status: 400 })
    }

    // Step 1: Fetch all game data
    const gameDataPromises = placeIds.map(id => fetchGameData(id.toString()))
    const gamesRaw = await Promise.all(gameDataPromises)
    const games = gamesRaw.filter((g): g is GameData => g !== null)

    if (games.length === 0) {
      return NextResponse.json({ error: 'Could not fetch any game data' }, { status: 404 })
    }

    // Step 2: AI classify each game
    const classificationPromises = games.map(game => classifyGame(game))
    const classificationsRaw = await Promise.all(classificationPromises)
    const classifications = classificationsRaw.filter((c): c is GameClassification => c !== null)

    if (classifications.length === 0) {
      return NextResponse.json({ error: 'Could not classify any games' }, { status: 500 })
    }

    // Step 3: Find overlapping patterns
    const overlaps = findOverlaps(classifications)

    // Step 4: Get dominant characteristics
    const characteristics = getDominantCharacteristics(classifications)

    // Step 5: Calculate qualification
    const qualification = calculateQualification(games, classifications)

    // Step 6: Generate replication guide
    const replicationGuide = await generateReplicationGuide(
      characteristics,
      overlaps,
      qualification
    )

    // Step 7: Identify emerging stars
    const emergingStars = games
      .filter(g => g.daysOld <= 180 && (g.metrics.ccu >= 1000 || g.metrics.estimatedRevenue >= 5000))
      .map(g => ({
        placeId: g.placeId,
        name: g.name,
        ccu: g.metrics.ccu,
        revenue: g.metrics.estimatedRevenue,
        daysOld: g.daysOld
      }))

    // Calculate averages
    const avgRevenue = Math.round(games.reduce((sum, g) => sum + g.metrics.estimatedRevenue, 0) / games.length)
    const avgCCU = Math.round(games.reduce((sum, g) => sum + g.metrics.ccu, 0) / games.length)
    const avgLikeRatio = parseFloat((games.reduce((sum, g) => sum + g.metrics.likeRatio, 0) / games.length).toFixed(1))

    // Build the final analysis
    const analysis = {
      // Group Identity
      groupName: groupName || characteristics.subVertical,
      gamesAnalyzed: games.length,

      // Structural Characteristics
      characteristics: {
        category: characteristics.category,
        vertical: characteristics.vertical,
        subVertical: characteristics.subVertical,
        theme: characteristics.theme,
        complexity: characteristics.complexity
      },

      // The Formula
      formula: {
        coreMechanic: characteristics.coreMechanic,
        // Get most common loop steps
        loopSteps: classifications[0]?.loopSteps || [],
        engagementHook: classifications[0]?.engagementHook || ''
      },

      // Metrics
      metrics: {
        avgRevenue,
        avgCCU,
        avgLikeRatio,
        totalRevenue: games.reduce((sum, g) => sum + g.metrics.estimatedRevenue, 0)
      },

      // Patterns
      patterns: {
        mustHave: overlaps.mustHave,
        shouldHave: overlaps.shouldHave,
        all: overlaps.all
      },

      // Qualification
      qualification,

      // Emerging Stars
      emergingStars,

      // Replication Guide
      replicationGuide,

      // Individual Game Classifications
      games: games.map((game, i) => ({
        placeId: game.placeId,
        name: game.name,
        metrics: game.metrics,
        daysOld: game.daysOld,
        classification: classifications[i] || null
      }))
    }

    // Optionally save to database
    if (groupName) {
      await supabase.from('competitor_groups').insert({
        group_id: `group_${Date.now()}`,
        group_name: groupName,
        structural_characteristics: analysis.characteristics,
        qualification_criteria: analysis.qualification,
        analysis_notes: {
          patterns: analysis.patterns,
          replicationGuide: analysis.replicationGuide,
          metrics: analysis.metrics
        },
        is_qualified: analysis.qualification.isQualified,
        qualification_score: analysis.qualification.score
      })
    }

    return NextResponse.json(analysis)

  } catch (error: any) {
    console.error('Analyze group error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

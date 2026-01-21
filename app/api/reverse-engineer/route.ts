import { NextResponse } from 'next/server'

// Deep pattern study - reverse engineers a competitor group to find the replicable formula

interface GameData {
  placeId: string
  name: string
  description?: string
  genre?: string
  metrics: {
    currentPlayers: number
    visits: number
    likeRatio: string
    estimatedRevenue: number
  }
  classification?: {
    template: string
    theme: string
    coreLoop: string
  }
  daysOld?: number
}

// Analyze text for common keywords/mechanics
function extractKeywords(texts: string[]): Record<string, number> {
  const keywords: Record<string, number> = {}
  const gameKeywords = [
    // Mechanics
    'upgrade', 'level', 'collect', 'fight', 'battle', 'spawn', 'wave', 'defend',
    'build', 'craft', 'trade', 'hatch', 'evolve', 'fuse', 'merge', 'summon',
    'unlock', 'prestige', 'rebirth', 'reset', 'multiplier', 'boost',
    // Monetization
    'gamepass', 'vip', 'premium', 'robux', 'coins', 'gems', 'crate', 'spin',
    // Social
    'friend', 'team', 'guild', 'clan', 'trade', 'pvp', 'leaderboard',
    // Content
    'update', 'event', 'limited', 'exclusive', 'rare', 'legendary', 'mythic',
    // Themes
    'anime', 'pet', 'tower', 'defense', 'simulator', 'tycoon', 'obby'
  ]

  for (const text of texts) {
    const lower = text.toLowerCase()
    for (const keyword of gameKeywords) {
      if (lower.includes(keyword)) {
        keywords[keyword] = (keywords[keyword] || 0) + 1
      }
    }
  }

  return keywords
}

// Infer monetization strategy from patterns
function inferMonetization(games: GameData[], keywords: Record<string, number>) {
  const strategies: any[] = []
  const avgRevenue = games.reduce((sum, g) => sum + g.metrics.estimatedRevenue, 0) / games.length

  // Based on template
  const template = games[0]?.classification?.template || 'Unknown'

  if (template === 'Simulator') {
    strategies.push({
      type: 'Gamepasses',
      items: ['2x/3x Multiplier', 'Auto-Collect', 'Auto-Rebirth', 'VIP Benefits'],
      confidence: 0.95
    })
    strategies.push({
      type: 'In-Game Currency',
      items: ['Premium currency packs', 'Starter bundles'],
      confidence: 0.9
    })
  } else if (template === 'Tower Defense') {
    strategies.push({
      type: 'Gacha/Crates',
      items: ['Unit summon banners', 'Limited-time units', 'Pity system'],
      confidence: 0.95
    })
    strategies.push({
      type: 'Gamepasses',
      items: ['Extra unit slots', 'Auto-skip waves', 'Damage boost'],
      confidence: 0.9
    })
  } else if (template === 'Action RPG') {
    strategies.push({
      type: 'Gacha/Crates',
      items: ['Weapon/ability crates', 'Character banners'],
      confidence: 0.9
    })
    strategies.push({
      type: 'Battle Pass',
      items: ['Season rewards track', 'Premium tier'],
      confidence: 0.85
    })
  }

  // Based on keywords
  if (keywords['crate'] || keywords['spin'] || keywords['summon']) {
    strategies.push({
      type: 'RNG Mechanics',
      items: ['Gacha pulls', 'Lucky spins', 'Mystery boxes'],
      confidence: 0.9
    })
  }

  if (keywords['trade']) {
    strategies.push({
      type: 'Trading Economy',
      items: ['Player-to-player trades', 'Rare item market'],
      confidence: 0.85
    })
  }

  return {
    strategies,
    avgMonthlyRevenue: Math.round(avgRevenue),
    revenueRange: `$${Math.round(Math.min(...games.map(g => g.metrics.estimatedRevenue))).toLocaleString()} - $${Math.round(Math.max(...games.map(g => g.metrics.estimatedRevenue))).toLocaleString()}/mo`
  }
}

// Infer retention hooks
function inferRetention(keywords: Record<string, number>, template: string) {
  const hooks: any[] = []

  // Universal hooks
  hooks.push({
    type: 'Daily Rewards',
    description: 'Consecutive login bonuses with escalating rewards',
    implementation: 'Day 1-7 increasing rewards, streak multipliers',
    confidence: 0.95
  })

  if (keywords['event'] || keywords['limited']) {
    hooks.push({
      type: 'Limited-Time Events',
      description: 'FOMO-driven seasonal content',
      implementation: 'Holiday events, exclusive rewards, time-limited items',
      confidence: 0.9
    })
  }

  if (keywords['leaderboard'] || keywords['pvp']) {
    hooks.push({
      type: 'Competition',
      description: 'Player ranking and competitive modes',
      implementation: 'Weekly leaderboards, PvP arenas, tournaments',
      confidence: 0.85
    })
  }

  if (keywords['trade'] || keywords['friend'] || keywords['guild']) {
    hooks.push({
      type: 'Social Hooks',
      description: 'Multiplayer features that encourage returning',
      implementation: 'Trading system, friend invites, guild activities',
      confidence: 0.85
    })
  }

  // Template-specific
  if (template === 'Simulator') {
    hooks.push({
      type: 'Prestige System',
      description: 'Reset progress for permanent multipliers',
      implementation: 'Rebirth at max level, prestige currencies',
      confidence: 0.9
    })
  } else if (template === 'Tower Defense') {
    hooks.push({
      type: 'Collection Progress',
      description: 'Unit/tower collection completion',
      implementation: 'Pokedex-style collection, rarity hunting',
      confidence: 0.9
    })
  }

  return hooks
}

// Find differentiation opportunities
function findDifferentiation(games: GameData[], keywords: Record<string, number>) {
  const opportunities: string[] = []

  // What's NOT being done
  if (!keywords['pvp']) {
    opportunities.push('Add PvP mode - most competitors lack direct player competition')
  }
  if (!keywords['guild'] && !keywords['clan']) {
    opportunities.push('Add guild system - social features increase retention')
  }
  if (!keywords['trade']) {
    opportunities.push('Enable trading - creates player economy and community')
  }
  if (!keywords['craft']) {
    opportunities.push('Add crafting system - gives players agency over progression')
  }

  // Based on low average engagement
  const avgLikeRatio = games.reduce((sum, g) => sum + parseFloat(g.metrics.likeRatio), 0) / games.length
  if (avgLikeRatio < 85) {
    opportunities.push('Focus on polish and UX - competitors have mediocre ratings')
  }

  // Theme gaps
  const theme = games[0]?.classification?.theme
  if (theme === 'Unknown' || theme === 'Meme/Brainrot') {
    opportunities.push('Apply a proven theme (Anime, Pets) to this template for broader appeal')
  }

  return opportunities
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { games, groupName } = body as { games: GameData[]; groupName?: string }

    if (!games || !Array.isArray(games) || games.length === 0) {
      return NextResponse.json({ error: 'Games array is required' }, { status: 400 })
    }

    // Collect all descriptions for keyword extraction
    const descriptions = games
      .map(g => `${g.name} ${g.description || ''}`)
      .filter(Boolean)

    const keywords = extractKeywords(descriptions)
    const template = games[0]?.classification?.template || 'Unknown'
    const theme = games[0]?.classification?.theme || 'Unknown'
    const coreLoop = games[0]?.classification?.coreLoop || 'Unknown'

    // Build the reverse-engineered study
    const study = {
      groupName: groupName || `${theme} ${template}`,
      gamesAnalyzed: games.length,

      // Core Pattern
      corePattern: {
        template,
        theme,
        coreLoop,
        description: getCoreLoopDescription(template)
      },

      // Extracted mechanics (from keyword frequency)
      mechanics: Object.entries(keywords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([keyword, count]) => ({
          mechanic: keyword,
          frequency: count,
          present: `${count}/${games.length} games`
        })),

      // Monetization analysis
      monetization: inferMonetization(games, keywords),

      // Retention hooks
      retention: inferRetention(keywords, template),

      // Differentiation opportunities
      differentiation: findDifferentiation(games, keywords),

      // Competitor comparison
      competitors: games.map(g => ({
        name: g.name,
        placeId: g.placeId,
        ccu: g.metrics.currentPlayers,
        revenue: g.metrics.estimatedRevenue,
        rating: g.metrics.likeRatio + '%',
        age: g.daysOld ? `${g.daysOld} days` : 'Unknown'
      })),

      // Replication checklist
      replicationChecklist: generateChecklist(template, theme, keywords),

      // Success prediction
      viabilityAssessment: {
        marketValidation: games.length >= 2 ? 'STRONG' : 'MODERATE',
        competitionLevel: games.length >= 5 ? 'HIGH' : games.length >= 3 ? 'MEDIUM' : 'LOW',
        entryDifficulty: template === 'Action RPG' ? 'HARD' : template === 'Tower Defense' ? 'MEDIUM' : 'EASY',
        recommendation: generateRecommendation(games, template)
      }
    }

    return NextResponse.json({
      success: true,
      study
    })

  } catch (error: any) {
    console.error('Reverse engineer error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function getCoreLoopDescription(template: string): string {
  const descriptions: Record<string, string> = {
    'Simulator': 'Players click/tap to collect resources, spend resources on upgrades that increase collection rate, eventually prestige to reset with permanent bonuses.',
    'Tower Defense': 'Players place units on a map to stop waves of enemies. Units can be upgraded during battle. Later waves introduce stronger enemies and boss fights.',
    'Action RPG': 'Players control a character, fight enemies to gain XP and loot, level up to unlock new abilities, progress through increasingly difficult content.',
    'Tycoon': 'Players build and expand a business/facility, earning currency passively. Reinvest earnings to unlock new areas and increase income.',
    'Obby': 'Players navigate obstacle courses, reaching checkpoints. Progress unlocks new levels with harder challenges.',
    'Horror/Escape': 'Players must survive threats and escape. Often includes puzzle elements and multiplayer cooperation/competition.'
  }
  return descriptions[template] || 'Standard gameplay loop for this genre.'
}

function generateChecklist(template: string, theme: string, keywords: Record<string, number>) {
  const checklist: any[] = []

  // Core requirements
  checklist.push({
    category: 'Core Gameplay',
    items: [
      { task: `Implement ${template} base mechanics`, priority: 'CRITICAL' },
      { task: `Apply ${theme} theming and visuals`, priority: 'HIGH' },
      { task: 'Tutorial/onboarding flow', priority: 'HIGH' },
      { task: 'Save system (DataStore)', priority: 'CRITICAL' }
    ]
  })

  // Monetization
  checklist.push({
    category: 'Monetization',
    items: [
      { task: 'Gamepass setup (2x boost, VIP)', priority: 'HIGH' },
      { task: 'In-game currency system', priority: 'MEDIUM' },
      { task: 'Developer products for purchases', priority: 'MEDIUM' }
    ]
  })

  // Retention
  checklist.push({
    category: 'Retention',
    items: [
      { task: 'Daily rewards system', priority: 'HIGH' },
      { task: 'Achievement/badge system', priority: 'MEDIUM' },
      { task: 'Leaderboards', priority: 'MEDIUM' }
    ]
  })

  // Polish
  checklist.push({
    category: 'Polish',
    items: [
      { task: 'UI/UX refinement', priority: 'HIGH' },
      { task: 'Sound effects and music', priority: 'MEDIUM' },
      { task: 'Mobile optimization', priority: 'HIGH' },
      { task: 'Anti-exploit measures', priority: 'HIGH' }
    ]
  })

  return checklist
}

function generateRecommendation(games: GameData[], template: string): string {
  const avgRevenue = games.reduce((sum, g) => sum + g.metrics.estimatedRevenue, 0) / games.length
  const avgRating = games.reduce((sum, g) => sum + parseFloat(g.metrics.likeRatio), 0) / games.length
  const recentGames = games.filter(g => (g.daysOld || 999) <= 90).length

  if (avgRevenue >= 50000 && recentGames >= 2) {
    return 'HOT NICHE - Multiple recent successes with high revenue. Move fast with quality execution.'
  } else if (avgRevenue >= 20000 && avgRating >= 85) {
    return 'VIABLE NICHE - Proven demand with room for better execution. Focus on differentiation.'
  } else if (avgRating < 80) {
    return 'OPPORTUNITY - Low competitor ratings suggest quality gap. Win with polish.'
  } else {
    return 'MODERATE - Validate further before committing significant resources.'
  }
}

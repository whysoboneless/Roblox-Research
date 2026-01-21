import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

// Deep analysis - collects pattern-revealing data from a game
// This is the data we need to reverse-engineer WHY a game succeeds

interface DeepGameData {
  basic: {
    placeId: string
    universeId: number
    name: string
    description: string
    genre: string
    created: string
    updated: string
    creator: { name: string; type: string; id: number }
  }
  metrics: {
    ccu: number
    visits: number
    favorites: number
    likeRatio: number
    estimatedRevenue: number
  }
  // THE PATTERN DATA
  gamepasses: Array<{
    id: number
    name: string
    price: number
    description: string
  }>
  badges: Array<{
    id: number
    name: string
    description: string
  }>
  detectedPatterns: {
    template: string
    theme: string
    coreLoop: string
    loopSteps: string[]
    mechanics: string[]
    monetization: string[]
    retention: string[]
    viralHooks: string[]
    retentionHooks: string[]
  }
}

// Get universe ID from place ID
async function getUniverseId(placeId: string): Promise<number | null> {
  try {
    const res = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`)
    const data = await res.json()
    return data.universeId
  } catch {
    return null
  }
}

// Get detailed game info
async function getGameDetails(universeId: number) {
  try {
    const res = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`)
    const data = await res.json()
    return data.data?.[0] || null
  } catch {
    return null
  }
}

// Get game votes
async function getGameVotes(universeId: number) {
  try {
    const res = await fetch(`https://games.roblox.com/v1/games/votes?universeIds=${universeId}`)
    const data = await res.json()
    return data.data?.[0] || null
  } catch {
    return null
  }
}

// GET GAMEPASSES - This reveals monetization strategy!
async function getGamepasses(universeId: number) {
  try {
    const res = await fetch(
      `https://games.roblox.com/v1/games/${universeId}/game-passes?limit=50&sortOrder=Asc`,
      { headers: { 'Accept': 'application/json' } }
    )
    const data = await res.json()
    return data.data || []
  } catch (err) {
    console.error('Failed to fetch gamepasses:', err)
    return []
  }
}

// GET BADGES - This reveals progression/core loop!
async function getBadges(universeId: number) {
  try {
    const res = await fetch(
      `https://badges.roblox.com/v1/universes/${universeId}/badges?limit=50&sortOrder=Asc`,
      { headers: { 'Accept': 'application/json' } }
    )
    const data = await res.json()
    return data.data || []
  } catch (err) {
    console.error('Failed to fetch badges:', err)
    return []
  }
}

// Analyze description for keywords
function analyzeDescription(description: string): { mechanics: string[], themes: string[] } {
  const desc = description.toLowerCase()
  const mechanics: string[] = []
  const themes: string[] = []

  // Mechanic detection
  const mechanicKeywords: Record<string, string> = {
    'collect': 'Collection',
    'upgrade': 'Upgrades',
    'prestige': 'Prestige System',
    'rebirth': 'Rebirth System',
    'defend': 'Wave Defense',
    'place': 'Unit Placement',
    'summon': 'Summon/Gacha',
    'trade': 'Trading',
    'pvp': 'PvP Combat',
    'fight': 'Combat',
    'boss': 'Boss Fights',
    'raid': 'Raids',
    'quest': 'Quests',
    'mission': 'Missions',
    'level': 'Leveling',
    'craft': 'Crafting',
    'build': 'Building',
    'escape': 'Escape Mechanics',
    'survive': 'Survival',
    'hatch': 'Hatching/Eggs',
    'evolve': 'Evolution',
    'merge': 'Merging',
    'spin': 'Spin/Gacha',
    'lucky': 'RNG/Luck',
    'multiplayer': 'Multiplayer',
    'co-op': 'Co-op',
    'team': 'Team Play',
  }

  for (const [keyword, mechanic] of Object.entries(mechanicKeywords)) {
    if (desc.includes(keyword) && !mechanics.includes(mechanic)) {
      mechanics.push(mechanic)
    }
  }

  // Theme detection
  const themeKeywords: Record<string, string> = {
    'anime': 'Anime',
    'pet': 'Pets',
    'brainrot': 'Meme/Brainrot',
    'skibidi': 'Meme/Brainrot',
    'horror': 'Horror',
    'scary': 'Horror',
    'superhero': 'Superhero',
    'medieval': 'Medieval',
    'fantasy': 'Fantasy',
    'dragon': 'Fantasy',
    'space': 'Sci-Fi',
    'robot': 'Sci-Fi',
    'zombie': 'Zombies',
    'military': 'Military',
    'war': 'Military',
    'pirate': 'Pirates',
    'ocean': 'Ocean/Sea',
    'nature': 'Nature',
    'farm': 'Farming',
    'food': 'Food',
    'cooking': 'Food',
  }

  for (const [keyword, theme] of Object.entries(themeKeywords)) {
    if (desc.includes(keyword) && !themes.includes(theme)) {
      themes.push(theme)
    }
  }

  return { mechanics, themes }
}

// Analyze gamepasses to detect monetization patterns
function analyzeGamepasses(gamepasses: any[]): string[] {
  const patterns: string[] = []
  const names = gamepasses.map(gp => gp.name.toLowerCase())
  const descriptions = gamepasses.map(gp => (gp.description || '').toLowerCase())
  const all = [...names, ...descriptions].join(' ')

  // Detect patterns
  if (all.includes('2x') || all.includes('double') || all.includes('multiplier')) {
    patterns.push('Multiplier Gamepasses')
  }
  if (all.includes('vip') || all.includes('premium')) {
    patterns.push('VIP/Premium Tier')
  }
  if (all.includes('auto') || all.includes('afk')) {
    patterns.push('Auto-Farm/AFK')
  }
  if (all.includes('slot') || all.includes('inventory') || all.includes('storage')) {
    patterns.push('Extra Storage/Slots')
  }
  if (all.includes('speed') || all.includes('faster')) {
    patterns.push('Speed Boosts')
  }
  if (all.includes('skip') || all.includes('unlock')) {
    patterns.push('Skip/Unlock Content')
  }
  if (all.includes('pet') || all.includes('companion')) {
    patterns.push('Pet/Companion System')
  }
  if (all.includes('exclusive') || all.includes('limited')) {
    patterns.push('Exclusive Items')
  }

  // Price analysis
  const prices = gamepasses.map(gp => gp.price).filter(p => p > 0)
  if (prices.length > 0) {
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
    const maxPrice = Math.max(...prices)

    if (maxPrice >= 1000) patterns.push('High-Ticket Items ($10+)')
    if (avgPrice < 100) patterns.push('Low-Price Volume Strategy')
    if (prices.length >= 5) patterns.push('Multiple Gamepass Offerings')
  }

  return patterns
}

// Analyze badges to detect core loop/progression
function analyzeBadges(badges: any[]): { coreLoop: string, retention: string[] } {
  const retention: string[] = []
  const names = badges.map(b => b.name.toLowerCase())
  const descriptions = badges.map(b => (b.description || '').toLowerCase())
  const all = [...names, ...descriptions].join(' ')

  // Detect progression patterns
  let coreLoop = 'Unknown'

  if (all.includes('wave') || all.includes('round') || all.includes('defend')) {
    coreLoop = 'Wave-based progression'
    retention.push('Wave completion goals')
  }
  if (all.includes('level') || all.includes('reached')) {
    coreLoop = 'Level-based progression'
    retention.push('Level milestones')
  }
  if (all.includes('collect') || all.includes('obtained')) {
    coreLoop = 'Collection progression'
    retention.push('Collection completion')
  }
  if (all.includes('rebirth') || all.includes('prestige')) {
    coreLoop = 'Prestige/Rebirth loop'
    retention.push('Prestige goals')
  }
  if (all.includes('win') || all.includes('victory')) {
    retention.push('Win streaks')
  }
  if (all.includes('play') && (all.includes('hour') || all.includes('time'))) {
    retention.push('Playtime rewards')
  }
  if (all.includes('day') || all.includes('daily')) {
    retention.push('Daily engagement')
  }
  if (all.includes('first') || all.includes('welcome')) {
    retention.push('New player onboarding')
  }

  return { coreLoop, retention }
}

// CORE LOOP DETECTION - The heart of why a game works
function detectCoreLoop(description: string, mechanics: string[], template: string): {
  loop: string,
  steps: string[],
  viralHooks: string[],
  retentionHooks: string[]
} {
  const desc = description.toLowerCase()
  const steps: string[] = []
  const viralHooks: string[] = []
  const retentionHooks: string[] = []

  // Detect the ACTION verbs that define the loop
  const actions = {
    collect: desc.includes('collect') || desc.includes('grab') || desc.includes('get'),
    upgrade: desc.includes('upgrade') || desc.includes('level up') || desc.includes('improve'),
    earn: desc.includes('earn') || desc.includes('money') || desc.includes('cash') || desc.includes('coins'),
    place: desc.includes('place') || desc.includes('build') || desc.includes('slot'),
    defend: desc.includes('defend') || desc.includes('protect') || desc.includes('survive'),
    fight: desc.includes('fight') || desc.includes('battle') || desc.includes('attack'),
    escape: desc.includes('escape') || desc.includes('run') || desc.includes('avoid'),
    unlock: desc.includes('unlock') || desc.includes('discover') || desc.includes('new'),
    trade: desc.includes('trade') || desc.includes('sell') || desc.includes('buy'),
    hatch: desc.includes('hatch') || desc.includes('egg') || desc.includes('open'),
    merge: desc.includes('merge') || desc.includes('fuse') || desc.includes('combine'),
    spin: desc.includes('spin') || desc.includes('roll') || desc.includes('gacha'),
  }

  // Build the loop steps
  if (actions.collect) steps.push('COLLECT resources/items')
  if (actions.earn) steps.push('EARN currency')
  if (actions.upgrade) steps.push('UPGRADE for better stats')
  if (actions.place) steps.push('PLACE/BUILD to expand')
  if (actions.defend) steps.push('DEFEND against threats')
  if (actions.fight) steps.push('FIGHT enemies')
  if (actions.escape) steps.push('ESCAPE/SURVIVE danger')
  if (actions.unlock) steps.push('UNLOCK new content')
  if (actions.hatch) steps.push('HATCH/OPEN for rewards')
  if (actions.merge) steps.push('MERGE for better items')
  if (actions.spin) steps.push('SPIN/GACHA for rare drops')

  // VIRAL HOOKS - What makes players share/invite
  if (desc.includes('trade') || desc.includes('trading')) {
    viralHooks.push('Trading system - social economy')
  }
  if (desc.includes('friend') || desc.includes('invite')) {
    viralHooks.push('Friend invite rewards')
  }
  if (desc.includes('rare') || desc.includes('legendary') || desc.includes('epic')) {
    viralHooks.push('Rare drops - shareable moments')
  }
  if (desc.includes('leaderboard') || desc.includes('rank') || desc.includes('top')) {
    viralHooks.push('Competitive leaderboards')
  }
  if (desc.includes('group') || desc.includes('join')) {
    viralHooks.push('Group membership incentive')
  }
  if (desc.includes('like') || desc.includes('favorite')) {
    viralHooks.push('Like/favorite rewards')
  }
  if (desc.includes('code') || desc.includes('codes')) {
    viralHooks.push('Promo codes - content creator friendly')
  }
  if (desc.includes('limited') || desc.includes('exclusive')) {
    viralHooks.push('Limited items - FOMO')
  }

  // RETENTION HOOKS - What brings players back
  if (desc.includes('offline') || desc.includes('afk') || desc.includes('idle')) {
    retentionHooks.push('Offline/idle earnings - daily check-in motivation')
  }
  if (desc.includes('daily') || desc.includes('every day')) {
    retentionHooks.push('Daily rewards/activities')
  }
  if (desc.includes('event') || desc.includes('update')) {
    retentionHooks.push('Regular events/updates')
  }
  if (desc.includes('rebirth') || desc.includes('prestige') || desc.includes('reset')) {
    retentionHooks.push('Prestige system - long-term goals')
  }
  if (desc.includes('unlock') && (desc.includes('area') || desc.includes('world') || desc.includes('island'))) {
    retentionHooks.push('World/area progression')
  }
  if (desc.includes('collection') || desc.includes('all')) {
    retentionHooks.push('Collection completion drive')
  }

  // Build the loop description
  let loop = 'Unknown'
  if (steps.length >= 2) {
    loop = steps.slice(0, 4).join(' → ')
    if (actions.upgrade || actions.unlock) {
      loop += ' → REPEAT'
    }
  }

  // Template-specific loop refinement
  if (template === 'Simulator' && loop === 'Unknown') {
    loop = 'COLLECT → UPGRADE → PRESTIGE → REPEAT'
  } else if (template === 'Tower Defense' && loop === 'Unknown') {
    loop = 'PLACE → DEFEND → UPGRADE → PROGRESS'
  } else if (template === 'Horror/Escape' && loop === 'Unknown') {
    loop = 'SURVIVE → ESCAPE → WIN'
  }

  return { loop, steps, viralHooks, retentionHooks }
}

// Detect template from all data
function detectTemplate(name: string, description: string, gamepasses: any[], badges: any[]): string {
  const n = name.toLowerCase()
  const d = description.toLowerCase()

  if (n.includes('simulator') || n.includes(' sim')) return 'Simulator'
  if (n.includes('tower defense') || n.includes(' td') || d.includes('tower defense')) return 'Tower Defense'
  if (n.includes('tycoon')) return 'Tycoon'
  if (n.includes('obby') || n.includes('obstacle')) return 'Obby'
  if (n.includes('horror') || d.includes('horror') || d.includes('escape')) return 'Horror/Escape'
  if (d.includes('fight') || d.includes('battle') || d.includes('combat')) return 'Action/Fighting'
  if (d.includes('roleplay') || d.includes('rp')) return 'Roleplay'

  // Infer from gamepasses/badges
  const gpNames = gamepasses.map(gp => gp.name.toLowerCase()).join(' ')
  const badgeNames = badges.map(b => b.name.toLowerCase()).join(' ')

  if (gpNames.includes('2x') || gpNames.includes('auto') || badgeNames.includes('rebirth')) return 'Simulator'
  if (gpNames.includes('unit') || badgeNames.includes('wave')) return 'Tower Defense'

  return 'Unknown'
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

// AI-powered classification for deeper analysis
async function getAIClassification(name: string, description: string, gamepasses: any[], badges: any[]) {
  try {
    const prompt = `Analyze this Roblox game and extract its core loop and structural characteristics.

GAME: ${name}
DESCRIPTION: ${description || 'Not available'}
GAMEPASSES: ${gamepasses.map(g => g.name).join(', ') || 'None'}
BADGES: ${badges.slice(0, 10).map(b => b.name).join(', ') || 'None'}

Return JSON only:
{
  "category": "Adventure/Simulation/Horror/Social/Fighting",
  "vertical": "Simulator/Tower Defense/Tycoon/Horror Escape/Action RPG/Obby/Survival/Merge/Gacha",
  "subVertical": "Specific niche like 'Anime Tower Defense' or 'Brainrot Simulator'",
  "theme": "Anime/Meme-Brainrot/Horror/Fantasy/Realistic/Cute/Pets",
  "coreLoop": {
    "name": "The gameplay loop in ACTION → ACTION → ACTION format",
    "steps": ["step1", "step2", "step3", "step4"],
    "engagement": "The psychological hook that keeps players repeating this loop"
  },
  "monetizationHooks": ["specific monetization strategies detected"],
  "retentionHooks": ["specific retention mechanics detected"],
  "viralHooks": ["specific viral/social mechanics detected"],
  "similarTo": ["2-3 well-known Roblox games with similar patterns"]
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
    return null
  } catch (err) {
    console.error('AI classification failed:', err)
    return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const placeId = searchParams.get('placeId')
  const useAI = searchParams.get('ai') === 'true'

  if (!placeId) {
    return NextResponse.json({ error: 'placeId is required' }, { status: 400 })
  }

  try {
    // Get universe ID
    const universeId = await getUniverseId(placeId)
    if (!universeId) {
      return NextResponse.json({ error: 'Could not find universe for this place' }, { status: 404 })
    }

    // Fetch all data in parallel
    const [details, votes, gamepasses, badges] = await Promise.all([
      getGameDetails(universeId),
      getGameVotes(universeId),
      getGamepasses(universeId),
      getBadges(universeId)
    ])

    if (!details) {
      return NextResponse.json({ error: 'Could not fetch game details' }, { status: 404 })
    }

    // Calculate metrics
    const likeRatio = votes
      ? (votes.upVotes / (votes.upVotes + votes.downVotes)) * 100
      : 0

    // Analyze patterns
    const descAnalysis = analyzeDescription(details.description || '')
    const monetizationPatterns = analyzeGamepasses(gamepasses)
    const badgeAnalysis = analyzeBadges(badges)
    const template = detectTemplate(details.name, details.description || '', gamepasses, badges)

    // DEEP LOOP ANALYSIS - The key insight
    const loopAnalysis = detectCoreLoop(details.description || '', descAnalysis.mechanics, template)

    // Detect theme
    let theme = 'Unknown'
    if (descAnalysis.themes.length > 0) {
      theme = descAnalysis.themes[0]
    } else {
      const n = details.name.toLowerCase()
      if (n.includes('anime')) theme = 'Anime'
      else if (n.includes('pet')) theme = 'Pets'
      else if (n.includes('brainrot') || n.includes('skibidi')) theme = 'Meme/Brainrot'
    }

    const result: DeepGameData = {
      basic: {
        placeId,
        universeId,
        name: details.name,
        description: details.description || '',
        genre: details.genre,
        created: details.created,
        updated: details.updated,
        creator: {
          name: details.creator?.name,
          type: details.creator?.type,
          id: details.creator?.id
        }
      },
      metrics: {
        ccu: details.playing,
        visits: details.visits,
        favorites: details.favoritedCount,
        likeRatio: parseFloat(likeRatio.toFixed(1)),
        estimatedRevenue: estimateRevenue(details.playing, likeRatio)
      },
      gamepasses: gamepasses.map((gp: any) => ({
        id: gp.id,
        name: gp.name,
        price: gp.price,
        description: gp.description || ''
      })),
      badges: badges.slice(0, 20).map((b: any) => ({
        id: b.id,
        name: b.name,
        description: b.description || ''
      })),
      detectedPatterns: {
        template,
        theme,
        coreLoop: loopAnalysis.loop,
        loopSteps: loopAnalysis.steps,
        mechanics: descAnalysis.mechanics,
        monetization: monetizationPatterns,
        retention: badgeAnalysis.retention,
        viralHooks: loopAnalysis.viralHooks,
        retentionHooks: loopAnalysis.retentionHooks
      }
    }

    return NextResponse.json({
      ...result,
      // LOOP & VIRAL ANALYSIS - The key insights for replication
      loopAnalysis: {
        coreLoop: loopAnalysis.loop,
        steps: loopAnalysis.steps,
        viralHooks: loopAnalysis.viralHooks,
        retentionHooks: loopAnalysis.retentionHooks,
        // Why this matters
        loopExplanation: loopAnalysis.steps.length > 0
          ? `Players ${loopAnalysis.steps.join(', then ').toLowerCase()}, creating the engagement cycle.`
          : 'Loop not clearly defined in description - may need manual analysis.',
        viralPotential: loopAnalysis.viralHooks.length >= 2 ? 'HIGH' : loopAnalysis.viralHooks.length === 1 ? 'MEDIUM' : 'LOW',
        retentionPotential: loopAnalysis.retentionHooks.length >= 2 ? 'HIGH' : loopAnalysis.retentionHooks.length === 1 ? 'MEDIUM' : 'LOW'
      }
    })

  } catch (error: any) {
    console.error('Deep analyze error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

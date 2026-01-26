// ============================================
// ROBLOX GAME CLASSIFICATION SYSTEM
// ============================================
//
// MIRRORS DIGITAL MEDIA COMPETITOR GROUPING:
//
// STRUCTURAL CHARACTERISTICS (for Competitor Grouping):
// ┌─────────────────────────────────────────────────────┐
// │  CATEGORY    │ Highest level (like YouTube category)│
// │  VERTICAL    │ Game type (like YouTube vertical)    │
// │  SUB-VERTICAL│ Specific niche (theme + vertical)    │
// │  TEMPLATE    │ The framework/structure              │
// │  CORE MECHANIC│ The gameplay loop                   │
// │  THEME       │ Visual/narrative style               │
// │  COMPLEXITY  │ Development difficulty               │
// │  AGE RANGE   │ Target audience age                  │
// └─────────────────────────────────────────────────────┘
//
// PATTERN ANALYSIS (for Trend Discovery):
// ┌─────────────────────────────────────────────────────┐
// │  RETENTION DRIVERS   │ What keeps players returning │
// │  MONETIZATION HOOKS  │ How the game makes money     │
// │  VIRAL MECHANICS     │ What drives organic growth   │
// │  CORE REQUIREMENTS   │ Must-have features           │
// │  COMMON PITFALLS     │ What to avoid                │
// └─────────────────────────────────────────────────────┘
//
// ============================================

// ============================================
// STRUCTURAL CHARACTERISTICS HIERARCHY
// ============================================

/**
 * CATEGORY - Highest level classification
 * Like YouTube categories (Gaming, Entertainment, Music, etc.)
 */
export const CATEGORIES = {
  SIMULATION: {
    name: 'Simulation',
    description: 'Games focused on simulating activities, collection, progression',
    verticals: ['Simulator', 'Tycoon', 'Idle/Clicker', 'Merge']
  },
  ACTION: {
    name: 'Action',
    description: 'Combat-focused games with active gameplay',
    verticals: ['Action RPG', 'PvP Arena', 'Shooter', 'Fighting']
  },
  STRATEGY: {
    name: 'Strategy',
    description: 'Games requiring tactical thinking and planning',
    verticals: ['Tower Defense', 'Wave Survival', 'Base Building']
  },
  ADVENTURE: {
    name: 'Adventure',
    description: 'Exploration and experience-focused games',
    verticals: ['Obby', 'Horror/Escape', 'Story Experience', 'Exploration']
  },
  SOCIAL: {
    name: 'Social',
    description: 'Social interaction and roleplay focused',
    verticals: ['Roleplay', 'Hangout', 'Party Games']
  },
  SPORTS: {
    name: 'Sports',
    description: 'Athletic and competitive sports games',
    verticals: ['Racing', 'Sports Simulation', 'Fitness']
  }
} as const

/**
 * VERTICAL - Game type within category
 * Like YouTube verticals (Basketball, Street Racing, Challenges, etc.)
 */
export const VERTICALS = {
  // Simulation Category
  SIMULATOR: { name: 'Simulator', category: 'Simulation' },
  TYCOON: { name: 'Tycoon', category: 'Simulation' },
  IDLE_CLICKER: { name: 'Idle/Clicker', category: 'Simulation' },
  MERGE: { name: 'Merge', category: 'Simulation' },
  PET_COLLECTION: { name: 'Pet Collection', category: 'Simulation' },
  GACHA_COLLECTION: { name: 'Gacha/Collection', category: 'Simulation' },

  // Action Category
  ACTION_RPG: { name: 'Action RPG', category: 'Action' },
  PVP_ARENA: { name: 'PvP Arena', category: 'Action' },
  SHOOTER: { name: 'Shooter', category: 'Action' },
  FIGHTING: { name: 'Fighting', category: 'Action' },

  // Strategy Category
  TOWER_DEFENSE: { name: 'Tower Defense', category: 'Strategy' },
  WAVE_SURVIVAL: { name: 'Wave Survival', category: 'Strategy' },
  BASE_BUILDING: { name: 'Base Building', category: 'Strategy' },

  // Adventure Category
  OBBY: { name: 'Obby/Platformer', category: 'Adventure' },
  HORROR_ESCAPE: { name: 'Horror/Escape', category: 'Adventure' },
  STORY_EXPERIENCE: { name: 'Story Experience', category: 'Adventure' },
  EXPLORATION: { name: 'Exploration', category: 'Adventure' },

  // Social Category
  ROLEPLAY: { name: 'Roleplay', category: 'Social' },
  HANGOUT: { name: 'Hangout', category: 'Social' },
  PARTY_GAMES: { name: 'Party Games', category: 'Social' },

  // Sports Category
  RACING: { name: 'Racing', category: 'Sports' },
  SPORTS_SIM: { name: 'Sports Simulation', category: 'Sports' }
} as const

/**
 * THEME - Visual/Narrative style
 * Like VFX Style in digital media
 */
export const THEMES = {
  ANIME: { name: 'Anime', description: 'Japanese animation style, power systems' },
  MEME_BRAINROT: { name: 'Meme/Brainrot', description: 'Internet meme culture, absurdist humor' },
  HORROR: { name: 'Horror', description: 'Scary, suspenseful, creepy' },
  FANTASY: { name: 'Fantasy', description: 'Magic, medieval, mythical creatures' },
  SCIFI: { name: 'Sci-Fi', description: 'Futuristic, space, technology' },
  REALISTIC: { name: 'Realistic', description: 'Real-world settings, grounded' },
  CUTE_KAWAII: { name: 'Cute/Kawaii', description: 'Adorable, colorful, child-friendly' },
  PETS_ANIMALS: { name: 'Pets/Animals', description: 'Animal-focused, creature collection' },
  MILITARY: { name: 'Military', description: 'War, soldiers, tactical' },
  SUPERHERO: { name: 'Superhero', description: 'Powers, heroes, villains' },
  NATURE_FARM: { name: 'Nature/Farm', description: 'Farming, nature, peaceful' },
  FOOD: { name: 'Food', description: 'Cooking, restaurants, food themes' },
  SPORTS: { name: 'Sports', description: 'Athletic, competitive sports' }
} as const

/**
 * TARGET AUDIENCE
 */
export const TARGET_AUDIENCES = {
  YOUNG_KIDS: { ageRange: '6-9', description: 'Simple mechanics, bright colors, cute themes' },
  KIDS: { ageRange: '8-12', description: 'Most Roblox players, collection games, simulators' },
  TWEENS: { ageRange: '10-14', description: 'Competitive games, anime themes, social features' },
  TEENS: { ageRange: '13-17', description: 'Complex mechanics, PvP, horror, mature themes' },
  OLDER_TEENS: { ageRange: '15-18+', description: 'High skill ceiling, competitive, story-driven' }
} as const

// ============================================
// PART 1: COMPETITOR GROUPING
// ============================================

/**
 * TEMPLATE - The game type/framework
 * This is the PRIMARY grouping factor
 */
export const TEMPLATES = {
  // Simulation Category
  SIMULATOR: {
    name: 'Simulator',
    description: 'Click/collect resources, upgrade, prestige',
    complexity: 'LOW-MEDIUM'
  },
  INCREMENTAL_TYCOON: {
    name: 'Incremental Tycoon',
    description: 'Build droppers/machines, automate income, rebirth',
    complexity: 'LOW-MEDIUM'
  },
  IDLE_CLICKER: {
    name: 'Idle/Clicker',
    description: 'Minimal interaction, offline progress',
    complexity: 'LOW'
  },

  // Defense Category
  TOWER_DEFENSE: {
    name: 'Tower Defense',
    description: 'Place units, defend waves, upgrade',
    complexity: 'MEDIUM-HIGH'
  },
  WAVE_SURVIVAL: {
    name: 'Wave Survival',
    description: 'Survive waves of enemies, upgrade between rounds',
    complexity: 'MEDIUM'
  },

  // Action Category
  ACTION_RPG: {
    name: 'Action RPG',
    description: 'Combat, loot, level progression',
    complexity: 'HIGH'
  },
  PVP_ARENA: {
    name: 'PvP Arena',
    description: 'Player vs player combat',
    complexity: 'MEDIUM-HIGH'
  },

  // Collection Category
  GACHA_COLLECTION: {
    name: 'Gacha/Collection',
    description: 'Roll/spin for items, collect, trade',
    complexity: 'LOW-MEDIUM'
  },
  MERGE_GAME: {
    name: 'Merge Game',
    description: 'Combine items to evolve',
    complexity: 'LOW'
  },
  PET_COLLECTION: {
    name: 'Pet Collection',
    description: 'Hatch, collect, evolve pets',
    complexity: 'MEDIUM'
  },

  // Experience Category
  OBBY: {
    name: 'Obby/Platformer',
    description: 'Navigate obstacle courses',
    complexity: 'LOW-MEDIUM'
  },
  HORROR_ESCAPE: {
    name: 'Horror/Escape',
    description: 'Survive threats, escape',
    complexity: 'MEDIUM'
  },
  STORY_EXPERIENCE: {
    name: 'Story Experience',
    description: 'Narrative-driven gameplay',
    complexity: 'MEDIUM-HIGH'
  },

  // Social Category
  ROLEPLAY: {
    name: 'Roleplay',
    description: 'Social simulation, jobs, housing',
    complexity: 'HIGH'
  },
  HANGOUT: {
    name: 'Hangout/Social',
    description: 'Social space, mini-games',
    complexity: 'MEDIUM'
  }
} as const

/**
 * CORE MECHANIC - The gameplay loop
 * This is the SECONDARY grouping factor
 * Combined with Template creates the Competitor Group
 */
export const CORE_MECHANICS = {
  // Collection-based
  COLLECT_UPGRADE_PRESTIGE: {
    name: 'Collect → Upgrade → Prestige',
    steps: ['Collect resources', 'Upgrade tools/stats', 'Prestige for multipliers', 'Repeat faster'],
    templates: ['Simulator', 'Idle/Clicker']
  },
  BUILD_COLLECT_AUTOMATE_PRESTIGE: {
    name: 'Build → Collect → Automate → Prestige',
    steps: ['Build droppers/machines', 'Collect currency', 'Unlock automation', 'Rebirth for bonuses'],
    templates: ['Incremental Tycoon']
  },
  SPIN_COLLECT_TRADE: {
    name: 'Spin → Collect → Trade',
    steps: ['Spin/roll for items', 'Collect rarities', 'Trade with players', 'Complete collection'],
    templates: ['Gacha/Collection']
  },
  HATCH_EVOLVE_COLLECT: {
    name: 'Hatch → Evolve → Collect',
    steps: ['Hatch eggs', 'Evolve pets', 'Collect all rarities', 'Use pets for bonuses'],
    templates: ['Pet Collection']
  },
  MERGE_EVOLVE_UNLOCK: {
    name: 'Merge → Evolve → Unlock',
    steps: ['Merge same items', 'Create higher tier', 'Unlock new content', 'Repeat'],
    templates: ['Merge Game']
  },

  // Defense-based
  PLACE_DEFEND_UPGRADE: {
    name: 'Place → Defend → Upgrade',
    steps: ['Place defensive units', 'Defend against waves', 'Earn currency', 'Upgrade units'],
    templates: ['Tower Defense']
  },
  SURVIVE_UPGRADE_PROGRESS: {
    name: 'Survive → Upgrade → Progress',
    steps: ['Survive enemy waves', 'Upgrade between rounds', 'Reach higher waves', 'Unlock content'],
    templates: ['Wave Survival']
  },

  // Combat-based
  FIGHT_LOOT_LEVEL: {
    name: 'Fight → Loot → Level',
    steps: ['Fight enemies', 'Collect loot drops', 'Level up character', 'Face harder content'],
    templates: ['Action RPG']
  },
  FIGHT_WIN_RANK: {
    name: 'Fight → Win → Rank',
    steps: ['Enter matches', 'Defeat opponents', 'Gain ranking', 'Unlock cosmetics'],
    templates: ['PvP Arena']
  },

  // Experience-based
  ESCAPE_SURVIVE_WIN: {
    name: 'Escape → Survive → Win',
    steps: ['Enter dangerous area', 'Avoid threats', 'Reach exit', 'Earn rewards'],
    templates: ['Horror/Escape']
  },
  JUMP_CHECKPOINT_COMPLETE: {
    name: 'Jump → Checkpoint → Complete',
    steps: ['Navigate obstacles', 'Reach checkpoints', 'Complete stages', 'Unlock harder levels'],
    templates: ['Obby/Platformer']
  }
} as const

/**
 * COMPLEXITY RATING
 * Critical for identifying opportunities - LOW complexity emerging games are gold
 */
export const COMPLEXITY_LEVELS = {
  LOW: {
    name: 'Low',
    description: 'Simple mechanics, quick to build',
    devTime: '2-4 weeks',
    teamSize: 'Solo',
    examples: ['Idle clickers', 'Simple merge games', 'Basic obbys']
  },
  LOW_MEDIUM: {
    name: 'Low-Medium',
    description: 'Standard patterns, moderate systems',
    devTime: '4-8 weeks',
    teamSize: 'Solo or 2',
    examples: ['Simulators', 'Tycoons', 'Collection games']
  },
  MEDIUM: {
    name: 'Medium',
    description: 'Multiple systems, polish required',
    devTime: '8-12 weeks',
    teamSize: '2-3',
    examples: ['Tower defense', 'Pet sims', 'Horror games']
  },
  MEDIUM_HIGH: {
    name: 'Medium-High',
    description: 'Complex systems, significant content',
    devTime: '12-20 weeks',
    teamSize: '3-5',
    examples: ['PvP arenas', 'Story games']
  },
  HIGH: {
    name: 'High',
    description: 'Advanced mechanics, lots of content',
    devTime: '20+ weeks',
    teamSize: '5+',
    examples: ['Action RPGs', 'Roleplay games']
  }
} as const

// ============================================
// PART 2: PATTERN/TREND DISCOVERY
// ============================================

/**
 * RETENTION DRIVERS - What keeps players coming back
 */
export const RETENTION_DRIVERS = {
  PRESTIGE_REBIRTH: {
    name: 'Prestige/Rebirth System',
    description: 'Reset progress for permanent bonuses',
    impact: 'HIGH - extends gameplay indefinitely'
  },
  DAILY_REWARDS: {
    name: 'Daily Rewards',
    description: 'Escalating rewards for consecutive logins',
    impact: 'MEDIUM - +15-30% D7 retention'
  },
  AUTOMATION_UNLOCKS: {
    name: 'Automation Unlocks',
    description: 'Auto-collect/farm as progression reward',
    impact: 'HIGH - idle engagement'
  },
  COMPETITIVE_LEADERBOARDS: {
    name: 'Competitive Leaderboards',
    description: 'Rankings that reset periodically',
    impact: 'MEDIUM - hardcore player retention'
  },
  COLLECTION_COMPLETION: {
    name: 'Collection Completion',
    description: 'Drive to collect all items/pets',
    impact: 'HIGH - completionist motivation'
  },
  LIMITED_EVENTS: {
    name: 'Limited-Time Events',
    description: 'FOMO-driven seasonal content',
    impact: 'HIGH - spikes DAU 30-100%'
  },
  SOCIAL_GUILDS: {
    name: 'Guilds/Groups',
    description: 'Social commitment and cooperation',
    impact: 'HIGH - long-term stickiness'
  },
  WORLD_PROGRESSION: {
    name: 'World/Area Unlocks',
    description: 'New areas to discover',
    impact: 'MEDIUM - exploration motivation'
  }
} as const

/**
 * MONETIZATION HOOKS - How games make money
 */
export const MONETIZATION_HOOKS = {
  MULTIPLIER_PASSES: {
    name: '2x/3x Earnings Passes',
    description: 'Permanent collection speed boosts',
    avgPrice: '99-299 Robux',
    effectiveness: 'HIGH'
  },
  AUTO_COLLECT: {
    name: 'Auto-Collect Pass',
    description: 'Automatic resource gathering',
    avgPrice: '149-399 Robux',
    effectiveness: 'HIGH'
  },
  PREMIUM_AREAS: {
    name: 'Premium Areas',
    description: 'Exclusive zones with better rewards',
    avgPrice: '199-499 Robux',
    effectiveness: 'MEDIUM'
  },
  EXCLUSIVE_TOOLS: {
    name: 'Exclusive Tools/Items',
    description: 'Special equipment unavailable otherwise',
    avgPrice: '99-299 Robux',
    effectiveness: 'MEDIUM'
  },
  VIP_BUNDLE: {
    name: 'VIP Bundle',
    description: 'Package of multiple benefits',
    avgPrice: '399-999 Robux',
    effectiveness: 'HIGH'
  },
  GACHA_SPINS: {
    name: 'Gacha/Crate Spins',
    description: 'Random rewards with rarity tiers',
    avgPrice: '25-100 Robux per spin',
    effectiveness: 'VERY HIGH'
  },
  EXTRA_STORAGE: {
    name: 'Extra Storage/Slots',
    description: 'Inventory expansion',
    avgPrice: '49-199 Robux',
    effectiveness: 'MEDIUM'
  },
  SKIP_TIMERS: {
    name: 'Skip Timers',
    description: 'Bypass waiting periods',
    avgPrice: '25-99 Robux',
    effectiveness: 'MEDIUM'
  },
  BATTLE_PASS: {
    name: 'Battle/Season Pass',
    description: 'Time-limited progression track',
    avgPrice: '399-799 Robux',
    effectiveness: 'HIGH'
  }
} as const

/**
 * VIRAL MECHANICS - What drives organic growth
 */
export const VIRAL_MECHANICS = {
  BIG_NUMBER_FLEXING: {
    name: 'Big Number Flexing',
    description: 'Shareable stats/achievements',
    impact: 'Screenshots, YouTube content'
  },
  SPEEDRUN_PRESTIGE: {
    name: 'Speedrun/Prestige Racing',
    description: 'Competition for fastest resets',
    impact: 'Streaming content, challenges'
  },
  LEADERBOARD_COMPETITION: {
    name: 'Leaderboard Competition',
    description: 'Public rankings',
    impact: 'Competitive drive, bragging'
  },
  TRADING_ECONOMY: {
    name: 'Trading System',
    description: 'Player-to-player economy',
    impact: 'Social engagement, Discord communities'
  },
  RARE_DROP_MOMENTS: {
    name: 'Rare Drop Celebrations',
    description: 'Exciting shareable moments',
    impact: 'TikTok/YouTube shorts'
  },
  PROMO_CODES: {
    name: 'Promo Codes',
    description: 'Content creator distribution',
    impact: 'YouTube/TikTok exposure'
  },
  GROUP_REWARDS: {
    name: 'Group Membership Rewards',
    description: 'Incentive to join Roblox group',
    impact: 'Organic reach, update notifications'
  },
  FRIEND_BONUSES: {
    name: 'Friend/Referral Bonuses',
    description: 'Rewards for inviting friends',
    impact: 'Direct user acquisition'
  }
} as const

/**
 * CORE REQUIREMENTS - What the game MUST have to succeed
 */
export const CORE_REQUIREMENTS = {
  CLEAR_PROGRESSION: {
    name: 'Clear Progression Path',
    description: 'Player always knows what to do next'
  },
  VISUAL_FEEDBACK: {
    name: 'Visual Feedback',
    description: 'Numbers flying, effects, juice'
  },
  MEANINGFUL_PRESTIGE: {
    name: 'Meaningful Prestige/Rebirth',
    description: 'Reset feels rewarding, not punishing'
  },
  AUTOMATION_REWARD: {
    name: 'Automation as Reward',
    description: 'Auto-features unlocked through play'
  },
  LEADERBOARD_SYSTEM: {
    name: 'Leaderboard System',
    description: 'Competition drives engagement'
  },
  TUTORIAL_ONBOARDING: {
    name: 'Good Tutorial/Onboarding',
    description: 'New players understand quickly'
  },
  MOBILE_FRIENDLY: {
    name: 'Mobile-Friendly UI',
    description: '60%+ of Roblox is mobile'
  }
} as const

/**
 * COMMON PITFALLS - What to avoid
 */
export const COMMON_PITFALLS = {
  WALL_TOO_EARLY: {
    name: 'Wall Hits Too Early',
    description: 'Progress stalls before players are hooked'
  },
  UNREWARDING_PRESTIGE: {
    name: 'Prestige Feels Unrewarding',
    description: 'Reset doesn\'t give meaningful boost'
  },
  NO_VISUAL_VARIETY: {
    name: 'No Visual Variety',
    description: 'Everything looks the same'
  },
  P2W_PERCEPTION: {
    name: 'Pay-to-Win Perception',
    description: 'Free players feel disadvantaged'
  },
  CONFUSING_UI: {
    name: 'Confusing UI',
    description: 'Players don\'t understand the game'
  },
  NO_SOCIAL_HOOKS: {
    name: 'No Social Hooks',
    description: 'Nothing to share or compete over'
  },
  STALE_UPDATES: {
    name: 'Stale/No Updates',
    description: 'Game feels abandoned'
  }
} as const

// ============================================
// COMPETITOR GROUP INTERFACE
// ============================================

export interface CompetitorGroup {
  // Identification
  groupId: string
  groupName: string  // e.g., "Incremental Tycoon"

  // PRIMARY CLASSIFICATION (for grouping)
  template: string           // e.g., "Incremental Tycoon"
  coreMechanic: string       // e.g., "Build → Collect → Automate → Prestige"
  complexity: string         // e.g., "Low-Medium"

  // Games in this group
  games: Array<{
    placeId: string
    name: string
    ccu: number
    revenue: number
    likeRatio: number
    daysOld: number
    isEmergingStar: boolean
    uniqueAngle: string  // What makes THIS game different
  }>

  // Qualification
  qualification: {
    score: number
    isQualified: boolean
    hasRevenueProof: boolean
    hasRecentSuccess: boolean
    emergingStarCount: number
  }
}

// ============================================
// PATTERN ANALYSIS INTERFACE (Trend Discovery)
// ============================================

export interface PatternAnalysis {
  // What patterns do games in this group use?
  retentionDrivers: Array<{ pattern: string, count: number, percentage: number }>
  monetizationHooks: Array<{ pattern: string, count: number, percentage: number }>
  viralMechanics: Array<{ pattern: string, count: number, percentage: number }>

  // Core Requirements specific to this group
  coreRequirements: string[]

  // Common Pitfalls to avoid
  commonPitfalls: string[]

  // Example successful games
  exampleGames: string[]
}

// ============================================
// HELPER: Generate Competitor Group Name
// ============================================

export function generateGroupName(template: string, theme?: string): string {
  if (theme && theme !== 'Unknown') {
    return `${theme} ${template}`
  }
  return template
}

// ============================================
// HELPER: Estimate Complexity from Game Data
// ============================================

export function estimateComplexity(
  template: string,
  mechanics: string[],
  hasMultiplayer: boolean,
  hasPvP: boolean
): string {
  // Base complexity from template
  let base = 'MEDIUM'

  const templateData = Object.values(TEMPLATES).find(t => t.name === template)
  if (templateData) {
    base = templateData.complexity
  }

  // Adjustments
  if (hasPvP) base = incrementComplexity(base)
  if (hasMultiplayer && template !== 'Roleplay') base = incrementComplexity(base)
  if (mechanics.length > 5) base = incrementComplexity(base)

  return base
}

function incrementComplexity(level: string): string {
  const order = ['LOW', 'LOW-MEDIUM', 'MEDIUM', 'MEDIUM-HIGH', 'HIGH']
  const idx = order.indexOf(level)
  return order[Math.min(idx + 1, order.length - 1)]
}

// ============================================
// QUALIFICATION & PATTERN ANALYSIS FUNCTIONS
// (Merged from classification-system.ts)
// ============================================

/**
 * Calculate group qualification score
 */
export function calculateQualificationScore(games: any[]): {
  score: number
  isQualified: boolean
  checks: Record<string, boolean>
} {
  const checks = {
    hasRevenueProof: games.some(g => g.metrics?.estimatedRevenue >= 10000),
    hasRecentSuccess: games.some(g => {
      const created = new Date(g.dates?.created)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      return created > sixMonthsAgo && g.metrics?.estimatedRevenue >= 5000
    }),
    hasMultipleSuccesses: games.filter(g => g.metrics?.estimatedRevenue >= 10000).length >= 2,
    hasHighEngagement: games.some(g => parseFloat(g.metrics?.likeRatio || '0') >= 90)
  }

  let score = 0
  if (checks.hasRevenueProof) score += 30
  if (checks.hasRecentSuccess) score += 30
  if (checks.hasMultipleSuccesses) score += 25
  if (checks.hasHighEngagement) score += 15

  return {
    score,
    isQualified: score >= 60,
    checks
  }
}

/**
 * Find overlapping patterns between games
 */
export function findOverlappingPatterns(classifications: any[]): {
  coreLoops: Array<{ pattern: string, count: number, percentage: number }>
  monetization: Array<{ pattern: string, count: number, percentage: number }>
  retention: Array<{ pattern: string, count: number, percentage: number }>
  viral: Array<{ pattern: string, count: number, percentage: number }>
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

  return {
    coreLoops: countPatterns(classifications.map(c => c.coreLoop?.name).filter(Boolean)),
    monetization: countPatterns(classifications.flatMap(c => c.monetizationHooks || [])),
    retention: countPatterns(classifications.flatMap(c => c.retentionHooks || [])),
    viral: countPatterns(classifications.flatMap(c => c.viralHooks || []))
  }
}

/**
 * Generate sub-vertical from vertical + theme
 */
export function generateSubVertical(vertical: string, theme: string): string {
  return `${theme} ${vertical}`
}

// ============================================
// UI-FRIENDLY EXPORTS
// These transform the constants into arrays the UI can consume directly
// ============================================

/**
 * Template options for the Idea Lab template picker
 */
export const UI_TEMPLATES = [
  { id: 'simulator', label: 'Simulator', desc: 'Click/collect/upgrade loops', complexity: 'LOW-MEDIUM' },
  { id: 'tower-defense', label: 'Tower Defense', desc: 'Place units, defend waves', complexity: 'MEDIUM-HIGH' },
  { id: 'tycoon', label: 'Tycoon', desc: 'Build and manage income', complexity: 'LOW-MEDIUM' },
  { id: 'idle-clicker', label: 'Idle/Clicker', desc: 'Minimal interaction, offline progress', complexity: 'LOW' },
  { id: 'pet-collection', label: 'Pet Collection', desc: 'Hatch, collect, evolve pets', complexity: 'MEDIUM' },
  { id: 'gacha-collection', label: 'Gacha/Collection', desc: 'Roll/spin for items, collect, trade', complexity: 'LOW-MEDIUM' },
  { id: 'horror', label: 'Horror/Escape', desc: 'Scary survival/escape', complexity: 'MEDIUM' },
  { id: 'obby', label: 'Obby', desc: 'Obstacle courses and platforming', complexity: 'LOW-MEDIUM' },
  { id: 'action-rpg', label: 'Action RPG', desc: 'Combat, loot, level progression', complexity: 'HIGH' },
  { id: 'pvp-arena', label: 'PvP Arena', desc: 'Player vs player combat', complexity: 'MEDIUM-HIGH' },
  { id: 'wave-survival', label: 'Wave Survival', desc: 'Survive waves, upgrade between rounds', complexity: 'MEDIUM' },
  { id: 'roleplay', label: 'Roleplay', desc: 'Social life simulation', complexity: 'HIGH' },
  { id: 'merge', label: 'Merge Game', desc: 'Combine items to evolve', complexity: 'LOW' },
  { id: 'hangout', label: 'Hangout/Social', desc: 'Social space, mini-games', complexity: 'MEDIUM' },
  { id: 'other', label: 'Other', desc: 'Something different', complexity: 'MEDIUM' },
] as const

/**
 * Theme options for the Idea Lab theme picker
 */
export const UI_THEMES = [
  'Anime', 'Meme/Brainrot', 'Horror', 'Fantasy', 'Sci-Fi',
  'Cute/Kawaii', 'Pets/Animals', 'Military', 'Superhero',
  'Nature/Farm', 'Food', 'Sports', 'Realistic',
  'Pirates', 'Zombies', 'Other'
] as const

/**
 * Category filter options for Emerging/Discover pages
 */
export const UI_CATEGORIES = [
  { id: '', label: 'All Categories' },
  { id: 'simulator', label: 'Simulator' },
  { id: 'tower defense', label: 'Tower Defense' },
  { id: 'tycoon', label: 'Tycoon' },
  { id: 'anime', label: 'Anime' },
  { id: 'horror', label: 'Horror' },
  { id: 'obby', label: 'Obby' },
  { id: 'roleplay', label: 'Roleplay' },
  { id: 'fighting', label: 'Fighting/Combat' },
  { id: 'pet', label: 'Pet Collection' },
] as const

/**
 * Monetization options for Idea Lab
 */
export const UI_MONETIZATION = [
  { id: 'multiplier-pass', label: '2x/3x Earnings Pass', robux: '99-299' },
  { id: 'auto-collect', label: 'Auto-Collect Pass', robux: '149-399' },
  { id: 'premium-areas', label: 'Premium Areas', robux: '199-499' },
  { id: 'vip-bundle', label: 'VIP Bundle', robux: '399-999' },
  { id: 'gacha', label: 'Gacha/Loot Crates', robux: '25-100/spin' },
  { id: 'battle-pass', label: 'Battle/Season Pass', robux: '399-799' },
  { id: 'extra-storage', label: 'Extra Storage/Slots', robux: '49-199' },
  { id: 'skip-timers', label: 'Skip Timers', robux: '25-99' },
  { id: 'exclusive-items', label: 'Exclusive Tools/Items', robux: '99-299' },
  { id: 'trading', label: 'Trading System Pass', robux: '99-199' },
  { id: 'premium-payouts', label: 'Premium Payouts', robux: 'Passive' },
] as const

/**
 * Pattern detection keywords for game classification by name/genre
 */
export const PATTERN_DETECTION: Record<string, {
  keywords: string[]
  pattern: string
  color: string
  vertical: string
}> = {
  'anime-td': {
    keywords: ['anime', 'tower defense', 'defenders', 'adventures', 'all star'],
    pattern: 'Anime TD',
    color: 'text-purple-400 bg-purple-500/20',
    vertical: 'Tower Defense'
  },
  'simulator': {
    keywords: ['simulator', 'sim', 'clicker', 'legends', 'grind'],
    pattern: 'Simulator',
    color: 'text-blue-400 bg-blue-500/20',
    vertical: 'Simulator'
  },
  'pet': {
    keywords: ['pet', 'egg', 'hatch', 'adopt'],
    pattern: 'Pet Sim',
    color: 'text-pink-400 bg-pink-500/20',
    vertical: 'Pet Collection'
  },
  'horror': {
    keywords: ['doors', 'horror', 'scary', 'mimic', 'backrooms', 'escape', 'survive'],
    pattern: 'Horror',
    color: 'text-red-400 bg-red-500/20',
    vertical: 'Horror/Escape'
  },
  'tycoon': {
    keywords: ['tycoon', 'restaurant', 'retail', 'factory', 'empire'],
    pattern: 'Tycoon',
    color: 'text-yellow-400 bg-yellow-500/20',
    vertical: 'Tycoon'
  },
  'roleplay': {
    keywords: ['brookhaven', 'bloxburg', 'roleplay', 'rp', 'avenue', 'city'],
    pattern: 'Roleplay',
    color: 'text-green-400 bg-green-500/20',
    vertical: 'Roleplay'
  },
  'fighting': {
    keywords: ['fruits', 'fighting', 'combat', 'legacy', 'piece', 'arsenal', 'battlegrounds'],
    pattern: 'Combat',
    color: 'text-orange-400 bg-orange-500/20',
    vertical: 'Fighting'
  },
  'obby': {
    keywords: ['obby', 'tower of', 'obstacle', 'parkour'],
    pattern: 'Obby',
    color: 'text-cyan-400 bg-cyan-500/20',
    vertical: 'Obby/Platformer'
  },
  'gacha': {
    keywords: ['gacha', 'pull', 'summon', 'banner', 'luck'],
    pattern: 'Gacha',
    color: 'text-indigo-400 bg-indigo-500/20',
    vertical: 'Gacha/Collection'
  },
  'survival': {
    keywords: ['survival', 'waves', 'zombie', 'defend'],
    pattern: 'Survival',
    color: 'text-amber-400 bg-amber-500/20',
    vertical: 'Wave Survival'
  }
}

/**
 * Vertical-specific strategies: retention, monetization, and viral mechanics
 * This is the pattern library used for strategy display and idea generation
 */
export const VERTICAL_STRATEGIES: Record<string, {
  retention: string[]
  monetization: string[]
  viral: string[]
  coreLoop: string
  coreRequirements: string[]
  pitfalls: string[]
}> = {
  'Simulator': {
    retention: ['Prestige/rebirth system', 'Automation unlocks', 'Competitive leaderboards', 'Daily rewards', 'World progression'],
    monetization: ['2x/3x earnings pass', 'Auto-collect pass', 'Premium areas', 'Exclusive tools', 'VIP bundle'],
    viral: ['Big number flexing', 'Speedrun prestige', 'Leaderboard competition', 'Promo codes'],
    coreLoop: 'Collect → Upgrade → Prestige → Repeat',
    coreRequirements: ['Clear progression path', 'Visual feedback (numbers)', 'Meaningful prestige', 'Automation as reward', 'Mobile-friendly UI'],
    pitfalls: ['Wall hits too early', 'Prestige feels unrewarding', 'No visual variety', 'P2W perception']
  },
  'Tower Defense': {
    retention: ['Unit collection', 'Challenge modes', 'Seasonal events', 'Clan/guild systems', 'Meta progression'],
    monetization: ['Gacha/crate units', 'Extra unit slots', 'Double rewards pass', 'Battle pass', 'VIP servers'],
    viral: ['Trading communities', 'Tier list discussions', 'Update hype cycles', 'YouTuber summons'],
    coreLoop: 'Place → Defend → Upgrade → Collect Units',
    coreRequirements: ['Unit variety + balance', 'Progression depth', 'Trade system', 'Regular content updates', 'Co-op multiplayer'],
    pitfalls: ['Gacha too predatory', 'Power creep', 'No content updates', 'Unbalanced meta']
  },
  'Tycoon': {
    retention: ['Prestige/rebirth system', 'Automation unlocks', 'Leaderboards', 'Daily rewards', 'Building customization'],
    monetization: ['2x earnings pass', 'Auto-collect', 'Premium areas', 'Exclusive machines', 'VIP bundle'],
    viral: ['Building showcases', 'Speedrun prestige', 'Income leaderboards', 'Promo codes'],
    coreLoop: 'Build → Collect → Automate → Prestige',
    coreRequirements: ['Clear upgrade path', 'Visual feedback', 'Meaningful automation', 'Good onboarding'],
    pitfalls: ['Too slow early game', 'No visual progression', 'Confusing layout', 'Stale content']
  },
  'Pet Collection': {
    retention: ['Egg hatching excitement', 'Collection completion', 'Evolution/upgrade paths', 'Limited-time pets', 'Trading economy'],
    monetization: ['Premium eggs', 'Hatch speed boosts', 'Extra pet slots', 'Trading passes', 'Luck boosts'],
    viral: ['Rare pet flexing', 'YouTuber giveaways', 'Trading communities', 'Egg opening videos'],
    coreLoop: 'Hatch → Evolve → Collect → Trade',
    coreRequirements: ['Rarity tiers', 'Trade system', 'Evolution paths', 'Limited-time pets', 'Visual variety'],
    pitfalls: ['Values crash too fast', 'Duping exploits', 'Market saturation', 'Boring progression']
  },
  'Horror/Escape': {
    retention: ['Story/lore reveals', 'Multiple endings', 'Difficulty modes', 'Chapter updates', 'Unlockable content'],
    monetization: ['Skip chapters', 'Cosmetics/skins', 'Extra lives/revives', 'Exclusive chapters', 'Hint system'],
    viral: ['Jump scare reactions', 'Lore theory videos', 'Speedrun community', 'Clip sharing'],
    coreLoop: 'Enter → Survive → Escape → Unlock',
    coreRequirements: ['Atmosphere and tension', 'Procedural elements', 'Replayability', 'Good sound design'],
    pitfalls: ['Too short', 'Jump scare spam', 'No replayability', 'Poor mobile controls']
  },
  'Obby/Platformer': {
    retention: ['Stage progression', 'Time challenges', 'Cosmetics unlocks', 'Leaderboards', 'Daily stages'],
    monetization: ['Skip stage pass', 'Cosmetics', 'Checkpoint saves', 'Speed boosts', 'VIP stages'],
    viral: ['Speedruns', 'Fail compilations', 'Challenge videos', 'Rage moments'],
    coreLoop: 'Jump → Checkpoint → Complete → Unlock',
    coreRequirements: ['Smooth controls', 'Fair difficulty curve', 'Checkpoint system', 'Visual variety'],
    pitfalls: ['Unfair jumps', 'No checkpoints', 'Repetitive visuals', 'Too easy or too hard']
  },
  'Action RPG': {
    retention: ['Loot drops', 'Level progression', 'Boss fights', 'Rare items', 'Skill trees'],
    monetization: ['XP boosts', 'Premium weapons', 'Extra inventory', 'Rerolls', 'Battle pass'],
    viral: ['PvP montages', 'Rare drops', 'Boss kill videos', 'Build showcases'],
    coreLoop: 'Fight → Loot → Level → Face Harder Content',
    coreRequirements: ['Combat feel', 'Loot variety', 'Progression depth', 'Boss encounters'],
    pitfalls: ['Combat feels floaty', 'Too grindy', 'No endgame', 'Unbalanced PvP']
  },
  'PvP Arena': {
    retention: ['Ranking system', 'Character unlocks', 'Seasonal resets', 'Cosmetic rewards', 'Skill-based matchmaking'],
    monetization: ['Cosmetics/skins', 'Battle pass', 'Character unlocks', 'Emotes', 'VIP servers'],
    viral: ['PvP montages', 'Tournament clips', 'Combo videos', 'Rank up celebrations'],
    coreLoop: 'Fight → Win → Rank Up → Unlock',
    coreRequirements: ['Fair matchmaking', 'Responsive controls', 'Character variety', 'Spectator mode'],
    pitfalls: ['Laggy combat', 'P2W characters', 'Toxic community', 'No anti-cheat']
  },
  'Roleplay': {
    retention: ['Housing/building', 'Social connections', 'Jobs/economy', 'Seasonal updates', 'Vehicle collection'],
    monetization: ['Premium homes', 'Exclusive vehicles', 'Special jobs', 'Cosmetics', 'Furniture packs'],
    viral: ['Roleplay content', 'Building showcases', 'Drama/story content', 'House tours'],
    coreLoop: 'Explore → Interact → Build → Socialize',
    coreRequirements: ['Large world', 'Building tools', 'Economy system', 'Social features'],
    pitfalls: ['Empty servers', 'Nothing to do alone', 'Toxic players', 'Performance issues']
  },
  'Gacha/Collection': {
    retention: ['Collection completion', 'Limited-time banners', 'Pity system', 'Evolution paths', 'Trading'],
    monetization: ['Premium currency', 'Extra pulls', 'Guaranteed banners', 'Storage expansion', 'Speed boosts'],
    viral: ['Pull videos', 'Collection showcases', 'Lucky moments', 'Trading communities'],
    coreLoop: 'Spin → Collect → Trade → Complete Sets',
    coreRequirements: ['Fair rates', 'Pity system', 'Visual variety', 'Trade system'],
    pitfalls: ['Rates too low', 'No pity system', 'Values unstable', 'Too many items']
  },
  'Wave Survival': {
    retention: ['Upgrade progression', 'Wave milestones', 'Unlockable characters', 'Leaderboards', 'Co-op'],
    monetization: ['Double rewards', 'Premium characters', 'Extra lives', 'Skip waves', 'Battle pass'],
    viral: ['High wave records', 'Close calls', 'Co-op clutches', 'Build showcases'],
    coreLoop: 'Survive → Upgrade → Face Harder Waves',
    coreRequirements: ['Escalating difficulty', 'Meaningful upgrades', 'Visual variety', 'Performance optimization'],
    pitfalls: ['Repetitive waves', 'No sense of progress', 'Too easy early', 'Lag on high waves']
  },
  'Idle/Clicker': {
    retention: ['Offline progress', 'Prestige layers', 'Achievement milestones', 'Daily bonuses'],
    monetization: ['Speed multipliers', 'Auto-clickers', 'Premium content', 'Ad-free pass'],
    viral: ['Big numbers', 'Prestige speedruns', 'Milestone celebrations'],
    coreLoop: 'Click → Earn → Upgrade → Prestige',
    coreRequirements: ['Satisfying clicks', 'Good number scaling', 'Offline earnings', 'Clear milestones'],
    pitfalls: ['Boring early game', 'Wall too soon', 'No visual feedback', 'Too idle too fast']
  },
  'Merge Game': {
    retention: ['Discovery of new items', 'Chain reactions', 'Board expansion', 'Daily puzzles'],
    monetization: ['Extra board space', 'Speed boosts', 'Premium items', 'Undo moves'],
    viral: ['Satisfying merges', 'Chain combos', 'Discovery moments'],
    coreLoop: 'Merge → Evolve → Discover → Expand',
    coreRequirements: ['Satisfying merge feel', 'Clear tier system', 'Board management', 'Visual feedback'],
    pitfalls: ['Board fills too fast', 'Boring higher tiers', 'No strategy depth', 'Too random']
  }
}

/**
 * Detect game pattern/vertical from name and genre
 */
export function detectGamePattern(name: string, genre?: string): { pattern: string; color: string; vertical: string } | null {
  const searchText = `${name} ${genre || ''}`.toLowerCase()
  for (const [, data] of Object.entries(PATTERN_DETECTION)) {
    for (const keyword of data.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return { pattern: data.pattern, color: data.color, vertical: data.vertical }
      }
    }
  }
  return null
}

/**
 * Get strategy data for a detected pattern
 */
export function getVerticalStrategy(pattern: string): {
  retention: string[]
  monetization: string[]
  viral: string[]
  coreLoop: string
  coreRequirements: string[]
  pitfalls: string[]
} | null {
  // Try direct match first
  if (VERTICAL_STRATEGIES[pattern]) return VERTICAL_STRATEGIES[pattern]

  // Map pattern display names to vertical keys
  const patternMap: Record<string, string> = {
    'Anime TD': 'Tower Defense',
    'Pet Sim': 'Pet Collection',
    'Horror': 'Horror/Escape',
    'Combat': 'Action RPG',
    'Obby': 'Obby/Platformer',
    'Gacha': 'Gacha/Collection',
    'Survival': 'Wave Survival',
  }

  const mapped = patternMap[pattern]
  if (mapped && VERTICAL_STRATEGIES[mapped]) return VERTICAL_STRATEGIES[mapped]

  return null
}

/**
 * Get complexity info (color, label, dev time) for a complexity level
 */
export function getComplexityInfo(complexity: string): {
  label: string
  color: string
  devTime: string
  teamSize: string
} {
  const info: Record<string, { label: string; color: string; devTime: string; teamSize: string }> = {
    'LOW': { label: 'Low', color: 'text-green-400 bg-green-500/20', devTime: '2-4 weeks', teamSize: 'Solo' },
    'LOW-MEDIUM': { label: 'Low-Med', color: 'text-emerald-400 bg-emerald-500/20', devTime: '4-8 weeks', teamSize: 'Solo or 2' },
    'MEDIUM': { label: 'Medium', color: 'text-yellow-400 bg-yellow-500/20', devTime: '8-12 weeks', teamSize: '2-3' },
    'MEDIUM-HIGH': { label: 'Med-High', color: 'text-orange-400 bg-orange-500/20', devTime: '12-20 weeks', teamSize: '3-5' },
    'HIGH': { label: 'High', color: 'text-red-400 bg-red-500/20', devTime: '20+ weeks', teamSize: '5+' },
  }
  return info[complexity] || info['MEDIUM']
}

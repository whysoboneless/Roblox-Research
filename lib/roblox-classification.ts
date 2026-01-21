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

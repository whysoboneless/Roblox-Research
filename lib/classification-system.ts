// Roblox Game Classification System
// Mirrors the digital media competitor grouping methodology

// ============================================
// STRUCTURAL CHARACTERISTICS FOR ROBLOX GAMES
// ============================================

/**
 * Category (Highest Level)
 * Like YouTube categories (Gaming, Entertainment, etc.)
 */
export const CATEGORIES = {
  ADVENTURE: 'Adventure',
  SIMULATION: 'Simulation',
  HORROR: 'Horror',
  SOCIAL: 'Social',
  SPORTS: 'Sports',
  FIGHTING: 'Fighting',
  ROLEPLAY: 'Roleplay',
  BUILDING: 'Building',
  OBBY: 'Obby/Platformer'
} as const

/**
 * Vertical (Game Type/Template)
 * Like YouTube verticals (Basketball, Street Racing, etc.)
 */
export const VERTICALS = {
  SIMULATOR: 'Simulator',
  TOWER_DEFENSE: 'Tower Defense',
  TYCOON: 'Tycoon',
  OBBY: 'Obby',
  HORROR_ESCAPE: 'Horror Escape',
  ACTION_RPG: 'Action RPG',
  ROLEPLAY: 'Roleplay',
  PVP_ARENA: 'PvP Arena',
  SURVIVAL: 'Survival',
  RACING: 'Racing',
  SHOOTER: 'Shooter',
  IDLE: 'Idle/Clicker',
  MERGE: 'Merge Game',
  GACHA: 'Gacha/Collection'
} as const

/**
 * Sub-Vertical (Specific Niche)
 * Like YouTube sub-verticals (NBA, D-League, etc.)
 * These are dynamically generated based on theme + vertical
 */
export type SubVertical = string  // e.g., "Anime Tower Defense", "Pet Simulator", "Brainrot Survival"

/**
 * Content Style (Gameplay Format)
 * Like YouTube formats (Listicle, Commentary, etc.)
 */
export const CONTENT_STYLES = {
  IDLE_AFK: 'Idle/AFK',
  ACTIVE_GRIND: 'Active Grind',
  PVP_COMPETITIVE: 'PvP Competitive',
  COOP_SOCIAL: 'Co-op/Social',
  STORY_DRIVEN: 'Story Driven',
  SANDBOX: 'Sandbox/Creative'
} as const

/**
 * Theme (Visual/Narrative)
 * Like VFX Style in digital media
 */
export const THEMES = {
  ANIME: 'Anime',
  MEME_BRAINROT: 'Meme/Brainrot',
  HORROR: 'Horror',
  FANTASY: 'Fantasy',
  SCIFI: 'Sci-Fi',
  REALISTIC: 'Realistic',
  CUTE_KAWAII: 'Cute/Kawaii',
  MILITARY: 'Military',
  SUPERHERO: 'Superhero',
  NATURE: 'Nature/Farm',
  FOOD: 'Food'
} as const

/**
 * Core Loop Types (The "Winning Formula")
 * This is like the Video Series structure - the repeatable pattern
 */
export const CORE_LOOPS = {
  COLLECT_UPGRADE_PRESTIGE: {
    name: 'Collect → Upgrade → Prestige',
    steps: ['Collect resources', 'Upgrade tools/abilities', 'Prestige for multipliers', 'Repeat with bonuses'],
    typical: ['Simulator', 'Idle'],
    engagement: 'Number go up + reset dopamine'
  },
  PLACE_DEFEND_SURVIVE: {
    name: 'Place → Defend → Survive',
    steps: ['Place defensive units', 'Defend against waves', 'Earn rewards', 'Upgrade units'],
    typical: ['Tower Defense'],
    engagement: 'Strategic satisfaction + wave completion'
  },
  FIGHT_LOOT_LEVEL: {
    name: 'Fight → Loot → Level',
    steps: ['Fight enemies', 'Collect loot drops', 'Level up stats', 'Face harder content'],
    typical: ['Action RPG', 'Fighting'],
    engagement: 'Power fantasy + rare drop excitement'
  },
  ESCAPE_SURVIVE_WIN: {
    name: 'Escape → Survive → Win',
    steps: ['Enter dangerous area', 'Survive threats', 'Reach exit/goal', 'Win rewards'],
    typical: ['Horror Escape', 'Obby'],
    engagement: 'Tension/release + achievement'
  },
  BUILD_EARN_EXPAND: {
    name: 'Build → Earn → Expand',
    steps: ['Build initial structure', 'Earn passive income', 'Expand operations', 'Automate'],
    typical: ['Tycoon'],
    engagement: 'Ownership + growth visualization'
  },
  SPIN_COLLECT_TRADE: {
    name: 'Spin → Collect → Trade',
    steps: ['Spin/roll for items', 'Collect rare items', 'Trade with players', 'Complete collection'],
    typical: ['Gacha', 'Collection'],
    engagement: 'RNG excitement + social trading'
  },
  MERGE_EVOLVE_UNLOCK: {
    name: 'Merge → Evolve → Unlock',
    steps: ['Merge similar items', 'Evolve to higher tier', 'Unlock new content', 'Repeat'],
    typical: ['Merge Game', 'Idle'],
    engagement: 'Satisfying combinations + discovery'
  }
} as const

/**
 * Monetization Hooks
 * The revenue-driving patterns
 */
export const MONETIZATION_PATTERNS = {
  MULTIPLIERS: {
    name: '2x/3x Multipliers',
    description: 'Permanent speed/collection boosts',
    avgPrice: '99-499 Robux',
    effectiveness: 'HIGH'
  },
  VIP_TIER: {
    name: 'VIP/Premium Tier',
    description: 'Bundle of exclusive benefits',
    avgPrice: '299-999 Robux',
    effectiveness: 'HIGH'
  },
  AUTO_FARM: {
    name: 'Auto-Farm/AFK',
    description: 'Automatic resource collection',
    avgPrice: '149-399 Robux',
    effectiveness: 'HIGH'
  },
  GACHA_CRATES: {
    name: 'Gacha/Crates',
    description: 'Random rewards with rarity tiers',
    avgPrice: '25-100 Robux per roll',
    effectiveness: 'VERY HIGH'
  },
  EXTRA_SLOTS: {
    name: 'Extra Slots/Storage',
    description: 'Inventory expansion',
    avgPrice: '49-199 Robux',
    effectiveness: 'MEDIUM'
  },
  SKIP_CONTENT: {
    name: 'Skip/Unlock Content',
    description: 'Bypass grind or time-gates',
    avgPrice: '99-299 Robux',
    effectiveness: 'MEDIUM'
  },
  BATTLE_PASS: {
    name: 'Battle Pass',
    description: 'Season progression track',
    avgPrice: '399-799 Robux',
    effectiveness: 'HIGH'
  }
} as const

/**
 * Retention Hooks
 * What brings players back
 */
export const RETENTION_PATTERNS = {
  DAILY_REWARDS: {
    name: 'Daily Rewards',
    description: 'Escalating login rewards',
    impact: '+15-30% D7 retention'
  },
  PRESTIGE_SYSTEM: {
    name: 'Prestige/Rebirth',
    description: 'Reset with permanent bonuses',
    impact: '+40% long-term retention'
  },
  COLLECTION_COMPLETION: {
    name: 'Collection Completion',
    description: 'Drive to collect all items',
    impact: '+25% session length'
  },
  LEADERBOARDS: {
    name: 'Leaderboards',
    description: 'Competitive ranking',
    impact: '+20% hardcore retention'
  },
  LIMITED_EVENTS: {
    name: 'Limited-Time Events',
    description: 'FOMO-driven seasonal content',
    impact: '+30-100% DAU during events'
  },
  SOCIAL_GUILDS: {
    name: 'Guilds/Groups',
    description: 'Social commitment',
    impact: '+35% long-term retention'
  }
} as const

/**
 * Viral Hooks
 * What drives organic growth
 */
export const VIRAL_PATTERNS = {
  TRADING: {
    name: 'Trading System',
    description: 'Player-to-player economy',
    impact: 'Social engagement + word of mouth'
  },
  PROMO_CODES: {
    name: 'Promo Codes',
    description: 'Content creator distribution',
    impact: 'YouTube/TikTok exposure'
  },
  RARE_DROPS: {
    name: 'Shareable Rare Drops',
    description: 'Exciting moments to share',
    impact: 'Social media virality'
  },
  GROUP_REWARDS: {
    name: 'Group Membership Rewards',
    description: 'Incentive to join Roblox group',
    impact: 'Organic reach + updates'
  },
  FRIEND_INVITES: {
    name: 'Friend Invite Rewards',
    description: 'Bonuses for bringing friends',
    impact: 'Direct user acquisition'
  },
  UGC_CREATION: {
    name: 'UGC/Custom Content',
    description: 'Player-created content',
    impact: 'Community investment + sharing'
  }
} as const

// ============================================
// COMPETITOR GROUP STRUCTURE
// ============================================

export interface CompetitorGroup {
  // Identification
  groupId: string
  groupName: string  // e.g., "Anime Tower Defense"

  // Structural Characteristics
  category: string
  vertical: string
  subVertical: string
  contentStyle: string
  theme: string

  // Target Audience
  targetAudience: {
    ageRange: string
    gender: string
    interests: string[]
  }

  // Games in Group
  games: Array<{
    placeId: string
    name: string
    metrics: {
      ccu: number
      revenue: number
      likeRatio: number
    }
    coreLoop: string
    uniqueAngle: string
    isEmergingStar: boolean
  }>

  // Pattern Analysis
  commonPatterns: {
    dominantCoreLoop: string
    monetizationHooks: string[]
    retentionHooks: string[]
    viralHooks: string[]
  }

  // Qualification
  qualification: {
    score: number
    isQualified: boolean
    emergingStarCount: number
    avgRevenue: number
    recentSuccessCount: number
  }

  // Recommendations
  replicationGuide: {
    mustHave: string[]
    shouldHave: string[]
    differentiationOpportunities: string[]
  }
}

// ============================================
// GAME PATTERN STRUCTURE (Like Video Series)
// ============================================

export interface GamePattern {
  // Identification
  patternId: string
  patternName: string  // e.g., "Anime TD with Gacha Units"

  // Classification
  genre: string        // Highest level
  theme: string        // Visual theme
  topic: string        // Specific focus (like video topic)

  // The Formula
  coreLoop: {
    name: string
    steps: string[]
    engagement: string
  }

  // Success Metrics
  successMetrics: {
    avgRevenue: number
    avgCCU: number
    avgLikeRatio: number
    exampleGames: string[]
  }

  // Replication Guide
  replicationGuide: {
    mechanics: string[]
    monetization: string[]
    retention: string[]
    viral: string[]
    uniqueAngles: string[]  // Ways to differentiate
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate sub-vertical from vertical + theme
 */
export function generateSubVertical(vertical: string, theme: string): string {
  return `${theme} ${vertical}`
}

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

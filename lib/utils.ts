/**
 * SHARED UTILITIES
 * Common functions used across the Roblox Research Tool
 */

// ============================================
// REVENUE ESTIMATION
// ============================================

/**
 * Estimate monthly revenue from CCU and engagement metrics
 * Uses Roblox-standard revenue estimation formula
 */
export function estimateRevenue(ccu: number, likeRatio: number, visits?: number): number {
  // Daily visits estimation (CCU * 15 is standard multiplier)
  const estimatedDailyVisits = visits ? visits / 30 : ccu * 15

  // Revenue per visit (higher for more engaging games)
  const engagementFactor = Math.min(likeRatio / 100, 1)
  const revenuePerVisit = 0.01 * (0.5 + engagementFactor * 0.5)

  // Monthly revenue = daily visits * 30 days * revenue per visit
  return Math.round(estimatedDailyVisits * 30 * revenuePerVisit)
}

// ============================================
// DATE UTILITIES
// ============================================

/**
 * Calculate days since a game was created
 */
export function calculateDaysOld(createdDate: Date | string): number {
  const created = typeof createdDate === 'string' ? new Date(createdDate) : createdDate
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - created.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Check if a date is within the last N months
 */
export function isWithinMonths(date: Date | string, months: number): boolean {
  const checkDate = typeof date === 'string' ? new Date(date) : date
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - months)
  return checkDate > cutoff
}

/**
 * Format a date as relative time (e.g., "3 months ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const checkDate = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 1) return 'Today'
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

// ============================================
// METRICS UTILITIES
// ============================================

/**
 * Parse like ratio from various formats
 */
export function parseLikeRatio(upVotes: number, downVotes: number): number {
  const total = upVotes + downVotes
  if (total === 0) return 0
  return Math.round((upVotes / total) * 100)
}

/**
 * Format large numbers with K/M suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
  return `$${amount}`
}

// ============================================
// EMERGING STAR DETECTION
// ============================================

/**
 * Check if a game qualifies as an emerging star
 * Criteria: Created in last 6 months with good traction
 */
export function isEmergingStar(
  createdDate: Date | string,
  ccu: number,
  estimatedRevenue: number,
  options?: { maxMonths?: number; minCcu?: number; minRevenue?: number }
): boolean {
  const {
    maxMonths = 6,
    minCcu = 1000,
    minRevenue = 5000
  } = options || {}

  const isRecent = isWithinMonths(createdDate, maxMonths)
  const hasGoodMetrics = ccu >= minCcu || estimatedRevenue >= minRevenue

  return isRecent && hasGoodMetrics
}

/**
 * Determine growth signal strength
 */
export function getGrowthSignal(ccu: number, revenue: number): 'STRONG' | 'MODERATE' | 'WEAK' {
  if (ccu > 10000 || revenue > 50000) return 'STRONG'
  if (ccu > 5000 || revenue > 20000) return 'MODERATE'
  return 'WEAK'
}

// ============================================
// ROBLOX API HELPERS
// ============================================

/**
 * Fetch game details from Roblox API
 */
export async function fetchGameDetails(placeId: string | number): Promise<{
  universeId: number
  name: string
  description: string
  playing: number
  visits: number
  created: string
  updated: string
  creator: { name: string; type: string }
} | null> {
  try {
    // Get universe ID from place ID
    const universeRes = await fetch(
      `https://apis.roblox.com/universes/v1/places/${placeId}/universe`,
      { headers: { 'Accept': 'application/json' } }
    )
    if (!universeRes.ok) return null
    const universeData = await universeRes.json()
    const universeId = universeData.universeId

    // Get universe details
    const detailsRes = await fetch(
      `https://games.roblox.com/v1/games?universeIds=${universeId}`,
      { headers: { 'Accept': 'application/json' } }
    )
    if (!detailsRes.ok) return null
    const detailsData = await detailsRes.json()
    const game = detailsData.data?.[0]

    if (!game) return null

    return {
      universeId,
      name: game.name,
      description: game.description,
      playing: game.playing,
      visits: game.visits,
      created: game.created,
      updated: game.updated,
      creator: {
        name: game.creator?.name || 'Unknown',
        type: game.creator?.type || 'Unknown'
      }
    }
  } catch (error) {
    console.error(`Failed to fetch game details for ${placeId}:`, error)
    return null
  }
}

/**
 * Fetch game votes (like/dislike ratio)
 */
export async function fetchGameVotes(universeId: number): Promise<{
  upVotes: number
  downVotes: number
  likeRatio: number
} | null> {
  try {
    const res = await fetch(
      `https://games.roblox.com/v1/games/votes?universeIds=${universeId}`,
      { headers: { 'Accept': 'application/json' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const votes = data.data?.[0]

    if (!votes) return null

    const upVotes = votes.upVotes || 0
    const downVotes = votes.downVotes || 0

    return {
      upVotes,
      downVotes,
      likeRatio: parseLikeRatio(upVotes, downVotes)
    }
  } catch (error) {
    console.error(`Failed to fetch votes for ${universeId}:`, error)
    return null
  }
}

// ============================================
// PATTERN MATCHING
// ============================================

/**
 * Extract vertical/template from game name
 */
export function detectVerticalFromName(name: string): string | null {
  const lower = name.toLowerCase()

  const verticalPatterns: Record<string, string[]> = {
    'Simulator': ['simulator', 'sim', 'clicker', 'idle'],
    'Tower Defense': ['tower defense', 'td', 'defenders'],
    'Tycoon': ['tycoon', 'factory', 'empire'],
    'Obby': ['obby', 'obstacle', 'parkour'],
    'Horror': ['horror', 'scary', 'backrooms', 'escape'],
    'Roleplay': ['roleplay', 'rp', 'life sim'],
    'Fighting': ['fighting', 'pvp', 'battle', 'combat'],
    'Racing': ['racing', 'race', 'car', 'driving'],
    'Survival': ['survival', 'survive', 'apocalypse']
  }

  for (const [vertical, patterns] of Object.entries(verticalPatterns)) {
    if (patterns.some(p => lower.includes(p))) {
      return vertical
    }
  }

  return null
}

/**
 * Extract theme from game name
 */
export function detectThemeFromName(name: string): string | null {
  const lower = name.toLowerCase()

  const themePatterns: Record<string, string[]> = {
    'Anime': ['anime', 'naruto', 'dbz', 'dragon ball', 'jojo', 'bleach', 'one piece'],
    'Meme/Brainrot': ['brainrot', 'skibidi', 'toilet', 'meme', 'ohio', 'grimace'],
    'Horror': ['horror', 'scary', 'monster', 'creepy', 'backrooms'],
    'Fantasy': ['magic', 'wizard', 'dragon', 'medieval', 'kingdom'],
    'Sci-Fi': ['space', 'robot', 'future', 'cyber', 'alien'],
    'Cute/Kawaii': ['cute', 'kawaii', 'pet', 'adopt', 'baby'],
    'Military': ['military', 'army', 'war', 'soldier', 'gun'],
    'Nature': ['farm', 'garden', 'nature', 'animal', 'zoo']
  }

  for (const [theme, patterns] of Object.entries(themePatterns)) {
    if (patterns.some(p => lower.includes(p))) {
      return theme
    }
  }

  return null
}

import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// AI-powered game classification using Claude
// This extracts structural characteristics like the digital media competitor grouping system

const anthropic = new Anthropic()

interface GameClassification {
  // STRUCTURAL CHARACTERISTICS (like YouTube competitor groups)
  category: string           // Highest level: Adventure, Simulation, Horror, etc.
  vertical: string           // General area: Tower Defense, Simulator, Tycoon, etc.
  subVertical: string        // Specific focus: Anime TD, Pet Simulator, etc.
  contentStyle: string       // The "format" equivalent: Idle, Active, PvP, Co-op

  // GAME-SPECIFIC CHARACTERISTICS
  coreLoop: {
    name: string             // e.g., "Collect → Upgrade → Prestige"
    steps: string[]          // Individual loop actions
    engagement: string       // What keeps players in the loop
  }
  theme: string              // Visual/narrative theme: Anime, Meme, Horror, etc.
  targetAudience: {
    ageRange: string         // e.g., "8-14", "13-18"
    interests: string[]      // e.g., ["anime fans", "collectors"]
  }

  // MONETIZATION & RETENTION (the "winning formula" components)
  monetizationHooks: string[]
  retentionHooks: string[]
  viralHooks: string[]

  // PATTERN IDENTIFICATION
  similarTo: string[]        // Known successful games with similar patterns
  uniqueAngle: string        // What differentiates this game
  confidence: number         // 0-1 confidence in classification
}

const CLASSIFICATION_PROMPT = `You are a Roblox game analyst. Analyze this game and extract its structural characteristics for competitor grouping.

GAME DATA:
Name: {name}
Description: {description}
Genre: {genre}
Gamepasses: {gamepasses}
Badges: {badges}

Extract the following in JSON format:

{
  "category": "Highest level category (Adventure, Simulation, Horror, Social, Sports, Fighting, Roleplay)",
  "vertical": "Game type/template (Simulator, Tower Defense, Tycoon, Obby, Horror Escape, Action RPG, Roleplay)",
  "subVertical": "Specific niche (e.g., 'Anime Tower Defense', 'Pet Simulator', 'Brainrot Survival')",
  "contentStyle": "Gameplay style (Idle/AFK, Active Grind, PvP Combat, Co-op, Social, Competitive)",

  "coreLoop": {
    "name": "The main gameplay loop in format: ACTION → ACTION → ACTION (e.g., 'Collect → Upgrade → Prestige')",
    "steps": ["List each step of the loop as separate items"],
    "engagement": "What psychological hook keeps players repeating this loop"
  },

  "theme": "Visual/narrative theme (Anime, Meme/Brainrot, Horror, Fantasy, Sci-Fi, Realistic, Cute/Kawaii)",

  "targetAudience": {
    "ageRange": "Estimated age range (e.g., '8-12', '10-16', '13-18')",
    "interests": ["List 2-3 interests this appeals to"]
  },

  "monetizationHooks": ["List specific monetization strategies visible (multipliers, VIP, gacha, gamepasses, etc.)"],
  "retentionHooks": ["List retention mechanics (daily rewards, prestige, collection, leaderboards, etc.)"],
  "viralHooks": ["List viral/social mechanics (trading, codes, group rewards, shareable moments, etc.)"],

  "similarTo": ["List 2-3 well-known Roblox games with similar patterns"],
  "uniqueAngle": "What makes this game different from similar games",
  "confidence": 0.85
}

Be specific and accurate. If something isn't clear from the data, make reasonable inferences based on common Roblox patterns.
Focus on identifying the CORE LOOP - this is the most important element that defines why players keep playing.`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, genre, gamepasses, badges } = body

    if (!name) {
      return NextResponse.json({ error: 'Game name is required' }, { status: 400 })
    }

    // Format gamepasses and badges for the prompt
    const gamepassList = gamepasses?.length > 0
      ? gamepasses.map((gp: any) => `${gp.name} (${gp.price} R$): ${gp.description || 'No description'}`).join('\n')
      : 'None detected'

    const badgeList = badges?.length > 0
      ? badges.map((b: any) => `${b.name}: ${b.description || 'No description'}`).join('\n')
      : 'None detected'

    // Build the prompt
    const prompt = CLASSIFICATION_PROMPT
      .replace('{name}', name)
      .replace('{description}', description || 'No description available')
      .replace('{genre}', genre || 'Unknown')
      .replace('{gamepasses}', gamepassList)
      .replace('{badges}', badgeList)

    // Call Claude for classification
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        { role: 'user', content: prompt }
      ]
    })

    // Parse the response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse AI response')
    }

    const classification: GameClassification = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      success: true,
      classification,
      raw: responseText
    })

  } catch (error: any) {
    console.error('AI classification error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Batch classify multiple games for competitor grouping
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { games } = body

    if (!games || !Array.isArray(games) || games.length === 0) {
      return NextResponse.json({ error: 'Games array is required' }, { status: 400 })
    }

    // Classify each game
    const classifications = []
    for (const game of games) {
      try {
        const gamepassList = game.gamepasses?.length > 0
          ? game.gamepasses.map((gp: any) => `${gp.name} (${gp.price} R$)`).join(', ')
          : 'None'

        const prompt = CLASSIFICATION_PROMPT
          .replace('{name}', game.name)
          .replace('{description}', game.description || 'No description')
          .replace('{genre}', game.genre || 'Unknown')
          .replace('{gamepasses}', gamepassList)
          .replace('{badges}', 'Not available')

        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }]
        })

        const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)

        if (jsonMatch) {
          classifications.push({
            placeId: game.placeId,
            name: game.name,
            classification: JSON.parse(jsonMatch[0])
          })
        }
      } catch (err) {
        console.error(`Failed to classify ${game.name}:`, err)
      }
    }

    // Group by structural characteristics
    const groups = groupByCharacteristics(classifications)

    return NextResponse.json({
      success: true,
      totalClassified: classifications.length,
      classifications,
      competitorGroups: groups
    })

  } catch (error: any) {
    console.error('Batch classification error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Group games by structural characteristics (like competitor grouping in digital media)
function groupByCharacteristics(classifications: any[]) {
  const groups: Record<string, any> = {}

  for (const item of classifications) {
    const c = item.classification
    // Create group key from vertical + theme (like Category + Vertical in digital media)
    const groupKey = `${c.vertical}::${c.theme}`

    if (!groups[groupKey]) {
      groups[groupKey] = {
        groupName: `${c.theme} ${c.vertical}`,
        vertical: c.vertical,
        theme: c.theme,
        category: c.category,
        games: [],
        commonPatterns: {
          coreLoops: [],
          monetization: [],
          retention: [],
          viral: []
        }
      }
    }

    groups[groupKey].games.push({
      placeId: item.placeId,
      name: item.name,
      subVertical: c.subVertical,
      coreLoop: c.coreLoop,
      uniqueAngle: c.uniqueAngle
    })

    // Collect patterns
    groups[groupKey].commonPatterns.coreLoops.push(c.coreLoop?.name)
    groups[groupKey].commonPatterns.monetization.push(...(c.monetizationHooks || []))
    groups[groupKey].commonPatterns.retention.push(...(c.retentionHooks || []))
    groups[groupKey].commonPatterns.viral.push(...(c.viralHooks || []))
  }

  // Deduplicate and find most common patterns
  for (const key of Object.keys(groups)) {
    const g = groups[key]
    g.commonPatterns.coreLoops = findMostCommon(g.commonPatterns.coreLoops)
    g.commonPatterns.monetization = findMostCommon(g.commonPatterns.monetization)
    g.commonPatterns.retention = findMostCommon(g.commonPatterns.retention)
    g.commonPatterns.viral = findMostCommon(g.commonPatterns.viral)
    g.gameCount = g.games.length
  }

  return Object.values(groups).sort((a, b) => b.gameCount - a.gameCount)
}

// Find most common items in an array with counts
function findMostCommon(arr: string[]): Array<{ pattern: string, count: number }> {
  const counts: Record<string, number> = {}
  for (const item of arr) {
    if (item) {
      counts[item] = (counts[item] || 0) + 1
    }
  }
  return Object.entries(counts)
    .map(([pattern, count]) => ({ pattern, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}

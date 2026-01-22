import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { calculateQualificationScore, findOverlappingPatterns } from '@/lib/roblox-classification'

const anthropic = new Anthropic()

// Create and analyze a competitor group with AI-powered pattern detection
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { games, groupName } = body

    if (!games || !Array.isArray(games) || games.length === 0) {
      return NextResponse.json({ error: 'Games array is required' }, { status: 400 })
    }

    // Step 1: AI-classify each game to extract structural characteristics
    const classifications = []

    for (const game of games) {
      const classification = await classifyGameWithAI(game)
      if (classification) {
        classifications.push({
          ...game,
          classification
        })
      }
    }

    // Step 2: Find overlapping patterns (the "winning formula")
    const overlappingPatterns = findOverlappingPatterns(
      classifications.map(c => c.classification)
    )

    // Step 3: Determine group structural characteristics (most common values)
    const groupCharacteristics = determineGroupCharacteristics(classifications)

    // Step 4: Calculate qualification
    const qualification = calculateQualificationScore(games)

    // Step 5: Identify emerging stars
    const emergingStars = identifyEmergingStars(games)

    // Step 6: Generate replication guide with AI
    const replicationGuide = await generateReplicationGuide(
      groupCharacteristics,
      overlappingPatterns,
      emergingStars
    )

    // Step 7: Save to database (with deduplication)
    const finalGroupName = groupName || groupCharacteristics.subVertical || 'Competitor Group'

    // Check if a group with the same name already exists
    const { data: existingGroup } = await supabase
      .from('competitor_groups')
      .select('id, group_id')
      .eq('group_name', finalGroupName)
      .maybeSingle()

    let savedGroup: any = null
    let saveError: any = null

    const groupData = {
      group_name: finalGroupName,
      structural_characteristics: {
        category: groupCharacteristics.category,
        vertical: groupCharacteristics.vertical,
        subVertical: groupCharacteristics.subVertical,
        theme: groupCharacteristics.theme,
        contentStyle: groupCharacteristics.contentStyle,
        dominantCoreLoop: groupCharacteristics.coreLoop
      },
      qualification_criteria: {
        score: qualification.score,
        checks: qualification.checks,
        emergingStarCount: emergingStars.length
      },
      analysis_notes: {
        overlappingPatterns,
        replicationGuide,
        classifiedAt: new Date().toISOString()
      },
      is_qualified: qualification.isQualified,
      qualification_score: qualification.score,
      updated_at: new Date().toISOString()
    }

    if (existingGroup) {
      // UPDATE existing group instead of creating duplicate
      const { data, error } = await supabase
        .from('competitor_groups')
        .update(groupData)
        .eq('id', existingGroup.id)
        .select()
        .single()
      savedGroup = data
      saveError = error
    } else {
      // Create new group
      const groupId = `group_${Date.now()}`
      const { data, error } = await supabase
        .from('competitor_groups')
        .insert({ ...groupData, group_id: groupId })
        .select()
        .single()
      savedGroup = data
      saveError = error
    }

    if (saveError) {
      console.error('Failed to save group:', saveError)
    }

    // Save individual games and link to group
    for (const game of classifications) {
      // Upsert game
      const { data: savedGame } = await supabase
        .from('games')
        .upsert({
          place_id: parseInt(game.placeId),
          universe_id: game.universeId || null,
          name: game.name,
          genre: game.classification.category,
          last_updated_at: new Date().toISOString()
        }, { onConflict: 'place_id' })
        .select()
        .single()

      if (savedGame && savedGroup) {
        // Link to group
        await supabase.from('group_games').upsert({
          group_id: savedGroup.id,
          game_id: savedGame.id,
          is_emerging_star: emergingStars.some(e => e.placeId === game.placeId),
          quality_score: qualification.score
        }, { onConflict: 'group_id,game_id' })
      }
    }

    return NextResponse.json({
      success: true,
      groupId: savedGroup?.group_id || existingGroup?.group_id || `group_${Date.now()}`,
      groupName: finalGroupName,

      // Structural Characteristics (like competitor group in digital media)
      structuralCharacteristics: groupCharacteristics,

      // The Winning Formula - Overlapping Patterns
      winningFormula: {
        dominantCoreLoop: overlappingPatterns.coreLoops[0],
        topMonetization: overlappingPatterns.monetization.slice(0, 3),
        topRetention: overlappingPatterns.retention.slice(0, 3),
        topViral: overlappingPatterns.viral.slice(0, 3)
      },

      // Qualification
      qualification: {
        score: qualification.score,
        isQualified: qualification.isQualified,
        checks: qualification.checks
      },

      // Emerging Stars
      emergingStars,

      // Individual Game Classifications
      gameClassifications: classifications.map(c => ({
        placeId: c.placeId,
        name: c.name,
        classification: c.classification
      })),

      // Replication Guide
      replicationGuide,

      // All Overlapping Patterns (for deep analysis)
      allPatterns: overlappingPatterns
    })

  } catch (error: any) {
    console.error('Competitor group error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET: List all competitor groups
export async function GET() {
  try {
    const { data: groups, error } = await supabase
      .from('competitor_groups')
      .select(`
        *,
        group_games (
          game_id,
          is_emerging_star,
          games (
            place_id,
            name,
            genre
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      groups: groups || [],
      totalGroups: groups?.length || 0
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// AI classification for a single game
async function classifyGameWithAI(game: any) {
  try {
    const prompt = `Analyze this Roblox game and extract structural characteristics for competitor grouping.

GAME:
Name: ${game.name}
Description: ${game.description || 'Not available'}
Current Players: ${game.metrics?.currentPlayers || 'Unknown'}
Estimated Revenue: $${game.metrics?.estimatedRevenue || 'Unknown'}/month
Like Ratio: ${game.metrics?.likeRatio || 'Unknown'}%

Return JSON only:
{
  "category": "Adventure/Simulation/Horror/Social/Fighting",
  "vertical": "Simulator/Tower Defense/Tycoon/Horror Escape/Action RPG/Obby/Survival",
  "subVertical": "Specific niche like 'Anime Tower Defense' or 'Brainrot Simulator'",
  "theme": "Anime/Meme-Brainrot/Horror/Fantasy/Realistic/Cute",
  "contentStyle": "Idle-AFK/Active Grind/PvP/Co-op/Story",
  "coreLoop": {
    "name": "ACTION → ACTION → ACTION format",
    "steps": ["step1", "step2", "step3"],
    "engagement": "What keeps players hooked"
  },
  "monetizationHooks": ["list monetization strategies"],
  "retentionHooks": ["list retention mechanics"],
  "viralHooks": ["list viral/social mechanics"],
  "similarTo": ["2-3 similar successful games"],
  "uniqueAngle": "What makes this different"
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
    console.error(`Failed to classify ${game.name}:`, err)
    return null
  }
}

// Determine group characteristics from most common values
function determineGroupCharacteristics(classifications: any[]) {
  const getMostCommon = (arr: string[]) => {
    const counts: Record<string, number> = {}
    for (const item of arr) {
      if (item) counts[item] = (counts[item] || 0) + 1
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
    return sorted[0]?.[0] || 'Unknown'
  }

  const cats = classifications.map(c => c.classification?.category).filter(Boolean)
  const verts = classifications.map(c => c.classification?.vertical).filter(Boolean)
  const subs = classifications.map(c => c.classification?.subVertical).filter(Boolean)
  const themes = classifications.map(c => c.classification?.theme).filter(Boolean)
  const styles = classifications.map(c => c.classification?.contentStyle).filter(Boolean)
  const loops = classifications.map(c => c.classification?.coreLoop?.name).filter(Boolean)

  return {
    category: getMostCommon(cats),
    vertical: getMostCommon(verts),
    subVertical: getMostCommon(subs),
    theme: getMostCommon(themes),
    contentStyle: getMostCommon(styles),
    coreLoop: getMostCommon(loops)
  }
}

// Identify emerging stars in the group
function identifyEmergingStars(games: any[]) {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  return games
    .filter(g => {
      const created = new Date(g.dates?.created)
      const isRecent = created > sixMonthsAgo
      const hasGoodMetrics = (g.metrics?.currentPlayers || 0) >= 1000
        || (g.metrics?.estimatedRevenue || 0) >= 5000
      return isRecent && hasGoodMetrics
    })
    .map(g => ({
      placeId: g.placeId,
      name: g.name,
      ccu: g.metrics?.currentPlayers,
      revenue: g.metrics?.estimatedRevenue,
      daysOld: g.daysOld,
      growthSignal: g.metrics?.currentPlayers > 5000 ? 'STRONG' : 'MODERATE'
    }))
    .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
}

// Generate replication guide with AI
async function generateReplicationGuide(
  characteristics: any,
  patterns: any,
  emergingStars: any[]
) {
  try {
    const topLoop = patterns.coreLoops[0]?.pattern || 'Unknown'
    const topMon = patterns.monetization.slice(0, 3).map((p: any) => p.pattern).join(', ')
    const topRet = patterns.retention.slice(0, 3).map((p: any) => p.pattern).join(', ')

    const prompt = `Based on this competitor group analysis, generate a replication guide.

GROUP: ${characteristics.subVertical}
VERTICAL: ${characteristics.vertical}
THEME: ${characteristics.theme}
DOMINANT CORE LOOP: ${topLoop}
TOP MONETIZATION: ${topMon || 'Standard'}
TOP RETENTION: ${topRet || 'Standard'}
EMERGING STARS: ${emergingStars.length} recent successful games

Return JSON only:
{
  "mustHave": ["essential features that ALL successful games in this niche have"],
  "shouldHave": ["common features that most successful games have"],
  "differentiationOpportunities": ["ways to stand out while using the same formula"],
  "avoidThese": ["common mistakes or saturated approaches"],
  "estimatedDifficulty": "Low/Medium/High/Very High",
  "estimatedTimeToMVP": "X weeks",
  "recommendedTeamSize": "solo/2-3/4+"
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
    return {
      mustHave: ['Core loop implementation', 'Basic monetization'],
      shouldHave: ['Daily rewards', 'Social features'],
      differentiationOpportunities: ['Unique theme twist', 'Better UX'],
      avoidThese: ['Exact clones'],
      estimatedDifficulty: 'Medium',
      estimatedTimeToMVP: '4-6 weeks',
      recommendedTeamSize: '2-3'
    }
  } catch (err) {
    console.error('Failed to generate replication guide:', err)
    return null
  }
}

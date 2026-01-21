import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Save a complete competitor group with all games and extracted patterns
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { games, analysis, groupName } = body

    if (!games || !Array.isArray(games) || games.length === 0) {
      return NextResponse.json({ error: 'Games array is required' }, { status: 400 })
    }

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis data is required' }, { status: 400 })
    }

    // Extract patterns from the games
    const extractedPatterns = extractPatterns(games, analysis)

    // Create the competitor group
    const { data: group, error: groupError } = await supabase
      .from('competitor_groups')
      .insert({
        group_id: `group_${Date.now()}`,
        group_name: groupName || analysis.groupName || 'Untitled Group',
        structural_characteristics: {
          genre: analysis.classification?.genre,
          subGenre: analysis.classification?.subGenre,
          theme: analysis.classification?.theme,
          template: analysis.classification?.template,
          coreLoop: analysis.classification?.coreLoop,
          gameCount: games.length
        },
        qualification_criteria: {
          checks: analysis.checks,
          score: analysis.score,
          emergingStars: analysis.emergingStars?.length || 0
        },
        analysis_notes: {
          recommendations: analysis.recommendations,
          extractedPatterns,
          analyzedAt: new Date().toISOString()
        },
        is_qualified: analysis.qualified,
        qualification_score: analysis.score
      })
      .select()
      .single()

    if (groupError) throw groupError

    // Save all games and link to group
    const savedGames = []
    for (const game of games) {
      // Upsert game
      const { data: savedGame, error: gameError } = await supabase
        .from('games')
        .upsert({
          place_id: parseInt(game.placeId),
          universe_id: game.universeId || null,
          name: game.name,
          description: game.description || null,
          genre: game.genre || game.classification?.genre || null,
          creator_id: game.creator?.id || null,
          creator_name: game.creator?.name || null,
          creator_type: game.creator?.type || null,
          game_created_at: game.dates?.created || null,
          thumbnail_url: game.thumbnailUrl || null,
          last_updated_at: new Date().toISOString()
        }, {
          onConflict: 'place_id'
        })
        .select()
        .single()

      if (gameError) {
        console.error(`Failed to save game ${game.placeId}:`, gameError)
        continue
      }

      // Save metrics
      const metrics = game.metrics || {}
      await supabase.from('game_metrics').insert({
        game_id: savedGame.id,
        visits: metrics.visits || null,
        favorites: metrics.favorites || null,
        current_players: metrics.currentPlayers || null,
        likes: metrics.likes || null,
        dislikes: metrics.dislikes || null,
        like_ratio: parseFloat(metrics.likeRatio) || null,
        estimated_revenue: metrics.estimatedRevenue || null
      })

      // Link to group
      const isEmergingStar = analysis.emergingStars?.some(
        (s: any) => s.placeId === game.placeId
      )

      await supabase.from('group_games').upsert({
        group_id: group.id,
        game_id: savedGame.id,
        is_emerging_star: isEmergingStar,
        quality_score: analysis.score
      }, {
        onConflict: 'group_id,game_id'
      })

      savedGames.push(savedGame)
    }

    // Save extracted patterns to game_patterns table
    for (const pattern of extractedPatterns) {
      const patternId = `extracted_${pattern.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      await supabase.from('game_patterns').insert({
        pattern_id: patternId,
        pattern_name: pattern.data.name || `${pattern.type} Pattern`,
        pattern_classification: {
          type: pattern.type,
          sourceGroup: group.group_name
        },
        success_metrics: {
          confidence: pattern.confidence,
          extractedFrom: savedGames.map(g => g.name)
        },
        update_patterns: pattern.data,
        replication_guide: {
          description: pattern.data.description || '',
          mechanics: pattern.data.mechanics || []
        },
        example_game_ids: savedGames.map(g => g.place_id?.toString())
      })
    }

    return NextResponse.json({
      success: true,
      group: {
        id: group.id,
        name: group.group_name,
        qualified: group.is_qualified,
        score: group.qualification_score
      },
      savedGames: savedGames.length,
      extractedPatterns: extractedPatterns.length,
      message: `Saved competitor group "${group.group_name}" with ${savedGames.length} games`
    })

  } catch (error: any) {
    console.error('Save group error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Extract replicable patterns from the games
function extractPatterns(games: any[], analysis: any) {
  const patterns: any[] = []
  const classification = analysis.classification || {}

  // Core Loop Pattern
  if (classification.coreLoop && classification.coreLoop !== 'Unknown') {
    patterns.push({
      type: 'core_loop',
      data: {
        name: classification.coreLoop,
        template: classification.template,
        description: getCoreLoopDescription(classification.template)
      },
      confidence: 0.9
    })
  }

  // Theme Pattern
  if (classification.theme && classification.theme !== 'Unknown') {
    patterns.push({
      type: 'theme',
      data: {
        name: classification.theme,
        commonElements: getThemeElements(classification.theme)
      },
      confidence: 0.85
    })
  }

  // Monetization Pattern (inferred from revenue and engagement)
  const avgRevenue = games.reduce((sum, g) => sum + (g.metrics?.estimatedRevenue || 0), 0) / games.length
  const avgLikeRatio = games.reduce((sum, g) => sum + parseFloat(g.metrics?.likeRatio || '0'), 0) / games.length

  patterns.push({
    type: 'monetization',
    data: {
      avgMonthlyRevenue: Math.round(avgRevenue),
      avgEngagement: avgLikeRatio.toFixed(1),
      revenuePerPlayer: calculateRPP(games),
      likelyMonetization: inferMonetization(classification.template, avgRevenue)
    },
    confidence: 0.7
  })

  // Genre Success Pattern
  if (classification.genre) {
    patterns.push({
      type: 'genre_success',
      data: {
        genre: classification.genre,
        subGenre: classification.subGenre,
        qualifiedCount: games.filter(g =>
          g.metrics?.estimatedRevenue >= 10000 &&
          parseFloat(g.metrics?.likeRatio || '0') >= 70
        ).length,
        totalAnalyzed: games.length,
        successRate: (games.filter(g =>
          g.metrics?.estimatedRevenue >= 10000
        ).length / games.length * 100).toFixed(0) + '%'
      },
      confidence: 0.75
    })
  }

  // Emerging Signals
  const recentGames = games.filter(g => {
    if (!g.dates?.created) return false
    const created = new Date(g.dates.created)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    return created > sixMonthsAgo
  })

  if (recentGames.length > 0) {
    patterns.push({
      type: 'emerging_signals',
      data: {
        recentSuccesses: recentGames.length,
        avgCCU: Math.round(recentGames.reduce((sum, g) =>
          sum + (g.metrics?.currentPlayers || 0), 0) / recentGames.length),
        growthIndicator: recentGames.length >= 2 ? 'STRONG' : 'MODERATE',
        recommendation: recentGames.length >= 2
          ? 'Active niche with recent successes - good opportunity'
          : 'Limited recent activity - higher risk'
      },
      confidence: 0.8
    })
  }

  return patterns
}

function getCoreLoopDescription(template: string): string {
  const descriptions: Record<string, string> = {
    'Simulator': 'Players collect resources, upgrade tools/abilities, and prestige to start over with bonuses',
    'Tower Defense': 'Players place defensive units, upgrade them, and defend against waves of enemies',
    'Tycoon': 'Players build and manage a business or facility, reinvesting profits to expand',
    'Adventure RPG': 'Players fight enemies, collect loot, and level up characters',
    'Obby': 'Players navigate obstacle courses, unlocking checkpoints and new areas',
    'Horror': 'Players survive threats, solve puzzles, and try to escape'
  }
  return descriptions[template] || 'Standard gameplay loop for this genre'
}

function getThemeElements(theme: string): string[] {
  const elements: Record<string, string[]> = {
    'Anime': ['Stylized characters', 'Power systems', 'Training mechanics', 'Character progression'],
    'Pet/Animal': ['Collectible creatures', 'Breeding/evolution', 'Trading economy', 'Rarity tiers'],
    'Medieval': ['Knights/castles', 'Crafting', 'Territory control', 'Historical aesthetics'],
    'Sci-Fi': ['Futuristic tech', 'Space themes', 'Advanced weapons', 'Exploration'],
    'Superhero': ['Powers/abilities', 'Hero customization', 'Villain battles', 'City settings']
  }
  return elements[theme] || ['Theme-specific visuals', 'Related gameplay mechanics']
}

function calculateRPP(games: any[]): string {
  // Revenue per player estimate
  const totalRevenue = games.reduce((sum, g) => sum + (g.metrics?.estimatedRevenue || 0), 0)
  const totalPlayers = games.reduce((sum, g) => sum + (g.metrics?.currentPlayers || 0), 0)
  if (totalPlayers === 0) return '$0.00'
  return '$' + (totalRevenue / totalPlayers / 30).toFixed(2) + '/player/day'
}

function inferMonetization(template: string, avgRevenue: number): string[] {
  const strategies: string[] = []

  // Template-based inference
  if (template === 'Simulator') {
    strategies.push('Gamepass: 2x multipliers', 'Gamepass: Auto-collect', 'Robux currency packs')
  } else if (template === 'Tower Defense') {
    strategies.push('Gamepass: Extra slots', 'Unit crates/gacha', 'Premium units')
  } else if (template === 'Tycoon') {
    strategies.push('Gamepass: Auto-rebirth', 'Expansion packs', 'VIP benefits')
  } else if (template === 'Adventure RPG') {
    strategies.push('Gacha/crates', 'Battle pass', 'Premium gear')
  }

  // Revenue-based inference
  if (avgRevenue > 100000) {
    strategies.push('Multiple purchase options', 'Limited-time offers')
  }

  return strategies.length > 0 ? strategies : ['Standard Roblox monetization']
}

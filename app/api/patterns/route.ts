import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { VERTICAL_STRATEGIES, CORE_MECHANICS, MONETIZATION_HOOKS, RETENTION_DRIVERS, VIRAL_MECHANICS } from '@/lib/roblox-classification'

// GET: Retrieve all proven patterns
export async function GET() {
  try {
    const { data: patterns, error } = await supabase
      .from('game_patterns')
      .select('*')
      .order('confidence_score', { ascending: false })

    if (error) throw error

    // Also return the proven patterns library
    const provenPatterns = getProvenPatternsLibrary()

    return NextResponse.json({
      storedPatterns: patterns || [],
      provenPatterns,
      totalStored: patterns?.length || 0
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Seed the patterns table with proven patterns
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'seed') {
      const provenPatterns = getProvenPatternsLibrary()
      let seeded = 0

      for (const pattern of provenPatterns) {
        const patternId = `pattern_${pattern.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        const { error } = await supabase
          .from('game_patterns')
          .insert({
            pattern_id: patternId,
            pattern_name: pattern.data.name || `${pattern.type} Pattern`,
            pattern_classification: {
              type: pattern.type,
              viability: pattern.data.viability || 'Medium',
              difficulty: pattern.data.difficulty || 'Medium'
            },
            success_metrics: {
              confidence: pattern.confidence,
              avgRevenue: pattern.data.avgRevenue || null,
              successExamples: pattern.data.successExamples || []
            },
            update_patterns: {
              mechanics: pattern.data.mechanics || [],
              elements: pattern.data.elements || [],
              implementation: pattern.data.implementation || null
            },
            replication_guide: {
              description: pattern.data.description || '',
              coreLoop: pattern.data.name || '',
              template: pattern.data.template || null,
              targetAudience: pattern.data.targetAudience || null
            },
            example_game_ids: []
          })

        if (!error) seeded++
        else console.error('Pattern insert error:', error)
      }

      return NextResponse.json({
        success: true,
        seeded,
        message: `Seeded ${seeded} proven patterns into the database`
      })
    }

    return NextResponse.json({ error: 'Invalid action. Use action: "seed"' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Generate proven patterns library from the classification system
function getProvenPatternsLibrary() {
  const patterns: any[] = []

  // Core loop patterns from VERTICAL_STRATEGIES
  for (const [vertical, strategy] of Object.entries(VERTICAL_STRATEGIES)) {
    patterns.push({
      type: 'core_loop',
      data: {
        name: strategy.coreLoop,
        template: vertical,
        description: `${vertical} core gameplay loop with proven retention and monetization`,
        mechanics: strategy.coreRequirements,
        successExamples: [],
        viability: 'HIGH',
        difficulty: vertical.includes('RPG') || vertical === 'Roleplay' ? 'High' : 'Medium'
      },
      confidence: 0.9
    })
  }

  // Monetization patterns from MONETIZATION_HOOKS
  for (const [, hook] of Object.entries(MONETIZATION_HOOKS)) {
    patterns.push({
      type: 'monetization',
      data: {
        name: hook.name,
        description: hook.description,
        mechanics: [`Average price: ${hook.avgPrice}`, `Effectiveness: ${hook.effectiveness}`],
        avgRevenue: hook.effectiveness === 'VERY HIGH' ? 'Very High ($100k+/month)' :
                    hook.effectiveness === 'HIGH' ? 'High ($50k-100k/month)' :
                    'Medium ($10k-50k/month)',
        implementation: `Standard implementation, ${hook.avgPrice} price range`,
        successExamples: []
      },
      confidence: hook.effectiveness === 'VERY HIGH' ? 0.95 :
                  hook.effectiveness === 'HIGH' ? 0.9 : 0.8
    })
  }

  // Retention patterns from RETENTION_DRIVERS
  for (const [, driver] of Object.entries(RETENTION_DRIVERS)) {
    patterns.push({
      type: 'retention',
      data: {
        name: driver.name,
        description: driver.description,
        mechanics: [driver.impact],
        impact: driver.impact,
        implementation: driver.impact.includes('HIGH') ? 'High impact, recommended for all games' : 'Moderate impact, good addition',
        successExamples: []
      },
      confidence: driver.impact.includes('HIGH') ? 0.9 : 0.8
    })
  }

  // Viral patterns from VIRAL_MECHANICS
  for (const [, mechanic] of Object.entries(VIRAL_MECHANICS)) {
    patterns.push({
      type: 'virality',
      data: {
        name: mechanic.name,
        description: mechanic.description,
        mechanics: [mechanic.impact],
        impact: mechanic.impact,
        implementation: 'Standard viral mechanic implementation',
        successExamples: []
      },
      confidence: 0.85
    })
  }

  return patterns
}

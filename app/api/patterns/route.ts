import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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

// The proven patterns library - extracted from successful Roblox games
function getProvenPatternsLibrary() {
  return [
    // CORE LOOP PATTERNS
    {
      type: 'core_loop',
      data: {
        name: 'Collect → Upgrade → Prestige',
        template: 'Simulator',
        description: 'Players collect resources to upgrade tools/abilities, then prestige to reset with permanent bonuses',
        mechanics: [
          'Resource collection (clicking, auto-farming)',
          'Upgrade tree with increasing costs',
          'Prestige system with multipliers',
          'Pets/tools that boost collection',
          'Rebirth for permanent upgrades'
        ],
        successExamples: ['Bee Swarm Simulator', 'Pet Simulator X', 'Mining Simulator'],
        viability: 'HIGH',
        difficulty: 'Medium'
      },
      confidence: 0.95
    },
    {
      type: 'core_loop',
      data: {
        name: 'Place → Upgrade → Defend',
        template: 'Tower Defense',
        description: 'Players strategically place defensive units to stop waves of enemies',
        mechanics: [
          'Unit placement on paths',
          'Unit upgrades (3-5 tiers)',
          'Wave-based enemy spawns',
          'Boss waves',
          'Difficulty scaling',
          'Unit synergies'
        ],
        successExamples: ['Anime Defenders', 'Tower Defense Simulator', 'All Star Tower Defense'],
        viability: 'HIGH',
        difficulty: 'High'
      },
      confidence: 0.95
    },
    {
      type: 'core_loop',
      data: {
        name: 'Fight → Loot → Level',
        template: 'Action RPG',
        description: 'Combat-focused gameplay with loot drops and character progression',
        mechanics: [
          'Combat abilities (skills/combos)',
          'Loot drops with rarity tiers',
          'Level/stats progression',
          'Equipment system',
          'Boss fights',
          'Dungeons/raids'
        ],
        successExamples: ['Blox Fruits', 'GPO', 'Deepwoken'],
        viability: 'HIGH',
        difficulty: 'Very High'
      },
      confidence: 0.95
    },

    // MONETIZATION PATTERNS
    {
      type: 'monetization',
      data: {
        name: 'Gacha/Crate System',
        description: 'Random chance rewards with rarity tiers',
        mechanics: [
          'Currency purchases for crate openings',
          'Visible rarity percentages',
          'Pity system (guaranteed after X pulls)',
          'Limited-time banners',
          'Trading enabled'
        ],
        avgRevenue: 'Very High ($100k+/month)',
        implementation: 'Requires careful balance to avoid predatory feel',
        successExamples: ['Anime Defenders', 'Pet Simulator X']
      },
      confidence: 0.9
    },
    {
      type: 'monetization',
      data: {
        name: 'Gamepass Multipliers',
        description: 'Permanent boosts purchased once',
        mechanics: [
          '2x/3x collection speed',
          'Auto-collect/auto-farm',
          'Extra inventory slots',
          'VIP server benefits',
          'Early access to updates'
        ],
        avgRevenue: 'Medium-High ($30k-100k/month)',
        implementation: 'Easy to implement, good baseline revenue',
        successExamples: ['Most simulators', 'Tycoons']
      },
      confidence: 0.9
    },
    {
      type: 'monetization',
      data: {
        name: 'Battle Pass/Season Pass',
        description: 'Time-limited progression track with rewards',
        mechanics: [
          'Free and premium tracks',
          'Daily/weekly challenges',
          'Exclusive cosmetics',
          'Season-themed content',
          'FOMO-driven purchases'
        ],
        avgRevenue: 'High ($50k-200k/month)',
        implementation: 'Requires regular content updates',
        successExamples: ['Blox Fruits', 'Murder Mystery 2']
      },
      confidence: 0.85
    },

    // THEME PATTERNS
    {
      type: 'theme',
      data: {
        name: 'Anime IP/Style',
        description: 'Japanese animation inspired aesthetics and mechanics',
        elements: [
          'Power systems (chakra, devil fruits, cursed energy)',
          'Training/grinding for abilities',
          'Character transformations',
          'Iconic move references',
          'PvP combat'
        ],
        targetAudience: 'Ages 10-18, anime fans',
        viability: 'Very High',
        risk: 'Copyright concerns with direct IP usage',
        successExamples: ['Blox Fruits', 'Anime Defenders', 'Jujutsu Shenanigans']
      },
      confidence: 0.9
    },
    {
      type: 'theme',
      data: {
        name: 'Pet/Creature Collection',
        description: 'Collectible companion creatures with progression',
        elements: [
          'Egg hatching mechanics',
          'Rarity tiers (Common → Legendary → Secret)',
          'Pet evolution/upgrades',
          'Trading economy',
          'Pet abilities/stats'
        ],
        targetAudience: 'Ages 8-14, collectors',
        viability: 'High',
        risk: 'Market saturation',
        successExamples: ['Pet Simulator X', 'Adopt Me']
      },
      confidence: 0.9
    },

    // RETENTION PATTERNS
    {
      type: 'retention',
      data: {
        name: 'Daily Rewards System',
        description: 'Escalating rewards for consecutive logins',
        mechanics: [
          'Day 1-7 increasing rewards',
          'Streak bonuses',
          'Premium daily rewards',
          'Login notifications',
          'Catch-up mechanics'
        ],
        impact: 'Increases D7 retention by 15-30%',
        implementation: 'Easy - standard pattern',
        successExamples: 'Nearly all successful games'
      },
      confidence: 0.95
    },
    {
      type: 'retention',
      data: {
        name: 'Limited-Time Events',
        description: 'Seasonal or special events with exclusive rewards',
        mechanics: [
          'Holiday themes (Halloween, Christmas)',
          'Exclusive items/pets',
          'Event currency',
          'Time pressure (FOMO)',
          'Community goals'
        ],
        impact: 'Spikes DAU by 30-100% during events',
        implementation: 'Moderate - requires content pipeline',
        successExamples: ['Blox Fruits (seasonal)', 'Pet Sim X (events)']
      },
      confidence: 0.9
    },
    {
      type: 'retention',
      data: {
        name: 'Social/Multiplayer Hooks',
        description: 'Features that encourage playing with others',
        mechanics: [
          'Trading system',
          'Guilds/clans',
          'Co-op bosses/raids',
          'PvP leaderboards',
          'Friend invites with rewards'
        ],
        impact: 'Increases session length 40-60%',
        implementation: 'Complex - networking requirements',
        successExamples: ['Blox Fruits', 'Anime Defenders']
      },
      confidence: 0.85
    },

    // VIRALITY PATTERNS
    {
      type: 'virality',
      data: {
        name: 'UGC Integration',
        description: 'User-generated content for customization',
        mechanics: [
          'Custom skins/accessories',
          'Player-made maps/levels',
          'Showcase features',
          'Creator rewards'
        ],
        impact: 'Extends game lifespan, community investment',
        implementation: 'Complex - moderation required',
        successExamples: ['Generic roleplay games', 'Building games']
      },
      confidence: 0.8
    },
    {
      type: 'virality',
      data: {
        name: 'Shareable Moments',
        description: 'Features designed for social media sharing',
        mechanics: [
          'Rare drop celebrations',
          'Achievement popups',
          'Screenshot modes',
          'Replay systems',
          'Leaderboard milestones'
        ],
        impact: 'Organic marketing, YouTube content',
        implementation: 'Easy to moderate',
        successExamples: ['Pet hatching reveals', 'Rare gacha pulls']
      },
      confidence: 0.85
    }
  ]
}

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Save a game to Supabase (from emerging or discover)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { game, groupId } = body

    if (!game || !game.placeId) {
      return NextResponse.json({ error: 'Game data with placeId is required' }, { status: 400 })
    }

    // Upsert the game (insert or update if exists)
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

    if (gameError) throw gameError

    // Save metrics snapshot
    const metrics = game.metrics || {}
    const { error: metricsError } = await supabase
      .from('game_metrics')
      .insert({
        game_id: savedGame.id,
        visits: metrics.visits || null,
        favorites: metrics.favorites || null,
        current_players: metrics.currentPlayers || null,
        likes: metrics.likes || metrics.upVotes || null,
        dislikes: metrics.dislikes || metrics.downVotes || null,
        like_ratio: parseFloat(metrics.likeRatio) || null,
        estimated_revenue: metrics.estimatedRevenue || null
      })

    if (metricsError) {
      console.error('Failed to save metrics:', metricsError)
    }

    // If groupId provided, add to that group
    if (groupId) {
      const { error: linkError } = await supabase
        .from('group_games')
        .upsert({
          group_id: groupId,
          game_id: savedGame.id,
          is_emerging_star: game.isRecent && metrics.currentPlayers >= 100,
          quality_score: game.emergingScore || null
        }, {
          onConflict: 'group_id,game_id'
        })

      if (linkError) {
        console.error('Failed to link to group:', linkError)
      }
    }

    return NextResponse.json({
      success: true,
      game: savedGame,
      message: `Saved ${game.name} to database`
    })

  } catch (error: any) {
    console.error('Save game error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

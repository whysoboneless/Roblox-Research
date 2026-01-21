import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { placeId: string } }
) {
  try {
    const placeId = parseInt(params.placeId)

    // Get game by place_id
    const { data: game, error } = await supabase
      .from('games')
      .select(`
        *,
        game_metrics (
          id,
          collected_at,
          visits,
          favorites,
          current_players,
          peak_players,
          likes,
          dislikes,
          like_ratio,
          estimated_revenue
        )
      `)
      .eq('place_id', placeId)
      .single()

    if (error) throw error
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Sort metrics by date
    const metrics = (game.game_metrics || []).sort((a: any, b: any) =>
      new Date(a.collected_at).getTime() - new Date(b.collected_at).getTime()
    )

    return NextResponse.json({
      game: {
        ...game,
        game_metrics: undefined,
        metrics_history: metrics,
        latest_metrics: metrics[metrics.length - 1] || null
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

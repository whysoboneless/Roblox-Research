import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get all games with their latest metrics
    const { data: games, error } = await supabase
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
      .order('last_updated_at', { ascending: false })

    if (error) throw error

    // Get latest metrics for each game
    const gamesWithLatestMetrics = games?.map(game => {
      const metrics = game.game_metrics || []
      const latestMetrics = metrics.sort((a: any, b: any) =>
        new Date(b.collected_at).getTime() - new Date(a.collected_at).getTime()
      )[0]

      return {
        ...game,
        game_metrics: undefined,
        latest_metrics: latestMetrics || null
      }
    })

    return NextResponse.json({ games: gamesWithLatestMetrics || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

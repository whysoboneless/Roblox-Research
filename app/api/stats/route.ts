import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get counts for dashboard stats
    const [gamesResult, groupsResult, metricsResult] = await Promise.all([
      supabase.from('games').select('id', { count: 'exact', head: true }),
      supabase.from('competitor_groups').select('id, is_qualified', { count: 'exact' }),
      supabase.from('game_metrics').select('id', { count: 'exact', head: true })
    ])

    const totalGames = gamesResult.count || 0
    const groups = groupsResult.data || []
    const totalGroups = groups.length
    const qualifiedGroups = groups.filter(g => g.is_qualified).length
    const totalMetricSnapshots = metricsResult.count || 0

    // Get recent games with high CCU (emerging stars)
    const { data: emergingStars } = await supabase
      .from('games')
      .select(`
        id,
        place_id,
        name,
        game_created_at,
        game_metrics (current_players, like_ratio, estimated_revenue)
      `)
      .gte('game_created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
      .order('game_created_at', { ascending: false })
      .limit(10)

    // Filter for those with good metrics
    const starsWithMetrics = (emergingStars || []).filter(game => {
      const metrics = game.game_metrics?.[0]
      return metrics && metrics.current_players >= 100 && (metrics.like_ratio || 0) >= 70
    })

    return NextResponse.json({
      stats: {
        totalGames,
        totalGroups,
        qualifiedGroups,
        totalMetricSnapshots,
        emergingStarsCount: starsWithMetrics.length
      },
      emergingStars: starsWithMetrics.slice(0, 5).map(g => ({
        name: g.name,
        placeId: g.place_id,
        ccu: g.game_metrics?.[0]?.current_players || 0
      }))
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

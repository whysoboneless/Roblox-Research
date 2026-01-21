import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get all competitor groups with their games
    const { data: groups, error } = await supabase
      .from('competitor_groups')
      .select(`
        *,
        group_games (
          id,
          is_emerging_star,
          quality_score,
          notes,
          added_at,
          games (
            id,
            place_id,
            name,
            genre,
            creator_name,
            thumbnail_url
          )
        )
      `)
      .order('updated_at', { ascending: false })

    if (error) throw error

    // Transform the nested data
    const transformedGroups = groups?.map(group => ({
      ...group,
      games: group.group_games?.map((gg: any) => ({
        ...gg.games,
        is_emerging_star: gg.is_emerging_star,
        quality_score: gg.quality_score,
        notes: gg.notes
      })) || [],
      group_games: undefined
    }))

    return NextResponse.json({ groups: transformedGroups || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

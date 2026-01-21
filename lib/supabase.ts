import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types for our database
export interface Game {
  id: string
  place_id: number
  universe_id: number
  name: string
  description: string | null
  genre: string | null
  creator_id: number | null
  creator_name: string | null
  creator_type: 'User' | 'Group' | null
  game_created_at: string | null
  thumbnail_url: string | null
  first_tracked_at: string
  last_updated_at: string
}

export interface GameMetrics {
  id: string
  game_id: string
  collected_at: string
  visits: number | null
  favorites: number | null
  current_players: number | null
  peak_players: number | null
  likes: number | null
  dislikes: number | null
  like_ratio: number | null
  estimated_revenue: number | null
}

export interface CompetitorGroup {
  id: string
  group_id: string
  group_name: string
  structural_characteristics: Record<string, any>
  qualification_criteria: Record<string, any>
  analysis_notes: Record<string, any>
  is_qualified: boolean
  qualification_score: number | null
  created_at: string
  updated_at: string
}

export interface GameWithMetrics extends Game {
  latest_metrics?: GameMetrics
}

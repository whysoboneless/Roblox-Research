-- Roblox Research Tool - Initial Schema
-- Run this in the Supabase SQL Editor to set up your database

-- ============================================
-- TABLES
-- ============================================

-- Core game data (one row per game)
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id BIGINT NOT NULL UNIQUE,
  universe_id BIGINT,
  name TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  creator_id BIGINT,
  creator_name TEXT,
  creator_type TEXT CHECK (creator_type IN ('User', 'Group')),
  game_created_at TIMESTAMPTZ,
  thumbnail_url TEXT,
  first_tracked_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time-series metrics (one row per collection per game)
CREATE TABLE IF NOT EXISTS game_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  visits BIGINT,
  favorites BIGINT,
  current_players INT,
  peak_players INT,
  likes INT,
  dislikes INT,
  like_ratio DECIMAL(5,2),
  estimated_revenue DECIMAL(12,2)
);

-- Competitor groups
CREATE TABLE IF NOT EXISTS competitor_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id TEXT UNIQUE NOT NULL,
  group_name TEXT NOT NULL,
  structural_characteristics JSONB DEFAULT '{}',
  qualification_criteria JSONB DEFAULT '{}',
  analysis_notes JSONB DEFAULT '{}',
  is_qualified BOOLEAN DEFAULT FALSE,
  qualification_score INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Many-to-many: games in competitor groups
CREATE TABLE IF NOT EXISTS group_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES competitor_groups(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  is_emerging_star BOOLEAN DEFAULT FALSE,
  quality_score DECIMAL(3,1),
  notes TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, game_id)
);

-- Game patterns for trend analysis
CREATE TABLE IF NOT EXISTS game_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id TEXT UNIQUE NOT NULL,
  pattern_name TEXT NOT NULL,
  pattern_classification JSONB DEFAULT '{}',
  success_metrics JSONB DEFAULT '{}',
  update_patterns JSONB DEFAULT '{}',
  replication_guide JSONB DEFAULT '{}',
  example_game_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_game_metrics_game_time
  ON game_metrics(game_id, collected_at DESC);

CREATE INDEX IF NOT EXISTS idx_game_metrics_collected
  ON game_metrics(collected_at DESC);

CREATE INDEX IF NOT EXISTS idx_games_genre
  ON games(genre);

CREATE INDEX IF NOT EXISTS idx_games_place_id
  ON games(place_id);

CREATE INDEX IF NOT EXISTS idx_games_creator
  ON games(creator_id);

CREATE INDEX IF NOT EXISTS idx_group_games_game
  ON group_games(game_id);

-- ============================================
-- VIEWS
-- ============================================

-- Latest metrics for each game
CREATE OR REPLACE VIEW latest_game_metrics AS
SELECT DISTINCT ON (g.id)
  g.id,
  g.place_id,
  g.name,
  g.genre,
  g.creator_name,
  m.visits,
  m.favorites,
  m.current_players,
  m.likes,
  m.dislikes,
  m.like_ratio,
  m.estimated_revenue,
  m.collected_at
FROM games g
LEFT JOIN game_metrics m ON g.id = m.game_id
ORDER BY g.id, m.collected_at DESC;

-- Games with growth metrics (comparing latest vs 7 days ago)
CREATE OR REPLACE VIEW game_growth AS
WITH latest AS (
  SELECT DISTINCT ON (game_id)
    game_id,
    current_players as latest_ccu,
    visits as latest_visits,
    collected_at as latest_time
  FROM game_metrics
  ORDER BY game_id, collected_at DESC
),
week_ago AS (
  SELECT DISTINCT ON (game_id)
    game_id,
    current_players as prev_ccu,
    visits as prev_visits,
    collected_at as prev_time
  FROM game_metrics
  WHERE collected_at < NOW() - INTERVAL '6 days'
  ORDER BY game_id, collected_at DESC
)
SELECT
  g.id,
  g.place_id,
  g.name,
  g.genre,
  l.latest_ccu,
  w.prev_ccu,
  CASE
    WHEN w.prev_ccu > 0 THEN
      ROUND(((l.latest_ccu - w.prev_ccu)::DECIMAL / w.prev_ccu) * 100, 1)
    ELSE NULL
  END as ccu_growth_pct,
  l.latest_visits - COALESCE(w.prev_visits, 0) as visit_growth,
  l.latest_time
FROM games g
JOIN latest l ON g.id = l.game_id
LEFT JOIN week_ago w ON g.id = w.game_id;

-- Emerging stars: games created in last 6 months with strong growth
CREATE OR REPLACE VIEW emerging_stars AS
SELECT
  g.id,
  g.place_id,
  g.name,
  g.genre,
  g.creator_name,
  g.game_created_at,
  m.current_players,
  m.like_ratio,
  m.estimated_revenue,
  gg.ccu_growth_pct
FROM games g
JOIN latest_game_metrics m ON g.id = m.id
LEFT JOIN game_growth gg ON g.id = gg.id
WHERE g.game_created_at > NOW() - INTERVAL '6 months'
  AND m.current_players > 100
  AND m.like_ratio > 70
ORDER BY m.estimated_revenue DESC;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get historical metrics for a game
CREATE OR REPLACE FUNCTION get_game_history(
  p_place_id BIGINT,
  p_days INT DEFAULT 30
)
RETURNS TABLE (
  collected_at TIMESTAMPTZ,
  visits BIGINT,
  current_players INT,
  like_ratio DECIMAL,
  estimated_revenue DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.collected_at,
    m.visits,
    m.current_players,
    m.like_ratio,
    m.estimated_revenue
  FROM game_metrics m
  JOIN games g ON m.game_id = g.id
  WHERE g.place_id = p_place_id
    AND m.collected_at > NOW() - (p_days || ' days')::INTERVAL
  ORDER BY m.collected_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to find trending games in a genre
CREATE OR REPLACE FUNCTION get_trending_by_genre(
  p_genre TEXT,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  place_id BIGINT,
  name TEXT,
  current_players INT,
  ccu_growth_pct DECIMAL,
  estimated_revenue DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gg.place_id,
    gg.name,
    gg.latest_ccu,
    gg.ccu_growth_pct,
    lm.estimated_revenue
  FROM game_growth gg
  JOIN latest_game_metrics lm ON gg.id = lm.id
  WHERE gg.genre = p_genre
    AND gg.ccu_growth_pct IS NOT NULL
  ORDER BY gg.ccu_growth_pct DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (optional, enable if needed)
-- ============================================

-- Uncomment these if you want to enable RLS
-- ALTER TABLE games ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE game_metrics ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE competitor_groups ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE group_games ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE game_patterns ENABLE ROW LEVEL SECURITY;

-- Allow public read access (since this is research data)
-- CREATE POLICY "Public read access" ON games FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON game_metrics FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON competitor_groups FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON group_games FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON game_patterns FOR SELECT USING (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER competitor_groups_updated_at
  BEFORE UPDATE ON competitor_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER game_patterns_updated_at
  BEFORE UPDATE ON game_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

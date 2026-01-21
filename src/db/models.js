/**
 * Database Models
 * CRUD operations for Roblox research data
 */

import supabase from './supabase.js';

// ============================================
// GAMES
// ============================================

/**
 * Save or update a game record
 * @param {Object} gameData - Game data from Roblox API
 * @returns {Object} Saved game record with ID
 */
export async function saveGame(gameData) {
  if (!supabase) throw new Error('Database not configured');

  const record = {
    place_id: parseInt(gameData.placeId),
    universe_id: gameData.universeId ? parseInt(gameData.universeId) : null,
    name: gameData.name,
    description: gameData.description || null,
    genre: gameData.genre || null,
    creator_id: gameData.creator?.id ? parseInt(gameData.creator.id) : null,
    creator_name: gameData.creator?.name || null,
    creator_type: gameData.creator?.type || null,
    game_created_at: gameData.dates?.created || null,
    thumbnail_url: gameData.thumbnailUrl || null,
    last_updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('games')
    .upsert(record, { onConflict: 'place_id' })
    .select()
    .single();

  if (error) throw new Error(`Failed to save game: ${error.message}`);
  return data;
}

/**
 * Get a game by Place ID
 */
export async function getGameByPlaceId(placeId) {
  if (!supabase) throw new Error('Database not configured');

  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('place_id', parseInt(placeId))
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get game: ${error.message}`);
  }
  return data;
}

/**
 * Get all games, optionally filtered
 */
export async function getGames(filters = {}) {
  if (!supabase) throw new Error('Database not configured');

  let query = supabase.from('games').select('*');

  if (filters.genre) {
    query = query.eq('genre', filters.genre);
  }
  if (filters.creatorId) {
    query = query.eq('creator_id', parseInt(filters.creatorId));
  }

  const { data, error } = await query.order('last_updated_at', { ascending: false });

  if (error) throw new Error(`Failed to get games: ${error.message}`);
  return data;
}

// ============================================
// METRICS
// ============================================

/**
 * Save a metrics snapshot for a game
 * @param {string} gameId - Database game ID (UUID)
 * @param {Object} metrics - Metrics data
 */
export async function saveMetrics(gameId, metrics) {
  if (!supabase) throw new Error('Database not configured');

  const record = {
    game_id: gameId,
    visits: metrics.visits || null,
    favorites: metrics.favorites || null,
    current_players: metrics.currentPlayers || null,
    peak_players: metrics.peakPlayers || null,
    likes: metrics.likes || null,
    dislikes: metrics.dislikes || null,
    like_ratio: metrics.likeRatio ? parseFloat(metrics.likeRatio) : null,
    estimated_revenue: metrics.estimatedRevenue || null
  };

  const { data, error } = await supabase
    .from('game_metrics')
    .insert(record)
    .select()
    .single();

  if (error) throw new Error(`Failed to save metrics: ${error.message}`);
  return data;
}

/**
 * Get metrics history for a game
 * @param {number} placeId - Roblox Place ID
 * @param {number} days - Number of days of history
 */
export async function getGameHistory(placeId, days = 30) {
  if (!supabase) throw new Error('Database not configured');

  const { data, error } = await supabase
    .rpc('get_game_history', {
      p_place_id: parseInt(placeId),
      p_days: days
    });

  if (error) throw new Error(`Failed to get game history: ${error.message}`);
  return data;
}

/**
 * Get latest metrics for all games
 */
export async function getLatestMetrics() {
  if (!supabase) throw new Error('Database not configured');

  const { data, error } = await supabase
    .from('latest_game_metrics')
    .select('*')
    .order('current_players', { ascending: false });

  if (error) throw new Error(`Failed to get latest metrics: ${error.message}`);
  return data;
}

// ============================================
// COMPETITOR GROUPS
// ============================================

/**
 * Save or update a competitor group
 */
export async function saveCompetitorGroup(group) {
  if (!supabase) throw new Error('Database not configured');

  const record = {
    group_id: group.groupId,
    group_name: group.groupName,
    structural_characteristics: group.structuralCharacteristics || {},
    qualification_criteria: group.qualificationCriteria || {},
    analysis_notes: group.analysisNotes || {},
    is_qualified: group.isQualified || false,
    qualification_score: group.qualificationScore || null
  };

  const { data, error } = await supabase
    .from('competitor_groups')
    .upsert(record, { onConflict: 'group_id' })
    .select()
    .single();

  if (error) throw new Error(`Failed to save competitor group: ${error.message}`);
  return data;
}

/**
 * Add a game to a competitor group
 */
export async function addGameToGroup(groupDbId, gameDbId, options = {}) {
  if (!supabase) throw new Error('Database not configured');

  const record = {
    group_id: groupDbId,
    game_id: gameDbId,
    is_emerging_star: options.isEmergingStar || false,
    quality_score: options.qualityScore || null,
    notes: options.notes || null
  };

  const { data, error } = await supabase
    .from('group_games')
    .upsert(record, { onConflict: 'group_id,game_id' })
    .select()
    .single();

  if (error) throw new Error(`Failed to add game to group: ${error.message}`);
  return data;
}

/**
 * Get all competitor groups with their games
 */
export async function getCompetitorGroups() {
  if (!supabase) throw new Error('Database not configured');

  const { data: groups, error } = await supabase
    .from('competitor_groups')
    .select(`
      *,
      group_games (
        is_emerging_star,
        quality_score,
        notes,
        games (*)
      )
    `)
    .order('qualification_score', { ascending: false });

  if (error) throw new Error(`Failed to get competitor groups: ${error.message}`);
  return groups;
}

/**
 * Get a single competitor group by group_id
 */
export async function getCompetitorGroup(groupId) {
  if (!supabase) throw new Error('Database not configured');

  const { data, error } = await supabase
    .from('competitor_groups')
    .select(`
      *,
      group_games (
        is_emerging_star,
        quality_score,
        notes,
        games (*)
      )
    `)
    .eq('group_id', groupId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get competitor group: ${error.message}`);
  }
  return data;
}

// ============================================
// TRENDS & ANALYSIS
// ============================================

/**
 * Get emerging star games
 */
export async function getEmergingStars() {
  if (!supabase) throw new Error('Database not configured');

  const { data, error } = await supabase
    .from('emerging_stars')
    .select('*')
    .order('estimated_revenue', { ascending: false });

  if (error) throw new Error(`Failed to get emerging stars: ${error.message}`);
  return data;
}

/**
 * Get games with growth data
 */
export async function getGameGrowth() {
  if (!supabase) throw new Error('Database not configured');

  const { data, error } = await supabase
    .from('game_growth')
    .select('*')
    .not('ccu_growth_pct', 'is', null)
    .order('ccu_growth_pct', { ascending: false });

  if (error) throw new Error(`Failed to get game growth: ${error.message}`);
  return data;
}

/**
 * Get trending games by genre
 */
export async function getTrendingByGenre(genre, limit = 20) {
  if (!supabase) throw new Error('Database not configured');

  const { data, error } = await supabase
    .rpc('get_trending_by_genre', {
      p_genre: genre,
      p_limit: limit
    });

  if (error) throw new Error(`Failed to get trending: ${error.message}`);
  return data;
}

// ============================================
// PATTERNS
// ============================================

/**
 * Save a game pattern
 */
export async function savePattern(pattern) {
  if (!supabase) throw new Error('Database not configured');

  const record = {
    pattern_id: pattern.patternId,
    pattern_name: pattern.patternName,
    pattern_classification: pattern.patternClassification || {},
    success_metrics: pattern.successMetrics || {},
    update_patterns: pattern.updatePatterns || {},
    replication_guide: pattern.replicationGuide || {},
    example_game_ids: pattern.exampleGameIds || []
  };

  const { data, error } = await supabase
    .from('game_patterns')
    .upsert(record, { onConflict: 'pattern_id' })
    .select()
    .single();

  if (error) throw new Error(`Failed to save pattern: ${error.message}`);
  return data;
}

/**
 * Get all patterns
 */
export async function getPatterns() {
  if (!supabase) throw new Error('Database not configured');

  const { data, error } = await supabase
    .from('game_patterns')
    .select('*')
    .order('pattern_name');

  if (error) throw new Error(`Failed to get patterns: ${error.message}`);
  return data;
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Save a game with its metrics in one operation
 */
export async function saveGameWithMetrics(gameData, estimatedRevenue = null) {
  if (!supabase) throw new Error('Database not configured');

  // Save game first
  const game = await saveGame(gameData);

  // Then save metrics
  const metricsData = {
    ...gameData.metrics,
    estimatedRevenue
  };

  await saveMetrics(game.id, metricsData);

  return game;
}

/**
 * Import a full competitor group from JSON
 */
export async function importCompetitorGroup(groupData) {
  if (!supabase) throw new Error('Database not configured');

  // Save the group
  const group = await saveCompetitorGroup({
    groupId: groupData.groupId,
    groupName: groupData.groupName,
    structuralCharacteristics: groupData.structuralCharacteristics,
    qualificationCriteria: groupData.qualificationCriteria,
    analysisNotes: groupData.analysisNotes
  });

  // Save each game and link to group
  const savedGames = [];
  for (const competitor of groupData.competitors || []) {
    try {
      const game = await saveGame({
        placeId: competitor.placeId || competitor.gameId,
        universeId: competitor.universeId || competitor.gameId,
        name: competitor.name,
        creator: competitor.creator,
        dates: competitor.dates,
        genre: groupData.structuralCharacteristics?.genre
      });

      // Save metrics if available
      if (competitor.metrics) {
        await saveMetrics(game.id, competitor.metrics);
      }

      // Link to group
      await addGameToGroup(group.id, game.id, {
        isEmergingStar: competitor.isEmergingStar,
        qualityScore: competitor.qualityScore,
        notes: competitor.notes
      });

      savedGames.push(game);
    } catch (e) {
      console.warn(`Failed to import competitor ${competitor.name}: ${e.message}`);
    }
  }

  return { group, games: savedGames };
}

export default {
  saveGame,
  getGameByPlaceId,
  getGames,
  saveMetrics,
  getGameHistory,
  getLatestMetrics,
  saveCompetitorGroup,
  addGameToGroup,
  getCompetitorGroups,
  getCompetitorGroup,
  getEmergingStars,
  getGameGrowth,
  getTrendingByGenre,
  savePattern,
  getPatterns,
  saveGameWithMetrics,
  importCompetitorGroup
};

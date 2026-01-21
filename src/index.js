/**
 * Roblox Research Tool
 * Main entry point and API
 */

import RobloxAPI from './collectors/roblox-api.js';
import DiscoveryCollector from './collectors/discovery.js';
import CompetitorClassifier from './classifiers/competitor-classifier.js';
import NicheQualifier from './qualifiers/niche-qualifier.js';
import TrendAnalyzer from './analyzers/trend-analyzer.js';
import supabase, { isConnected } from './db/supabase.js';
import * as db from './db/models.js';

class RobloxResearchTool {
  constructor(options = {}) {
    this.api = new RobloxAPI(options.apiOptions);
    this.discovery = new DiscoveryCollector(options.discoveryOptions);
    this.classifier = new CompetitorClassifier();
    this.qualifier = new NicheQualifier(options.qualificationCriteria);
    this.trendAnalyzer = new TrendAnalyzer();
    this.db = db;
    this.useDatabase = options.useDatabase !== false; // Default true if configured
  }

  /**
   * Check if database is available
   */
  async isDatabaseReady() {
    return this.useDatabase && await isConnected();
  }

  /**
   * Full research workflow: Discover → Classify → Qualify
   * @param {Object} options - Research options
   */
  async runFullResearch(options = {}) {
    const {
      seedGames = [], // Place IDs to start from
      genre = null,
      searchTerms = [],
      maxGames = 100
    } = options;

    console.log('Starting research workflow...');

    // Step 1: Collect games
    console.log('Step 1: Collecting game data...');
    const games = await this.collectGames({
      seedGames,
      searchTerms,
      genre,
      maxGames
    });

    console.log(`Collected ${games.length} games`);

    // Step 2: Classify into competitor groups
    console.log('Step 2: Classifying games into competitor groups...');
    const { results, groups } = this.classifier.classifyAndGroupGames(games);

    const groupCount = Object.keys(groups).length;
    console.log(`Created ${groupCount} competitor groups`);

    // Step 3: Qualify each group
    console.log('Step 3: Qualifying competitor groups...');
    const qualifiedGroups = this.qualifier.rankCompetitorGroups(Object.values(groups));

    // Step 4: Analyze patterns
    console.log('Step 4: Analyzing game patterns...');
    const patternAnalysis = [];
    for (const group of Object.values(groups)) {
      const analysis = this.trendAnalyzer.analyzeGroupPattern(group);
      patternAnalysis.push(analysis);
    }

    return {
      games,
      groups,
      qualifiedGroups,
      patternAnalysis,
      summary: this._generateSummary(qualifiedGroups, patternAnalysis)
    };
  }

  /**
   * Collect games from various sources
   */
  async collectGames(options) {
    const { seedGames, searchTerms, genre, maxGames } = options;
    const allGames = [];

    // Collect from seed games
    if (seedGames.length > 0) {
      console.log(`Collecting data for ${seedGames.length} seed games...`);
      const seedData = await this.api.collectFullGameData(seedGames);
      allGames.push(...seedData.filter(g => !g.error));
    }

    // Search for games by terms
    for (const term of searchTerms) {
      console.log(`Searching for: ${term}`);
      const searchResults = await this.api.searchGames(term, 20);

      for (const result of searchResults) {
        if (allGames.length >= maxGames) break;
        if (result.placeId && !allGames.find(g => g.placeId === result.placeId)) {
          try {
            const gameData = await this.api.collectFullGameData([result.placeId]);
            allGames.push(...gameData.filter(g => !g.error));
          } catch (error) {
            console.warn(`Failed to collect ${result.name}: ${error.message}`);
          }
        }
      }
    }

    return allGames.slice(0, maxGames);
  }

  /**
   * Quick competitor group analysis
   * @param {string[]} placeIds - Place IDs of known competitors
   */
  async analyzeCompetitorGroup(placeIds) {
    // Collect data
    const games = await this.api.collectFullGameData(placeIds);
    const validGames = games.filter(g => !g.error);

    if (validGames.length === 0) {
      throw new Error('No valid games collected');
    }

    // Classify
    const { groups } = this.classifier.classifyAndGroupGames(validGames);
    const groupValues = Object.values(groups);

    if (groupValues.length === 0) {
      throw new Error('No groups formed');
    }

    // Take the largest group (most games classified together)
    const mainGroup = groupValues.sort((a, b) =>
      b.competitors.length - a.competitors.length
    )[0];

    // Qualify
    const qualification = this.qualifier.qualifyCompetitorGroup(mainGroup);

    // Analyze pattern
    const patternAnalysis = this.trendAnalyzer.analyzeGroupPattern(mainGroup);

    return {
      group: mainGroup,
      qualification,
      patternAnalysis,
      report: this.qualifier.generateReport(qualification)
    };
  }

  /**
   * Find similar games to a reference game
   * @param {string} placeId - Reference game place ID
   * @param {string[]} candidatePlaceIds - Pool of candidates to compare
   */
  async findSimilarGames(placeId, candidatePlaceIds = []) {
    // Get reference game
    const [refGame] = await this.api.collectFullGameData([placeId]);
    if (refGame.error) {
      throw new Error(`Failed to fetch reference game: ${refGame.error}`);
    }

    // Get candidates
    let candidates;
    if (candidatePlaceIds.length > 0) {
      candidates = await this.api.collectFullGameData(candidatePlaceIds);
    } else {
      // Use search to find candidates
      const searchTerms = refGame.name.split(/\s+/).slice(0, 2);
      candidates = [];
      for (const term of searchTerms) {
        const results = await this.api.searchGames(term, 20);
        for (const r of results) {
          if (r.placeId !== placeId) {
            const data = await this.api.collectFullGameData([r.placeId]);
            candidates.push(...data.filter(g => !g.error));
          }
        }
      }
    }

    // Find similar
    const similar = this.classifier.findSimilarGames(refGame, candidates.filter(c => !c.error));

    return {
      referenceGame: refGame,
      similarGames: similar.slice(0, 10)
    };
  }

  /**
   * Generate research summary
   */
  _generateSummary(qualifiedGroups, patternAnalysis) {
    const qualified = qualifiedGroups.filter(g => g.qualified);

    return {
      totalGroupsAnalyzed: qualifiedGroups.length,
      qualifiedGroups: qualified.length,
      topGroups: qualified.slice(0, 3).map(g => ({
        name: g.groupName,
        score: g.score,
        emergingStars: g.emergingStars?.length || 0
      })),
      dominantPatterns: patternAnalysis
        .filter(p => p.dominantPattern)
        .slice(0, 3)
        .map(p => p.dominantPattern.pattern.patternName)
    };
  }

  /**
   * Get available genres and categories
   */
  async getGenreTaxonomy() {
    return this.discovery.getDiscoverCategories();
  }
}

export default RobloxResearchTool;
export {
  RobloxAPI,
  DiscoveryCollector,
  CompetitorClassifier,
  NicheQualifier,
  TrendAnalyzer,
  db,
  supabase
};

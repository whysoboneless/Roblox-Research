/**
 * Discovery Collector
 * Scrapes trending/popular games from Roblox Discover page and Charts
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

const ROBLOX_CHARTS = {
  topTrending: 'https://www.roblox.com/charts/top-trending',
  topPlaying: 'https://www.roblox.com/charts',
  discover: 'https://www.roblox.com/discover'
};

class DiscoveryCollector {
  constructor(options = {}) {
    this.client = axios.create({
      timeout: 15000,
      headers: {
        'Accept': 'text/html,application/xhtml+xml',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
  }

  /**
   * Get trending games from the charts page
   */
  async getTrendingGames() {
    try {
      const response = await this.client.get(ROBLOX_CHARTS.topTrending);
      const $ = cheerio.load(response.data);

      const games = [];

      // Parse game cards from the page
      // Note: Roblox uses dynamic loading, so this may need adjustment
      $('[data-testid="game-tile"], .game-card, .game-tile').each((i, el) => {
        const $el = $(el);
        const link = $el.find('a').first().attr('href') || '';
        const placeIdMatch = link.match(/\/games\/(\d+)/);

        if (placeIdMatch) {
          games.push({
            placeId: placeIdMatch[1],
            name: $el.find('.game-card-name, [data-testid="game-tile-title"]').text().trim(),
            rank: i + 1,
            source: 'trending'
          });
        }
      });

      return games;
    } catch (error) {
      console.error('Failed to fetch trending games:', error.message);
      return [];
    }
  }

  /**
   * Get games from a specific genre/category
   * @param {string} genre - Genre name
   */
  async getGamesByGenre(genre) {
    const genreSlug = genre.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, 'and');
    const url = `${ROBLOX_CHARTS.discover}#/${genreSlug}`;

    try {
      // Note: Genre pages are dynamically loaded
      // This is a placeholder - real implementation would need Puppeteer/Playwright
      console.log(`Fetching games for genre: ${genre}`);
      return [];
    } catch (error) {
      console.error(`Failed to fetch ${genre} games:`, error.message);
      return [];
    }
  }

  /**
   * Parse game IDs from a Roblox page URL list
   * @param {string[]} urls - Array of Roblox game URLs
   */
  parseGameIds(urls) {
    return urls.map(url => {
      const match = url.match(/\/games\/(\d+)/);
      return match ? match[1] : null;
    }).filter(Boolean);
  }

  /**
   * Get discover page categories
   * Returns available genres/sorts on the discover page
   */
  async getDiscoverCategories() {
    // Based on Roblox's official genre taxonomy (October 2024)
    return {
      genres: [
        { id: 'action', name: 'Action', subGenres: ['Battlegrounds & Fighting', 'Music & Rhythm', 'Open World Action'] },
        { id: 'adventure', name: 'Adventure', subGenres: ['Exploration', 'Scavenger Hunt', 'Story'] },
        { id: 'education', name: 'Education', subGenres: [] },
        { id: 'entertainment', name: 'Entertainment', subGenres: ['Music & Audio', 'Showcase & Hub', 'Video'] },
        { id: 'obby-platformer', name: 'Obby & Platformer', subGenres: ['Classic Obby', 'Runner', 'Tower Obby'] },
        { id: 'party-casual', name: 'Party & Casual', subGenres: ['Childhood Game', 'Coloring & Drawing', 'Minigame', 'Quiz'] },
        { id: 'puzzle', name: 'Puzzle', subGenres: ['Escape Room', 'Match & Merge', 'Word'] },
        { id: 'rpg', name: 'RPG', subGenres: ['Action RPG', 'Open World & Survival RPG', 'Turn-based RPG'] },
        { id: 'roleplay-avatar-sim', name: 'Roleplay & Avatar Sim', subGenres: ['Animal Sim', 'Dress Up', 'Life', 'Morph Roleplay', 'Pet Care'] },
        { id: 'shooter', name: 'Shooter', subGenres: ['Battle Royale', 'Deathmatch Shooter', 'PvE Shooter'] },
        { id: 'shopping', name: 'Shopping', subGenres: ['Avatar Shopping'] },
        { id: 'simulation', name: 'Simulation', subGenres: ['Idle', 'Incremental Simulator', 'Physics Sim', 'Sandbox', 'Tycoon', 'Vehicle Sim'] },
        { id: 'social', name: 'Social', subGenres: ['Communication', 'Content Sharing', 'Hangout'] },
        { id: 'sports-racing', name: 'Sports & Racing', subGenres: ['Racing', 'Sports'] },
        { id: 'strategy', name: 'Strategy', subGenres: ['Board & Card Games', 'Tower Defense'] },
        { id: 'survival', name: 'Survival', subGenres: ['1 vs All', 'Escape'] },
        { id: 'utility-other', name: 'Utility & Other', subGenres: [] }
      ],
      sorts: [
        { id: 'top-trending', name: 'Top Trending', description: 'Biggest growth in play time over past 2 weeks' },
        { id: 'top-playing', name: 'Top Playing Now', description: 'Real-time CCU rankings' },
        { id: 'top-revisited', name: 'Top Revisited', description: 'Games players return to most' },
        { id: 'fun-with-friends', name: 'Fun with Friends', description: 'Best for multiplayer' }
      ]
    };
  }
}

export default DiscoveryCollector;

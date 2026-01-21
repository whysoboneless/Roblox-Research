/**
 * Roblox API Client
 * Handles all data collection from Roblox's public APIs
 */

import axios from 'axios';

// API Base URLs
const API_BASES = {
  games: 'https://games.roblox.com',
  apis: 'https://apis.roblox.com',
  thumbnails: 'https://thumbnails.roblox.com',
  users: 'https://users.roblox.com',
  groups: 'https://groups.roblox.com',
  catalog: 'https://catalog.roblox.com',
  www: 'https://www.roblox.com'
};

// Alternative proxy for requests that need it (self-host in production)
const PROXY_BASE = 'https://games.roproxy.com';

class RobloxAPI {
  constructor(options = {}) {
    this.useProxy = options.useProxy || false;
    this.rateLimitDelay = options.rateLimitDelay || 100; // ms between requests
    this.lastRequestTime = 0;

    this.client = axios.create({
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RobloxResearchTool/1.0'
      }
    });
  }

  async _request(url) {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(r => setTimeout(r, this.rateLimitDelay - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();

    try {
      const response = await this.client.get(url);
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        // Rate limited - wait and retry
        console.warn('Rate limited, waiting 5 seconds...');
        await new Promise(r => setTimeout(r, 5000));
        return this._request(url);
      }
      throw error;
    }
  }

  /**
   * Get Universe ID from Place ID
   */
  async getUniverseId(placeId) {
    const url = `${API_BASES.apis}/universes/v1/places/${placeId}/universe`;
    const data = await this._request(url);
    return data.universeId;
  }

  /**
   * Get game details by Universe IDs
   * @param {string[]} universeIds - Array of universe IDs
   */
  async getGamesDetails(universeIds) {
    const ids = Array.isArray(universeIds) ? universeIds : [universeIds];
    const url = `${API_BASES.games}/v1/games?universeIds=${ids.join(',')}`;
    const data = await this._request(url);
    return data.data;
  }

  /**
   * Get game votes (likes/dislikes)
   * @param {string[]} universeIds - Array of universe IDs
   */
  async getGamesVotes(universeIds) {
    const ids = Array.isArray(universeIds) ? universeIds : [universeIds];
    const url = `${API_BASES.games}/v1/games/votes?universeIds=${ids.join(',')}`;
    const data = await this._request(url);
    return data.data;
  }

  /**
   * Get game icons/thumbnails
   * @param {string[]} universeIds - Array of universe IDs
   * @param {string} size - Thumbnail size (e.g., '512x512')
   */
  async getGamesThumbnails(universeIds, size = '512x512') {
    const ids = Array.isArray(universeIds) ? universeIds : [universeIds];
    const url = `${API_BASES.thumbnails}/v1/games/icons?universeIds=${ids.join(',')}&size=${size}&format=Png`;
    const data = await this._request(url);
    return data.data;
  }

  /**
   * Get games list from Discover sorts
   * @param {Object} options - Sort options
   */
  async getGamesSortedList(options = {}) {
    const {
      sortToken = 'default',
      startIndex = 0,
      maxRows = 100,
      genre = null,
      keyword = null
    } = options;

    // Note: This endpoint may require authentication or have changed
    // Using the games list endpoint as fallback
    let url = `${API_BASES.games}/v1/games/list?sortToken=${sortToken}&startRows=${startIndex}&maxRows=${maxRows}`;

    if (genre) {
      url += `&genre=${genre}`;
    }
    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }

    const data = await this._request(url);
    return data;
  }

  /**
   * Search for games by keyword
   * @param {string} keyword - Search term
   */
  async searchGames(keyword, limit = 50) {
    // Games autocomplete API
    const url = `${API_BASES.apis}/games-autocomplete/v1/get-suggestion/${encodeURIComponent(keyword)}`;
    try {
      const data = await this._request(url);
      return data.entries?.slice(0, limit) || [];
    } catch (error) {
      console.warn('Autocomplete failed, trying alternate search...');
      return [];
    }
  }

  /**
   * Get creator (user) details
   * @param {string} userId
   */
  async getUserDetails(userId) {
    const url = `${API_BASES.users}/v1/users/${userId}`;
    return this._request(url);
  }

  /**
   * Get creator (group) details
   * @param {string} groupId
   */
  async getGroupDetails(groupId) {
    const url = `${API_BASES.groups}/v1/groups/${groupId}`;
    return this._request(url);
  }

  /**
   * Get games by creator
   * @param {string} creatorId - User or Group ID
   * @param {string} creatorType - 'User' or 'Group'
   */
  async getGamesByCreator(creatorId, creatorType = 'User') {
    const url = `${API_BASES.games}/v2/users/${creatorId}/games?sortOrder=Desc&limit=50`;
    // Note: Different endpoint for groups
    if (creatorType === 'Group') {
      const groupUrl = `${API_BASES.games}/v2/groups/${creatorId}/games?sortOrder=Desc&limit=50`;
      return this._request(groupUrl);
    }
    return this._request(url);
  }

  /**
   * Batch collect full game data
   * @param {string[]} placeIds - Array of place IDs to collect
   */
  async collectFullGameData(placeIds) {
    const results = [];

    for (const placeId of placeIds) {
      try {
        // Get universe ID first
        const universeId = await this.getUniverseId(placeId);

        // Fetch all data in parallel
        const [details, votes, thumbnails] = await Promise.all([
          this.getGamesDetails([universeId]),
          this.getGamesVotes([universeId]),
          this.getGamesThumbnails([universeId])
        ]);

        const game = details[0];
        const vote = votes[0];
        const thumbnail = thumbnails[0];

        results.push({
          placeId,
          universeId,
          name: game.name,
          description: game.description,
          creator: {
            id: game.creator.id,
            name: game.creator.name,
            type: game.creator.type
          },
          metrics: {
            visits: game.visits,
            favorites: game.favoritedCount,
            currentPlayers: game.playing,
            maxPlayers: game.maxPlayers,
            likes: vote?.upVotes || 0,
            dislikes: vote?.downVotes || 0,
            likeRatio: vote ? (vote.upVotes / (vote.upVotes + vote.downVotes) * 100).toFixed(1) : null
          },
          dates: {
            created: game.created,
            updated: game.updated
          },
          genre: game.genre,
          thumbnailUrl: thumbnail?.imageUrl,
          collectedAt: new Date().toISOString()
        });

      } catch (error) {
        console.error(`Failed to collect data for place ${placeId}:`, error.message);
        results.push({
          placeId,
          error: error.message
        });
      }
    }

    return results;
  }
}

export default RobloxAPI;

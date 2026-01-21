/**
 * Competitor Classifier
 * Classifies games into competitor groups based on structural characteristics
 */

import fs from 'fs/promises';
import path from 'path';

// Classification rules for auto-detecting game characteristics
const CLASSIFICATION_RULES = {
  // Name pattern matching for game templates
  templates: [
    { pattern: /simulator/i, template: 'X Simulator', subGenre: 'Incremental Simulator' },
    { pattern: /tycoon/i, template: 'Tycoon', subGenre: 'Tycoon' },
    { pattern: /tower\s*defense|td/i, template: 'Tower Defense', subGenre: 'Tower Defense' },
    { pattern: /obby/i, template: 'Obby', subGenre: 'Classic Obby' },
    { pattern: /roleplay|rp$/i, template: 'Roleplay', subGenre: 'Life' },
    { pattern: /survival|survive/i, template: 'Survival', subGenre: 'Escape' },
    { pattern: /battle\s*royale|br$/i, template: 'Battle Royale', subGenre: 'Battle Royale' },
    { pattern: /horror|scary/i, template: 'Horror', theme: 'Horror' },
    { pattern: /anime|naruto|one\s*piece|dragon\s*ball|jujutsu|demon\s*slayer/i, template: 'Anime', theme: 'Anime' },
  ],

  // Theme detection from name/description
  themes: [
    { pattern: /anime|naruto|one\s*piece|dragon\s*ball|bleach|jujutsu/i, theme: 'Anime' },
    { pattern: /horror|scary|creepy|haunted/i, theme: 'Horror' },
    { pattern: /medieval|castle|knight|kingdom/i, theme: 'Medieval' },
    { pattern: /sci-?fi|space|alien|futur/i, theme: 'Sci-Fi' },
    { pattern: /meme|funny|dumb|stupid|cursed/i, theme: 'Meme/Comedy' },
    { pattern: /military|army|war|combat|soldier/i, theme: 'Military' },
    { pattern: /sport|basketball|football|soccer|nba/i, theme: 'Sports' },
    { pattern: /restaurant|food|cook|chef|cafe/i, theme: 'Food/Restaurant' },
    { pattern: /pet|animal|zoo|adopt/i, theme: 'Pet/Animal' },
    { pattern: /superhero|hero|villain|power/i, theme: 'Superhero' },
  ],

  // Core loop detection from name
  coreLoops: [
    { pattern: /simulator/i, coreLoop: 'Collect → Upgrade → Prestige' },
    { pattern: /tycoon/i, coreLoop: 'Build → Manage → Expand' },
    { pattern: /rpg|quest|adventure/i, coreLoop: 'Fight → Loot → Level Up' },
    { pattern: /obby|parkour/i, coreLoop: 'Navigate → Complete → Progress' },
    { pattern: /roleplay|rp$/i, coreLoop: 'Social → Trade → Customize' },
    { pattern: /survival|escape/i, coreLoop: 'Survive → Escape → Win' },
    { pattern: /tower\s*defense/i, coreLoop: 'Place → Upgrade → Defend' },
  ]
};

class CompetitorClassifier {
  constructor() {
    this.competitorGroups = new Map();
  }

  /**
   * Auto-classify a game based on its name and description
   * @param {Object} game - Game data object
   */
  classifyGame(game) {
    const text = `${game.name} ${game.description || ''}`.toLowerCase();
    const classification = {
      genre: game.genre || 'Unknown',
      subGenre: null,
      theme: null,
      template: null,
      coreLoop: null,
      confidence: 0
    };

    // Match templates
    for (const rule of CLASSIFICATION_RULES.templates) {
      if (rule.pattern.test(text)) {
        classification.template = rule.template;
        if (rule.subGenre) classification.subGenre = rule.subGenre;
        if (rule.theme) classification.theme = rule.theme;
        classification.confidence += 30;
        break;
      }
    }

    // Match themes
    for (const rule of CLASSIFICATION_RULES.themes) {
      if (rule.pattern.test(text)) {
        if (!classification.theme) {
          classification.theme = rule.theme;
          classification.confidence += 20;
        }
        break;
      }
    }

    // Match core loops
    for (const rule of CLASSIFICATION_RULES.coreLoops) {
      if (rule.pattern.test(text)) {
        classification.coreLoop = rule.coreLoop;
        classification.confidence += 20;
        break;
      }
    }

    // Default confidence boost if we have at least some classification
    if (classification.template || classification.theme) {
      classification.confidence += 10;
    }

    return classification;
  }

  /**
   * Generate a competitor group ID from structural characteristics
   */
  generateGroupId(characteristics) {
    const parts = [
      characteristics.genre?.toLowerCase().replace(/\s+/g, '-'),
      characteristics.subGenre?.toLowerCase().replace(/\s+/g, '-'),
      characteristics.theme?.toLowerCase().replace(/\s+/g, '-')
    ].filter(Boolean);

    return parts.join('-') || 'uncategorized';
  }

  /**
   * Find or create a competitor group for a game
   * @param {Object} game - Classified game data
   */
  assignToGroup(game, classification) {
    const groupId = this.generateGroupId(classification);

    if (!this.competitorGroups.has(groupId)) {
      this.competitorGroups.set(groupId, {
        groupId,
        groupName: this._generateGroupName(classification),
        structuralCharacteristics: {
          genre: classification.genre,
          subGenre: classification.subGenre,
          theme: classification.theme,
          coreLoop: classification.coreLoop,
          template: classification.template
        },
        competitors: []
      });
    }

    const group = this.competitorGroups.get(groupId);
    group.competitors.push({
      ...game,
      classification,
      addedAt: new Date().toISOString()
    });

    return groupId;
  }

  /**
   * Generate a human-readable group name
   */
  _generateGroupName(classification) {
    const parts = [];
    if (classification.theme) parts.push(classification.theme);
    if (classification.subGenre) parts.push(classification.subGenre);
    else if (classification.template) parts.push(classification.template);

    return parts.join(' ') || 'Uncategorized Games';
  }

  /**
   * Batch classify and group games
   * @param {Object[]} games - Array of game data objects
   */
  classifyAndGroupGames(games) {
    const results = [];

    for (const game of games) {
      const classification = this.classifyGame(game);
      const groupId = this.assignToGroup(game, classification);

      results.push({
        game,
        classification,
        groupId
      });
    }

    return {
      results,
      groups: Object.fromEntries(this.competitorGroups)
    };
  }

  /**
   * Export competitor groups to files
   * @param {string} outputDir - Directory to save group files
   */
  async exportGroups(outputDir) {
    await fs.mkdir(outputDir, { recursive: true });

    for (const [groupId, group] of this.competitorGroups) {
      const filename = `${groupId}.json`;
      const filepath = path.join(outputDir, filename);

      await fs.writeFile(
        filepath,
        JSON.stringify(group, null, 2),
        'utf-8'
      );
    }

    return Array.from(this.competitorGroups.keys());
  }

  /**
   * Calculate similarity score between two games
   * @param {Object} game1 - First game classification
   * @param {Object} game2 - Second game classification
   */
  calculateSimilarity(class1, class2) {
    let score = 0;
    let maxScore = 0;

    // Genre match (high weight)
    maxScore += 30;
    if (class1.genre === class2.genre) score += 30;

    // Sub-genre match
    maxScore += 25;
    if (class1.subGenre && class1.subGenre === class2.subGenre) score += 25;

    // Theme match
    maxScore += 20;
    if (class1.theme && class1.theme === class2.theme) score += 20;

    // Template match
    maxScore += 15;
    if (class1.template && class1.template === class2.template) score += 15;

    // Core loop match
    maxScore += 10;
    if (class1.coreLoop && class1.coreLoop === class2.coreLoop) score += 10;

    return (score / maxScore) * 100;
  }

  /**
   * Find similar games to a reference game
   * @param {Object} referenceGame - The game to find similar games for
   * @param {Object[]} candidates - Pool of candidate games
   * @param {number} threshold - Minimum similarity score (0-100)
   */
  findSimilarGames(referenceGame, candidates, threshold = 50) {
    const refClassification = this.classifyGame(referenceGame);

    return candidates
      .map(game => {
        const classification = this.classifyGame(game);
        const similarity = this.calculateSimilarity(refClassification, classification);
        return { game, classification, similarity };
      })
      .filter(result => result.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity);
  }
}

export default CompetitorClassifier;

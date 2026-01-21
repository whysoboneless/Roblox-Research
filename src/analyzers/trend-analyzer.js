/**
 * Trend Analyzer
 * Identifies successful game patterns for reverse engineering
 * (Analogous to Video Series analysis in digital media)
 */

class TrendAnalyzer {
  constructor() {
    // Known successful game patterns (seed data)
    this.knownPatterns = new Map();
    this._initializeKnownPatterns();
  }

  /**
   * Initialize with known successful patterns
   */
  _initializeKnownPatterns() {
    const patterns = [
      {
        patternId: 'anime-tower-defense',
        patternName: 'Anime Tower Defense',
        patternClassification: {
          template: 'Anime + Tower Defense',
          mechanic: 'Place anime characters as towers → Upgrade → Unlock new characters',
          variation: 'Popular anime IP (Naruto, Dragon Ball, One Piece, etc.)'
        },
        successMetrics: {
          retentionDrivers: ['Character collection', 'Story mode progression', 'Multiplayer raids'],
          monetizationHooks: ['Gacha/summon system', 'VIP gamepass', 'Special event characters'],
          viralMechanics: ['Trading', 'Tier lists', 'PvP rankings']
        },
        exampleGames: ['Anime Adventures', 'All Star Tower Defense', 'Anime Defenders']
      },
      {
        patternId: 'pet-simulator',
        patternName: 'Pet Simulator',
        patternClassification: {
          template: 'X Simulator + Pet Collection',
          mechanic: 'Click/tap to collect → Pets multiply earnings → Rebirth for permanence',
          variation: 'Theme variations (space, fantasy, realistic)'
        },
        successMetrics: {
          retentionDrivers: ['Pet collection', 'Trading economy', 'Limited-time pets'],
          monetizationHooks: ['Huge/exclusive pets', 'Auto-collect gamepass', 'Extra storage'],
          viralMechanics: ['Pet values/trading', 'Giveaways', 'Egg countdowns']
        },
        exampleGames: ['Pet Simulator X', 'Pet Simulator 99', 'Adopt Me!']
      },
      {
        patternId: 'horror-multiplayer',
        patternName: 'Horror Multiplayer',
        patternClassification: {
          template: 'Horror + Asymmetric Multiplayer',
          mechanic: 'One player hunts, others survive/escape → Round-based → Role switching',
          variation: 'Different horror themes (clown, monster, paranormal)'
        },
        successMetrics: {
          retentionDrivers: ['Multiple maps', 'Role variety', 'Jump scares'],
          monetizationHooks: ['Monster skins', 'Emotes', 'Flashlight upgrades'],
          viralMechanics: ['Streaming-friendly', 'Group play', 'Social deduction']
        },
        exampleGames: ['Doors', 'Apeirophobia', 'Pressure']
      },
      {
        patternId: 'incremental-tycoon',
        patternName: 'Incremental Tycoon',
        patternClassification: {
          template: 'Tycoon + Automation + Incremental',
          mechanic: 'Build droppers → Collect money → Upgrade → Automate → Prestige',
          variation: 'Theme (factory, food, mining, military)'
        },
        successMetrics: {
          retentionDrivers: ['Automation goals', 'Prestige rewards', 'Competitive leaderboards'],
          monetizationHooks: ['2x money gamepass', 'Auto-rebirth', 'Premium machines'],
          viralMechanics: ['Showcase builds', 'Speedrun challenges', 'Collaborative features']
        },
        exampleGames: ['Arm Wrestle Simulator', 'Strongman Simulator', 'Mining Simulator 2']
      },
      {
        patternId: 'roleplay-life-sim',
        patternName: 'Roleplay Life Sim',
        patternClassification: {
          template: 'Life Simulation + Social Roleplay',
          mechanic: 'Pick role/house → Customize → Social interaction → Create stories',
          variation: 'Setting (modern city, historical, fantasy)'
        },
        successMetrics: {
          retentionDrivers: ['House customization', 'Vehicle collection', 'Social features'],
          monetizationHooks: ['Premium houses', 'Exclusive vehicles', 'Special roles'],
          viralMechanics: ['UGC content', 'Roleplay stories shared', 'Friend groups']
        },
        exampleGames: ['Brookhaven RP', 'Bloxburg', 'Livetopia']
      }
    ];

    for (const pattern of patterns) {
      this.knownPatterns.set(pattern.patternId, pattern);
    }
  }

  /**
   * Analyze a game and identify its pattern
   * @param {Object} game - Game data with name and description
   */
  identifyPattern(game) {
    const text = `${game.name} ${game.description || ''}`.toLowerCase();
    const matches = [];

    for (const [patternId, pattern] of this.knownPatterns) {
      let score = 0;

      // Check template keywords
      const templateKeywords = pattern.patternClassification.template.toLowerCase().split(/\s+/);
      for (const keyword of templateKeywords) {
        if (keyword.length > 2 && text.includes(keyword)) {
          score += 10;
        }
      }

      // Check mechanic keywords
      const mechanicKeywords = pattern.patternClassification.mechanic.toLowerCase().split(/\s+/);
      for (const keyword of mechanicKeywords) {
        if (keyword.length > 3 && text.includes(keyword)) {
          score += 5;
        }
      }

      // Check example game name similarity
      for (const example of pattern.exampleGames || []) {
        if (text.includes(example.toLowerCase())) {
          score += 20;
        }
      }

      if (score > 0) {
        matches.push({ patternId, pattern, score });
      }
    }

    return matches.sort((a, b) => b.score - a.score);
  }

  /**
   * Analyze a competitor group to identify the dominant pattern
   * @param {Object} group - Competitor group with games
   */
  analyzeGroupPattern(group) {
    const patternScores = new Map();

    for (const game of group.competitors || []) {
      const matches = this.identifyPattern(game);
      for (const match of matches) {
        const current = patternScores.get(match.patternId) || { pattern: match.pattern, totalScore: 0, gameCount: 0 };
        current.totalScore += match.score;
        current.gameCount += 1;
        patternScores.set(match.patternId, current);
      }
    }

    // Sort by total score
    const sorted = Array.from(patternScores.entries())
      .map(([patternId, data]) => ({
        patternId,
        ...data,
        avgScore: data.totalScore / data.gameCount
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    return {
      groupId: group.groupId,
      dominantPattern: sorted[0] || null,
      allPatterns: sorted,
      analysis: this._generatePatternAnalysis(sorted[0]?.pattern)
    };
  }

  /**
   * Generate analysis and recommendations for a pattern
   */
  _generatePatternAnalysis(pattern) {
    if (!pattern) {
      return {
        recommendations: ['Pattern not identified - manual analysis needed'],
        differentiators: [],
        risks: []
      };
    }

    return {
      template: pattern.patternClassification.template,
      mechanic: pattern.patternClassification.mechanic,
      variation: pattern.patternClassification.variation,
      retentionDrivers: pattern.successMetrics?.retentionDrivers || [],
      monetizationHooks: pattern.successMetrics?.monetizationHooks || [],
      viralMechanics: pattern.successMetrics?.viralMechanics || [],
      recommendations: [
        `Study the core loop: ${pattern.patternClassification.mechanic}`,
        `Key retention elements: ${(pattern.successMetrics?.retentionDrivers || []).join(', ')}`,
        `Monetization focus: ${(pattern.successMetrics?.monetizationHooks || []).join(', ')}`
      ]
    };
  }

  /**
   * Identify trending patterns by analyzing multiple groups
   * @param {Object[]} groups - Array of competitor groups
   */
  identifyTrendingPatterns(groups) {
    const patternTrends = new Map();

    for (const group of groups) {
      const analysis = this.analyzeGroupPattern(group);
      if (analysis.dominantPattern) {
        const patternId = analysis.dominantPattern.patternId;
        const current = patternTrends.get(patternId) || {
          pattern: analysis.dominantPattern.pattern,
          groups: [],
          totalGames: 0
        };
        current.groups.push(group.groupId);
        current.totalGames += analysis.dominantPattern.gameCount;
        patternTrends.set(patternId, current);
      }
    }

    return Array.from(patternTrends.entries())
      .map(([patternId, data]) => ({
        patternId,
        patternName: data.pattern.patternName,
        groupCount: data.groups.length,
        totalGames: data.totalGames,
        groups: data.groups
      }))
      .sort((a, b) => b.totalGames - a.totalGames);
  }

  /**
   * Generate a reverse engineering guide for a pattern
   */
  generateReverseEngineeringGuide(patternId) {
    const pattern = this.knownPatterns.get(patternId);
    if (!pattern) {
      return null;
    }

    return {
      patternId,
      patternName: pattern.patternName,
      guide: {
        coreLoop: {
          description: pattern.patternClassification.mechanic,
          steps: pattern.patternClassification.mechanic.split('→').map(s => s.trim())
        },
        essentialFeatures: [
          ...pattern.successMetrics.retentionDrivers,
          ...pattern.successMetrics.monetizationHooks
        ],
        differentiationOpportunities: [
          `Apply new theme/IP: ${pattern.patternClassification.variation}`,
          'Improve UI/UX over existing games',
          'Add unique social features',
          'Introduce novel progression mechanic'
        ],
        commonMistakes: [
          'Copying without understanding core loop',
          'Weak early game hook',
          'Poor mobile optimization',
          'Unclear monetization value prop'
        ],
        exampleGamesToStudy: pattern.exampleGames
      }
    };
  }

  /**
   * Add a new pattern to the knowledge base
   */
  addPattern(pattern) {
    if (!pattern.patternId || !pattern.patternName) {
      throw new Error('Pattern must have patternId and patternName');
    }
    this.knownPatterns.set(pattern.patternId, pattern);
  }
}

export default TrendAnalyzer;

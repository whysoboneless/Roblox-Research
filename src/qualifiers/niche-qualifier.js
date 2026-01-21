/**
 * Niche Qualifier
 * Implements the qualification flowchart logic for evaluating competitor groups
 */

import { differenceInMonths, parseISO } from 'date-fns';

// Default qualification criteria (matching the Nicole methodology)
const DEFAULT_CRITERIA = {
  minMonthlyRevenue: 10000, // $10k/month minimum
  maxAgeMonths: 6, // Games started in last 6 months
  minRecentSuccesses: 2, // At least 2-3 recent successful competitors
  qualityBeatThreshold: 20, // Can beat quality by 20%
  minLikeRatio: 70, // Minimum 70% like ratio for "successful"
  minConcurrentPlayers: 100, // Minimum avg CCU for consideration
};

// Revenue estimation based on CCU (rough industry estimates)
const REVENUE_ESTIMATION = {
  // Revenue per concurrent player per month (varies widely)
  lowEnd: 0.5, // Conservative estimate
  midRange: 2.0, // Average for monetized games
  highEnd: 5.0, // Well-monetized games
};

class NicheQualifier {
  constructor(criteria = {}) {
    this.criteria = { ...DEFAULT_CRITERIA, ...criteria };
  }

  /**
   * Estimate monthly revenue from game metrics
   * This is a rough estimate - actual revenue varies significantly
   */
  estimateMonthlyRevenue(game) {
    const avgCCU = game.metrics?.currentPlayers || 0;
    const likeRatio = game.metrics?.likeRatio || 50;

    // Higher like ratio = better monetization potential
    const monetizationFactor = likeRatio > 85 ? 'highEnd' :
      likeRatio > 70 ? 'midRange' : 'lowEnd';

    const revenuePerPlayer = REVENUE_ESTIMATION[monetizationFactor];

    // Monthly estimate = CCU * revenue per player * hours factor
    // Assuming ~720 hours in a month, but not all players are concurrent
    return Math.round(avgCCU * revenuePerPlayer * 30);
  }

  /**
   * Check if a game was created recently (within maxAgeMonths)
   */
  isRecentGame(game, maxMonths = this.criteria.maxAgeMonths) {
    if (!game.dates?.created) return false;

    const createdDate = parseISO(game.dates.created);
    const monthsAgo = differenceInMonths(new Date(), createdDate);

    return monthsAgo <= maxMonths;
  }

  /**
   * Check if a game is "successful" based on metrics
   */
  isSuccessfulGame(game) {
    const revenue = this.estimateMonthlyRevenue(game);
    const likeRatio = parseFloat(game.metrics?.likeRatio) || 0;
    const ccu = game.metrics?.currentPlayers || 0;

    return (
      revenue >= this.criteria.minMonthlyRevenue &&
      likeRatio >= this.criteria.minLikeRatio &&
      ccu >= this.criteria.minConcurrentPlayers
    );
  }

  /**
   * Evaluate a competitor group through the qualification flowchart
   * @param {Object} group - Competitor group with games
   * @returns {Object} Qualification result with reasoning
   */
  qualifyCompetitorGroup(group) {
    const result = {
      groupId: group.groupId,
      groupName: group.groupName,
      qualified: false,
      score: 0,
      checks: [],
      reasoning: [],
      recommendations: []
    };

    const games = group.competitors || [];

    if (games.length === 0) {
      result.reasoning.push('No games in group to evaluate');
      return result;
    }

    // Step 1: Find games making $10k+/month
    const profitableGames = games.filter(g => {
      const revenue = this.estimateMonthlyRevenue(g);
      return revenue >= this.criteria.minMonthlyRevenue;
    });

    result.checks.push({
      step: 'Revenue Check',
      passed: profitableGames.length > 0,
      detail: `${profitableGames.length}/${games.length} games estimated at $${this.criteria.minMonthlyRevenue}+/month`
    });

    if (profitableGames.length === 0) {
      // Check for cross-platform success or one-offs (manual check needed)
      result.reasoning.push('No games in group meet revenue threshold');
      result.recommendations.push('Check if this game pattern has succeeded on TikTok, YouTube, or as one-off viral games');
      return result;
    }

    result.score += 25;

    // Step 2: Check for recent games started in last 6 months
    const recentGames = games.filter(g => this.isRecentGame(g));

    result.checks.push({
      step: 'Recency Check',
      passed: recentGames.length > 0,
      detail: `${recentGames.length}/${games.length} games created in last ${this.criteria.maxAgeMonths} months`
    });

    // Step 3: Are there 2-3 recent successful games?
    const recentSuccesses = recentGames.filter(g => this.isSuccessfulGame(g));

    result.checks.push({
      step: 'Recent Success Check',
      passed: recentSuccesses.length >= this.criteria.minRecentSuccesses,
      detail: `${recentSuccesses.length} recent games are successful (need ${this.criteria.minRecentSuccesses}+)`
    });

    if (recentSuccesses.length >= this.criteria.minRecentSuccesses) {
      result.score += 35;
      result.reasoning.push(`Found ${recentSuccesses.length} emerging stars in this niche`);
    } else if (recentGames.length > 0) {
      result.score += 15;
      result.reasoning.push('Some recent activity but limited proven success');
    } else {
      result.reasoning.push('No recent games - this is an established niche');
      result.recommendations.push('Look for ways to innovate on the format');
    }

    // Step 4: Quality assessment (requires manual scoring)
    const avgQualityScore = games.reduce((sum, g) => sum + (g.qualityScore || 5), 0) / games.length;

    result.checks.push({
      step: 'Quality Assessment',
      passed: true, // Placeholder - needs manual evaluation
      detail: `Average quality score: ${avgQualityScore.toFixed(1)}/10 (manual review needed)`
    });

    result.recommendations.push(`To qualify: Can you beat current quality (${avgQualityScore.toFixed(1)}/10) by 20%?`);
    result.score += 10;

    // Calculate final qualification
    if (result.score >= 60 && recentSuccesses.length >= this.criteria.minRecentSuccesses) {
      result.qualified = true;
      result.reasoning.push('✓ Group meets qualification criteria');
    } else if (result.score >= 40) {
      result.reasoning.push('⚠ Borderline qualification - manual review recommended');
    } else {
      result.reasoning.push('✗ Not a good niche - keep searching');
    }

    // Add emerging stars to result
    result.emergingStars = recentSuccesses.map(g => ({
      name: g.name,
      placeId: g.placeId,
      estimatedRevenue: this.estimateMonthlyRevenue(g),
      created: g.dates?.created,
      metrics: g.metrics
    }));

    return result;
  }

  /**
   * Compare multiple competitor groups and rank them
   * @param {Object[]} groups - Array of competitor groups
   */
  rankCompetitorGroups(groups) {
    const evaluated = groups.map(group => this.qualifyCompetitorGroup(group));

    return evaluated
      .sort((a, b) => {
        // Sort by: qualified first, then by score
        if (a.qualified !== b.qualified) {
          return b.qualified ? 1 : -1;
        }
        return b.score - a.score;
      })
      .map((result, index) => ({
        ...result,
        rank: index + 1
      }));
  }

  /**
   * Generate a qualification report for a group
   */
  generateReport(qualificationResult) {
    const lines = [
      `# Competitor Group Qualification Report`,
      `## ${qualificationResult.groupName}`,
      ``,
      `**Status:** ${qualificationResult.qualified ? '✓ QUALIFIED' : '✗ NOT QUALIFIED'}`,
      `**Score:** ${qualificationResult.score}/100`,
      ``,
      `### Qualification Checks`,
      ``
    ];

    for (const check of qualificationResult.checks) {
      const icon = check.passed ? '✓' : '✗';
      lines.push(`- ${icon} **${check.step}**: ${check.detail}`);
    }

    lines.push('', '### Analysis', '');
    for (const reason of qualificationResult.reasoning) {
      lines.push(`- ${reason}`);
    }

    if (qualificationResult.recommendations.length > 0) {
      lines.push('', '### Recommendations', '');
      for (const rec of qualificationResult.recommendations) {
        lines.push(`- ${rec}`);
      }
    }

    if (qualificationResult.emergingStars?.length > 0) {
      lines.push('', '### Emerging Stars', '');
      for (const star of qualificationResult.emergingStars) {
        lines.push(`- **${star.name}** - Est. $${star.estimatedRevenue?.toLocaleString()}/mo - ${star.metrics?.currentPlayers || 0} CCU`);
      }
    }

    return lines.join('\n');
  }
}

export default NicheQualifier;

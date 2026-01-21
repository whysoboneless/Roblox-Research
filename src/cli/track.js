#!/usr/bin/env node
/**
 * CLI: Track/collect fresh metrics for all games in database
 * Usage: npm run track
 *
 * Run this on a schedule (cron, Task Scheduler) to build historical data
 */

import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { testConnection } from '../db/supabase.js';
import { getGames, saveMetrics, getGameByPlaceId, saveGame } from '../db/models.js';
import RobloxAPI from '../collectors/roblox-api.js';
import NicheQualifier from '../qualifiers/niche-qualifier.js';

program
  .name('track')
  .description('Collect fresh metrics for all tracked games')
  .option('-l, --limit <number>', 'Max games to update (for testing)', '0')
  .option('-g, --genre <genre>', 'Only track games in this genre')
  .option('--add <placeIds>', 'Add new games to track (comma-separated Place IDs)')
  .option('-v, --verbose', 'Show detailed progress')
  .parse();

const options = program.opts();

async function main() {
  console.log(chalk.bold.cyan('\n📊 Roblox Game Metrics Tracker\n'));

  // Test connection
  const connSpinner = ora('Connecting to database...').start();
  const connResult = await testConnection();

  if (!connResult.connected || !connResult.tablesExist) {
    connSpinner.fail('Database not ready');
    console.log(chalk.red('Run: npm run sync -- --test'));
    process.exit(1);
  }
  connSpinner.succeed('Connected to database');

  const api = new RobloxAPI({ rateLimitDelay: 150 });
  const qualifier = new NicheQualifier();

  // Add new games if specified
  if (options.add) {
    const newPlaceIds = options.add.split(',').map(id => id.trim()).filter(Boolean);

    if (newPlaceIds.length > 0) {
      console.log(chalk.bold.white(`\nAdding ${newPlaceIds.length} new game(s) to tracking...\n`));

      for (const placeId of newPlaceIds) {
        const addSpinner = ora(`Adding ${placeId}...`).start();

        try {
          // Check if already tracked
          const existing = await getGameByPlaceId(placeId);
          if (existing) {
            addSpinner.info(`${placeId} already tracked (${existing.name})`);
            continue;
          }

          // Fetch from Roblox API
          const [gameData] = await api.collectFullGameData([placeId]);

          if (gameData.error) {
            addSpinner.fail(`${placeId}: ${gameData.error}`);
            continue;
          }

          // Save to database
          await saveGame(gameData);
          addSpinner.succeed(`Added: ${chalk.cyan(gameData.name)}`);

        } catch (error) {
          addSpinner.fail(`${placeId}: ${error.message}`);
        }
      }

      console.log('');
    }
  }

  // Get all games to track
  const gamesSpinner = ora('Loading tracked games...').start();

  try {
    const filters = {};
    if (options.genre) {
      filters.genre = options.genre;
    }

    let games = await getGames(filters);

    if (games.length === 0) {
      gamesSpinner.warn('No games in database');
      console.log(chalk.yellow('\nAdd games with: npm run track -- --add "placeId1,placeId2"'));
      console.log(chalk.gray('Or sync from local files: npm run sync\n'));
      return;
    }

    // Apply limit if specified
    const limit = parseInt(options.limit);
    if (limit > 0 && games.length > limit) {
      games = games.slice(0, limit);
      gamesSpinner.succeed(`Tracking ${games.length} games (limited from ${games.length})`);
    } else {
      gamesSpinner.succeed(`Found ${games.length} game(s) to track`);
    }

    // Track metrics
    console.log(chalk.bold.white('\n═══════════════════════════════════════'));
    console.log(chalk.bold.cyan('         Collecting Fresh Metrics'));
    console.log(chalk.bold.white('═══════════════════════════════════════\n'));

    let successCount = 0;
    let errorCount = 0;
    const startTime = Date.now();

    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      const progress = `[${i + 1}/${games.length}]`;

      const trackSpinner = ora(`${progress} ${game.name}...`).start();

      try {
        // Fetch fresh data from Roblox
        const [freshData] = await api.collectFullGameData([game.place_id.toString()]);

        if (freshData.error) {
          trackSpinner.fail(`${progress} ${game.name}: ${freshData.error}`);
          errorCount++;
          continue;
        }

        // Estimate revenue
        const estimatedRevenue = qualifier.estimateMonthlyRevenue({
          metrics: freshData.metrics
        });

        // Save metrics snapshot
        await saveMetrics(game.id, {
          ...freshData.metrics,
          estimatedRevenue
        });

        if (options.verbose) {
          trackSpinner.succeed(
            `${progress} ${chalk.cyan(game.name)} - ${freshData.metrics.currentPlayers.toLocaleString()} CCU, $${estimatedRevenue.toLocaleString()}/mo`
          );
        } else {
          trackSpinner.succeed(`${progress} ${game.name}`);
        }

        successCount++;

      } catch (error) {
        trackSpinner.fail(`${progress} ${game.name}: ${error.message}`);
        errorCount++;
      }
    }

    // Summary
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(chalk.bold.white('\n═══════════════════════════════════════'));
    console.log(chalk.bold.cyan('              Summary'));
    console.log(chalk.bold.white('═══════════════════════════════════════\n'));

    console.log(`  Games tracked:  ${chalk.green(successCount)}`);
    console.log(`  Errors:         ${errorCount > 0 ? chalk.red(errorCount) : chalk.gray('0')}`);
    console.log(`  Time elapsed:   ${chalk.gray(elapsed + 's')}`);
    console.log(`  Timestamp:      ${chalk.gray(new Date().toISOString())}`);

    console.log(chalk.bold.green('\n✓ Tracking complete!\n'));

    // Tip for scheduling
    if (successCount > 0) {
      console.log(chalk.gray('💡 Tip: Run this command daily to build historical data'));
      console.log(chalk.gray('   Windows: Task Scheduler → Create Basic Task'));
      console.log(chalk.gray('   Linux/Mac: crontab -e → 0 */6 * * * cd /path && npm run track\n'));
    }

  } catch (error) {
    gamesSpinner.fail('Tracking failed');
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}

main().catch(console.error);

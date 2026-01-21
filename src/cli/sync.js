#!/usr/bin/env node
/**
 * CLI: Sync local JSON data to Supabase
 * Usage: npm run sync -- --groups "data/groups/*.json"
 */

import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { testConnection } from '../db/supabase.js';
import { importCompetitorGroup, savePattern } from '../db/models.js';
import TrendAnalyzer from '../analyzers/trend-analyzer.js';

program
  .name('sync')
  .description('Sync local research data to Supabase database')
  .option('-g, --groups <pattern>', 'Glob pattern for competitor group JSON files', 'data/groups/*.json')
  .option('-p, --patterns', 'Also sync known game patterns')
  .option('-t, --test', 'Test connection only')
  .option('--dry-run', 'Show what would be synced without actually syncing')
  .parse();

const options = program.opts();

async function main() {
  console.log(chalk.bold.cyan('\n🔄 Roblox Research Data Sync\n'));

  // Test connection first
  const connSpinner = ora('Testing database connection...').start();
  const connResult = await testConnection();

  if (!connResult.connected) {
    connSpinner.fail('Database connection failed');
    console.log(chalk.red(`Error: ${connResult.error}`));
    console.log(chalk.gray('\nMake sure your .env file has SUPABASE_URL and SUPABASE_ANON_KEY'));
    process.exit(1);
  }

  if (!connResult.tablesExist) {
    connSpinner.warn('Connected but tables not found');
    console.log(chalk.yellow('\nRun the migration SQL first:'));
    console.log(chalk.gray('  1. Go to Supabase SQL Editor'));
    console.log(chalk.gray('  2. Paste contents of src/db/migrations/001_initial_schema.sql'));
    console.log(chalk.gray('  3. Click "Run"'));
    process.exit(1);
  }

  connSpinner.succeed('Database connected');

  if (options.test) {
    console.log(chalk.green('\n✓ Connection test passed\n'));
    return;
  }

  // Find group files
  const filesSpinner = ora('Finding local data files...').start();

  try {
    const groupFiles = await glob(options.groups);
    filesSpinner.succeed(`Found ${groupFiles.length} competitor group file(s)`);

    if (groupFiles.length === 0) {
      console.log(chalk.yellow('\nNo group files found matching pattern:'), options.groups);
      console.log(chalk.gray('Create groups first with: npm run analyze -- --games "id1,id2" -o data/groups/my-group.json\n'));

      if (!options.patterns) {
        return;
      }
    }

    // Dry run mode
    if (options.dryRun) {
      console.log(chalk.bold.yellow('\n📋 Dry Run - Would sync:'));

      for (const file of groupFiles) {
        const content = await fs.readFile(file, 'utf-8');
        const group = JSON.parse(content);
        const gameCount = group.competitors?.length || 0;
        console.log(`  • ${chalk.cyan(group.groupName)} (${gameCount} games) - ${path.basename(file)}`);
      }

      if (options.patterns) {
        const trendAnalyzer = new TrendAnalyzer();
        console.log(`  • ${chalk.magenta(trendAnalyzer.knownPatterns.size)} known game patterns`);
      }

      console.log(chalk.gray('\nRemove --dry-run to actually sync\n'));
      return;
    }

    // Sync competitor groups
    console.log(chalk.bold.white('\n═══════════════════════════════════════'));
    console.log(chalk.bold.cyan('         Syncing Competitor Groups'));
    console.log(chalk.bold.white('═══════════════════════════════════════\n'));

    let successCount = 0;
    let errorCount = 0;

    for (const file of groupFiles) {
      const filename = path.basename(file);
      const syncSpinner = ora(`Syncing ${filename}...`).start();

      try {
        const content = await fs.readFile(file, 'utf-8');
        const groupData = JSON.parse(content);

        const result = await importCompetitorGroup(groupData);

        syncSpinner.succeed(
          `${chalk.cyan(groupData.groupName)} - ${result.games.length} games synced`
        );
        successCount++;

      } catch (error) {
        syncSpinner.fail(`${filename}: ${error.message}`);
        errorCount++;
      }
    }

    // Summary for groups
    if (groupFiles.length > 0) {
      console.log(chalk.gray('\n───────────────────────────────────────'));
      console.log(`Groups synced: ${chalk.green(successCount)} success, ${errorCount > 0 ? chalk.red(errorCount) : '0'} failed`);
    }

    // Sync patterns if requested
    if (options.patterns) {
      console.log(chalk.bold.white('\n═══════════════════════════════════════'));
      console.log(chalk.bold.cyan('          Syncing Game Patterns'));
      console.log(chalk.bold.white('═══════════════════════════════════════\n'));

      const trendAnalyzer = new TrendAnalyzer();
      let patternSuccess = 0;
      let patternError = 0;

      for (const [patternId, pattern] of trendAnalyzer.knownPatterns) {
        const patternSpinner = ora(`Syncing pattern: ${pattern.patternName}...`).start();

        try {
          await savePattern(pattern);
          patternSpinner.succeed(chalk.magenta(pattern.patternName));
          patternSuccess++;
        } catch (error) {
          patternSpinner.fail(`${pattern.patternName}: ${error.message}`);
          patternError++;
        }
      }

      console.log(chalk.gray('\n───────────────────────────────────────'));
      console.log(`Patterns synced: ${chalk.green(patternSuccess)} success, ${patternError > 0 ? chalk.red(patternError) : '0'} failed`);
    }

    // Final summary
    console.log(chalk.bold.green('\n✓ Sync complete!\n'));
    console.log(chalk.gray('View your data in the Supabase dashboard:'));
    console.log(chalk.gray('  → Table Editor → games, game_metrics, competitor_groups\n'));

  } catch (error) {
    filesSpinner.fail('Sync failed');
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}

main().catch(console.error);

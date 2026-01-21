#!/usr/bin/env node
/**
 * CLI: Analyze competitor group
 * Usage: node analyze.js --games "123456,789012" --name "Anime Simulators"
 */

import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import RobloxResearchTool from '../index.js';

program
  .name('analyze')
  .description('Analyze a competitor group from a list of game IDs')
  .option('-g, --games <ids>', 'Comma-separated list of Place IDs', '')
  .option('-n, --name <name>', 'Name for this competitor group', 'Unnamed Group')
  .option('-o, --output <file>', 'Output file for report (JSON)')
  .parse();

const options = program.opts();

async function main() {
  if (!options.games) {
    console.log(chalk.red('Error: Please provide game IDs with --games'));
    console.log(chalk.gray('Example: node analyze.js --games "123456,789012,345678"'));
    process.exit(1);
  }

  const placeIds = options.games.split(',').map(id => id.trim()).filter(Boolean);

  if (placeIds.length === 0) {
    console.log(chalk.red('Error: No valid game IDs provided'));
    process.exit(1);
  }

  console.log(chalk.bold.cyan('\n📊 Roblox Competitor Group Analysis\n'));
  console.log(chalk.gray(`Analyzing ${placeIds.length} games...`));

  const tool = new RobloxResearchTool();
  const spinner = ora('Collecting game data...').start();

  try {
    const result = await tool.analyzeCompetitorGroup(placeIds);

    spinner.succeed('Analysis complete!');

    // Display Group Info
    console.log(chalk.bold.white('\n═══════════════════════════════════════'));
    console.log(chalk.bold.cyan(`   ${result.group.groupName}`));
    console.log(chalk.bold.white('═══════════════════════════════════════\n'));

    // Qualification Status
    const qualStatus = result.qualification.qualified
      ? chalk.bold.green('✓ QUALIFIED')
      : chalk.bold.red('✗ NOT QUALIFIED');

    console.log(`Status: ${qualStatus}`);
    console.log(`Score: ${chalk.yellow(result.qualification.score)}/100\n`);

    // Structural Characteristics
    console.log(chalk.bold.white('Structural Characteristics:'));
    const chars = result.group.structuralCharacteristics;
    console.log(`  Genre:     ${chalk.cyan(chars.genre || 'Unknown')}`);
    console.log(`  Sub-Genre: ${chalk.cyan(chars.subGenre || 'Unknown')}`);
    console.log(`  Theme:     ${chalk.cyan(chars.theme || 'Unknown')}`);
    console.log(`  Core Loop: ${chalk.cyan(chars.coreLoop || 'Unknown')}`);
    console.log(`  Template:  ${chalk.cyan(chars.template || 'Unknown')}`);

    // Qualification Checks
    console.log(chalk.bold.white('\nQualification Checks:'));
    for (const check of result.qualification.checks) {
      const icon = check.passed ? chalk.green('✓') : chalk.red('✗');
      console.log(`  ${icon} ${check.step}: ${chalk.gray(check.detail)}`);
    }

    // Competitors Table
    console.log(chalk.bold.white('\nCompetitors:'));
    const table = new Table({
      head: ['Name', 'CCU', 'Visits', 'Like %', 'Est. Rev/mo', 'Created'],
      style: { head: ['cyan'] }
    });

    for (const game of result.group.competitors) {
      const metrics = game.metrics || {};
      const revenue = tool.qualifier.estimateMonthlyRevenue(game);
      const created = game.dates?.created
        ? new Date(game.dates.created).toLocaleDateString()
        : 'Unknown';

      table.push([
        game.name?.substring(0, 30) || 'Unknown',
        (metrics.currentPlayers || 0).toLocaleString(),
        (metrics.visits || 0).toLocaleString(),
        metrics.likeRatio ? `${metrics.likeRatio}%` : 'N/A',
        `$${revenue.toLocaleString()}`,
        created
      ]);
    }
    console.log(table.toString());

    // Emerging Stars
    if (result.qualification.emergingStars?.length > 0) {
      console.log(chalk.bold.green('\n⭐ Emerging Stars:'));
      for (const star of result.qualification.emergingStars) {
        console.log(`  • ${chalk.bold(star.name)} - $${star.estimatedRevenue?.toLocaleString()}/mo`);
      }
    }

    // Pattern Analysis
    if (result.patternAnalysis?.dominantPattern) {
      console.log(chalk.bold.white('\nDominant Pattern:'));
      const pattern = result.patternAnalysis.dominantPattern.pattern;
      console.log(`  ${chalk.magenta(pattern.patternName)}`);
      console.log(chalk.gray(`  Template: ${pattern.patternClassification.template}`));
      console.log(chalk.gray(`  Mechanic: ${pattern.patternClassification.mechanic}`));
    }

    // Recommendations
    if (result.qualification.recommendations?.length > 0) {
      console.log(chalk.bold.yellow('\n💡 Recommendations:'));
      for (const rec of result.qualification.recommendations) {
        console.log(`  • ${rec}`);
      }
    }

    // Save report if output specified
    if (options.output) {
      const fs = await import('fs/promises');
      await fs.writeFile(options.output, JSON.stringify(result, null, 2));
      console.log(chalk.green(`\n✓ Report saved to ${options.output}`));
    }

    console.log(chalk.gray('\n───────────────────────────────────────\n'));

  } catch (error) {
    spinner.fail('Analysis failed');
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

main();

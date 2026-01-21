#!/usr/bin/env node
/**
 * CLI: Qualify and compare competitor groups
 * Usage: node qualify.js --groups "data/groups/*.json"
 */

import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import NicheQualifier from '../qualifiers/niche-qualifier.js';

program
  .name('qualify')
  .description('Qualify and compare competitor groups')
  .option('-g, --groups <pattern>', 'Glob pattern for group JSON files', 'data/groups/*.json')
  .option('-c, --criteria <json>', 'Custom qualification criteria (JSON)')
  .option('-o, --output <file>', 'Output comparison report')
  .parse();

const options = program.opts();

async function main() {
  console.log(chalk.bold.cyan('\n🎯 Roblox Niche Qualification\n'));

  // Parse custom criteria if provided
  let criteria = {};
  if (options.criteria) {
    try {
      criteria = JSON.parse(options.criteria);
    } catch (e) {
      console.log(chalk.yellow('Warning: Could not parse custom criteria, using defaults'));
    }
  }

  const qualifier = new NicheQualifier(criteria);

  // Find group files
  const spinner = ora('Loading competitor groups...').start();

  try {
    const files = await glob(options.groups);

    if (files.length === 0) {
      spinner.warn('No group files found');
      console.log(chalk.gray(`Looking for files matching: ${options.groups}`));
      console.log(chalk.gray('\nTo create a group, first run:'));
      console.log(chalk.white('  npm run discover -- --search "your niche"'));
      console.log(chalk.white('  npm run analyze -- --games "id1,id2,id3" -o data/groups/my-group.json'));
      return;
    }

    // Load all groups
    const groups = [];
    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const group = JSON.parse(content);
      group._sourceFile = path.basename(file);
      groups.push(group);
    }

    spinner.succeed(`Loaded ${groups.length} competitor groups`);

    // Qualify and rank
    console.log(chalk.gray('\nQualifying groups...\n'));

    const rankings = qualifier.rankCompetitorGroups(groups);

    // Display rankings table
    console.log(chalk.bold.white('═══════════════════════════════════════════════════════════════'));
    console.log(chalk.bold.cyan('                    COMPETITOR GROUP RANKINGS'));
    console.log(chalk.bold.white('═══════════════════════════════════════════════════════════════\n'));

    const table = new Table({
      head: ['Rank', 'Status', 'Group Name', 'Score', 'Games', 'Emerging Stars'],
      style: { head: ['cyan'] },
      colWidths: [6, 12, 30, 8, 8, 16]
    });

    for (const result of rankings) {
      const status = result.qualified
        ? chalk.green('QUALIFIED')
        : chalk.red('NOT QUAL');

      const starsCount = result.emergingStars?.length || 0;
      const stars = starsCount > 0 ? chalk.yellow(`⭐ ${starsCount}`) : chalk.gray('-');

      table.push([
        `#${result.rank}`,
        status,
        result.groupName.substring(0, 28),
        result.score,
        result.checks?.find(c => c.step === 'Revenue Check')?.detail?.match(/\d+/)?.[0] || '?',
        stars
      ]);
    }

    console.log(table.toString());

    // Detailed view of top groups
    const qualified = rankings.filter(r => r.qualified);
    if (qualified.length > 0) {
      console.log(chalk.bold.green(`\n✓ ${qualified.length} Qualified Group${qualified.length > 1 ? 's' : ''}\n`));

      for (const result of qualified.slice(0, 3)) {
        console.log(chalk.bold.white(`─── ${result.groupName} ───`));
        console.log(chalk.gray(`Score: ${result.score}/100`));

        // Checks
        for (const check of result.checks) {
          const icon = check.passed ? chalk.green('✓') : chalk.red('✗');
          console.log(`  ${icon} ${check.step}`);
        }

        // Emerging stars
        if (result.emergingStars?.length > 0) {
          console.log(chalk.yellow('\n  Emerging Stars:'));
          for (const star of result.emergingStars.slice(0, 3)) {
            console.log(`    • ${star.name} - $${star.estimatedRevenue?.toLocaleString()}/mo`);
          }
        }

        // Recommendations
        if (result.recommendations?.length > 0) {
          console.log(chalk.cyan('\n  Next Steps:'));
          for (const rec of result.recommendations.slice(0, 2)) {
            console.log(`    → ${rec}`);
          }
        }

        console.log('');
      }
    } else {
      console.log(chalk.yellow('\n⚠ No groups qualified. Consider:'));
      console.log('  • Looking for niches with more recent successful games');
      console.log('  • Adjusting qualification criteria');
      console.log('  • Exploring adjacent genres or themes');
    }

    // Summary
    console.log(chalk.bold.white('\n═══════════════════════════════════════════════════════════════'));
    console.log(chalk.bold.cyan('                         SUMMARY'));
    console.log(chalk.bold.white('═══════════════════════════════════════════════════════════════\n'));

    console.log(`  Groups Analyzed:  ${chalk.cyan(rankings.length)}`);
    console.log(`  Qualified:        ${chalk.green(qualified.length)}`);
    console.log(`  Not Qualified:    ${chalk.red(rankings.length - qualified.length)}`);

    if (qualified.length > 0) {
      console.log(`\n  ${chalk.bold('Best Opportunity:')} ${chalk.cyan(qualified[0].groupName)}`);
    }

    // Save report if requested
    if (options.output) {
      const report = {
        generatedAt: new Date().toISOString(),
        criteria: qualifier.criteria,
        rankings: rankings,
        summary: {
          totalGroups: rankings.length,
          qualified: qualified.length,
          topGroup: qualified[0]?.groupName || null
        }
      };

      await fs.writeFile(options.output, JSON.stringify(report, null, 2));
      console.log(chalk.green(`\n✓ Report saved to ${options.output}`));
    }

    console.log('');

  } catch (error) {
    spinner.fail('Qualification failed');
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

main();

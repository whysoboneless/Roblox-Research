#!/usr/bin/env node
/**
 * CLI: Discover games by genre/search
 * Usage: node discover.js --genre "Simulation" --search "anime simulator"
 */

import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import inquirer from 'inquirer';
import RobloxResearchTool from '../index.js';

program
  .name('discover')
  .description('Discover and explore Roblox games')
  .option('-g, --genre <genre>', 'Filter by genre')
  .option('-s, --search <terms>', 'Search terms (comma-separated)')
  .option('-l, --limit <number>', 'Max games to collect', '20')
  .option('-i, --interactive', 'Interactive mode')
  .parse();

const options = program.opts();

async function main() {
  console.log(chalk.bold.cyan('\n🔍 Roblox Game Discovery\n'));

  const tool = new RobloxResearchTool();

  // Interactive mode
  if (options.interactive) {
    await interactiveMode(tool);
    return;
  }

  // Command line mode
  const searchTerms = options.search
    ? options.search.split(',').map(s => s.trim())
    : [];

  if (searchTerms.length === 0 && !options.genre) {
    console.log(chalk.yellow('Tip: Use --search or --genre to filter games'));
    console.log(chalk.gray('Example: node discover.js --search "anime simulator, pet sim"'));
    console.log(chalk.gray('         node discover.js --genre "Simulation" --interactive\n'));

    // Show available genres
    const taxonomy = await tool.getGenreTaxonomy();
    console.log(chalk.bold('Available Genres:'));
    for (const genre of taxonomy.genres) {
      console.log(`  • ${chalk.cyan(genre.name)}`);
      if (genre.subGenres.length > 0) {
        console.log(chalk.gray(`    └─ ${genre.subGenres.join(', ')}`));
      }
    }
    return;
  }

  const spinner = ora('Searching for games...').start();

  try {
    const games = await tool.collectGames({
      seedGames: [],
      searchTerms,
      genre: options.genre,
      maxGames: parseInt(options.limit)
    });

    spinner.succeed(`Found ${games.length} games`);

    if (games.length === 0) {
      console.log(chalk.yellow('No games found. Try different search terms.'));
      return;
    }

    // Display results table
    const table = new Table({
      head: ['#', 'Name', 'Genre', 'CCU', 'Visits', 'Like %', 'Place ID'],
      style: { head: ['cyan'] },
      colWidths: [4, 35, 15, 10, 15, 8, 15]
    });

    games.forEach((game, i) => {
      const metrics = game.metrics || {};
      table.push([
        i + 1,
        (game.name || 'Unknown').substring(0, 32),
        (game.genre || 'Unknown').substring(0, 13),
        (metrics.currentPlayers || 0).toLocaleString(),
        (metrics.visits || 0).toLocaleString(),
        metrics.likeRatio ? `${metrics.likeRatio}%` : 'N/A',
        game.placeId || 'N/A'
      ]);
    });

    console.log(table.toString());

    // Show quick classification
    console.log(chalk.bold.white('\nQuick Classification:'));
    const { groups } = tool.classifier.classifyAndGroupGames(games);

    for (const [groupId, group] of Object.entries(groups)) {
      const count = group.competitors.length;
      console.log(`  ${chalk.cyan(group.groupName)}: ${count} game${count > 1 ? 's' : ''}`);
    }

    console.log(chalk.gray('\n───────────────────────────────────────'));
    console.log(chalk.gray('Use the Place IDs above with the analyze command:'));
    console.log(chalk.white(`  npm run analyze -- --games "${games.slice(0, 5).map(g => g.placeId).join(',')}"`));
    console.log('');

  } catch (error) {
    spinner.fail('Discovery failed');
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

async function interactiveMode(tool) {
  console.log(chalk.gray('Interactive discovery mode\n'));

  const taxonomy = await tool.getGenreTaxonomy();

  // Genre selection
  const { selectedGenre } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedGenre',
      message: 'Select a genre to explore:',
      choices: taxonomy.genres.map(g => ({
        name: `${g.name} ${g.subGenres.length > 0 ? chalk.gray(`(${g.subGenres.length} sub-genres)`) : ''}`,
        value: g
      }))
    }
  ]);

  // Sub-genre selection if available
  let subGenre = null;
  if (selectedGenre.subGenres.length > 0) {
    const { selectedSubGenre } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedSubGenre',
        message: 'Select a sub-genre:',
        choices: [
          { name: 'All sub-genres', value: null },
          ...selectedGenre.subGenres.map(sg => ({ name: sg, value: sg }))
        ]
      }
    ]);
    subGenre = selectedSubGenre;
  }

  // Search terms
  const { searchTerms } = await inquirer.prompt([
    {
      type: 'input',
      name: 'searchTerms',
      message: 'Additional search keywords (optional):',
      default: ''
    }
  ]);

  const terms = searchTerms
    ? searchTerms.split(',').map(s => s.trim())
    : [];

  // Add genre/subgenre to search if no explicit terms
  if (terms.length === 0) {
    if (subGenre) {
      terms.push(subGenre);
    } else {
      terms.push(selectedGenre.name);
    }
  }

  console.log('');
  const spinner = ora(`Searching for ${selectedGenre.name} games...`).start();

  try {
    const games = await tool.collectGames({
      seedGames: [],
      searchTerms: terms,
      genre: selectedGenre.id,
      maxGames: 20
    });

    spinner.succeed(`Found ${games.length} games`);

    if (games.length === 0) {
      console.log(chalk.yellow('No games found with these criteria.'));
      return;
    }

    // Display
    console.log(chalk.bold.cyan(`\n${selectedGenre.name}${subGenre ? ` > ${subGenre}` : ''} Games:\n`));

    games.forEach((game, i) => {
      const metrics = game.metrics || {};
      const ccu = (metrics.currentPlayers || 0).toLocaleString();
      const likes = metrics.likeRatio ? `${metrics.likeRatio}%` : 'N/A';

      console.log(`${chalk.cyan(i + 1)}. ${chalk.bold(game.name)}`);
      console.log(chalk.gray(`   CCU: ${ccu} | Likes: ${likes} | ID: ${game.placeId}`));
    });

    // Ask what to do next
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Analyze these as a competitor group', value: 'analyze' },
          { name: 'Search again', value: 'search' },
          { name: 'Exit', value: 'exit' }
        ]
      }
    ]);

    if (action === 'analyze') {
      const placeIds = games.map(g => g.placeId);
      console.log(chalk.gray('\nRun this command to analyze:'));
      console.log(chalk.white(`npm run analyze -- --games "${placeIds.join(',')}"`));
    } else if (action === 'search') {
      await interactiveMode(tool);
    }

  } catch (error) {
    spinner.fail('Search failed');
    console.error(chalk.red(`Error: ${error.message}`));
  }
}

main();

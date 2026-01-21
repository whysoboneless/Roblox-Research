#!/usr/bin/env node
/**
 * Test Supabase connection
 */

import chalk from 'chalk';
import { testConnection } from './supabase.js';

async function main() {
  console.log(chalk.cyan('\n🔌 Testing Supabase Connection...\n'));

  const result = await testConnection();

  if (result.connected) {
    console.log(chalk.green('✓ Connected to Supabase successfully!'));

    if (result.tablesExist) {
      console.log(chalk.green('✓ Database tables are set up'));
    } else {
      console.log(chalk.yellow('⚠ Tables not found'));
      console.log(chalk.gray('\nRun the migration SQL in your Supabase dashboard:'));
      console.log(chalk.white('  1. Go to your Supabase project'));
      console.log(chalk.white('  2. Navigate to SQL Editor'));
      console.log(chalk.white('  3. Paste contents of src/db/migrations/001_initial_schema.sql'));
      console.log(chalk.white('  4. Click "Run"\n'));
    }
  } else {
    console.log(chalk.red('✗ Connection failed'));
    console.log(chalk.gray(`Error: ${result.error}`));

    if (result.error.includes('not configured')) {
      console.log(chalk.yellow('\nTo configure Supabase:'));
      console.log(chalk.white('  1. Create a project at https://supabase.com'));
      console.log(chalk.white('  2. Copy your project URL and anon key'));
      console.log(chalk.white('  3. Create a .env file with:'));
      console.log(chalk.gray('     SUPABASE_URL=your-project-url'));
      console.log(chalk.gray('     SUPABASE_ANON_KEY=your-anon-key\n'));
    }
  }
}

main().catch(console.error);

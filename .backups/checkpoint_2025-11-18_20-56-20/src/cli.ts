#!/usr/bin/env node

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chalk from 'chalk';
import { SetupUtility } from './utils/SetupUtility.js';
import { testGitHubConnection, testSupabaseConnection, testAllConnections } from './utils/connectionTest.js';
import { ConfigManager } from './config/ConfigManager.js';

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from project root
dotenv.config({ path: join(__dirname, '..', '.env') });

const command = process.argv[2];

async function main() {
  switch (command) {
    case 'setup':
      await runSetup();
      break;
    
    case 'verify':
      await runVerify();
      break;
    
    case 'config':
      await showConfig();
      break;
    
    case 'test-github':
      await testGitHubConnection();
      break;
    
    case 'test-supabase':
      await testSupabaseConnection();
      break;
    
    case 'test-all':
      await testAllConnections();
      break;
    
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    
    default:
      console.log(chalk.red(`Unknown command: ${command}\n`));
      showHelp();
      process.exit(1);
  }
}

async function runSetup() {
  const setupUtility = new SetupUtility();
  
  try {
    await setupUtility.runFullSetup();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

async function runVerify() {
  const setupUtility = new SetupUtility();
  
  try {
    const status = await setupUtility.verifySetup();
    process.exit(status.github && status.supabase ? 0 : 1);
  } catch (error) {
    process.exit(1);
  }
}

async function showConfig() {
  console.log(chalk.bold.cyan('\n📋 Current Configuration\n'));
  
  try {
    const configManager = new ConfigManager();
    const validation = configManager.validateConfig();
    
    // Show GitHub config
    console.log(chalk.bold('GitHub:'));
    try {
      const githubConfig = configManager.loadGitHubConfig();
      console.log(chalk.gray(`  Token: ${maskToken(githubConfig.token)}`));
      console.log(chalk.gray(`  Owner: ${githubConfig.owner || 'Not set'}`));
      console.log(chalk.gray(`  Repository: ${githubConfig.repository || 'Not set'}`));
    } catch (error: any) {
      console.log(chalk.red(`  Error: ${error.message}`));
    }
    
    console.log();
    
    // Show Supabase config
    console.log(chalk.bold('Supabase:'));
    try {
      const supabaseConfig = configManager.loadSupabaseConfig();
      console.log(chalk.gray(`  URL: ${supabaseConfig.url}`));
      console.log(chalk.gray(`  Anon Key: ${maskToken(supabaseConfig.anonKey)}`));
      console.log(chalk.gray(`  Service Role Key: ${supabaseConfig.serviceRoleKey ? maskToken(supabaseConfig.serviceRoleKey) : 'Not set'}`));
    } catch (error: any) {
      console.log(chalk.red(`  Error: ${error.message}`));
    }
    
    console.log();
    
    // Show validation results
    if (validation.errors.length > 0) {
      console.log(chalk.bold.red('Errors:'));
      validation.errors.forEach(error => {
        console.log(chalk.red(`  ❌ ${error}`));
      });
      console.log();
    }
    
    if (validation.warnings.length > 0) {
      console.log(chalk.bold.yellow('Warnings:'));
      validation.warnings.forEach(warning => {
        console.log(chalk.yellow(`  ⚠️  ${warning}`));
      });
      console.log();
    }
    
    if (validation.valid && validation.warnings.length === 0) {
      console.log(chalk.green('✅ Configuration is valid!\n'));
    } else if (validation.valid) {
      console.log(chalk.yellow('⚠️  Configuration is valid but has warnings.\n'));
    } else {
      console.log(chalk.red('❌ Configuration has errors.\n'));
      process.exit(1);
    }
    
  } catch (error: any) {
    console.log(chalk.red(`Error reading configuration: ${error.message}\n`));
    process.exit(1);
  }
}

function maskToken(token: string): string {
  if (token.length <= 8) {
    return '***';
  }
  return token.substring(0, 4) + '...' + token.substring(token.length - 4);
}

function showHelp() {
  console.log(chalk.bold.green('\n🚀 GitHub and Supabase Integration CLI\n'));
  console.log(chalk.bold('Usage:'));
  console.log(chalk.gray('  npm run <command>\n'));
  
  console.log(chalk.bold('Commands:'));
  console.log(chalk.cyan('  setup') + chalk.gray('          Run interactive setup wizard for both services'));
  console.log(chalk.cyan('  verify') + chalk.gray('         Verify all connections'));
  console.log(chalk.cyan('  config') + chalk.gray('         Display current configuration'));
  console.log(chalk.cyan('  test-github') + chalk.gray('    Test GitHub connection only'));
  console.log(chalk.cyan('  test-supabase') + chalk.gray('  Test Supabase connection only'));
  console.log(chalk.cyan('  test-all') + chalk.gray('       Test all connections'));
  console.log(chalk.cyan('  help') + chalk.gray('           Show this help message\n'));
  
  console.log(chalk.bold('Examples:'));
  console.log(chalk.gray('  npm run setup'));
  console.log(chalk.gray('  npm run verify'));
  console.log(chalk.gray('  npm run config\n'));
}

main().catch((error) => {
  console.error(chalk.red('Fatal error:'), error.message);
  process.exit(1);
});

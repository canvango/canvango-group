import chalk from 'chalk';
import { GitHubClient } from '../clients/GitHubClient.js';
import { SupabaseClient } from '../clients/SupabaseClient.js';
import { ConfigManager } from '../config/ConfigManager.js';

export async function testGitHubConnection(): Promise<void> {
  console.log(chalk.bold.cyan('\n🔍 Testing GitHub Connection\n'));

  try {
    const configManager = new ConfigManager();
    const config = configManager.loadGitHubConfig();

    const client = new GitHubClient();
    await client.authenticate(config.token);
    const status = await client.testConnection();

    if (status.connected) {
      console.log(chalk.green('✅ GitHub connection successful!\n'));
      console.log(chalk.bold('Connection Details:'));
      console.log(chalk.gray(`  Username: ${status.details.username}`));
      if (status.details.name) {
        console.log(chalk.gray(`  Name: ${status.details.name}`));
      }
      if (status.details.email) {
        console.log(chalk.gray(`  Email: ${status.details.email}`));
      }
      console.log(chalk.gray(`  Profile: ${status.details.profileUrl}`));
      
      if (config.owner && config.repository) {
        console.log(chalk.bold('\nRepository Configuration:'));
        console.log(chalk.gray(`  Owner: ${config.owner}`));
        console.log(chalk.gray(`  Repository: ${config.repository}`));
        
        try {
          const repoInfo = await client.getRepositoryInfo(config.owner, config.repository);
          console.log(chalk.gray(`  URL: ${repoInfo.url}`));
          console.log(chalk.gray(`  Default Branch: ${repoInfo.defaultBranch}`));
          console.log(chalk.gray(`  Private: ${repoInfo.private ? 'Yes' : 'No'}`));
        } catch (error: any) {
          console.log(chalk.yellow(`  ⚠️  Could not fetch repository info: ${error.message}`));
        }
      }
      
      console.log();
    } else {
      console.log(chalk.red('❌ GitHub connection failed!\n'));
      console.log(chalk.gray(`  Error: ${status.message}\n`));
      process.exit(1);
    }
  } catch (error: any) {
    console.log(chalk.red('❌ GitHub connection test failed!\n'));
    console.log(chalk.gray(`  Error: ${error.message}\n`));
    
    console.log(chalk.yellow('💡 Troubleshooting tips:'));
    console.log(chalk.gray('  - Verify GITHUB_TOKEN is set in .env file'));
    console.log(chalk.gray('  - Check token has required scopes (repo)'));
    console.log(chalk.gray('  - Ensure token is not expired'));
    console.log(chalk.gray('  - Run "npm run setup" to reconfigure\n'));
    
    process.exit(1);
  }
}

export async function testSupabaseConnection(): Promise<void> {
  console.log(chalk.bold.cyan('\n🔍 Testing Supabase Connection\n'));

  try {
    const configManager = new ConfigManager();
    const config = configManager.loadSupabaseConfig();

    const client = new SupabaseClient();
    client.initialize(config.url, config.anonKey, config.serviceRoleKey);
    const status = await client.testConnection();

    if (status.connected) {
      console.log(chalk.green('✅ Supabase connection successful!\n'));
      console.log(chalk.bold('Connection Details:'));
      console.log(chalk.gray(`  URL: ${config.url}`));
      console.log(chalk.gray(`  Status: Connected`));
      
      const projectInfo = await client.getProjectInfo();
      console.log(chalk.gray(`  Client Version: ${projectInfo.version}`));
      
      if (config.serviceRoleKey) {
        console.log(chalk.gray(`  Service Role Key: Configured`));
      } else {
        console.log(chalk.gray(`  Service Role Key: Not configured`));
      }
      
      console.log();
    } else {
      console.log(chalk.red('❌ Supabase connection failed!\n'));
      console.log(chalk.gray(`  Error: ${status.message}\n`));
      process.exit(1);
    }
  } catch (error: any) {
    console.log(chalk.red('❌ Supabase connection test failed!\n'));
    console.log(chalk.gray(`  Error: ${error.message}\n`));
    
    console.log(chalk.yellow('💡 Troubleshooting tips:'));
    console.log(chalk.gray('  - Verify SUPABASE_URL and SUPABASE_ANON_KEY are set in .env file'));
    console.log(chalk.gray('  - Check your Supabase project is active'));
    console.log(chalk.gray('  - Ensure API keys are valid'));
    console.log(chalk.gray('  - Run "npm run setup" to reconfigure\n'));
    
    process.exit(1);
  }
}

export async function testAllConnections(): Promise<void> {
  console.log(chalk.bold.green('\n🚀 Testing All Connections\n'));

  let githubOk = false;
  let supabaseOk = false;

  // Test GitHub
  try {
    const configManager = new ConfigManager();
    const config = configManager.loadGitHubConfig();

    const client = new GitHubClient();
    await client.authenticate(config.token);
    const status = await client.testConnection();

    if (status.connected) {
      githubOk = true;
      console.log(chalk.green(`✅ GitHub: Connected as ${status.details.username}`));
    } else {
      console.log(chalk.red(`❌ GitHub: ${status.message}`));
    }
  } catch (error: any) {
    console.log(chalk.red(`❌ GitHub: ${error.message}`));
  }

  // Test Supabase
  try {
    const configManager = new ConfigManager();
    const config = configManager.loadSupabaseConfig();

    const client = new SupabaseClient();
    client.initialize(config.url, config.anonKey, config.serviceRoleKey);
    const status = await client.testConnection();

    if (status.connected) {
      supabaseOk = true;
      console.log(chalk.green(`✅ Supabase: Connected to ${config.url}`));
    } else {
      console.log(chalk.red(`❌ Supabase: ${status.message}`));
    }
  } catch (error: any) {
    console.log(chalk.red(`❌ Supabase: ${error.message}`));
  }

  console.log();

  if (githubOk && supabaseOk) {
    console.log(chalk.bold.green('🎉 All connections verified successfully!\n'));
    process.exit(0);
  } else {
    console.log(chalk.bold.yellow('⚠️  Some connections failed. Please check your configuration.\n'));
    console.log(chalk.gray('Run "npm run setup" to reconfigure your services.\n'));
    process.exit(1);
  }
}

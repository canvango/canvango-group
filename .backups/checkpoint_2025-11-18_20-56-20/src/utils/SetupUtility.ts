import inquirer from 'inquirer';
import chalk from 'chalk';
import { GitHubClient } from '../clients/GitHubClient.js';
import { SupabaseClient } from '../clients/SupabaseClient.js';
import { writeEnvFile } from './envWriter.js';

export interface SetupStatus {
  github: boolean;
  supabase: boolean;
  message: string;
}

export class SetupUtility {
  private githubClient: GitHubClient;
  private supabaseClient: SupabaseClient;

  constructor() {
    this.githubClient = new GitHubClient();
    this.supabaseClient = new SupabaseClient();
  }

  async runGitHubSetup(): Promise<void> {
    console.log(chalk.bold.cyan('\n🔧 GitHub Setup\n'));
    console.log(chalk.gray('You need a Personal Access Token from GitHub.'));
    console.log(chalk.blue('Create one at: https://github.com/settings/tokens\n'));

    const answers = await inquirer.prompt([
      {
        type: 'password',
        name: 'token',
        message: 'Enter your GitHub Personal Access Token:',
        validate: (input: string) => {
          if (!input) return 'Token is required';
          if (!input.startsWith('ghp_') && !input.startsWith('github_pat_')) {
            return 'Token should start with ghp_ or github_pat_';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'owner',
        message: 'Enter GitHub username/organization (optional):',
        default: ''
      },
      {
        type: 'input',
        name: 'repo',
        message: 'Enter repository name (optional):',
        default: ''
      }
    ]);

    // Test authentication
    console.log(chalk.yellow('\n⏳ Testing GitHub connection...'));
    
    try {
      await this.githubClient.authenticate(answers.token);
      const status = await this.githubClient.testConnection();

      if (status.connected) {
        console.log(chalk.green('✅ GitHub connection successful!'));
        console.log(chalk.gray(`   Username: ${status.details.username}`));
        if (status.details.name) {
          console.log(chalk.gray(`   Name: ${status.details.name}`));
        }

        // Save to .env
        await writeEnvFile({
          GITHUB_TOKEN: answers.token,
          GITHUB_OWNER: answers.owner || undefined,
          GITHUB_REPO: answers.repo || undefined
        });

        console.log(chalk.green('✅ GitHub credentials saved to .env file\n'));
      } else {
        console.log(chalk.red('❌ GitHub connection failed:'), status.message);
        console.log(chalk.yellow('\n💡 Troubleshooting tips:'));
        console.log(chalk.gray('   - Verify your token is correct'));
        console.log(chalk.gray('   - Check token has required scopes (repo)'));
        console.log(chalk.gray('   - Ensure token is not expired\n'));
        throw new Error(status.message);
      }
    } catch (error: any) {
      console.log(chalk.red('❌ GitHub setup failed:'), error.message);
      throw error;
    }
  }

  async runSupabaseSetup(): Promise<void> {
    console.log(chalk.bold.cyan('\n🔧 Supabase Setup\n'));
    console.log(chalk.gray('You need your Supabase project URL and API keys.'));
    console.log(chalk.blue('Find them at: https://app.supabase.com/project/_/settings/api\n'));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'url',
        message: 'Enter your Supabase project URL:',
        validate: (input: string) => {
          if (!input) return 'URL is required';
          if (!input.startsWith('https://')) return 'URL must start with https://';
          if (!input.includes('.supabase.co')) return 'URL must contain .supabase.co';
          return true;
        }
      },
      {
        type: 'password',
        name: 'anonKey',
        message: 'Enter your Supabase anon/public key:',
        validate: (input: string) => {
          if (!input) return 'Anon key is required';
          if (!input.startsWith('eyJ')) return 'Key should be in JWT format (starts with eyJ)';
          return true;
        }
      },
      {
        type: 'confirm',
        name: 'addServiceRole',
        message: 'Do you want to add a service role key? (for admin operations)',
        default: false
      }
    ]);

    let serviceRoleKey: string | undefined;
    if (answers.addServiceRole) {
      const serviceAnswer = await inquirer.prompt([
        {
          type: 'password',
          name: 'serviceRoleKey',
          message: 'Enter your Supabase service role key:',
          validate: (input: string) => {
            if (!input) return 'Service role key is required';
            if (!input.startsWith('eyJ')) return 'Key should be in JWT format (starts with eyJ)';
            return true;
          }
        }
      ]);
      serviceRoleKey = serviceAnswer.serviceRoleKey;
    }

    // Test connection
    console.log(chalk.yellow('\n⏳ Testing Supabase connection...'));
    
    try {
      this.supabaseClient.initialize(answers.url, answers.anonKey, serviceRoleKey);
      const status = await this.supabaseClient.testConnection();

      if (status.connected) {
        console.log(chalk.green('✅ Supabase connection successful!'));
        console.log(chalk.gray(`   URL: ${answers.url}`));

        // Save to .env
        await writeEnvFile({
          SUPABASE_URL: answers.url,
          SUPABASE_ANON_KEY: answers.anonKey,
          SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey
        });

        console.log(chalk.green('✅ Supabase credentials saved to .env file\n'));
      } else {
        console.log(chalk.red('❌ Supabase connection failed:'), status.message);
        console.log(chalk.yellow('\n💡 Troubleshooting tips:'));
        console.log(chalk.gray('   - Verify your project URL is correct'));
        console.log(chalk.gray('   - Check your API keys are valid'));
        console.log(chalk.gray('   - Ensure your Supabase project is active\n'));
        throw new Error(status.message);
      }
    } catch (error: any) {
      console.log(chalk.red('❌ Supabase setup failed:'), error.message);
      throw error;
    }
  }

  async runFullSetup(): Promise<void> {
    console.log(chalk.bold.green('🚀 GitHub and Supabase Integration Setup\n'));
    console.log(chalk.gray('This wizard will help you configure both services.\n'));

    try {
      await this.runGitHubSetup();
      await this.runSupabaseSetup();

      console.log(chalk.bold.green('🎉 Setup complete! Both services are configured.\n'));
      console.log(chalk.gray('You can now use the GitHub and Supabase clients in your application.'));
      console.log(chalk.blue('Run "npm run verify" to test your connections anytime.\n'));
    } catch (error: any) {
      console.log(chalk.yellow('\n⚠️  Setup incomplete. Please fix the errors and try again.\n'));
      throw error;
    }
  }

  async verifySetup(): Promise<SetupStatus> {
    console.log(chalk.bold.cyan('\n🔍 Verifying connections...\n'));

    let githubOk = false;
    let supabaseOk = false;
    const messages: string[] = [];

    // Check GitHub
    try {
      const token = process.env.GITHUB_TOKEN;
      if (!token) {
        messages.push(chalk.red('❌ GitHub: GITHUB_TOKEN not found in environment'));
        messages.push(chalk.gray('   Run "npm run setup" to configure GitHub'));
      } else {
        await this.githubClient.authenticate(token);
        const status = await this.githubClient.testConnection();
        
        if (status.connected) {
          githubOk = true;
          messages.push(chalk.green(`✅ GitHub: Connected as ${status.details.username}`));
        } else {
          messages.push(chalk.red(`❌ GitHub: ${status.message}`));
        }
      }
    } catch (error: any) {
      messages.push(chalk.red(`❌ GitHub: ${error.message}`));
    }

    // Check Supabase
    try {
      const url = process.env.SUPABASE_URL;
      const anonKey = process.env.SUPABASE_ANON_KEY;
      
      if (!url || !anonKey) {
        messages.push(chalk.red('❌ Supabase: SUPABASE_URL or SUPABASE_ANON_KEY not found in environment'));
        messages.push(chalk.gray('   Run "npm run setup" to configure Supabase'));
      } else {
        this.supabaseClient.initialize(url, anonKey, process.env.SUPABASE_SERVICE_ROLE_KEY);
        const status = await this.supabaseClient.testConnection();
        
        if (status.connected) {
          supabaseOk = true;
          messages.push(chalk.green(`✅ Supabase: Connected to ${url}`));
        } else {
          messages.push(chalk.red(`❌ Supabase: ${status.message}`));
        }
      }
    } catch (error: any) {
      messages.push(chalk.red(`❌ Supabase: ${error.message}`));
    }

    // Print results
    messages.forEach(msg => console.log(msg));
    console.log();

    const allOk = githubOk && supabaseOk;
    const message = allOk 
      ? chalk.bold.green('✅ All connections verified successfully!')
      : chalk.bold.yellow('⚠️  Some connections failed. Please check your configuration.');

    console.log(message);
    console.log();

    return {
      github: githubOk,
      supabase: supabaseOk,
      message
    };
  }
}

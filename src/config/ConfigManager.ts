import dotenv from 'dotenv';
import { GitHubConfig, SupabaseConfig, ValidationResult, IntegrationError, ERROR_CODES } from './types.js';

export class ConfigManager {
  constructor() {
    // Load environment variables from .env file
    dotenv.config();
  }

  loadGitHubConfig(): GitHubConfig {
    const token = process.env.GITHUB_TOKEN;
    
    if (!token) {
      throw new IntegrationError(
        'GitHub token is missing. Please set GITHUB_TOKEN in your .env file.',
        ERROR_CODES.MISSING_CONFIG,
        'github',
        true
      );
    }

    return {
      token,
      owner: process.env.GITHUB_OWNER,
      repository: process.env.GITHUB_REPO
    };
  }

  loadSupabaseConfig(): SupabaseConfig {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;

    if (!url) {
      throw new IntegrationError(
        'Supabase URL is missing. Please set SUPABASE_URL in your .env file.',
        ERROR_CODES.MISSING_CONFIG,
        'supabase',
        true
      );
    }

    if (!anonKey) {
      throw new IntegrationError(
        'Supabase anon key is missing. Please set SUPABASE_ANON_KEY in your .env file.',
        ERROR_CODES.MISSING_CONFIG,
        'supabase',
        true
      );
    }

    return {
      url,
      anonKey,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    };
  }

  validateConfig(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate GitHub config
    try {
      const githubConfig = this.loadGitHubConfig();
      
      if (!githubConfig.token.startsWith('ghp_') && !githubConfig.token.startsWith('github_pat_')) {
        warnings.push('GitHub token format may be invalid. Expected format: ghp_* or github_pat_*');
      }

      if (!githubConfig.owner) {
        warnings.push('GITHUB_OWNER is not set. Some operations may require it.');
      }

      if (!githubConfig.repository) {
        warnings.push('GITHUB_REPO is not set. Some operations may require it.');
      }
    } catch (error) {
      if (error instanceof IntegrationError) {
        errors.push(error.message);
      }
    }

    // Validate Supabase config
    try {
      const supabaseConfig = this.loadSupabaseConfig();
      
      if (!supabaseConfig.url.startsWith('https://') || !supabaseConfig.url.includes('.supabase.co')) {
        errors.push('Supabase URL format is invalid. Expected format: https://xxxxx.supabase.co');
      }

      if (!supabaseConfig.anonKey.startsWith('eyJ')) {
        errors.push('Supabase anon key format is invalid. Expected JWT format.');
      }

      if (!supabaseConfig.serviceRoleKey) {
        warnings.push('SUPABASE_SERVICE_ROLE_KEY is not set. Admin operations will not be available.');
      }
    } catch (error) {
      if (error instanceof IntegrationError) {
        errors.push(error.message);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  saveGitHubConfig(_config: GitHubConfig): void {
    // This method would write to .env file
    // For now, we'll throw an error indicating manual setup is required
    throw new Error('Config saving not yet implemented. Please manually edit .env file.');
  }

  saveSupabaseConfig(_config: SupabaseConfig): void {
    // This method would write to .env file
    // For now, we'll throw an error indicating manual setup is required
    throw new Error('Config saving not yet implemented. Please manually edit .env file.');
  }
}

import { ConfigManager } from './config/ConfigManager.js';
import { GitHubClient, ConnectionStatus as GitHubConnectionStatus } from './clients/GitHubClient.js';
import { SupabaseClient, ConnectionStatus as SupabaseConnectionStatus } from './clients/SupabaseClient.js';

// Export types
export * from './config/types.js';
export type { RepoInfo } from './clients/GitHubClient.js';
export type { ProjectInfo } from './clients/SupabaseClient.js';

// Export ConnectionStatus with aliases to avoid conflicts
export type { GitHubConnectionStatus, SupabaseConnectionStatus };

// Export classes
export { ConfigManager } from './config/ConfigManager.js';
export { GitHubClient } from './clients/GitHubClient.js';
export { SupabaseClient } from './clients/SupabaseClient.js';

// Initialize and export clients
let githubClient: GitHubClient | null = null;
let supabaseClient: SupabaseClient | null = null;
let configManager: ConfigManager | null = null;

/**
 * Initialize the integration with GitHub and Supabase
 * @param verifyConnections - Whether to verify connections on initialization (default: false)
 * @returns Object containing initialized clients
 */
export async function initialize(verifyConnections: boolean = false): Promise<{
  github: GitHubClient;
  supabase: SupabaseClient;
  config: ConfigManager;
}> {
  // Initialize config manager
  configManager = new ConfigManager();

  // Load configurations
  const githubConfig = configManager.loadGitHubConfig();
  const supabaseConfig = configManager.loadSupabaseConfig();

  // Initialize GitHub client
  githubClient = new GitHubClient();
  await githubClient.authenticate(githubConfig.token);

  // Initialize Supabase client
  supabaseClient = new SupabaseClient();
  supabaseClient.initialize(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    supabaseConfig.serviceRoleKey
  );

  // Optionally verify connections
  if (verifyConnections) {
    const githubStatus = await githubClient.testConnection();
    const supabaseStatus = await supabaseClient.testConnection();

    if (!githubStatus.connected) {
      throw new Error(`GitHub connection failed: ${githubStatus.message}`);
    }

    if (!supabaseStatus.connected) {
      throw new Error(`Supabase connection failed: ${supabaseStatus.message}`);
    }
  }

  return {
    github: githubClient,
    supabase: supabaseClient,
    config: configManager
  };
}

/**
 * Get the GitHub client instance
 * @throws Error if not initialized
 */
export function getGitHubClient(): GitHubClient {
  if (!githubClient) {
    throw new Error('GitHub client not initialized. Call initialize() first.');
  }
  return githubClient;
}

/**
 * Get the Supabase client instance
 * @throws Error if not initialized
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Call initialize() first.');
  }
  return supabaseClient;
}

/**
 * Get the config manager instance
 * @throws Error if not initialized
 */
export function getConfigManager(): ConfigManager {
  if (!configManager) {
    throw new Error('Config manager not initialized. Call initialize() first.');
  }
  return configManager;
}

// Default export
export default {
  initialize,
  getGitHubClient,
  getSupabaseClient,
  getConfigManager,
  ConfigManager,
  GitHubClient,
  SupabaseClient
};

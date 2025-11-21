import { Octokit } from '@octokit/rest';
import { IntegrationError, ERROR_CODES } from '../config/types.js';

export interface ConnectionStatus {
  connected: boolean;
  message: string;
  details?: any;
}

export interface RepoInfo {
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
  url: string;
  defaultBranch: string;
}

export class GitHubClient {
  private octokit: Octokit | null = null;
  private authenticated: boolean = false;

  async authenticate(token: string): Promise<boolean> {
    try {
      this.octokit = new Octokit({ auth: token });
      
      // Test authentication by getting user info
      await this.octokit.users.getAuthenticated();
      
      this.authenticated = true;
      return true;
    } catch (error: any) {
      this.authenticated = false;
      
      if (error.status === 401) {
        throw new IntegrationError(
          'GitHub authentication failed. Invalid or expired token.',
          ERROR_CODES.INVALID_TOKEN,
          'github',
          true
        );
      }
      
      throw new IntegrationError(
        `GitHub authentication failed: ${error.message}`,
        ERROR_CODES.CONNECTION_FAILED,
        'github',
        true
      );
    }
  }

  async testConnection(): Promise<ConnectionStatus> {
    if (!this.octokit || !this.authenticated) {
      return {
        connected: false,
        message: 'Not authenticated. Please call authenticate() first.'
      };
    }

    try {
      const { data } = await this.octokit.users.getAuthenticated();
      
      return {
        connected: true,
        message: 'GitHub connection successful',
        details: {
          username: data.login,
          name: data.name,
          email: data.email,
          profileUrl: data.html_url
        }
      };
    } catch (error: any) {
      return {
        connected: false,
        message: `Connection test failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  async getRepositoryInfo(owner: string, repo: string): Promise<RepoInfo> {
    if (!this.octokit || !this.authenticated) {
      throw new IntegrationError(
        'Not authenticated. Please call authenticate() first.',
        ERROR_CODES.INVALID_TOKEN,
        'github',
        true
      );
    }

    try {
      const { data } = await this.octokit.repos.get({ owner, repo });
      
      return {
        name: data.name,
        fullName: data.full_name,
        description: data.description,
        private: data.private,
        url: data.html_url,
        defaultBranch: data.default_branch
      };
    } catch (error: any) {
      if (error.status === 404) {
        throw new IntegrationError(
          `Repository ${owner}/${repo} not found or you don't have access.`,
          ERROR_CODES.PERMISSION_DENIED,
          'github',
          true
        );
      }
      
      throw new IntegrationError(
        `Failed to get repository info: ${error.message}`,
        ERROR_CODES.CONNECTION_FAILED,
        'github',
        true
      );
    }
  }

  isAuthenticated(): boolean {
    return this.authenticated;
  }
}

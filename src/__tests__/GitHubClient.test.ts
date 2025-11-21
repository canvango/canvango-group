import { GitHubClient } from '../clients/GitHubClient.js';
import { IntegrationError } from '../config/types.js';
import { Octokit } from '@octokit/rest';

// Mock Octokit
jest.mock('@octokit/rest');

describe('GitHubClient', () => {
  let client: GitHubClient;
  let mockGetAuthenticated: jest.Mock;
  let mockReposGet: jest.Mock;

  beforeEach(() => {
    client = new GitHubClient();
    mockGetAuthenticated = jest.fn();
    mockReposGet = jest.fn();
    
    const mockOctokit = {
      users: {
        getAuthenticated: mockGetAuthenticated
      },
      repos: {
        get: mockReposGet
      }
    };
    
    (Octokit as jest.MockedClass<typeof Octokit>).mockImplementation(() => mockOctokit as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate successfully with valid token', async () => {
      mockGetAuthenticated.mockResolvedValue({
        data: {
          login: 'testuser',
          name: 'Test User',
          email: 'test@example.com'
        }
      });

      const result = await client.authenticate('ghp_validtoken');

      expect(result).toBe(true);
      expect(client.isAuthenticated()).toBe(true);
      expect(Octokit).toHaveBeenCalledWith({ auth: 'ghp_validtoken' });
    });

    it('should throw error with invalid token', async () => {
      mockGetAuthenticated.mockRejectedValue({
        status: 401,
        message: 'Bad credentials'
      });

      await expect(client.authenticate('invalid_token')).rejects.toThrow(IntegrationError);
      await expect(client.authenticate('invalid_token')).rejects.toThrow('Invalid or expired token');
      expect(client.isAuthenticated()).toBe(false);
    });

    it('should throw error on connection failure', async () => {
      mockGetAuthenticated.mockRejectedValue({
        status: 500,
        message: 'Server error'
      });

      await expect(client.authenticate('ghp_token')).rejects.toThrow(IntegrationError);
      expect(client.isAuthenticated()).toBe(false);
    });
  });

  describe('testConnection', () => {
    it('should return not connected when not authenticated', async () => {
      const result = await client.testConnection();

      expect(result.connected).toBe(false);
      expect(result.message).toContain('Not authenticated');
    });

    it('should return connected with user details when authenticated', async () => {
      mockGetAuthenticated.mockResolvedValue({
        data: {
          login: 'testuser',
          name: 'Test User',
          email: 'test@example.com',
          html_url: 'https://github.com/testuser'
        }
      });

      await client.authenticate('ghp_validtoken');
      const result = await client.testConnection();

      expect(result.connected).toBe(true);
      expect(result.message).toBe('GitHub connection successful');
      expect(result.details).toEqual({
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        profileUrl: 'https://github.com/testuser'
      });
    });

    it('should return not connected on API error', async () => {
      mockGetAuthenticated
        .mockResolvedValueOnce({ data: { login: 'testuser' } })
        .mockRejectedValueOnce({ message: 'API error' });

      await client.authenticate('ghp_validtoken');
      const result = await client.testConnection();

      expect(result.connected).toBe(false);
      expect(result.message).toContain('Connection test failed');
    });
  });

  describe('getRepositoryInfo', () => {
    it('should throw error when not authenticated', async () => {
      await expect(client.getRepositoryInfo('owner', 'repo')).rejects.toThrow(IntegrationError);
      await expect(client.getRepositoryInfo('owner', 'repo')).rejects.toThrow('Not authenticated');
    });

    it('should return repository info when authenticated', async () => {
      mockGetAuthenticated.mockResolvedValue({
        data: { login: 'testuser' }
      });

      mockReposGet.mockResolvedValue({
        data: {
          name: 'testrepo',
          full_name: 'testuser/testrepo',
          description: 'Test repository',
          private: false,
          html_url: 'https://github.com/testuser/testrepo',
          default_branch: 'main'
        }
      });

      await client.authenticate('ghp_validtoken');
      const result = await client.getRepositoryInfo('testuser', 'testrepo');

      expect(result).toEqual({
        name: 'testrepo',
        fullName: 'testuser/testrepo',
        description: 'Test repository',
        private: false,
        url: 'https://github.com/testuser/testrepo',
        defaultBranch: 'main'
      });
    });

    it('should throw error when repository not found', async () => {
      mockGetAuthenticated.mockResolvedValue({
        data: { login: 'testuser' }
      });

      mockReposGet.mockRejectedValue({
        status: 404,
        message: 'Not Found'
      });

      await client.authenticate('ghp_validtoken');

      await expect(client.getRepositoryInfo('owner', 'nonexistent')).rejects.toThrow(IntegrationError);
      await expect(client.getRepositoryInfo('owner', 'nonexistent')).rejects.toThrow('not found');
    });

    it('should throw error on API failure', async () => {
      mockGetAuthenticated.mockResolvedValue({
        data: { login: 'testuser' }
      });

      mockReposGet.mockRejectedValue({
        status: 500,
        message: 'Server error'
      });

      await client.authenticate('ghp_validtoken');

      await expect(client.getRepositoryInfo('owner', 'repo')).rejects.toThrow(IntegrationError);
    });
  });
});

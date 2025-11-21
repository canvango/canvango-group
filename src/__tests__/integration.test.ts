import { initialize, getGitHubClient, getSupabaseClient, getConfigManager } from '../index.js';
import { ConfigManager } from '../config/ConfigManager.js';
import { GitHubClient } from '../clients/GitHubClient.js';
import { SupabaseClient } from '../clients/SupabaseClient.js';

// Mock the clients
jest.mock('../clients/GitHubClient.js');
jest.mock('../clients/SupabaseClient.js');
jest.mock('../config/ConfigManager.js');

describe('Integration Tests', () => {
  let mockConfigManager: jest.Mocked<ConfigManager>;
  let mockGitHubClient: jest.Mocked<GitHubClient>;
  let mockSupabaseClient: jest.Mocked<SupabaseClient>;

  beforeEach(() => {
    // Setup mocks
    mockConfigManager = {
      loadGitHubConfig: jest.fn().mockReturnValue({
        token: 'ghp_test123',
        owner: 'testuser',
        repository: 'testrepo'
      }),
      loadSupabaseConfig: jest.fn().mockReturnValue({
        url: 'https://test.supabase.co',
        anonKey: 'eyJtest123',
        serviceRoleKey: undefined
      }),
      validateConfig: jest.fn(),
      saveGitHubConfig: jest.fn(),
      saveSupabaseConfig: jest.fn()
    } as any;

    mockGitHubClient = {
      authenticate: jest.fn().mockResolvedValue(true),
      testConnection: jest.fn().mockResolvedValue({
        connected: true,
        message: 'Connected',
        details: { username: 'testuser' }
      }),
      getRepositoryInfo: jest.fn(),
      isAuthenticated: jest.fn().mockReturnValue(true)
    } as any;

    mockSupabaseClient = {
      initialize: jest.fn().mockReturnValue({}),
      testConnection: jest.fn().mockResolvedValue({
        connected: true,
        message: 'Connected'
      }),
      getProjectInfo: jest.fn(),
      getClient: jest.fn(),
      isInitialized: jest.fn().mockReturnValue(true)
    } as any;

    (ConfigManager as jest.MockedClass<typeof ConfigManager>).mockImplementation(() => mockConfigManager);
    (GitHubClient as jest.MockedClass<typeof GitHubClient>).mockImplementation(() => mockGitHubClient);
    (SupabaseClient as jest.MockedClass<typeof SupabaseClient>).mockImplementation(() => mockSupabaseClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize both clients successfully', async () => {
      const result = await initialize();

      expect(result.github).toBe(mockGitHubClient);
      expect(result.supabase).toBe(mockSupabaseClient);
      expect(result.config).toBe(mockConfigManager);
      
      expect(mockConfigManager.loadGitHubConfig).toHaveBeenCalled();
      expect(mockConfigManager.loadSupabaseConfig).toHaveBeenCalled();
      expect(mockGitHubClient.authenticate).toHaveBeenCalledWith('ghp_test123');
      expect(mockSupabaseClient.initialize).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'eyJtest123',
        undefined
      );
    });

    it('should verify connections when verifyConnections is true', async () => {
      await initialize(true);

      expect(mockGitHubClient.testConnection).toHaveBeenCalled();
      expect(mockSupabaseClient.testConnection).toHaveBeenCalled();
    });

    it('should not verify connections when verifyConnections is false', async () => {
      await initialize(false);

      expect(mockGitHubClient.testConnection).not.toHaveBeenCalled();
      expect(mockSupabaseClient.testConnection).not.toHaveBeenCalled();
    });

    it('should throw error when GitHub connection fails during verification', async () => {
      mockGitHubClient.testConnection.mockResolvedValue({
        connected: false,
        message: 'Connection failed'
      });

      await expect(initialize(true)).rejects.toThrow('GitHub connection failed');
    });

    it('should throw error when Supabase connection fails during verification', async () => {
      mockSupabaseClient.testConnection.mockResolvedValue({
        connected: false,
        message: 'Connection failed'
      });

      await expect(initialize(true)).rejects.toThrow('Supabase connection failed');
    });
  });

  describe('getGitHubClient', () => {
    it('should return GitHub client after initialization', async () => {
      await initialize();
      const client = getGitHubClient();
      expect(client).toBe(mockGitHubClient);
    });
  });

  describe('getSupabaseClient', () => {
    it('should return Supabase client after initialization', async () => {
      await initialize();
      const client = getSupabaseClient();
      expect(client).toBe(mockSupabaseClient);
    });
  });

  describe('getConfigManager', () => {
    it('should return config manager after initialization', async () => {
      await initialize();
      const config = getConfigManager();
      expect(config).toBe(mockConfigManager);
    });
  });

  describe('Full setup flow', () => {
    it('should complete full setup and verification flow', async () => {
      // Initialize
      const { github, supabase } = await initialize(true);

      // Verify clients are initialized
      expect(github.isAuthenticated()).toBe(true);
      expect(supabase.isInitialized()).toBe(true);

      // Test connections
      const githubStatus = await github.testConnection();
      const supabaseStatus = await supabase.testConnection();

      expect(githubStatus.connected).toBe(true);
      expect(supabaseStatus.connected).toBe(true);
    });

    it('should handle configuration errors gracefully', async () => {
      mockConfigManager.loadGitHubConfig.mockImplementation(() => {
        throw new Error('Missing GITHUB_TOKEN');
      });

      await expect(initialize()).rejects.toThrow('Missing GITHUB_TOKEN');
    });

    it('should handle authentication errors gracefully', async () => {
      mockGitHubClient.authenticate.mockRejectedValue(new Error('Invalid token'));

      await expect(initialize()).rejects.toThrow('Invalid token');
    });
  });
});

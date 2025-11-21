import { ConfigManager } from '../config/ConfigManager.js';
import { IntegrationError } from '../config/types.js';

describe('ConfigManager', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('loadGitHubConfig', () => {
    it('should load valid GitHub configuration', () => {
      process.env.GITHUB_TOKEN = 'ghp_test123456789';
      process.env.GITHUB_OWNER = 'testuser';
      process.env.GITHUB_REPO = 'testrepo';

      const configManager = new ConfigManager();
      const config = configManager.loadGitHubConfig();

      expect(config.token).toBe('ghp_test123456789');
      expect(config.owner).toBe('testuser');
      expect(config.repository).toBe('testrepo');
    });

    it('should throw error when GITHUB_TOKEN is missing', () => {
      delete process.env.GITHUB_TOKEN;

      const configManager = new ConfigManager();

      expect(() => configManager.loadGitHubConfig()).toThrow(IntegrationError);
      expect(() => configManager.loadGitHubConfig()).toThrow('GitHub token is missing');
    });

    it('should load config with optional fields undefined', () => {
      process.env.GITHUB_TOKEN = 'ghp_test123456789';
      delete process.env.GITHUB_OWNER;
      delete process.env.GITHUB_REPO;

      const configManager = new ConfigManager();
      const config = configManager.loadGitHubConfig();

      expect(config.token).toBe('ghp_test123456789');
      expect(config.owner).toBeUndefined();
      expect(config.repository).toBeUndefined();
    });
  });

  describe('loadSupabaseConfig', () => {
    it('should load valid Supabase configuration', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'eyJtest123';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJservice123';

      const configManager = new ConfigManager();
      const config = configManager.loadSupabaseConfig();

      expect(config.url).toBe('https://test.supabase.co');
      expect(config.anonKey).toBe('eyJtest123');
      expect(config.serviceRoleKey).toBe('eyJservice123');
    });

    it('should throw error when SUPABASE_URL is missing', () => {
      delete process.env.SUPABASE_URL;
      process.env.SUPABASE_ANON_KEY = 'eyJtest123';

      const configManager = new ConfigManager();

      expect(() => configManager.loadSupabaseConfig()).toThrow(IntegrationError);
      expect(() => configManager.loadSupabaseConfig()).toThrow('Supabase URL is missing');
    });

    it('should throw error when SUPABASE_ANON_KEY is missing', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      delete process.env.SUPABASE_ANON_KEY;

      const configManager = new ConfigManager();

      expect(() => configManager.loadSupabaseConfig()).toThrow(IntegrationError);
      expect(() => configManager.loadSupabaseConfig()).toThrow('Supabase anon key is missing');
    });

    it('should load config without optional service role key', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'eyJtest123';
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const configManager = new ConfigManager();
      const config = configManager.loadSupabaseConfig();

      expect(config.url).toBe('https://test.supabase.co');
      expect(config.anonKey).toBe('eyJtest123');
      expect(config.serviceRoleKey).toBeUndefined();
    });
  });

  describe('validateConfig', () => {
    it('should return valid result with proper configuration', () => {
      process.env.GITHUB_TOKEN = 'ghp_test123456789';
      process.env.GITHUB_OWNER = 'testuser';
      process.env.GITHUB_REPO = 'testrepo';
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'eyJtest123';

      const configManager = new ConfigManager();
      const result = configManager.validateConfig();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors when required fields are missing', () => {
      delete process.env.GITHUB_TOKEN;
      delete process.env.SUPABASE_URL;

      const configManager = new ConfigManager();
      const result = configManager.validateConfig();

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('GitHub token'))).toBe(true);
      expect(result.errors.some(e => e.includes('Supabase URL'))).toBe(true);
    });

    it('should return warnings for invalid token format', () => {
      process.env.GITHUB_TOKEN = 'invalid_token_format';
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'eyJtest123';

      const configManager = new ConfigManager();
      const result = configManager.validateConfig();

      expect(result.warnings.some(w => w.includes('token format'))).toBe(true);
    });

    it('should return warnings for missing optional fields', () => {
      process.env.GITHUB_TOKEN = 'ghp_test123456789';
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'eyJtest123';
      delete process.env.GITHUB_OWNER;
      delete process.env.GITHUB_REPO;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const configManager = new ConfigManager();
      const result = configManager.validateConfig();

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should return errors for invalid Supabase URL format', () => {
      process.env.GITHUB_TOKEN = 'ghp_test123456789';
      process.env.SUPABASE_URL = 'http://invalid-url.com';
      process.env.SUPABASE_ANON_KEY = 'eyJtest123';

      const configManager = new ConfigManager();
      const result = configManager.validateConfig();

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Supabase URL format'))).toBe(true);
    });

    it('should return errors for invalid anon key format', () => {
      process.env.GITHUB_TOKEN = 'ghp_test123456789';
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'invalid_key';

      const configManager = new ConfigManager();
      const result = configManager.validateConfig();

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('anon key format'))).toBe(true);
    });
  });
});

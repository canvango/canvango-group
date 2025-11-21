import { SupabaseClient } from '../clients/SupabaseClient.js';
import { IntegrationError } from '../config/types.js';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js');

describe('SupabaseClient', () => {
  let client: SupabaseClient;
  let mockSupabaseInstance: any;

  beforeEach(() => {
    client = new SupabaseClient();
    
    mockSupabaseInstance = {
      auth: {
        getSession: jest.fn()
      },
      from: jest.fn()
    };
    
    (createClient as jest.Mock).mockReturnValue(mockSupabaseInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize successfully with valid credentials', () => {
      const url = 'https://test.supabase.co';
      const anonKey = 'eyJtest123';

      const result = client.initialize(url, anonKey);

      expect(result).toBe(mockSupabaseInstance);
      expect(client.isInitialized()).toBe(true);
      expect(createClient).toHaveBeenCalledWith(url, anonKey);
    });

    it('should initialize with service role key when provided', () => {
      const url = 'https://test.supabase.co';
      const anonKey = 'eyJanon123';
      const serviceRoleKey = 'eyJservice123';

      client.initialize(url, anonKey, serviceRoleKey);

      expect(createClient).toHaveBeenCalledWith(url, serviceRoleKey);
    });

    it('should throw error with invalid URL format', () => {
      const invalidUrl = 'http://invalid.com';
      const anonKey = 'eyJtest123';

      expect(() => client.initialize(invalidUrl, anonKey)).toThrow(IntegrationError);
      expect(() => client.initialize(invalidUrl, anonKey)).toThrow('Invalid Supabase URL format');
    });

    it('should throw error with invalid anon key format', () => {
      const url = 'https://test.supabase.co';
      const invalidKey = 'invalid_key';

      expect(() => client.initialize(url, invalidKey)).toThrow(IntegrationError);
      expect(() => client.initialize(url, invalidKey)).toThrow('Invalid Supabase anon key format');
    });

    it('should throw error when URL does not contain supabase.co', () => {
      const url = 'https://test.example.com';
      const anonKey = 'eyJtest123';

      expect(() => client.initialize(url, anonKey)).toThrow(IntegrationError);
    });
  });

  describe('testConnection', () => {
    it('should return not initialized when not initialized', async () => {
      const result = await client.testConnection();

      expect(result.connected).toBe(false);
      expect(result.message).toContain('Not initialized');
    });

    it('should return connected when connection is successful', async () => {
      const url = 'https://test.supabase.co';
      const anonKey = 'eyJtest123';

      mockSupabaseInstance.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({
            error: { code: 'PGRST116', message: 'table does not exist' }
          })
        })
      });
      mockSupabaseInstance.from = mockFrom;

      client.initialize(url, anonKey);
      const result = await client.testConnection();

      expect(result.connected).toBe(true);
      expect(result.message).toBe('Supabase connection successful');
      expect(result.details).toEqual({
        url: 'https://test.supabase.co',
        status: 'connected'
      });
    });

    it('should return not connected on auth error', async () => {
      const url = 'https://test.supabase.co';
      const anonKey = 'eyJtest123';

      mockSupabaseInstance.auth.getSession.mockResolvedValue({
        data: null,
        error: { message: 'Invalid API key' }
      });

      client.initialize(url, anonKey);
      const result = await client.testConnection();

      expect(result.connected).toBe(false);
      expect(result.message).toContain('Connection test failed');
    });

    it('should handle missing session gracefully', async () => {
      const url = 'https://test.supabase.co';
      const anonKey = 'eyJtest123';

      mockSupabaseInstance.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Auth session missing!' }
      });

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({
            error: { code: 'PGRST116' }
          })
        })
      });
      mockSupabaseInstance.from = mockFrom;

      client.initialize(url, anonKey);
      const result = await client.testConnection();

      expect(result.connected).toBe(true);
    });

    it('should return not connected on database error', async () => {
      const url = 'https://test.supabase.co';
      const anonKey = 'eyJtest123';

      mockSupabaseInstance.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({
            error: { code: 'PGRST500', message: 'Database connection failed' }
          })
        })
      });
      mockSupabaseInstance.from = mockFrom;

      client.initialize(url, anonKey);
      const result = await client.testConnection();

      expect(result.connected).toBe(false);
      expect(result.message).toContain('Database connection failed');
    });
  });

  describe('getProjectInfo', () => {
    it('should throw error when not initialized', async () => {
      await expect(client.getProjectInfo()).rejects.toThrow(IntegrationError);
      await expect(client.getProjectInfo()).rejects.toThrow('Not initialized');
    });

    it('should return project info when initialized', async () => {
      const url = 'https://test.supabase.co';
      const anonKey = 'eyJtest123';

      mockSupabaseInstance.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({
            error: { code: 'PGRST116' }
          })
        })
      });
      mockSupabaseInstance.from = mockFrom;

      client.initialize(url, anonKey);
      const result = await client.getProjectInfo();

      expect(result).toEqual({
        url: 'https://test.supabase.co',
        connected: true,
        version: 'v2'
      });
    });

    it('should return project info with connected false on connection failure', async () => {
      const url = 'https://test.supabase.co';
      const anonKey = 'eyJtest123';

      mockSupabaseInstance.auth.getSession.mockResolvedValue({
        data: null,
        error: { message: 'Connection failed' }
      });

      client.initialize(url, anonKey);
      const result = await client.getProjectInfo();

      expect(result.connected).toBe(false);
      expect(result.url).toBe('https://test.supabase.co');
    });
  });

  describe('getClient', () => {
    it('should return null when not initialized', () => {
      expect(client.getClient()).toBeNull();
    });

    it('should return client instance when initialized', () => {
      const url = 'https://test.supabase.co';
      const anonKey = 'eyJtest123';

      client.initialize(url, anonKey);

      expect(client.getClient()).toBe(mockSupabaseInstance);
    });
  });
});

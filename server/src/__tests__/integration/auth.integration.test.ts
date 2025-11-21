// Mock the Supabase client before importing
jest.mock('../../config/supabase.js');

import request from 'supertest';
import app from '../../index.js';
import { getSupabaseClient } from '../../config/supabase.js';

const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(),
};

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  describe('Authentication Flow', () => {
    it('should successfully authenticate with valid Supabase JWT token', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
      };

      const mockUserData = {
        id: mockUser.id,
        email: mockUser.email,
        username: 'testuser',
        full_name: 'Test User',
        role: 'member',
        balance: 100,
      };

      // Mock Supabase auth validation
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock user data fetch from database
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUserData,
              error: null,
            }),
          }),
        }),
      });

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer valid-supabase-token');

      expect(response.status).toBe(200);
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledWith('valid-supabase-token');
    });

    it('should reject request without authentication token', async () => {
      const response = await request(app)
        .get('/api/users/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTH_003');
      expect(response.body.error.message).toBe('No authentication token provided');
    });

    it('should reject request with invalid token format', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'InvalidFormat');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTH_003');
    });

    it('should reject request with invalid Supabase token', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTH_002');
      expect(response.body.error.message).toBe('Invalid or expired token');
    });

    it('should reject request with expired Supabase token', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Token expired' },
      });

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer expired-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTH_002');
    });

    it('should handle new user with valid token but not in database', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'newuser@example.com',
      };

      // Mock Supabase auth validation
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock user not found in database
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'No rows found' },
            }),
          }),
        }),
      });

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer valid-token');

      // Should still authenticate with default member role
      expect(response.status).toBe(200);
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledWith('valid-token');
    });
  });

  describe('Backend Token Validation', () => {
    it('should validate token correctly using Supabase client', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'member' },
              error: null,
            }),
          }),
        }),
      });

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer valid-token');

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledWith('valid-token');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(response.status).toBe(200);
    });

    it('should extract user information from validated token', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
      };

      const mockUserData = {
        id: mockUser.id,
        email: mockUser.email,
        username: 'testuser',
        full_name: 'Test User',
        role: 'admin',
        balance: 500,
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUserData,
              error: null,
            }),
          }),
        }),
      });

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(mockUser.email);
      expect(response.body.data.role).toBe('admin');
    });
  });
});

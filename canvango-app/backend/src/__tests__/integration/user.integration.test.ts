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

describe('User Management Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  const setupAuth = (role: string = 'member') => {
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
            data: { role },
            error: null,
          }),
        }),
      }),
    });

    return mockUser;
  };

  describe('GET /api/users/me', () => {
    it('should get current user profile successfully', async () => {
      const mockUser = setupAuth('member');
      const mockUserData = {
        id: mockUser.id,
        email: mockUser.email,
        username: 'testuser',
        full_name: 'Test User',
        role: 'member',
        balance: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

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
      expect(response.body.data.username).toBe('testuser');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/users/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/me', () => {
    it('should update current user profile successfully', async () => {
      const mockUser = setupAuth('member');
      const updatedData = {
        username: 'updateduser',
        full_name: 'Updated User',
      };

      const mockUpdatedUser = {
        id: mockUser.id,
        email: mockUser.email,
        username: updatedData.username,
        full_name: updatedData.full_name,
        role: 'member',
        balance: 100,
      };

      // Mock the update operation
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'member' },
              error: null,
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockUpdatedUser,
                error: null,
              }),
            }),
          }),
        }),
      });

      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', 'Bearer valid-token')
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put('/api/users/me')
        .send({ username: 'newusername' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Admin User Management Endpoints', () => {
    it('should allow admin to access user management', async () => {
      setupAuth('admin');

      const mockUsers = [
        { id: '1', username: 'user1', email: 'user1@example.com', role: 'member' },
        { id: '2', username: 'user2', email: 'user2@example.com', role: 'member' },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'admin' },
              error: null,
            }),
          }),
          order: jest.fn().mockResolvedValue({
            data: mockUsers,
            error: null,
            count: 2,
          }),
        }),
      });

      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should deny member access to admin endpoints', async () => {
      setupAuth('member');

      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer member-token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Role-Based Authorization', () => {
    it('should allow member role to access member endpoints', async () => {
      const mockUser = setupAuth('member');

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { 
                id: mockUser.id,
                email: mockUser.email,
                role: 'member',
                username: 'testuser',
                full_name: 'Test User',
                balance: 100,
              },
              error: null,
            }),
          }),
        }),
      });

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer member-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should allow admin role to access member endpoints', async () => {
      const mockUser = setupAuth('admin');

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { 
                id: mockUser.id,
                email: mockUser.email,
                role: 'admin',
                username: 'adminuser',
                full_name: 'Admin User',
                balance: 500,
              },
              error: null,
            }),
          }),
        }),
      });

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should deny guest role access to member endpoints', async () => {
      setupAuth('guest');

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', 'Bearer guest-token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});

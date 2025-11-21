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
  rpc: jest.fn(),
};

describe('Feature Endpoints Integration Tests', () => {
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

  describe('Claim Management Endpoints', () => {
    it('should create a new claim successfully', async () => {
      const mockUser = setupAuth('member');
      const claimData = {
        product_name: 'Test Product',
        issue_description: 'Product not working',
        contact_info: 'test@example.com',
      };

      const mockClaim = {
        id: '1',
        user_id: mockUser.id,
        ...claimData,
        status: 'PENDING',
        created_at: new Date().toISOString(),
      };

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'member' },
              error: null,
            }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockClaim,
              error: null,
            }),
          }),
        }),
      });

      const response = await request(app)
        .post('/api/claims')
        .set('Authorization', 'Bearer valid-token')
        .send(claimData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should fetch user claims', async () => {
      const mockUser = setupAuth('member');
      const mockClaims = [
        {
          id: '1',
          user_id: mockUser.id,
          product_name: 'Product 1',
          status: 'PENDING',
        },
        {
          id: '2',
          user_id: mockUser.id,
          product_name: 'Product 2',
          status: 'APPROVED',
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'member' },
              error: null,
            }),
            order: jest.fn().mockResolvedValue({
              data: mockClaims,
              error: null,
            }),
          }),
        }),
      });

      const response = await request(app)
        .get('/api/claims')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should allow admin to manage claims', async () => {
      setupAuth('admin');

      const mockClaims = [
        { id: '1', user_id: 'user1', product_name: 'Product 1', status: 'PENDING' },
        { id: '2', user_id: 'user2', product_name: 'Product 2', status: 'APPROVED' },
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
            data: mockClaims,
            error: null,
            count: 2,
          }),
        }),
      });

      const response = await request(app)
        .get('/api/admin/claims')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Tutorial Endpoints', () => {
    it('should fetch all tutorials', async () => {
      setupAuth('member');

      const mockTutorials = [
        {
          id: '1',
          title: 'Tutorial 1',
          content: 'Content 1',
          category: 'RMSO',
          views: 100,
        },
        {
          id: '2',
          title: 'Tutorial 2',
          content: 'Content 2',
          category: 'AKUN_BM',
          views: 50,
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'member' },
              error: null,
            }),
          }),
          order: jest.fn().mockResolvedValue({
            data: mockTutorials,
            error: null,
          }),
        }),
      });

      const response = await request(app)
        .get('/api/tutorials')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should increment tutorial views', async () => {
      setupAuth('member');

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

      mockSupabaseClient.rpc.mockResolvedValue({
        data: null,
        error: null,
      });

      const response = await request(app)
        .get('/api/tutorials/1')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
    });

    it('should allow admin to create tutorials', async () => {
      setupAuth('admin');

      const tutorialData = {
        title: 'New Tutorial',
        content: 'Tutorial content',
        category: 'RMSO',
      };

      const mockTutorial = {
        id: '1',
        ...tutorialData,
        views: 0,
        created_at: new Date().toISOString(),
      };

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'admin' },
              error: null,
            }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockTutorial,
              error: null,
            }),
          }),
        }),
      });

      const response = await request(app)
        .post('/api/admin/tutorials')
        .set('Authorization', 'Bearer admin-token')
        .send(tutorialData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Top-Up Endpoints', () => {
    it('should create a top-up request', async () => {
      const mockUser = setupAuth('member');
      const topupData = {
        amount: 100,
        payment_method: 'BANK_TRANSFER',
        payment_proof: 'proof.jpg',
      };

      const mockTopup = {
        id: '1',
        user_id: mockUser.id,
        ...topupData,
        status: 'PENDING',
        created_at: new Date().toISOString(),
      };

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'member' },
              error: null,
            }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockTopup,
              error: null,
            }),
          }),
        }),
      });

      const response = await request(app)
        .post('/api/topup')
        .set('Authorization', 'Bearer valid-token')
        .send(topupData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should fetch user top-up history', async () => {
      const mockUser = setupAuth('member');
      const mockTopups = [
        {
          id: '1',
          user_id: mockUser.id,
          amount: 100,
          status: 'APPROVED',
        },
        {
          id: '2',
          user_id: mockUser.id,
          amount: 50,
          status: 'PENDING',
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'member' },
              error: null,
            }),
            order: jest.fn().mockResolvedValue({
              data: mockTopups,
              error: null,
            }),
          }),
        }),
      });

      const response = await request(app)
        .get('/api/topup')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('System Settings Endpoints', () => {
    it('should allow admin to get system settings', async () => {
      setupAuth('admin');

      const mockSettings = [
        { key: 'maintenance_mode', value: 'false' },
        { key: 'min_topup_amount', value: '10' },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'admin' },
              error: null,
            }),
          }),
        }),
      });

      // Mock settings fetch
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'admin' },
              error: null,
            }),
          }),
        }),
      }).mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({
          data: mockSettings,
          error: null,
        }),
      });

      const response = await request(app)
        .get('/api/admin/settings')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should allow admin to update system settings', async () => {
      setupAuth('admin');

      const settingData = {
        key: 'maintenance_mode',
        value: 'true',
      };

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'admin' },
              error: null,
            }),
          }),
        }),
        upsert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: settingData,
              error: null,
            }),
          }),
        }),
      });

      const response = await request(app)
        .put('/api/admin/settings')
        .set('Authorization', 'Bearer admin-token')
        .send(settingData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should deny member access to system settings', async () => {
      setupAuth('member');

      const response = await request(app)
        .get('/api/admin/settings')
        .set('Authorization', 'Bearer member-token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Admin Audit Log Endpoints', () => {
    it('should allow admin to view audit logs', async () => {
      setupAuth('admin');

      const mockLogs = [
        {
          id: '1',
          admin_id: 'admin1',
          action: 'UPDATE_USER',
          details: 'Updated user role',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          admin_id: 'admin1',
          action: 'APPROVE_CLAIM',
          details: 'Approved claim #123',
          created_at: new Date().toISOString(),
        },
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
            data: mockLogs,
            error: null,
            count: 2,
          }),
        }),
      });

      const response = await request(app)
        .get('/api/admin/audit-logs')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should deny member access to audit logs', async () => {
      setupAuth('member');

      const response = await request(app)
        .get('/api/admin/audit-logs')
        .set('Authorization', 'Bearer member-token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      setupAuth('member');

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'member' },
              error: null,
            }),
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database connection failed' },
            }),
          }),
        }),
      });

      const response = await request(app)
        .get('/api/claims')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle invalid input data', async () => {
      setupAuth('member');

      const invalidClaimData = {
        // Missing required fields
        product_name: '',
      };

      const response = await request(app)
        .post('/api/claims')
        .set('Authorization', 'Bearer valid-token')
        .send(invalidClaimData);

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body.success).toBe(false);
    });
  });
});

// Mock the Supabase client before importing
jest.mock('../../config/supabase.js');

import request from 'supertest';
import app from '../../index.js';
import { getSupabaseClient } from '../../config/supabase.js';

// Create a fresh mock for each test
let mockSupabaseClient: any;

describe('Transaction Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create fresh mock instance
    mockSupabaseClient = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(),
      rpc: jest.fn(),
    };
    
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

  describe('GET /api/transactions', () => {
    it('should fetch transaction history successfully', async () => {
      const mockUser = setupAuth('member');
      const mockTransactions = [
        {
          id: '1',
          user_id: mockUser.id,
          product_name: 'Product 1',
          product_type: 'RMSO_NEW',
          quantity: 2,
          total_amount: 100,
          status: 'BERHASIL',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          user_id: mockUser.id,
          product_name: 'Product 2',
          product_type: 'AKUN_BM',
          quantity: 1,
          total_amount: 50,
          status: 'PENDING',
          created_at: new Date().toISOString(),
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
              data: mockTransactions,
              error: null,
              count: 2,
            }),
          }),
        }),
      });

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination for transactions', async () => {
      setupAuth('member');

      const mockTransactions = [
        { id: '1', product_name: 'Product 1', status: 'BERHASIL' },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'member' },
              error: null,
            }),
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: mockTransactions,
                error: null,
                count: 10,
              }),
            }),
          }),
        }),
      });

      const response = await request(app)
        .get('/api/transactions?page=1&limit=10')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should filter transactions by status', async () => {
      setupAuth('member');

      const mockTransactions = [
        { id: '1', product_name: 'Product 1', status: 'BERHASIL' },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'member' },
              error: null,
            }),
            order: jest.fn().mockResolvedValue({
              data: mockTransactions,
              error: null,
              count: 1,
            }),
          }),
        }),
      });

      const response = await request(app)
        .get('/api/transactions?status=BERHASIL')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/transactions');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for guest role', async () => {
      setupAuth('guest');

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', 'Bearer guest-token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Transaction Statistics', () => {
    it('should fetch transaction statistics for admin', async () => {
      setupAuth('admin');

      const mockStats = {
        total_transactions: 100,
        total_amount: 5000,
        pending_count: 10,
        success_count: 85,
        failed_count: 5,
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
      });

      // Mock RPC call for statistics
      mockSupabaseClient.rpc = jest.fn().mockResolvedValue({
        data: mockStats,
        error: null,
      });

      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Data Integrity', () => {
    it('should ensure transaction data integrity', async () => {
      const mockUser = setupAuth('member');
      const mockTransaction = {
        id: '1',
        user_id: mockUser.id,
        product_name: 'Test Product',
        product_type: 'RMSO_NEW',
        quantity: 2,
        total_amount: 100,
        status: 'BERHASIL',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'member' },
              error: null,
            }),
            order: jest.fn().mockResolvedValue({
              data: [mockTransaction],
              error: null,
              count: 1,
            }),
          }),
        }),
      });

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verify data integrity
      if (response.body.data && response.body.data.length > 0) {
        const transaction = response.body.data[0];
        expect(transaction).toHaveProperty('id');
        expect(transaction).toHaveProperty('product_name');
        expect(transaction).toHaveProperty('status');
        expect(transaction).toHaveProperty('total_amount');
      }
    });

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
              error: { message: 'Database error' },
            }),
          }),
        }),
      });

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Admin Transaction Management', () => {
    it('should allow admin to view all transactions', async () => {
      setupAuth('admin');

      const mockTransactions = [
        { id: '1', user_id: 'user1', product_name: 'Product 1', status: 'BERHASIL' },
        { id: '2', user_id: 'user2', product_name: 'Product 2', status: 'PENDING' },
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
            data: mockTransactions,
            error: null,
            count: 2,
          }),
        }),
      });

      const response = await request(app)
        .get('/api/admin/transactions')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should allow admin to update transaction status', async () => {
      setupAuth('admin');

      const mockTransaction = {
        id: '1',
        status: 'BERHASIL',
        product_name: 'Test Product',
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
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockTransaction,
                error: null,
              }),
            }),
          }),
        }),
      });

      const response = await request(app)
        .put('/api/admin/transactions/1')
        .set('Authorization', 'Bearer admin-token')
        .send({ status: 'BERHASIL' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});

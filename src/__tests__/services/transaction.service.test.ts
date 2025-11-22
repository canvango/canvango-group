import { supabase } from '@/features/member-area/services/supabase';
import {
  getUserTransactions,
  getRecentTransactions,
} from '@/features/member-area/services/transaction.service';
import type { Transaction } from '@/features/member-area/types/transaction';

// Mock Supabase client
jest.mock('@/features/member-area/services/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// Mock error handler
jest.mock('@/utils/supabaseErrorHandler', () => ({
  handleSupabaseOperation: jest.fn(async (fn) => {
    const result = await fn();
    if (result.error) throw result.error;
    // For getUserTransactions, return the full result with data and count
    if (result.data && 'data' in result.data && 'count' in result.data) {
      return result.data;
    }
    return result.data;
  }),
}));

describe('Transaction Service', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockTransactionRow = {
    id: 'txn-123',
    user_id: 'user-123',
    transaction_type: 'purchase',
    status: 'completed',
    amount: '100.00',
    product_id: 'product-123',
    payment_method: 'bank_transfer',
    payment_proof_url: 'https://example.com/proof.jpg',
    notes: 'Test transaction',
    metadata: { test: 'data' },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    completed_at: '2024-01-01T01:00:00Z',
    product: {
      id: 'product-123',
      product_name: 'Test Product',
      product_type: 'BM Account',
    },
  };

  const expectedTransaction: Transaction = {
    id: 'txn-123',
    userId: 'user-123',
    transactionType: 'purchase',
    type: 'purchase',
    status: 'completed',
    amount: 100.0,
    productId: 'product-123',
    productName: 'Test Product',
    product: {
      id: 'product-123',
      title: 'Test Product',
    },
    paymentMethod: 'bank_transfer',
    paymentProofUrl: 'https://example.com/proof.jpg',
    notes: 'Test transaction',
    metadata: { test: 'data' },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    completedAt: new Date('2024-01-01T01:00:00Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserTransactions', () => {
    it('should fetch user transactions with default pagination', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockRange = jest.fn().mockResolvedValue({
        data: [mockTransactionRow],
        error: null,
        count: 1,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ order: mockOrder });
      mockOrder.mockReturnValue({ range: mockRange });

      const result = await getUserTransactions();

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0]).toMatchObject({
        id: expectedTransaction.id,
        userId: expectedTransaction.userId,
        transactionType: expectedTransaction.transactionType,
        status: expectedTransaction.status,
        amount: expectedTransaction.amount,
      });
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        totalCount: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
      expect(mockSelect).toHaveBeenCalledWith(expect.any(String), { count: 'exact' });
      expect(mockEq).toHaveBeenCalledWith('user_id', mockUser.id);
      expect(mockRange).toHaveBeenCalledWith(0, 9);
    });

    it('should fetch user transactions with custom pagination', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockRange = jest.fn().mockResolvedValue({
        data: [mockTransactionRow],
        error: null,
        count: 25,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ order: mockOrder });
      mockOrder.mockReturnValue({ range: mockRange });

      const result = await getUserTransactions({ page: 2, limit: 5 });

      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        totalCount: 25,
        totalPages: 5,
        hasNextPage: true,
        hasPreviousPage: true,
      });
      expect(mockRange).toHaveBeenCalledWith(5, 9); // offset 5, limit 5
    });

    it('should filter transactions by status', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq1 = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockRange = jest.fn().mockReturnThis();
      const mockEq2 = jest.fn().mockResolvedValue({
        data: [mockTransactionRow],
        error: null,
        count: 1,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({ eq: mockEq1 });
      mockEq1.mockReturnValue({ order: mockOrder });
      mockOrder.mockReturnValue({ range: mockRange });
      mockRange.mockReturnValue({ eq: mockEq2 });

      const result = await getUserTransactions({ status: 'completed' });

      expect(result.transactions).toHaveLength(1);
      expect(mockEq2).toHaveBeenCalledWith('status', 'completed');
    });

    it('should handle empty transaction list', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockRange = jest.fn().mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ order: mockOrder });
      mockOrder.mockReturnValue({ range: mockRange });

      const result = await getUserTransactions();

      expect(result.transactions).toHaveLength(0);
      expect(result.pagination.totalCount).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it('should calculate pagination correctly for multiple pages', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockRange = jest.fn().mockResolvedValue({
        data: [mockTransactionRow],
        error: null,
        count: 100,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ order: mockOrder });
      mockOrder.mockReturnValue({ range: mockRange });

      // Test first page
      const result1 = await getUserTransactions({ page: 1, limit: 10 });
      expect(result1.pagination.hasNextPage).toBe(true);
      expect(result1.pagination.hasPreviousPage).toBe(false);

      // Test middle page
      const result2 = await getUserTransactions({ page: 5, limit: 10 });
      expect(result2.pagination.hasNextPage).toBe(true);
      expect(result2.pagination.hasPreviousPage).toBe(true);

      // Test last page
      const result3 = await getUserTransactions({ page: 10, limit: 10 });
      expect(result3.pagination.hasNextPage).toBe(false);
      expect(result3.pagination.hasPreviousPage).toBe(true);
    });

    it('should throw error when not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(getUserTransactions()).rejects.toThrow('Not authenticated');
    });

    it('should handle transactions without product', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const transactionWithoutProduct = {
        ...mockTransactionRow,
        product: null,
      };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockRange = jest.fn().mockResolvedValue({
        data: [transactionWithoutProduct],
        error: null,
        count: 1,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ order: mockOrder });
      mockOrder.mockReturnValue({ range: mockRange });

      const result = await getUserTransactions();

      expect(result.transactions[0].product).toBeUndefined();
      expect(result.transactions[0].productName).toBeUndefined();
    });
  });

  describe('getRecentTransactions', () => {
    it('should fetch recent completed transactions', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue({
        data: [mockTransactionRow],
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ order: mockOrder });
      mockOrder.mockReturnValue({ limit: mockLimit });

      const result = await getRecentTransactions();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: expectedTransaction.id,
        transactionType: expectedTransaction.transactionType,
        status: expectedTransaction.status,
        amount: expectedTransaction.amount,
      });
      expect(mockEq).toHaveBeenCalledWith('status', 'completed');
      expect(mockLimit).toHaveBeenCalledWith(10);
    });

    it('should handle empty recent transactions', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ order: mockOrder });
      mockOrder.mockReturnValue({ limit: mockLimit });

      const result = await getRecentTransactions();

      expect(result).toHaveLength(0);
    });

    it('should return empty array on error', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ order: mockOrder });
      mockOrder.mockReturnValue({ limit: mockLimit });

      const result = await getRecentTransactions();

      expect(result).toEqual([]);
    });

    it('should not include user_id in public transactions', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue({
        data: [mockTransactionRow],
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ order: mockOrder });
      mockOrder.mockReturnValue({ limit: mockLimit });

      const result = await getRecentTransactions();

      expect(result[0].userId).toBe(''); // Should be empty for public view
    });
  });

  describe('error handling', () => {
    it('should handle database errors in getUserTransactions', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockRange = jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Database connection failed'),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ order: mockOrder });
      mockOrder.mockReturnValue({ range: mockRange });

      await expect(getUserTransactions()).rejects.toThrow();
    });

    it('should gracefully handle errors in getRecentTransactions', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockRejectedValue(new Error('Network error'));

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ order: mockOrder });
      mockOrder.mockReturnValue({ limit: mockLimit });

      const result = await getRecentTransactions();

      expect(result).toEqual([]); // Should return empty array on error
    });
  });
});

// Mock the Supabase client before importing
jest.mock('../../config/supabase.js');

import { TransactionModel, CreateTransactionInput, ProductType, TransactionStatus } from '../../models/Transaction.model.js';
import { getSupabaseClient } from '../../config/supabase.js';

// Create a fresh mock for each test
let mockSupabaseClient: any;

describe('TransactionModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create fresh mock instance
    mockSupabaseClient = {
      from: jest.fn(),
      rpc: jest.fn(),
    };
    
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  describe('create', () => {
    it('should create a new transaction successfully', async () => {
      const transactionData: CreateTransactionInput = {
        user_id: '1',
        product_name: 'Test Product',
        product_type: 'RMSO_NEW',
        quantity: 2,
        total_amount: 100,
      };

      const mockTransaction = {
        id: '1',
        ...transactionData,
        status: 'PENDING' as TransactionStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockTransaction, error: null }),
          }),
        }),
      });

      const result = await TransactionModel.create(transactionData);

      expect(result).toEqual(mockTransaction);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('transactions');
    });
  });

  describe('findById', () => {
    it('should find transaction by id', async () => {
      const mockTransaction = {
        id: '1',
        user_id: '1',
        product_name: 'Test Product',
        status: 'BERHASIL' as TransactionStatus,
      };

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockTransaction, error: null }),
          }),
        }),
      });

      const result = await TransactionModel.findById('1');

      expect(result).toEqual(mockTransaction);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('transactions');
    });

    it('should return null when transaction not found', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { code: 'PGRST116', message: 'No rows found' } 
            }),
          }),
        }),
      });

      const result = await TransactionModel.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find transactions by user id', async () => {
      const mockTransactions = [
        { id: '1', user_id: '1', product_name: 'Product 1' },
        { id: '2', user_id: '1', product_name: 'Product 2' },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockTransactions, error: null }),
          }),
        }),
      });

      const result = await TransactionModel.findByUserId('1');

      expect(result).toEqual(mockTransactions);
      expect(result).toHaveLength(2);
    });

    it('should filter by status', async () => {
      const mockTransactions = [
        { id: '1', user_id: '1', status: 'BERHASIL' as TransactionStatus },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: mockTransactions, error: null }),
        }),
      });

      const result = await TransactionModel.findByUserId('1', { status: 'BERHASIL' });

      expect(result).toEqual(mockTransactions);
    });
  });

  describe('updateStatus', () => {
    it('should update transaction status', async () => {
      const mockTransaction = {
        id: '1',
        status: 'BERHASIL' as TransactionStatus,
        user_id: '1',
        product_name: 'Test Product',
      };

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockTransaction, error: null }),
            }),
          }),
        }),
      });

      const result = await TransactionModel.updateStatus('1', 'BERHASIL');

      expect(result).toEqual(mockTransaction);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('transactions');
    });
  });

  describe('validateTransactionData', () => {
    it('should validate correct transaction data', () => {
      const transactionData = {
        product_name: 'Test Product',
        product_type: 'RMSO_NEW' as ProductType,
        quantity: 2,
        total_amount: 100,
      };

      const result = TransactionModel.validateTransactionData(transactionData);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty product name', () => {
      const transactionData = {
        product_name: '',
      };

      const result = TransactionModel.validateTransactionData(transactionData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product name is required');
    });

    it('should reject invalid product type', () => {
      const transactionData = {
        product_type: 'INVALID_TYPE' as ProductType,
      };

      const result = TransactionModel.validateTransactionData(transactionData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid product type');
    });

    it('should reject quantity less than 1', () => {
      const transactionData = {
        quantity: 0,
      };

      const result = TransactionModel.validateTransactionData(transactionData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Quantity must be at least 1');
    });

    it('should reject negative total amount', () => {
      const transactionData = {
        total_amount: -10,
      };

      const result = TransactionModel.validateTransactionData(transactionData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Total amount cannot be negative');
    });
  });

  describe('count', () => {
    it('should count all transactions', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ count: 5, error: null }),
      });

      const result = await TransactionModel.count();

      expect(result).toBe(5);
    });

    it('should count transactions with filters', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count: 3, error: null }),
        }),
      });

      const result = await TransactionModel.count({ status: 'BERHASIL' });

      expect(result).toBe(3);
    });
  });

  describe('update', () => {
    it('should update transaction', async () => {
      const mockTransaction = {
        id: '1',
        product_name: 'Updated Product',
        status: 'BERHASIL' as TransactionStatus,
      };

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockTransaction, error: null }),
            }),
          }),
        }),
      });

      const result = await TransactionModel.update('1', { product_name: 'Updated Product' });

      expect(result).toEqual(mockTransaction);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('transactions');
    });
  });

  describe('delete', () => {
    it('should delete transaction', async () => {
      mockSupabaseClient.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      const result = await TransactionModel.delete('1');

      expect(result).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('transactions');
    });
  });

  describe('findAll', () => {
    it('should find all transactions', async () => {
      const mockTransactions = [
        { id: '1', user_id: '1', product_name: 'Product 1' },
        { id: '2', user_id: '2', product_name: 'Product 2' },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: mockTransactions, error: null }),
        }),
      });

      const result = await TransactionModel.findAll();

      expect(result).toEqual(mockTransactions);
      expect(result).toHaveLength(2);
    });
  });

  describe('getStatistics', () => {
    it('should get transaction statistics using RPC', async () => {
      const mockStatistics = {
        total_transactions: 150,
        total_amount: 45000,
        by_status: [
          { status: 'BERHASIL', count: 120, total_amount: 40000 },
          { status: 'PENDING', count: 20, total_amount: 4000 },
          { status: 'GAGAL', count: 10, total_amount: 1000 },
        ],
        by_product_type: [
          { product_type: 'RMSO_NEW', count: 50, total_amount: 15000 },
          { product_type: 'PERSONAL_TUA', count: 40, total_amount: 12000 },
        ],
      };

      mockSupabaseClient.rpc = jest.fn().mockResolvedValue({ 
        data: mockStatistics, 
        error: null 
      });

      const result = await TransactionModel.getStatistics();

      expect(result).toEqual({
        total_transactions: 150,
        total_amount: 45000,
        by_status: mockStatistics.by_status,
        by_product_type: mockStatistics.by_product_type,
      });
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('get_transaction_statistics', {
        p_user_id: null,
        p_start_date: null,
        p_end_date: null,
      });
    });

    it('should get statistics with user filter', async () => {
      const mockStatistics = {
        total_transactions: 10,
        total_amount: 5000,
        by_status: [{ status: 'BERHASIL', count: 10, total_amount: 5000 }],
        by_product_type: [{ product_type: 'RMSO_NEW', count: 10, total_amount: 5000 }],
      };

      mockSupabaseClient.rpc = jest.fn().mockResolvedValue({ 
        data: mockStatistics, 
        error: null 
      });

      const result = await TransactionModel.getStatistics({ user_id: 'user-123' });

      expect(result.total_transactions).toBe(10);
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('get_transaction_statistics', {
        p_user_id: 'user-123',
        p_start_date: null,
        p_end_date: null,
      });
    });

    it('should get statistics with date range filter', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const mockStatistics = {
        total_transactions: 50,
        total_amount: 15000,
        by_status: [],
        by_product_type: [],
      };

      mockSupabaseClient.rpc = jest.fn().mockResolvedValue({ 
        data: mockStatistics, 
        error: null 
      });

      const result = await TransactionModel.getStatistics({ 
        start_date: startDate, 
        end_date: endDate 
      });

      expect(result.total_transactions).toBe(50);
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('get_transaction_statistics', {
        p_user_id: null,
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
      });
    });

    it('should return empty statistics on error', async () => {
      mockSupabaseClient.rpc = jest.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' } 
      });

      const result = await TransactionModel.getStatistics();

      expect(result).toEqual({
        total_transactions: 0,
        total_amount: 0,
        by_status: [],
        by_product_type: [],
      });
    });
  });
});

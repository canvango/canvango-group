/**
 * Transactions Service
 * 
 * @module services/transactions
 * @description
 * Provides API functions for managing transaction history including fetching
 * transactions, retrieving transaction details, accessing purchased account
 * credentials, and fetching transaction statistics. Supports filtering by
 * type, date range, status, and pagination.
 * 
 * @example
 * ```typescript
 * import { fetchTransactions, fetchTransactionAccounts } from './services/transactions.service';
 * 
 * // Fetch transactions
 * const transactions = await fetchTransactions({ type: 'purchase', page: 1 });
 * 
 * // Get account credentials
 * const accounts = await fetchTransactionAccounts('txn_123');
 * ```
 */

import { supabase } from './supabase';
import { Transaction, TransactionType, Account } from '../types/transaction';
import type { PaginatedResponse } from './products.service';

// Re-export for convenience
export type { PaginatedResponse };

/**
 * Parameters for fetching transactions
 * 
 * @interface FetchTransactionsParams
 * @property {TransactionType} [type] - Filter by transaction type ('purchase' or 'topup')
 * @property {number} [page=1] - Page number to fetch
 * @property {number} [pageSize=10] - Number of items per page
 * @property {string} [startDate] - Filter transactions from this date (ISO format)
 * @property {string} [endDate] - Filter transactions until this date (ISO format)
 * @property {string} [status] - Filter by status ('pending', 'success', 'failed')
 */
export interface FetchTransactionsParams {
  type?: TransactionType;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
}

/**
 * Fetch transaction history with filters and pagination
 * 
 * @async
 * @function fetchTransactions
 * @param {FetchTransactionsParams} params - Filter and pagination parameters
 * @returns {Promise<PaginatedResponse<Transaction>>} Paginated list of transactions
 * 
 * @throws {Error} When API request fails
 * 
 * @example
 * ```typescript
 * // Fetch all transactions
 * const allTransactions = await fetchTransactions({ page: 1 });
 * 
 * // Fetch only purchases
 * const purchases = await fetchTransactions({
 *   type: 'purchase',
 *   status: 'success',
 *   page: 1,
 *   pageSize: 20
 * });
 * 
 * // Fetch transactions in date range
 * const rangeTransactions = await fetchTransactions({
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31'
 * });
 * ```
 */
export const fetchTransactions = async (
  params: FetchTransactionsParams
): Promise<PaginatedResponse<Transaction>> => {
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const offset = (page - 1) * pageSize;

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Build query
  let query = supabase
    .from('transactions')
    .select('*, product:products(*), purchases(*)', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Apply filters
  if (params.type) {
    query = query.eq('transaction_type', params.type);
  }
  if (params.status) {
    query = query.eq('status', params.status);
  }
  if (params.startDate) {
    query = query.gte('created_at', params.startDate);
  }
  if (params.endDate) {
    query = query.lte('created_at', params.endDate);
  }

  // Apply pagination
  query = query.range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data || [],
    pagination: {
      page,
      pageSize,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  };
};

/**
 * Fetch a single transaction by ID
 * 
 * @async
 * @function fetchTransactionById
 * @param {string} transactionId - Unique transaction identifier
 * @returns {Promise<Transaction>} Transaction details
 * 
 * @throws {Error} When transaction not found or API request fails
 * 
 * @example
 * ```typescript
 * const transaction = await fetchTransactionById('txn_123');
 * console.log(transaction.amount, transaction.status);
 * ```
 */
export const fetchTransactionById = async (transactionId: string): Promise<Transaction> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .select('*, product:products(*), purchases(*)')
    .eq('id', transactionId)
    .eq('user_id', user.id)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Transaction not found');

  return data;
};

/**
 * Fetch accounts associated with a transaction
 * 
 * @async
 * @function fetchTransactionAccounts
 * @param {string} transactionId - Transaction ID to fetch accounts for
 * @returns {Promise<Account[]>} List of purchased accounts with credentials
 * 
 * @throws {Error} When transaction not found or API request fails
 * 
 * @example
 * ```typescript
 * const accounts = await fetchTransactionAccounts('txn_123');
 * accounts.forEach(account => {
 *   console.log('URL:', account.credentials.url);
 *   console.log('Username:', account.credentials.username);
 * });
 * ```
 * 
 * @security
 * - Account credentials are sensitive data
 * - Ensure proper authentication before calling
 * - Do not log or expose credentials in production
 */
export const fetchTransactionAccounts = async (transactionId: string): Promise<Account[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('transaction_id', transactionId)
    .eq('user_id', user.id);

  if (error) throw error;

  // Map purchases to Account format
  return (data || []).map((purchase: any) => ({
    id: purchase.id,
    transactionId: purchase.transaction_id,
    type: 'bm' as const, // You may need to determine this from product
    credentials: purchase.account_details || {},
    status: purchase.status as 'active' | 'disabled' | 'claimed',
    warranty: {
      expiresAt: new Date(purchase.warranty_expires_at || ''),
      claimed: purchase.status === 'claimed',
    },
    createdAt: new Date(purchase.created_at),
  }));
};

/**
 * Transaction statistics summary
 * 
 * @interface TransactionStats
 * @property {number} totalPurchases - Total number of purchase transactions
 * @property {number} totalSpending - Total amount spent (in IDR)
 * @property {number} totalTopUps - Total amount topped up (in IDR)
 */
export interface TransactionStats {
  totalPurchases: number;
  totalSpending: number;
  totalTopUps: number;
}

/**
 * Fetch transaction statistics for the current user
 * 
 * @async
 * @function fetchTransactionStats
 * @returns {Promise<TransactionStats>} User's transaction statistics
 * 
 * @throws {Error} When API request fails
 * 
 * @example
 * ```typescript
 * const stats = await fetchTransactionStats();
 * console.log(`Total Purchases: ${stats.totalPurchases}`);
 * console.log(`Total Spending: Rp ${stats.totalSpending.toLocaleString()}`);
 * console.log(`Total Top-ups: Rp ${stats.totalTopUps.toLocaleString()}`);
 * ```
 */
export const fetchTransactionStats = async (): Promise<TransactionStats> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Use the new view for better performance
  const { data, error } = await supabase
    .from('transaction_summary_by_member')
    .select('total_accounts_purchased, total_spending, total_topup')
    .eq('user_id', user.id)
    .single();

  if (error) {
    // Fallback to old method if view is not available
    const { data: transactions, error: txnError } = await supabase
      .from('transactions')
      .select('transaction_type, amount, status')
      .eq('user_id', user.id)
      .eq('status', 'completed');

    if (txnError) throw txnError;

    const stats = {
      totalPurchases: 0,
      totalSpending: 0,
      totalTopUps: 0,
    };

    (transactions || []).forEach((txn: any) => {
      if (txn.transaction_type === 'purchase') {
        stats.totalPurchases++;
        stats.totalSpending += Number(txn.amount);
      } else if (txn.transaction_type === 'topup') {
        stats.totalTopUps += Number(txn.amount);
      }
    });

    return stats;
  }

  return {
    totalPurchases: Number(data.total_accounts_purchased) || 0,
    totalSpending: Number(data.total_spending) || 0,
    totalTopUps: Number(data.total_topup) || 0,
  };
};

/**
 * Extended transaction statistics from view
 * 
 * @interface ExtendedTransactionStats
 * @property {number} totalAccountsPurchased - Total accounts successfully purchased
 * @property {number} totalSpending - Total amount spent on purchases (completed)
 * @property {number} totalTopup - Total amount topped up (completed)
 * @property {number} totalTransactions - Total number of all transactions
 * @property {number} pendingTransactions - Number of pending transactions
 * @property {number} completedTransactions - Number of completed transactions
 * @property {number} failedTransactions - Number of failed transactions
 * @property {number} cancelledTransactions - Number of cancelled transactions
 */
export interface ExtendedTransactionStats {
  totalAccountsPurchased: number;
  totalSpending: number;
  totalTopup: number;
  totalTransactions: number;
  pendingTransactions: number;
  completedTransactions: number;
  failedTransactions: number;
  cancelledTransactions: number;
}

/**
 * Fetch extended transaction statistics from view
 * This uses the transaction_summary_by_member view which is optimized
 * and returns 0 for members without any transactions
 * 
 * @async
 * @function fetchExtendedTransactionStats
 * @returns {Promise<ExtendedTransactionStats>} Extended transaction statistics
 * 
 * @throws {Error} When API request fails
 * 
 * @example
 * ```typescript
 * const stats = await fetchExtendedTransactionStats();
 * console.log(`Total Accounts: ${stats.totalAccountsPurchased}`);
 * console.log(`Pending: ${stats.pendingTransactions}`);
 * console.log(`Completed: ${stats.completedTransactions}`);
 * ```
 */
export const fetchExtendedTransactionStats = async (): Promise<ExtendedTransactionStats> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('transaction_summary_by_member')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) throw error;

  return {
    totalAccountsPurchased: Number(data.total_accounts_purchased) || 0,
    totalSpending: Number(data.total_spending) || 0,
    totalTopup: Number(data.total_topup) || 0,
    totalTransactions: Number(data.total_transactions) || 0,
    pendingTransactions: Number(data.pending_transactions) || 0,
    completedTransactions: Number(data.completed_transactions) || 0,
    failedTransactions: Number(data.failed_transactions) || 0,
    cancelledTransactions: Number(data.cancelled_transactions) || 0,
  };
};

/**
 * Parameters for fetching member transactions using RPC function
 * 
 * @interface GetMemberTransactionsParams
 * @property {string} userId - User ID to fetch transactions for
 * @property {string} [transactionType] - Filter by transaction type
 * @property {string} [status] - Filter by status
 * @property {string} [dateStart] - Filter from this date (ISO format)
 * @property {string} [dateEnd] - Filter until this date (ISO format)
 * @property {number} [limit=50] - Maximum number of results
 * @property {number} [offset=0] - Offset for pagination
 */
export interface GetMemberTransactionsParams {
  userId: string;
  transactionType?: string;
  status?: string;
  dateStart?: string;
  dateEnd?: string;
  limit?: number;
  offset?: number;
}

/**
 * Fetch member transactions using the database function
 * This provides better performance and consistent data structure
 * 
 * @async
 * @function getMemberTransactions
 * @param {GetMemberTransactionsParams} params - Filter parameters
 * @returns {Promise<any[]>} List of transactions with product details
 * 
 * @throws {Error} When API request fails
 * 
 * @example
 * ```typescript
 * // Get all transactions for current user
 * const { data: { user } } = await supabase.auth.getUser();
 * const transactions = await getMemberTransactions({ userId: user.id });
 * 
 * // Get only completed purchases
 * const purchases = await getMemberTransactions({
 *   userId: user.id,
 *   transactionType: 'purchase',
 *   status: 'completed',
 *   limit: 20
 * });
 * 
 * // Get transactions in date range
 * const rangeTransactions = await getMemberTransactions({
 *   userId: user.id,
 *   dateStart: '2025-11-01T00:00:00Z',
 *   dateEnd: '2025-11-30T23:59:59Z'
 * });
 * ```
 */
export const getMemberTransactions = async (
  params: GetMemberTransactionsParams
): Promise<any[]> => {
  const { data, error } = await supabase.rpc('get_member_transactions', {
    p_user_id: params.userId,
    p_transaction_type: params.transactionType || null,
    p_status: params.status || null,
    p_date_start: params.dateStart || null,
    p_date_end: params.dateEnd || null,
    p_limit: params.limit || 50,
    p_offset: params.offset || 0,
  });

  if (error) throw error;

  return data || [];
};

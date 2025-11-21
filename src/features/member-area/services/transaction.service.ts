import api from '../utils/api';
import type { Transaction } from '../types/transaction';

interface GetTransactionsParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
}

interface GetTransactionsResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Get user transactions with pagination
 */
export async function getUserTransactions(
  params: GetTransactionsParams = {}
): Promise<GetTransactionsResponse> {
  const { page = 1, limit = 10, status } = params;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(status && { status })
  });

  try {
    const response = await api.get<{ success: boolean; data: GetTransactionsResponse }>(
      `/transactions?${queryParams.toString()}`
    );
    
    // Backend returns: { success: true, data: { transactions: [...], pagination: {...} } }
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      return {
        transactions: responseData.data.transactions || [],
        pagination: responseData.data.pagination || {
          page,
          limit,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        }
      };
    }
    
    // Fallback for unexpected format
    return {
      transactions: [],
      pagination: {
        page,
        limit,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      }
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

/**
 * Get recent transactions from all users (public - for dashboard)
 */
export async function getRecentTransactions(): Promise<Transaction[]> {
  try {
    const response = await api.get<{ success: boolean; data: { transactions: Transaction[] } }>(
      '/transactions/recent?limit=10'
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data.transactions || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    return [];
  }
}

import apiClient from './api';

// Types
export interface Transaction {
  id: string;
  type: 'account_purchase' | 'topup';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  productName?: string;
  quantity?: number;
  accounts?: Account[];
  warranty?: {
    status: 'active' | 'expired' | 'claimed';
    expiresAt: string;
  };
}

export interface Account {
  id: string;
  email: string;
  password: string;
  additionalInfo?: string;
}

export interface TransactionFilters {
  type?: 'account_purchase' | 'topup';
  status?: 'pending' | 'completed' | 'failed';
  startDate?: string;
  endDate?: string;
  warranty?: 'active' | 'expired' | 'claimed';
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
}

// Transactions Service
export const transactionsService = {
  /**
   * Fetch transactions with filters and pagination
   */
  async fetchTransactions(
    filters: TransactionFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<TransactionsResponse> {
    const params = new URLSearchParams();
    
    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    // Add pagination
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await apiClient.get(`/transactions?${params.toString()}`);
    return response.data;
  },

  /**
   * Fetch single transaction by ID
   */
  async fetchTransactionById(id: string): Promise<Transaction> {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data;
  },

  /**
   * Get transaction accounts (for account purchases)
   */
  async getTransactionAccounts(transactionId: string): Promise<Account[]> {
    const response = await apiClient.get(`/transactions/${transactionId}/accounts`);
    return response.data;
  },

  /**
   * Get transaction statistics
   */
  async getStats(): Promise<{
    totalTransactions: number;
    totalSpent: number;
    totalTopUp: number;
    successRate: number;
  }> {
    const response = await apiClient.get('/transactions/stats');
    return response.data;
  }
};

export default transactionsService;

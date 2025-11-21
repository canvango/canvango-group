import apiClient from './api';

export type TransactionStatus = 'BERHASIL' | 'PENDING' | 'GAGAL';
export type ProductType = 'RMSO_NEW' | 'PERSONAL_TUA' | 'RM_NEW' | 'RM_TUA' | 'J202_VERIFIED_BM';

export interface Transaction {
  id: string;
  user_id: string;
  product_name: string;
  product_type: ProductType;
  quantity: number;
  total_amount: number;
  status: TransactionStatus;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username: string;
    email: string;
    full_name: string;
  };
}

export interface GetTransactionsParams {
  status?: TransactionStatus;
  product_type?: ProductType;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface GetTransactionsResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateTransactionStatusData {
  status: TransactionStatus;
}

export interface RefundTransactionData {
  reason?: string;
}

export interface RefundTransactionResponse {
  transaction: Transaction;
  refund_amount: number;
  new_user_balance: number;
}

/**
 * Admin Transactions Service
 * Handles administrative operations for transactions
 */
export const adminTransactionsService = {
  /**
   * Get all transactions with filtering and pagination
   */
  getAllTransactions: async (params?: GetTransactionsParams): Promise<GetTransactionsResponse> => {
    const response = await apiClient.get('/admin/transactions', { params });
    return response.data.data;
  },

  /**
   * Update transaction status
   */
  updateTransactionStatus: async (
    transactionId: string,
    data: UpdateTransactionStatusData
  ): Promise<Transaction> => {
    const response = await apiClient.put(`/admin/transactions/${transactionId}`, data);
    return response.data.data;
  },

  /**
   * Process refund for a transaction
   */
  refundTransaction: async (
    transactionId: string,
    data?: RefundTransactionData
  ): Promise<RefundTransactionResponse> => {
    const response = await apiClient.post(`/admin/transactions/${transactionId}/refund`, data || {});
    return response.data.data;
  },

  /**
   * Export transactions to CSV
   */
  exportTransactions: async (params?: GetTransactionsParams): Promise<Blob> => {
    const response = await apiClient.get('/admin/transactions/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

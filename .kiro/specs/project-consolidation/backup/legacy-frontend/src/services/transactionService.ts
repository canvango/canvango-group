import api from '../utils/api';
import { TransactionResponse, TransactionStatus } from '../types/transaction.types';

export const transactionService = {
  /**
   * Get user transactions with pagination
   */
  getUserTransactions: async (
    page: number = 1,
    limit: number = 10,
    status?: TransactionStatus
  ): Promise<TransactionResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      params.append('status', status);
    }

    const response = await api.get(`/transactions?${params.toString()}`);
    return response.data.data;
  },
};

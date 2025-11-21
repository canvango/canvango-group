import apiClient from './api';

// Types
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'ewallet' | 'bank_transfer';
  icon?: string;
  fee: number;
  minAmount: number;
  maxAmount: number;
}

export interface TopUpRequest {
  amount: number;
  paymentMethodId: string;
}

export interface TopUpResponse {
  success: boolean;
  orderId: string;
  paymentUrl?: string;
  instructions?: string;
  message: string;
}

// TopUp Service
export const topupService = {
  /**
   * Get available payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await apiClient.get('/topup/payment-methods');
    return response.data;
  },

  /**
   * Process top up request
   */
  async processTopUp(data: TopUpRequest): Promise<TopUpResponse> {
    const response = await apiClient.post('/topup', data);
    return response.data;
  },

  /**
   * Get top up history
   */
  async getTopUpHistory(page: number = 1, limit: number = 20): Promise<{
    topups: Array<{
      id: string;
      amount: number;
      status: 'pending' | 'completed' | 'failed';
      paymentMethod: string;
      createdAt: string;
    }>;
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await apiClient.get(`/topup/history?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Get current user balance
   */
  async getBalance(): Promise<{ balance: number }> {
    const response = await apiClient.get('/user/balance');
    return response.data;
  }
};

export default topupService;

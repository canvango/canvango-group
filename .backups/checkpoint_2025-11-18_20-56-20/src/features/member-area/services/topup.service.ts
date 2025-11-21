import apiClient from './api';

export interface PaymentMethod {
  id: string;
  name: string;
  logo: string;
  category: 'ewallet' | 'va';
  enabled: boolean;
}

export interface TopUpData {
  amount: number;
  paymentMethod: string;
}

export interface TopUpResponse {
  transactionId: string;
  status: 'pending' | 'success' | 'failed';
  paymentUrl?: string;
  message: string;
}

/**
 * Process a top-up request
 */
export const processTopUp = async (data: TopUpData): Promise<TopUpResponse> => {
  const response = await apiClient.post<TopUpResponse>('/topup', data);
  return response.data;
};

/**
 * Fetch available payment methods
 */
export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await apiClient.get<PaymentMethod[]>('/topup/methods');
  return response.data;
};

/**
 * Fetch top-up history
 */
export interface TopUpHistory {
  id: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: Date;
}

export const fetchTopUpHistory = async (page: number = 1, pageSize: number = 10) => {
  const response = await apiClient.get('/topup/history', {
    params: { page, pageSize },
  });
  return response.data;
};

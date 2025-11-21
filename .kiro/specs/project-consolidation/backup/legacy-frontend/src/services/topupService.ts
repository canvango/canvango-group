import api from '../utils/api';

export interface TopUpRequest {
  amount: number;
  payment_method: string;
}

export interface TopUp {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TopUpResponse {
  topups: TopUp[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

/**
 * Get available payment methods
 */
export const getPaymentMethods = async (): Promise<string[]> => {
  const response = await api.get('/topup/methods');
  return response.data.data;
};

/**
 * Create a new top up request
 */
export const createTopUp = async (topUpData: TopUpRequest): Promise<TopUp> => {
  const response = await api.post('/topup', topUpData);
  return response.data.data;
};

/**
 * Get user's top up history
 */
export const getUserTopUps = async (params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<TopUpResponse> => {
  const response = await api.get('/topup', { params });
  return response.data.data;
};

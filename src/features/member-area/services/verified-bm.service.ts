import apiClient from './api';
import { VerifiedBMOrder, VerifiedBMOrderStats } from '../types/verified-bm';

/**
 * Fetch verified BM order statistics
 */
export const fetchVerifiedBMStats = async (): Promise<VerifiedBMOrderStats> => {
  const response = await apiClient.get<VerifiedBMOrderStats>('/verified-bm/stats');
  return response.data;
};

/**
 * Fetch verified BM orders
 */
export const fetchVerifiedBMOrders = async (): Promise<VerifiedBMOrder[]> => {
  const response = await apiClient.get<VerifiedBMOrder[]>('/verified-bm/orders');
  return response.data;
};

/**
 * Submit a new verified BM order
 */
export interface SubmitVerifiedBMOrderData {
  quantity: number;
  urls: string[];
}

export interface SubmitVerifiedBMOrderResponse {
  orderId: string;
  status: 'pending' | 'success' | 'failed';
  message: string;
}

export const submitVerifiedBMOrder = async (
  data: SubmitVerifiedBMOrderData
): Promise<SubmitVerifiedBMOrderResponse> => {
  const response = await apiClient.post<SubmitVerifiedBMOrderResponse>(
    '/verified-bm/orders',
    data
  );
  return response.data;
};

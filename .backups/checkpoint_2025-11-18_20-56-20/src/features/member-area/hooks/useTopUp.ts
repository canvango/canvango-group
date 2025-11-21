import { useMutation, useQuery, useQueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import {
  processTopUp,
  fetchPaymentMethods,
  fetchTopUpHistory,
  TopUpData,
  TopUpResponse,
  PaymentMethod,
} from '../services/topup.service';

/**
 * Hook to handle top-up processing
 */
export const useTopUp = (): UseMutationResult<TopUpResponse, Error, TopUpData> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: processTopUp,
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactionStats'] });
      queryClient.invalidateQueries({ queryKey: ['topupHistory'] });
    },
  });
};

/**
 * Hook to fetch available payment methods
 */
export const usePaymentMethods = (): UseQueryResult<PaymentMethod[], Error> => {
  return useQuery({
    queryKey: ['paymentMethods'],
    queryFn: fetchPaymentMethods,
    staleTime: 10 * 60 * 1000, // 10 minutes - payment methods don't change often
  });
};

/**
 * Hook to fetch top-up history
 */
export const useTopUpHistory = (page: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: ['topupHistory', page, pageSize],
    queryFn: () => fetchTopUpHistory(page, pageSize),
    staleTime: 2 * 60 * 1000,
  });
};

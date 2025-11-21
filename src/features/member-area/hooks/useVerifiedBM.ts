import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchVerifiedBMStats,
  fetchVerifiedBMOrders,
  submitVerifiedBMOrder,
  SubmitVerifiedBMOrderData
} from '../services/verified-bm.service';

/**
 * Hook to fetch verified BM order statistics
 * Note: Will return empty data for guest users
 */
export const useVerifiedBMStats = () => {
  return useQuery({
    queryKey: ['verified-bm-stats'],
    queryFn: fetchVerifiedBMStats,
    staleTime: 30000, // 30 seconds
    retry: false, // Don't retry on auth errors
  });
};

/**
 * Hook to fetch verified BM orders
 * Note: Will return empty data for guest users
 */
export const useVerifiedBMOrders = () => {
  return useQuery({
    queryKey: ['verified-bm-orders'],
    queryFn: fetchVerifiedBMOrders,
    staleTime: 30000, // 30 seconds
    retry: false, // Don't retry on auth errors
  });
};

/**
 * Hook to submit a verified BM order
 */
export const useSubmitVerifiedBMOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitVerifiedBMOrderData) => submitVerifiedBMOrder(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['verified-bm-stats'] });
      queryClient.invalidateQueries({ queryKey: ['verified-bm-orders'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

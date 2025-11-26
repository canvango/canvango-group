import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchVerifiedBMStats,
  fetchVerifiedBMRequests,
  submitVerifiedBMRequest
} from '../services';

/**
 * Hook to fetch verified BM request statistics
 * Automatically fetches when component mounts and refetches on mount
 */
export const useVerifiedBMStats = () => {
  return useQuery({
    queryKey: ['verified-bm-stats'],
    queryFn: fetchVerifiedBMStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2, // Retry 2 times on failure
    refetchOnMount: 'always', // Always refetch on mount (even if data is fresh)
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: true, // Refetch when reconnecting
  });
};

/**
 * Hook to fetch verified BM requests
 * Automatically fetches when component mounts and refetches on mount
 */
export const useVerifiedBMRequests = () => {
  return useQuery({
    queryKey: ['verified-bm-requests'],
    queryFn: fetchVerifiedBMRequests,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2, // Retry 2 times on failure
    refetchOnMount: 'always', // Always refetch on mount (even if data is fresh)
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: true, // Refetch when reconnecting
  });
};

/**
 * Hook to submit verified BM request
 * Note: Balance is now managed by AuthContext via Realtime subscription
 */
export const useSubmitVerifiedBMRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quantity, urls }: { quantity: number; urls: string[] }) => 
      submitVerifiedBMRequest(quantity, urls),
    onSuccess: () => {
      // Invalidate and refetch stats and requests
      queryClient.invalidateQueries({ queryKey: ['verified-bm-stats'] });
      queryClient.invalidateQueries({ queryKey: ['verified-bm-requests'] });
      // Balance will be updated automatically via Realtime subscription in AuthContext
    },
  });
};

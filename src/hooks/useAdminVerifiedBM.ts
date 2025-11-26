import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAllVerifiedBMRequests,
  fetchAdminVerifiedBMStats,
  updateRequestStatus,
  refundRequest,
  getRequestDetails,
  updateURLStatus,
  refundURL
} from '@/features/member-area/services/admin-verified-bm.service';

/**
 * Hook to fetch all verified BM requests (admin)
 */
export const useAdminVerifiedBMRequests = (filters?: {
  status?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['admin-verified-bm-requests', filters],
    queryFn: () => fetchAllVerifiedBMRequests(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnMount: 'always', // Always refetch on mount
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch admin statistics
 */
export const useAdminVerifiedBMStats = () => {
  return useQuery({
    queryKey: ['admin-verified-bm-stats'],
    queryFn: fetchAdminVerifiedBMStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnMount: 'always', // Always refetch on mount
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to get request details
 */
export const useRequestDetails = (requestId: string) => {
  return useQuery({
    queryKey: ['verified-bm-request', requestId],
    queryFn: () => getRequestDetails(requestId),
    enabled: !!requestId,
    staleTime: 60000, // 1 minute
  });
};

/**
 * Hook to update request status
 */
export const useUpdateRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      status,
      adminNotes
    }: {
      requestId: string;
      status: 'processing' | 'completed';
      adminNotes?: string;
    }) => updateRequestStatus(requestId, status, adminNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verified-bm-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-verified-bm-stats'] });
      queryClient.invalidateQueries({ queryKey: ['verified-bm-request'] });
    },
  });
};

/**
 * Hook to refund request
 */
export const useRefundRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      adminNotes
    }: {
      requestId: string;
      adminNotes: string;
    }) => refundRequest(requestId, adminNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verified-bm-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-verified-bm-stats'] });
      queryClient.invalidateQueries({ queryKey: ['verified-bm-request'] });
    },
  });
};

/**
 * Hook to update individual URL status
 */
export const useUpdateURLStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      urlId,
      status,
      adminNotes
    }: {
      urlId: string;
      status: 'processing' | 'completed' | 'failed';
      adminNotes?: string;
    }) => updateURLStatus(urlId, status, adminNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verified-bm-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-verified-bm-stats'] });
      queryClient.invalidateQueries({ queryKey: ['verified-bm-request'] });
    },
  });
};

/**
 * Hook to refund individual URL
 */
export const useRefundURL = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      urlId,
      adminNotes
    }: {
      urlId: string;
      adminNotes: string;
    }) => refundURL(urlId, adminNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verified-bm-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-verified-bm-stats'] });
      queryClient.invalidateQueries({ queryKey: ['verified-bm-request'] });
    },
  });
};

/**
 * React Hook for Tripay Payment Gateway
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as tripayService from '../services/tripay.service';
import { useNotification } from '../shared/hooks/useNotification';

/**
 * Hook to fetch available payment methods
 */
export function usePaymentMethods() {
  return useQuery({
    queryKey: ['tripay', 'payment-methods'],
    queryFn: tripayService.getPaymentMethods,
    staleTime: 1000 * 60 * 60, // 1 hour - payment methods don't change often
    retry: 2,
  });
}

/**
 * Hook to create a new payment
 * Note: Auto-redirect removed - payment instructions shown in-app
 */
export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tripayService.createPayment,
    onSuccess: () => {
      // Invalidate transactions to refresh the list
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    // Error handling moved to component level for better UX control
  });
}

/**
 * Hook to check payment status
 */
export function usePaymentStatus(reference: string | null) {
  return useQuery({
    queryKey: ['tripay', 'payment-status', reference],
    queryFn: () => tripayService.checkPaymentStatus(reference!),
    enabled: !!reference,
    refetchInterval: (data) => {
      // Stop polling if payment is completed or failed
      if (data?.status === 'PAID' || data?.status === 'EXPIRED' || data?.status === 'FAILED') {
        return false;
      }
      // Poll every 10 seconds for pending payments
      return 10000;
    },
  });
}

// ============================================================================
// Open Payment Hooks
// ============================================================================

/**
 * Hook to create Open Payment (permanent pay code)
 */
export function useCreateOpenPayment() {
  const queryClient = useQueryClient();
  const notification = useNotification();

  return useMutation({
    mutationFn: tripayService.createOpenPayment,
    onSuccess: (data) => {
      // Invalidate open payments list to refresh
      queryClient.invalidateQueries({ queryKey: ['open-payments'] });
      
      notification.success('Kode pembayaran permanen berhasil dibuat');
    },
    onError: (error: Error) => {
      notification.error(error.message || 'Gagal membuat Open Payment');
    },
  });
}

/**
 * Hook to get Open Payment detail by UUID
 */
export function useOpenPaymentDetail(uuid: string | null) {
  return useQuery({
    queryKey: ['open-payment', uuid],
    queryFn: () => tripayService.getOpenPaymentDetail(uuid!),
    enabled: !!uuid,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to get Open Payment transactions (payment history)
 */
export function useOpenPaymentTransactions(
  uuid: string | null,
  filters?: {
    reference?: string;
    merchantRef?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    perPage?: number;
  }
) {
  return useQuery({
    queryKey: ['open-payment-transactions', uuid, filters],
    queryFn: () => tripayService.getOpenPaymentTransactions(uuid!, filters),
    enabled: !!uuid,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 2,
  });
}

/**
 * Hook to get list of Open Payments for current user
 */
export function useOpenPaymentList(filters?: {
  status?: 'ACTIVE' | 'EXPIRED';
  paymentMethod?: string;
}) {
  return useQuery({
    queryKey: ['open-payments', filters],
    queryFn: () => tripayService.getOpenPaymentList(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

// ============================================================================
// Transaction Detail Hooks
// ============================================================================

/**
 * Hook to get transaction detail from Tripay API
 * Fetches full transaction details including payment instructions
 */
export function useTransactionDetail(reference: string | null) {
  return useQuery({
    queryKey: ['transaction-detail', reference],
    queryFn: () => tripayService.getTransactionDetail(reference!),
    enabled: !!reference,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook for quick status check with polling
 * Automatically polls status for UNPAID transactions
 */
export function useQuickStatusCheck(reference: string | null, enablePolling: boolean = true) {
  const notification = useNotification();

  return useQuery({
    queryKey: ['quick-status', reference],
    queryFn: () => tripayService.quickCheckStatus(reference!),
    enabled: !!reference && enablePolling,
    refetchInterval: (data) => {
      // Stop polling if payment is completed, expired, or failed
      if (data?.status === 'PAID' || data?.status === 'EXPIRED' || data?.status === 'FAILED') {
        // Show notification when status changes to final state
        if (data.status === 'PAID') {
          notification.success('Pembayaran berhasil!');
        } else if (data.status === 'EXPIRED') {
          notification.warning('Transaksi telah kadaluarsa');
        } else if (data.status === 'FAILED') {
          notification.error('Pembayaran gagal');
        }
        return false;
      }
      // Poll every 30 seconds for pending payments
      return 30000;
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// ============================================================================
// Admin Hooks
// ============================================================================

/**
 * Hook to get all transactions for admin
 * Supports filtering by status, payment method, user, and date range
 */
export function useAllTransactions(filters?: {
  status?: string;
  paymentMethod?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
}) {
  return useQuery({
    queryKey: ['admin-transactions', filters],
    queryFn: () => tripayService.getAllTransactions(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 2,
  });
}

/**
 * Hook to sync transaction status from Tripay API
 * Used by admin to manually refresh transaction status
 */
export function useSyncTransactionStatus() {
  const queryClient = useQueryClient();
  const notification = useNotification();

  return useMutation({
    mutationFn: (reference: string) => tripayService.syncTransactionStatus(reference),
    onSuccess: () => {
      // Invalidate all transaction queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-detail'] });
      
      notification.success('Status berhasil disinkronkan');
    },
    onError: (error: Error) => {
      notification.error(error.message || 'Gagal menyinkronkan status');
    },
  });
}

// ============================================================================
// Payment Channel Management Hooks
// ============================================================================

/**
 * Hook to get payment channels from database
 */
export function usePaymentChannelsFromDB(includeDisabled = false) {
  return useQuery({
    queryKey: ['payment-channels-db', includeDisabled],
    queryFn: async () => {
      const { getPaymentChannelsFromDB } = await import('@/services/tripayChannels.service');
      return getPaymentChannelsFromDB(includeDisabled);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to sync payment channels from Tripay API
 */
export function useSyncPaymentChannels() {
  const queryClient = useQueryClient();
  const notification = useNotification();

  return useMutation({
    mutationFn: async () => {
      const { syncPaymentChannels } = await import('@/services/tripayChannels.service');
      return syncPaymentChannels();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['payment-channels-db'] });
      queryClient.invalidateQueries({ queryKey: ['tripay', 'payment-methods'] });
      
      notification.success(
        `Sync berhasil: ${result.added} ditambahkan, ${result.updated} diperbarui`
      );
    },
    onError: (error: Error) => {
      notification.error(error.message || 'Gagal sync payment channels');
    },
  });
}

/**
 * Hook to update channel enabled status
 */
export function useUpdateChannelStatus() {
  const queryClient = useQueryClient();
  const notification = useNotification();

  return useMutation({
    mutationFn: async ({ code, isEnabled }: { code: string; isEnabled: boolean }) => {
      const { updateChannelStatus } = await import('@/services/tripayChannels.service');
      return updateChannelStatus(code, isEnabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-channels-db'] });
      queryClient.invalidateQueries({ queryKey: ['tripay', 'payment-methods'] });
      
      notification.success('Status channel berhasil diperbarui');
    },
    onError: (error: Error) => {
      notification.error(error.message || 'Gagal memperbarui status channel');
    },
  });
}

/**
 * Hook to get last sync time
 */
export function useLastSyncTime() {
  return useQuery({
    queryKey: ['payment-channels-last-sync'],
    queryFn: async () => {
      const { getLastSyncTime } = await import('@/services/tripayChannels.service');
      return getLastSyncTime();
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

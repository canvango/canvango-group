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
 */
export function useCreatePayment() {
  const queryClient = useQueryClient();
  const notification = useNotification();

  return useMutation({
    mutationFn: tripayService.createPayment,
    onSuccess: (data) => {
      // Invalidate transactions to refresh the list
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      
      notification.success('Payment created successfully');
      
      // Open checkout URL in new tab
      if (data.data.checkout_url) {
        window.open(data.data.checkout_url, '_blank');
      }
    },
    onError: (error: Error) => {
      notification.error(error.message || 'Failed to create payment');
    },
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

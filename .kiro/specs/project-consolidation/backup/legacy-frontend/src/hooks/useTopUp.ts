import { useState } from 'react';
import { topupService, type TopUpRequest, type PaymentMethod } from '../services/topup.service';

interface UseTopUpReturn {
  processTopUp: (data: TopUpRequest) => Promise<void>;
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: string | null;
  success: boolean;
  fetchPaymentMethods: () => Promise<void>;
}

/**
 * useTopUp - Hook for handling top-up operations
 */
export const useTopUp = (): UseTopUpReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const fetchPaymentMethods = async () => {
    try {
      const methods = await topupService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment methods');
    }
  };

  const processTopUp = async (data: TopUpRequest) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await topupService.processTopUp(data);
      
      if (result.success) {
        setSuccess(true);
        // Optionally redirect to payment URL
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
        }
      } else {
        throw new Error(result.message || 'Top-up failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process top-up');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    processTopUp,
    paymentMethods,
    loading,
    error,
    success,
    fetchPaymentMethods
  };
};

export default useTopUp;

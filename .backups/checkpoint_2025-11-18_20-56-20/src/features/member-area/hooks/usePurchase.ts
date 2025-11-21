import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { purchaseProduct, PurchaseProductData, PurchaseResponse } from '../services/products.service';

/**
 * Hook to handle product purchase
 */
export const usePurchase = (): UseMutationResult<
  PurchaseResponse,
  Error,
  PurchaseProductData
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseProduct,
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['productStats'] });
    },
  });
};

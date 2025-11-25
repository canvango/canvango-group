import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import * as service from '../services/productAccount.service';
import { ProductAccountField, ProductAccount } from '../types/productAccount';

// ===== FIELD HOOKS =====
export const useAccountFields = (productId: string): UseQueryResult<ProductAccountField[], Error> => {
  return useQuery({
    queryKey: ['accountFields', productId],
    queryFn: () => service.fetchAccountFields(productId),
    enabled: false, // DISABLED: Backend API not available (frontend-only app)
    staleTime: 2 * 60 * 1000
  });
};

export const useCreateAccountField = (): UseMutationResult<ProductAccountField, Error, Omit<ProductAccountField, 'id' | 'created_at' | 'updated_at'>> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: service.createAccountField,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accountFields', variables.product_id] });
    }
  });
};

export const useUpdateAccountField = (): UseMutationResult<ProductAccountField, Error, { id: string; field: Partial<ProductAccountField> }> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, field }) => service.updateAccountField(id, field),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountFields'] });
    }
  });
};

export const useDeleteAccountField = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: service.deleteAccountField,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountFields'] });
    }
  });
};

export const useBulkCreateFields = (): UseMutationResult<ProductAccountField[], Error, { productId: string; fields: any[] }> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, fields }) => service.bulkCreateFields(productId, fields),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accountFields', variables.productId] });
    }
  });
};

// ===== ACCOUNT HOOKS =====
export const useAccounts = (productId: string, status?: 'available' | 'sold'): UseQueryResult<service.FetchAccountsResponse, Error> => {
  return useQuery({
    queryKey: ['accounts', productId, status],
    queryFn: () => service.fetchAccounts(productId, status),
    enabled: false, // DISABLED: Backend API not available (frontend-only app)
    staleTime: 30 * 1000 // 30 seconds - refresh more often for stock updates
  });
};

export const useCreateAccount = (): UseMutationResult<ProductAccount, Error, { productId: string; accountData: Record<string, any> }> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, accountData }) => service.createAccount(productId, accountData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accounts', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
};

export const useUpdateAccount = (): UseMutationResult<ProductAccount, Error, { id: string; accountData: Record<string, any> }> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, accountData }) => service.updateAccount(id, accountData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    }
  });
};

export const useDeleteAccount = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: service.deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
};

export const useBulkCreateAccounts = (): UseMutationResult<ProductAccount[], Error, { productId: string; accounts: Array<Record<string, any>> }> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, accounts }) => service.bulkCreateAccounts(productId, accounts),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accounts', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
};

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { supabase } from '@/clients/supabase';
import { ProductAccountField, ProductAccount } from '../types/productAccount';

interface ProductAccountStats {
  available: number;
  sold: number;
  total: number;
}

interface FetchAccountsResponse {
  accounts: ProductAccount[];
  stats: ProductAccountStats;
}

// ===== FIELD HOOKS =====
export const useAccountFields = (productId: string): UseQueryResult<ProductAccountField[], Error> => {
  return useQuery({
    queryKey: ['accountFields', productId],
    queryFn: async () => {
      if (!productId) return [];
      
      const { data, error } = await supabase
        .from('product_account_fields')
        .select('*')
        .eq('product_id', productId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!productId,
    staleTime: 2 * 60 * 1000
  });
};

export const useCreateAccountField = (): UseMutationResult<ProductAccountField, Error, Omit<ProductAccountField, 'id' | 'created_at' | 'updated_at'>> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (field) => {
      const { data, error } = await supabase
        .from('product_account_fields')
        .insert(field)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accountFields', variables.product_id] });
    }
  });
};

export const useUpdateAccountField = (): UseMutationResult<ProductAccountField, Error, { id: string; field: Partial<ProductAccountField> }> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, field }) => {
      const { data, error } = await supabase
        .from('product_account_fields')
        .update(field)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountFields'] });
    }
  });
};

export const useDeleteAccountField = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('product_account_fields')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountFields'] });
    }
  });
};

export const useBulkCreateFields = (): UseMutationResult<ProductAccountField[], Error, { productId: string; fields: any[] }> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, fields }) => {
      // Delete existing fields first
      const { error: deleteError } = await supabase
        .from('product_account_fields')
        .delete()
        .eq('product_id', productId);

      if (deleteError) throw deleteError;

      // Insert new fields
      const fieldsToInsert = fields.map((field, index) => ({
        product_id: productId,
        field_name: field.field_name,
        field_type: field.field_type,
        is_required: field.is_required,
        display_order: index
      }));

      const { data, error } = await supabase
        .from('product_account_fields')
        .insert(fieldsToInsert)
        .select();

      if (error) throw error;
      return data || [];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accountFields', variables.productId] });
    }
  });
};

// ===== ACCOUNT HOOKS =====
export const useAccounts = (productId: string, status?: 'available' | 'sold'): UseQueryResult<FetchAccountsResponse, Error> => {
  return useQuery({
    queryKey: ['accounts', productId, status],
    queryFn: async () => {
      if (!productId) {
        return { accounts: [], stats: { available: 0, sold: 0, total: 0 } };
      }

      let query = supabase
        .from('product_accounts')
        .select('*')
        .eq('product_id', productId);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const accounts = data || [];
      const stats = {
        available: accounts.filter(a => a.status === 'available').length,
        sold: accounts.filter(a => a.status === 'sold').length,
        total: accounts.length
      };

      return { accounts, stats };
    },
    enabled: !!productId,
    staleTime: 30 * 1000 // 30 seconds - refresh more often for stock updates
  });
};

export const useCreateAccount = (): UseMutationResult<ProductAccount, Error, { productId: string; accountData: Record<string, any> }> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, accountData }) => {
      const { data, error } = await supabase
        .from('product_accounts')
        .insert({
          product_id: productId,
          account_data: accountData,
          status: 'available'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accounts', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
};

export const useUpdateAccount = (): UseMutationResult<ProductAccount, Error, { id: string; accountData: Record<string, any> }> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, accountData }) => {
      const { data, error } = await supabase
        .from('product_accounts')
        .update({
          account_data: accountData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    }
  });
};

export const useDeleteAccount = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('product_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
};

export const useBulkCreateAccounts = (): UseMutationResult<ProductAccount[], Error, { productId: string; accounts: Array<Record<string, any>> }> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, accounts }) => {
      const accountsToInsert = accounts.map(accountData => ({
        product_id: productId,
        account_data: accountData,
        status: 'available'
      }));

      const { data, error } = await supabase
        .from('product_accounts')
        .insert(accountsToInsert)
        .select();

      if (error) throw error;
      return data || [];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accounts', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
};

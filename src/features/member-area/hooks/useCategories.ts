import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/clients/supabase';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  product_type: 'bm_account' | 'personal_account';
  created_at: string;
  updated_at: string;
}

export interface UseCategoriesParams {
  productType?: 'bm_account' | 'personal_account';
  includeInactive?: boolean;
}

export const useCategories = (params?: UseCategoriesParams) => {
  const { productType, includeInactive = false } = params || {};

  return useQuery({
    queryKey: ['categories', productType, includeInactive],
    queryFn: async () => {
      let query = supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      if (productType) {
        query = query.eq('product_type', productType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      return data as Category[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

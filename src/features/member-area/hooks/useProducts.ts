import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchProducts, fetchProductById, fetchProductStats, FetchProductsParams, PaginatedResponse } from '../services/products.service';
import { Product, ProductCategory } from '../types/product';
import { ProductStats } from '../services/products.service';

/**
 * Hook to fetch products with filters and pagination
 */
export const useProducts = (
  params: FetchProductsParams
): UseQueryResult<PaginatedResponse<Product>, Error> => {
  return useQuery<PaginatedResponse<Product>, Error>({
    queryKey: ['products', params],
    queryFn: async () => {
      console.log('useProducts queryFn called with params:', params);
      const result = await fetchProducts(params);
      console.log('useProducts queryFn result:', result);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a single product by ID
 */
export const useProduct = (
  productId: string
): UseQueryResult<Product, Error> => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProductById(productId),
    enabled: !!productId, // Only fetch if productId is provided
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch product statistics
 */
export const useProductStats = (
  category: ProductCategory
): UseQueryResult<ProductStats, Error> => {
  return useQuery({
    queryKey: ['productStats', category],
    queryFn: () => fetchProductStats(category),
    staleTime: 5 * 60 * 1000,
  });
};


import { useState, useEffect } from 'react';
import { productsService, Product, ProductFilters } from '../services/products.service';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  refetch: () => void;
}

/**
 * useProducts - Hook for fetching products with filters and pagination
 */
export const useProducts = (
  filters: ProductFilters = {},
  page: number = 1,
  limit: number = 12
): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await productsService.fetchProducts(filters, { page, limit });
      setProducts(response.products);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(filters), page, limit]);

  return {
    products,
    loading,
    error,
    total,
    page,
    totalPages,
    refetch: fetchProducts
  };
};

export default useProducts;

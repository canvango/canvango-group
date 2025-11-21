import apiClient from './api';

// Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'bm' | 'personal';
  type: string;
  inStock: boolean;
  features: string[];
  warranty: {
    duration: number;
    type: string;
  };
}

export interface ProductFilters {
  category?: 'bm' | 'personal';
  type?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

// Products Service
export const productsService = {
  /**
   * Fetch products with filters and pagination
   */
  async fetchProducts(filters: ProductFilters = {}, pagination: PaginationParams = {}): Promise<ProductsResponse> {
    const params = new URLSearchParams();
    
    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    // Add pagination
    if (pagination.page) params.append('page', pagination.page.toString());
    if (pagination.limit) params.append('limit', pagination.limit.toString());
    
    const response = await apiClient.get(`/products?${params.toString()}`);
    return response.data;
  },

  /**
   * Fetch single product by ID
   */
  async fetchProductById(id: string): Promise<Product> {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  /**
   * Purchase a product
   */
  async purchaseProduct(productId: string, quantity: number = 1): Promise<{
    success: boolean;
    orderId: string;
    message: string;
  }> {
    const response = await apiClient.post(`/products/${productId}/purchase`, {
      quantity
    });
    return response.data;
  },

  /**
   * Get product categories
   */
  async getCategories(): Promise<string[]> {
    const response = await apiClient.get('/products/categories');
    return response.data;
  },

  /**
   * Get product types for a category
   */
  async getTypes(category: string): Promise<string[]> {
    const response = await apiClient.get(`/products/types?category=${category}`);
    return response.data;
  }
};

export default productsService;

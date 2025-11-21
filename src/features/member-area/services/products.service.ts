/**
 * Products Service
 * 
 * @module services/products
 * @description
 * Provides API functions for managing products including fetching product lists,
 * retrieving product details, purchasing products, and fetching product statistics.
 * Supports filtering, sorting, pagination, and category-based queries.
 * 
 * @example
 * ```typescript
 * import { fetchProducts, purchaseProduct } from './services/products.service';
 * 
 * // Fetch products
 * const products = await fetchProducts({ category: 'bm', page: 1 });
 * 
 * // Purchase a product
 * const result = await purchaseProduct({ productId: 'prod_123', quantity: 1 });
 * ```
 */

import { supabase } from './supabase';
import { Product, ProductFilters, ProductCategory, ProductType } from '../types/product';

/**
 * Generic paginated response structure
 * 
 * @interface PaginatedResponse
 * @template T - Type of data items
 * @property {T[]} data - Array of data items
 * @property {Object} pagination - Pagination metadata
 * @property {number} pagination.page - Current page number
 * @property {number} pagination.pageSize - Items per page
 * @property {number} pagination.total - Total number of items
 * @property {number} pagination.totalPages - Total number of pages
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Helper function to parse multi-line text into array
 * Splits by newline and filters out empty lines
 */
const parseTextToArray = (text: string | null | undefined): string[] => {
  if (!text) return [];
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
};

/**
 * Helper function to get product details from database or fallback to defaults
 */
const getProductDetails = (item: any) => {
  const productType = item.product_type;
  const isBM = productType === 'bm_account';
  const defaultWarrantyDuration = item.warranty_duration || (isBM ? 30 : 7);
  
  // Parse advantages from database (if available), otherwise return empty array
  let features: string[];
  if (item.advantages) {
    features = parseTextToArray(item.advantages);
  } else {
    features = [];
  }

  // Parse disadvantages from database (if available), otherwise return empty array
  let limitations: string[];
  if (item.disadvantages) {
    limitations = parseTextToArray(item.disadvantages);
  } else {
    limitations = [];
  }

  // Parse warranty terms from database (if available), otherwise return empty array
  let warrantyTerms: string[];
  if (item.warranty_terms) {
    warrantyTerms = parseTextToArray(item.warranty_terms);
  } else {
    warrantyTerms = [];
  }

  return { features, limitations, warrantyTerms, warrantyDuration: defaultWarrantyDuration };
};

/**
 * Parameters for fetching products
 * 
 * @interface FetchProductsParams
 * @extends {ProductFilters}
 * @property {number} [page=1] - Page number to fetch
 * @property {number} [pageSize=12] - Number of items per page
 */
export interface FetchProductsParams extends ProductFilters {
  page?: number;
  pageSize?: number;
}

/**
 * Fetch products with filters and pagination
 * 
 * @async
 * @function fetchProducts
 * @param {FetchProductsParams} params - Filter and pagination parameters
 * @returns {Promise<PaginatedResponse<Product>>} Paginated list of products
 * 
 * @throws {Error} When API request fails
 * 
 * @example
 * ```typescript
 * const products = await fetchProducts({
 *   category: 'bm',
 *   type: 'verified',
 *   page: 1,
 *   pageSize: 12,
 *   sortBy: 'price',
 *   sortOrder: 'asc'
 * });
 * ```
 * 
 * @see {@link Product} for product data structure
 * @see {@link ProductFilters} for available filters
 */
export const fetchProducts = async (
  params: FetchProductsParams
): Promise<PaginatedResponse<Product>> => {
  const page = params.page || 1;
  const pageSize = params.pageSize || 12;
  const offset = (page - 1) * pageSize;

  // Build query
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true);

  // Apply filters
  // Filter by product_type (bm_account, personal_account, etc.)
  if (params.category) {
    const productTypeMap: Record<string, string> = {
      'bm': 'bm_account',
      'personal': 'personal_account',
    };
    const mappedType = productTypeMap[params.category] || params.category;
    query = query.eq('product_type', mappedType);
  }
  
  // Filter by category (specific product variant like limit_250, limit_500, etc.)
  if (params.type) {
    query = query.eq('category', params.type);
  }
  if (params.minPrice) {
    query = query.gte('price', params.minPrice);
  }
  if (params.maxPrice) {
    query = query.lte('price', params.maxPrice);
  }
  if (params.search) {
    query = query.or(`product_name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  }

  // Apply sorting
  let sortField = 'created_at';
  if (params.sortBy === 'price') {
    sortField = 'price';
  } else if (params.sortBy === 'name') {
    sortField = 'product_name';
  } else if (params.sortBy === 'date') {
    sortField = 'created_at';
  }
  
  const sortOrder = params.sortOrder === 'asc' ? { ascending: true } : { ascending: false };
  query = query.order(sortField, sortOrder);

  // Apply pagination
  query = query.range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Supabase query error:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    return {
      data: [],
      pagination: {
        page,
        pageSize,
        total: 0,
        totalPages: 0,
      },
    };
  }

  // Fetch real stock counts from product_accounts for each product
  const productIds = (data || []).map((item: any) => item.id);
  const stockMap: Record<string, number> = {};

  if (productIds.length > 0) {
    const { data: stockData, error: stockError } = await supabase
      .from('product_accounts')
      .select('product_id')
      .in('product_id', productIds)
      .eq('status', 'available');

    if (!stockError && stockData) {
      // Count available accounts per product
      stockData.forEach((item: any) => {
        stockMap[item.product_id] = (stockMap[item.product_id] || 0) + 1;
      });
    } else if (stockError) {
      console.error('Error fetching stock data:', stockError);
    }
  }

  // Transform database records to Product interface
  const transformedData = (data || []).map((item: any) => {
    const { features, limitations, warrantyTerms, warrantyDuration } = getProductDetails(item);
    
    // Get real stock from product_accounts, fallback to 0 if not found
    const realStock = stockMap[item.id] || 0;
    
    return {
      id: item.id,
      category: (item.product_type === 'bm_account' ? 'bm' : 'personal') as ProductCategory,
      type: item.category as ProductType,
      title: item.product_name,
      description: item.description || '',
      price: Number(item.price),
      stock: realStock, // Real stock from product_accounts
      features,
      limitations,
      warranty: {
        enabled: item.warranty_enabled !== undefined ? item.warranty_enabled : true,
        duration: warrantyDuration,
        terms: warrantyTerms,
      },
      ad_limit: item.ad_limit || undefined,
      verification_status: item.verification_status || undefined,
      ad_account_type: item.ad_account_type || undefined,
      detail_fields: item.detail_fields || undefined,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    };
  });

  return {
    data: transformedData,
    pagination: {
      page,
      pageSize,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  };
};

/**
 * Fetch a single product by ID
 * 
 * @async
 * @function fetchProductById
 * @param {string} productId - Unique product identifier
 * @returns {Promise<Product>} Product details
 * 
 * @throws {Error} When product not found or API request fails
 * 
 * @example
 * ```typescript
 * const product = await fetchProductById('prod_123');
 * console.log(product.title, product.price);
 * ```
 */
export const fetchProductById = async (productId: string): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('is_active', true)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Product not found');

  // Helper function to get product details based on type
  const { features, limitations, warrantyTerms, warrantyDuration } = getProductDetails(data);

  // Fetch real stock from product_accounts
  const { count: realStock, error: stockError } = await supabase
    .from('product_accounts')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', productId)
    .eq('status', 'available');

  if (stockError) {
    console.error('Error fetching stock for product:', productId, stockError);
  }

  // Transform database record to Product interface
  return {
    id: data.id,
    category: (data.product_type === 'bm_account' ? 'bm' : 'personal') as ProductCategory,
    type: data.category as ProductType,
    title: data.product_name,
    description: data.description || '',
    price: Number(data.price),
    stock: realStock || 0, // Real stock from product_accounts
    features,
    limitations,
    warranty: {
      enabled: data.warranty_enabled !== undefined ? data.warranty_enabled : true,
      duration: warrantyDuration,
      terms: warrantyTerms,
    },
    ad_limit: data.ad_limit || undefined,
    verification_status: data.verification_status || undefined,
    ad_account_type: data.ad_account_type || undefined,
    detail_fields: data.detail_fields || undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
};

/**
 * Data required to purchase a product
 * 
 * @interface PurchaseProductData
 * @property {string} productId - ID of product to purchase
 * @property {number} quantity - Number of items to purchase
 */
export interface PurchaseProductData {
  productId: string;
  quantity: number;
}

/**
 * Response from purchase request
 * 
 * @interface PurchaseResponse
 * @property {string} transactionId - Unique transaction identifier
 * @property {'pending' | 'success' | 'failed'} status - Purchase status
 * @property {string} message - Status message or error description
 */
export interface PurchaseResponse {
  transactionId: string;
  status: 'pending' | 'success' | 'failed';
  message: string;
}

/**
 * Purchase a product
 * 
 * @async
 * @function purchaseProduct
 * @param {PurchaseProductData} data - Purchase details
 * @returns {Promise<PurchaseResponse>} Purchase result with transaction ID
 * 
 * @throws {Error} When insufficient balance, out of stock, or API request fails
 * 
 * @example
 * ```typescript
 * const result = await purchaseProduct({
 *   productId: 'prod_123',
 *   quantity: 2
 * });
 * 
 * if (result.status === 'success') {
 *   console.log('Transaction ID:', result.transactionId);
 * }
 * ```
 * 
 * @see {@link useTransactions} to fetch transaction details
 */
export const purchaseProduct = async (
  data: PurchaseProductData
): Promise<PurchaseResponse> => {
  // Import apiClient to use configured axios instance with auth
  const { default: apiClient } = await import('./api');
  
  try {
    // Use new backend endpoint that handles account assignment
    const response = await apiClient.post('/purchase', {
      productId: data.productId,
      quantity: data.quantity
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Purchase failed');
    }

    return {
      status: 'success',
      transactionId: response.data.data.transactionId,
      message: response.data.data.message || 'Purchase completed successfully',
    };
  } catch (error: any) {
    console.error('Purchase error:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Purchase failed');
  }
};

/**
 * Product statistics for a category
 * 
 * @interface ProductStats
 * @property {number} totalStock - Total available stock
 * @property {number} successRate - Success rate percentage (0-100)
 * @property {number} totalSold - Total number of items sold
 */
export interface ProductStats {
  totalStock: number;
  successRate: number;
  totalSold: number;
}

/**
 * Get product statistics for a category
 * 
 * @async
 * @function fetchProductStats
 * @param {ProductCategory} category - Product category ('bm' or 'personal')
 * @returns {Promise<ProductStats>} Statistics for the category
 * 
 * @throws {Error} When API request fails
 * 
 * @example
 * ```typescript
 * const stats = await fetchProductStats('bm');
 * console.log(`Stock: ${stats.totalStock}`);
 * console.log(`Success Rate: ${stats.successRate}%`);
 * console.log(`Total Sold: ${stats.totalSold}`);
 * ```
 * 
 * @see {@link ProductCategory} for available categories
 */
export const fetchProductStats = async (
  category: ProductCategory
): Promise<ProductStats> => {
  // Get total stock
  const { count: totalStock } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category', category)
    .eq('is_active', true)
    .eq('stock_status', 'available');

  // Get total sold from purchases
  const { data: purchases } = await supabase
    .from('purchases')
    .select('quantity, product:products!inner(category)')
    .eq('product.category', category);

  const totalSold = (purchases || []).reduce((sum, p) => sum + p.quantity, 0);

  // Calculate success rate (simplified - based on completed transactions)
  const { data: transactions } = await supabase
    .from('transactions')
    .select('status, product:products!inner(category)')
    .eq('product.category', category)
    .eq('transaction_type', 'purchase');

  const total = transactions?.length || 0;
  const successful = transactions?.filter(t => t.status === 'completed').length || 0;
  const successRate = total > 0 ? (successful / total) * 100 : 0;

  return {
    totalStock: totalStock || 0,
    successRate: Math.round(successRate),
    totalSold,
  };
};


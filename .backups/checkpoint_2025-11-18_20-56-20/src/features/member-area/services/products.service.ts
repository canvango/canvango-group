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

  console.log('Fetched products from Supabase:', {
    count,
    dataLength: data?.length,
    params,
    firstProduct: data?.[0]
  });

  // Helper function to get product details based on type
  const getProductDetails = (productType: string) => {
    const isBM = productType === 'bm_account';
    
    const features = isBM ? [
      'Sudah di buatkan akun iklan',
      'Sudah di buatkan fanspage',
      'Bisa merubah negara dan mata uang',
      'Tingkat keberhasilan saat mendaftarkan WhatsApp API 70%',
      'Sangat di rekomendasikan jika di gunakan dalam jangka panjang',
      'Limit akun iklan bisa naik hingga 1000$'
    ] : [
      'Akun personal Facebook yang sudah terverifikasi',
      'Bisa digunakan untuk iklan dengan limit sesuai kategori',
      'Akses penuh ke Facebook Ads Manager',
      'Cocok untuk pemula yang ingin memulai iklan',
      'Proses setup lebih cepat'
    ];

    const limitations = isBM ? [
      'Tidak di rekomendasikan untuk langsung di gunakan setelah pembelian harus di redam beberapa hari',
      'Tidak aman jika langsung mendaftarkan WhatsApp API setelah pembelian'
    ] : [
      'Limit iklan terbatas sesuai kategori akun',
      'Tidak bisa menambahkan admin tambahan',
      'Risiko suspend lebih tinggi jika tidak hati-hati'
    ];

    const warrantyTerms = isBM ? [
      'Garansi tidak berlaku jika membuat akun iklan baru akun BM mati atau akun iklan mati',
      'Garansi tidak berlaku akun BM mati saat menambahkan admin baru',
      'Garansi tidak berlaku jika menambahkan fanspage baru akun BM mati',
      'Garansi tidak berlaku jika akun iklan atau akun BM mati saat menambahkan metode pembayaran',
      'Garansi tidak berlaku jika menambahkan WhatsApp akun WhatsApp atau BM mati'
    ] : [
      'Garansi berlaku 7 hari untuk akun personal',
      'Garansi tidak berlaku jika akun di-suspend karena pelanggaran kebijakan',
      'Garansi tidak berlaku jika password diubah tanpa konfirmasi',
      'Penggantian akun hanya berlaku 1x dalam periode garansi'
    ];

    return { features, limitations, warrantyTerms };
  };

  // Transform database records to Product interface
  const transformedData = (data || []).map((item: any) => {
    const { features, limitations, warrantyTerms } = getProductDetails(item.product_type);
    
    return {
      id: item.id,
      category: (item.product_type === 'bm_account' ? 'bm' : 'personal') as ProductCategory,
      type: item.category as ProductType,
      title: item.product_name,
      description: item.description || '',
      price: Number(item.price),
      stock: item.stock_status === 'available' ? 100 : 0, // Simplified stock
      features,
      limitations,
      warranty: {
        enabled: true,
        duration: item.product_type === 'bm_account' ? 30 : 7,
        terms: warrantyTerms,
      },
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
  const getProductDetails = (productType: string) => {
    const isBM = productType === 'bm_account';
    
    const features = isBM ? [
      'Sudah di buatkan akun iklan',
      'Sudah di buatkan fanspage',
      'Bisa merubah negara dan mata uang',
      'Tingkat keberhasilan saat mendaftarkan WhatsApp API 70%',
      'Sangat di rekomendasikan jika di gunakan dalam jangka panjang',
      'Limit akun iklan bisa naik hingga 1000$'
    ] : [
      'Akun personal Facebook yang sudah terverifikasi',
      'Bisa digunakan untuk iklan dengan limit sesuai kategori',
      'Akses penuh ke Facebook Ads Manager',
      'Cocok untuk pemula yang ingin memulai iklan',
      'Proses setup lebih cepat'
    ];

    const limitations = isBM ? [
      'Tidak di rekomendasikan untuk langsung di gunakan setelah pembelian harus di redam beberapa hari',
      'Tidak aman jika langsung mendaftarkan WhatsApp API setelah pembelian'
    ] : [
      'Limit iklan terbatas sesuai kategori akun',
      'Tidak bisa menambahkan admin tambahan',
      'Risiko suspend lebih tinggi jika tidak hati-hati'
    ];

    const warrantyTerms = isBM ? [
      'Garansi tidak berlaku jika membuat akun iklan baru akun BM mati atau akun iklan mati',
      'Garansi tidak berlaku akun BM mati saat menambahkan admin baru',
      'Garansi tidak berlaku jika menambahkan fanspage baru akun BM mati',
      'Garansi tidak berlaku jika akun iklan atau akun BM mati saat menambahkan metode pembayaran',
      'Garansi tidak berlaku jika menambahkan WhatsApp akun WhatsApp atau BM mati'
    ] : [
      'Garansi berlaku 7 hari untuk akun personal',
      'Garansi tidak berlaku jika akun di-suspend karena pelanggaran kebijakan',
      'Garansi tidak berlaku jika password diubah tanpa konfirmasi',
      'Penggantian akun hanya berlaku 1x dalam periode garansi'
    ];

    return { features, limitations, warrantyTerms };
  };

  const { features, limitations, warrantyTerms } = getProductDetails(data.product_type);

  // Transform database record to Product interface
  return {
    id: data.id,
    category: (data.product_type === 'bm_account' ? 'bm' : 'personal') as ProductCategory,
    type: data.category as ProductType,
    title: data.product_name,
    description: data.description || '',
    price: Number(data.price),
    stock: data.stock_status === 'available' ? 100 : 0,
    features,
    limitations,
    warranty: {
      enabled: true,
      duration: data.product_type === 'bm_account' ? 30 : 7,
      terms: warrantyTerms,
    },
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get product details
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', data.productId)
    .single();

  if (productError) throw productError;
  if (!product) throw new Error('Product not found');

  // Check stock
  if (product.stock_status !== 'available') {
    throw new Error('Product out of stock');
  }

  // Get user balance
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('balance')
    .eq('id', user.id)
    .single();

  if (userError) throw userError;

  const totalPrice = Number(product.price) * data.quantity;
  if (Number(userData.balance) < totalPrice) {
    throw new Error('Insufficient balance');
  }

  // Create transaction
  const { data: transaction, error: txnError } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      transaction_type: 'purchase',
      product_id: data.productId,
      amount: totalPrice,
      status: 'pending',
    })
    .select()
    .single();

  if (txnError) throw txnError;

  return {
    status: 'success',
    transactionId: transaction.id,
    message: 'Purchase initiated successfully',
  };
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

import { getSupabaseClient } from '../config/supabase.js';

export interface Product {
  id: string;
  product_name: string;
  product_type: 'bm_account' | 'personal_account' | 'verified_bm' | 'api';
  category: string;
  description: string | null;
  price: number;
  stock_status: 'available' | 'out_of_stock';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductInput {
  product_name: string;
  product_type: 'bm_account' | 'personal_account' | 'verified_bm' | 'api';
  category: string;
  description?: string;
  price: number;
  stock_status?: 'available' | 'out_of_stock';
  is_active?: boolean;
}

export interface UpdateProductInput {
  product_name?: string;
  product_type?: 'bm_account' | 'personal_account' | 'verified_bm' | 'api';
  category?: string;
  description?: string;
  price?: number;
  stock_status?: 'available' | 'out_of_stock';
  is_active?: boolean;
}

interface ProductInsert {
  id?: string;
  product_name: string;
  product_type: string;
  category: string;
  description?: string | null;
  price: string;
  stock_status?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ProductUpdate {
  product_name?: string;
  product_type?: string;
  category?: string;
  description?: string | null;
  price?: string;
  stock_status?: string;
  is_active?: boolean;
  updated_at?: string;
}

export class ProductModel {
  private static get supabase() {
    return getSupabaseClient();
  }

  /**
   * Create a new product
   */
  static async create(productData: CreateProductInput): Promise<Product> {
    const insertData: ProductInsert = {
      product_name: productData.product_name,
      product_type: productData.product_type,
      category: productData.category,
      description: productData.description || null,
      price: productData.price.toString(),
      stock_status: productData.stock_status || 'available',
      is_active: productData.is_active !== undefined ? productData.is_active : true
    };

    const { data, error } = await this.supabase
      .from('products')
      .insert(insertData as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }

    return data as Product;
  }

  /**
   * Find product by ID
   */
  static async findById(id: string): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error finding product by ID:', error);
      throw new Error(`Failed to find product: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all products with optional filtering and pagination
   */
  static async findAll(filters?: {
    search?: string;
    product_type?: string;
    stock_status?: string;
    is_active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ products: Product[]; total: number }> {
    // Build query for data
    let query = this.supabase.from('products').select('*', { count: 'exact' });

    if (filters?.search) {
      query = query.or(`product_name.ilike.%${filters.search}%,category.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.product_type && filters.product_type !== 'all') {
      query = query.eq('product_type', filters.product_type);
    }

    if (filters?.stock_status && filters.stock_status !== 'all') {
      query = query.eq('stock_status', filters.stock_status);
    }

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    query = query.order('created_at', { ascending: false });

    // Apply pagination using range (which handles both offset and limit)
    if (filters?.offset !== undefined || filters?.limit) {
      const limit = filters.limit || 10;
      const offset = filters.offset || 0;
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error finding products:', error);
      throw new Error(`Failed to find products: ${error.message}`);
    }

    return {
      products: data || [],
      total: count || 0
    };
  }

  /**
   * Search products by keyword
   */
  static async search(keyword: string, limit?: number): Promise<Product[]> {
    let query = this.supabase
      .from('products')
      .select('*')
      .or(`product_name.ilike.%${keyword}%,category.ilike.%${keyword}%,description.ilike.%${keyword}%`)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error searching products:', error);
      throw new Error(`Failed to search products: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get products by type
   */
  static async findByType(productType: string, limit?: number, offset?: number): Promise<Product[]> {
    let query = this.supabase
      .from('products')
      .select('*')
      .eq('product_type', productType)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      const limitValue = limit || 10;
      query = query.range(offset, offset + limitValue - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error finding products by type:', error);
      throw new Error(`Failed to find products by type: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get products by category
   */
  static async findByCategory(category: string, limit?: number, offset?: number): Promise<Product[]> {
    let query = this.supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      const limitValue = limit || 10;
      query = query.range(offset, offset + limitValue - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error finding products by category:', error);
      throw new Error(`Failed to find products by category: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get available products
   */
  static async getAvailable(limit?: number): Promise<Product[]> {
    let query = this.supabase
      .from('products')
      .select('*')
      .eq('stock_status', 'available')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error getting available products:', error);
      throw new Error(`Failed to get available products: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Update product
   */
  static async update(id: string, productData: UpdateProductInput): Promise<Product | null> {
    const updates: ProductUpdate = {};

    if (productData.product_name !== undefined) {
      updates.product_name = productData.product_name;
    }
    if (productData.product_type !== undefined) {
      updates.product_type = productData.product_type;
    }
    if (productData.category !== undefined) {
      updates.category = productData.category;
    }
    if (productData.description !== undefined) {
      updates.description = productData.description;
    }
    if (productData.price !== undefined) {
      updates.price = productData.price.toString();
    }
    if (productData.stock_status !== undefined) {
      updates.stock_status = productData.stock_status;
    }
    if (productData.is_active !== undefined) {
      updates.is_active = productData.is_active;
    }

    if (Object.keys(updates).length === 0) {
      return this.findById(id);
    }

    const { data, error } = await (this.supabase
      .from('products') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw new Error(`Failed to update product: ${error.message}`);
    }

    return data as Product;
  }

  /**
   * Delete product (hard delete)
   */
  static async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }

    return true;
  }

  /**
   * Soft delete product (set is_active to false)
   */
  static async softDelete(id: string): Promise<Product | null> {
    return this.update(id, { is_active: false });
  }

  /**
   * Count products with optional filtering
   */
  static async count(filters?: {
    search?: string;
    product_type?: string;
    stock_status?: string;
    is_active?: boolean;
  }): Promise<number> {
    let query = this.supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (filters?.search) {
      query = query.or(`product_name.ilike.%${filters.search}%,category.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.product_type && filters.product_type !== 'all') {
      query = query.eq('product_type', filters.product_type);
    }

    if (filters?.stock_status && filters.stock_status !== 'all') {
      query = query.eq('stock_status', filters.stock_status);
    }

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { count, error } = await query;

    if (error) {
      console.error('Error counting products:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Get product statistics
   */
  static async getStats(): Promise<{
    total: number;
    available: number;
    out_of_stock: number;
    by_type: Record<string, number>;
  }> {
    const { data, error } = await this.supabase
      .from('products')
      .select('product_type, stock_status, is_active');

    if (error) {
      console.error('Error getting product stats:', error);
      throw new Error(`Failed to get product stats: ${error.message}`);
    }

    const stats = {
      total: 0,
      available: 0,
      out_of_stock: 0,
      by_type: {} as Record<string, number>
    };

    data.forEach((product: any) => {
      if (product.is_active) {
        stats.total++;
        
        if (product.stock_status === 'available') {
          stats.available++;
        } else if (product.stock_status === 'out_of_stock') {
          stats.out_of_stock++;
        }

        if (!stats.by_type[product.product_type]) {
          stats.by_type[product.product_type] = 0;
        }
        stats.by_type[product.product_type]++;
      }
    });

    return stats;
  }

  /**
   * Duplicate product (create a copy with modified name)
   */
  static async duplicate(id: string): Promise<Product> {
    // Get the original product
    const originalProduct = await this.findById(id);
    
    if (!originalProduct) {
      throw new Error('Product not found');
    }

    // Create a copy with modified name
    const duplicateData: CreateProductInput = {
      product_name: `${originalProduct.product_name} (Copy)`,
      product_type: originalProduct.product_type,
      category: originalProduct.category,
      description: originalProduct.description || undefined,
      price: Number(originalProduct.price),
      stock_status: originalProduct.stock_status,
      is_active: originalProduct.is_active
    };

    // Create the duplicate
    return this.create(duplicateData);
  }

  /**
   * Validate product data
   */
  static validateProductData(productData: Partial<CreateProductInput>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (productData.product_name !== undefined) {
      if (productData.product_name.length < 3) {
        errors.push('Product name must be at least 3 characters long');
      }
      if (productData.product_name.length > 255) {
        errors.push('Product name must not exceed 255 characters');
      }
    }

    if (productData.product_type !== undefined) {
      const validTypes = ['bm_account', 'personal_account', 'verified_bm', 'api'];
      if (!validTypes.includes(productData.product_type)) {
        errors.push('Invalid product type');
      }
    }

    if (productData.category !== undefined) {
      if (productData.category.length < 2) {
        errors.push('Category must be at least 2 characters long');
      }
      if (productData.category.length > 100) {
        errors.push('Category must not exceed 100 characters');
      }
    }

    if (productData.price !== undefined) {
      if (productData.price < 0) {
        errors.push('Price must be a positive number');
      }
    }

    if (productData.stock_status !== undefined) {
      const validStatuses = ['available', 'out_of_stock'];
      if (!validStatuses.includes(productData.stock_status)) {
        errors.push('Invalid stock status');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

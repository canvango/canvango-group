import { getSupabaseClient } from '../config/supabase.js';
import type { Database } from '../types/database.types.js';

export type ProductType = 'RMSO_NEW' | 'PERSONAL_TUA' | 'RM_NEW' | 'RM_TUA' | 'J202_VERIFIED_BM';
export type TransactionStatus = 'BERHASIL' | 'PENDING' | 'GAGAL';

export interface Transaction {
  id: string;
  user_id: string;
  product_name: string;
  product_type: ProductType;
  quantity: number;
  total_amount: number;
  status: TransactionStatus;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface CreateTransactionInput {
  user_id: string;
  product_name: string;
  product_type: ProductType;
  quantity: number;
  total_amount: number;
  status?: TransactionStatus;
}

export interface UpdateTransactionInput {
  product_name?: string;
  product_type?: ProductType;
  quantity?: number;
  total_amount?: number;
  status?: TransactionStatus;
}

export class TransactionModel {
  private static get supabase() {
    return getSupabaseClient();
  }

  /**
   * Find transaction by ID
   */
  static async findById(id: string): Promise<Transaction | null> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error finding transaction by ID:', error);
      return null;
    }

    return data;
  }

  /**
   * Find transactions by user ID
   */
  static async findByUserId(
    userId: string,
    options?: {
      status?: TransactionStatus;
      limit?: number;
      offset?: number;
    }
  ): Promise<Transaction[]> {
    let query = this.supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId);

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    query = query.order('created_at', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      const limit = options.limit || 10;
      query = query.range(options.offset, options.offset + limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error finding transactions by user ID:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get all transactions with optional filtering
   */
  static async findAll(filters?: {
    user_id?: string;
    status?: TransactionStatus;
    product_type?: ProductType;
    start_date?: Date;
    end_date?: Date;
    limit?: number;
    offset?: number;
  }): Promise<Transaction[]> {
    let query = this.supabase.from('transactions').select('*');

    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.product_type) {
      query = query.eq('product_type', filters.product_type);
    }

    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date.toISOString());
    }

    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date.toISOString());
    }

    query = query.order('created_at', { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      const limit = filters.limit || 10;
      query = query.range(filters.offset, filters.offset + limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error finding transactions:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Create a new transaction
   */
  static async create(transactionData: CreateTransactionInput): Promise<Transaction> {
    const insertData: Database['public']['Tables']['transactions']['Insert'] = {
      user_id: transactionData.user_id,
      product_name: transactionData.product_name,
      product_type: transactionData.product_type,
      quantity: transactionData.quantity,
      total_amount: transactionData.total_amount,
      status: transactionData.status || 'PENDING'
    };

    const { data, error } = await this.supabase
      .from('transactions')
      .insert(insertData as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw new Error('Failed to create transaction');
    }

    return data as Transaction;
  }

  /**
   * Update transaction
   */
  static async update(id: string, transactionData: UpdateTransactionInput): Promise<Transaction | null> {
    const updates: Database['public']['Tables']['transactions']['Update'] = {};

    if (transactionData.product_name !== undefined) {
      updates.product_name = transactionData.product_name;
    }
    if (transactionData.product_type !== undefined) {
      updates.product_type = transactionData.product_type;
    }
    if (transactionData.quantity !== undefined) {
      updates.quantity = transactionData.quantity;
    }
    if (transactionData.total_amount !== undefined) {
      updates.total_amount = transactionData.total_amount;
    }
    if (transactionData.status !== undefined) {
      updates.status = transactionData.status;
    }

    if (Object.keys(updates).length === 0) {
      return this.findById(id);
    }

    const { data, error } = await (this.supabase
      .from('transactions') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      return null;
    }

    return data as Transaction;
  }

  /**
   * Update transaction status
   */
  static async updateStatus(id: string, status: TransactionStatus): Promise<Transaction | null> {
    const updateData: Database['public']['Tables']['transactions']['Update'] = { status };

    const { data, error } = await (this.supabase
      .from('transactions') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction status:', error);
      return null;
    }

    return data as Transaction;
  }

  /**
   * Delete transaction
   */
  static async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }

    return true;
  }

  /**
   * Count transactions with optional filtering
   */
  static async count(filters?: {
    user_id?: string;
    status?: TransactionStatus;
    product_type?: ProductType;
    start_date?: Date;
    end_date?: Date;
  }): Promise<number> {
    let query = this.supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });

    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.product_type) {
      query = query.eq('product_type', filters.product_type);
    }

    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date.toISOString());
    }

    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date.toISOString());
    }

    const { count, error } = await query;

    if (error) {
      console.error('Error counting transactions:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Get transaction statistics using database aggregation
   * Uses PostgreSQL function for efficient calculation
   */
  static async getStatistics(filters?: {
    user_id?: string;
    start_date?: Date;
    end_date?: Date;
  }): Promise<{
    total_transactions: number;
    total_amount: number;
    by_status: { status: TransactionStatus; count: number; total_amount: number }[];
    by_product_type: { product_type: ProductType; count: number; total_amount: number }[];
  }> {
    try {
      // Call PostgreSQL function for efficient aggregation
      const { data, error } = await (this.supabase.rpc as any)('get_transaction_statistics', {
        p_user_id: filters?.user_id || null,
        p_start_date: filters?.start_date?.toISOString() || null,
        p_end_date: filters?.end_date?.toISOString() || null
      });

      if (error) {
        console.error('Error getting transaction statistics:', error);
        return {
          total_transactions: 0,
          total_amount: 0,
          by_status: [],
          by_product_type: []
        };
      }

      // Parse the JSON result from the database function
      const result = data as {
        total_transactions: number;
        total_amount: number;
        by_status: { status: TransactionStatus; count: number; total_amount: number }[];
        by_product_type: { product_type: ProductType; count: number; total_amount: number }[];
      };

      return {
        total_transactions: result.total_transactions || 0,
        total_amount: Number(result.total_amount) || 0,
        by_status: result.by_status || [],
        by_product_type: result.by_product_type || []
      };
    } catch (error) {
      console.error('Error in getStatistics:', error);
      return {
        total_transactions: 0,
        total_amount: 0,
        by_status: [],
        by_product_type: []
      };
    }
  }

  /**
   * Validate transaction data
   */
  static validateTransactionData(transactionData: Partial<CreateTransactionInput>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (transactionData.product_name !== undefined) {
      if (transactionData.product_name.length < 1) {
        errors.push('Product name is required');
      }
      if (transactionData.product_name.length > 255) {
        errors.push('Product name must not exceed 255 characters');
      }
    }

    if (transactionData.product_type !== undefined) {
      const validTypes: ProductType[] = ['RMSO_NEW', 'PERSONAL_TUA', 'RM_NEW', 'RM_TUA', 'J202_VERIFIED_BM'];
      if (!validTypes.includes(transactionData.product_type)) {
        errors.push('Invalid product type');
      }
    }

    if (transactionData.quantity !== undefined) {
      if (transactionData.quantity < 1) {
        errors.push('Quantity must be at least 1');
      }
    }

    if (transactionData.total_amount !== undefined) {
      if (transactionData.total_amount < 0) {
        errors.push('Total amount cannot be negative');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

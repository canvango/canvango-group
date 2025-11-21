import { getSupabaseClient } from '../config/supabase.js';
import type { Database } from '../types/database.types.js';

export type ProductType = 'RMSO_NEW' | 'PERSONAL_TUA' | 'RM_NEW' | 'RM_TUA' | 'J202_VERIFIED_BM';
export type TransactionStatus = 'BERHASIL' | 'PENDING' | 'GAGAL' | 'completed' | 'pending' | 'failed';

export interface Transaction {
  id: string;
  user_id: string;
  transaction_type: string; // 'topup' | 'purchase'
  product_id?: string | null;
  amount: number;
  status: TransactionStatus;
  payment_method?: string | null;
  payment_proof_url?: string | null;
  notes?: string | null;
  metadata?: any;
  created_at: Date | string;
  updated_at: Date | string;
  completed_at?: Date | string | null;
}

export interface CreateTransactionInput {
  user_id: string;
  transaction_type: string; // 'topup' | 'purchase'
  product_id?: string;
  amount: number;
  status?: TransactionStatus;
  payment_method?: string;
  payment_proof_url?: string;
  notes?: string;
  metadata?: any;
}

export interface UpdateTransactionInput {
  transaction_type?: string;
  product_id?: string;
  amount?: number;
  status?: TransactionStatus;
  payment_method?: string;
  payment_proof_url?: string;
  notes?: string;
  metadata?: any;
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
    transaction_type?: string;
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

    if (filters?.transaction_type) {
      query = query.eq('transaction_type', filters.transaction_type);
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
    const insertData: any = {
      user_id: transactionData.user_id,
      transaction_type: transactionData.transaction_type,
      amount: transactionData.amount,
      status: transactionData.status || 'pending'
    };

    if (transactionData.product_id) {
      insertData.product_id = transactionData.product_id;
    }
    if (transactionData.payment_method) {
      insertData.payment_method = transactionData.payment_method;
    }
    if (transactionData.payment_proof_url) {
      insertData.payment_proof_url = transactionData.payment_proof_url;
    }
    if (transactionData.notes) {
      insertData.notes = transactionData.notes;
    }
    if (transactionData.metadata) {
      insertData.metadata = transactionData.metadata;
    }

    const { data, error } = await this.supabase
      .from('transactions')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw new Error(`Failed to create transaction: ${error.message}`);
    }

    return data as Transaction;
  }

  /**
   * Update transaction
   */
  static async update(id: string, transactionData: UpdateTransactionInput): Promise<Transaction | null> {
    const updates: any = {};

    if (transactionData.transaction_type !== undefined) {
      updates.transaction_type = transactionData.transaction_type;
    }
    if (transactionData.product_id !== undefined) {
      updates.product_id = transactionData.product_id;
    }
    if (transactionData.amount !== undefined) {
      updates.amount = transactionData.amount;
    }
    if (transactionData.status !== undefined) {
      updates.status = transactionData.status;
    }
    if (transactionData.payment_method !== undefined) {
      updates.payment_method = transactionData.payment_method;
    }
    if (transactionData.payment_proof_url !== undefined) {
      updates.payment_proof_url = transactionData.payment_proof_url;
    }
    if (transactionData.notes !== undefined) {
      updates.notes = transactionData.notes;
    }
    if (transactionData.metadata !== undefined) {
      updates.metadata = transactionData.metadata;
    }

    if (Object.keys(updates).length === 0) {
      return this.findById(id);
    }

    const { data, error } = await this.supabase
      .from('transactions')
      // @ts-ignore - Supabase type inference issue
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
    const updateData: any = { status };

    const { data, error } = await this.supabase
      .from('transactions')
      // @ts-ignore - Supabase type inference issue
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
    transaction_type?: string;
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

    if (filters?.transaction_type) {
      query = query.eq('transaction_type', filters.transaction_type);
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
      // @ts-ignore - RPC function type inference issue
      const { data, error } = await this.supabase.rpc('get_transaction_statistics' as any, {
        p_user_id: filters?.user_id || null,
        p_start_date: filters?.start_date?.toISOString() || null,
        p_end_date: filters?.end_date?.toISOString() || null
      } as any);

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

    if (transactionData.transaction_type !== undefined) {
      const validTypes = ['topup', 'purchase'];
      if (!validTypes.includes(transactionData.transaction_type)) {
        errors.push('Invalid transaction type');
      }
    }

    if (transactionData.amount !== undefined) {
      if (transactionData.amount <= 0) {
        errors.push('Amount must be greater than 0');
      }
    }

    if (transactionData.status !== undefined) {
      const validStatuses: TransactionStatus[] = ['BERHASIL', 'PENDING', 'GAGAL', 'completed', 'pending', 'failed'];
      if (!validStatuses.includes(transactionData.status)) {
        errors.push('Invalid status');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

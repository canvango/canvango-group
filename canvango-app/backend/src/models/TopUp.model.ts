import { getSupabaseClient } from '../config/supabase.js';

// Note: Database uses 'COMPLETED' but we keep 'SUCCESS' for backward compatibility
export type TopUpStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'COMPLETED';

export interface TopUp {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  status: TopUpStatus;
  transaction_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTopUpInput {
  user_id: string;
  amount: number;
  payment_method: string;
  status?: TopUpStatus;
  transaction_id?: string;
}

export interface UpdateTopUpInput {
  amount?: number;
  payment_method?: string;
  status?: TopUpStatus;
  transaction_id?: string;
}

export class TopUpModel {
  private static get supabase() {
    return getSupabaseClient();
  }

  /**
   * Create a new top up request
   */
  static async create(topUpData: CreateTopUpInput): Promise<TopUp> {
    // Map SUCCESS to COMPLETED for database compatibility
    let status = topUpData.status || 'PENDING';
    if (status === 'SUCCESS') {
      status = 'COMPLETED';
    }

    const insertData = {
      user_id: topUpData.user_id,
      amount: topUpData.amount,
      payment_method: topUpData.payment_method,
      status: status as 'PENDING' | 'COMPLETED' | 'FAILED',
    };

    const { data, error } = await this.supabase
      .from('topups')
      .insert(insertData as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating top up:', error);
      throw new Error(`Failed to create top up: ${error.message}`);
    }

    return data as TopUp;
  }

  /**
   * Find top up by ID
   */
  static async findById(id: string): Promise<TopUp | null> {
    const { data, error } = await this.supabase
      .from('topups')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error finding top up by ID:', error);
      return null;
    }

    return data as TopUp;
  }

  /**
   * Find top ups by user ID
   */
  static async findByUserId(
    userId: string,
    options?: {
      status?: TopUpStatus;
      limit?: number;
      offset?: number;
    }
  ): Promise<TopUp[]> {
    let query = this.supabase
      .from('topups')
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
      console.error('Error finding top ups by user ID:', error);
      return [];
    }

    return (data || []) as TopUp[];
  }

  /**
   * Get all top ups with optional filtering
   */
  static async findAll(filters?: {
    user_id?: string;
    status?: TopUpStatus;
    payment_method?: string;
    start_date?: Date;
    end_date?: Date;
    limit?: number;
    offset?: number;
  }): Promise<TopUp[]> {
    let query = this.supabase.from('topups').select('*');

    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.payment_method) {
      query = query.eq('payment_method', filters.payment_method);
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
      console.error('Error finding all top ups:', error);
      return [];
    }

    return (data || []) as TopUp[];
  }

  /**
   * Update top up
   */
  static async update(id: string, topUpData: UpdateTopUpInput): Promise<TopUp | null> {
    const updateData: any = {};

    if (topUpData.amount !== undefined) {
      updateData.amount = topUpData.amount;
    }
    if (topUpData.payment_method !== undefined) {
      updateData.payment_method = topUpData.payment_method;
    }
    if (topUpData.status !== undefined) {
      // Map SUCCESS to COMPLETED for database compatibility
      let status = topUpData.status;
      if (status === 'SUCCESS') {
        status = 'COMPLETED';
      }
      updateData.status = status as 'PENDING' | 'COMPLETED' | 'FAILED';
    }

    if (Object.keys(updateData).length === 0) {
      return this.findById(id);
    }

    const { data, error } = await (this.supabase as any)
      .from('topups')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating top up:', error);
      return null;
    }

    return data as TopUp;
  }

  /**
   * Update top up status
   */
  static async updateStatus(id: string, status: TopUpStatus): Promise<TopUp | null> {
    // Map SUCCESS to COMPLETED for database compatibility
    let dbStatus = status;
    if (status === 'SUCCESS') {
      dbStatus = 'COMPLETED';
    }

    const updateData: any = {
      status: dbStatus as 'PENDING' | 'COMPLETED' | 'FAILED'
    };

    const { data, error } = await (this.supabase as any)
      .from('topups')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating top up status:', error);
      return null;
    }

    return data as TopUp;
  }

  /**
   * Delete top up
   */
  static async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('topups')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting top up:', error);
      return false;
    }

    return true;
  }

  /**
   * Count top ups with optional filtering
   */
  static async count(filters?: {
    user_id?: string;
    status?: TopUpStatus;
    payment_method?: string;
    start_date?: Date;
    end_date?: Date;
  }): Promise<number> {
    let query = this.supabase
      .from('topups')
      .select('*', { count: 'exact', head: true });

    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.payment_method) {
      query = query.eq('payment_method', filters.payment_method);
    }

    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date.toISOString());
    }

    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date.toISOString());
    }

    const { count, error } = await query;

    if (error) {
      console.error('Error counting top ups:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Get top up statistics
   */
  static async getStatistics(filters?: {
    user_id?: string;
    start_date?: Date;
    end_date?: Date;
  }): Promise<{
    total_topups: number;
    total_amount: number;
    by_status: { status: TopUpStatus; count: number; total_amount: number }[];
    by_payment_method: { payment_method: string; count: number; total_amount: number }[];
  }> {
    // Build base query for filtering
    let baseQuery = this.supabase.from('topups').select('*');

    if (filters?.user_id) {
      baseQuery = baseQuery.eq('user_id', filters.user_id);
    }

    if (filters?.start_date) {
      baseQuery = baseQuery.gte('created_at', filters.start_date.toISOString());
    }

    if (filters?.end_date) {
      baseQuery = baseQuery.lte('created_at', filters.end_date.toISOString());
    }

    const { data: topups, error } = await baseQuery;

    if (error) {
      console.error('Error getting top up statistics:', error);
      return {
        total_topups: 0,
        total_amount: 0,
        by_status: [],
        by_payment_method: []
      };
    }

    if (!topups || topups.length === 0) {
      return {
        total_topups: 0,
        total_amount: 0,
        by_status: [],
        by_payment_method: []
      };
    }

    // Calculate statistics from the data
    const total_topups = topups.length;
    const total_amount = topups.reduce((sum: number, t: any) => sum + t.amount, 0);

    // Group by status
    const statusMap = new Map<TopUpStatus, { count: number; total_amount: number }>();
    topups.forEach((t: any) => {
      const existing = statusMap.get(t.status as TopUpStatus) || { count: 0, total_amount: 0 };
      statusMap.set(t.status as TopUpStatus, {
        count: existing.count + 1,
        total_amount: existing.total_amount + t.amount
      });
    });

    const by_status = Array.from(statusMap.entries()).map(([status, stats]) => ({
      status,
      count: stats.count,
      total_amount: stats.total_amount
    }));

    // Group by payment method
    const paymentMap = new Map<string, { count: number; total_amount: number }>();
    topups.forEach((t: any) => {
      const existing = paymentMap.get(t.payment_method) || { count: 0, total_amount: 0 };
      paymentMap.set(t.payment_method, {
        count: existing.count + 1,
        total_amount: existing.total_amount + t.amount
      });
    });

    const by_payment_method = Array.from(paymentMap.entries()).map(([payment_method, stats]) => ({
      payment_method,
      count: stats.count,
      total_amount: stats.total_amount
    }));

    return {
      total_topups,
      total_amount,
      by_status,
      by_payment_method
    };
  }

  /**
   * Get available payment methods
   */
  static async getPaymentMethods(): Promise<string[]> {
    // This could be fetched from a configuration table or environment
    // For now, returning a static list
    return [
      'Bank Transfer',
      'E-Wallet (OVO)',
      'E-Wallet (GoPay)',
      'E-Wallet (Dana)',
      'Credit Card',
      'Debit Card'
    ];
  }

  /**
   * Validate top up data
   */
  static validateTopUpData(topUpData: Partial<CreateTopUpInput>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (topUpData.amount !== undefined) {
      if (topUpData.amount < 10000) {
        errors.push('Minimum top up amount is Rp 10,000');
      }
      if (topUpData.amount > 10000000) {
        errors.push('Maximum top up amount is Rp 10,000,000');
      }
    }

    if (topUpData.payment_method !== undefined) {
      if (topUpData.payment_method.length < 1) {
        errors.push('Payment method is required');
      }
      if (topUpData.payment_method.length > 100) {
        errors.push('Payment method must not exceed 100 characters');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

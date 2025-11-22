import { getSupabaseClient } from '../config/supabase.js';

export interface ProductAccount {
  id: string;
  product_id: string;
  account_data: Record<string, any>;
  status: 'available' | 'sold';
  assigned_to_transaction_id: string | null;
  assigned_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProductAccountInput {
  product_id: string;
  account_data: Record<string, any>;
}

export interface UpdateProductAccountInput {
  account_data?: Record<string, any>;
  status?: 'available' | 'sold';
  assigned_to_transaction_id?: string | null;
  assigned_at?: string | null;
}

export const ProductAccountModel = {
  async findByProductId(productId: string, status?: 'available' | 'sold'): Promise<ProductAccount[]> {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('product_accounts')
      .select('*')
      .eq('product_id', productId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async findById(id: string): Promise<ProductAccount | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('product_accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async findByTransactionId(transactionId: string): Promise<ProductAccount | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('product_accounts')
      .select('*')
      .eq('assigned_to_transaction_id', transactionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async getAvailableAccount(productId: string): Promise<ProductAccount | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('product_accounts')
      .select('*')
      .eq('product_id', productId)
      .eq('status', 'available')
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async create(input: CreateProductAccountInput): Promise<ProductAccount> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('product_accounts')
      .insert(input as any)
      .select()
      .single();

    if (error) throw error;
    return data as ProductAccount;
  },

  async bulkCreate(accounts: CreateProductAccountInput[]): Promise<ProductAccount[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('product_accounts')
      .insert(accounts as any)
      .select();

    if (error) throw error;
    return (data || []) as ProductAccount[];
  },

  async update(id: string, input: UpdateProductAccountInput): Promise<ProductAccount> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('product_accounts')
      // @ts-ignore - Supabase type inference issue
      .update(input as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ProductAccount;
  },

  async assignToTransaction(accountId: string, transactionId: string): Promise<ProductAccount> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('product_accounts')
      // @ts-ignore - Supabase type inference issue
      .update({
        status: 'sold' as const,
        assigned_to_transaction_id: transactionId,
        assigned_at: new Date().toISOString()
      } as any)
      .eq('id', accountId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('product_accounts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getAvailableCount(productId: string): Promise<number> {
    const supabase = getSupabaseClient();
    const { count, error } = await supabase
      .from('product_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)
      .eq('status', 'available');

    if (error) throw error;
    return count || 0;
  },

  async getTotalCount(productId: string): Promise<number> {
    const supabase = getSupabaseClient();
    const { count, error } = await supabase
      .from('product_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId);

    if (error) throw error;
    return count || 0;
  }
};

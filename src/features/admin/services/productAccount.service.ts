import { supabase } from '@/clients/supabase';
import { ProductAccountField, ProductAccount, ProductAccountStats } from '../types/productAccount';

// ===== FIELD SERVICES =====
export const fetchAccountFields = async (productId: string): Promise<ProductAccountField[]> => {
  const { data, error } = await supabase
    .from('product_account_fields')
    .select('*')
    .eq('product_id', productId)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createAccountField = async (field: Omit<ProductAccountField, 'id' | 'created_at' | 'updated_at'>): Promise<ProductAccountField> => {
  const { data, error } = await supabase
    .from('product_account_fields')
    .insert(field)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAccountField = async (id: string, field: Partial<ProductAccountField>): Promise<ProductAccountField> => {
  const { data, error } = await supabase
    .from('product_account_fields')
    .update(field)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteAccountField = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('product_account_fields')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const bulkCreateFields = async (productId: string, fields: Array<{
  field_name: string;
  field_type: string;
  is_required: boolean;
}>): Promise<ProductAccountField[]> => {
  // First, delete existing fields for this product
  const { error: deleteError } = await supabase
    .from('product_account_fields')
    .delete()
    .eq('product_id', productId);

  if (deleteError) throw deleteError;

  // Then insert new fields with display_order
  const fieldsWithMeta = fields.map((field, index) => ({
    product_id: productId,
    field_name: field.field_name,
    field_type: field.field_type,
    is_required: field.is_required,
    display_order: index
  }));

  const { data, error } = await supabase
    .from('product_account_fields')
    .insert(fieldsWithMeta)
    .select();

  if (error) throw error;
  return data || [];
};

// ===== ACCOUNT SERVICES =====
export interface FetchAccountsResponse {
  accounts: ProductAccount[];
  stats: ProductAccountStats;
}

export const fetchAccounts = async (productId: string, status?: 'available' | 'sold'): Promise<FetchAccountsResponse> => {
  // Build query
  let query = supabase
    .from('product_accounts')
    .select('*')
    .eq('product_id', productId);

  // Apply status filter if provided
  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;

  const accounts = data || [];

  // Calculate stats
  const stats: ProductAccountStats = {
    available: accounts.filter(a => a.status === 'available').length,
    sold: accounts.filter(a => a.status === 'sold').length,
    total: accounts.length
  };

  return { accounts, stats };
};

export const fetchAccountById = async (id: string): Promise<ProductAccount> => {
  const { data, error } = await supabase
    .from('product_accounts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createAccount = async (productId: string, accountData: Record<string, any>): Promise<ProductAccount> => {
  const { data, error } = await supabase
    .from('product_accounts')
    .insert({
      product_id: productId,
      account_data: accountData,
      status: 'available'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAccount = async (id: string, accountData: Record<string, any>): Promise<ProductAccount> => {
  const { data, error } = await supabase
    .from('product_accounts')
    .update({
      account_data: accountData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteAccount = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('product_accounts')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const bulkCreateAccounts = async (productId: string, accounts: Array<Record<string, any>>): Promise<ProductAccount[]> => {
  const accountsWithMeta = accounts.map(accountData => ({
    product_id: productId,
    account_data: accountData,
    status: 'available' as const
  }));

  const { data, error } = await supabase
    .from('product_accounts')
    .insert(accountsWithMeta)
    .select();

  if (error) throw error;
  return data || [];
};

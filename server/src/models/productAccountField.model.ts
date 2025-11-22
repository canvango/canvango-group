import { getSupabaseClient } from '../config/supabase.js';

export interface ProductAccountField {
  id: string;
  product_id: string;
  field_name: string;
  field_type: 'text' | 'password' | 'email' | 'url' | 'textarea';
  is_required: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProductAccountFieldInput {
  product_id: string;
  field_name: string;
  field_type: 'text' | 'password' | 'email' | 'url' | 'textarea';
  is_required: boolean;
  display_order?: number;
}

export interface UpdateProductAccountFieldInput {
  field_name?: string;
  field_type?: 'text' | 'password' | 'email' | 'url' | 'textarea';
  is_required?: boolean;
  display_order?: number;
}

export const ProductAccountFieldModel = {
  async findByProductId(productId: string): Promise<ProductAccountField[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('product_account_fields')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(input: CreateProductAccountFieldInput): Promise<ProductAccountField> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('product_account_fields')
      .insert(input as any)
      .select()
      .single();

    if (error) throw error;
    return data as ProductAccountField;
  },

  async update(id: string, input: UpdateProductAccountFieldInput): Promise<ProductAccountField> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('product_account_fields')
      // @ts-ignore - Supabase type inference issue
      .update(input as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ProductAccountField;
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('product_account_fields')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async bulkCreate(fields: CreateProductAccountFieldInput[]): Promise<ProductAccountField[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('product_account_fields')
      .insert(fields as any)
      .select();

    if (error) throw error;
    return (data || []) as ProductAccountField[];
  },

  async deleteByProductId(productId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('product_account_fields')
      .delete()
      .eq('product_id', productId);

    if (error) throw error;
  }
};

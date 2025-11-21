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

export interface ProductAccountStats {
  available: number;
  total: number;
  sold: number;
}

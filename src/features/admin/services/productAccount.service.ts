import api from '../../member-area/utils/api';
import { ProductAccountField, ProductAccount, ProductAccountStats } from '../types/productAccount';

const API_BASE = '/product-accounts';

// ===== FIELD SERVICES =====
export const fetchAccountFields = async (productId: string): Promise<ProductAccountField[]> => {
  const response = await api.get(`${API_BASE}/fields/${productId}`);
  return response.data.data;
};

export const createAccountField = async (field: Omit<ProductAccountField, 'id' | 'created_at' | 'updated_at'>): Promise<ProductAccountField> => {
  const response = await api.post(`${API_BASE}/fields`, field);
  return response.data.data;
};

export const updateAccountField = async (id: string, field: Partial<ProductAccountField>): Promise<ProductAccountField> => {
  const response = await api.put(`${API_BASE}/fields/${id}`, field);
  return response.data.data;
};

export const deleteAccountField = async (id: string): Promise<void> => {
  await api.delete(`${API_BASE}/fields/${id}`);
};

export const bulkCreateFields = async (productId: string, fields: Array<{
  field_name: string;
  field_type: string;
  is_required: boolean;
}>): Promise<ProductAccountField[]> => {
  const response = await api.post(`${API_BASE}/fields/bulk`, {
    productId,
    fields
  });
  return response.data.data;
};

// ===== ACCOUNT SERVICES =====
export interface FetchAccountsResponse {
  accounts: ProductAccount[];
  stats: ProductAccountStats;
}

export const fetchAccounts = async (productId: string, status?: 'available' | 'sold'): Promise<FetchAccountsResponse> => {
  const params = status ? { status } : {};
  const response = await api.get(`${API_BASE}/accounts/${productId}`, { params });
  return response.data.data;
};

export const fetchAccountById = async (id: string): Promise<ProductAccount> => {
  const response = await api.get(`${API_BASE}/account/${id}`);
  return response.data.data;
};

export const createAccount = async (productId: string, accountData: Record<string, any>): Promise<ProductAccount> => {
  const response = await api.post(`${API_BASE}/accounts`, {
    product_id: productId,
    account_data: accountData
  });
  return response.data.data;
};

export const updateAccount = async (id: string, accountData: Record<string, any>): Promise<ProductAccount> => {
  const response = await api.put(`${API_BASE}/account/${id}`, {
    account_data: accountData
  });
  return response.data.data;
};

export const deleteAccount = async (id: string): Promise<void> => {
  await api.delete(`${API_BASE}/account/${id}`);
};

export const bulkCreateAccounts = async (productId: string, accounts: Array<Record<string, any>>): Promise<ProductAccount[]> => {
  const response = await api.post(`${API_BASE}/accounts/bulk`, {
    productId,
    accounts
  });
  return response.data.data;
};

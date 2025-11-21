/**
 * Admin Transaction Management Service
 */

import { supabase } from './supabase';

export interface TransactionFilters {
  status?: string;
  productType?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface Transaction {
  id: string;
  transaction_id: string;
  user_id: string;
  status: string;
  product_type: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'PENDING' | 'BERHASIL' | 'GAGAL' | string;
export type ProductType = 'bm_account' | 'top_up' | 'verified_bm' | 'warranty' | string;

export const getAllTransactions = async (filters: TransactionFilters, page: number = 1, limit: number = 20) => {
  return adminTransactionService.getTransactions(filters, page, limit);
};

export const updateTransactionStatus = async (transactionId: string, status: string, notes?: string) => {
  return adminTransactionService.updateTransactionStatus(transactionId, status, notes);
};

export const refundTransaction = async (transactionId: string, notes?: string) => {
  return adminTransactionService.updateTransactionStatus(transactionId, 'refunded', notes);
};

export const exportTransactions = async (filters: TransactionFilters) => {
  const result = await adminTransactionService.getTransactions(filters, 1, 10000);
  return result.transactions;
};

export const adminTransactionService = {
  async getTransactions(filters: TransactionFilters, page: number = 1, limit: number = 20) {
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.productType) {
      query = query.eq('product_type', filters.productType);
    }

    if (filters.search) {
      query = query.or(`transaction_id.ilike.%${filters.search}%,user_id.ilike.%${filters.search}%`);
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      transactions: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  },

  async updateTransactionStatus(transactionId: string, status: string, notes?: string) {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        status,
        admin_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

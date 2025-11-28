/**
 * Admin Transaction Management Service
 */

import { supabase } from '@/clients/supabase';
import { createAuditLog } from './auditLogService';

export interface TransactionFilters {
  status?: string;
  productType?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  full_name: string;
}

export interface ProductInfo {
  id: string;
  product_name: string;
  product_type: string;
  category: string;
  price: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  transaction_type: string;
  product_id: string | null;
  amount: number;
  status: string;
  payment_method: string | null;
  payment_proof_url: string | null;
  notes: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  user?: UserInfo;
  product?: ProductInfo;
  // Computed fields for UI
  product_name?: string;
  product_type?: string;
  quantity?: number;
  total_amount?: number;
}

export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'refunded';
export type ProductType = 'bm_account' | 'personal_account' | 'verified_bm' | 'whatsapp_api' | string;

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
    // Build base query
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters.endDate) {
      // Add end of day to include full day
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      query = query.lte('created_at', endDate.toISOString());
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: transactions, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!transactions || transactions.length === 0) {
      return {
        transactions: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    // Get unique user IDs and product IDs
    const userIds = [...new Set(transactions.map(t => t.user_id))];
    const productIds = [...new Set(transactions.map(t => t.product_id).filter(Boolean))];

    // Fetch users data
    const { data: users } = await supabase
      .from('users')
      .select('id, username, email, full_name')
      .in('id', userIds);

    // Fetch products data
    let products: any[] = [];
    if (productIds.length > 0) {
      const { data: productsData } = await supabase
        .from('products')
        .select('id, product_name, product_type, category, price')
        .in('id', productIds);
      products = productsData || [];
    }

    // Create lookup maps
    const userMap = new Map(users?.map(u => [u.id, u]) || []);
    const productMap = new Map(products.map(p => [p.id, p]));

    // Process transactions with joined data
    let processedTransactions = transactions.map((txn: any) => {
      const user = userMap.get(txn.user_id);
      const product = txn.product_id ? productMap.get(txn.product_id) : null;
      
      // Extract quantity from metadata
      const quantity = txn.metadata?.quantity || 1;
      
      // Get product info
      const productName = product?.product_name || 
                         (txn.transaction_type === 'topup' ? 'Top Up Saldo' : 'Unknown Product');
      const productType = product?.product_type || txn.transaction_type;

      return {
        ...txn,
        user: user,
        product: product,
        product_name: productName,
        product_type: productType,
        quantity: quantity,
        total_amount: txn.amount,
      };
    });

    // Apply client-side filters (for search and product type)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      processedTransactions = processedTransactions.filter(txn => 
        txn.user?.email?.toLowerCase().includes(searchLower) ||
        txn.user?.username?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.productType) {
      processedTransactions = processedTransactions.filter(txn => 
        txn.product?.product_type === filters.productType
      );
    }

    return {
      transactions: processedTransactions,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  },

  async updateTransactionStatus(transactionId: string, status: string, notes?: string) {
    // Get current transaction for audit log
    const { data: oldTransaction } = await supabase
      .from('transactions')
      .select('status, metadata')
      .eq('id', transactionId)
      .single();

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Add notes to metadata if provided
    if (notes) {
      updateData.metadata = {
        ...(oldTransaction?.metadata || {}),
        admin_notes: notes,
      };
    }

    // Set completed_at if status is completed
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data: transaction, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;

    // Create audit log
    await createAuditLog({
      action: 'UPDATE',
      resource: 'transactions',
      resource_id: transactionId,
      details: {
        old_status: oldTransaction?.status,
        new_status: status,
        notes: notes || null,
      }
    });

    // Fetch user and product data separately
    const { data: user } = await supabase
      .from('users')
      .select('id, username, email, full_name')
      .eq('id', transaction.user_id)
      .single();

    let product = null;
    if (transaction.product_id) {
      const { data: productData } = await supabase
        .from('products')
        .select('id, product_name, product_type, category, price')
        .eq('id', transaction.product_id)
        .single();
      product = productData;
    }

    return {
      ...transaction,
      user,
      product,
    };
  },
};

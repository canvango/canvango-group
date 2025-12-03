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
  return adminTransactionService.refundTransaction(transactionId, notes);
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
      .select('status, metadata, transaction_type')
      .eq('id', transactionId)
      .single();

    // Prevent setting status to 'refunded' directly - must use refundTransaction()
    if (status === 'refunded') {
      throw new Error('Cannot set status to refunded directly. Use refund function instead.');
    }

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

  async refundTransaction(transactionId: string, notes?: string) {
    // Get transaction details
    const { data: transaction, error: txnError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (txnError) throw txnError;
    if (!transaction) throw new Error('Transaction not found');

    // Validate: Only purchase transactions can be refunded
    if (transaction.transaction_type !== 'purchase') {
      throw new Error('Only purchase transactions can be refunded. Top-up balance remains in user account.');
    }

    // Validate: Only completed transactions can be refunded
    if (transaction.status !== 'completed') {
      throw new Error('Only completed transactions can be refunded');
    }

    // Validate: Already refunded
    if (transaction.status === 'refunded') {
      throw new Error('Transaction already refunded');
    }

    // Get user's current balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', transaction.user_id)
      .single();

    if (userError) throw userError;
    if (!user) throw new Error('User not found');

    const refundAmount = transaction.amount;
    const newBalance = Number(user.balance) + Number(refundAmount);

    // Start transaction-like operations
    // 1. Update user balance
    const { error: balanceError } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', transaction.user_id);

    if (balanceError) throw balanceError;

    // 2. Update transaction status to refunded
    const updateData: any = {
      status: 'refunded',
      updated_at: new Date().toISOString(),
      metadata: {
        ...(transaction.metadata || {}),
        refund_reason: notes || 'Refunded by admin',
        refunded_at: new Date().toISOString(),
        refund_amount: refundAmount,
        old_balance: user.balance,
        new_balance: newBalance,
      },
    };

    const { data: updatedTransaction, error: updateError } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId)
      .select()
      .single();

    if (updateError) {
      // Rollback balance if transaction update fails
      await supabase
        .from('users')
        .update({ balance: user.balance })
        .eq('id', transaction.user_id);
      throw updateError;
    }

    // 3. Create audit log
    await createAuditLog({
      action: 'REFUND',
      resource: 'transactions',
      resource_id: transactionId,
      details: {
        transaction_type: transaction.transaction_type,
        refund_amount: refundAmount,
        old_balance: user.balance,
        new_balance: newBalance,
        reason: notes || 'Refunded by admin',
      }
    });

    // Fetch user and product data for response
    const { data: userData } = await supabase
      .from('users')
      .select('id, username, email, full_name')
      .eq('id', updatedTransaction.user_id)
      .single();

    let product = null;
    if (updatedTransaction.product_id) {
      const { data: productData } = await supabase
        .from('products')
        .select('id, product_name, product_type, category, price')
        .eq('id', updatedTransaction.product_id)
        .single();
      product = productData;
    }

    return {
      ...updatedTransaction,
      user: userData,
      product,
    };
  },
};

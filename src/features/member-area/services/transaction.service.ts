import { supabase } from '@/clients/supabase';
import type { Transaction } from '../types/transaction';
import { handleSupabaseOperation } from '@/utils/supabaseErrorHandler';

interface GetTransactionsParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
}

interface GetTransactionsResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Get user transactions with pagination - Direct Supabase with timeout
 */
export async function getUserTransactions(
  params: GetTransactionsParams = {}
): Promise<GetTransactionsResponse> {
  const { page = 1, limit = 10, status } = params;
  const offset = (page - 1) * limit;
  
  // Get authenticated user with timeout
  const { data: { user } } = await handleSupabaseOperation(
    async () => supabase.auth.getUser(),
    'getUser'
  );
  
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Build query with pagination and filtering
  let queryBuilder = supabase
    .from('transactions')
    .select(`
      *,
      product:products(
        id,
        product_name,
        product_type
      )
    `, { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  // Apply status filter if provided
  if (status) {
    queryBuilder = queryBuilder.eq('status', status);
  }
  
  // Execute query with error handler and timeout
  const result = await handleSupabaseOperation(
    async () => {
      const { data, error, count } = await queryBuilder;
      return { data: { data, count }, error };
    },
    'getUserTransactions'
  );
  
  const { data, count } = result;
  
  // Calculate pagination metadata
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = offset + limit < totalCount;
  const hasPreviousPage = page > 1;
  
  // Transform data to match Transaction interface
  const transactions: Transaction[] = (data || []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    transactionType: row.transaction_type,
    type: row.transaction_type, // Alias for compatibility
    status: row.status,
    amount: parseFloat(row.amount),
    productId: row.product_id,
    productName: row.product?.product_name,
    product: row.product ? {
      id: row.product.id,
      title: row.product.product_name
    } : undefined,
    paymentMethod: row.payment_method,
    paymentProofUrl: row.payment_proof_url,
    notes: row.notes,
    metadata: row.metadata,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined
  }));
  
  return {
    transactions,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage,
      hasPreviousPage
    }
  };
}

/**
 * Get recent transactions from all users (public - for dashboard) - Direct Supabase
 */
export async function getRecentTransactions(): Promise<Transaction[]> {
  try {
    const data = await handleSupabaseOperation(
      async () => {
        return await supabase
          .from('transactions')
          .select(`
            id,
            transaction_type,
            amount,
            status,
            created_at,
            product:products(
              id,
              product_name
            )
          `)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(10);
      },
      'getRecentTransactions'
    );
    
    // Transform data to match Transaction interface
    const transactions: Transaction[] = (data || []).map((row: any) => ({
      id: row.id,
      userId: '', // Not included in public view
      transactionType: row.transaction_type,
      type: row.transaction_type, // Alias for compatibility
      status: row.status,
      amount: parseFloat(row.amount),
      productName: row.product?.product_name,
      product: row.product ? {
        id: row.product.id,
        title: row.product.product_name
      } : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.created_at), // Use created_at as fallback
    }));
    
    return transactions;
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    return [];
  }
}

import { supabase } from './supabase';
import { PAYMENT_METHODS, MIN_TOPUP_AMOUNT } from '../utils/constants';
import { handleSupabaseOperation } from '@/utils/supabaseErrorHandler';

export interface PaymentMethod {
  id: string;
  name: string;
  logo: string;
  type: string;
  enabled: boolean;
}

export interface TopUpData {
  amount: number;
  paymentMethod: string;
}

export interface TopUpResponse {
  transactionId: string;
  status: 'pending' | 'success' | 'failed';
  paymentUrl?: string;
  message: string;
  newBalance?: number;
}

/**
 * Process a top-up request using direct Supabase
 * Creates transaction record and updates user balance atomically
 */
export const processTopUp = async (data: TopUpData): Promise<TopUpResponse> => {
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Not authenticated');
  }

  // Validate amount
  if (data.amount < MIN_TOPUP_AMOUNT) {
    throw new Error(`Minimum top-up amount is Rp ${MIN_TOPUP_AMOUNT.toLocaleString('id-ID')}`);
  }

  // Validate payment method
  const paymentMethod = PAYMENT_METHODS.find(pm => pm.id === data.paymentMethod);
  if (!paymentMethod || !paymentMethod.enabled) {
    throw new Error('Invalid or disabled payment method');
  }

  // Call Supabase RPC function to process top-up atomically with error handler
  const result = await handleSupabaseOperation(
    async () => {
      return await supabase.rpc('process_topup_transaction', {
        p_user_id: user.id,
        p_amount: data.amount,
        p_payment_method: data.paymentMethod,
        p_notes: `Top-up via ${paymentMethod.name}`,
      });
    },
    'processTopUp'
  );

  if (!result || result.length === 0) {
    throw new Error('Failed to process top-up - no result returned');
  }

  const transactionResult = result[0];

  return {
    transactionId: transactionResult.transaction_id,
    status: 'success',
    message: 'Top-up berhasil! Saldo Anda telah ditambahkan.',
    newBalance: transactionResult.new_balance,
  };
};

/**
 * Fetch available payment methods
 * Returns static configuration of payment methods
 */
export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  // Return only enabled payment methods
  return PAYMENT_METHODS.filter(pm => pm.enabled);
};

/**
 * Fetch top-up history using direct Supabase
 */
export interface TopUpHistory {
  id: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: Date;
  notes?: string;
}

export const fetchTopUpHistory = async (page: number = 1, pageSize: number = 10) => {
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Not authenticated');
  }

  // Calculate offset for pagination
  const offset = (page - 1) * pageSize;

  // Query transactions table with filters using error handler
  const result = await handleSupabaseOperation(
    async () => {
      const { data, error, count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('transaction_type', 'topup')
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);
      
      return { data: { data, count }, error };
    },
    'fetchTopUpHistory'
  );

  const { data, count } = result;

  // Map to TopUpHistory interface
  const history: TopUpHistory[] = (data || []).map((transaction: any) => ({
    id: transaction.id,
    amount: Number(transaction.amount),
    paymentMethod: transaction.payment_method || 'unknown',
    status: transaction.status === 'completed' ? 'success' : transaction.status as 'pending' | 'failed',
    createdAt: new Date(transaction.created_at),
    notes: transaction.notes,
  }));

  return {
    data: history,
    pagination: {
      page,
      pageSize,
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
      hasNextPage: offset + pageSize < (count || 0),
      hasPreviousPage: page > 1,
    },
  };
};

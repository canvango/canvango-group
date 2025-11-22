import { supabase } from '@/clients/supabase';
import { handleSupabaseOperation } from '@/utils/supabaseErrorHandler';
import { VerifiedBMOrder, VerifiedBMOrderStats } from '../types/verified-bm';

/**
 * Fetch verified BM order statistics - Direct Supabase
 */
export const fetchVerifiedBMStats = async (): Promise<VerifiedBMOrderStats> => {
  return handleSupabaseOperation(async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('Not authenticated');

    const { data: orders, error } = await supabase
      .from('verified_bm_orders')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;

    const stats: VerifiedBMOrderStats = {
      totalOrders: orders?.length || 0,
      pendingOrders: orders?.filter(o => o.status === 'pending').length || 0,
      completedOrders: orders?.filter(o => o.status === 'completed').length || 0,
      failedOrders: orders?.filter(o => o.status === 'failed').length || 0,
    };

    return { data: stats, error: null };
  });
};

/**
 * Fetch verified BM orders - Direct Supabase
 */
export const fetchVerifiedBMOrders = async (): Promise<VerifiedBMOrder[]> => {
  return handleSupabaseOperation(async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('verified_bm_orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  });
};

/**
 * Submit a new verified BM order
 */
export interface SubmitVerifiedBMOrderData {
  quantity: number;
  urls: string[];
}

export interface SubmitVerifiedBMOrderResponse {
  orderId: string;
  status: 'pending' | 'success' | 'failed';
  message: string;
}

export const submitVerifiedBMOrder = async (
  data: SubmitVerifiedBMOrderData
): Promise<SubmitVerifiedBMOrderResponse> => {
  return handleSupabaseOperation(async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('Not authenticated');

    const { data: order, error } = await supabase
      .from('verified_bm_orders')
      .insert({
        user_id: user.id,
        quantity: data.quantity,
        urls: data.urls,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    const response: SubmitVerifiedBMOrderResponse = {
      orderId: order.id,
      status: 'pending',
      message: 'Order submitted successfully',
    };

    return { data: response, error: null };
  });
};

import { supabase } from '@/clients/supabase';
import { 
  VerifiedBMRequest, 
  VerifiedBMRequestStats,
  SubmitVerifiedBMRequestResponse 
} from '../types/verified-bm';

/**
 * Verified BM Service
 * Handles all verified BM related API calls
 */

/**
 * Fetch verified BM request statistics
 * Returns empty stats for guest users (no error thrown)
 */
export const fetchVerifiedBMStats = async (): Promise<VerifiedBMRequestStats> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Return empty stats for guest users (don't throw error)
    if (authError || !user) {
      return {
        totalRequests: 0,
        pendingRequests: 0,
        processingRequests: 0,
        completedRequests: 0,
        failedRequests: 0,
      };
    }

    const { data: requests, error } = await supabase
      .from('verified_bm_requests')
      .select('status')
      .eq('user_id', user.id);

    if (error) throw error;

    // Empty array is valid - user might not have any requests yet
    const reqs = requests || [];
    const stats: VerifiedBMRequestStats = {
      totalRequests: reqs.length,
      pendingRequests: reqs.filter(r => r.status === 'pending').length,
      processingRequests: reqs.filter(r => r.status === 'processing').length,
      completedRequests: reqs.filter(r => r.status === 'completed').length,
      failedRequests: reqs.filter(r => r.status === 'failed').length,
    };

    return stats;
  } catch (error: any) {
    console.error('fetchVerifiedBMStats error:', error);
    throw new Error(error.message || 'Gagal mengambil statistik');
  }
};

/**
 * Fetch verified BM requests for current user with URL details
 * Returns empty array for guest users (no error thrown)
 */
export const fetchVerifiedBMRequests = async (): Promise<VerifiedBMRequest[]> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Return empty array for guest users (don't throw error)
    if (authError || !user) {
      return [];
    }

    const { data: requests, error } = await supabase
      .from('verified_bm_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Empty array is valid - user might not have any requests yet
    if (!requests || requests.length === 0) return [];

    // Fetch URL details for all requests
    const requestIds = requests.map(r => r.id);
    const { data: urlDetails, error: urlError } = await supabase
      .from('verified_bm_urls')
      .select('*')
      .in('request_id', requestIds)
      .order('url_index', { ascending: true });

    if (urlError) throw urlError;

    // Group URL details by request_id
    const urlsByRequest = new Map();
    (urlDetails || []).forEach(url => {
      if (!urlsByRequest.has(url.request_id)) {
        urlsByRequest.set(url.request_id, []);
      }
      urlsByRequest.get(url.request_id).push(url);
    });

    // Attach URL details to requests
    const requestsWithUrls = requests.map(request => ({
      ...request,
      url_details: urlsByRequest.get(request.id) || []
    }));

    return requestsWithUrls;
  } catch (error: any) {
    console.error('fetchVerifiedBMRequests error:', error);
    throw new Error(error.message || 'Gagal mengambil daftar request');
  }
};

/**
 * Submit verified BM request
 * Calls database function that handles balance deduction
 */
export const submitVerifiedBMRequest = async (
  quantity: number,
  urls: string[]
): Promise<SubmitVerifiedBMRequestResponse> => {
  try {
    const { data, error } = await supabase.rpc('submit_verified_bm_request', {
      p_quantity: quantity,
      p_urls: urls
    });

    if (error) throw error;
    if (!data) throw new Error('Tidak ada data yang dikembalikan');

    return data;
  } catch (error: any) {
    console.error('submitVerifiedBMRequest error:', error);
    
    // Handle specific error messages from database function
    if (error.message?.includes('Saldo tidak mencukupi')) {
      throw new Error('Saldo tidak mencukupi untuk request ini');
    }
    
    throw new Error(error.message || 'Gagal membuat request');
  }
};



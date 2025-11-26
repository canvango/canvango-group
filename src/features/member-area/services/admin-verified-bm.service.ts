import { supabase } from '@/clients/supabase';
import { VerifiedBMRequest } from '../types/verified-bm';

/**
 * Admin service for managing verified BM requests
 */

export interface VerifiedBMRequestWithUser extends VerifiedBMRequest {
  user_email?: string;
  user_full_name?: string;
}

export interface AdminVerifiedBMStats {
  totalRequests: number;
  pendingRequests: number;
  processingRequests: number;
  completedRequests: number;
  failedRequests: number;
  totalRevenue: number;
}

/**
 * Fetch all verified BM requests (admin only)
 */
export const fetchAllVerifiedBMRequests = async (
  filters?: {
    status?: string;
    search?: string;
  }
): Promise<VerifiedBMRequestWithUser[]> => {
  try {
    // First, fetch requests
    let query = supabase
      .from('verified_bm_requests')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply status filter
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    const { data: requests, error: requestsError } = await query;

    if (requestsError) throw requestsError;
    if (!requests || requests.length === 0) return [];

    // Get unique user IDs
    const userIds = [...new Set(requests.map(r => r.user_id))];

    // Fetch user data from public.users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .in('id', userIds);

    if (usersError) throw usersError;

    // Fetch URL details for all requests
    const requestIds = requests.map(r => r.id);
    const { data: urlDetails, error: urlError } = await supabase
      .from('verified_bm_urls')
      .select('*')
      .in('request_id', requestIds)
      .order('url_index', { ascending: true });

    if (urlError) throw urlError;

    // Create user map for quick lookup
    const userMap = new Map(users?.map(u => [u.id, u]) || []);

    // Group URL details by request_id
    const urlsByRequest = new Map();
    (urlDetails || []).forEach(url => {
      if (!urlsByRequest.has(url.request_id)) {
        urlsByRequest.set(url.request_id, []);
      }
      urlsByRequest.get(url.request_id).push(url);
    });

    // Combine data
    let combinedRequests: VerifiedBMRequestWithUser[] = requests.map((r: any) => {
      const user = userMap.get(r.user_id);
      return {
        id: r.id,
        user_id: r.user_id,
        quantity: r.quantity,
        urls: r.urls,
        amount: r.amount,
        status: r.status,
        notes: r.notes,
        admin_notes: r.admin_notes,
        created_at: r.created_at,
        updated_at: r.updated_at,
        completed_at: r.completed_at,
        failed_at: r.failed_at,
        user_email: user?.email || 'Unknown',
        user_full_name: user?.full_name || 'Unknown User',
        url_details: urlsByRequest.get(r.id) || [],
      };
    });

    // Apply search filter after combining data
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      combinedRequests = combinedRequests.filter(r =>
        r.id.toLowerCase().includes(searchLower) ||
        r.user_email?.toLowerCase().includes(searchLower) ||
        r.user_full_name?.toLowerCase().includes(searchLower)
      );
    }

    return combinedRequests;
  } catch (error: any) {
    console.error('fetchAllVerifiedBMRequests error:', error);
    throw new Error(error.message || 'Gagal mengambil daftar request');
  }
};

/**
 * Fetch admin statistics
 */
export const fetchAdminVerifiedBMStats = async (): Promise<AdminVerifiedBMStats> => {
  try {
    const { data: requests, error } = await supabase
      .from('verified_bm_requests')
      .select('status, amount');

    if (error) throw error;

    const reqs = requests || [];
    const stats: AdminVerifiedBMStats = {
      totalRequests: reqs.length,
      pendingRequests: reqs.filter(r => r.status === 'pending').length,
      processingRequests: reqs.filter(r => r.status === 'processing').length,
      completedRequests: reqs.filter(r => r.status === 'completed').length,
      failedRequests: reqs.filter(r => r.status === 'failed').length,
      totalRevenue: reqs
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + Number(r.amount), 0),
    };

    return stats;
  } catch (error: any) {
    console.error('fetchAdminVerifiedBMStats error:', error);
    throw new Error(error.message || 'Gagal mengambil statistik');
  }
};

/**
 * Update request status
 */
export const updateRequestStatus = async (
  requestId: string,
  status: 'processing' | 'completed',
  adminNotes?: string
): Promise<VerifiedBMRequest> => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (adminNotes) {
      updateData.admin_notes = adminNotes;
    }

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('verified_bm_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Request tidak ditemukan');

    return data;
  } catch (error: any) {
    console.error('updateRequestStatus error:', error);
    throw new Error(error.message || 'Gagal update status request');
  }
};

/**
 * Mark request as failed and refund balance
 */
export const refundRequest = async (
  requestId: string,
  adminNotes: string
): Promise<any> => {
  try {
    const { data, error } = await supabase.rpc('refund_verified_bm_request', {
      p_request_id: requestId,
      p_admin_notes: adminNotes
    });

    if (error) throw error;

    return data;
  } catch (error: any) {
    console.error('refundRequest error:', error);
    throw new Error(error.message || 'Gagal refund request');
  }
};

/**
 * Get single request details with URL tracking
 */
export const getRequestDetails = async (
  requestId: string
): Promise<VerifiedBMRequestWithUser> => {
  try {
    // Fetch request
    const { data: request, error: requestError } = await supabase
      .from('verified_bm_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError) throw requestError;
    if (!request) throw new Error('Request tidak ditemukan');

    // Fetch user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, full_name, balance')
      .eq('id', request.user_id)
      .single();

    if (userError) throw userError;

    // Fetch URL details
    const { data: urlDetails, error: urlError } = await supabase
      .from('verified_bm_urls')
      .select('*')
      .eq('request_id', requestId)
      .order('url_index', { ascending: true });

    if (urlError) throw urlError;

    const requestWithUser: VerifiedBMRequestWithUser = {
      id: request.id,
      user_id: request.user_id,
      quantity: request.quantity,
      urls: request.urls,
      amount: request.amount,
      status: request.status,
      notes: request.notes,
      admin_notes: request.admin_notes,
      created_at: request.created_at,
      updated_at: request.updated_at,
      completed_at: request.completed_at,
      failed_at: request.failed_at,
      user_email: user?.email || 'Unknown',
      user_full_name: user?.full_name || 'Unknown User',
      url_details: urlDetails || [],
    };

    return requestWithUser;
  } catch (error: any) {
    console.error('getRequestDetails error:', error);
    throw new Error(error.message || 'Gagal mengambil detail request');
  }
};

/**
 * Update individual URL status
 */
export const updateURLStatus = async (
  urlId: string,
  status: 'processing' | 'completed' | 'failed',
  adminNotes?: string
): Promise<any> => {
  try {
    const { data, error } = await supabase.rpc('update_verified_bm_url_status', {
      p_url_id: urlId,
      p_status: status,
      p_admin_notes: adminNotes || null
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('updateURLStatus error:', error);
    throw new Error(error.message || 'Gagal update status URL');
  }
};

/**
 * Refund individual URL
 */
export const refundURL = async (
  urlId: string,
  adminNotes: string
): Promise<any> => {
  try {
    const { data, error } = await supabase.rpc('refund_verified_bm_url', {
      p_url_id: urlId,
      p_admin_notes: adminNotes
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('refundURL error:', error);
    throw new Error(error.message || 'Gagal refund URL');
  }
};

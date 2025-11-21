/**
 * Admin Claim Management Service
 */

import { supabase } from './supabase';

export interface ClaimFilters {
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface Claim {
  id: string;
  claim_number: string;
  user_id: string;
  status: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface UpdateClaimStatusData {
  status: string;
  notes?: string;
}

export const getAllClaims = async (filters: ClaimFilters, page: number = 1, limit: number = 20) => {
  return adminClaimService.getClaims(filters, page, limit);
};

export const updateClaimStatus = async (claimId: string, status: string, notes?: string) => {
  return adminClaimService.updateClaimStatus(claimId, status, notes);
};

export const resolveClaim = async (claimId: string, notes?: string) => {
  return adminClaimService.updateClaimStatus(claimId, 'resolved', notes);
};

export const adminClaimService = {
  async getClaims(filters: ClaimFilters, page: number = 1, limit: number = 20) {
    let query = supabase
      .from('warranty_claims')
      .select('*', { count: 'exact' });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.search) {
      query = query.or(`claim_number.ilike.%${filters.search}%,user_id.ilike.%${filters.search}%`);
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
      claims: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  },

  async updateClaimStatus(claimId: string, status: string, notes?: string) {
    const { data, error } = await supabase
      .from('warranty_claims')
      .update({
        status,
        admin_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', claimId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

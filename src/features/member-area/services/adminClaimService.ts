/**
 * Admin Claim Management Service
 */

import { supabase } from '@/clients/supabase';

export interface ClaimFilters {
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface Claim {
  id: string;
  user_id: string;
  purchase_id: string;
  claim_type: 'replacement' | 'refund' | 'repair';
  reason: string;
  evidence_urls?: string[];
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolution_details?: any;
  user?: {
    id: string;
    username: string;
    email: string;
    full_name: string;
  };
  purchase?: {
    id: string;
    product_id: string;
    account_details: any;
    warranty_expires_at: string;
    total_price: number;
    created_at: string;
    products: {
      product_name: string;
      product_type: string;
      category: string;
      price: number;
    };
  };
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

export const provideReplacementAccount = async (
  claimId: string,
  accountDetails: any,
  adminNotes?: string
) => {
  return adminClaimService.provideReplacementAccount(claimId, accountDetails, adminNotes);
};

export const adminClaimService = {
  async getClaims(filters: ClaimFilters, page: number = 1, limit: number = 20) {
    console.log('🔍 Fetching claims with filters:', filters);
    console.log('📍 Page:', page, 'Limit:', limit);
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    console.log('👤 Current user:', user?.email, 'ID:', user?.id);
    
    if (!user) {
      console.error('❌ No authenticated user');
      throw new Error('Not authenticated');
    }
    
    let query = supabase
      .from('warranty_claims')
      .select('*', { count: 'exact' });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.search) {
      query = query.or(`reason.ilike.%${filters.search}%`);
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: claims, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching claims:', error);
      throw error;
    }

    console.log('✅ Claims fetched:', claims?.length, 'claims');

    // Fetch related data manually
    if (claims && claims.length > 0) {
      const userIds = [...new Set(claims.map((c: any) => c.user_id))];
      const purchaseIds = [...new Set(claims.map((c: any) => c.purchase_id))];

      // Fetch users
      const { data: users } = await supabase
        .from('users')
        .select('id, username, email, full_name')
        .in('id', userIds);

      // Fetch purchases with products
      const { data: purchases } = await supabase
        .from('purchases')
        .select(`
          id,
          product_id,
          account_details,
          warranty_expires_at,
          total_price,
          created_at,
          products (
            product_name,
            product_type,
            category,
            price
          )
        `)
        .in('id', purchaseIds);

      console.log('✅ Users fetched:', users?.length);
      console.log('✅ Purchases fetched:', purchases?.length);

      // Map data
      const enrichedClaims = claims.map((claim: any) => ({
        ...claim,
        user: users?.find((u: any) => u.id === claim.user_id),
        purchase: purchases?.find((p: any) => p.id === claim.purchase_id),
      }));

      return {
        claims: enrichedClaims,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    }

    return {
      claims: claims || [],
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

  async provideReplacementAccount(
    claimId: string,
    accountDetails: any,
    adminNotes?: string
  ) {
    const { data, error } = await supabase
      .from('warranty_claims')
      .update({
        status: 'completed',
        admin_notes: adminNotes,
        resolution_details: {
          replacement_account: {
            ...accountDetails,
            provided_at: new Date().toISOString(),
          },
        },
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', claimId)
      .select()
      .single();

    if (error) {
      console.error('Error providing replacement account:', error);
      throw error;
    }
    return data;
  },
};

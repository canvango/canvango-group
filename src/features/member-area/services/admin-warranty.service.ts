import { supabase } from '@/clients/supabase';
import { handleSupabaseOperation } from '@/utils/supabaseErrorHandler';

export interface WarrantyClaim {
  id: string;
  user_id: string;
  purchase_id: string;
  claim_type: 'replacement' | 'refund' | 'repair';
  reason: string;
  evidence_urls: string[];
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed';
  admin_notes: string | null;
  resolution_details: any;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  user?: {
    id: string;
    username: string;
    email: string;
    full_name: string;
  };
  purchase?: {
    id: string;
    product_id: string;
    product_name: string;
    product_type: string;
    category: string;
    account_details: any;
    warranty_expires_at: string;
  };
}

export interface GetAllWarrantyClaimsParams {
  status?: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed';
  page?: number;
  limit?: number;
}

export interface GetAllWarrantyClaimsResponse {
  claims: WarrantyClaim[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateWarrantyClaimStatusData {
  status: 'reviewing' | 'approved' | 'rejected' | 'completed';
  admin_notes?: string;
}

export interface WarrantyClaimStats {
  total: number;
  pending: number;
  reviewing: number;
  approved: number;
  rejected: number;
  completed: number;
  successRate: number;
  claimsByMonth: { [key: string]: number };
}

/**
 * Get all warranty claims with filtering - Direct Supabase
 */
export const getAllWarrantyClaims = async (
  params?: GetAllWarrantyClaimsParams
): Promise<GetAllWarrantyClaimsResponse> => {
  const { status, page = 1, limit = 10 } = params || {};
  const offset = (page - 1) * limit;

  return handleSupabaseOperation(async () => {
    let query = supabase
      .from('warranty_claims')
      .select(`
        *,
        user:users(id, username, email, full_name),
        purchase:purchases(
          id,
          product_id,
          product_name,
          product_type,
          category,
          account_details,
          warranty_expires_at
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: {
        claims: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
      error: null,
    };
  });
};

/**
 * Update warranty claim status - Direct Supabase
 */
export const updateWarrantyClaimStatus = async (
  claimId: string,
  data: UpdateWarrantyClaimStatusData
): Promise<WarrantyClaim> => {
  return handleSupabaseOperation(async () => {
    const updateData: any = {
      status: data.status,
      updated_at: new Date().toISOString(),
    };

    if (data.admin_notes) {
      updateData.admin_notes = data.admin_notes;
    }

    if (data.status === 'approved' || data.status === 'rejected' || data.status === 'completed') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data: claim, error } = await supabase
      .from('warranty_claims')
      .update(updateData)
      .eq('id', claimId)
      .select(`
        *,
        user:users(id, username, email, full_name),
        purchase:purchases(
          id,
          product_id,
          product_name,
          product_type,
          category,
          account_details,
          warranty_expires_at
        )
      `)
      .single();

    if (error) throw error;
    return { data: claim, error: null };
  });
};

/**
 * Get warranty claim statistics - Direct Supabase
 */
export const getWarrantyClaimStats = async (): Promise<WarrantyClaimStats> => {
  return handleSupabaseOperation(async () => {
    const { data: claims, error } = await supabase
      .from('warranty_claims')
      .select('status, created_at');

    if (error) throw error;

    const stats = {
      total: claims?.length || 0,
      pending: claims?.filter(c => c.status === 'pending').length || 0,
      reviewing: claims?.filter(c => c.status === 'reviewing').length || 0,
      approved: claims?.filter(c => c.status === 'approved').length || 0,
      rejected: claims?.filter(c => c.status === 'rejected').length || 0,
      completed: claims?.filter(c => c.status === 'completed').length || 0,
      successRate: 0,
      claimsByMonth: {} as { [key: string]: number },
    };

    // Calculate success rate
    const resolved = stats.approved + stats.rejected + stats.completed;
    if (resolved > 0) {
      stats.successRate = ((stats.approved + stats.completed) / resolved) * 100;
    }

    // Group by month
    claims?.forEach(claim => {
      const month = new Date(claim.created_at).toISOString().slice(0, 7);
      stats.claimsByMonth[month] = (stats.claimsByMonth[month] || 0) + 1;
    });

    return { data: stats, error: null };
  });
};

/**
 * Process refund for approved warranty claim - Direct Supabase
 */
export const processWarrantyRefund = async (claimId: string): Promise<any> => {
  return handleSupabaseOperation(async () => {
    // Get claim details
    const { data: claim, error: claimError } = await supabase
      .from('warranty_claims')
      .select('*, purchase:purchases(*, product:products(*))')
      .eq('id', claimId)
      .single();

    if (claimError) throw claimError;
    if (!claim) throw new Error('Claim not found');
    if (claim.status !== 'approved') throw new Error('Only approved claims can be refunded');

    // Create refund transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: claim.user_id,
        transaction_type: 'refund',
        amount: claim.purchase.product.price || 0,
        status: 'completed',
        description: `Refund for warranty claim #${claimId}`,
        metadata: { claim_id: claimId, purchase_id: claim.purchase_id },
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    // Update user balance
    const { error: balanceError } = await supabase.rpc('update_user_balance', {
      p_user_id: claim.user_id,
      p_amount: claim.purchase.product.price || 0,
    });

    if (balanceError) throw balanceError;

    // Update claim status to completed
    const { error: updateError } = await supabase
      .from('warranty_claims')
      .update({
        status: 'completed',
        resolution_details: { refund_transaction_id: transaction.id },
        resolved_at: new Date().toISOString(),
      })
      .eq('id', claimId);

    if (updateError) throw updateError;

    return { data: { transaction, claim }, error: null };
  });
};

import { supabase } from '@/clients/supabase';
import { ClaimReason } from '../types/warranty';
import { handleSupabaseOperation, handleSupabaseMutation } from '@/utils/supabaseErrorHandler';

export interface SubmitClaimData {
  accountId: string;
  reason: ClaimReason | string;
  description: string;
  screenshotUrls?: string[];
}

// Database types matching actual schema
export interface WarrantyClaimDB {
  id: string;
  user_id: string;
  purchase_id: string;
  claim_type: string;
  reason: string;
  evidence_urls: string[] | null;
  status: string;
  admin_notes: string | null;
  resolution_details: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  purchase?: {
    id: string;
    product_id: string;
    product_name: string | null;
    product_type: string | null;
    category: string | null;
    account_details: Record<string, any>;
    warranty_expires_at: string | null;
    status: string;
    product?: {
      id: string;
      product_name: string;
      product_type: string;
      category: string;
    };
  };
}

export interface WarrantyClaimsResponse {
  claims: WarrantyClaimDB[];
  total: number;
}

// Type for eligible account (purchase with product info)
export interface EligibleAccount {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_type: string;
  category: string;
  transaction_id: string;
  status: string;
  account_details: Record<string, any>;
  warranty_expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface EligibleAccountsResponse {
  accounts: EligibleAccount[];
  total: number;
}

/**
 * Fetch all warranty claims for the current user - Direct Supabase
 */
export const fetchWarrantyClaims = async (): Promise<WarrantyClaimsResponse> => {
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Not authenticated');
  }
  
  // Query warranty claims with relations using error handler
  const data = await handleSupabaseOperation(
    async () => {
      return await supabase
        .from('warranty_claims')
        .select(`
          *,
          purchase:purchases(
            id,
            product_id,
            product_name,
            product_type,
            category,
            account_details,
            warranty_expires_at,
            status,
            product:products(
              id,
              product_name,
              product_type,
              category
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
    },
    'fetchWarrantyClaims'
  );
  
  return {
    claims: data || [],
    total: data?.length || 0
  };
};

/**
 * Fetch a specific warranty claim by ID - Direct Supabase
 */
export const fetchClaimById = async (claimId: string): Promise<WarrantyClaimDB> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Not authenticated');
  }
  
  return await handleSupabaseOperation(
    async () => {
      return await supabase
        .from('warranty_claims')
        .select(`
          *,
          purchase:purchases(
            id,
            product_id,
            product_name,
            product_type,
            category,
            account_details,
            warranty_expires_at,
            status,
            product:products(
              id,
              product_name,
              product_type,
              category
            )
          )
        `)
        .eq('id', claimId)
        .eq('user_id', user.id)
        .single();
    },
    'fetchClaimById'
  );
};

/**
 * Submit a new warranty claim - Direct Supabase with validation
 */
export const submitWarrantyClaim = async (claimData: SubmitClaimData): Promise<WarrantyClaimDB> => {
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Not authenticated');
  }
  
  // Validate warranty eligibility - fetch purchase with product info
  const purchase = await handleSupabaseOperation(
    async () => {
      return await supabase
        .from('purchases')
        .select(`
          *,
          product:products(*)
        `)
        .eq('id', claimData.accountId)
        .eq('user_id', user.id)
        .single();
    },
    'submitWarrantyClaim:validatePurchase'
  ) as any; // Type assertion needed due to complex Supabase query types
  
  // Check warranty expiration
  if (purchase.warranty_expires_at) {
    const warrantyExpires = new Date(purchase.warranty_expires_at);
    const now = new Date();
    if (warrantyExpires < now) {
      throw new Error('Warranty has expired for this purchase');
    }
  } else {
    throw new Error('This purchase does not have warranty coverage');
  }
  
  // Check if already claimed (approved or pending)
  const { data: existingClaim, error: claimCheckError } = await supabase
    .from('warranty_claims')
    .select('id, status')
    .eq('purchase_id', claimData.accountId)
    .in('status', ['pending', 'reviewing', 'approved'])
    .maybeSingle();
  
  if (claimCheckError) {
    throw claimCheckError;
  }
  
  if (existingClaim) {
    throw new Error('A warranty claim is already pending or approved for this purchase');
  }
  
  // Submit claim using mutation handler
  return await handleSupabaseMutation(
    async () => {
      return await supabase
        .from('warranty_claims')
        .insert({
          user_id: user.id,
          purchase_id: claimData.accountId,
          claim_type: 'warranty',
          reason: claimData.reason,
          evidence_urls: claimData.screenshotUrls || [],
          status: 'pending',
        })
        .select(`
          *,
          purchase:purchases(
            id,
            product_id,
            product_name,
            product_type,
            category,
            account_details,
            warranty_expires_at,
            status,
            product:products(
              id,
              product_name,
              product_type,
              category
            )
          )
        `)
        .single();
    },
    'submitWarrantyClaim:insert'
  ) as WarrantyClaimDB;
};

/**
 * Fetch accounts eligible for warranty claim - Direct Supabase
 */
export const fetchEligibleAccounts = async (): Promise<EligibleAccountsResponse> => {
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Not authenticated');
  }
  
  // Query purchases with active warranty using error handler
  const data = await handleSupabaseOperation(
    async () => {
      return await supabase
        .from('purchases')
        .select(`
          *,
          product:products(
            id,
            product_name,
            product_type,
            category
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .not('warranty_expires_at', 'is', null)
        .gt('warranty_expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
    },
    'fetchEligibleAccounts'
  );
  
  // Transform data to match expected format
  const accounts: EligibleAccount[] = (data || []).map(purchase => ({
    id: purchase.id,
    user_id: purchase.user_id,
    product_id: purchase.product_id,
    product_name: purchase.product_name || purchase.product?.product_name || 'Unknown Product',
    product_type: purchase.product_type || purchase.product?.product_type || 'Unknown Type',
    category: purchase.category || purchase.product?.category || 'Unknown Category',
    transaction_id: purchase.transaction_id || '',
    status: purchase.status,
    account_details: purchase.account_details || {},
    warranty_expires_at: purchase.warranty_expires_at || '',
    created_at: purchase.created_at,
    updated_at: purchase.updated_at,
  }));
  
  return {
    accounts,
    total: accounts.length
  };
};

/**
 * Warranty statistics interface
 */
export interface WarrantyStats {
  total: number;
  pending: number;
  reviewing: number;
  approved: number;
  rejected: number;
  completed: number;
}

/**
 * Fetch warranty claim statistics - Direct Supabase with aggregation
 */
export const fetchWarrantyStats = async (): Promise<WarrantyStats> => {
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Not authenticated');
  }
  
  // Fetch all claims for the user using error handler
  const claims = await handleSupabaseOperation(
    async () => {
      return await supabase
        .from('warranty_claims')
        .select('status')
        .eq('user_id', user.id);
    },
    'fetchWarrantyStats'
  );
  
  // Aggregate stats
  const stats: WarrantyStats = {
    total: claims?.length || 0,
    pending: 0,
    reviewing: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
  };
  
  // Count by status
  claims?.forEach(claim => {
    const status = claim.status.toLowerCase();
    if (status === 'pending') stats.pending++;
    else if (status === 'reviewing') stats.reviewing++;
    else if (status === 'approved') stats.approved++;
    else if (status === 'rejected') stats.rejected++;
    else if (status === 'completed') stats.completed++;
  });
  
  return stats;
};

/*  */import { Request, Response } from 'express';
import { getSupabaseClient } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';

const supabase = getSupabaseClient();

/**
 * Get all warranty claims for the current user
 * @route GET /api/warranty/claims
 * @access Private
 */
export const getWarrantyClaims = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, 'WARRANTY_000', 'User ID is required', 401);
    }

    // Fetch claims
    const { data: claims, error } = await supabase
      .from('warranty_claims')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching warranty claims:', error);
      return sendError(res, 'WARRANTY_001', 'Failed to fetch warranty claims', 500);
    }

    console.log('✅ Warranty claims fetched:', claims?.length || 0, 'claims');

    // Fetch related purchases with products
    if (claims && claims.length > 0) {
      const purchaseIds = [...new Set(claims.map((c: any) => c.purchase_id))];
      
      const { data: purchases } = await supabase
        .from('purchases')
        .select(`
          id,
          product_id,
          account_details,
          warranty_expires_at,
          products(
            product_name,
            product_type,
            category
          )
        `)
        .in('id', purchaseIds);

      console.log('✅ Purchases fetched:', purchases?.length || 0);

      // Map data
      const enrichedClaims = claims.map((claim: any) => ({
        ...claim,
        purchase: purchases?.find((p: any) => p.id === claim.purchase_id),
      }));

      return sendSuccess(res, {
        claims: enrichedClaims,
        total: enrichedClaims.length
      }, 'Warranty claims retrieved successfully');
    }

    return sendSuccess(res, {
      claims: claims || [],
      total: claims?.length || 0
    }, 'Warranty claims retrieved successfully');
  } catch (error: any) {
    console.error('Get warranty claims error:', error);
    return sendError(res, 'WARRANTY_002', 'Failed to retrieve warranty claims', 500);
  }
};

/**
 * Get a specific warranty claim by ID
 * @route GET /api/warranty/claims/:id
 * @access Private
 */
export const getClaimById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return sendError(res, 'WARRANTY_000', 'User ID is required', 401);
    }

    const { data: claim, error } = await supabase
      .from('warranty_claims')
      .select(`
        *,
        purchases!inner(
          id,
          product_id,
          account_details,
          warranty_expires_at,
          products(
            product_name,
            product_type,
            category
          )
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !claim) {
      return sendError(res, 'WARRANTY_003', 'Warranty claim not found', 404);
    }

    return sendSuccess(res, claim, 'Warranty claim retrieved successfully');
  } catch (error: any) {
    console.error('Get claim by ID error:', error);
    return sendError(res, 'WARRANTY_004', 'Failed to retrieve warranty claim', 500);
  }
};

/**
 * Submit a new warranty claim
 * @route POST /api/warranty/claims
 * @access Private
 */
export const submitWarrantyClaim = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { accountId, reason, description, screenshotUrls } = req.body;

    if (!userId) {
      return sendError(res, 'WARRANTY_000', 'User ID is required', 401);
    }

    // Validate required fields
    if (!accountId || !reason || !description) {
      return sendError(res, 'WARRANTY_005', 'Account ID, reason, and description are required', 400);
    }

    // Check if purchase exists and belongs to user
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', userId)
      .single();

    if (purchaseError || !purchase) {
      return sendError(res, 'WARRANTY_006', 'Purchase not found or does not belong to you', 404);
    }

    // Check if purchase is eligible for warranty claim
    if ((purchase as any).status !== 'active') {
      return sendError(res, 'WARRANTY_007', 'Only active purchases can be claimed', 400);
    }

    // Check if warranty has expired
    if (new Date((purchase as any).warranty_expires_at) < new Date()) {
      return sendError(res, 'WARRANTY_008', 'Warranty has expired', 400);
    }

    // Check if there's already an active claim for this purchase
    const { data: existingClaim } = await supabase
      .from('warranty_claims')
      .select('id')
      .eq('purchase_id', accountId)
      .in('status', ['pending', 'reviewing'])
      .single();

    if (existingClaim) {
      return sendError(res, 'WARRANTY_009', 'There is already an active claim for this purchase', 400);
    }

    // Map reason to claim_type
    // Most warranty claims will be replacement type
    // Admin can change this later if needed
    const claimType = 'replacement';

    // Create warranty claim
    const { data: claim, error: claimError } = await supabase
      .from('warranty_claims')
      .insert({
        user_id: userId,
        purchase_id: accountId,
        claim_type: claimType,
        reason: `${reason}: ${description}`,
        evidence_urls: screenshotUrls || [],
        status: 'pending'
      } as any)
      .select()
      .single();

    if (claimError) {
      console.error('Error creating warranty claim:', claimError);
      return sendError(res, 'WARRANTY_010', 'Failed to create warranty claim', 500);
    }

    return sendSuccess(res, claim, 'Warranty claim submitted successfully', 201);
  } catch (error: any) {
    console.error('Submit warranty claim error:', error);
    return sendError(res, 'WARRANTY_011', 'Failed to submit warranty claim', 500);
  }
};

/**
 * Get eligible accounts for warranty claim
 * @route GET /api/warranty/eligible-accounts
 * @access Private
 */
export const getEligibleAccounts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, 'WARRANTY_000', 'User ID is required', 401);
    }

    // Get active purchases with valid warranty - using direct columns (no JOIN needed)
    const { data: purchases, error } = await supabase
      .from('purchases')
      .select(`
        id,
        user_id,
        product_id,
        product_name,
        product_type,
        category,
        transaction_id,
        status,
        account_details,
        warranty_expires_at,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('warranty_expires_at', new Date().toISOString())
      .not('product_id', 'is', null)
      .not('product_name', 'is', null);

    if (error) {
      console.error('Error fetching eligible accounts:', error);
      return sendError(res, 'WARRANTY_012', 'Failed to fetch eligible accounts', 500);
    }

    console.log('📦 Purchases found:', purchases?.length || 0);
    
    // Ensure account_details is properly serialized as object (not string)
    const normalizedPurchases = purchases?.map((purchase: any) => {
      let accountDetails = purchase.account_details;
      
      // If account_details is string, parse it
      if (typeof accountDetails === 'string') {
        try {
          accountDetails = JSON.parse(accountDetails);
        } catch (e) {
          console.error('Failed to parse account_details:', e);
          accountDetails = {};
        }
      }
      
      // Ensure it's an object
      if (!accountDetails || typeof accountDetails !== 'object') {
        accountDetails = {};
      }
      
      return {
        ...purchase,
        account_details: accountDetails
      };
    }) || [];
    
    // Debug: Log first purchase to check product data
    if (normalizedPurchases.length > 0) {
      const firstPurchase = normalizedPurchases[0];
      console.log('📋 Sample purchase data:', {
        id: firstPurchase.id.slice(0, 8),
        product_name: firstPurchase.product_name,
        product_type: firstPurchase.product_type,
        category: firstPurchase.category,
        warranty_expires_at: firstPurchase.warranty_expires_at,
        account_details_type: typeof firstPurchase.account_details,
        account_details_keys: Object.keys(firstPurchase.account_details || {})
      });
    }

    // Filter out purchases that already have active claims
    const eligiblePurchases: any[] = [];
    for (const purchase of normalizedPurchases) {
      const { data: activeClaim } = await supabase
        .from('warranty_claims')
        .select('id')
        .eq('purchase_id', purchase.id)
        .in('status', ['pending', 'reviewing'])
        .maybeSingle();

      if (!activeClaim) {
        eligiblePurchases.push(purchase);
      }
    }

    console.log('✅ Eligible accounts:', eligiblePurchases.length);
    
    // Final check: Log products in eligible purchases
    if (eligiblePurchases.length > 0) {
      console.log('📋 Products in eligible purchases:', 
        eligiblePurchases.map((p: any) => ({
          purchaseId: p.id.slice(0, 8),
          product_name: p.product_name,
          product_type: p.product_type,
          category: p.category,
          account_details_type: typeof p.account_details,
          has_account_details: !!p.account_details
        }))
      );
    }

    return sendSuccess(res, {
      accounts: eligiblePurchases,
      total: eligiblePurchases.length
    }, 'Eligible accounts retrieved successfully');
  } catch (error: any) {
    console.error('Get eligible accounts error:', error);
    return sendError(res, 'WARRANTY_013', 'Failed to retrieve eligible accounts', 500);
  }
};

/**
 * Get warranty claim statistics
 * @route GET /api/warranty/stats
 * @access Private
 */
export const getWarrantyStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, 'WARRANTY_000', 'User ID is required', 401);
    }

    const { data: claims, error } = await supabase
      .from('warranty_claims')
      .select('status')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching warranty stats:', error);
      return sendError(res, 'WARRANTY_014', 'Failed to fetch warranty stats', 500);
    }

    const stats = {
      pending: claims?.filter((c: any) => c.status === 'pending' || c.status === 'reviewing').length || 0,
      approved: claims?.filter((c: any) => c.status === 'approved' || c.status === 'completed').length || 0,
      rejected: claims?.filter((c: any) => c.status === 'rejected').length || 0,
      successRate: 0
    };

    const total = stats.approved + stats.rejected;
    if (total > 0) {
      stats.successRate = Math.round((stats.approved / total) * 100);
    }

    console.log('📊 Stats:', stats);

    return sendSuccess(res, stats, 'Warranty stats retrieved successfully');
  } catch (error: any) {
    console.error('Get warranty stats error:', error);
    return sendError(res, 'WARRANTY_015', 'Failed to retrieve warranty stats', 500);
  }
};

import { Request, Response } from 'express';
import { getSupabaseClient } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';

const supabase = getSupabaseClient();

/**
 * Get all warranty claims with filtering
 * @route GET /api/admin/warranty-claims
 * @access Admin only
 */
export const getAllWarrantyClaims = async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Build query - fetch claims first
    let query = supabase
      .from('warranty_claims')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    // Apply status filter if provided
    if (status && ['pending', 'reviewing', 'approved', 'rejected', 'completed'].includes(status as string)) {
      query = query.eq('status', status);
    }

    const { data: claims, error, count } = await query;

    if (error) {
      console.error('Error fetching warranty claims:', error);
      return sendError(res, 'ADMIN_WARRANTY_001', 'Failed to fetch warranty claims', 500);
    }

    console.log('✅ Claims fetched:', claims?.length);

    // Fetch related data manually
    if (claims && claims.length > 0) {
      const userIds = [...new Set(claims.map((c: any) => c.user_id))];
      const purchaseIds = [...new Set(claims.map((c: any) => c.purchase_id))];

      // Fetch users
      const { data: users } = await supabase
        .from('users')
        .select('id, username, email, full_name')
        .in('id', userIds);

      // Fetch purchases - no JOIN needed, product info in direct columns
      const { data: purchases } = await supabase
        .from('purchases')
        .select(`
          id,
          product_id,
          product_name,
          product_type,
          category,
          account_details,
          warranty_expires_at
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

      return sendSuccess(res, {
        claims: enrichedClaims,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limitNum)
        }
      }, 'Warranty claims retrieved successfully');
    }

    return sendSuccess(res, {
      claims: claims || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum)
      }
    }, 'Warranty claims retrieved successfully');
  } catch (error: any) {
    console.error('Get all warranty claims error:', error);
    return sendError(res, 'ADMIN_WARRANTY_002', 'Failed to retrieve warranty claims', 500);
  }
};

/**
 * Update warranty claim status
 * @route PUT /api/admin/warranty-claims/:id
 * @access Admin only
 */
export const updateWarrantyClaimStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    // Validate status
    if (!status || !['reviewing', 'approved', 'rejected', 'completed'].includes(status)) {
      return sendError(res, 'ADMIN_WARRANTY_003', 'Invalid status. Must be: reviewing, approved, rejected, or completed', 400);
    }

    // Check if claim exists
    const { data: existingClaim, error: fetchError } = await supabase
      .from('warranty_claims')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingClaim) {
      return sendError(res, 'ADMIN_WARRANTY_004', 'Warranty claim not found', 404);
    }

    // Update claim
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (admin_notes) {
      updateData.admin_notes = admin_notes;
    }

    if (status === 'approved' || status === 'rejected' || status === 'completed') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data: updatedClaim, error: updateError } = await (supabase
      .from('warranty_claims') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating warranty claim:', updateError);
      return sendError(res, 'ADMIN_WARRANTY_005', 'Failed to update warranty claim', 500);
    }

    // If approved and claim_type is refund, update purchase status
    if (status === 'approved' && (existingClaim as any).claim_type === 'refund') {
      await (supabase
        .from('purchases') as any)
        .update({ status: 'claimed' })
        .eq('id', (existingClaim as any).purchase_id);
    }

    return sendSuccess(res, updatedClaim, `Warranty claim ${status} successfully`);
  } catch (error: any) {
    console.error('Update warranty claim status error:', error);
    return sendError(res, 'ADMIN_WARRANTY_006', 'Failed to update warranty claim status', 500);
  }
};

/**
 * Get warranty claim statistics
 * @route GET /api/admin/warranty-claims/stats
 * @access Admin only
 */
export const getWarrantyClaimStats = async (req: Request, res: Response) => {
  try {
    const { data: claims, error } = await supabase
      .from('warranty_claims')
      .select('status, created_at');

    if (error) {
      console.error('Error fetching warranty claim stats:', error);
      return sendError(res, 'ADMIN_WARRANTY_007', 'Failed to fetch warranty claim stats', 500);
    }

    const stats = {
      total: claims?.length || 0,
      pending: claims?.filter((c: any) => c.status === 'pending').length || 0,
      reviewing: claims?.filter((c: any) => c.status === 'reviewing').length || 0,
      approved: claims?.filter((c: any) => c.status === 'approved').length || 0,
      rejected: claims?.filter((c: any) => c.status === 'rejected').length || 0,
      completed: claims?.filter((c: any) => c.status === 'completed').length || 0,
      successRate: 0
    };

    const resolved = stats.approved + stats.rejected;
    if (resolved > 0) {
      stats.successRate = Math.round((stats.approved / resolved) * 100);
    }

    // Get claims by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentClaims = claims?.filter((c: any) => 
      new Date(c.created_at) >= sixMonthsAgo
    ) || [];

    const claimsByMonth: { [key: string]: number } = {};
    recentClaims.forEach((claim: any) => {
      const month = new Date(claim.created_at).toISOString().substring(0, 7); // YYYY-MM
      claimsByMonth[month] = (claimsByMonth[month] || 0) + 1;
    });

    return sendSuccess(res, {
      ...stats,
      claimsByMonth
    }, 'Warranty claim stats retrieved successfully');
  } catch (error: any) {
    console.error('Get warranty claim stats error:', error);
    return sendError(res, 'ADMIN_WARRANTY_008', 'Failed to retrieve warranty claim stats', 500);
  }
};

/**
 * Process refund for approved warranty claim
 * @route POST /api/admin/warranty-claims/:id/refund
 * @access Admin only
 */
export const processWarrantyRefund = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get claim with purchase and user info
    const { data: claim, error: claimError } = await supabase
      .from('warranty_claims')
      .select(`
        *,
        purchase:purchases!inner(
          id,
          total_price,
          user_id
        )
      `)
      .eq('id', id)
      .single();

    if (claimError || !claim) {
      return sendError(res, 'ADMIN_WARRANTY_009', 'Warranty claim not found', 404);
    }

    // Check if claim is approved
    if ((claim as any).status !== 'approved') {
      return sendError(res, 'ADMIN_WARRANTY_010', 'Only approved claims can be refunded', 400);
    }

    // Check if claim type is refund
    if ((claim as any).claim_type !== 'refund') {
      return sendError(res, 'ADMIN_WARRANTY_011', 'Only refund type claims can be processed for refund', 400);
    }

    const purchase = (claim as any).purchase;
    const refundAmount = parseFloat(purchase.total_price);

    // Get user current balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', purchase.user_id)
      .single();

    if (userError || !user) {
      return sendError(res, 'ADMIN_WARRANTY_012', 'User not found', 404);
    }

    const newBalance = parseFloat((user as any).balance) + refundAmount;

    // Update user balance
    const { error: balanceError } = await (supabase
      .from('users') as any)
      .update({ balance: newBalance })
      .eq('id', purchase.user_id);

    if (balanceError) {
      console.error('Error updating user balance:', balanceError);
      return sendError(res, 'ADMIN_WARRANTY_013', 'Failed to process refund', 500);
    }

    // Update claim status to completed
    const { data: updatedClaim, error: updateError } = await (supabase
      .from('warranty_claims') as any)
      .update({
        status: 'completed',
        resolved_at: new Date().toISOString(),
        resolution_details: {
          refund_amount: refundAmount,
          refund_processed_at: new Date().toISOString()
        }
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating claim:', updateError);
      return sendError(res, 'ADMIN_WARRANTY_014', 'Failed to update claim status', 500);
    }

    // Update purchase status
    await (supabase
      .from('purchases') as any)
      .update({ status: 'claimed' })
      .eq('id', purchase.id);

    // Create refund transaction
    await (supabase
      .from('transactions') as any)
      .insert({
        user_id: purchase.user_id,
        transaction_type: 'refund',
        amount: refundAmount,
        status: 'completed',
        notes: `Refund for warranty claim ${id}`,
        metadata: {
          warranty_claim_id: id,
          purchase_id: purchase.id
        }
      });

    return sendSuccess(res, {
      claim: updatedClaim,
      refund_amount: refundAmount,
      new_balance: newBalance
    }, 'Refund processed successfully');
  } catch (error: any) {
    console.error('Process warranty refund error:', error);
    return sendError(res, 'ADMIN_WARRANTY_015', 'Failed to process refund', 500);
  }
};

import { Request, Response } from 'express';
import { ClaimModel } from '../models/Claim.model.js';
import { UserModel } from '../models/User.model.js';
import { AdminAuditLogModel } from '../models/AdminAuditLog.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Get all claims with filtering
 * GET /api/admin/claims
 */
export async function getAllClaims(req: Request, res: Response): Promise<void> {
  try {
    const { status, user_id, transaction_id, page = '1', limit = '10' } = req.query;

    // Parse pagination parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Build filters
    const filters: any = {
      limit: limitNum,
      offset: offset,
    };

    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status as string)) {
      filters.status = status;
    }

    if (user_id && typeof user_id === 'string') {
      filters.user_id = user_id;
    }

    if (transaction_id && typeof transaction_id === 'string') {
      filters.transaction_id = transaction_id;
    }

    // Get claims and total count
    const [claims, totalCount] = await Promise.all([
      ClaimModel.findAll(filters),
      ClaimModel.count({
        status: filters.status,
        user_id: filters.user_id,
        transaction_id: filters.transaction_id,
      }),
    ]);

    // Enrich claims with user information
    const enrichedClaims = await Promise.all(
      claims.map(async (claim) => {
        const user = await UserModel.findById(claim.user_id);
        return {
          ...claim,
          user: user ? {
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
          } : null,
        };
      })
    );

    res.status(200).json(successResponse({
      claims: enrichedClaims,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    }));
  } catch (error) {
    console.error('Get all claims error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch claims'
    ));
  }
}

/**
 * Update claim status (approve/reject)
 * PUT /api/admin/claims/:id
 */
export async function updateClaimStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status, response_note } = req.body;

    // Validate status
    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'Status must be either APPROVED or REJECTED'
      ));
      return;
    }

    // Check if claim exists
    const existingClaim = await ClaimModel.findById(id);
    if (!existingClaim) {
      res.status(404).json(errorResponse(
        'CLAIM_NOT_FOUND',
        'Claim not found'
      ));
      return;
    }

    // Check if claim is already resolved
    if (existingClaim.status !== 'PENDING') {
      res.status(400).json(errorResponse(
        'CLAIM_ALREADY_RESOLVED',
        'Claim has already been resolved'
      ));
      return;
    }

    // Update claim status
    const updatedClaim = await ClaimModel.updateStatus(id, status, response_note);

    // Log action
    if (req.user) {
      await AdminAuditLogModel.logClaimAction(
        req.user.userId,
        status === 'APPROVED' ? 'APPROVE' : 'REJECT',
        id,
        {
          old_status: existingClaim.status,
          new_status: status,
          response_note: response_note || null,
        },
        req.ip,
        req.get('user-agent')
      );
    }

    res.status(200).json(successResponse(
      updatedClaim,
      `Claim ${status.toLowerCase()} successfully`
    ));
  } catch (error) {
    console.error('Update claim status error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to update claim status'
    ));
  }
}

/**
 * Resolve approved claim (process refund)
 * POST /api/admin/claims/:id/resolve
 */
export async function resolveClaim(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Check if claim exists
    const claim = await ClaimModel.findById(id);
    if (!claim) {
      res.status(404).json(errorResponse(
        'CLAIM_NOT_FOUND',
        'Claim not found'
      ));
      return;
    }

    // Check if claim is approved
    if (claim.status !== 'APPROVED') {
      res.status(400).json(errorResponse(
        'CLAIM_NOT_APPROVED',
        'Only approved claims can be resolved'
      ));
      return;
    }

    // Get transaction to determine refund amount
    const { TransactionModel } = await import('../models/Transaction.model.js');
    const transaction = await TransactionModel.findById(claim.transaction_id);
    if (!transaction) {
      res.status(404).json(errorResponse(
        'TRANSACTION_NOT_FOUND',
        'Transaction not found'
      ));
      return;
    }

    // Get user
    const user = await UserModel.findById(claim.user_id);
    if (!user) {
      res.status(404).json(errorResponse(
        'USER_NOT_FOUND',
        'User not found'
      ));
      return;
    }

    // Process refund - add transaction amount to user balance
    const oldBalance = user.balance;
    const refundAmount = transaction.amount;
    await UserModel.updateBalance(claim.user_id, refundAmount);

    // Log action
    if (req.user) {
      await AdminAuditLogModel.logClaimAction(
        req.user.userId,
        'RESOLVE',
        id,
        {
          claim_id: claim.id,
          transaction_id: transaction.id,
          user_id: claim.user_id,
          refund_amount: refundAmount,
          old_balance: oldBalance,
          new_balance: oldBalance + refundAmount,
        },
        req.ip,
        req.get('user-agent')
      );
    }

    res.status(200).json(successResponse(
      {
        claim,
        refund_amount: refundAmount,
        new_balance: oldBalance + refundAmount,
      },
      'Claim resolved and refund processed successfully'
    ));
  } catch (error) {
    console.error('Resolve claim error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to resolve claim'
    ));
  }
}

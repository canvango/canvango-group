import { Request, Response } from 'express';
import { ClaimModel } from '../models/Claim.model.js';
import { TransactionModel } from '../models/Transaction.model.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Create a new claim
 * @route POST /api/claims
 * @access Private (Member only)
 */
export const createClaim = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { transaction_id, reason, description } = req.body;

    // Validate required fields
    if (!transaction_id || !reason || !description) {
      return sendError(res, 'CLAIM_001', 'Transaction ID, reason, and description are required', 400);
    }

    // Validate claim data
    const validation = ClaimModel.validateClaimData({ reason, description });
    if (!validation.valid) {
      return sendError(res, 'CLAIM_002', validation.errors.join(', '), 400);
    }

    // Check if transaction exists and belongs to user
    const transaction = await TransactionModel.findById(transaction_id);
    if (!transaction) {
      return sendError(res, 'CLAIM_003', 'Transaction not found', 404);
    }

    if (transaction.user_id !== userId) {
      return sendError(res, 'CLAIM_004', 'You can only claim your own transactions', 403);
    }

    // Check if transaction is eligible for claim (must be BERHASIL)
    if (transaction.status !== 'BERHASIL') {
      return sendError(res, 'CLAIM_005', 'Only successful transactions can be claimed', 400);
    }

    // Check if transaction already has an active claim
    const hasActiveClaim = await ClaimModel.hasActiveClaim(transaction_id);
    if (hasActiveClaim) {
      return sendError(res, 'CLAIM_006', 'This transaction already has an active claim', 400);
    }

    // Create claim
    const claim = await ClaimModel.create({
      user_id: userId!,
      transaction_id,
      reason,
      description,
      status: 'PENDING'
    });

    return sendSuccess(res, claim, 'Claim submitted successfully', 201);
  } catch (error: any) {
    console.error('Create claim error:', error);
    return sendError(res, 'CLAIM_007', 'Failed to create claim', 500);
  }
};

/**
 * Get user's claims
 * @route GET /api/claims
 * @access Private (Member only)
 */
export const getUserClaims = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { status, limit = '10', offset = '0' } = req.query;

    const claims = await ClaimModel.findByUserId(userId!, {
      status: status as any,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    const total = await ClaimModel.count({ user_id: userId });

    return sendSuccess(res, {
      claims,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    }, 'Claims retrieved successfully');
  } catch (error: any) {
    console.error('Get user claims error:', error);
    return sendError(res, 'CLAIM_008', 'Failed to retrieve claims', 500);
  }
};

/**
 * Get claim by ID
 * @route GET /api/claims/:id
 * @access Private (Member only)
 */
export const getClaimById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const claim = await ClaimModel.findById(id);
    if (!claim) {
      return sendError(res, 'CLAIM_009', 'Claim not found', 404);
    }

    // Check if claim belongs to user
    if (claim.user_id !== userId) {
      return sendError(res, 'CLAIM_010', 'You can only view your own claims', 403);
    }

    return sendSuccess(res, claim, 'Claim retrieved successfully');
  } catch (error: any) {
    console.error('Get claim by ID error:', error);
    return sendError(res, 'CLAIM_011', 'Failed to retrieve claim', 500);
  }
};

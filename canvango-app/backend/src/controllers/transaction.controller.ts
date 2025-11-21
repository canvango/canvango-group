import { Request, Response } from 'express';
import { TransactionModel } from '../models/Transaction.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Get transactions for current user with pagination
 * GET /api/transactions
 * Requirements: 7.1, 7.8
 */
export async function getUserTransactions(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse(
        'AUTH_003',
        'Not authenticated'
      ));
      return;
    }

    // Parse pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Parse optional status filter
    const status = req.query.status as string | undefined;

    // Get transactions for current user
    const transactions = await TransactionModel.findByUserId(
      req.user.userId,
      {
        status: status as any,
        limit,
        offset
      }
    );

    // Get total count for pagination
    const totalCount = await TransactionModel.count({
      user_id: req.user.userId,
      status: status as any
    });

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json(successResponse({
      transactions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    }));
  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to get transactions'
    ));
  }
}

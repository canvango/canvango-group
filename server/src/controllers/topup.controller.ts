import { Request, Response } from 'express';
import { TopUpModel } from '../models/TopUp.model.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Get available payment methods
 * @route GET /api/topup/methods
 * @access Public
 */
export const getPaymentMethods = async (req: Request, res: Response) => {
  try {
    const methods = await TopUpModel.getPaymentMethods();
    return sendSuccess(res, methods, 'Payment methods retrieved successfully');
  } catch (error: any) {
    console.error('Get payment methods error:', error);
    return sendError(res, 'TOPUP_001', 'Failed to retrieve payment methods', 500);
  }
};

/**
 * Create a new top up request
 * @route POST /api/topup
 * @access Private (Member only)
 */
export const createTopUp = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { amount, payment_method } = req.body;

    if (!userId) {
      return sendError(res, 'AUTH_ERROR', 'User not authenticated', 401);
    }

    // Validate required fields
    if (!amount || !payment_method) {
      return sendError(res, 'TOPUP_002', 'Amount and payment method are required', 400);
    }

    // Validate amount
    if (amount < 10000) {
      return sendError(res, 'TOPUP_003', 'Minimum top up amount is Rp 10,000', 400);
    }
    if (amount > 10000000) {
      return sendError(res, 'TOPUP_003', 'Maximum top up amount is Rp 10,000,000', 400);
    }

    // Import TransactionModel
    const { TransactionModel } = await import('../models/Transaction.model.js');

    // Create transaction with completed status (for testing without payment gateway)
    // In production, this should be 'pending' and updated after payment verification
    const transaction = await TransactionModel.create({
      user_id: userId,
      transaction_type: 'topup',
      amount: amount,
      status: 'completed', // Auto-complete for testing
      payment_method: payment_method,
      notes: 'Top up saldo'
    });

    // Note: Balance will be automatically updated by trigger 'trigger_auto_update_balance'

    return sendSuccess(res, {
      transactionId: transaction.id,
      status: 'success',
      message: 'Top up berhasil! Saldo Anda telah ditambahkan.',
      amount: amount
    }, 'Top up completed successfully', 201);
  } catch (error: any) {
    console.error('Create top up error:', error);
    return sendError(res, 'TOPUP_004', error.message || 'Failed to create top up request', 500);
  }
};

/**
 * Get user's top up history
 * @route GET /api/topup
 * @access Private (Member only)
 */
export const getUserTopUps = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { status, limit = '10', offset = '0' } = req.query;

    if (!userId) {
      return sendError(res, 'AUTH_ERROR', 'User not authenticated', 401);
    }

    // Import TransactionModel
    const { TransactionModel } = await import('../models/Transaction.model.js');

    // Get topup transactions
    const transactions = await TransactionModel.findAll({
      user_id: userId,
      transaction_type: 'topup',
      status: status as any,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    const total = await TransactionModel.count({
      user_id: userId,
      transaction_type: 'topup',
      status: status as any
    });

    return sendSuccess(res, {
      topups: transactions,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    }, 'Top ups retrieved successfully');
  } catch (error: any) {
    console.error('Get user top ups error:', error);
    return sendError(res, 'TOPUP_005', 'Failed to retrieve top ups', 500);
  }
};

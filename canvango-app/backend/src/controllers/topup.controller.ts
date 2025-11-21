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

    // Validate required fields
    if (!amount || !payment_method) {
      return sendError(res, 'TOPUP_002', 'Amount and payment method are required', 400);
    }

    // Validate top up data
    const validation = TopUpModel.validateTopUpData({ amount, payment_method });
    if (!validation.valid) {
      return sendError(res, 'TOPUP_003', validation.errors.join(', '), 400);
    }

    // Create top up request
    const topUp = await TopUpModel.create({
      user_id: userId!,
      amount,
      payment_method,
      status: 'PENDING'
    });

    return sendSuccess(res, topUp, 'Top up request created successfully', 201);
  } catch (error: any) {
    console.error('Create top up error:', error);
    return sendError(res, 'TOPUP_004', 'Failed to create top up request', 500);
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

    const topUps = await TopUpModel.findByUserId(userId!, {
      status: status as any,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    const total = await TopUpModel.count({ user_id: userId });

    return sendSuccess(res, {
      topups: topUps,
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

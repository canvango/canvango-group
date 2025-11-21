import { Request, Response } from 'express';
import { TransactionModel } from '../models/Transaction.model.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { getSupabaseClient } from '../config/supabase.js';

/**
 * Get recent transactions from all users (public)
 * GET /api/transactions/recent
 * For dashboard display - shows recent activity
 */
export async function getRecentTransactions(req: Request, res: Response): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const supabase = getSupabaseClient();

    // Use raw SQL query for better control
    const { data: transactions, error } = await (supabase.rpc as any)('get_recent_transactions_public', {
      p_limit: limit
    });

    if (error) {
      console.error('Get recent transactions error:', error);
      
      // Fallback to direct query if function doesn't exist
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fallbackError) {
        console.error('Fallback query error:', fallbackError);
        res.status(500).json(errorResponse(
          'INTERNAL_ERROR',
          'Failed to get recent transactions'
        ));
        return;
      }

      // Get product and user info separately
      const transactionsWithDetails = await Promise.all(
        (fallbackData || []).map(async (tx: any) => {
          let productName: string | null = null;
          let userEmail: string | null = null;

          if (tx.product_id) {
            const { data: product } = await supabase
              .from('products')
              .select('product_name')
              .eq('id', tx.product_id)
              .maybeSingle();
            productName = (product as any)?.product_name || null;
          }

          if (tx.user_id) {
            const { data: user } = await supabase
              .from('users')
              .select('email')
              .eq('id', tx.user_id)
              .maybeSingle();
            userEmail = (user as any)?.email || null;
          }

          return {
            id: tx.id,
            transactionType: tx.transaction_type,
            status: tx.status,
            amount: parseFloat(tx.amount),
            paymentMethod: tx.payment_method,
            createdAt: tx.created_at,
            productName: productName || (tx.transaction_type === 'topup' ? 'Top Up Saldo' : null),
            quantity: tx.metadata?.quantity || 1,
            username: userEmail ? userEmail.substring(0, 3) + '****' : 'user****'
          };
        })
      );

      res.status(200).json(successResponse({
        transactions: transactionsWithDetails
      }));
      return;
    }

    res.status(200).json(successResponse({
      transactions: transactions || []
    }));
  } catch (error) {
    console.error('Get recent transactions error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to get recent transactions'
    ));
  }
}

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

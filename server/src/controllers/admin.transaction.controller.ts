import { Request, Response } from 'express';
import { TransactionModel, TransactionStatus, ProductType } from '../models/Transaction.model.js';
import { UserModel } from '../models/User.model.js';
import { AdminAuditLogModel } from '../models/AdminAuditLog.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Get all transactions with filtering and pagination
 * GET /api/admin/transactions
 */
export async function getAllTransactions(req: Request, res: Response): Promise<void> {
  try {
    const { 
      status, 
      product_type,
      user_id,
      start_date,
      end_date,
      page = '1', 
      limit = '10' 
    } = req.query;

    // Parse pagination parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Build filters
    const filters: any = {
      limit: limitNum,
      offset: offset,
    };

    if (status && ['BERHASIL', 'PENDING', 'GAGAL'].includes(status as string)) {
      filters.status = status as TransactionStatus;
    }

    if (product_type && ['RMSO_NEW', 'PERSONAL_TUA', 'RM_NEW', 'RM_TUA', 'J202_VERIFIED_BM'].includes(product_type as string)) {
      filters.product_type = product_type as ProductType;
    }

    if (user_id && typeof user_id === 'string') {
      filters.user_id = user_id;
    }

    if (start_date && typeof start_date === 'string') {
      filters.start_date = new Date(start_date);
    }

    if (end_date && typeof end_date === 'string') {
      filters.end_date = new Date(end_date);
    }

    // Get transactions and total count
    const [transactions, totalCount] = await Promise.all([
      TransactionModel.findAll(filters),
      TransactionModel.count({
        status: filters.status,
        product_type: filters.product_type,
        user_id: filters.user_id,
        start_date: filters.start_date,
        end_date: filters.end_date,
      }),
    ]);

    // Get user information for each transaction
    const transactionsWithUsers = await Promise.all(
      transactions.map(async (transaction) => {
        const user = await UserModel.findById(transaction.user_id);
        return {
          ...transaction,
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
      transactions: transactionsWithUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    }));
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch transactions'
    ));
  }
}


/**
 * Update transaction status
 * PUT /api/admin/transactions/:id
 */
export async function updateTransactionStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !['BERHASIL', 'PENDING', 'GAGAL'].includes(status)) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'Status must be one of: BERHASIL, PENDING, GAGAL'
      ));
      return;
    }

    // Check if transaction exists
    const existingTransaction = await TransactionModel.findById(id);
    if (!existingTransaction) {
      res.status(404).json(errorResponse(
        'TRANSACTION_NOT_FOUND',
        'Transaction not found'
      ));
      return;
    }

    // Update transaction status
    const updatedTransaction = await TransactionModel.updateStatus(id, status as TransactionStatus);

    // Log action
    if (req.user) {
      await AdminAuditLogModel.logTransactionAction(
        req.user.userId,
        'UPDATE',
        id,
        { old_status: existingTransaction.status, new_status: status },
        req.ip,
        req.get('user-agent')
      );
    }

    res.status(200).json(successResponse(
      updatedTransaction,
      'Transaction status updated successfully'
    ));
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to update transaction status'
    ));
  }
}


/**
 * Process refund for a transaction
 * POST /api/admin/transactions/:id/refund
 */
export async function refundTransaction(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Check if transaction exists
    const transaction = await TransactionModel.findById(id);
    if (!transaction) {
      res.status(404).json(errorResponse(
        'TRANSACTION_NOT_FOUND',
        'Transaction not found'
      ));
      return;
    }

    // Check if transaction is eligible for refund (must be BERHASIL)
    if (transaction.status !== 'BERHASIL') {
      res.status(400).json(errorResponse(
        'INVALID_STATUS',
        'Only successful transactions can be refunded'
      ));
      return;
    }

    // Get user
    const user = await UserModel.findById(transaction.user_id);
    if (!user) {
      res.status(404).json(errorResponse(
        'USER_NOT_FOUND',
        'User not found'
      ));
      return;
    }

    // Refund user balance (atomic operation to prevent race condition)
    const updatedUser = await UserModel.updateBalance(transaction.user_id, transaction.total_amount);
    if (!updatedUser) {
      res.status(500).json(errorResponse(
        'BALANCE_UPDATE_ERROR',
        'Failed to refund balance'
      ));
      return;
    }

    // Update transaction status to GAGAL (refunded)
    const updatedTransaction = await TransactionModel.updateStatus(id, 'GAGAL');

    // Log action
    if (req.user) {
      await AdminAuditLogModel.logTransactionAction(
        req.user.userId,
        'REFUND',
        id,
        {
          transaction_id: id,
          user_id: transaction.user_id,
          refund_amount: transaction.total_amount,
          old_balance: user.balance,
          new_balance: newBalance,
          reason: reason || 'Admin refund',
        },
        req.ip,
        req.get('user-agent')
      );
    }

    res.status(200).json(successResponse(
      {
        transaction: updatedTransaction,
        refund_amount: transaction.total_amount,
        new_user_balance: newBalance,
      },
      'Transaction refunded successfully'
    ));
  } catch (error) {
    console.error('Refund transaction error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to process refund'
    ));
  }
}


/**
 * Export transactions to CSV
 * GET /api/admin/transactions/export
 */
export async function exportTransactions(req: Request, res: Response): Promise<void> {
  try {
    const { 
      status, 
      product_type,
      user_id,
      start_date,
      end_date,
    } = req.query;

    // Build filters (no pagination for export)
    const filters: any = {};

    if (status && ['BERHASIL', 'PENDING', 'GAGAL'].includes(status as string)) {
      filters.status = status as TransactionStatus;
    }

    if (product_type && ['RMSO_NEW', 'PERSONAL_TUA', 'RM_NEW', 'RM_TUA', 'J202_VERIFIED_BM'].includes(product_type as string)) {
      filters.product_type = product_type as ProductType;
    }

    if (user_id && typeof user_id === 'string') {
      filters.user_id = user_id;
    }

    if (start_date && typeof start_date === 'string') {
      filters.start_date = new Date(start_date);
    }

    if (end_date && typeof end_date === 'string') {
      filters.end_date = new Date(end_date);
    }

    // Get all transactions matching filters
    const transactions = await TransactionModel.findAll(filters);

    // Get user information for each transaction
    const transactionsWithUsers = await Promise.all(
      transactions.map(async (transaction) => {
        const user = await UserModel.findById(transaction.user_id);
        return {
          ...transaction,
          username: user?.username || 'Unknown',
          user_email: user?.email || 'Unknown',
          user_full_name: user?.full_name || 'Unknown',
        };
      })
    );

    // Generate CSV content
    const csvHeaders = [
      'ID',
      'User ID',
      'Username',
      'Email',
      'Full Name',
      'Product Name',
      'Product Type',
      'Quantity',
      'Total Amount',
      'Status',
      'Created At',
      'Updated At',
    ];

    const csvRows = transactionsWithUsers.map(t => [
      t.id,
      t.user_id,
      t.username,
      t.user_email,
      t.user_full_name,
      t.product_name,
      t.product_type,
      t.quantity,
      t.total_amount,
      t.status,
      new Date(t.created_at).toISOString(),
      new Date(t.updated_at).toISOString(),
    ]);

    // Create CSV string
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="transactions_${Date.now()}.csv"`);
    
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Export transactions error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to export transactions'
    ));
  }
}

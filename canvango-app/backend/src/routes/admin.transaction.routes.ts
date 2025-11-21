import { Router } from 'express';
import {
  getAllTransactions,
  updateTransactionStatus,
  refundTransaction,
  exportTransactions,
} from '../controllers/admin.transaction.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// All admin transaction routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('admin'));

/**
 * @route   GET /api/admin/transactions/export
 * @desc    Export transactions to CSV
 * @access  Admin only
 */
router.get('/export', exportTransactions);

/**
 * @route   GET /api/admin/transactions
 * @desc    Get all transactions with filtering and pagination
 * @access  Admin only
 */
router.get('/', getAllTransactions);

/**
 * @route   PUT /api/admin/transactions/:id
 * @desc    Update transaction status
 * @access  Admin only
 */
router.put('/:id', updateTransactionStatus);

/**
 * @route   POST /api/admin/transactions/:id/refund
 * @desc    Process refund for a transaction
 * @access  Admin only
 */
router.post('/:id/refund', refundTransaction);

export default router;

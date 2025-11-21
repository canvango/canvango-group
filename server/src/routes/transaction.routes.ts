import { Router } from 'express';
import { getUserTransactions, getRecentTransactions } from '../controllers/transaction.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

/**
 * @route   GET /api/transactions/recent
 * @desc    Get recent transactions from all users (public)
 * @access  Public
 */
router.get('/recent', getRecentTransactions);

/**
 * @route   GET /api/transactions
 * @desc    Get transactions for current user with pagination
 * @access  Private (Member only)
 */
router.get('/', authenticate, requireRole('member', 'admin'), getUserTransactions);

export default router;

import { Router } from 'express';
import { getPaymentMethods, createTopUp, getUserTopUps } from '../controllers/topup.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

/**
 * @route   GET /api/topup/methods
 * @desc    Get available payment methods
 * @access  Public
 */
router.get('/methods', getPaymentMethods);

/**
 * @route   POST /api/topup
 * @desc    Create a new top up request
 * @access  Private (Member only)
 */
router.post('/', authenticate, requireRole('member', 'admin'), createTopUp);

/**
 * @route   GET /api/topup
 * @desc    Get user's top up history
 * @access  Private (Member only)
 */
router.get('/', authenticate, requireRole('member', 'admin'), getUserTopUps);

export default router;

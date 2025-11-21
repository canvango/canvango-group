import { Router } from 'express';
import {
  getWarrantyClaims,
  getClaimById,
  submitWarrantyClaim,
  getEligibleAccounts,
  getWarrantyStats
} from '../controllers/warranty.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

/**
 * @route   GET /api/warranty/claims
 * @desc    Get all warranty claims for the current user
 * @access  Private (Member only)
 */
router.get('/claims', authenticate, requireRole('member', 'admin'), getWarrantyClaims);

/**
 * @route   GET /api/warranty/claims/:id
 * @desc    Get a specific warranty claim by ID
 * @access  Private (Member only)
 */
router.get('/claims/:id', authenticate, requireRole('member', 'admin'), getClaimById);

/**
 * @route   POST /api/warranty/claims
 * @desc    Submit a new warranty claim
 * @access  Private (Member only)
 */
router.post('/claims', authenticate, requireRole('member', 'admin'), submitWarrantyClaim);

/**
 * @route   GET /api/warranty/eligible-accounts
 * @desc    Get eligible accounts for warranty claim
 * @access  Private (Member only)
 */
router.get('/eligible-accounts', authenticate, requireRole('member', 'admin'), getEligibleAccounts);

/**
 * @route   GET /api/warranty/stats
 * @desc    Get warranty claim statistics
 * @access  Private (Member only)
 */
router.get('/stats', authenticate, requireRole('member', 'admin'), getWarrantyStats);

export default router;

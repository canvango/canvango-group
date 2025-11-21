import { Router } from 'express';
import { createClaim, getUserClaims, getClaimById } from '../controllers/claim.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

/**
 * @route   POST /api/claims
 * @desc    Create a new claim
 * @access  Private (Member only)
 */
router.post('/', authenticate, requireRole('member', 'admin'), createClaim);

/**
 * @route   GET /api/claims
 * @desc    Get user's claims
 * @access  Private (Member only)
 */
router.get('/', authenticate, requireRole('member', 'admin'), getUserClaims);

/**
 * @route   GET /api/claims/:id
 * @desc    Get claim by ID
 * @access  Private (Member only)
 */
router.get('/:id', authenticate, requireRole('member', 'admin'), getClaimById);

export default router;

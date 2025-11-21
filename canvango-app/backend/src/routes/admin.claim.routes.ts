import { Router } from 'express';
import {
  getAllClaims,
  updateClaimStatus,
  resolveClaim,
} from '../controllers/admin.claim.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// All admin claim routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('admin'));

/**
 * @route   GET /api/admin/claims
 * @desc    Get all claims with filtering
 * @access  Admin only
 */
router.get('/', getAllClaims);

/**
 * @route   PUT /api/admin/claims/:id
 * @desc    Update claim status (approve/reject)
 * @access  Admin only
 */
router.put('/:id', updateClaimStatus);

/**
 * @route   POST /api/admin/claims/:id/resolve
 * @desc    Resolve approved claim (process refund)
 * @access  Admin only
 */
router.post('/:id/resolve', resolveClaim);

export default router;

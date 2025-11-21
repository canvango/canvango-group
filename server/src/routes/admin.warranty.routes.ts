import { Router } from 'express';
import {
  getAllWarrantyClaims,
  updateWarrantyClaimStatus,
  getWarrantyClaimStats,
  processWarrantyRefund
} from '../controllers/admin.warranty.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

/**
 * @route   GET /api/admin/warranty-claims/stats
 * @desc    Get warranty claim statistics
 * @access  Admin only
 */
router.get('/stats', authenticate, requireRole('admin'), getWarrantyClaimStats);

/**
 * @route   GET /api/admin/warranty-claims
 * @desc    Get all warranty claims with filtering
 * @access  Admin only
 */
router.get('/', authenticate, requireRole('admin'), getAllWarrantyClaims);

/**
 * @route   PUT /api/admin/warranty-claims/:id
 * @desc    Update warranty claim status
 * @access  Admin only
 */
router.put('/:id', authenticate, requireRole('admin'), updateWarrantyClaimStatus);

/**
 * @route   POST /api/admin/warranty-claims/:id/refund
 * @desc    Process refund for approved warranty claim
 * @access  Admin only
 */
router.post('/:id/refund', authenticate, requireRole('admin'), processWarrantyRefund);

export default router;

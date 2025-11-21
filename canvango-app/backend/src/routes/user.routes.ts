import { Router } from 'express';
import { getCurrentUserProfile, updateCurrentUserProfile } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private (Member, Admin)
 */
router.get('/me', authenticate, getCurrentUserProfile);

/**
 * @route   PUT /api/users/me
 * @desc    Update current user profile
 * @access  Private (Member, Admin)
 */
router.put('/me', authenticate, updateCurrentUserProfile);

export default router;

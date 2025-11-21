import { Router } from 'express';
import { getEmailFromIdentifier, checkUsernameAvailability } from '../controllers/auth.controller.js';

const router = Router();

/**
 * @route   POST /api/auth/get-email
 * @desc    Get email from username or email identifier
 * @access  Public
 */
router.post('/get-email', getEmailFromIdentifier);

/**
 * @route   POST /api/auth/check-username
 * @desc    Check if username is available (case-insensitive)
 * @access  Public
 */
router.post('/check-username', checkUsernameAvailability);

export default router;

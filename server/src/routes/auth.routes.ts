import { Router } from 'express';
import { 
  getEmailFromIdentifier, 
  checkUsernameAvailability,
  sendOTP,
  verifyOTP,
  resendOTP
} from '../controllers/auth.controller.js';

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

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to phone number for registration
 * @access  Public
 */
router.post('/send-otp', sendOTP);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP code
 * @access  Public
 */
router.post('/verify-otp', verifyOTP);

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP to phone number
 * @access  Public
 */
router.post('/resend-otp', resendOTP);

export default router;

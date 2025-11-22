import { Request, Response } from 'express';
import { UserModel } from '../models/User.model.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { getSupabaseClient } from '../config/supabase.js';
import { sendOTPSMS } from '../services/sms.service.js';

const supabase = getSupabaseClient();

/**
 * Get email from username or email identifier (for login)
 * POST /api/auth/get-email
 * This endpoint helps convert username to email for Supabase authentication
 */
export async function getEmailFromIdentifier(req: Request, res: Response): Promise<void> {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'Identifier (username or email) is required'
      ));
      return;
    }

    // Check if identifier is an email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(identifier);

    let email: string;

    if (isEmail) {
      // If it's already an email, return it
      email = identifier;
    } else {
      // If it's a username, find the user and get their email
      const user = await UserModel.findByUsername(identifier);
      
      if (!user) {
        res.status(404).json(errorResponse(
          'USER_NOT_FOUND',
          'User not found'
        ));
        return;
      }

      email = user.email;
    }

    res.status(200).json(successResponse({ email }));
  } catch (error) {
    console.error('Get email from identifier error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to get email'
    ));
  }
}

/**
 * Check if username is available (case-insensitive)
 * POST /api/auth/check-username
 * This endpoint checks if a username is available for registration
 */
export async function checkUsernameAvailability(req: Request, res: Response): Promise<void> {
  try {
    const { username } = req.body;

    if (!username) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'Username is required'
      ));
      return;
    }

    // Validate username format
    if (username.length < 3) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'Username must be at least 3 characters long'
      ));
      return;
    }

    if (username.length > 50) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'Username must not exceed 50 characters'
      ));
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'Username can only contain letters, numbers, and underscores'
      ));
      return;
    }

    // Check if username exists (case-insensitive)
    const existingUser = await UserModel.findByUsername(username);

    res.status(200).json(successResponse({
      available: !existingUser,
      username: username
    }));
  } catch (error) {
    console.error('Check username availability error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to check username availability'
    ));
  }
}

/**
 * Send OTP to phone number
 * POST /api/auth/send-otp
 * Body: { phone: string }
 */
export async function sendOTP(req: Request, res: Response): Promise<void> {
  try {
    const { phone } = req.body;

    if (!phone) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'Phone number is required'
      ));
      return;
    }

    // Validate phone format (Indonesian: +62xxx or 08xxx)
    const phoneRegex = /^(\+?62|0)8[0-9]{8,12}$/;
    if (!phoneRegex.test(phone)) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'Invalid phone number format. Use +62xxx or 08xxx'
      ));
      return;
    }

    // Normalize phone to +62 format
    let normalizedPhone = phone;
    if (phone.startsWith('0')) {
      normalizedPhone = '+62' + phone.substring(1);
    } else if (!phone.startsWith('+')) {
      normalizedPhone = '+' + phone;
    }

    // Check if phone already registered
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, phone')
      .eq('phone', normalizedPhone)
      .single();

    if (existingUser) {
      res.status(400).json(errorResponse(
        'PHONE_ALREADY_REGISTERED',
        'Phone number already registered'
      ));
      return;
    }

    // Generate OTP using database function
    const { data: otpData, error: otpError } = await (supabase as any)
      .rpc('create_phone_otp', { p_phone: normalizedPhone });

    if (otpError) {
      console.error('OTP generation error:', otpError);
      res.status(500).json(errorResponse(
        'OTP_GENERATION_FAILED',
        'Failed to generate OTP'
      ));
      return;
    }

    const otp = otpData?.[0] || otpData;

    // Send OTP via SMS service
    try {
      await sendOTPSMS(normalizedPhone, otp.otp_code);
    } catch (smsError) {
      console.error('SMS sending failed:', smsError);
      // Continue even if SMS fails (for development)
      // In production, you might want to return error here
    }

    res.status(200).json(successResponse({
      message: 'OTP sent successfully',
      phone: normalizedPhone,
      otp_id: otp.otp_id,
      expires_at: otp.expires_at,
      // REMOVE THIS IN PRODUCTION:
      otp_code: process.env.NODE_ENV === 'development' ? otp.otp_code : undefined
    }));
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to send OTP'
    ));
  }
}

/**
 * Verify OTP code
 * POST /api/auth/verify-otp
 * Body: { phone: string, otp_code: string }
 */
export async function verifyOTP(req: Request, res: Response): Promise<void> {
  try {
    const { phone, otp_code } = req.body;

    if (!phone || !otp_code) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'Phone number and OTP code are required'
      ));
      return;
    }

    // Normalize phone
    let normalizedPhone = phone;
    if (phone.startsWith('0')) {
      normalizedPhone = '+62' + phone.substring(1);
    } else if (!phone.startsWith('+')) {
      normalizedPhone = '+' + phone;
    }

    // Verify OTP using database function
    const { data: isValid, error: verifyError } = await (supabase as any)
      .rpc('verify_phone_otp', {
        p_phone: normalizedPhone,
        p_otp_code: otp_code
      });

    if (verifyError) {
      console.error('OTP verification error:', verifyError);
      res.status(500).json(errorResponse(
        'VERIFICATION_FAILED',
        'Failed to verify OTP'
      ));
      return;
    }

    if (!isValid) {
      res.status(400).json(errorResponse(
        'INVALID_OTP',
        'Invalid or expired OTP code'
      ));
      return;
    }

    res.status(200).json(successResponse({
      message: 'Phone number verified successfully',
      phone: normalizedPhone,
      verified: true
    }));
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to verify OTP'
    ));
  }
}

/**
 * Resend OTP
 * POST /api/auth/resend-otp
 * Body: { phone: string }
 */
export async function resendOTP(req: Request, res: Response): Promise<void> {
  try {
    const { phone } = req.body;

    if (!phone) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'Phone number is required'
      ));
      return;
    }

    // Normalize phone
    let normalizedPhone = phone;
    if (phone.startsWith('0')) {
      normalizedPhone = '+62' + phone.substring(1);
    } else if (!phone.startsWith('+')) {
      normalizedPhone = '+' + phone;
    }

    // Check rate limiting (max 3 OTP per 10 minutes)
    const { data: recentOTPs } = await supabase
      .from('phone_otp_verifications')
      .select('id')
      .eq('phone', normalizedPhone)
      .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (recentOTPs && recentOTPs.length >= 3) {
      res.status(429).json(errorResponse(
        'RATE_LIMIT_EXCEEDED',
        'Too many OTP requests. Please try again later.'
      ));
      return;
    }

    // Generate new OTP
    const { data: otpData, error: otpError } = await (supabase as any)
      .rpc('create_phone_otp', { p_phone: normalizedPhone });

    if (otpError) {
      console.error('OTP generation error:', otpError);
      res.status(500).json(errorResponse(
        'OTP_GENERATION_FAILED',
        'Failed to generate OTP'
      ));
      return;
    }

    const otp = otpData?.[0] || otpData;

    // Send OTP via SMS service
    try {
      await sendOTPSMS(normalizedPhone, otp.otp_code);
    } catch (smsError) {
      console.error('SMS sending failed:', smsError);
      // Continue even if SMS fails (for development)
    }

    res.status(200).json(successResponse({
      message: 'OTP resent successfully',
      phone: normalizedPhone,
      otp_id: otp.otp_id,
      expires_at: otp.expires_at,
      // REMOVE THIS IN PRODUCTION:
      otp_code: process.env.NODE_ENV === 'development' ? otp.otp_code : undefined
    }));
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to resend OTP'
    ));
  }
}

import { Request, Response } from 'express';
import { UserModel } from '../models/User.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

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

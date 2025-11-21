import { Request, Response } from 'express';
import { UserModel } from '../models/User.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Get current user profile
 * GET /api/users/me
 * Requirements: 1.3, 1.4
 */
export async function getCurrentUserProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse(
        'AUTH_003',
        'Not authenticated'
      ));
      return;
    }

    // Fetch user data from database
    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      res.status(404).json(errorResponse(
        'USER_NOT_FOUND',
        'User not found'
      ));
      return;
    }

    // Return user profile without password
    const userProfile = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      balance: user.balance,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login_at: user.last_login_at,
    };

    res.status(200).json(successResponse(userProfile));
  } catch (error) {
    console.error('Get current user profile error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to get user profile'
    ));
  }
}

/**
 * Update current user profile
 * PUT /api/users/me
 * Requirements: 1.4
 */
export async function updateCurrentUserProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse(
        'AUTH_003',
        'Not authenticated'
      ));
      return;
    }

    const { username, email, full_name } = req.body;

    // Validate at least one field is provided
    if (!username && !email && !full_name) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'At least one field must be provided: username, email, or full_name'
      ));
      return;
    }

    // Prepare update data
    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (full_name !== undefined) updateData.full_name = full_name;

    // Validate user data
    const validation = UserModel.validateUserData(updateData);
    if (!validation.valid) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'Invalid user data',
        validation.errors
      ));
      return;
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser && existingUser.id !== req.user.userId) {
        res.status(409).json(errorResponse(
          'VALIDATION_ERROR',
          'Email is already taken by another user'
        ));
        return;
      }
    }

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser && existingUser.id !== req.user.userId) {
        res.status(409).json(errorResponse(
          'VALIDATION_ERROR',
          'Username is already taken by another user'
        ));
        return;
      }
    }

    // Update user profile
    const updatedUser = await UserModel.update(req.user.userId, updateData);
    if (!updatedUser) {
      res.status(404).json(errorResponse(
        'USER_NOT_FOUND',
        'User not found'
      ));
      return;
    }

    // Return updated user profile without password
    const userProfile = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      full_name: updatedUser.full_name,
      role: updatedUser.role,
      balance: updatedUser.balance,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at,
      last_login_at: updatedUser.last_login_at,
    };

    res.status(200).json(successResponse(
      userProfile,
      'User profile updated successfully'
    ));
  } catch (error) {
    console.error('Update current user profile error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to update user profile'
    ));
  }
}

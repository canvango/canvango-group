import { Request, Response } from 'express';
import { UserModel } from '../models/User.model.js';
import { AdminAuditLogModel } from '../models/AdminAuditLog.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Get all users with filtering, search, and pagination
 * GET /api/admin/users
 */
export async function getAllUsers(req: Request, res: Response): Promise<void> {
  try {
    const { role, search, page = '1', limit = '10' } = req.query;

    // Parse pagination parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Build filters
    const filters: any = {
      limit: limitNum,
      offset: offset,
    };

    if (role && (role === 'guest' || role === 'member' || role === 'admin')) {
      filters.role = role;
    }

    if (search && typeof search === 'string') {
      filters.search = search;
    }

    // Get users and total count
    const [users, totalCount] = await Promise.all([
      UserModel.findAll(filters),
      UserModel.count({ role: filters.role, search: filters.search }),
    ]);

    // Remove password from response
    const usersResponse = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      balance: user.balance,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login_at: user.last_login_at,
    }));

    res.status(200).json(successResponse({
      users: usersResponse,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    }));
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch users'
    ));
  }
}

/**
 * Update user details
 * PUT /api/admin/users/:id
 */
export async function updateUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { username, email, full_name } = req.body;

    // Check if user exists
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      res.status(404).json(errorResponse(
        'USER_NOT_FOUND',
        'User not found'
      ));
      return;
    }

    // Validate data if provided
    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (full_name !== undefined) updateData.full_name = full_name;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'No fields to update'
      ));
      return;
    }

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

    // Check for duplicate username or email
    if (username && username !== existingUser.username) {
      const duplicateUsername = await UserModel.findByUsername(username);
      if (duplicateUsername) {
        res.status(409).json(errorResponse(
          'DUPLICATE_ERROR',
          'Username already exists'
        ));
        return;
      }
    }

    if (email && email !== existingUser.email) {
      const duplicateEmail = await UserModel.findByEmail(email);
      if (duplicateEmail) {
        res.status(409).json(errorResponse(
          'DUPLICATE_ERROR',
          'Email already exists'
        ));
        return;
      }
    }

    // Update user
    const updatedUser = await UserModel.update(id, updateData);

    // Log action
    if (req.user) {
      await AdminAuditLogModel.logUserAction(
        req.user.userId,
        'UPDATE',
        id,
        { old: existingUser, new: updateData },
        req.ip,
        req.get('user-agent')
      );
    }

    // Return updated user without password
    const userResponse = {
      id: updatedUser!.id,
      username: updatedUser!.username,
      email: updatedUser!.email,
      full_name: updatedUser!.full_name,
      role: updatedUser!.role,
      balance: updatedUser!.balance,
      created_at: updatedUser!.created_at,
      updated_at: updatedUser!.updated_at,
      last_login_at: updatedUser!.last_login_at,
    };

    res.status(200).json(successResponse(
      userResponse,
      'User updated successfully'
    ));
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to update user'
    ));
  }
}

/**
 * Update user balance
 * PUT /api/admin/users/:id/balance
 */
export async function updateUserBalance(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { balance } = req.body;

    // Validate balance
    if (balance === undefined || typeof balance !== 'number') {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'Balance must be a number'
      ));
      return;
    }

    // Check if user exists
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      res.status(404).json(errorResponse(
        'USER_NOT_FOUND',
        'User not found'
      ));
      return;
    }

    // Update balance (set absolute value, not increment)
    const updatedUser = await UserModel.update(id, { balance });

    // Log action
    if (req.user) {
      await AdminAuditLogModel.logUserAction(
        req.user.userId,
        'UPDATE_BALANCE',
        id,
        { old_balance: existingUser.balance, new_balance: balance },
        req.ip,
        req.get('user-agent')
      );
    }

    // Return updated user without password
    const userResponse = {
      id: updatedUser!.id,
      username: updatedUser!.username,
      email: updatedUser!.email,
      full_name: updatedUser!.full_name,
      role: updatedUser!.role,
      balance: updatedUser!.balance,
      created_at: updatedUser!.created_at,
      updated_at: updatedUser!.updated_at,
      last_login_at: updatedUser!.last_login_at,
    };

    res.status(200).json(successResponse(
      userResponse,
      'User balance updated successfully'
    ));
  } catch (error) {
    console.error('Update user balance error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to update user balance'
    ));
  }
}

/**
 * Update user role
 * PUT /api/admin/users/:id/role
 */
export async function updateUserRole(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    if (!role || !['guest', 'member', 'admin'].includes(role)) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'Role must be one of: guest, member, admin'
      ));
      return;
    }

    // Check if user exists
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      res.status(404).json(errorResponse(
        'USER_NOT_FOUND',
        'User not found'
      ));
      return;
    }

    // Prevent admin from changing their own role
    if (req.user && req.user.userId === id) {
      res.status(403).json(errorResponse(
        'FORBIDDEN',
        'Cannot change your own role'
      ));
      return;
    }

    // Update role
    const updatedUser = await UserModel.update(id, { role });

    // Log action
    if (req.user) {
      await AdminAuditLogModel.logUserAction(
        req.user.userId,
        'UPDATE_ROLE',
        id,
        { old_role: existingUser.role, new_role: role },
        req.ip,
        req.get('user-agent')
      );
    }

    // Return updated user without password
    const userResponse = {
      id: updatedUser!.id,
      username: updatedUser!.username,
      email: updatedUser!.email,
      full_name: updatedUser!.full_name,
      role: updatedUser!.role,
      balance: updatedUser!.balance,
      created_at: updatedUser!.created_at,
      updated_at: updatedUser!.updated_at,
      last_login_at: updatedUser!.last_login_at,
    };

    res.status(200).json(successResponse(
      userResponse,
      'User role updated successfully'
    ));
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to update user role'
    ));
  }
}

/**
 * Delete user (soft delete)
 * DELETE /api/admin/users/:id
 */
export async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      res.status(404).json(errorResponse(
        'USER_NOT_FOUND',
        'User not found'
      ));
      return;
    }

    // Prevent admin from deleting themselves
    if (req.user && req.user.userId === id) {
      res.status(403).json(errorResponse(
        'FORBIDDEN',
        'Cannot delete your own account'
      ));
      return;
    }

    // Delete user (hard delete for now, can be changed to soft delete)
    const deleted = await UserModel.delete(id);

    if (!deleted) {
      res.status(500).json(errorResponse(
        'INTERNAL_ERROR',
        'Failed to delete user'
      ));
      return;
    }

    // Log action
    if (req.user) {
      await AdminAuditLogModel.logUserAction(
        req.user.userId,
        'DELETE',
        id,
        { deleted_user: existingUser },
        req.ip,
        req.get('user-agent')
      );
    }

    res.status(200).json(successResponse(
      null,
      'User deleted successfully'
    ));
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to delete user'
    ));
  }
}

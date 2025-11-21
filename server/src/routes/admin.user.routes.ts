import { Router } from 'express';
import {
  getAllUsers,
  updateUser,
  updateUserBalance,
  updateUserRole,
  deleteUser,
} from '../controllers/admin.user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// All admin user routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('admin'));

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filtering, search, and pagination
 * @access  Admin only
 */
router.get('/', getAllUsers);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user details
 * @access  Admin only
 */
router.put('/:id', updateUser);

/**
 * @route   PUT /api/admin/users/:id/balance
 * @desc    Update user balance
 * @access  Admin only
 */
router.put('/:id/balance', updateUserBalance);

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user role
 * @access  Admin only
 */
router.put('/:id/role', updateUserRole);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Admin only
 */
router.delete('/:id', deleteUser);

export default router;

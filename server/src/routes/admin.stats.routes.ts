import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import {
  getOverviewStats,
  getUserStats,
  getTransactionStats,
} from '../controllers/admin.stats.controller.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// GET /api/admin/stats/overview - Get system overview statistics
router.get('/overview', getOverviewStats);

// GET /api/admin/stats/users - Get user growth statistics
router.get('/users', getUserStats);

// GET /api/admin/stats/transactions - Get transaction statistics
router.get('/transactions', getTransactionStats);

export default router;

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import {
  getSettings,
  updateSettings,
  getLogs,
} from '../controllers/admin.settings.controller.js';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// GET /api/admin/settings - Get all system settings
router.get('/', getSettings);

// PUT /api/admin/settings - Update system settings
router.put('/', updateSettings);

// GET /api/admin/logs - Get system logs and audit logs
router.get('/logs', getLogs);

export default router;

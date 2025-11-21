import { Router } from 'express';
import {
  getAuditLogs,
  getAuditLogById
} from '../controllers/admin.auditLog.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// All admin audit log routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('admin'));

// GET /api/admin/audit-logs - Get all audit logs
router.get('/', getAuditLogs);

// GET /api/admin/audit-logs/:id - Get audit log by ID
router.get('/:id', getAuditLogById);

export default router;

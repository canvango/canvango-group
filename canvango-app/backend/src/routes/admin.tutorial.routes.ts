import { Router } from 'express';
import {
  createTutorial,
  updateTutorial,
  deleteTutorial,
  getAllTutorials,
  getTutorialStats
} from '../controllers/admin.tutorial.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// All admin tutorial routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('admin'));

// GET /api/admin/tutorials/stats - Get tutorial statistics
router.get('/stats', getTutorialStats);

// GET /api/admin/tutorials - Get all tutorials
router.get('/', getAllTutorials);

// POST /api/admin/tutorials - Create new tutorial
router.post('/', createTutorial);

// PUT /api/admin/tutorials/:id - Update tutorial
router.put('/:id', updateTutorial);

// DELETE /api/admin/tutorials/:id - Delete tutorial
router.delete('/:id', deleteTutorial);

export default router;

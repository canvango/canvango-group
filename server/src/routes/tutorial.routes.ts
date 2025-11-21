import { Router } from 'express';
import { 
  getTutorials, 
  getTutorialById,
  getCategories,
  getTags
} from '../controllers/tutorial.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// All tutorial routes require authentication (Member only)
router.use(authenticate);
router.use(requireRole('member', 'admin'));

// GET /api/tutorials - Get all tutorials with search functionality
router.get('/', getTutorials);

// GET /api/tutorials/categories - Get all categories
router.get('/categories', getCategories);

// GET /api/tutorials/tags - Get all tags
router.get('/tags', getTags);

// GET /api/tutorials/:id - Get tutorial by ID (increment view count)
router.get('/:id', getTutorialById);

export default router;

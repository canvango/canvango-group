import { Router } from 'express';
import { purchaseController } from '../controllers/purchase.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Purchase product
router.post('/', purchaseController.purchaseProduct);

export default router;

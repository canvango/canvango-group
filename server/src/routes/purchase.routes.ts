import { Router } from 'express';
import { purchaseController } from '../controllers/purchase.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Purchase product
router.post('/', purchaseController.purchaseProduct);

export default router;

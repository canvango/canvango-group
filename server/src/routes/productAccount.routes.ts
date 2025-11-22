import { Router } from 'express';
import { productAccountController } from '../controllers/productAccount.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ===== FIELD ROUTES (Admin only) =====
router.get('/fields/:productId', requireAdmin, productAccountController.getFieldsByProduct);
router.post('/fields', requireAdmin, productAccountController.createField);
router.put('/fields/:id', requireAdmin, productAccountController.updateField);
router.delete('/fields/:id', requireAdmin, productAccountController.deleteField);
router.post('/fields/bulk', requireAdmin, productAccountController.bulkCreateFields);

// ===== ACCOUNT ROUTES =====
// Admin routes
router.get('/accounts/:productId', requireAdmin, productAccountController.getAccountsByProduct);
router.get('/account/:id', requireAdmin, productAccountController.getAccountById);
router.post('/accounts', requireAdmin, productAccountController.createAccount);
router.post('/accounts/bulk', requireAdmin, productAccountController.bulkCreateAccounts);
router.put('/account/:id', requireAdmin, productAccountController.updateAccount);
router.delete('/account/:id', requireAdmin, productAccountController.deleteAccount);

// User route - get account by transaction
router.get('/account/transaction/:transactionId', productAccountController.getAccountByTransaction);

export default router;

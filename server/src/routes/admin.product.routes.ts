import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
  duplicateProduct,
  bulkUpdateProducts
} from '../controllers/admin.product.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// All admin product routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('admin'));

// GET /api/admin/products/stats - Get product statistics
router.get('/stats', getProductStats);

// POST /api/admin/products/bulk - Bulk update products
router.post('/bulk', bulkUpdateProducts);

// GET /api/admin/products - Get all products
router.get('/', getProducts);

// GET /api/admin/products/:id - Get product by ID
router.get('/:id', getProductById);

// POST /api/admin/products - Create new product
router.post('/', createProduct);

// POST /api/admin/products/:id/duplicate - Duplicate product
router.post('/:id/duplicate', duplicateProduct);

// PUT /api/admin/products/:id - Update product
router.put('/:id', updateProduct);

// DELETE /api/admin/products/:id - Delete product
router.delete('/:id', deleteProduct);

export default router;

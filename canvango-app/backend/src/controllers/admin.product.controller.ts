import { Request, Response } from 'express';
import { ProductModel } from '../models/Product.model.js';
import { AdminAuditLogModel } from '../models/AdminAuditLog.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Get all products with filtering, search, and pagination
 * GET /api/admin/products
 */
export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    console.log('📦 getProducts called with query:', req.query);
    
    const { 
      search, 
      product_type, 
      stock_status, 
      is_active,
      page = '1', 
      limit = '10' 
    } = req.query;

    // Parse pagination parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    console.log('📊 Pagination:', { pageNum, limitNum, offset });

    // Build filters
    const filters: any = {
      limit: limitNum,
      offset: offset,
    };

    if (search && typeof search === 'string') {
      filters.search = search;
    }

    if (product_type && typeof product_type === 'string') {
      filters.product_type = product_type;
    }

    if (stock_status && typeof stock_status === 'string') {
      filters.stock_status = stock_status;
    }

    if (is_active !== undefined) {
      filters.is_active = is_active === 'true';
    }

    console.log('🔍 Filters:', filters);

    // Get products with total count
    console.log('⏳ Fetching products from database...');
    const { products, total } = await ProductModel.findAll(filters);
    console.log('✅ Products fetched:', { count: products.length, total });

    res.status(200).json(successResponse({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    }));
    console.log('📤 Response sent');
  } catch (error) {
    console.error('❌ Get products error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch products'
    ));
  }
}

/**
 * Get product by ID
 * GET /api/admin/products/:id
 */
export async function getProductById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const product = await ProductModel.findById(id);

    if (!product) {
      res.status(404).json(errorResponse(
        'PRODUCT_NOT_FOUND',
        'Product not found'
      ));
      return;
    }

    res.status(200).json(successResponse(product));
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch product'
    ));
  }
}

/**
 * Create new product
 * POST /api/admin/products
 */
export async function createProduct(req: Request, res: Response): Promise<void> {
  try {
    const {
      product_name,
      product_type,
      category,
      description,
      price,
      stock_status,
      is_active
    } = req.body;

    // Validate required fields
    if (!product_name || !product_type || !category || price === undefined) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'Missing required fields: product_name, product_type, category, price'
      ));
      return;
    }

    // Validate product data
    const validation = ProductModel.validateProductData({
      product_name,
      product_type,
      category,
      description,
      price,
      stock_status,
      is_active
    });

    if (!validation.valid) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'Invalid product data',
        validation.errors
      ));
      return;
    }

    // Create product
    const product = await ProductModel.create({
      product_name,
      product_type,
      category,
      description,
      price,
      stock_status: stock_status || 'available',
      is_active: is_active !== undefined ? is_active : true
    });

    // Log action
    if (req.user) {
      await AdminAuditLogModel.logProductAction(
        req.user.userId,
        'CREATE',
        product.id,
        { created_product: product },
        req.ip,
        req.get('user-agent')
      );
    }

    res.status(201).json(successResponse(
      product,
      'Product created successfully'
    ));
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to create product'
    ));
  }
}

/**
 * Update product
 * PUT /api/admin/products/:id
 */
export async function updateProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const {
      product_name,
      product_type,
      category,
      description,
      price,
      stock_status,
      is_active
    } = req.body;

    // Check if product exists
    const existingProduct = await ProductModel.findById(id);
    if (!existingProduct) {
      res.status(404).json(errorResponse(
        'PRODUCT_NOT_FOUND',
        'Product not found'
      ));
      return;
    }

    // Build update data
    const updateData: any = {};
    if (product_name !== undefined) updateData.product_name = product_name;
    if (product_type !== undefined) updateData.product_type = product_type;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (stock_status !== undefined) updateData.stock_status = stock_status;
    if (is_active !== undefined) updateData.is_active = is_active;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'No fields to update'
      ));
      return;
    }

    // Validate product data
    const validation = ProductModel.validateProductData(updateData);
    if (!validation.valid) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'Invalid product data',
        validation.errors
      ));
      return;
    }

    // Update product
    const updatedProduct = await ProductModel.update(id, updateData);

    // Log action
    if (req.user) {
      await AdminAuditLogModel.logProductAction(
        req.user.userId,
        'UPDATE',
        id,
        { old: existingProduct, new: updateData },
        req.ip,
        req.get('user-agent')
      );
    }

    res.status(200).json(successResponse(
      updatedProduct,
      'Product updated successfully'
    ));
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to update product'
    ));
  }
}

/**
 * Delete product
 * DELETE /api/admin/products/:id
 */
export async function deleteProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await ProductModel.findById(id);
    if (!existingProduct) {
      res.status(404).json(errorResponse(
        'PRODUCT_NOT_FOUND',
        'Product not found'
      ));
      return;
    }

    // Delete product (hard delete)
    const deleted = await ProductModel.delete(id);

    if (!deleted) {
      res.status(500).json(errorResponse(
        'INTERNAL_ERROR',
        'Failed to delete product'
      ));
      return;
    }

    // Log action
    if (req.user) {
      await AdminAuditLogModel.logProductAction(
        req.user.userId,
        'DELETE',
        id,
        { deleted_product: existingProduct },
        req.ip,
        req.get('user-agent')
      );
    }

    res.status(200).json(successResponse(
      null,
      'Product deleted successfully'
    ));
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to delete product'
    ));
  }
}

/**
 * Get product statistics
 * GET /api/admin/products/stats
 */
export async function getProductStats(req: Request, res: Response): Promise<void> {
  try {
    const stats = await ProductModel.getStats();

    res.status(200).json(successResponse(stats));
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch product statistics'
    ));
  }
}

/**
 * Duplicate product
 * POST /api/admin/products/:id/duplicate
 */
export async function duplicateProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await ProductModel.findById(id);
    if (!existingProduct) {
      res.status(404).json(errorResponse(
        'PRODUCT_NOT_FOUND',
        'Product not found'
      ));
      return;
    }

    // Duplicate the product
    const duplicatedProduct = await ProductModel.duplicate(id);

    // Log action
    if (req.user) {
      await AdminAuditLogModel.logProductAction(
        req.user.userId,
        'DUPLICATE',
        duplicatedProduct.id,
        { 
          original_product_id: id,
          original_product_name: existingProduct.product_name,
          duplicated_product: duplicatedProduct 
        },
        req.ip,
        req.get('user-agent')
      );
    }

    res.status(201).json(successResponse(
      duplicatedProduct,
      'Product duplicated successfully'
    ));
  } catch (error) {
    console.error('Duplicate product error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to duplicate product'
    ));
  }
}

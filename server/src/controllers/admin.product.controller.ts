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
      is_active,
      warranty_duration,
      warranty_enabled,
      ad_limit,
      verification_status,
      ad_account_type,
      advantages,
      disadvantages,
      warranty_terms,
      detail_fields
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
      is_active: is_active !== undefined ? is_active : true,
      warranty_duration: warranty_duration !== undefined ? warranty_duration : 30,
      warranty_enabled: warranty_enabled !== undefined ? warranty_enabled : true,
      ad_limit: ad_limit || null,
      verification_status: verification_status || null,
      ad_account_type: ad_account_type || null,
      advantages: advantages || null,
      disadvantages: disadvantages || null,
      warranty_terms: warranty_terms || null,
      detail_fields: detail_fields || []
    });

    // Log action (optional - don't fail if audit log fails)
    if (req.user) {
      try {
        await AdminAuditLogModel.logProductAction(
          req.user.userId,
          'CREATE',
          product.id,
          { created_product: product },
          req.ip,
          req.get('user-agent')
        );
      } catch (auditError) {
        console.warn('Failed to log audit action:', auditError);
        // Continue anyway - audit log failure shouldn't block the creation
      }
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
      is_active,
      warranty_duration,
      warranty_enabled,
      ad_limit,
      verification_status,
      ad_account_type,
      advantages,
      disadvantages,
      warranty_terms,
      detail_fields
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
    if (warranty_duration !== undefined) updateData.warranty_duration = warranty_duration;
    if (warranty_enabled !== undefined) updateData.warranty_enabled = warranty_enabled;
    if (ad_limit !== undefined) updateData.ad_limit = ad_limit;
    if (verification_status !== undefined) updateData.verification_status = verification_status;
    if (ad_account_type !== undefined) updateData.ad_account_type = ad_account_type;
    if (advantages !== undefined) updateData.advantages = advantages;
    if (disadvantages !== undefined) updateData.disadvantages = disadvantages;
    if (warranty_terms !== undefined) updateData.warranty_terms = warranty_terms;
    if (detail_fields !== undefined) updateData.detail_fields = detail_fields;

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

    // Log action (optional - don't fail if audit log fails)
    if (req.user) {
      try {
        await AdminAuditLogModel.logProductAction(
          req.user.userId,
          'UPDATE',
          id,
          { old: existingProduct, new: updateData },
          req.ip,
          req.get('user-agent')
        );
      } catch (auditError) {
        console.warn('Failed to log audit action:', auditError);
        // Continue anyway - audit log failure shouldn't block the update
      }
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

    // Log action (optional - don't fail if audit log fails)
    if (req.user) {
      try {
        await AdminAuditLogModel.logProductAction(
          req.user.userId,
          'DELETE',
          id,
          { deleted_product: existingProduct },
          req.ip,
          req.get('user-agent')
        );
      } catch (auditError) {
        console.warn('Failed to log audit action:', auditError);
        // Continue anyway - audit log failure shouldn't block the deletion
      }
    }

    res.status(200).json(successResponse(
      null,
      'Product deleted successfully'
    ));
  } catch (error: any) {
    console.error('Delete product error:', error);
    
    // Check if error is foreign key constraint violation
    if (error.code === '23503') {
      res.status(400).json(errorResponse(
        'PRODUCT_IN_USE',
        'Cannot delete product because it has been purchased by users. Please deactivate it instead.',
        { 
          constraint: error.constraint,
          detail: 'This product is referenced in purchase history'
        }
      ));
      return;
    }
    
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

    // Log action (optional - don't fail if audit log fails)
    if (req.user) {
      try {
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
      } catch (auditError) {
        console.warn('Failed to log audit action:', auditError);
        // Continue anyway - audit log failure shouldn't block the duplication
      }
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

/**
 * Bulk update products
 * POST /api/admin/products/bulk
 */
export async function bulkUpdateProducts(req: Request, res: Response): Promise<void> {
  try {
    const { product_ids, action, data } = req.body;

    // Validate request
    if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'product_ids must be a non-empty array'
      ));
      return;
    }

    if (!action || !['activate', 'deactivate', 'update_stock', 'delete'].includes(action)) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'Invalid action. Must be one of: activate, deactivate, update_stock, delete'
      ));
      return;
    }

    console.log(`🔄 Bulk ${action} for ${product_ids.length} products`);

    let results: any = {
      success: 0,
      failed: 0,
      errors: []
    };

    // Process based on action
    switch (action) {
      case 'activate':
        results = await ProductModel.bulkUpdate(product_ids, { is_active: true });
        break;

      case 'deactivate':
        results = await ProductModel.bulkUpdate(product_ids, { is_active: false });
        break;

      case 'update_stock':
        if (!data || !data.stock_status) {
          res.status(400).json(errorResponse(
            'VALIDATION_ERROR',
            'stock_status is required for update_stock action'
          ));
          return;
        }
        results = await ProductModel.bulkUpdate(product_ids, { stock_status: data.stock_status });
        break;

      case 'delete':
        results = await ProductModel.bulkDelete(product_ids);
        break;
    }

    // Log bulk action
    if (req.user) {
      try {
        const bulkActionType = `BULK_${action.toUpperCase()}` as 'BULK_ACTIVATE' | 'BULK_DEACTIVATE' | 'BULK_UPDATE_STOCK' | 'BULK_DELETE';
        await AdminAuditLogModel.logProductAction(
          req.user.userId,
          bulkActionType,
          product_ids.join(','),
          { 
            action,
            product_ids,
            data,
            results
          },
          req.ip,
          req.get('user-agent')
        );
      } catch (auditError) {
        console.warn('Failed to log bulk action:', auditError);
      }
    }

    res.status(200).json(successResponse(
      results,
      `Bulk ${action} completed: ${results.success} succeeded, ${results.failed} failed`
    ));
  } catch (error) {
    console.error('Bulk update products error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to perform bulk operation'
    ));
  }
}

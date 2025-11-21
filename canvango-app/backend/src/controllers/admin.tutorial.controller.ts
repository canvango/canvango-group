import { Request, Response } from 'express';
import { TutorialModel } from '../models/Tutorial.model.js';
import { AdminAuditLogModel } from '../models/AdminAuditLog.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Create new tutorial
 * POST /api/admin/tutorials
 */
export async function createTutorial(req: Request, res: Response): Promise<void> {
  try {
    const { title, description, content, category, tags } = req.body;

    // Validate required fields
    if (!title || !description || !content || !category) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'Title, description, content, and category are required'
      ));
      return;
    }

    // Validate tutorial data
    const validation = TutorialModel.validateTutorialData({
      title,
      description,
      content,
      category,
      tags
    });

    if (!validation.valid) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'Invalid tutorial data',
        validation.errors
      ));
      return;
    }

    // Create tutorial
    const tutorial = await TutorialModel.create({
      title,
      description,
      content,
      category,
      tags: tags || []
    });

    // Log action
    if (req.user) {
      await AdminAuditLogModel.logTutorialAction(
        req.user.userId,
        'CREATE',
        tutorial.id,
        { tutorial },
        req.ip,
        req.get('user-agent')
      );
    }

    res.status(201).json(successResponse(
      tutorial,
      'Tutorial created successfully'
    ));
  } catch (error) {
    console.error('Create tutorial error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to create tutorial'
    ));
  }
}

/**
 * Update tutorial
 * PUT /api/admin/tutorials/:id
 */
export async function updateTutorial(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { title, description, content, category, tags } = req.body;

    // Check if tutorial exists
    const existingTutorial = await TutorialModel.findById(id);
    if (!existingTutorial) {
      res.status(404).json(errorResponse(
        'TUTORIAL_NOT_FOUND',
        'Tutorial not found'
      ));
      return;
    }

    // Build update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'No fields to update'
      ));
      return;
    }

    // Validate tutorial data
    const validation = TutorialModel.validateTutorialData(updateData);
    if (!validation.valid) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'Invalid tutorial data',
        validation.errors
      ));
      return;
    }

    // Update tutorial
    const updatedTutorial = await TutorialModel.update(id, updateData);

    // Log action
    if (req.user) {
      await AdminAuditLogModel.logTutorialAction(
        req.user.userId,
        'UPDATE',
        id,
        { old: existingTutorial, new: updateData },
        req.ip,
        req.get('user-agent')
      );
    }

    res.status(200).json(successResponse(
      updatedTutorial,
      'Tutorial updated successfully'
    ));
  } catch (error) {
    console.error('Update tutorial error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to update tutorial'
    ));
  }
}

/**
 * Delete tutorial
 * DELETE /api/admin/tutorials/:id
 */
export async function deleteTutorial(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Check if tutorial exists
    const existingTutorial = await TutorialModel.findById(id);
    if (!existingTutorial) {
      res.status(404).json(errorResponse(
        'TUTORIAL_NOT_FOUND',
        'Tutorial not found'
      ));
      return;
    }

    // Delete tutorial
    const deleted = await TutorialModel.delete(id);

    if (!deleted) {
      res.status(500).json(errorResponse(
        'INTERNAL_ERROR',
        'Failed to delete tutorial'
      ));
      return;
    }

    // Log action
    if (req.user) {
      await AdminAuditLogModel.logTutorialAction(
        req.user.userId,
        'DELETE',
        id,
        { deleted_tutorial: existingTutorial },
        req.ip,
        req.get('user-agent')
      );
    }

    res.status(200).json(successResponse(
      null,
      'Tutorial deleted successfully'
    ));
  } catch (error) {
    console.error('Delete tutorial error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to delete tutorial'
    ));
  }
}

/**
 * Get all tutorials for admin (includes all data)
 * GET /api/admin/tutorials
 */
export async function getAllTutorials(req: Request, res: Response): Promise<void> {
  try {
    const { search, category, tags, limit, offset } = req.query;

    const filters: any = {};
    
    if (search) {
      filters.search = search as string;
    }
    
    if (category) {
      filters.category = category as string;
    }
    
    if (tags) {
      filters.tags = Array.isArray(tags) ? tags : [tags];
    }
    
    if (limit) {
      filters.limit = parseInt(limit as string);
    }
    
    if (offset) {
      filters.offset = parseInt(offset as string);
    }

    const tutorials = await TutorialModel.findAll(filters);
    const total = await TutorialModel.count(filters);

    res.status(200).json(successResponse({
      tutorials,
      pagination: {
        total,
        limit: filters.limit || tutorials.length,
        offset: filters.offset || 0,
      }
    }, 'Tutorials retrieved successfully'));
  } catch (error: any) {
    console.error('Error getting tutorials:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to retrieve tutorials'
    ));
  }
}

/**
 * Get tutorial statistics
 * GET /api/admin/tutorials/stats
 */
export async function getTutorialStats(req: Request, res: Response): Promise<void> {
  try {
    const [
      totalTutorials,
      categories,
      mostViewed,
      recentTutorials
    ] = await Promise.all([
      TutorialModel.count(),
      TutorialModel.getCategories(),
      TutorialModel.getMostViewed(5),
      TutorialModel.getRecent(5)
    ]);

    res.status(200).json(successResponse({
      total_tutorials: totalTutorials,
      total_categories: categories.length,
      categories,
      most_viewed: mostViewed,
      recent_tutorials: recentTutorials
    }, 'Tutorial statistics retrieved successfully'));
  } catch (error) {
    console.error('Get tutorial stats error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to retrieve tutorial statistics'
    ));
  }
}

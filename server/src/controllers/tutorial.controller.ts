import { Request, Response } from 'express';
import { TutorialModel } from '../models/Tutorial.model.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Get all tutorials with optional search functionality
 * GET /api/tutorials?search=keyword&category=cat&limit=10&offset=0
 */
export const getTutorials = async (req: Request, res: Response) => {
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

    return sendSuccess(res, {
      tutorials,
      pagination: {
        total,
        limit: filters.limit || tutorials.length,
        offset: filters.offset || 0,
      }
    }, 'Tutorials retrieved successfully');
  } catch (error: any) {
    console.error('Error getting tutorials:', error);
    return sendError(res, 'TUTORIAL_001', 'Failed to retrieve tutorials', 500);
  }
};

/**
 * Get tutorial by ID and increment view count
 * GET /api/tutorials/:id
 */
export const getTutorialById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Increment view count
    const tutorial = await TutorialModel.incrementViewCount(id);

    if (!tutorial) {
      return sendError(res, 'TUTORIAL_002', 'Tutorial not found', 404);
    }

    return sendSuccess(res, tutorial, 'Tutorial retrieved successfully');
  } catch (error: any) {
    console.error('Error getting tutorial:', error);
    return sendError(res, 'TUTORIAL_001', 'Failed to retrieve tutorial', 500);
  }
};

/**
 * Get tutorial categories
 * GET /api/tutorials/categories
 */
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await TutorialModel.getCategories();
    return sendSuccess(res, categories, 'Categories retrieved successfully');
  } catch (error: any) {
    console.error('Error getting categories:', error);
    return sendError(res, 'TUTORIAL_001', 'Failed to retrieve categories', 500);
  }
};

/**
 * Get tutorial tags
 * GET /api/tutorials/tags
 */
export const getTags = async (req: Request, res: Response) => {
  try {
    const tags = await TutorialModel.getTags();
    return sendSuccess(res, tags, 'Tags retrieved successfully');
  } catch (error: any) {
    console.error('Error getting tags:', error);
    return sendError(res, 'TUTORIAL_001', 'Failed to retrieve tags', 500);
  }
};

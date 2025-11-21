import { Request, Response } from 'express';
import { AdminAuditLogModel } from '../models/AdminAuditLog.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Get all audit logs with filtering and pagination
 * GET /api/admin/audit-logs
 */
export async function getAuditLogs(req: Request, res: Response): Promise<void> {
  try {
    const {
      admin,
      action,
      entity,
      startDate,
      endDate,
      page = '1',
      limit = '20'
    } = req.query;

    // Parse pagination parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Build filters
    const filters: any = {
      limit: limitNum,
      offset: offset,
    };

    if (admin && typeof admin === 'string') {
      filters.admin_id = admin;
    }

    if (action && typeof action === 'string') {
      filters.action = action;
    }

    if (entity && typeof entity === 'string') {
      filters.resource = entity;
    }

    if (startDate && typeof startDate === 'string') {
      filters.start_date = new Date(startDate);
    }

    if (endDate && typeof endDate === 'string') {
      filters.end_date = new Date(endDate);
    }

    // Get audit logs and total count
    const [logs, totalCount] = await Promise.all([
      AdminAuditLogModel.findAll(filters),
      AdminAuditLogModel.count({
        admin_id: filters.admin_id,
        resource: filters.resource,
        action: filters.action,
        start_date: filters.start_date,
        end_date: filters.end_date,
      }),
    ]);

    res.status(200).json(successResponse({
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    }));
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch audit logs'
    ));
  }
}

/**
 * Get audit log by ID
 * GET /api/admin/audit-logs/:id
 */
export async function getAuditLogById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const log = await AdminAuditLogModel.findById(id);

    if (!log) {
      res.status(404).json(errorResponse(
        'LOG_NOT_FOUND',
        'Audit log not found'
      ));
      return;
    }

    res.status(200).json(successResponse(log));
  } catch (error) {
    console.error('Get audit log by ID error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch audit log'
    ));
  }
}

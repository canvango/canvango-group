import { Request, Response } from 'express';
import { SystemSettingsModel } from '../models/SystemSettings.model.js';
import { AdminAuditLogModel } from '../models/AdminAuditLog.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Get all system settings
 * GET /api/admin/settings
 */
export async function getSettings(req: Request, res: Response): Promise<void> {
  try {
    const settings = await SystemSettingsModel.getAllAsObject();

    res.status(200).json(successResponse(settings));
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch system settings'
    ));
  }
}

/**
 * Update system settings
 * PUT /api/admin/settings
 */
export async function updateSettings(req: Request, res: Response): Promise<void> {
  try {
    const { payment_methods, notification_email, notification_system, maintenance_mode } = req.body;

    // Track changes for audit log
    const changes: Record<string, any> = {};

    // Update payment methods if provided
    if (payment_methods !== undefined) {
      if (!Array.isArray(payment_methods)) {
        res.status(400).json(errorResponse(
          'VALIDATION_ERROR',
          'payment_methods must be an array'
        ));
        return;
      }
      await SystemSettingsModel.updatePaymentMethods(payment_methods);
      changes.payment_methods = payment_methods;
    }

    // Update notification settings if provided
    if (notification_email !== undefined || notification_system !== undefined) {
      await SystemSettingsModel.updateNotificationSettings(
        notification_email,
        notification_system
      );
      if (notification_email) changes.notification_email = notification_email;
      if (notification_system) changes.notification_system = notification_system;
    }

    // Update maintenance mode if provided
    if (maintenance_mode !== undefined) {
      if (typeof maintenance_mode !== 'object' || maintenance_mode === null) {
        res.status(400).json(errorResponse(
          'VALIDATION_ERROR',
          'maintenance_mode must be an object'
        ));
        return;
      }
      
      const { enabled, message } = maintenance_mode;
      if (typeof enabled !== 'boolean') {
        res.status(400).json(errorResponse(
          'VALIDATION_ERROR',
          'maintenance_mode.enabled must be a boolean'
        ));
        return;
      }

      await SystemSettingsModel.updateMaintenanceMode(enabled, message);
      changes.maintenance_mode = maintenance_mode;
    }

    // Check if any changes were made
    if (Object.keys(changes).length === 0) {
      res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        'No settings to update'
      ));
      return;
    }

    // Log action
    if (req.user) {
      await AdminAuditLogModel.logSettingsAction(
        req.user.userId,
        'UPDATE',
        changes,
        req.ip,
        req.get('user-agent')
      );
    }

    // Get updated settings
    const updatedSettings = await SystemSettingsModel.getAllAsObject();

    res.status(200).json(successResponse(
      updatedSettings,
      'Settings updated successfully'
    ));
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to update system settings'
    ));
  }
}

/**
 * Get system logs and audit logs
 * GET /api/admin/logs
 */
export async function getLogs(req: Request, res: Response): Promise<void> {
  try {
    const { 
      resource, 
      action, 
      admin_id, 
      start_date, 
      end_date,
      page = '1', 
      limit = '50' 
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

    if (resource && typeof resource === 'string') {
      filters.resource = resource;
    }

    if (action && typeof action === 'string') {
      filters.action = action;
    }

    if (admin_id && typeof admin_id === 'string') {
      filters.admin_id = admin_id;
    }

    if (start_date && typeof start_date === 'string') {
      filters.start_date = new Date(start_date);
    }

    if (end_date && typeof end_date === 'string') {
      filters.end_date = new Date(end_date);
    }

    // Get audit logs and total count
    const [logs, totalCount] = await Promise.all([
      AdminAuditLogModel.findAll(filters),
      AdminAuditLogModel.count({
        resource: filters.resource,
        action: filters.action,
        admin_id: filters.admin_id,
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
    console.error('Get logs error:', error);
    res.status(500).json(errorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch system logs'
    ));
  }
}

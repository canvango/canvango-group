import { getSupabaseClient } from '../config/supabase.js';

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  action: string;
  resource: string;
  resource_id: string | null;
  changes: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}

export interface CreateAuditLogInput {
  admin_id: string;
  action: string;
  resource: string;
  resource_id?: string;
  changes?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export class AdminAuditLogModel {
  private static get supabase() {
    return getSupabaseClient();
  }

  /**
   * Create a new audit log entry
   */
  static async create(logData: CreateAuditLogInput): Promise<AdminAuditLog> {
    const { data, error } = await this.supabase
      .from('admin_audit_logs')
      .insert({
        admin_id: logData.admin_id,
        action: logData.action,
        resource: logData.resource,
        resource_id: logData.resource_id || null,
        changes: logData.changes || null,
        ip_address: logData.ip_address || null,
        user_agent: logData.user_agent || null
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating audit log:', error);
      throw new Error(`Failed to create audit log: ${error.message}`);
    }

    return data as AdminAuditLog;
  }

  /**
   * Log user management action
   */
  static async logUserAction(
    adminId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'UPDATE_ROLE' | 'UPDATE_BALANCE',
    userId: string,
    changes?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AdminAuditLog> {
    return this.create({
      admin_id: adminId,
      action: `USER_${action}`,
      resource: 'users',
      resource_id: userId,
      changes,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Log transaction management action
   */
  static async logTransactionAction(
    adminId: string,
    action: 'UPDATE' | 'DELETE' | 'REFUND',
    transactionId: string,
    changes?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AdminAuditLog> {
    return this.create({
      admin_id: adminId,
      action: `TRANSACTION_${action}`,
      resource: 'transactions',
      resource_id: transactionId,
      changes,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Log claim management action
   */
  static async logClaimAction(
    adminId: string,
    action: 'APPROVE' | 'REJECT' | 'RESOLVE',
    claimId: string,
    changes?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AdminAuditLog> {
    return this.create({
      admin_id: adminId,
      action: `CLAIM_${action}`,
      resource: 'claims',
      resource_id: claimId,
      changes,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Log tutorial management action
   */
  static async logTutorialAction(
    adminId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    tutorialId: string,
    changes?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AdminAuditLog> {
    return this.create({
      admin_id: adminId,
      action: `TUTORIAL_${action}`,
      resource: 'tutorials',
      resource_id: tutorialId,
      changes,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Log product management action
   */
  static async logProductAction(
    adminId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'DUPLICATE',
    productId: string,
    changes?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AdminAuditLog> {
    return this.create({
      admin_id: adminId,
      action: `PRODUCT_${action}`,
      resource: 'products',
      resource_id: productId,
      changes,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Log system settings action
   */
  static async logSettingsAction(
    adminId: string,
    action: 'UPDATE',
    changes?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AdminAuditLog> {
    return this.create({
      admin_id: adminId,
      action: `SETTINGS_${action}`,
      resource: 'settings',
      changes,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Find audit log by ID
   */
  static async findById(id: string): Promise<AdminAuditLog | null> {
    const { data, error } = await this.supabase
      .from('admin_audit_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error finding audit log by ID:', error);
      return null;
    }

    return data as AdminAuditLog;
  }

  /**
   * Get all audit logs with optional filtering
   */
  static async findAll(filters?: {
    admin_id?: string;
    resource?: string;
    action?: string;
    start_date?: Date;
    end_date?: Date;
    limit?: number;
    offset?: number;
  }): Promise<AdminAuditLog[]> {
    let query = this.supabase.from('admin_audit_logs').select('*');

    if (filters?.admin_id) {
      query = query.eq('admin_id', filters.admin_id);
    }

    if (filters?.resource) {
      query = query.eq('resource', filters.resource);
    }

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }

    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date.toISOString());
    }

    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date.toISOString());
    }

    query = query.order('created_at', { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 10) - 1
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error finding audit logs:', error);
      return [];
    }

    return (data || []) as AdminAuditLog[];
  }

  /**
   * Get audit logs by admin ID
   */
  static async findByAdminId(
    adminId: string,
    limit?: number,
    offset?: number
  ): Promise<AdminAuditLog[]> {
    let query = this.supabase
      .from('admin_audit_logs')
      .select('*')
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.range(offset, offset + (limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error finding audit logs by admin ID:', error);
      return [];
    }

    return (data || []) as AdminAuditLog[];
  }

  /**
   * Get audit logs by resource
   */
  static async findByResource(
    resource: string,
    resourceId?: string,
    limit?: number,
    offset?: number
  ): Promise<AdminAuditLog[]> {
    let query = this.supabase
      .from('admin_audit_logs')
      .select('*')
      .eq('resource', resource);

    if (resourceId) {
      query = query.eq('resource_id', resourceId);
    }

    query = query.order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.range(offset, offset + (limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error finding audit logs by resource:', error);
      return [];
    }

    return (data || []) as AdminAuditLog[];
  }

  /**
   * Get recent audit logs
   */
  static async getRecent(limit: number = 50): Promise<AdminAuditLog[]> {
    const { data, error } = await this.supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting recent audit logs:', error);
      return [];
    }

    return (data || []) as AdminAuditLog[];
  }

  /**
   * Count audit logs with optional filtering
   */
  static async count(filters?: {
    admin_id?: string;
    resource?: string;
    action?: string;
    start_date?: Date;
    end_date?: Date;
  }): Promise<number> {
    let query = this.supabase
      .from('admin_audit_logs')
      .select('*', { count: 'exact', head: true });

    if (filters?.admin_id) {
      query = query.eq('admin_id', filters.admin_id);
    }

    if (filters?.resource) {
      query = query.eq('resource', filters.resource);
    }

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }

    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date.toISOString());
    }

    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date.toISOString());
    }

    const { count, error } = await query;

    if (error) {
      console.error('Error counting audit logs:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Get audit log statistics
   */
  static async getStatistics(filters?: {
    admin_id?: string;
    start_date?: Date;
    end_date?: Date;
  }): Promise<{
    total_actions: number;
    by_resource: { resource: string; count: number }[];
    by_action: { action: string; count: number }[];
    by_admin: { admin_id: string; count: number }[];
  }> {
    // Build base query for filtering
    let baseQuery = this.supabase.from('admin_audit_logs').select('*');

    if (filters?.admin_id) {
      baseQuery = baseQuery.eq('admin_id', filters.admin_id);
    }

    if (filters?.start_date) {
      baseQuery = baseQuery.gte('created_at', filters.start_date.toISOString());
    }

    if (filters?.end_date) {
      baseQuery = baseQuery.lte('created_at', filters.end_date.toISOString());
    }

    // Get all matching logs
    const { data: logs, error } = await baseQuery;

    if (error) {
      console.error('Error getting audit log statistics:', error);
      return {
        total_actions: 0,
        by_resource: [],
        by_action: [],
        by_admin: []
      };
    }

    const allLogs = logs || [];

    // Calculate statistics from the data
    const total_actions = allLogs.length;

    // Group by resource
    const resourceMap = new Map<string, number>();
    allLogs.forEach((log: any) => {
      const count = resourceMap.get(log.resource) || 0;
      resourceMap.set(log.resource, count + 1);
    });
    const by_resource = Array.from(resourceMap.entries())
      .map(([resource, count]) => ({ resource, count }))
      .sort((a, b) => b.count - a.count);

    // Group by action
    const actionMap = new Map<string, number>();
    allLogs.forEach((log: any) => {
      const count = actionMap.get(log.action) || 0;
      actionMap.set(log.action, count + 1);
    });
    const by_action = Array.from(actionMap.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count);

    // Group by admin (only if not filtered by admin_id)
    let by_admin: { admin_id: string; count: number }[] = [];
    if (!filters?.admin_id) {
      const adminMap = new Map<string, number>();
      allLogs.forEach((log: any) => {
        const count = adminMap.get(log.admin_id) || 0;
        adminMap.set(log.admin_id, count + 1);
      });
      by_admin = Array.from(adminMap.entries())
        .map(([admin_id, count]) => ({ admin_id, count }))
        .sort((a, b) => b.count - a.count);
    }

    return {
      total_actions,
      by_resource,
      by_action,
      by_admin
    };
  }

  /**
   * Delete old audit logs (for cleanup)
   */
  static async deleteOlderThan(days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data, error } = await this.supabase
      .from('admin_audit_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .select();

    if (error) {
      console.error('Error deleting old audit logs:', error);
      return 0;
    }

    return data?.length || 0;
  }
}

/**
 * Audit Log Service
 * Handles all audit logging operations
 */

import { supabase } from '@/clients/supabase';
import { 
  AuditLog, 
  AuditLogWithAdmin, 
  CreateAuditLogParams, 
  AuditLogFilters,
  AuditLogResponse 
} from '@/types/auditLog';

/**
 * Create an audit log entry
 * Should be called after every admin action
 */
export const createAuditLog = async (
  params: CreateAuditLogParams
): Promise<void> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('Cannot create audit log: No authenticated user');
      return;
    }

    // Get user details to verify admin role
    const { data: userData } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_id', user.id)
      .single();

    if (!userData || userData.role !== 'admin') {
      console.warn('Cannot create audit log: User is not admin');
      return;
    }

    // Get IP address (best effort - may not work in all environments)
    let ipAddress: string | null = null;
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      ipAddress = data.ip;
    } catch (error) {
      console.warn('Could not fetch IP address:', error);
    }

    // Create audit log entry
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        admin_id: userData.id,
        action: params.action,
        resource: params.resource,
        resource_id: params.resource_id || null,
        details: params.details || {},
        ip_address: ipAddress,
        user_agent: navigator.userAgent
      });

    if (error) {
      console.error('Failed to create audit log:', error);
    }
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw - audit logging should not break main operations
  }
};

/**
 * Fetch audit logs with filters and pagination
 */
export const fetchAuditLogs = async (
  filters: AuditLogFilters = {}
): Promise<AuditLogResponse> => {
  const {
    admin_id,
    action,
    resource,
    start_date,
    end_date,
    page = 1,
    limit = 20
  } = filters;

  // Build query for audit logs
  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' });

  // Apply filters
  if (admin_id) {
    query = query.eq('admin_id', admin_id);
  }

  if (action && action !== 'all') {
    query = query.eq('action', action);
  }

  if (resource && resource !== 'all') {
    query = query.eq('resource', resource);
  }

  if (start_date) {
    query = query.gte('created_at', start_date);
  }

  if (end_date) {
    query = query.lte('created_at', end_date);
  }

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query
    .order('created_at', { ascending: false })
    .range(from, to);

  // Execute query
  const { data: logs, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch audit logs: ${error.message}`);
  }

  if (!logs || logs.length === 0) {
    return {
      logs: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0
      }
    };
  }

  // Get unique admin IDs
  const adminIds = [...new Set(logs.map(log => log.admin_id).filter(Boolean))];

  // Fetch admin users
  const { data: admins } = await supabase
    .from('users')
    .select('id, username, email')
    .in('id', adminIds);

  // Create admin lookup map
  const adminMap = new Map(admins?.map(admin => [admin.id, admin]) || []);

  // Combine logs with admin info
  const logsWithAdmin: AuditLogWithAdmin[] = logs.map(log => ({
    ...log,
    admin: log.admin_id ? adminMap.get(log.admin_id) : undefined
  }));

  return {
    logs: logsWithAdmin,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };
};

/**
 * Fetch audit logs for a specific resource
 */
export const fetchResourceAuditLogs = async (
  resource: string,
  resourceId: string
): Promise<AuditLogWithAdmin[]> => {
  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('resource', resource)
    .eq('resource_id', resourceId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch resource audit logs: ${error.message}`);
  }

  if (!logs || logs.length === 0) {
    return [];
  }

  // Get unique admin IDs
  const adminIds = [...new Set(logs.map(log => log.admin_id).filter(Boolean))];

  // Fetch admin users
  const { data: admins } = await supabase
    .from('users')
    .select('id, username, email')
    .in('id', adminIds);

  // Create admin lookup map
  const adminMap = new Map(admins?.map(admin => [admin.id, admin]) || []);

  // Combine logs with admin info
  return logs.map(log => ({
    ...log,
    admin: log.admin_id ? adminMap.get(log.admin_id) : undefined
  }));
};

/**
 * Get audit log statistics
 */
export const fetchAuditLogStats = async (): Promise<{
  totalLogs: number;
  logsByAction: Record<string, number>;
  logsByResource: Record<string, number>;
  recentActivity: number;
}> => {
  // Get total count
  const { count: totalLogs } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true });

  // Get logs by action
  const { data: actionData } = await supabase
    .from('audit_logs')
    .select('action');

  const logsByAction: Record<string, number> = {};
  actionData?.forEach((log: any) => {
    logsByAction[log.action] = (logsByAction[log.action] || 0) + 1;
  });

  // Get logs by resource
  const { data: resourceData } = await supabase
    .from('audit_logs')
    .select('resource');

  const logsByResource: Record<string, number> = {};
  resourceData?.forEach((log: any) => {
    logsByResource[log.resource] = (logsByResource[log.resource] || 0) + 1;
  });

  // Get recent activity (last 24 hours)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const { count: recentActivity } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', yesterday.toISOString());

  return {
    totalLogs: totalLogs || 0,
    logsByAction,
    logsByResource,
    recentActivity: recentActivity || 0
  };
};

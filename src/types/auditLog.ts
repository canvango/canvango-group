/**
 * Audit Log Types
 * Defines types for audit logging system
 */

export type AuditAction = 
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE'
  | 'REJECT'
  | 'ACTIVATE'
  | 'DEACTIVATE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'REFUND';

export type AuditResource = 
  | 'users'
  | 'products'
  | 'transactions'
  | 'claims'
  | 'tutorials'
  | 'settings'
  | 'announcements'
  | 'verified_bm_orders';

export interface AuditLog {
  id: string;
  admin_id: string | null;
  action: AuditAction;
  resource: AuditResource;
  resource_id: string | null;
  details: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditLogWithAdmin extends AuditLog {
  admin?: {
    id: string;
    username: string;
    email: string;
  };
}

export interface CreateAuditLogParams {
  action: AuditAction;
  resource: AuditResource;
  resource_id?: string | null;
  details?: Record<string, any>;
}

export interface AuditLogFilters {
  admin_id?: string;
  action?: AuditAction | 'all';
  resource?: AuditResource | 'all';
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogResponse {
  logs: AuditLogWithAdmin[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

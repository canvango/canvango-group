import api from '../utils/api';

export interface SystemSettings {
  payment_methods: string[];
  notification_email: {
    enabled: boolean;
    admin_email: string;
  };
  notification_system: {
    enabled: boolean;
    show_alerts: boolean;
  };
  maintenance_mode: {
    enabled: boolean;
    message: string;
  };
}

export interface UpdateSettingsData {
  payment_methods?: string[];
  notification_email?: {
    enabled: boolean;
    admin_email: string;
  };
  notification_system?: {
    enabled: boolean;
    show_alerts: boolean;
  };
  maintenance_mode?: {
    enabled: boolean;
    message: string;
  };
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  resource: string;
  resource_id: string | null;
  changes: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface GetLogsParams {
  resource?: string;
  action?: string;
  admin_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface GetLogsResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get all system settings
 */
export async function getSettings(): Promise<SystemSettings> {
  const response = await api.get('/admin/settings');
  return response.data.data;
}

/**
 * Update system settings
 */
export async function updateSettings(data: UpdateSettingsData): Promise<SystemSettings> {
  const response = await api.put('/admin/settings', data);
  return response.data.data;
}

/**
 * Get system logs and audit logs
 */
export async function getLogs(params?: GetLogsParams): Promise<GetLogsResponse> {
  const response = await api.get('/admin/logs', { params });
  return response.data.data;
}

/**
 * Admin Settings Service
 */

import { supabase } from './supabase';
import { createAuditLog } from './auditLogService';

export interface SystemSettings {
  maintenanceMode?: boolean;
  maintenance_mode?: { enabled: boolean; message: string };
  registrationEnabled?: boolean;
  apiRateLimit?: number;
  maxUploadSize?: number;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  payment_methods?: any[];
  notification_email?: { enabled: boolean; admin_email: string };
  notification_system?: { enabled: boolean; show_alerts: boolean };
  [key: string]: any;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  details?: any;
  created_at: string;
  [key: string]: any;
}

export const getSettings = async (): Promise<SystemSettings> => {
  return adminSettingsService.getSettings();
};

export const updateSettings = async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
  return adminSettingsService.updateSettings(settings);
};

export const getLogs = async (
  page: number = 1, 
  limit: number = 50,
  resourceFilter?: string
): Promise<{ logs: AuditLog[]; total: number }> => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });

  // Apply resource filter if provided
  if (resourceFilter) {
    query = query.eq('resource', resourceFilter);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    logs: data || [],
    total: count || 0,
  };
};

export const adminSettingsService = {
  async getSettings(): Promise<SystemSettings> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching settings:', error);
      // Return defaults if no settings found
      return {
        maintenanceMode: false,
        registrationEnabled: true,
        apiRateLimit: 1000,
        maxUploadSize: 5242880, // 5MB
        emailNotifications: true,
        smsNotifications: false,
        payment_methods: ['BCA', 'Mandiri', 'BRI', 'DANA', 'OVO'],
        notification_email: { enabled: true, admin_email: '' },
        notification_system: { enabled: true, show_alerts: true },
        maintenance_mode: { enabled: false, message: '' },
      };
    }

    return data as SystemSettings;
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    // First, get the existing settings ID
    const { data: existing, error: fetchError } = await supabase
      .from('system_settings')
      .select('id')
      .limit(1)
      .single();

    if (fetchError) throw fetchError;

    // Update the existing row
    const { data, error } = await supabase
      .from('system_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;

    // Create audit log
    await createAuditLog({
      action: 'UPDATE',
      resource: 'settings',
      resource_id: existing.id,
      details: { 
        updated_fields: Object.keys(settings),
        changes: settings 
      },
    });

    return data as SystemSettings;
  },
};

/**
 * Admin Settings Service
 */

import { supabase } from './supabase';

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

export const getLogs = async (page: number = 1, limit: number = 50): Promise<{ logs: AuditLog[]; total: number }> => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  const { data, error, count } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });

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
      .single();

    if (error) {
      // Return defaults if no settings found
      return {
        maintenanceMode: false,
        registrationEnabled: true,
        apiRateLimit: 1000,
        maxUploadSize: 5242880, // 5MB
        emailNotifications: true,
        smsNotifications: false,
      };
    }

    return data as SystemSettings;
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const { data, error } = await supabase
      .from('system_settings')
      .upsert({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as SystemSettings;
  },
};

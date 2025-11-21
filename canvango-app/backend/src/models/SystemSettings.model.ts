import { getSupabaseClient } from '../config/supabase.js';
import { cache, CacheKeys, CacheInvalidation } from '../utils/cache.js';

export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSettingInput {
  key: string;
  value: any;
  description?: string;
}

export interface UpdateSettingInput {
  value: any;
  description?: string;
}

export class SystemSettingsModel {
  private static get supabase() {
    return getSupabaseClient();
  }

  /**
   * Get all settings
   */
  static async findAll(): Promise<SystemSetting[]> {
    // Check cache first
    const cached = cache.get<SystemSetting[]>(CacheKeys.systemSettings());
    if (cached) {
      return cached;
    }

    const { data, error } = await this.supabase
      .from('system_settings')
      .select('*')
      .order('key', { ascending: true });

    if (error) {
      console.error('Error finding all settings:', error);
      throw new Error(`Failed to fetch settings: ${error.message}`);
    }

    // Cache for 10 minutes
    if (data) {
      cache.set(CacheKeys.systemSettings(), data, 10 * 60 * 1000);
    }

    return data || [];
  }

  /**
   * Get setting by key
   */
  static async findByKey(key: string): Promise<SystemSetting | null> {
    // Check cache first
    const cached = cache.get<SystemSetting>(CacheKeys.systemSetting(key));
    if (cached) {
      return cached;
    }

    const { data, error } = await this.supabase
      .from('system_settings')
      .select('*')
      .eq('key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error finding setting by key:', error);
      throw new Error(`Failed to fetch setting: ${error.message}`);
    }

    // Cache for 10 minutes
    if (data) {
      cache.set(CacheKeys.systemSetting(key), data, 10 * 60 * 1000);
    }

    return data;
  }

  /**
   * Get multiple settings by keys
   */
  static async findByKeys(keys: string[]): Promise<SystemSetting[]> {
    const { data, error } = await this.supabase
      .from('system_settings')
      .select('*')
      .in('key', keys);

    if (error) {
      console.error('Error finding settings by keys:', error);
      throw new Error(`Failed to fetch settings: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create a new setting
   */
  static async create(settingData: CreateSettingInput): Promise<SystemSetting> {
    const insertData = {
      key: settingData.key,
      value: settingData.value,
      description: settingData.description || null
    };

    const { data, error } = await this.supabase
      .from('system_settings')
      .insert(insertData as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating setting:', error);
      throw new Error(`Failed to create setting: ${error.message}`);
    }

    return data as SystemSetting;
  }

  /**
   * Update setting by key
   */
  static async updateByKey(key: string, settingData: UpdateSettingInput): Promise<SystemSetting | null> {
    const updateData: any = {
      value: settingData.value
    };

    if (settingData.description !== undefined) {
      updateData.description = settingData.description;
    }

    const { data, error } = await (this.supabase as any)
      .from('system_settings')
      .update(updateData)
      .eq('key', key)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error updating setting:', error);
      throw new Error(`Failed to update setting: ${error.message}`);
    }

    // Invalidate cache
    CacheInvalidation.systemSettings();

    return data as SystemSetting;
  }

  /**
   * Update or create setting (upsert)
   */
  static async upsert(key: string, value: any, description?: string): Promise<SystemSetting> {
    const upsertData = {
      key: key,
      value: value,
      description: description || null
    };

    const { data, error } = await this.supabase
      .from('system_settings')
      .upsert(upsertData as any, {
        onConflict: 'key'
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting setting:', error);
      throw new Error(`Failed to upsert setting: ${error.message}`);
    }

    // Invalidate cache
    CacheInvalidation.systemSettings();

    return data as SystemSetting;
  }

  /**
   * Delete setting by key
   */
  static async deleteByKey(key: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('system_settings')
      .delete()
      .eq('key', key);

    if (error) {
      console.error('Error deleting setting:', error);
      return false;
    }

    return true;
  }

  /**
   * Get settings as key-value object
   */
  static async getAllAsObject(): Promise<Record<string, any>> {
    const settings = await this.findAll();
    const settingsObject: Record<string, any> = {};
    
    settings.forEach(setting => {
      settingsObject[setting.key] = setting.value;
    });
    
    return settingsObject;
  }

  /**
   * Get payment methods
   */
  static async getPaymentMethods(): Promise<string[]> {
    const setting = await this.findByKey('payment_methods');
    return setting ? setting.value : [];
  }

  /**
   * Update payment methods
   */
  static async updatePaymentMethods(methods: string[]): Promise<SystemSetting> {
    return this.upsert('payment_methods', methods, 'Available payment methods for top-up');
  }

  /**
   * Get notification settings
   */
  static async getNotificationSettings(): Promise<{
    email: any;
    system: any;
  }> {
    const settings = await this.findByKeys(['notification_email', 'notification_system']);
    
    const email = settings.find(s => s.key === 'notification_email')?.value || { enabled: true };
    const system = settings.find(s => s.key === 'notification_system')?.value || { enabled: true };
    
    return { email, system };
  }

  /**
   * Update notification settings
   */
  static async updateNotificationSettings(
    emailSettings?: any,
    systemSettings?: any
  ): Promise<void> {
    if (emailSettings) {
      await this.upsert('notification_email', emailSettings, 'Email notification settings');
    }
    if (systemSettings) {
      await this.upsert('notification_system', systemSettings, 'System notification settings');
    }
  }

  /**
   * Get maintenance mode status
   */
  static async getMaintenanceMode(): Promise<{ enabled: boolean; message: string }> {
    const setting = await this.findByKey('maintenance_mode');
    return setting ? setting.value : { enabled: false, message: '' };
  }

  /**
   * Update maintenance mode
   */
  static async updateMaintenanceMode(enabled: boolean, message?: string): Promise<SystemSetting> {
    return this.upsert(
      'maintenance_mode',
      { enabled, message: message || 'System under maintenance' },
      'Maintenance mode configuration'
    );
  }
}

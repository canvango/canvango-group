import { createClient, SupabaseClient as SupabaseInstance } from '@supabase/supabase-js';
import { IntegrationError, ERROR_CODES } from '../config/types.js';
import { RoleManagementClient } from './RoleManagementClient.js';

export interface ConnectionStatus {
  connected: boolean;
  message: string;
  details?: any;
}

export interface ProjectInfo {
  url: string;
  connected: boolean;
  version?: string;
}

export class SupabaseClient {
  private client: SupabaseInstance | null = null;
  private initialized: boolean = false;
  private projectUrl: string = '';
  private roleManagementClient: RoleManagementClient | null = null;

  initialize(url: string, anonKey: string, serviceRoleKey?: string): SupabaseInstance {
    try {
      // Validate URL format
      if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
        throw new IntegrationError(
          'Invalid Supabase URL format. Expected format: https://xxxxx.supabase.co',
          ERROR_CODES.INVALID_FORMAT,
          'supabase',
          true
        );
      }

      // Validate anon key format (should be JWT)
      if (!anonKey.startsWith('eyJ')) {
        throw new IntegrationError(
          'Invalid Supabase anon key format. Expected JWT format.',
          ERROR_CODES.INVALID_FORMAT,
          'supabase',
          true
        );
      }

      // Use service role key if provided, otherwise use anon key
      const key = serviceRoleKey || anonKey;
      
      this.client = createClient(url, key);
      this.projectUrl = url;
      this.initialized = true;

      // Initialize RoleManagementClient
      this.roleManagementClient = new RoleManagementClient(this.client);

      return this.client;
    } catch (error: any) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      
      throw new IntegrationError(
        `Failed to initialize Supabase client: ${error.message}`,
        ERROR_CODES.CONNECTION_FAILED,
        'supabase',
        true
      );
    }
  }

  async testConnection(): Promise<ConnectionStatus> {
    if (!this.client || !this.initialized) {
      return {
        connected: false,
        message: 'Not initialized. Please call initialize() first.'
      };
    }

    try {
      // Test connection by querying the auth endpoint
      const { error } = await this.client.auth.getSession();
      
      if (error && error.message !== 'Auth session missing!') {
        return {
          connected: false,
          message: `Connection test failed: ${error.message}`,
          details: { error: error.message }
        };
      }

      // Try a simple query to verify database connectivity
      const { error: dbError } = await this.client.from('_supabase_test_').select('*').limit(1);
      
      // It's okay if the table doesn't exist, we just want to verify we can reach the database
      const isConnected = !dbError || 
        dbError.code === 'PGRST116' || 
        dbError.message.includes('does not exist') ||
        dbError.message.includes('Could not find the table');

      if (isConnected) {
        return {
          connected: true,
          message: 'Supabase connection successful',
          details: {
            url: this.projectUrl,
            status: 'connected'
          }
        };
      }

      return {
        connected: false,
        message: `Database connection failed: ${dbError?.message}`,
        details: { error: dbError?.message }
      };
    } catch (error: any) {
      return {
        connected: false,
        message: `Connection test failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  async getProjectInfo(): Promise<ProjectInfo> {
    if (!this.client || !this.initialized) {
      throw new IntegrationError(
        'Not initialized. Please call initialize() first.',
        ERROR_CODES.MISSING_CONFIG,
        'supabase',
        true
      );
    }

    try {
      const connectionStatus = await this.testConnection();
      
      return {
        url: this.projectUrl,
        connected: connectionStatus.connected,
        version: 'v2' // Supabase JS client version
      };
    } catch (error: any) {
      throw new IntegrationError(
        `Failed to get project info: ${error.message}`,
        ERROR_CODES.CONNECTION_FAILED,
        'supabase',
        true
      );
    }
  }

  getClient(): SupabaseInstance | null {
    return this.client;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get RoleManagementClient instance
   * @returns RoleManagementClient instance or null if not initialized
   */
  getRoleManagementClient(): RoleManagementClient | null {
    if (!this.initialized || !this.roleManagementClient) {
      throw new IntegrationError(
        'Supabase client not initialized. Please call initialize() first.',
        ERROR_CODES.MISSING_CONFIG,
        'supabase',
        true
      );
    }
    return this.roleManagementClient;
  }
}

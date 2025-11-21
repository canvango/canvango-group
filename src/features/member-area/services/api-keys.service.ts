import { supabase } from './supabase';
import { APIKey, APIStats, APIEndpoint } from '../types/api';

export const apiKeysService = {
  /**
   * Fetch the user's API key
   */
  async fetchAPIKey(): Promise<APIKey> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    if (!data) {
      return {
        key: '',
        createdAt: new Date(),
        lastUsed: null,
        usageCount: 0,
      };
    }

    return {
      key: data.api_key,
      createdAt: new Date(data.created_at),
      lastUsed: data.last_used_at ? new Date(data.last_used_at) : null,
      usageCount: data.usage_count || 0,
    };
  },

  /**
   * Generate a new API key (invalidates the previous one)
   */
  async generateAPIKey(): Promise<APIKey> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Generate random API key
    const newApiKey = `sk_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;

    // Deactivate old keys
    await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('user_id', user.id);

    // Insert new key
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        key_name: 'Default API Key',
        api_key: newApiKey,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      key: data.api_key,
      createdAt: new Date(data.created_at),
      lastUsed: null,
      usageCount: 0,
    };
  },

  /**
   * Fetch API usage statistics
   */
  async fetchAPIStats(): Promise<APIStats> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('api_keys')
      .select('usage_count, last_used_at, rate_limit')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return {
      totalRequests: data?.usage_count || 0,
      requestsToday: 0, // Would need additional tracking
      lastRequest: data?.last_used_at ? new Date(data.last_used_at) : null,
      rateLimit: data?.rate_limit || 1000,
    };
  },

  /**
   * Fetch available API endpoints documentation from Supabase
   */
  async fetchAPIEndpoints(): Promise<APIEndpoint[]> {
    const { data, error } = await supabase
      .from('api_endpoints')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return (data || []).map(endpoint => ({
      method: endpoint.method as 'GET' | 'POST' | 'PUT' | 'DELETE',
      path: endpoint.path,
      description: endpoint.description,
      parameters: endpoint.parameters || [],
      requestExample: endpoint.request_example || '',
      responseExample: endpoint.response_example || '',
    }));
  },
};

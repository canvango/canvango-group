/**
 * Tripay Payment Channels Service
 * Handles fetching and syncing payment channels from Tripay API
 */

import { supabase } from '@/clients/supabase';

export interface TripayPaymentChannel {
  id?: string;
  code: string;
  name: string;
  group_name?: string;
  type?: string;
  fee_merchant: {
    flat: number;
    percent: number;
  };
  fee_customer: {
    flat: number;
    percent: number;
  };
  total_fee: {
    flat: number;
    percent: number | string;
  };
  minimum_fee?: number | null;
  maximum_fee?: number | null;
  minimum_amount?: number;
  maximum_amount?: number;
  icon_url?: string;
  is_active: boolean;
  is_enabled?: boolean;
  display_order?: number;
  last_synced_at?: string;
}

/**
 * Fetch payment channels from Tripay API
 * Uses Cloudflare Worker if available, otherwise uses Supabase Edge Function
 */
export async function fetchPaymentChannelsFromTripay(): Promise<TripayPaymentChannel[]> {
  try {
    const workerUrl = import.meta.env.VITE_TRIPAY_PROXY_URL;
    
    if (workerUrl) {
      // Use Cloudflare Worker
      const isSandbox = (import.meta.env.VITE_TRIPAY_MODE || 'sandbox') === 'sandbox';

      const response = await fetch(
        `${workerUrl}/payment-channels?sandbox=${isSandbox}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch payment channels');
      }

      return result.data || [];
    } else {
      // Use Supabase Edge Function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Get Supabase URL from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('VITE_SUPABASE_URL is not configured');
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/tripay-get-payment-channels`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch payment channels');
      }

      return result.data || [];
    }
  } catch (error) {
    console.error('Error fetching payment channels from Tripay:', error);
    throw error;
  }
}

/**
 * Get payment channels from database
 */
export async function getPaymentChannelsFromDB(includeDisabled = false): Promise<TripayPaymentChannel[]> {
  try {
    let query = supabase
      .from('tripay_payment_channels')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (!includeDisabled) {
      query = query.eq('is_enabled', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching payment channels from DB:', error);
    throw error;
  }
}

/**
 * Sync payment channels from Tripay to database
 * Updates existing channels and adds new ones
 */
export async function syncPaymentChannels(): Promise<{
  success: boolean;
  added: number;
  updated: number;
  total: number;
}> {
  try {
    // Fetch from Tripay API
    const tripayChannels = await fetchPaymentChannelsFromTripay();

    if (!tripayChannels || tripayChannels.length === 0) {
      throw new Error('No payment channels received from Tripay');
    }

    // Get existing channels from DB
    const { data: existingChannels } = await supabase
      .from('tripay_payment_channels')
      .select('code, is_enabled, display_order');

    const existingCodesMap = new Map(
      (existingChannels || []).map(ch => [
        ch.code,
        { is_enabled: ch.is_enabled, display_order: ch.display_order }
      ])
    );

    let added = 0;
    let updated = 0;

    // Upsert channels
    for (const channel of tripayChannels) {
      const existing = existingCodesMap.get(channel.code);
      
      const channelData = {
        code: channel.code,
        name: channel.name,
        group_name: channel.group_name || null,
        type: channel.type || null,
        fee_merchant: channel.fee_merchant,
        fee_customer: channel.fee_customer,
        total_fee: {
          flat: channel.total_fee.flat,
          percent: typeof channel.total_fee.percent === 'string' 
            ? parseFloat(channel.total_fee.percent) 
            : channel.total_fee.percent
        },
        minimum_fee: channel.minimum_fee,
        maximum_fee: channel.maximum_fee,
        minimum_amount: channel.minimum_amount,
        maximum_amount: channel.maximum_amount,
        icon_url: channel.icon_url,
        is_active: channel.is_active,
        // Preserve is_enabled and display_order if exists
        is_enabled: existing ? existing.is_enabled : true,
        display_order: existing ? existing.display_order : 0,
        last_synced_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('tripay_payment_channels')
        .upsert(channelData, {
          onConflict: 'code',
          ignoreDuplicates: false,
        });

      if (error) {
        console.error(`Error upserting channel ${channel.code}:`, error);
        continue;
      }

      if (existing) {
        updated++;
      } else {
        added++;
      }
    }

    return {
      success: true,
      added,
      updated,
      total: tripayChannels.length,
    };
  } catch (error) {
    console.error('Error syncing payment channels:', error);
    throw error;
  }
}

/**
 * Update payment channel enabled status
 */
export async function updateChannelStatus(
  code: string,
  isEnabled: boolean
): Promise<void> {
  try {
    const { error } = await supabase
      .from('tripay_payment_channels')
      .update({ is_enabled: isEnabled })
      .eq('code', code);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating channel status:', error);
    throw error;
  }
}

/**
 * Update payment channel display order
 */
export async function updateChannelOrder(
  code: string,
  displayOrder: number
): Promise<void> {
  try {
    const { error } = await supabase
      .from('tripay_payment_channels')
      .update({ display_order: displayOrder })
      .eq('code', code);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating channel order:', error);
    throw error;
  }
}

/**
 * Get last sync time
 */
export async function getLastSyncTime(): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('tripay_payment_channels')
      .select('last_synced_at')
      .order('last_synced_at', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;

    return data?.last_synced_at || null;
  } catch (error) {
    return null;
  }
}

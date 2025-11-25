/**
 * Role Realtime Subscription Utilities
 * 
 * Provides Supabase Realtime subscription for instant role change detection
 * as an alternative to polling
 */

import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

/**
 * Callback function type for role change events
 */
export type RoleChangeCallback = (newRole: string, oldRole: string) => void;

/**
 * Callback function type for subscription errors
 */
export type SubscriptionErrorCallback = (error: Error) => void;

/**
 * Options for role subscription
 */
interface SubscriptionOptions {
  onRoleChange: RoleChangeCallback;
  onError?: SubscriptionErrorCallback;
  currentRole: string;
}

/**
 * Subscribe to role changes for a specific user using Supabase Realtime
 * 
 * @param userId - The user ID to subscribe to
 * @param options - Subscription options including callbacks
 * @returns A function to unsubscribe
 */
export const subscribeToRoleChanges = (
  userId: string,
  options: SubscriptionOptions
): (() => void) => {
  const { onRoleChange, onError, currentRole } = options;
  
  console.log('[Role Realtime] Setting up subscription for user:', userId);
  
  let channel: RealtimeChannel | null = null;
  let lastKnownRole = currentRole;
  
  try {
    // Create a channel for this user's role changes
    channel = supabase
      .channel(`user-role-changes-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          console.log('[Role Realtime] Received update event:', payload);
          
          try {
            // Extract new role from payload
            const newRole = payload.new?.role;
            
            if (!newRole) {
              console.warn('[Role Realtime] No role in update payload');
              return;
            }
            
            // Check if role actually changed
            if (newRole !== lastKnownRole) {
              console.log(
                `[Role Realtime] Role changed: ${lastKnownRole} -> ${newRole}`
              );
              
              const oldRole = lastKnownRole;
              lastKnownRole = newRole;
              
              // Trigger callback
              onRoleChange(newRole, oldRole);
            }
          } catch (error) {
            console.error('[Role Realtime] Error processing update:', error);
            
            if (onError) {
              onError(
                error instanceof Error
                  ? error
                  : new Error('Failed to process role update')
              );
            }
          }
        }
      )
      .subscribe((status, err) => {
        console.log('[Role Realtime] Subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('[Role Realtime] Successfully subscribed to role changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Role Realtime] Channel error:', err);
          
          if (onError) {
            onError(
              new Error(`Realtime subscription error: ${err?.message || 'Unknown error'}`)
            );
          }
        } else if (status === 'TIMED_OUT') {
          console.error('[Role Realtime] Subscription timed out');
          
          if (onError) {
            onError(new Error('Realtime subscription timed out'));
          }
        } else if (status === 'CLOSED') {
          console.log('[Role Realtime] Subscription closed');
        }
      });
    
    // Return unsubscribe function
    return () => {
      console.log('[Role Realtime] Unsubscribing from role changes');
      
      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
    };
  } catch (error) {
    console.error('[Role Realtime] Failed to set up subscription:', error);
    
    if (onError) {
      onError(
        error instanceof Error
          ? error
          : new Error('Failed to set up Realtime subscription')
      );
    }
    
    // Return no-op unsubscribe function
    return () => {};
  }
};

/**
 * Check if Supabase Realtime is available and working
 * 
 * @returns Promise that resolves to true if Realtime is available
 */
export const checkRealtimeAvailability = async (): Promise<boolean> => {
  try {
    // Try to create a test channel
    const testChannel = supabase.channel('realtime-test');
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        supabase.removeChannel(testChannel);
        resolve(false);
      }, 5000);
      
      testChannel.subscribe((status) => {
        clearTimeout(timeout);
        
        if (status === 'SUBSCRIBED') {
          supabase.removeChannel(testChannel);
          resolve(true);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          supabase.removeChannel(testChannel);
          resolve(false);
        }
      });
    });
  } catch (error) {
    console.error('[Role Realtime] Availability check failed:', error);
    return false;
  }
};

/**
 * Get information about Realtime connection status
 */
export const getRealtimeStatus = () => {
  // Note: Supabase client doesn't expose direct connection status
  // This is a placeholder for future implementation if needed
  return {
    isSupported: typeof supabase.channel === 'function',
    timestamp: new Date().toISOString(),
  };
};

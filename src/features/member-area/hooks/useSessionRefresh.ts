/**
 * useSessionRefresh Hook
 * 
 * Automatically refreshes Supabase session in the background to prevent token expiration.
 * This ensures users don't lose their session when idle for extended periods.
 * 
 * Features:
 * - Checks session validity every 5 minutes
 * - Refreshes token if expiring within 10 minutes
 * - Handles errors gracefully
 * - Cleans up on unmount
 */

import { useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';

const CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const REFRESH_THRESHOLD = 10 * 60; // Refresh if expiring within 10 minutes

export const useSessionRefresh = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkAndRefreshSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error checking session:', error);
          return;
        }
        
        if (!session) {
          console.log('ℹ️ No active session to refresh');
          return;
        }
        
        // Check if token is about to expire
        const expiresAt = session.expires_at;
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt ? expiresAt - now : 0;
        
        console.log('🔐 Session status:', {
          expiresAt: expiresAt ? new Date(expiresAt * 1000).toISOString() : 'unknown',
          timeUntilExpiry: `${Math.floor(timeUntilExpiry / 60)} minutes`,
          needsRefresh: timeUntilExpiry < REFRESH_THRESHOLD
        });
        
        // Refresh if expiring soon
        if (timeUntilExpiry < REFRESH_THRESHOLD) {
          console.log('🔄 Token expiring soon, refreshing session...');
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error('❌ Error refreshing session:', refreshError);
            return;
          }
          
          if (refreshData.session) {
            console.log('✅ Session refreshed successfully');
            console.log('🔐 New expiry:', new Date((refreshData.session.expires_at || 0) * 1000).toISOString());
          }
        }
      } catch (err) {
        console.error('❌ Session refresh error:', err);
      }
    };

    // Initial check
    checkAndRefreshSession();

    // Set up periodic checks
    intervalRef.current = setInterval(checkAndRefreshSession, CHECK_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
};

/**
 * useSessionRefresh Hook
 * 
 * Automatically refreshes Supabase session in the background to prevent token expiration.
 * This ensures users don't lose their session when idle for extended periods.
 * 
 * Features:
 * - Checks session validity every 5 minutes
 * - Refreshes token if expiring within 10 minutes
 * - Handles tab visibility changes (wake from sleep)
 * - Uses Page Visibility API to detect tab activation
 * - Handles errors gracefully
 * - Cleans up on unmount
 */

import { useEffect, useRef } from 'react';
import { supabase } from '@/clients/supabase';

const CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const REFRESH_THRESHOLD = 10 * 60; // Refresh if expiring within 10 minutes

export const useSessionRefresh = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<number>(Date.now());

  const checkAndRefreshSession = async (source: string = 'interval') => {
    try {
      console.log(`🔐 Checking session (source: ${source})...`);
      
      // Add timeout to prevent hanging
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session check timeout')), 5000)
      );
      
      const { data: { session }, error } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as any;
      
      if (error) {
        console.error('❌ Error checking session:', error);
        
        // If it's an auth error, clear tokens
        const isAuthError = 
          error?.status === 401 || 
          error?.status === 403 ||
          error?.message?.includes('JWT') ||
          error?.message?.includes('expired') ||
          error?.message?.includes('invalid');
        
        if (isAuthError) {
          console.warn('⚠️ Auth error in session check - tokens may be invalid');
        }
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
        source,
        expiresAt: expiresAt ? new Date(expiresAt * 1000).toISOString() : 'unknown',
        timeUntilExpiry: `${Math.floor(timeUntilExpiry / 60)} minutes`,
        needsRefresh: timeUntilExpiry < REFRESH_THRESHOLD
      });
      
      // Refresh if expiring soon or already expired
      if (timeUntilExpiry < REFRESH_THRESHOLD) {
        console.log('🔄 Token expiring soon, refreshing session...');
        
        // Add timeout to refresh operation
        const refreshPromise = supabase.auth.refreshSession();
        const refreshTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Refresh timeout')), 5000)
        );
        
        const { data: refreshData, error: refreshError } = await Promise.race([
          refreshPromise,
          refreshTimeoutPromise
        ]) as any;
        
        if (refreshError) {
          console.error('❌ Error refreshing session:', refreshError);
          
          // If refresh fails due to invalid token, user will be logged out by global error handler
          if (
            refreshError?.status === 401 ||
            refreshError?.message?.includes('expired') ||
            refreshError?.message?.includes('invalid')
          ) {
            console.warn('⚠️ Session refresh failed - token invalid or expired');
          }
          return;
        }
        
        if (refreshData.session) {
          console.log('✅ Session refreshed successfully');
          console.log('🔐 New expiry:', new Date((refreshData.session.expires_at || 0) * 1000).toISOString());
        }
      }
      
      lastCheckRef.current = Date.now();
    } catch (err: any) {
      console.error('❌ Session refresh error:', err);
      
      // Don't throw error, just log it
      // Global error handler will handle auth errors from queries
    }
  };

  useEffect(() => {
    // Initial check
    checkAndRefreshSession('initial');

    // Set up periodic checks
    intervalRef.current = setInterval(() => {
      checkAndRefreshSession('interval');
    }, CHECK_INTERVAL);

    // Handle visibility change (tab becomes visible again)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const timeSinceLastCheck = Date.now() - lastCheckRef.current;
        const minutesSinceLastCheck = Math.floor(timeSinceLastCheck / 60000);
        
        console.log(`👁️ Tab became visible (${minutesSinceLastCheck} minutes since last check)`);
        
        // If more than 2 minutes since last check, check immediately
        if (timeSinceLastCheck > 2 * 60 * 1000) {
          checkAndRefreshSession('visibility-change');
        }
      }
    };

    // Handle page show event (back from bfcache)
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        console.log('📄 Page restored from bfcache');
        checkAndRefreshSession('pageshow');
      }
    };

    // Handle focus event (window regains focus)
    const handleFocus = () => {
      const timeSinceLastCheck = Date.now() - lastCheckRef.current;
      
      // If more than 5 minutes since last check, check immediately
      if (timeSinceLastCheck > 5 * 60 * 1000) {
        console.log('🎯 Window focused after long idle');
        checkAndRefreshSession('focus');
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleFocus);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);
};

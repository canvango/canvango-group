/**
 * Global Error Handler Hook
 * 
 * Handles global errors from React Query, especially auth errors (401/403).
 * Automatically refreshes token and retries failed queries.
 * 
 * Features:
 * - Detects 401/403 errors
 * - Auto-refreshes Supabase token
 * - Retries failed queries after token refresh
 * - Auto-logout if refresh fails
 * - Prevents infinite retry loops
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/clients/supabase';
import { useNotification } from './useNotification';

export const useGlobalErrorHandler = () => {
  const queryClient = useQueryClient();
  const notification = useNotification();
  const isRefreshingRef = useRef(false);
  const refreshAttemptRef = useRef(0);
  const MAX_REFRESH_ATTEMPTS = 2;

  useEffect(() => {
    let logoutTimeoutId: NodeJS.Timeout;

    // Global error handler for React Query
    const handleQueryError = async (error: any) => {
      // Check if it's an auth error
      const isAuthError = 
        error?.status === 401 || 
        error?.status === 403 ||
        error?.message?.includes('JWT') ||
        error?.message?.includes('session') ||
        error?.message?.includes('expired') ||
        error?.message?.includes('unauthorized');

      if (!isAuthError) {
        return; // Not an auth error, let component handle it
      }

      // Check if user has an active session before attempting refresh
      // If no session exists, user is a guest - don't try to refresh
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('👤 No active session found (guest user), skipping token refresh');
        return; // Guest user, no need to refresh or logout
      }

      // Prevent concurrent refresh attempts
      if (isRefreshingRef.current) {
        console.log('🔄 Token refresh already in progress, skipping...');
        return;
      }

      // Check max attempts
      if (refreshAttemptRef.current >= MAX_REFRESH_ATTEMPTS) {
        console.error('❌ Max token refresh attempts reached, logging out...');
        notification.error('Sesi Anda telah berakhir. Silakan login kembali.');
        
        // Force logout with timeout to prevent hanging
        const logoutPromise = supabase.auth.signOut();
        const timeoutPromise = new Promise((resolve) => 
          setTimeout(resolve, 2000)
        );
        
        await Promise.race([logoutPromise, timeoutPromise]);
        localStorage.clear();
        window.location.href = '/login';
        return;
      }

      console.log('🔐 Auth error detected, attempting token refresh...');
      isRefreshingRef.current = true;
      refreshAttemptRef.current += 1;

      try {
        // Try to refresh the session with timeout
        const refreshPromise = supabase.auth.refreshSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Refresh timeout')), 5000)
        );

        const { data, error: refreshError } = await Promise.race([
          refreshPromise,
          timeoutPromise
        ]) as any;

        if (refreshError || !data.session) {
          throw new Error('Token refresh failed');
        }

        console.log('✅ Token refreshed successfully');
        
        // Reset attempt counter on success
        refreshAttemptRef.current = 0;

        // Invalidate all queries to trigger refetch with new token
        await queryClient.invalidateQueries();
        
        notification.success('Sesi diperpanjang otomatis');
      } catch (err) {
        console.error('❌ Token refresh failed:', err);
        
        // If refresh fails, logout user with timeout
        notification.error('Sesi Anda telah berakhir. Silakan login kembali.');
        
        const logoutPromise = supabase.auth.signOut();
        const timeoutPromise = new Promise((resolve) => 
          setTimeout(resolve, 2000)
        );
        
        await Promise.race([logoutPromise, timeoutPromise]);
        localStorage.clear();
        
        // Delay redirect slightly to show notification
        logoutTimeoutId = setTimeout(() => {
          window.location.href = '/login';
        }, 500);
      } finally {
        isRefreshingRef.current = false;
      }
    };

    // Set up global error handler
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated' && event.query.state.error) {
        handleQueryError(event.query.state.error);
      }
    });

    return () => {
      unsubscribe();
      if (logoutTimeoutId) {
        clearTimeout(logoutTimeoutId);
      }
    };
  }, [queryClient, notification]);
};

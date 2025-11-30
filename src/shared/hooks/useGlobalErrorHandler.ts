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
    // Global error handler for React Query
    const handleQueryError = async (error: any) => {
      // Check if it's an auth error
      const isAuthError = 
        error?.status === 401 || 
        error?.status === 403 ||
        error?.message?.includes('JWT') ||
        error?.message?.includes('session') ||
        error?.message?.includes('unauthorized');

      if (!isAuthError) {
        return; // Not an auth error, let component handle it
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
        
        // Force logout
        await supabase.auth.signOut();
        localStorage.clear();
        window.location.href = '/login';
        return;
      }

      console.log('🔐 Auth error detected, attempting token refresh...');
      isRefreshingRef.current = true;
      refreshAttemptRef.current += 1;

      try {
        // Try to refresh the session
        const { data, error: refreshError } = await supabase.auth.refreshSession();

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
        
        // If refresh fails, logout user
        notification.error('Sesi Anda telah berakhir. Silakan login kembali.');
        await supabase.auth.signOut();
        localStorage.clear();
        window.location.href = '/login';
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
    };
  }, [queryClient, notification]);
};

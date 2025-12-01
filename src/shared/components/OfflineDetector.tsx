import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/clients/supabase';

export const OfflineDetector: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = async () => {
      console.log('🌐 Network connection restored');
      setIsOnline(true);
      setShowNotification(true);
      
      // Auto-hide notification after 3 seconds
      setTimeout(() => setShowNotification(false), 3000);

      // When back online, check session and refetch queries
      try {
        // Check if session is still valid with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        );
        
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (error) {
          console.error('❌ Session check failed after reconnect:', error);
          return;
        }

        if (!session) {
          console.log('ℹ️ No active session after reconnect');
          return;
        }

        // Check if token needs refresh
        const expiresAt = session.expires_at;
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt ? expiresAt - now : 0;

        // If token expired or expiring soon (< 5 minutes), refresh it
        if (timeUntilExpiry < 5 * 60) {
          console.log('🔄 Refreshing session after reconnect...');
          
          const refreshPromise = supabase.auth.refreshSession();
          const refreshTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Refresh timeout')), 5000)
          );
          
          await Promise.race([refreshPromise, refreshTimeoutPromise]);
        }

        // Refetch all active queries with timeout
        console.log('🔄 Refetching queries after reconnect...');
        const refetchPromise = queryClient.refetchQueries({
          type: 'active',
          stale: true,
        });
        const refetchTimeoutPromise = new Promise((resolve) => 
          setTimeout(resolve, 10000)
        );
        
        await Promise.race([refetchPromise, refetchTimeoutPromise]);
        
        console.log('✅ Queries refetched successfully');
      } catch (err) {
        console.error('❌ Error handling reconnect:', err);
        // Don't throw - let app continue working
      }
    };

    const handleOffline = () => {
      console.log('🌐 Network connection lost');
      setIsOnline(false);
      setShowNotification(true);
      // Don't auto-hide offline notification
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queryClient]);

  if (!showNotification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      {isOnline ? (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
          <Wifi className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-900">Kembali Online</p>
            <p className="text-xs text-green-700">Koneksi tersambung, memuat ulang data...</p>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-900">Tidak Ada Koneksi</p>
            <p className="text-xs text-red-700">Periksa koneksi internet Anda</p>
          </div>
        </div>
      )}
    </div>
  );
};

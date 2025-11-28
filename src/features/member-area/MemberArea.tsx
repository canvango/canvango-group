import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MemberAreaLayout from './components/MemberAreaLayout';
import MemberRoutes from './routes';
import { OfflineDetector } from '../../shared/components/OfflineDetector';
import { useSessionRefresh } from './hooks/useSessionRefresh';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (previously called cacheTime)
      refetchOnWindowFocus: false,
      retry: 0, // OPTIMIZED: Disable retry for faster failure feedback
      refetchOnMount: false, // OPTIMIZED: Use cached data on mount
      refetchOnReconnect: false, // OPTIMIZED: Don't auto-refetch on reconnect
    }
  }
});

const MemberArea: React.FC = () => {
  // Auto-refresh session globally to prevent token expiration after idle
  useSessionRefresh();
  
  return (
    <QueryClientProvider client={queryClient}>
      <OfflineDetector />
      <MemberAreaLayout>
        <MemberRoutes />
      </MemberAreaLayout>
    </QueryClientProvider>
  );
};

export default MemberArea;

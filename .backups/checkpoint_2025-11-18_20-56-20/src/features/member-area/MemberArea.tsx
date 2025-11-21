import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MemberAreaLayout from './components/MemberAreaLayout';
import MemberRoutes from './routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000, // Previously called cacheTime
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const MemberArea: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <MemberAreaLayout>
        <MemberRoutes />
      </MemberAreaLayout>
    </QueryClientProvider>
  );
};

export default MemberArea;

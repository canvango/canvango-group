import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import contexts
import { AuthProvider } from '@member-area/contexts/AuthContext';
import { UIProvider } from '@member-area/contexts/UIContext';
import { ToastProvider } from '@shared/contexts/ToastContext';

// Import layout
import MemberAreaLayout from '@member-area/components/MemberAreaLayout';

// Import pages
import Dashboard from '@member-area/pages/Dashboard';
import TransactionHistory from '@member-area/pages/TransactionHistory';
import TopUp from '@member-area/pages/TopUp';
import BMAccounts from '@member-area/pages/BMAccounts';
import PersonalAccounts from '@member-area/pages/PersonalAccounts';
import VerifiedBMService from '@member-area/pages/VerifiedBMService';
import ClaimWarranty from '@member-area/pages/ClaimWarranty';
import APIDocumentation from '@member-area/pages/APIDocumentation';
import TutorialCenter from '@member-area/pages/TutorialCenter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const NewMemberAreaWrapper: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UIProvider>
          <ToastProvider>
            <MemberAreaLayout>
              <Routes>
                <Route path="/" element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="riwayat-transaksi" element={<TransactionHistory />} />
                <Route path="top-up" element={<TopUp />} />
                <Route path="akun-bm" element={<BMAccounts />} />
                <Route path="akun-personal" element={<PersonalAccounts />} />
                <Route path="jasa-verified-bm" element={<VerifiedBMService />} />
                <Route path="claim-garansi" element={<ClaimWarranty />} />
                <Route path="api" element={<APIDocumentation />} />
                <Route path="tutorial" element={<TutorialCenter />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </MemberAreaLayout>
          </ToastProvider>
        </UIProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default NewMemberAreaWrapper;

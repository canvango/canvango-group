import React from 'react';
import MemberAreaLayout from './components/MemberAreaLayout';
import MemberRoutes from './routes';
import { OfflineDetector } from '../../shared/components/OfflineDetector';
import { useSessionRefresh } from './hooks/useSessionRefresh';

const MemberArea: React.FC = () => {
  // Auto-refresh session globally to prevent token expiration after idle
  useSessionRefresh();
  
  return (
    <>
      <OfflineDetector />
      <MemberAreaLayout>
        <MemberRoutes />
      </MemberAreaLayout>
    </>
  );
};

export default MemberArea;

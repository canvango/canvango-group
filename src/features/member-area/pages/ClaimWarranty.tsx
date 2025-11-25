import React, { useState, useCallback } from 'react';
import {
  WarrantyStatusCards,
  ClaimSubmissionSection,
  WarrantyClaimsTable,
  ClaimResponseModal,
  ClaimSubmissionFormData
} from '../components/warranty';
import {
  useWarrantyClaims,
  useEligibleAccounts,
  useWarrantyStats,
  useSubmitClaim
} from '../hooks/useWarranty';
import { useWarrantyRealtime } from '../hooks/useWarrantyRealtime';
import { WarrantyClaim, ClaimStatus } from '../types/warranty';
import { usePageTitle } from '../hooks/usePageTitle';
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';
import { ErrorFallback } from '../../../shared/components/ErrorFallback';
import { ApplicationError } from '../../../shared/utils/errors';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../../../shared/hooks/useToast';
import ToastContainer from '../../../shared/components/ToastContainer';

const ClaimWarranty: React.FC = () => {
  usePageTitle('Claim Warranty');
  const { user } = useAuth();
  const [selectedClaim, setSelectedClaim] = useState<WarrantyClaim | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Toast notifications
  const toast = useToast();

  // Handle real-time status changes
  const handleStatusChange = useCallback((claim: any, _oldStatus: string, newStatus: string) => {
    const claimId = claim.id?.slice(0, 8) || 'Unknown';
    
    if (newStatus === 'approved') {
      toast.success(`Klaim #${claimId} telah disetujui! Akun pengganti akan segera dikirimkan.`, 7000);
    } else if (newStatus === 'rejected') {
      toast.error(`Klaim #${claimId} ditolak. Silakan lihat detail untuk informasi lebih lanjut.`, 7000);
    } else if (newStatus === 'reviewing') {
      toast.info(`Klaim #${claimId} sedang direview oleh tim kami.`, 5000);
    } else if (newStatus === 'completed') {
      toast.success(`Klaim #${claimId} selesai diproses!`, 5000);
    }
  }, [toast]);

  // Enable real-time updates for warranty claims
  useWarrantyRealtime(user?.id, {
    onStatusChange: handleStatusChange
  });

  // Fetch data
  const { data: claimsData, isLoading: claimsLoading, error: claimsError, refetch: refetchClaims } = useWarrantyClaims();
  const { data: eligibleData, isLoading: eligibleLoading } = useEligibleAccounts();
  const { data: statsData, isLoading: statsLoading } = useWarrantyStats();
  const submitClaimMutation = useSubmitClaim();

  // Handle claim submission
  const handleSubmitClaim = async (data: ClaimSubmissionFormData) => {
    try {
      await submitClaimMutation.mutateAsync(data);
      // Show success toast notification
      toast.success('Klaim garansi berhasil diajukan! Anda akan menerima notifikasi setelah klaim diproses.', 7000);
    } catch (error) {
      // Show error toast notification
      console.error('Failed to submit claim:', error);
      toast.error('Gagal mengajukan klaim. Silakan coba lagi.', 7000);
    }
  };

  // Handle view response
  const handleViewResponse = (claim: WarrantyClaim) => {
    setSelectedClaim(claim);
    setIsModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClaim(null);
  };

  // Calculate stats
  const stats = statsData || {
    total: 0,
    pending: 0,
    reviewing: 0,
    approved: 0,
    rejected: 0,
    completed: 0
  };

  // If we have claims data, calculate stats from it
  if (claimsData?.claims && !statsData) {
    const claims = claimsData.claims;
    const pending = claims.filter(c => c.status === ClaimStatus.PENDING || c.status === 'pending').length;
    const reviewing = claims.filter(c => c.status === 'reviewing').length;
    const approved = claims.filter(c => c.status === ClaimStatus.APPROVED || c.status === 'approved').length;
    const rejected = claims.filter(c => c.status === ClaimStatus.REJECTED || c.status === 'rejected').length;
    const completed = claims.filter(c => c.status === ClaimStatus.COMPLETED || c.status === 'completed').length;

    stats.total = claims.length;
    stats.pending = pending;
    stats.reviewing = reviewing;
    stats.approved = approved;
    stats.rejected = rejected;
    stats.completed = completed;
  }

  const claims = (claimsData?.claims || []) as any[]; // WarrantyClaimDB[] compatible with WarrantyClaim[]
  const eligibleAccounts = eligibleData?.accounts || [];

  // Loading state
  if (claimsLoading || eligibleLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Memuat data klaim garansi..." />
      </div>
    );
  }

  // Error state
  if (claimsError) {
    return (
      <ErrorFallback
        error={claimsError as ApplicationError}
        title="Gagal Memuat Data Klaim Garansi"
        onRetry={() => refetchClaims()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Claim Garansi</h1>
        <p className="text-gray-600">
          Ajukan klaim garansi untuk akun yang mengalami masalah
        </p>
      </div>

      {/* Status Cards */}
      <WarrantyStatusCards stats={stats} />

      {/* Claim Submission Section */}
      <ClaimSubmissionSection
        eligibleAccounts={eligibleAccounts}
        onSubmit={handleSubmitClaim}
        loading={submitClaimMutation.isPending}
      />

      {/* Claims History Table */}
      <WarrantyClaimsTable 
        claims={claims} 
        onViewResponse={handleViewResponse}
        isLoading={claimsLoading}
      />

      {/* Claim Response Modal */}
      <ClaimResponseModal
        claim={selectedClaim}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default ClaimWarranty;

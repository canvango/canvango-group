import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
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
import { WarrantyClaim, ClaimStatus } from '../types/warranty';
import { usePageTitle } from '../hooks/usePageTitle';
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';
import { useConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { ErrorFallback } from '../../../shared/components/ErrorFallback';
import { ApplicationError } from '../../../shared/utils/errors';

const ClaimWarranty: React.FC = () => {
  usePageTitle('Claim Warranty');
  const [selectedClaim, setSelectedClaim] = useState<WarrantyClaim | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Confirmation dialog
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Fetch data
  const { data: claimsData, isLoading: claimsLoading, error: claimsError, refetch: refetchClaims } = useWarrantyClaims();
  const { data: eligibleData, isLoading: eligibleLoading } = useEligibleAccounts();
  const { data: statsData, isLoading: statsLoading } = useWarrantyStats();
  const submitClaimMutation = useSubmitClaim();

  // Handle claim submission
  const handleSubmitClaim = async (data: ClaimSubmissionFormData) => {
    const account = eligibleData?.accounts.find(acc => acc.id === data.accountId);
    const accountInfo = account ? `${account.type} - ${account.transactionId}` : 'Selected account';

    confirm({
      title: 'Confirm Warranty Claim',
      message: `Are you sure you want to submit a warranty claim for ${accountInfo}? Once submitted, this claim will be reviewed by our team.`,
      variant: 'warning',
      confirmLabel: 'Submit Claim',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        try {
          await submitClaimMutation.mutateAsync(data);
          // Show success notification (you can add a toast notification here)
          alert('Klaim garansi berhasil diajukan! Anda akan menerima notifikasi setelah klaim diproses.');
        } catch (error) {
          // Show error notification
          console.error('Failed to submit claim:', error);
          alert('Gagal mengajukan klaim. Silakan coba lagi.');
        }
      },
    });
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
    pending: 0,
    approved: 0,
    rejected: 0,
    successRate: 0
  };

  // If we have claims data, calculate stats from it
  if (claimsData?.claims && !statsData) {
    const claims = claimsData.claims;
    const pending = claims.filter(c => c.status === ClaimStatus.PENDING).length;
    const approved = claims.filter(c => c.status === ClaimStatus.APPROVED).length;
    const rejected = claims.filter(c => c.status === ClaimStatus.REJECTED).length;
    const total = approved + rejected;
    const successRate = total > 0 ? Math.round((approved / total) * 100) : 0;

    stats.pending = pending;
    stats.approved = approved;
    stats.rejected = rejected;
    stats.successRate = successRate;
  }

  const claims = claimsData?.claims || [];
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

      {/* Confirmation Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default ClaimWarranty;

import React from 'react';
import { X, CheckCircle, XCircle, Clock } from 'lucide-react';
import Modal from '../../../../shared/components/Modal';
import Badge from '../../../../shared/components/Badge';
import Button from '../../../../shared/components/Button';
import { WarrantyClaim, ClaimStatus, ClaimReason } from '../../types/warranty';
import { formatDateTime } from '../../utils/formatters';

interface ClaimResponseModalProps {
  claim: WarrantyClaim | null;
  isOpen: boolean;
  onClose: () => void;
}

const ClaimResponseModal: React.FC<ClaimResponseModalProps> = ({ claim, isOpen, onClose }) => {
  if (!claim) return null;

  // Handle both camelCase (frontend) and snake_case (database) formats
  const claimId = claim.id || '';
  const transactionId = (claim as any).transactionId || (claim as any).purchase_id || '';
  const accountId = (claim as any).accountId || (claim as any).purchase_id || '';
  const adminResponse = (claim as any).adminResponse || (claim as any).admin_notes || '';

  const getStatusIcon = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.APPROVED:
        return <CheckCircle className="w-12 h-12 text-green-600" />;
      case ClaimStatus.REJECTED:
        return <XCircle className="w-12 h-12 text-red-600" />;
      case ClaimStatus.PENDING:
        return <Clock className="w-12 h-12 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.PENDING:
        return <Badge variant="warning">Pending</Badge>;
      case ClaimStatus.APPROVED:
        return <Badge variant="success">Approved</Badge>;
      case ClaimStatus.REJECTED:
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const parseClaimReason = (reason: string): { type: string; description: string } => {
    const reasonMap: Record<string, string> = {
      'login_failed': 'Akun tidak bisa login',
      'checkpoint': 'Akun terkena checkpoint',
      'disabled': 'Akun disabled/dinonaktifkan',
      'ad_limit_mismatch': 'Limit iklan tidak sesuai',
      'incomplete_data': 'Data akun tidak lengkap',
      'other': 'Lainnya'
    };

    // Try to parse format "reason_type: description"
    const parts = reason.split(':');
    if (parts.length >= 2) {
      const reasonType = parts[0].trim();
      const description = parts.slice(1).join(':').trim();
      return {
        type: reasonMap[reasonType] || reasonType,
        description
      };
    }

    // Fallback to original reason
    return {
      type: 'Lainnya',
      description: reason
    };
  };

  const getReasonLabel = (reason: ClaimReason | string): string => {
    if (typeof reason === 'string') {
      return parseClaimReason(reason).type;
    }
    
    switch (reason) {
      case ClaimReason.LOGIN_FAILED:
        return 'Akun tidak bisa login';
      case ClaimReason.CHECKPOINT:
        return 'Akun terkena checkpoint';
      case ClaimReason.DISABLED:
        return 'Akun disabled/dinonaktifkan';
      case ClaimReason.AD_LIMIT_MISMATCH:
        return 'Limit iklan tidak sesuai';
      case ClaimReason.INCOMPLETE_DATA:
        return 'Data akun tidak lengkap';
      case ClaimReason.OTHER:
        return 'Lainnya';
      default:
        return reason;
    }
  };

  const getStatusColor = (status: ClaimStatus): string => {
    switch (status) {
      case ClaimStatus.APPROVED:
        return 'bg-green-50 border-green-200';
      case ClaimStatus.REJECTED:
        return 'bg-red-50 border-red-200';
      case ClaimStatus.PENDING:
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Detail Klaim Garansi</h2>
            <p className="text-sm text-gray-500 mt-1">
              Klaim ID: #{claimId ? claimId.slice(0, 12) : 'N/A'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Status Banner */}
        <div className={`${getStatusColor(claim.status)} border rounded-lg p-6 mb-6`}>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {getStatusIcon(claim.status)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-semibold text-gray-900">Status Klaim:</span>
                {getStatusBadge(claim.status)}
              </div>
              <p className="text-sm text-gray-600">
                {claim.status === ClaimStatus.APPROVED && 'Klaim Anda telah disetujui. Akun pengganti akan segera dikirimkan.'}
                {claim.status === ClaimStatus.REJECTED && 'Klaim Anda ditolak. Silakan lihat alasan di bawah.'}
                {claim.status === ClaimStatus.PENDING && 'Klaim Anda sedang dalam proses review oleh tim kami.'}
              </p>
            </div>
          </div>
        </div>

        {/* Claim Details */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal Klaim
              </label>
              <p className="text-sm text-gray-900 mt-1">{formatDateTime(claim.createdAt)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Terakhir Diupdate
              </label>
              <p className="text-sm text-gray-900 mt-1">{formatDateTime(claim.updatedAt)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </label>
              <p className="text-sm text-gray-900 mt-1">#{transactionId ? transactionId.slice(0, 12) : 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account ID
              </label>
              <p className="text-sm text-gray-900 mt-1">#{accountId ? accountId.slice(0, 12) : 'N/A'}</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Alasan Klaim
            </label>
            <p className="text-sm font-medium text-blue-600 mt-1">
              {typeof claim.reason === 'string' ? parseClaimReason(claim.reason).type : getReasonLabel(claim.reason)}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Deskripsi Masalah
            </label>
            <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
              {typeof claim.reason === 'string' ? parseClaimReason(claim.reason).description : (claim.description || 'N/A')}
            </p>
          </div>
        </div>

        {/* Admin Response */}
        {adminResponse && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">
              Respon Admin
            </label>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{adminResponse}</p>
          </div>
        )}

        {/* No Response Yet */}
        {!adminResponse && claim.status === ClaimStatus.PENDING && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              Klaim Anda sedang dalam proses review. Anda akan menerima notifikasi setelah admin memberikan respon.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ClaimResponseModal;

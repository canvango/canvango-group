import React from 'react';
import { X } from 'lucide-react';
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

  const getStatusBadge = (status: ClaimStatus | string) => {
    const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : status;
    
    if (normalizedStatus === ClaimStatus.PENDING || normalizedStatus === 'pending') {
      return <Badge variant="warning" size="lg">Pending</Badge>;
    } else if (normalizedStatus === ClaimStatus.APPROVED || normalizedStatus === 'approved') {
      return <Badge variant="success" size="lg">Approved</Badge>;
    } else if (normalizedStatus === ClaimStatus.REJECTED || normalizedStatus === 'rejected') {
      return <Badge variant="error" size="lg">Rejected</Badge>;
    } else if (normalizedStatus === 'reviewing') {
      return <Badge variant="info" size="lg">Reviewing</Badge>;
    } else if (normalizedStatus === 'completed') {
      return <Badge variant="success" size="lg">Completed</Badge>;
    } else {
      return <Badge variant="default" size="lg">{status}</Badge>;
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

  const getStatusColor = (status: ClaimStatus | string): string => {
    const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : status;
    
    if (normalizedStatus === ClaimStatus.APPROVED || normalizedStatus === 'approved' || normalizedStatus === 'completed') {
      return 'bg-green-50 border-green-200';
    } else if (normalizedStatus === ClaimStatus.REJECTED || normalizedStatus === 'rejected') {
      return 'bg-red-50 border-red-200';
    } else if (normalizedStatus === ClaimStatus.PENDING || normalizedStatus === 'pending') {
      return 'bg-orange-50 border-orange-200';
    } else if (normalizedStatus === 'reviewing') {
      return 'bg-blue-50 border-blue-200';
    } else {
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
        <div className={`${getStatusColor(claim.status)} border rounded-2xl p-6 mb-6`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-sm font-medium text-gray-900">Status Klaim:</span>
            {getStatusBadge(claim.status)}
          </div>
        </div>

        {/* Claim Details */}
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-200 mb-6">
          <div className="grid grid-cols-2 divide-x divide-gray-200">
            <div className="p-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">
                Tanggal Klaim
              </label>
              <p className="text-sm font-medium text-gray-900">
                {claim.createdAt ? formatDateTime(claim.createdAt) : 'N/A'}
              </p>
            </div>
            <div className="p-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">
                Terakhir Diupdate
              </label>
              <p className="text-sm font-medium text-gray-900">
                {claim.updatedAt ? formatDateTime(claim.updatedAt) : 'N/A'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-gray-200">
            <div className="p-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">
                Transaction ID
              </label>
              <p className="text-sm font-medium text-gray-900 font-mono">
                #{transactionId ? transactionId.slice(0, 12) : 'N/A'}
              </p>
            </div>
            <div className="p-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">
                Account ID
              </label>
              <p className="text-sm font-medium text-gray-900 font-mono">
                #{accountId ? accountId.slice(0, 12) : 'N/A'}
              </p>
            </div>
          </div>

          <div className="p-4">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Alasan Klaim
            </label>
            <p className="text-sm font-medium text-blue-600">
              {typeof claim.reason === 'string' ? parseClaimReason(claim.reason).type : getReasonLabel(claim.reason)}
            </p>
          </div>

          <div className="p-4">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Deskripsi Masalah
            </label>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {typeof claim.reason === 'string' ? parseClaimReason(claim.reason).description : (claim.description || 'other')}
            </p>
          </div>
        </div>

        {/* Admin Response */}
        {adminResponse && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
            <label className="text-xs font-semibold text-blue-900 uppercase tracking-wider block mb-2">
              Respon Admin
            </label>
            <p className="text-sm text-blue-800 whitespace-pre-wrap leading-relaxed">{adminResponse}</p>
          </div>
        )}

        {/* No Response Yet */}
        {!adminResponse && claim.status === ClaimStatus.PENDING && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6">
            <p className="text-sm text-orange-800 leading-relaxed">
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

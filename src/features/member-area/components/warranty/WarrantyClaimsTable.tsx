import React from 'react';
import { Eye, Shield } from 'lucide-react';
import { WarrantyClaim, ClaimStatus, ClaimReason } from '../../types/warranty';
import Badge from '../../../../shared/components/Badge';
import Button from '../../../../shared/components/Button';
import { formatDate } from '../../utils/formatters';
import { SkeletonTable } from '../../../../shared/components/SkeletonLoader';

interface WarrantyClaimsTableProps {
  claims: WarrantyClaim[];
  onViewResponse: (claim: WarrantyClaim) => void;
  isLoading?: boolean;
}

const WarrantyClaimsTable: React.FC<WarrantyClaimsTableProps> = ({ 
  claims, 
  onViewResponse,
  isLoading = false 
}) => {
  const getStatusBadge = (status: ClaimStatus | string) => {
    const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : status;
    
    if (normalizedStatus === ClaimStatus.PENDING || normalizedStatus === 'pending') {
      return <Badge variant="warning">Pending</Badge>;
    } else if (normalizedStatus === ClaimStatus.APPROVED || normalizedStatus === 'approved') {
      return <Badge variant="success">Approved</Badge>;
    } else if (normalizedStatus === ClaimStatus.REJECTED || normalizedStatus === 'rejected') {
      return <Badge variant="error">Rejected</Badge>;
    } else if (normalizedStatus === 'reviewing') {
      return <Badge variant="info">Reviewing</Badge>;
    } else if (normalizedStatus === 'completed') {
      return <Badge variant="success">Completed</Badge>;
    } else {
      return <Badge variant="default">{status}</Badge>;
    }
  };

  const getStatusBadgeMobile = (status: ClaimStatus | string) => {
    const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : status;
    
    if (normalizedStatus === ClaimStatus.PENDING || normalizedStatus === 'pending') {
      return (
        <span className="px-3 py-1 text-xs font-medium rounded-2xl border bg-orange-100 text-orange-800 border-orange-200">
          Pending
        </span>
      );
    } else if (normalizedStatus === ClaimStatus.APPROVED || normalizedStatus === 'approved') {
      return (
        <span className="px-3 py-1 text-xs font-medium rounded-2xl border bg-green-100 text-green-800 border-green-200">
          Approved
        </span>
      );
    } else if (normalizedStatus === ClaimStatus.REJECTED || normalizedStatus === 'rejected') {
      return (
        <span className="px-3 py-1 text-xs font-medium rounded-2xl border bg-red-100 text-red-800 border-red-200">
          Rejected
        </span>
      );
    } else if (normalizedStatus === 'reviewing') {
      return (
        <span className="px-3 py-1 text-xs font-medium rounded-2xl border bg-blue-100 text-blue-800 border-blue-200">
          Reviewing
        </span>
      );
    } else if (normalizedStatus === 'completed') {
      return (
        <span className="px-3 py-1 text-xs font-medium rounded-2xl border bg-green-100 text-green-800 border-green-200">
          Completed
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 text-xs font-medium rounded-2xl border bg-gray-100 text-gray-800 border-gray-200">
          {status}
        </span>
      );
    }
  };

  const parseClaimReason = (reason: string): string => {
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
      return reasonMap[reasonType] || reasonType;
    }

    // Fallback to original reason
    return reason;
  };

  const getReasonLabel = (reason: ClaimReason | string): string => {
    if (typeof reason === 'string') {
      return parseClaimReason(reason);
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

  if (isLoading) {
    return <SkeletonTable rows={5} columns={7} />;
  }

  if (claims.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 p-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Klaim</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Anda belum memiliki riwayat klaim garansi. Ajukan klaim jika Anda mengalami masalah dengan akun yang dibeli.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block bg-white rounded-3xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Riwayat Klaim Garansi</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akun
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alasan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Garansi Berakhir
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {claims.map((claim: any) => (
              <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    #{(claim.purchase_id || claim.transactionId || claim.id)?.slice(0, 8) || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{formatDate(claim.created_at || claim.createdAt)}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      #{(claim.purchase_id || claim.accountId || claim.id)?.slice(0, 8) || 'N/A'}
                    </div>
                    {claim.purchases?.products?.product_name && (
                      <div className="text-gray-500 text-xs mt-0.5">
                        {claim.purchases.products.product_name}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{getReasonLabel(claim.claim_type || claim.reason)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(claim.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {claim.purchases?.warranty_expires_at 
                      ? formatDate(claim.purchases.warranty_expires_at)
                      : 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {claim.status !== ClaimStatus.PENDING && claim.status !== 'pending' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onViewResponse(claim)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Response</span>
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Mobile View */}
    <div className="md:hidden space-y-3">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900">Riwayat Klaim Garansi</h2>
      </div>

      {/* Claim Cards */}
      {claims.map((claim: any) => {
        const hasResponse = claim.status !== ClaimStatus.PENDING && claim.status !== 'pending';
        
        return (
          <div 
            key={claim.id}
            className="bg-white rounded-3xl border border-gray-200 p-4 divide-y divide-dashed divide-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            {/* Transaction ID */}
            <div className="flex justify-between items-start py-2.5 first:pt-0">
              <span className="text-xs text-gray-500">Transaction ID</span>
              <span className="text-xs font-medium text-gray-700 text-right font-mono">
                #{(claim.purchase_id || claim.transactionId || claim.id)?.slice(0, 8) || 'N/A'}
              </span>
            </div>

            {/* Tanggal */}
            <div className="flex justify-between items-start py-2.5">
              <span className="text-xs text-gray-500">Tanggal</span>
              <span className="text-xs font-medium text-gray-700 text-right">
                {formatDate(claim.created_at || claim.createdAt)}
              </span>
            </div>

            {/* Akun */}
            <div className="flex justify-between items-start py-2.5">
              <span className="text-xs text-gray-500">Akun</span>
              <div className="text-right">
                <span className="text-xs font-medium text-gray-700 font-mono">
                  #{(claim.purchase_id || claim.accountId || claim.id)?.slice(0, 8) || 'N/A'}
                </span>
                {claim.purchases?.products?.product_name && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    {claim.purchases.products.product_name}
                  </div>
                )}
              </div>
            </div>

            {/* Alasan */}
            <div className="flex justify-between items-start py-2.5">
              <span className="text-xs text-gray-500">Alasan</span>
              <span className="text-xs font-medium text-gray-700 text-right max-w-[60%]">
                {getReasonLabel(claim.claim_type || claim.reason)}
              </span>
            </div>

            {/* Status */}
            <div className="flex justify-between items-start py-2.5">
              <span className="text-xs text-gray-500">Status</span>
              {getStatusBadgeMobile(claim.status)}
            </div>

            {/* Garansi Berakhir */}
            <div className="flex justify-between items-start py-2.5">
              <span className="text-xs text-gray-500">Garansi Berakhir</span>
              <span className="text-xs font-medium text-gray-700 text-right">
                {claim.purchases?.warranty_expires_at 
                  ? formatDate(claim.purchases.warranty_expires_at)
                  : 'N/A'}
              </span>
            </div>

            {/* Aksi */}
            {hasResponse && (
              <div className="pt-3 last:pb-0">
                <button
                  onClick={() => onViewResponse(claim)}
                  className="w-full px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Response
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </>
  );
};

export default WarrantyClaimsTable;

import React, { useState } from 'react';
import { Package, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { VerifiedBMRequest, VerifiedBMRequestStatus } from '../../types/verified-bm';
import Badge from '../../../../shared/components/Badge';
import { SkeletonTable } from '../../../../shared/components/SkeletonLoader';
import { URLStatusList } from './URLStatusList';

interface VerifiedBMOrdersTableProps {
  requests: VerifiedBMRequest[];
  isLoading?: boolean;
}

const VerifiedBMOrdersTable: React.FC<VerifiedBMOrdersTableProps> = ({ 
  requests,
  isLoading = false 
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (requestId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  const getStatusBadge = (status: VerifiedBMRequestStatus) => {
    switch (status) {
      case 'pending':
        return (
          <div title="Menunggu diproses admin">
            <Badge variant="warning">Pending</Badge>
          </div>
        );
      case 'processing':
        return (
          <div title="Sedang diproses admin">
            <Badge variant="info">Processing</Badge>
          </div>
        );
      case 'completed':
        return (
          <div title="Selesai diproses">
            <Badge variant="success">Completed</Badge>
          </div>
        );
      case 'failed':
        return (
          <div title="Dibatalkan (semua akun di-refund)">
            <Badge variant="error">Cancelled</Badge>
          </div>
        );
      case 'cancelled':
        return (
          <div title="Dibatalkan (semua akun di-refund)">
            <Badge variant="default">Cancelled</Badge>
          </div>
        );
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return <SkeletonTable rows={5} columns={5} />;
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 p-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Request</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Anda belum memiliki riwayat request verifikasi BM. Buat request baru untuk memulai.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Riwayat Request</h2>
            <p className="text-sm text-gray-600 mt-1">
              Lihat status detail setiap akun dengan expand request
            </p>
          </div>
          
          {/* Status Legend */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded" title="Akun berhasil diverifikasi">
              ✅ Selesai
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded" title="Sedang diproses admin">
              ⚠️ Proses
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded" title="Menunggu diproses">
              🕐 Pending
            </span>
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded" title="Akun gagal dan sudah di-refund">
              🔄 Refund
            </span>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                {/* Expand column */}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Request ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jumlah Akun
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => {
              const isExpanded = expandedRows.has(request.id);
              return (
                <React.Fragment key={request.id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleRow(request.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          #{request.id.slice(0, 8)}
                        </span>
                        {request.admin_notes && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            Note: {request.admin_notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {formatDate(request.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-sm text-gray-900 font-medium">
                          {request.quantity} akun
                        </span>
                        
                        {/* URL Status Summary */}
                        {request.url_details && request.url_details.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            {(() => {
                              const completed = request.url_details.filter(u => u.status === 'completed').length;
                              const refunded = request.url_details.filter(u => u.status === 'refunded').length;
                              const processing = request.url_details.filter(u => u.status === 'processing').length;
                              const pending = request.url_details.filter(u => u.status === 'pending').length;
                              const failed = request.url_details.filter(u => u.status === 'failed').length;
                              
                              return (
                                <>
                                  {completed > 0 && (
                                    <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                                      ✅ {completed}
                                    </span>
                                  )}
                                  {processing > 0 && (
                                    <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                                      ⚠️ {processing}
                                    </span>
                                  )}
                                  {pending > 0 && (
                                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">
                                      🕐 {pending}
                                    </span>
                                  )}
                                  {failed > 0 && (
                                    <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                                      ❌ {failed}
                                    </span>
                                  )}
                                  {refunded > 0 && (
                                    <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                                      🔄 {refunded}
                                    </span>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(Number(request.amount))}
                        </span>
                        
                        {/* Show refund info if any */}
                        {request.url_details && (() => {
                          const refunded = request.url_details.filter(u => u.status === 'refunded').length;
                          if (refunded > 0) {
                            const refundAmount = (Number(request.amount) / request.quantity) * refunded;
                            return (
                              <div className="text-xs text-red-600 mt-1">
                                Refund: {formatCurrency(refundAmount)}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-gray-50">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="space-y-4">
                          {/* URL Details with Status */}
                          {request.url_details && request.url_details.length > 0 ? (
                            <URLStatusList
                              urls={request.url_details}
                              pricePerUrl={Number(request.amount) / request.quantity}
                              isAdmin={false}
                            />
                          ) : (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">
                                URL yang Disubmit ({request.urls.length})
                              </h4>
                              <div className="bg-white rounded-2xl border border-gray-200 p-3 max-h-48 overflow-y-auto">
                                <ul className="space-y-2">
                                  {request.urls.map((url, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                      <span className="text-gray-500 font-mono">{index + 1}.</span>
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary-600 hover:text-primary-700 hover:underline flex-1 break-all flex items-center gap-1"
                                      >
                                        {url}
                                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Notes Section */}
                          {request.notes && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">
                                Catatan Anda
                              </h4>
                              <div className="bg-white rounded-2xl border border-gray-200 p-3">
                                <p className="text-sm text-gray-700">{request.notes}</p>
                              </div>
                            </div>
                          )}

                          {/* Timestamps */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                Dibuat
                              </h4>
                              <p className="text-sm text-gray-900">{formatDate(request.created_at)}</p>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                Diupdate
                              </h4>
                              <p className="text-sm text-gray-900">{formatDate(request.updated_at)}</p>
                            </div>
                            {request.completed_at && (
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                  Selesai
                                </h4>
                                <p className="text-sm text-gray-900">{formatDate(request.completed_at)}</p>
                              </div>
                            )}
                            {request.failed_at && (
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                  Gagal
                                </h4>
                                <p className="text-sm text-gray-900">{formatDate(request.failed_at)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VerifiedBMOrdersTable;

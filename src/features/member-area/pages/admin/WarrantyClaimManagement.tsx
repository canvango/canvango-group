import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, Clock, AlertCircle, DollarSign } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllWarrantyClaims,
  updateWarrantyClaimStatus,
  processWarrantyRefund,
  getWarrantyClaimStats,
  WarrantyClaim,
  UpdateWarrantyClaimStatusData
} from '../../services/admin-warranty.service';
import { LoadingSpinner } from '../../../../shared/components/LoadingSpinner';
import StatusBadge from '../../components/shared/StatusBadge';
import { usePageTitle } from '../../hooks/usePageTitle';
import { formatDate } from '../../utils/formatters';
import EvidenceImagesViewer from '../../components/warranty/EvidenceImagesViewer';

const WarrantyClaimManagement: React.FC = () => {
  usePageTitle('Warranty Claim Management');
  const queryClient = useQueryClient();
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedClaim, setSelectedClaim] = useState<WarrantyClaim | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch claims
  const { data: claimsData, isLoading: claimsLoading } = useQuery({
    queryKey: ['admin-warranty-claims', statusFilter, page],
    queryFn: () => getAllWarrantyClaims({
      status: statusFilter === 'all' ? undefined : statusFilter as any,
      page,
      limit: 10
    })
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['admin-warranty-stats'],
    queryFn: getWarrantyClaimStats
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ claimId, data }: { claimId: string; data: UpdateWarrantyClaimStatusData }) =>
      updateWarrantyClaimStatus(claimId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-warranty-claims'] });
      queryClient.invalidateQueries({ queryKey: ['admin-warranty-stats'] });
      setIsModalOpen(false);
      setSelectedClaim(null);
      setAdminNotes('');
    }
  });

  // Process refund mutation
  const refundMutation = useMutation({
    mutationFn: (claimId: string) => processWarrantyRefund(claimId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-warranty-claims'] });
      queryClient.invalidateQueries({ queryKey: ['admin-warranty-stats'] });
      alert('Refund processed successfully!');
    }
  });

  const handleUpdateStatus = (status: 'reviewing' | 'approved' | 'rejected' | 'completed') => {
    if (!selectedClaim) return;
    
    updateStatusMutation.mutate({
      claimId: selectedClaim.id,
      data: {
        status,
        admin_notes: adminNotes || undefined
      }
    });
  };

  const handleProcessRefund = (claimId: string) => {
    if (confirm('Are you sure you want to process this refund? This will add the amount to user balance.')) {
      refundMutation.mutate(claimId);
    }
  };

  if (claimsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading warranty claims..." />
      </div>
    );
  }

  const claims = claimsData?.claims || [];
  const pagination = claimsData?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Warranty Claim Management</h1>
        <p className="text-gray-600">Manage and process warranty claims from users</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Claims</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Shield className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Reviewing</p>
                <p className="text-2xl font-bold text-blue-900">{stats.reviewing}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Approved</p>
                <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Rejected</p>
                <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-primary-50 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-700">Success Rate</p>
                <p className="text-2xl font-bold text-purple-900">{stats.successRate}%</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Claims</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Claim Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {claims.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No warranty claims found
                  </td>
                </tr>
              ) : (
                claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {claim.user?.full_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">{claim.user?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {claim.purchase?.product_name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {claim.purchase?.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                        {claim.claim_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge 
                        status={claim.status === 'reviewing' ? 'processing' : claim.status as any} 
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(claim.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          console.log('📋 Selected Claim:', claim);
                          console.log('🛍️ Purchase Data:', claim.purchase);
                          console.log('📦 Product Data:', claim.purchase?.products);
                          setSelectedClaim(claim);
                          setAdminNotes(claim.admin_notes || '');
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        View Details
                      </button>
                      {claim.status === 'approved' && claim.claim_type === 'refund' && (
                        <button
                          onClick={() => handleProcessRefund(claim.id)}
                          disabled={refundMutation.isPending}
                          className="ml-3 text-green-600 hover:text-green-900 font-medium disabled:opacity-50"
                        >
                          Process Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total claims)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Warranty Claim Details</h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedClaim(null);
                    setAdminNotes('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Warning jika data produk tidak ada */}
                {!selectedClaim.purchase?.product_name && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        Product information is not available. The product may have been deleted or the purchase data is incomplete.
                      </p>
                    </div>
                  </div>
                )}

                {/* User Info */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">User Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm"><span className="font-medium">Name:</span> {selectedClaim.user?.full_name || 'N/A'}</p>
                    <p className="text-sm"><span className="font-medium">Email:</span> {selectedClaim.user?.email || 'N/A'}</p>
                    <p className="text-sm"><span className="font-medium">Username:</span> {selectedClaim.user?.username || 'N/A'}</p>
                  </div>
                </div>

                {/* Product Info */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Product Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Product:</span> {selectedClaim.purchase?.product_name || 'Unknown Product'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Type:</span> {selectedClaim.purchase?.product_type || 'N/A'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Category:</span> {selectedClaim.purchase?.category || 'N/A'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Warranty Expires:</span> {selectedClaim.purchase?.warranty_expires_at ? formatDate(selectedClaim.purchase.warranty_expires_at) : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Claim Info */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Claim Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Claim Type:</span> <span className="capitalize">{selectedClaim.claim_type || 'N/A'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Status:</span> <StatusBadge status={selectedClaim.status === 'reviewing' ? 'processing' : selectedClaim.status as any} />
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Created:</span> {selectedClaim.created_at ? formatDate(selectedClaim.created_at) : 'N/A'}
                    </p>
                    {selectedClaim.resolved_at && (
                      <p className="text-sm"><span className="font-medium">Resolved:</span> {formatDate(selectedClaim.resolved_at)}</p>
                    )}
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Reason</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{selectedClaim.reason || 'No reason provided'}</p>
                  </div>
                </div>

                {/* Evidence Images */}
                {selectedClaim.evidence_urls && selectedClaim.evidence_urls.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Evidence Screenshots ({selectedClaim.evidence_urls.length})
                    </h3>
                    <EvidenceImagesViewer evidenceUrls={selectedClaim.evidence_urls} />
                  </div>
                )}

                {/* Admin Notes */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Admin Notes</h3>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add notes for the user..."
                  />
                </div>

                {/* Actions */}
                {selectedClaim.status !== 'completed' && (
                  <div className="flex gap-3 pt-4">
                    {selectedClaim.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus('reviewing')}
                        disabled={updateStatusMutation.isPending}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        Mark as Reviewing
                      </button>
                    )}
                    {(selectedClaim.status === 'pending' || selectedClaim.status === 'reviewing') && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus('approved')}
                          disabled={updateStatusMutation.isPending}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus('rejected')}
                          disabled={updateStatusMutation.isPending}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {selectedClaim.status === 'approved' && (
                      <button
                        onClick={() => handleUpdateStatus('completed')}
                        disabled={updateStatusMutation.isPending}
                        className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                      >
                        Mark as Completed
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarrantyClaimManagement;

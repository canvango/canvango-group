import React, { useState, useEffect } from 'react';
import {
  getAllClaims,
  updateClaimStatus,
  resolveClaim,
  Claim,

} from '../../services/adminClaimService';

const ClaimManagement: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [responseNote, setResponseNote] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetchClaims();
  }, [currentPage, statusFilter]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page: currentPage,
        limit,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await getAllClaims(params);
      setClaims(response.claims);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (claim: Claim) => {
    setSelectedClaim(claim);
    setShowDetailModal(true);
  };

  const handleApproveClick = (claim: Claim) => {
    setSelectedClaim(claim);
    setResponseNote('');
    setShowApproveModal(true);
  };

  const handleRejectClick = (claim: Claim) => {
    setSelectedClaim(claim);
    setResponseNote('');
    setShowRejectModal(true);
  };

  const handleApproveClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    try {
      setProcessingAction(true);
      await updateClaimStatus(selectedClaim.id, 'APPROVED', responseNote || undefined);
      setShowApproveModal(false);
      setSelectedClaim(null);
      setResponseNote('');
      fetchClaims();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to approve claim');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    try {
      setProcessingAction(true);
      await updateClaimStatus(selectedClaim.id, 'REJECTED', responseNote || undefined);
      setShowRejectModal(false);
      setSelectedClaim(null);
      setResponseNote('');
      fetchClaims();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to reject claim');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleResolveClaim = async (claim: Claim) => {
    if (!confirm(`Process refund for this claim? This will add the transaction amount to the user's balance.`)) {
      return;
    }

    try {
      setProcessingAction(true);
      await resolveClaim(claim.id);
      alert('Claim resolved and refund processed successfully');
      fetchClaims();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to resolve claim');
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Claim Management</h1>
        <p className="text-gray-600 mt-1">Manage warranty claims from members</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Claims Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading claims...</p>
          </div>
        ) : claims.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No claims found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {claims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {claim.user ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {claim.user.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{claim.user.username}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Unknown User</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {claim.transaction_id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {claim.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                            claim.status
                          )}`}
                        >
                          {claim.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(claim.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewDetail(claim)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Detail
                        </button>
                        {claim.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveClick(claim)}
                              className="text-green-600 hover:text-green-900"
                              disabled={processingAction}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectClick(claim)}
                              className="text-red-600 hover:text-red-900"
                              disabled={processingAction}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {claim.status === 'APPROVED' && (
                          <button
                            onClick={() => handleResolveClaim(claim)}
                            className="text-primary-600 hover:text-purple-900"
                            disabled={processingAction}
                          >
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Claim Detail</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">User</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedClaim.user?.full_name} (@{selectedClaim.user?.username})
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{selectedClaim.user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{selectedClaim.transaction_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <p className="mt-1 text-sm text-gray-900">{selectedClaim.reason}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedClaim.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span
                  className={`mt-1 inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                    selectedClaim.status
                  )}`}
                >
                  {selectedClaim.status}
                </span>
              </div>
              {selectedClaim.response_note && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Admin Response</label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedClaim.response_note}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Created At</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedClaim.created_at).toLocaleString('id-ID')}
                </p>
              </div>
              {selectedClaim.resolved_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Resolved At</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedClaim.resolved_at).toLocaleString('id-ID')}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedClaim(null);
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Approve Claim</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to approve this claim from {selectedClaim.user?.full_name}?
            </p>
            <form onSubmit={handleApproveClaim}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Response Note (Optional)
                </label>
                <textarea
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Add a note for the user..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedClaim(null);
                    setResponseNote('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={processingAction}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  disabled={processingAction}
                >
                  {processingAction ? 'Processing...' : 'Approve'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Reject Claim</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to reject this claim from {selectedClaim.user?.full_name}?
            </p>
            <form onSubmit={handleRejectClaim}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Response Note (Optional)
                </label>
                <textarea
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Explain why the claim is rejected..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedClaim(null);
                    setResponseNote('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={processingAction}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  disabled={processingAction}
                >
                  {processingAction ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimManagement;

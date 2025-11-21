import React, { useState, useEffect } from 'react';
import {
  getAllClaims,
  updateClaimStatus,
  resolveClaim,
  provideReplacementAccount,
  Claim,
} from '../../services/adminClaimService';

// Helper function to parse and format claim reason
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

const ClaimManagement: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showReplacementModal, setShowReplacementModal] = useState(false);
  const [responseNote, setResponseNote] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [replacementAccount, setReplacementAccount] = useState({
    email: '',
    password: '',
    additional_info: '',
  });

  const limit = 10;

  useEffect(() => {
    fetchClaims();
  }, [currentPage, statusFilter]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching claims - Page:', currentPage, 'Status:', statusFilter);
      
      const filters: any = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const response = await getAllClaims(filters, currentPage, limit);
      
      console.log('✅ Claims response:', response);
      
      setClaims(response.claims);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      console.error('❌ Error fetching claims:', err);
      setError(err.message || 'Failed to fetch claims');
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

  const handleProvideReplacementClick = (claim: Claim) => {
    setSelectedClaim(claim);
    setResponseNote('');
    setReplacementAccount({ email: '', password: '', additional_info: '' });
    setShowReplacementModal(true);
  };

  const handleApproveClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    try {
      setProcessingAction(true);
      await updateClaimStatus(selectedClaim.id, 'approved', responseNote || undefined);
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
      await updateClaimStatus(selectedClaim.id, 'rejected', responseNote || undefined);
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

  const handleProvideReplacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    if (!replacementAccount.email || !replacementAccount.password) {
      alert('Email and password are required');
      return;
    }

    try {
      setProcessingAction(true);
      await provideReplacementAccount(
        selectedClaim.id,
        replacementAccount,
        responseNote || undefined
      );
      setShowReplacementModal(false);
      setSelectedClaim(null);
      setReplacementAccount({ email: '', password: '', additional_info: '' });
      setResponseNote('');
      fetchClaims();
      alert('Replacement account provided successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to provide replacement');
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getClaimTypeBadge = (claimType: string) => {
    switch (claimType) {
      case 'replacement':
        return { icon: '🔄', text: 'Replacement', color: 'bg-blue-100 text-blue-800' };
      case 'refund':
        return { icon: '💰', text: 'Refund', color: 'bg-green-100 text-green-800' };
      case 'repair':
        return { icon: '🔧', text: 'Repair', color: 'bg-orange-100 text-orange-800' };
      default:
        return { icon: '📋', text: claimType, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const isWarrantyActive = (expiresAt: string) => {
    return new Date(expiresAt) > new Date();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Claim Management</h1>
        <p className="text-gray-600 mt-1">Manage warranty claims from members</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl shadow p-4 mb-6">
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
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-3xl mb-6">
          {error}
        </div>
      )}

      {/* Claims Table */}
      <div className="bg-white rounded-3xl shadow overflow-hidden">
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
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Claim Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Screenshot
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Warranty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {claims.map((claim) => {
                    const claimTypeBadge = getClaimTypeBadge(claim.claim_type);
                    const warrantyActive = claim.purchase?.warranty_expires_at 
                      ? isWarrantyActive(claim.purchase.warranty_expires_at)
                      : false;
                    
                    return (
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
                        <td className="px-6 py-4">
                          {claim.purchase?.products ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {claim.purchase.products.product_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {claim.purchase.products.product_type} • {claim.purchase.products.category}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Unknown Product</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-2xl ${claimTypeBadge.color}`}>
                            {claimTypeBadge.icon} {claimTypeBadge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs">
                            <div className="font-medium text-blue-600 mb-1">
                              {parseClaimReason(claim.reason).type}
                            </div>
                            <div className="text-xs text-gray-600 truncate">
                              {parseClaimReason(claim.reason).description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {claim.evidence_urls && claim.evidence_urls.length > 0 ? (
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium text-blue-600">
                                📸 {claim.evidence_urls.length}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-2xl ${getStatusBadgeColor(
                              claim.status
                            )}`}
                          >
                            {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {claim.purchase?.warranty_expires_at ? (
                            <div>
                              <div className={`text-xs font-medium ${warrantyActive ? 'text-green-600' : 'text-red-600'}`}>
                                {warrantyActive ? '✅ Active' : '❌ Expired'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(claim.purchase.warranty_expires_at).toLocaleDateString('id-ID')}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleViewDetail(claim)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Detail
                          </button>
                          {(claim.status === 'pending' || claim.status === 'reviewing') && (
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
                          {claim.status === 'approved' && claim.claim_type === 'replacement' && (
                            <button
                              onClick={() => handleProvideReplacementClick(claim)}
                              className="text-blue-600 hover:text-blue-900"
                              disabled={processingAction}
                            >
                              Provide Replacement
                            </button>
                          )}
                          {claim.status === 'approved' && claim.claim_type === 'refund' && (
                            <button
                              onClick={() => handleResolveClaim(claim)}
                              className="text-primary-600 hover:text-purple-900"
                              disabled={processingAction}
                            >
                              Process Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">Claim Detail</h2>
            <div className="space-y-6">
              {/* User Information */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">👤 User Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedClaim.user?.full_name}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Username</label>
                    <p className="mt-1 text-sm text-gray-900">@{selectedClaim.user?.username}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedClaim.user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              {selectedClaim.purchase?.products && (
                <div className="bg-blue-50 rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">📦 Product Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-500">Product Name</label>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {selectedClaim.purchase.products.product_name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Type</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedClaim.purchase.products.product_type}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Category</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedClaim.purchase.products.category}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Price</label>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {formatCurrency(selectedClaim.purchase.products.price)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Purchase Information */}
              {selectedClaim.purchase && (
                <div className="bg-green-50 rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">🛒 Purchase Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-500">Purchase ID</label>
                      <p className="mt-1 text-xs font-mono text-gray-900">{selectedClaim.purchase.id}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Purchase Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedClaim.purchase.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Total Price</label>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {formatCurrency(selectedClaim.purchase.total_price)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-500">Warranty Status</label>
                      <div className="mt-1 flex items-center gap-2">
                        {isWarrantyActive(selectedClaim.purchase.warranty_expires_at) ? (
                          <>
                            <span className="text-sm font-medium text-green-600">✅ Active</span>
                            <span className="text-xs text-gray-500">
                              Expires: {new Date(selectedClaim.purchase.warranty_expires_at).toLocaleDateString('id-ID')}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-sm font-medium text-red-600">❌ Expired</span>
                            <span className="text-xs text-gray-500">
                              Expired: {new Date(selectedClaim.purchase.warranty_expires_at).toLocaleDateString('id-ID')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Details */}
              {selectedClaim.purchase?.account_details && Object.keys(selectedClaim.purchase.account_details).length > 0 && (
                <div className="bg-purple-50 rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">🔐 Account Details</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedClaim.purchase.account_details).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-gray-500 capitalize">{key}</label>
                        <p className="mt-1 text-sm text-gray-900 font-mono">
                          {key.toLowerCase().includes('password') ? '••••••••' : String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Claim Information */}
              <div className="bg-yellow-50 rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">📋 Claim Information</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Claim Type</label>
                      <p className="mt-1">
                        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-2xl ${getClaimTypeBadge(selectedClaim.claim_type).color}`}>
                          {getClaimTypeBadge(selectedClaim.claim_type).icon} {getClaimTypeBadge(selectedClaim.claim_type).text}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Status</label>
                      <p className="mt-1">
                        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-2xl ${getStatusBadgeColor(selectedClaim.status)}`}>
                          {selectedClaim.status.charAt(0).toUpperCase() + selectedClaim.status.slice(1)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Reason Type</label>
                    <p className="mt-1 text-sm font-medium text-blue-600">
                      {parseClaimReason(selectedClaim.reason).type}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Description</label>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                      {parseClaimReason(selectedClaim.reason).description}
                    </p>
                  </div>
                  
                  {/* Screenshot Evidence */}
                  {selectedClaim.evidence_urls && selectedClaim.evidence_urls.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">Bukti Screenshot</label>
                      <div className="grid grid-cols-3 gap-3">
                        {selectedClaim.evidence_urls.map((url: string, index: number) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-blue-400 transition-all"
                          >
                            <img
                              src={url}
                              alt={`Screenshot ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                              <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                Lihat Penuh
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Created At</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedClaim.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                  {selectedClaim.resolved_at && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Resolved At</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedClaim.resolved_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                  )}
                  {selectedClaim.claim_type === 'refund' && selectedClaim.purchase && (
                    <div className="bg-white rounded-xl p-3 border-2 border-green-200">
                      <label className="block text-xs font-medium text-green-700">Refund Amount</label>
                      <p className="mt-1 text-lg font-bold text-green-600">
                        {formatCurrency(selectedClaim.purchase.total_price)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Replacement Account (if provided) */}
              {selectedClaim.resolution_details?.replacement_account && (
                <div className="bg-green-50 rounded-2xl p-4 border-2 border-green-200">
                  <h3 className="text-sm font-semibold text-green-700 mb-3">✅ Replacement Account Provided</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Email/Username</label>
                      <p className="mt-1 text-sm text-gray-900 font-mono">
                        {selectedClaim.resolution_details.replacement_account.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Password</label>
                      <p className="mt-1 text-sm text-gray-900 font-mono">
                        {selectedClaim.resolution_details.replacement_account.password}
                      </p>
                    </div>
                    {selectedClaim.resolution_details.replacement_account.additional_info && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Additional Info</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedClaim.resolution_details.replacement_account.additional_info}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Provided At</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedClaim.resolution_details.replacement_account.provided_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {selectedClaim.admin_notes && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">📝 Admin Notes</h3>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedClaim.admin_notes}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              {(selectedClaim.status === 'pending' || selectedClaim.status === 'reviewing') && (
                <>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleApproveClick(selectedClaim);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleRejectClick(selectedClaim);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedClaim(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                  disabled={processingAction}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                  disabled={processingAction}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
                  disabled={processingAction}
                >
                  {processingAction ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Replacement Account Modal */}
      {showReplacementModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Provide Replacement Account</h2>
            <p className="text-gray-600 mb-4">
              Provide a new account for <span className="font-medium">{selectedClaim.user?.full_name}</span>
            </p>
            <form onSubmit={handleProvideReplacement}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email/Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={replacementAccount.email}
                    onChange={(e) =>
                      setReplacementAccount({
                        ...replacementAccount,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="account@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={replacementAccount.password}
                    onChange={(e) =>
                      setReplacementAccount({
                        ...replacementAccount,
                        password: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Info (Optional)
                  </label>
                  <textarea
                    value={replacementAccount.additional_info}
                    onChange={(e) =>
                      setReplacementAccount({
                        ...replacementAccount,
                        additional_info: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Any additional information..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={responseNote}
                    onChange={(e) => setResponseNote(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Add notes for the user..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowReplacementModal(false);
                    setSelectedClaim(null);
                    setReplacementAccount({ email: '', password: '', additional_info: '' });
                    setResponseNote('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                  disabled={processingAction}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
                  disabled={processingAction}
                >
                  {processingAction ? 'Processing...' : 'Send Replacement'}
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

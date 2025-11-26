import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader, 
  ChevronDown,
  ChevronUp,
  Copy
} from 'lucide-react';
import {
  useAdminVerifiedBMRequests,
  useAdminVerifiedBMStats,
  useUpdateURLStatus,
  useRefundURL
} from '@/hooks/useAdminVerifiedBM';
import { VerifiedBMRequestStatus } from '../../types/verified-bm';
import { URLStatusList } from '../../components/verified-bm/URLStatusList';
import { toast } from 'react-hot-toast';

const VerifiedBMManagement: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [refundingUrl, setRefundingUrl] = useState<string | null>(null);
  const [refundNotes, setRefundNotes] = useState('');

  // Fetch data
  const { data: requests = [], isLoading } = useAdminVerifiedBMRequests({
    status: statusFilter,
    search: searchTerm
  });
  const { data: stats } = useAdminVerifiedBMStats();

  // Mutations
  const updateURLStatusMutation = useUpdateURLStatus();
  const refundURLMutation = useRefundURL();

  const handleUpdateURLStatus = async (
    urlId: string,
    status: 'processing' | 'completed' | 'failed'
  ) => {
    const loadingToast = toast.loading(`Updating status...`);

    try {
      await updateURLStatusMutation.mutateAsync({ urlId, status });
      toast.success(`Status updated!`, { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status', { id: loadingToast });
    }
  };

  const handleRefundURL = async (urlId: string) => {
    setRefundingUrl(urlId);
  };

  const confirmRefund = async () => {
    if (!refundingUrl || !refundNotes.trim()) {
      toast.error('Please provide refund notes');
      return;
    }

    const loadingToast = toast.loading('Processing refund...');

    try {
      await refundURLMutation.mutateAsync({
        urlId: refundingUrl,
        adminNotes: refundNotes
      });
      toast.success('URL refunded successfully!', { id: loadingToast });
      setRefundingUrl(null);
      setRefundNotes('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to refund', { id: loadingToast });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const toggleRowExpand = (requestId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusBadge = (status: VerifiedBMRequestStatus) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || badges.pending;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kelola Verified BM Requests</h1>
        <p className="text-gray-600 mt-1">Manage all verified BM service requests</p>
      </div>

      {/* Status Tabs */}
      <div className="card">
        <div className="card-body p-0">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                statusFilter === 'pending'
                  ? 'border-yellow-500 text-yellow-700 bg-yellow-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Pending</span>
                {stats && <span className="badge badge-warning">{stats.pendingRequests}</span>}
              </div>
            </button>
            <button
              onClick={() => setStatusFilter('processing')}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                statusFilter === 'processing'
                  ? 'border-blue-500 text-blue-700 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Loader className="w-4 h-4" />
                <span>Processing</span>
                {stats && <span className="badge badge-info">{stats.processingRequests}</span>}
              </div>
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                statusFilter === 'completed'
                  ? 'border-green-500 text-green-700 bg-green-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Completed</span>
                {stats && <span className="badge badge-success">{stats.completedRequests}</span>}
              </div>
            </button>
            <button
              onClick={() => setStatusFilter('failed')}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                statusFilter === 'failed'
                  ? 'border-red-500 text-red-700 bg-red-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <XCircle className="w-4 h-4" />
                <span>Cancelled</span>
                {stats && <span className="badge badge-error">{stats.failedRequests}</span>}
              </div>
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                statusFilter === 'all'
                  ? 'border-primary-500 text-primary-700 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>All</span>
                {stats && <span className="badge">{stats.totalRequests}</span>}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="card-body">
          <input
            type="text"
            placeholder="Search by ID, email, or user name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full"
          />
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <Loader className="w-8 h-8 animate-spin mx-auto text-primary-600" />
              <p className="text-gray-600 mt-4">Loading requests...</p>
            </div>
          </div>
        ) : requests.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <Clock className="w-12 h-12 mx-auto text-gray-400" />
              <p className="text-gray-600 mt-4">No requests found</p>
            </div>
          </div>
        ) : (
          requests.map((request) => {
            const isExpanded = expandedRows.has(request.id);
            const pricePerUrl = request.amount / request.quantity;
            
            return (
              <div key={request.id} className="card">
                <div className="card-body">
                  {/* Request Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {request.user_full_name}
                        </h3>
                        <span className={`badge ${getStatusBadge(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Email: {request.user_email}</p>
                        <p>Quantity: {request.quantity} akun • {formatCurrency(request.amount)}</p>
                        <p>Created: {formatDate(request.created_at)}</p>
                        
                        {/* URL Status Summary */}
                        {request.url_details && request.url_details.length > 0 && (
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {(() => {
                              const completed = request.url_details.filter(u => u.status === 'completed').length;
                              const failed = request.url_details.filter(u => u.status === 'failed').length;
                              const refunded = request.url_details.filter(u => u.status === 'refunded').length;
                              const processing = request.url_details.filter(u => u.status === 'processing').length;
                              const pending = request.url_details.filter(u => u.status === 'pending').length;
                              
                              return (
                                <>
                                  {completed > 0 && (
                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-lg">
                                      ✅ {completed} Selesai
                                    </span>
                                  )}
                                  {processing > 0 && (
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-lg">
                                      ⚠️ {processing} Proses
                                    </span>
                                  )}
                                  {pending > 0 && (
                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-lg">
                                      🕐 {pending} Pending
                                    </span>
                                  )}
                                  {failed > 0 && (
                                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-lg">
                                      ❌ {failed} Gagal
                                    </span>
                                  )}
                                  {refunded > 0 && (
                                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-lg">
                                      🔄 {refunded} Refund
                                    </span>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        )}
                        
                        {request.notes && (
                          <p className="text-gray-700 mt-2">
                            <span className="font-medium">Notes:</span> {request.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(request.id, 'Request ID')}
                        className="btn-secondary p-2"
                        title="Copy Request ID"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => toggleRowExpand(request.id)}
                        className="btn-secondary p-2"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content - URL List */}
                  {isExpanded && request.url_details && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <URLStatusList
                        urls={request.url_details}
                        pricePerUrl={pricePerUrl}
                        isAdmin={true}
                        onUpdateStatus={handleUpdateURLStatus}
                        onRefund={handleRefundURL}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Refund Modal */}
      {refundingUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Refund URL</h3>
            </div>
            <div className="card-body space-y-4">
              <p className="text-sm text-gray-600">
                Refund akan mengembalikan saldo ke user dan menandai URL sebagai refunded.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (Required)
                </label>
                <textarea
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  placeholder="Alasan refund..."
                  className="input w-full h-24 resize-none"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setRefundingUrl(null);
                    setRefundNotes('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRefund}
                  disabled={!refundNotes.trim()}
                  className="btn-primary flex-1 bg-red-600 hover:bg-red-700"
                >
                  Confirm Refund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifiedBMManagement;

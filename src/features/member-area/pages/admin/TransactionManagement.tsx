import React, { useState, useEffect } from 'react';
import {
  getAllTransactions,
  updateTransactionStatus,
  refundTransaction,
  exportTransactions,
  Transaction,
  TransactionStatus,
  TransactionType,
  ProductType,
} from '../../services/adminTransactionService';

const TransactionManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | ''>('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<TransactionType | ''>('');
  const [productTypeFilter, setProductTypeFilter] = useState<ProductType | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  // Modal states
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newStatus, setNewStatus] = useState<TransactionStatus>('pending');
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, statusFilter, transactionTypeFilter, productTypeFilter, searchQuery, startDate, endDate]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {};

      if (statusFilter) filters.status = statusFilter;
      if (transactionTypeFilter) filters.transactionType = transactionTypeFilter;
      if (productTypeFilter) filters.productType = productTypeFilter;
      if (searchQuery) filters.search = searchQuery;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const data = await getAllTransactions(filters, currentPage, limit);
      setTransactions(data.transactions);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.total);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedTransaction) return;

    try {
      setError(null);
      await updateTransactionStatus(selectedTransaction.id, newStatus);
      setSuccessMessage('Transaction status updated successfully');
      setShowStatusModal(false);
      setSelectedTransaction(null);
      fetchTransactions();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update transaction status');
    }
  };

  const handleRefund = async () => {
    if (!selectedTransaction) return;

    try {
      setError(null);
      await refundTransaction(selectedTransaction.id, refundReason);
      setSuccessMessage('Transaction refunded successfully');
      setShowRefundModal(false);
      setSelectedTransaction(null);
      setRefundReason('');
      fetchTransactions();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to process refund');
    }
  };

  const handleExport = async () => {
    try {
      setError(null);
      const params: any = {};

      if (statusFilter) params.status = statusFilter;
      if (transactionTypeFilter) params.transactionType = transactionTypeFilter;
      if (productTypeFilter) params.productType = productTypeFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await exportTransactions(params);
      const csv = data.map(t => Object.values(t).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccessMessage('Transactions exported successfully');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to export transactions');
    }
  };

  const openStatusModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setNewStatus(transaction.status as TransactionStatus);
    setShowStatusModal(true);
  };

  const openRefundModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowRefundModal(true);
  };

  const openDetailModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  const getStatusBadgeClass = (status: TransactionStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'refunded':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusLabel = (status: TransactionStatus) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      case 'refunded':
        return 'Refunded';
      default:
        return status;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Transaction Management</h1>
        <p className="text-sm leading-relaxed text-gray-600 mt-2">Manage and monitor all transactions</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
          <button
            onClick={() => setSuccessMessage(null)}
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-3xl shadow mb-6">
        {/* Row 1: Primary Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Type
            </label>
            <select
              value={transactionTypeFilter}
              onChange={(e) => {
                setTransactionTypeFilter(e.target.value as TransactionType | '');
                // Reset product type filter when changing transaction type
                if (e.target.value !== 'purchase') {
                  setProductTypeFilter('');
                }
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Transactions</option>
              <option value="purchase">Purchase</option>
              <option value="topup">Top Up</option>
              <option value="refund">Refund</option>
              <option value="warranty_claim">Warranty Claim</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as TransactionStatus | '');
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search User
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Email or username..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Row 2: Secondary Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Type
              {transactionTypeFilter && transactionTypeFilter !== 'purchase' && (
                <span className="text-xs text-gray-500 ml-1">(Only for Purchase)</span>
              )}
            </label>
            <select
              value={productTypeFilter}
              onChange={(e) => {
                setProductTypeFilter(e.target.value as ProductType | '');
                setCurrentPage(1);
              }}
              disabled={transactionTypeFilter !== '' && transactionTypeFilter !== 'purchase'}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">All Products</option>
              <option value="bm_account">BM Account</option>
              <option value="personal_account">Personal Account</option>
              <option value="verified_bm">Verified BM</option>
              <option value="api">WhatsApp API</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Row 3: Export Action */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {totalCount > 0 && (
              <span>
                Showing {totalCount} transaction{totalCount !== 1 ? 's' : ''}
                {transactionTypeFilter && (
                  <span className="font-medium text-gray-700">
                    {' '}• {transactionTypeFilter === 'topup' ? 'Top Up' : 
                         transactionTypeFilter === 'purchase' ? 'Purchase' : 
                         transactionTypeFilter === 'refund' ? 'Refund' : 
                         'Warranty Claim'}
                  </span>
                )}
                {statusFilter && (
                  <span className="font-medium text-gray-700">
                    {' '}• {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  </span>
                )}
              </span>
            )}
          </div>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No transactions found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.user?.username || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.user?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-2xl ${
                          transaction.transaction_type === 'purchase' 
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : transaction.transaction_type === 'topup'
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-purple-100 text-purple-700 border border-purple-200'
                        }`}>
                          {transaction.transaction_type === 'purchase' ? 'Purchase' : 
                           transaction.transaction_type === 'topup' ? 'Top Up' : 
                           transaction.transaction_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">{transaction.product_name}</div>
                        <div className="text-xs text-gray-500">{transaction.product_type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {transaction.quantity || 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(transaction.total_amount || transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs font-medium rounded-2xl ${getStatusBadgeClass(
                            transaction.status as TransactionStatus
                          )}`}
                        >
                          {getStatusLabel(transaction.status as TransactionStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openDetailModal(transaction)}
                          className="text-blue-600 hover:text-blue-900 mr-3 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openStatusModal(transaction)}
                          className="text-primary-600 hover:text-primary-900 mr-3 transition-colors"
                        >
                          Change Status
                        </button>
                        {transaction.transaction_type === 'purchase' && 
                         transaction.status === 'completed' && (
                          <button
                            onClick={() => openRefundModal(transaction)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * limit, totalCount)}
                    </span>{' '}
                    of <span className="font-medium">{totalCount}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-3 py-2 rounded-l-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-3 py-2 rounded-r-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Transaction Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500">Transaction ID</p>
                  <p className="text-sm text-gray-700 font-mono">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Type</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-2xl ${
                    selectedTransaction.transaction_type === 'purchase' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : selectedTransaction.transaction_type === 'topup'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-purple-100 text-purple-700 border border-purple-200'
                  }`}>
                    {selectedTransaction.transaction_type === 'purchase' ? 'Purchase' : 
                     selectedTransaction.transaction_type === 'topup' ? 'Top Up' : 
                     selectedTransaction.transaction_type}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">User</p>
                  <p className="text-sm text-gray-700">
                    {selectedTransaction.user?.full_name || selectedTransaction.user?.username || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedTransaction.user?.email || 'N/A'}
                  </p>
                </div>
                {selectedTransaction.product_name && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Product</p>
                    <p className="text-sm text-gray-700">{selectedTransaction.product_name}</p>
                    <p className="text-xs text-gray-500">{selectedTransaction.product_type}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-500">Quantity</p>
                  <p className="text-sm text-gray-700">{selectedTransaction.quantity || 1}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Total Amount</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(selectedTransaction.total_amount || selectedTransaction.amount)}
                  </p>
                </div>
                {selectedTransaction.payment_method && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Payment Method</p>
                    <p className="text-sm text-gray-700 uppercase">{selectedTransaction.payment_method}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-500">Status</p>
                  <span
                    className={`px-3 py-1 inline-flex text-xs font-medium rounded-2xl ${getStatusBadgeClass(
                      selectedTransaction.status as TransactionStatus
                    )}`}
                  >
                    {getStatusLabel(selectedTransaction.status as TransactionStatus)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Created At</p>
                  <p className="text-sm text-gray-700">
                    {formatDate(selectedTransaction.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Updated At</p>
                  <p className="text-sm text-gray-700">
                    {formatDate(selectedTransaction.updated_at)}
                  </p>
                </div>
                {selectedTransaction.metadata?.admin_notes && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Admin Notes</p>
                    <p className="text-sm text-gray-700">{selectedTransaction.metadata.admin_notes}</p>
                  </div>
                )}
              </div>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedTransaction(null);
                  }}
                  className="w-full px-4 py-2 text-sm font-medium bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Update Transaction Status
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Status: <span className={`px-2 py-1 text-xs font-medium rounded-2xl ${getStatusBadgeClass(selectedTransaction.status as TransactionStatus)}`}>
                    {getStatusLabel(selectedTransaction.status as TransactionStatus)}
                  </span>
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as TransactionStatus)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                  {/* Refunded status can only be set via Refund button */}
                </select>
              </div>
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> To refund a purchase transaction, use the "Refund" button which will return the balance to the user.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateStatus}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Update
                </button>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedTransaction(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Refund Transaction
              </h3>
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-sm text-red-800 mb-1">
                  <span className="font-medium">Refund amount:</span> {formatCurrency(selectedTransaction.total_amount || selectedTransaction.amount)}
                </p>
                <p className="text-xs text-red-600">
                  This will return the amount to user's balance and change status to "refunded"
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter refund reason..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRefund}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  Confirm Refund
                </button>
                <button
                  onClick={() => {
                    setShowRefundModal(false);
                    setSelectedTransaction(null);
                    setRefundReason('');
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManagement;

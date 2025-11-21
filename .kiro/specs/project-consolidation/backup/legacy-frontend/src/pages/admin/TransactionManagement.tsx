import React, { useState, useEffect } from 'react';
import {
  getAllTransactions,
  updateTransactionStatus,
  refundTransaction,
  exportTransactions,
  Transaction,
  TransactionStatus,
  ProductType,
} from '../../services/adminTransactionService';

const TransactionManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | ''>('');
  const [productTypeFilter, setProductTypeFilter] = useState<ProductType | ''>('');
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
  const [newStatus, setNewStatus] = useState<TransactionStatus>('PENDING');
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, statusFilter, productTypeFilter, startDate, endDate]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit,
      };

      if (statusFilter) params.status = statusFilter;
      if (productTypeFilter) params.product_type = productTypeFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const data = await getAllTransactions(params);
      setTransactions(data.transactions);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedTransaction) return;

    try {
      setError(null);
      await updateTransactionStatus(selectedTransaction.id, { status: newStatus });
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
      await refundTransaction(selectedTransaction.id, { reason: refundReason });
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
      if (productTypeFilter) params.product_type = productTypeFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const blob = await exportTransactions(params);
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
    setNewStatus(transaction.status);
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
      case 'BERHASIL':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'GAGAL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transaction Management</h1>
        <p className="text-gray-600 mt-2">Manage and monitor all transactions</p>
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
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="BERHASIL">BERHASIL</option>
              <option value="PENDING">PENDING</option>
              <option value="GAGAL">GAGAL</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Type
            </label>
            <select
              value={productTypeFilter}
              onChange={(e) => {
                setProductTypeFilter(e.target.value as ProductType | '');
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Products</option>
              <option value="RMSO_NEW">RMSO NEW</option>
              <option value="PERSONAL_TUA">PERSONAL TUA</option>
              <option value="RM_NEW">RM NEW</option>
              <option value="RM_TUA">RM TUA</option>
              <option value="J202_VERIFIED_BM">J202 VERIFIED BM</option>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleExport}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.user?.username || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.user?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{transaction.product_name}</div>
                        <div className="text-sm text-gray-500">{transaction.product_type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(transaction.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                            transaction.status
                          )}`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openDetailModal(transaction)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openStatusModal(transaction)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Status
                        </button>
                        {transaction.status === 'BERHASIL' && (
                          <button
                            onClick={() => openRefundModal(transaction)}
                            className="text-red-600 hover:text-red-900"
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
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
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
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Transaction Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Transaction ID</p>
                  <p className="text-sm text-gray-900">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">User</p>
                  <p className="text-sm text-gray-900">
                    {selectedTransaction.user?.full_name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedTransaction.user?.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Product</p>
                  <p className="text-sm text-gray-900">{selectedTransaction.product_name}</p>
                  <p className="text-sm text-gray-500">{selectedTransaction.product_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Quantity</p>
                  <p className="text-sm text-gray-900">{selectedTransaction.quantity}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Amount</p>
                  <p className="text-sm text-gray-900">
                    {formatCurrency(selectedTransaction.total_amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                      selectedTransaction.status
                    )}`}
                  >
                    {selectedTransaction.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created At</p>
                  <p className="text-sm text-gray-900">
                    {formatDate(selectedTransaction.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Updated At</p>
                  <p className="text-sm text-gray-900">
                    {formatDate(selectedTransaction.updated_at)}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedTransaction(null);
                  }}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Update Transaction Status
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as TransactionStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BERHASIL">BERHASIL</option>
                  <option value="PENDING">PENDING</option>
                  <option value="GAGAL">GAGAL</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateStatus}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update
                </button>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedTransaction(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Refund Transaction
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Refund amount: {formatCurrency(selectedTransaction.total_amount)}
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter refund reason..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRefund}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Refund
                </button>
                <button
                  onClick={() => {
                    setShowRefundModal(false);
                    setSelectedTransaction(null);
                    setRefundReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
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

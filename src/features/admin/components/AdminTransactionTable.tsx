/**
 * AdminTransactionTable Component
 * Admin view of all transactions with filters and sync functionality
 */

import { useState } from 'react';
import { useAllTransactions, useSyncTransactionStatus } from '@/hooks/useTripay';
import { TransactionDetailModal } from '@/features/payment/components/TransactionDetailModal';

export function AdminTransactionTable() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedReference, setSelectedReference] = useState<string | null>(null);

  const { data, isLoading, error } = useAllTransactions({
    status: statusFilter || undefined,
    paymentMethod: paymentMethodFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    perPage: 25,
  });

  const { mutate: syncStatus, isPending: isSyncing } = useSyncTransactionStatus();

  const transactions = data?.transactions || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(dateString));
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      UNPAID: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      PAID: { bg: 'bg-green-100', text: 'text-green-700' },
      EXPIRED: { bg: 'bg-gray-100', text: 'text-gray-700' },
      FAILED: { bg: 'bg-red-100', text: 'text-red-700' },
      REFUND: { bg: 'bg-blue-100', text: 'text-blue-700' },
    };

    const badge = badges[status] || badges.UNPAID;

    return (
      <span className={`badge ${badge.bg} ${badge.text}`}>
        {status}
      </span>
    );
  };

  // Handle sync status
  const handleSyncStatus = (reference: string) => {
    syncStatus(reference);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input w-full"
              >
                <option value="">Semua Status</option>
                <option value="UNPAID">UNPAID</option>
                <option value="PAID">PAID</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="FAILED">FAILED</option>
                <option value="REFUND">REFUND</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Metode Pembayaran
              </label>
              <input
                type="text"
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                placeholder="Cari metode..."
                className="input w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Semua Transaksi</h3>
            <p className="text-sm text-gray-600">Total: {total} transaksi</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Referensi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Metode
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Nominal
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-600">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              )}

              {error && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <p className="text-sm text-red-600">Gagal memuat data transaksi</p>
                  </td>
                </tr>
              )}

              {!isLoading && !error && transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <p className="text-sm text-gray-600">Tidak ada transaksi</p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                !error &&
                transactions.map((transaction: any) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-mono text-gray-900">
                        {transaction.tripay_reference}
                      </p>
                      <p className="text-xs text-gray-500">{transaction.tripay_merchant_ref}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">
                        {transaction.users?.full_name || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">{transaction.users?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{transaction.tripay_payment_name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(transaction.tripay_total_amount || transaction.amount)}
                      </p>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(transaction.tripay_status)}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{formatDate(transaction.created_at)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedReference(transaction.tripay_reference)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          title="Lihat detail"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => handleSyncStatus(transaction.tripay_reference)}
                          disabled={isSyncing}
                          className="text-green-600 hover:text-green-700 text-sm font-medium disabled:opacity-50"
                          title="Sync status"
                        >
                          Sync
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="card-body border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Halaman {page} dari {totalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="btn-secondary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <span className="text-sm text-gray-700">
                  {page} / {totalPages}
                </span>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="btn-secondary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedReference && (
        <TransactionDetailModal
          reference={selectedReference}
          isOpen={!!selectedReference}
          onClose={() => setSelectedReference(null)}
        />
      )}
    </div>
  );
}

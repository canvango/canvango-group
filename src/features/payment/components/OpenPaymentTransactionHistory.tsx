/**
 * OpenPaymentTransactionHistory Component
 * Displays transaction history for an Open Payment
 */

import { useState } from 'react';
import { useOpenPaymentTransactions, useOpenPaymentDetail } from '@/hooks/useTripay';

interface OpenPaymentTransactionHistoryProps {
  uuid: string;
  isOpen: boolean;
  onClose: () => void;
}

export function OpenPaymentTransactionHistory({
  uuid,
  isOpen,
  onClose,
}: OpenPaymentTransactionHistoryProps) {
  const [page, setPage] = useState(1);
  const [referenceFilter, setReferenceFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: openPayment } = useOpenPaymentDetail(isOpen ? uuid : null);
  const { data: transactionsData, isLoading, error } = useOpenPaymentTransactions(
    isOpen ? uuid : null,
    {
      reference: referenceFilter || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page,
      perPage: 10,
    }
  );

  if (!isOpen) return null;

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
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateString));
  };

  const transactions = transactionsData?.transactions || [];
  const total = transactionsData?.total || 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Riwayat Transaksi</h2>
              {openPayment && (
                <p className="text-sm text-gray-600 mt-1">
                  {openPayment.payment_name} - {openPayment.pay_code}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Filters */}
            <div className="card mb-4">
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Referensi
                    </label>
                    <input
                      type="text"
                      value={referenceFilter}
                      onChange={(e) => setReferenceFilter(e.target.value)}
                      placeholder="Cari referensi..."
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

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-xl"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="card bg-red-50 border border-red-200">
                <div className="card-body">
                  <p className="text-sm text-red-600">
                    Gagal memuat riwayat transaksi. Silakan coba lagi.
                  </p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && transactions.length === 0 && (
              <div className="card bg-gray-50">
                <div className="card-body text-center py-12">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Belum Ada Transaksi
                  </h3>
                  <p className="text-sm text-gray-600">
                    Belum ada pembayaran yang dilakukan menggunakan kode ini
                  </p>
                </div>
              </div>
            )}

            {/* Transactions List */}
            {!isLoading && !error && transactions.length > 0 && (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="card">
                    <div className="card-body">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="badge bg-green-100 text-green-700">
                              {transaction.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(transaction.paid_at)}
                            </span>
                          </div>

                          <p className="text-sm font-mono text-gray-600 mb-1">
                            Ref: {transaction.reference}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Biaya: {formatCurrency(transaction.total_fee)}</span>
                            <span>Diterima: {formatCurrency(transaction.amount_received)}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-xs text-gray-500">Nominal</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && !error && totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  Menampilkan {(page - 1) * 10 + 1} - {Math.min(page * 10, total)} dari {total}{' '}
                  transaksi
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
                    Halaman {page} dari {totalPages}
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
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button onClick={onClose} className="btn-secondary">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

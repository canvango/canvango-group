/**
 * TransactionDetailModal Component
 * Shows full transaction details with payment instructions
 */

import { useState } from 'react';
import { useTransactionDetail } from '@/hooks/useTripay';
import { PaymentInstructions } from './PaymentInstructions';
import { useNotification } from '@/shared/hooks/useNotification';

interface TransactionDetailModalProps {
  reference: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetailModal({
  reference,
  isOpen,
  onClose,
}: TransactionDetailModalProps) {
  const { data: transaction, isLoading, error, refetch } = useTransactionDetail(
    isOpen ? reference : null
  );
  const [copiedRef, setCopiedRef] = useState(false);
  const notification = useNotification();

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
  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(timestamp * 1000));
  };

  // Copy reference to clipboard
  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopiedRef(true);
      notification.success('Referensi berhasil disalin');

      setTimeout(() => setCopiedRef(false), 2000);
    } catch (error) {
      notification.error('Gagal menyalin referensi');
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      UNPAID: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Menunggu Pembayaran' },
      PAID: { bg: 'bg-green-100', text: 'text-green-700', label: 'Berhasil' },
      EXPIRED: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Kadaluarsa' },
      FAILED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Gagal' },
      REFUND: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Refund' },
    };

    const badge = badges[status] || badges.UNPAID;

    return (
      <span className={`badge ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Detail Transaksi</h2>
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
            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-xl"></div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="card bg-red-50 border border-red-200">
                <div className="card-body">
                  <p className="text-sm text-red-600">
                    Gagal memuat detail transaksi. Silakan coba lagi.
                  </p>
                </div>
              </div>
            )}

            {transaction && (
              <div className="space-y-4">
                {/* Transaction Info */}
                <div className="card">
                  <div className="card-body space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      {getStatusBadge(transaction.status)}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Referensi</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-medium text-gray-900">
                          {transaction.reference}
                        </span>
                        <button
                          onClick={handleCopyReference}
                          className="text-gray-400 hover:text-gray-600"
                          title="Salin referensi"
                        >
                          {copiedRef ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Metode Pembayaran</span>
                      <span className="text-sm font-medium text-gray-900">
                        {transaction.payment_name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Nama Customer</span>
                      <span className="text-sm font-medium text-gray-900">
                        {transaction.customer_name}
                      </span>
                    </div>

                    {transaction.expired_time && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Batas Waktu</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(transaction.expired_time)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Amount Breakdown */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">Rincian Pembayaran</h3>
                  </div>
                  <div className="card-body space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Jumlah</span>
                      <span className="text-sm text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Biaya Admin</span>
                      <span className="text-sm text-gray-900">
                        {formatCurrency(transaction.total_fee)}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 pt-2 flex justify-between">
                      <span className="text-base font-semibold text-gray-900">Total</span>
                      <span className="text-base font-bold text-blue-600">
                        {formatCurrency(transaction.amount_received)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                {transaction.order_items && transaction.order_items.length > 0 && (
                  <div className="card">
                    <div className="card-header">
                      <h3 className="text-lg font-semibold text-gray-900">Item Pesanan</h3>
                    </div>
                    <div className="card-body">
                      <div className="space-y-3">
                        {transaction.order_items.map((item, index) => (
                          <div key={index} className="flex items-start gap-3">
                            {item.image_url && (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-xl"
                              />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {item.quantity} x {formatCurrency(item.price)}
                              </p>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              {formatCurrency(item.subtotal || item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Instructions (only for UNPAID) */}
                {transaction.status === 'UNPAID' && transaction.instructions && (
                  <PaymentInstructions
                    instructions={transaction.instructions}
                    payCode={transaction.pay_code}
                    qrUrl={transaction.qr_url}
                    checkoutUrl={transaction.checkout_url}
                    expiredTime={transaction.expired_time}
                    onRefreshStatus={() => refetch()}
                  />
                )}

                {/* Success Message */}
                {transaction.status === 'PAID' && (
                  <div className="card bg-green-50 border border-green-200">
                    <div className="card-body text-center">
                      <svg
                        className="w-16 h-16 text-green-600 mx-auto mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <h3 className="text-lg font-semibold text-green-900">
                        Pembayaran Berhasil!
                      </h3>
                      <p className="text-sm text-green-700 mt-2">
                        Transaksi Anda telah berhasil diproses
                      </p>
                    </div>
                  </div>
                )}
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

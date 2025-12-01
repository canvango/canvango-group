/**
 * OpenPaymentList Page
 * Displays list of user's Open Payments
 */

import { useState } from 'react';
import { useOpenPaymentList, useCreateOpenPayment, usePaymentMethods } from '@/hooks/useTripay';
import { OpenPaymentCard } from '../components/OpenPaymentCard';
import { OpenPaymentTransactionHistory } from '../components/OpenPaymentTransactionHistory';

export function OpenPaymentList() {
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'EXPIRED' | 'ALL'>('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);

  const { data: openPayments, isLoading, error } = useOpenPaymentList({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    paymentMethod: paymentMethodFilter || undefined,
  });

  const { data: paymentMethods } = usePaymentMethods();

  const handleViewTransactions = (uuid: string) => {
    setSelectedUuid(uuid);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-3xl"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-50 border border-red-200">
        <div className="card-body">
          <p className="text-sm text-red-600">
            Gagal memuat daftar Open Payment. Silakan refresh halaman.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
            Kode Pembayaran Permanen
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Kelola kode pembayaran yang dapat digunakan berkali-kali
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Buat Baru</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="input w-full"
              >
                <option value="ALL">Semua Status</option>
                <option value="ACTIVE">Aktif</option>
                <option value="EXPIRED">Kadaluarsa</option>
              </select>
            </div>

            {/* Payment Method Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Metode Pembayaran
              </label>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="input w-full"
              >
                <option value="">Semua Metode</option>
                {paymentMethods?.map((method) => (
                  <option key={method.code} value={method.code}>
                    {method.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Open Payments List */}
      {!openPayments || openPayments.length === 0 ? (
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
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Belum Ada Kode Pembayaran
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Buat kode pembayaran permanen untuk memudahkan transaksi Anda
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Buat Kode Pembayaran</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {openPayments.map((openPayment) => (
            <OpenPaymentCard
              key={openPayment.id}
              openPayment={openPayment}
              onViewTransactions={() => handleViewTransactions(openPayment.uuid)}
            />
          ))}
        </div>
      )}

      {/* Transaction History Modal */}
      {selectedUuid && (
        <OpenPaymentTransactionHistory
          uuid={selectedUuid}
          isOpen={!!selectedUuid}
          onClose={() => setSelectedUuid(null)}
        />
      )}

      {/* Create Modal - TODO: Implement CreateOpenPaymentModal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Buat Kode Pembayaran Permanen
              </h2>
              <p className="text-sm text-gray-600">
                Fitur ini akan segera tersedia. Silakan hubungi admin untuk membuat kode
                pembayaran permanen.
              </p>
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-primary w-full mt-4"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

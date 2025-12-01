/**
 * OpenPaymentCard Component
 * Displays Open Payment details with permanent pay code
 */

import { useState } from 'react';
import type { OpenPayment } from '@/services/tripay.service';
import { useNotification } from '@/shared/hooks/useNotification';

interface OpenPaymentCardProps {
  openPayment: OpenPayment;
  onViewTransactions: () => void;
}

export function OpenPaymentCard({ openPayment, onViewTransactions }: OpenPaymentCardProps) {
  const [copiedPayCode, setCopiedPayCode] = useState(false);
  const notification = useNotification();

  // Format date
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(dateString));
  };

  // Copy pay code to clipboard
  const handleCopyPayCode = async () => {
    try {
      await navigator.clipboard.writeText(openPayment.pay_code);
      setCopiedPayCode(true);
      notification.success('Kode pembayaran berhasil disalin');

      setTimeout(() => setCopiedPayCode(false), 2000);
    } catch (error) {
      notification.error('Gagal menyalin kode pembayaran');
    }
  };

  // Get status badge
  const getStatusBadge = () => {
    if (openPayment.status === 'ACTIVE') {
      return (
        <span className="badge bg-green-100 text-green-700">
          Aktif
        </span>
      );
    }
    return (
      <span className="badge bg-gray-100 text-gray-700">
        Kadaluarsa
      </span>
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {openPayment.payment_name}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Dibuat: {formatDate(openPayment.created_at)}
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </div>

      <div className="card-body space-y-4">
        {/* Pay Code */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Kode Pembayaran Permanen</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-xl font-mono font-bold text-blue-900 text-center">
                {openPayment.pay_code}
              </p>
            </div>
            <button
              onClick={handleCopyPayCode}
              className="btn-secondary px-4 py-4"
              title="Salin kode"
            >
              {copiedPayCode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <p className="text-xs text-gray-500 mt-2">
            Gunakan kode ini untuk melakukan pembayaran dengan nominal yang Anda tentukan sendiri
          </p>
        </div>

        {/* QR Code */}
        {openPayment.qr_url && (
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 mb-3">Scan QR Code</p>
            <img
              src={openPayment.qr_url}
              alt="QR Code"
              className="w-40 h-40 mx-auto border-2 border-gray-200 rounded-xl"
            />
          </div>
        )}

        {/* Customer Name */}
        {openPayment.customer_name && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-600">Nama Customer</span>
            <span className="text-sm font-medium text-gray-900">
              {openPayment.customer_name}
            </span>
          </div>
        )}

        {/* Expiration */}
        {openPayment.expired_at && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-600">Berlaku Hingga</span>
            <span className="text-sm font-medium text-gray-900">
              {formatDate(openPayment.expired_at)}
            </span>
          </div>
        )}

        {/* Info */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex gap-2">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-xs font-medium text-blue-900">Cara Menggunakan</p>
              <p className="text-xs text-blue-700 mt-1">
                Kode pembayaran ini dapat digunakan berkali-kali dengan nominal yang berbeda-beda.
                Setiap kali Anda melakukan transfer ke kode ini, sistem akan otomatis mencatat
                transaksi.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onViewTransactions}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span>Lihat Riwayat</span>
          </button>
        </div>
      </div>
    </div>
  );
}

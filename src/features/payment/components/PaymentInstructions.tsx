/**
 * PaymentInstructions Component
 * Displays step-by-step payment instructions with countdown timer
 */

import { useState, useEffect } from 'react';
import { useNotification } from '@/shared/hooks/useNotification';

interface PaymentInstruction {
  title: string;
  steps: string[];
}

interface PaymentInstructionsProps {
  instructions: PaymentInstruction[];
  payCode?: string;
  qrUrl?: string;
  checkoutUrl?: string;
  expiredTime?: number; // Unix timestamp
  onRefreshStatus?: () => void;
}

export function PaymentInstructions({
  instructions,
  payCode,
  qrUrl,
  checkoutUrl,
  expiredTime,
  onRefreshStatus,
}: PaymentInstructionsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const notification = useNotification();

  // Calculate time left
  useEffect(() => {
    if (!expiredTime) return;

    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = expiredTime - now;
      return diff > 0 ? diff : 0;
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        notification.warning('Waktu pembayaran telah habis');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiredTime, notification]);

  // Format time left
  const formatTimeLeft = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Copy pay code to clipboard
  const handleCopyPayCode = async () => {
    if (!payCode) return;

    try {
      await navigator.clipboard.writeText(payCode);
      setCopied(true);
      notification.success('Kode pembayaran berhasil disalin');

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      notification.error('Gagal menyalin kode pembayaran');
    }
  };

  return (
    <div className="space-y-4">
      {/* Countdown Timer */}
      {timeLeft !== null && (
        <div className="card bg-blue-50 border border-blue-200">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Batas Waktu Pembayaran</p>
                <p className="text-xs text-blue-700 mt-1">
                  Selesaikan pembayaran sebelum waktu habis
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{formatTimeLeft(timeLeft)}</p>
                <p className="text-xs text-blue-700">Jam:Menit:Detik</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pay Code */}
      {payCode && (
        <div className="card">
          <div className="card-body">
            <p className="text-sm font-medium text-gray-700 mb-2">Kode Pembayaran</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-gray-100 rounded-xl">
                <p className="text-lg font-mono font-bold text-gray-900 text-center">
                  {payCode}
                </p>
              </div>
              <button
                onClick={handleCopyPayCode}
                className="btn-secondary px-4 py-3"
                title="Salin kode"
              >
                {copied ? (
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
          </div>
        </div>
      )}

      {/* QR Code */}
      {qrUrl && (
        <div className="card">
          <div className="card-body text-center">
            <p className="text-sm font-medium text-gray-700 mb-3">Scan QR Code</p>
            <img
              src={qrUrl}
              alt="QR Code"
              className="w-48 h-48 mx-auto border-2 border-gray-200 rounded-xl"
            />
            <p className="text-xs text-gray-500 mt-3">
              Scan QR code ini menggunakan aplikasi mobile banking atau e-wallet Anda
            </p>
          </div>
        </div>
      )}

      {/* Checkout URL */}
      {checkoutUrl && (
        <div className="card bg-green-50 border border-green-200">
          <div className="card-body">
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <span>Lanjutkan ke Halaman Pembayaran</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      )}

      {/* Instructions Tabs */}
      {instructions && instructions.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Cara Pembayaran</h3>
          </div>

          {/* Tabs */}
          {instructions.length > 1 && (
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto">
                {instructions.map((instruction, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTab(index)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === index
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    {instruction.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Instruction Steps */}
          <div className="card-body">
            <ol className="space-y-3">
              {instructions[activeTab]?.steps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <p className="text-sm text-gray-700 flex-1">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Refresh Status Button */}
      {onRefreshStatus && (
        <button
          onClick={onRefreshStatus}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Refresh Status Pembayaran</span>
        </button>
      )}
    </div>
  );
}

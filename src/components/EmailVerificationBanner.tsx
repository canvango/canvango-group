import React, { useState } from 'react';
import { useEmailVerification } from '@/hooks/useEmailVerification';

const EmailVerificationBanner: React.FC = () => {
  const {
    verificationStatus,
    isLoading,
    resendVerification,
    isResending,
    resendSuccess,
    resendCooldown,
  } = useEmailVerification();

  const [isDismissed, setIsDismissed] = useState(false);

  // Jangan tampilkan banner jika:
  // - Masih loading
  // - Verification status belum ada (guest atau query disabled)
  // - Email sudah verified
  // - User dismiss banner
  if (isLoading || !verificationStatus || verificationStatus?.isVerified || isDismissed) {
    return null;
  }

  const handleResend = () => {
    if (resendCooldown === 0) {
      resendVerification();
    }
  };

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-xl shadow-sm mb-4 md:mb-6 animate-slideDown">
      <div className="p-4 md:p-5">
        <div className="flex items-start gap-3 md:gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <i className="fas fa-envelope text-yellow-600 text-lg md:text-xl"></i>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
                  Verifikasi Email Anda
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  Kami telah mengirim email verifikasi ke{' '}
                  <span className="font-medium text-gray-900">
                    {verificationStatus?.email}
                  </span>
                  . Silakan cek inbox atau folder spam Anda dan klik link verifikasi untuk mengaktifkan semua fitur akun.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  <button
                    onClick={handleResend}
                    disabled={isResending || resendCooldown > 0}
                    className="btn-secondary text-xs md:text-sm px-3 md:px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isResending ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Mengirim...</span>
                      </>
                    ) : resendCooldown > 0 ? (
                      <>
                        <i className="fas fa-clock"></i>
                        <span>Kirim Ulang ({resendCooldown}s)</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        <span>Kirim Ulang Email</span>
                      </>
                    )}
                  </button>

                  {resendSuccess && resendCooldown > 0 && (
                    <span className="text-xs md:text-sm text-green-600 flex items-center gap-1.5">
                      <i className="fas fa-check-circle"></i>
                      <span>Email terkirim!</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => setIsDismissed(true)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1"
                aria-label="Tutup notifikasi"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-3 pt-3 border-t border-yellow-200 flex items-start gap-2">
          <i className="fas fa-info-circle text-yellow-600 text-sm mt-0.5 flex-shrink-0"></i>
          <p className="text-xs text-gray-600 leading-relaxed">
            <strong>Tips:</strong> Jika tidak menerima email dalam 5 menit, periksa folder spam atau coba kirim ulang. 
            Anda tetap dapat menggunakan aplikasi saat menunggu verifikasi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;

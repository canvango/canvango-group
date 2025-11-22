import React, { useState, useEffect } from 'react';
import { useSendOTP, useVerifyOTP, useResendOTP } from '../../hooks/usePhoneOTP';

interface PhoneOTPVerificationProps {
  onVerified: (phone: string) => void;
  onCancel?: () => void;
}

export const PhoneOTPVerification: React.FC<PhoneOTPVerificationProps> = ({
  onVerified,
  onCancel
}) => {
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  const sendOTP = useSendOTP();
  const verifyOTP = useVerifyOTP();
  const resendOTP = useResendOTP();

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate phone format
    const phoneRegex = /^(\+?62|0)8[0-9]{8,12}$/;
    if (!phoneRegex.test(phone)) {
      setError('Format nomor HP tidak valid. Gunakan format: 08xxx atau +62xxx');
      return;
    }

    try {
      const result = await sendOTP.mutateAsync({ phone });
      setStep('otp');
      setCountdown(60); // 60 seconds cooldown
      
      // Show OTP in development
      if (result.otp_code) {
        console.log('🔑 OTP Code (DEV):', result.otp_code);
        console.log('📱 Phone:', result.phone);
        console.log('⏰ Expires:', result.expires_at);
      }
    } catch (err: any) {
      console.error('Send OTP error:', err);
      const errorMessage = err.message || err.response?.data?.message || 'Gagal mengirim OTP';
      setError(errorMessage);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otpCode.length !== 6) {
      setError('Kode OTP harus 6 digit');
      return;
    }

    try {
      const result = await verifyOTP.mutateAsync({ phone, otp_code: otpCode });
      if (result.verified) {
        console.log('✅ Phone verified:', result.phone);
        onVerified(result.phone);
      }
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      const errorMessage = err.message || err.response?.data?.message || 'Kode OTP tidak valid';
      setError(errorMessage);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    try {
      const result = await resendOTP.mutateAsync({ phone });
      setCountdown(60);
      setOtpCode('');
      
      // Show OTP in development
      if (result.otp_code) {
        console.log('🔄 Resent OTP Code (DEV):', result.otp_code);
      }
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      const errorMessage = err.message || err.response?.data?.message || 'Gagal mengirim ulang OTP';
      setError(errorMessage);
    }
  };

  const handleChangePhone = () => {
    setStep('phone');
    setOtpCode('');
    setError('');
  };

  if (step === 'phone') {
    return (
      <div className="bg-white rounded-3xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Verifikasi Nomor HP</h2>
        <p className="text-gray-600 mb-6">
          Masukkan nomor HP Anda untuk menerima kode OTP
        </p>

        <form onSubmit={handleSendOTP}>
          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Nomor HP
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx atau +62xxx"
              className="input w-full"
              required
              disabled={sendOTP.isPending}
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: 08xxx atau +62xxx
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={sendOTP.isPending || !phone}
              className="btn-primary flex-1"
            >
              {sendOTP.isPending ? 'Mengirim...' : 'Kirim OTP'}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="btn-secondary"
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Masukkan Kode OTP</h2>
      <p className="text-gray-600 mb-2">
        Kode OTP telah dikirim ke:
      </p>
      <p className="font-semibold mb-4">{phone}</p>

      <form onSubmit={handleVerifyOTP}>
        <div className="mb-4">
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
            Kode OTP (6 digit)
          </label>
          <input
            type="text"
            id="otp"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="input w-full text-center text-2xl tracking-widest"
            maxLength={6}
            required
            disabled={verifyOTP.isPending}
            autoFocus
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4 text-center">
          {countdown > 0 ? (
            <p className="text-sm text-gray-500">
              Kirim ulang OTP dalam {countdown} detik
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendOTP.isPending}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {resendOTP.isPending ? 'Mengirim...' : 'Kirim Ulang OTP'}
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={verifyOTP.isPending || otpCode.length !== 6}
            className="btn-primary flex-1"
          >
            {verifyOTP.isPending ? 'Memverifikasi...' : 'Verifikasi'}
          </button>
          <button
            type="button"
            onClick={handleChangePhone}
            className="btn-secondary"
          >
            Ubah Nomor
          </button>
        </div>
      </form>
    </div>
  );
};

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useToast } from '../../../../shared/contexts/ToastContext';
import { TurnstileWidget } from '../../../../shared/components';
import { useTurnstile } from '../../../../shared/hooks';

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { showToast } = useToast();
  
  // Turnstile verification
  const { token, setToken, verifyToken, isVerifying, reset: resetTurnstile } = useTurnstile();
  const isTurnstileEnabled = !!import.meta.env.VITE_TURNSTILE_SITE_KEY;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      showToast({ type: 'error', message: 'Silakan masukkan alamat email Anda' });
      return;
    }

    // Verify Turnstile if enabled
    if (isTurnstileEnabled) {
      if (!token) {
        showToast({ type: 'error', message: 'Silakan selesaikan verifikasi keamanan terlebih dahulu.' });
        return;
      }

      setLoading(true);
      const isVerified = await verifyToken();
      
      if (!isVerified) {
        showToast({ type: 'error', message: 'Verifikasi keamanan gagal. Silakan refresh halaman dan coba lagi.' });
        setLoading(false);
        resetTurnstile();
        return;
      }
    }

    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        showToast({ type: 'error', message: resetError.message });
      } else {
        setEmailSent(true);
        showToast({ type: 'success', message: 'Link reset password telah dikirim ke email Anda' });
      }
    } catch (err) {
      showToast({ type: 'error', message: 'Gagal mengirim email reset. Silakan coba lagi.' });
      
      // Reset Turnstile on error
      if (isTurnstileEnabled) {
        resetTurnstile();
      }
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="w-full max-w-md">
        <div className="card p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-success-100 mb-6">
            <svg className="h-8 w-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Cek Email Anda
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            Kami telah mengirim link reset password ke <strong className="text-gray-900">{email}</strong>
          </p>

          {/* Additional Info */}
          <p className="text-sm text-gray-500 mb-8">
            Tidak menerima email? Cek folder spam atau coba lagi.
          </p>

          {/* Back to Login Button */}
          <Link to="/login" className="btn-primary w-full inline-block text-center">
            Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Lupa Kata Sandi?
        </h2>
        <p className="text-gray-600">
          Masukkan email Anda dan kami akan mengirimkan link untuk reset password
        </p>
      </div>

      {/* Form Card */}
      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="label">
              Alamat Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Turnstile Widget */}
          {isTurnstileEnabled && (
            <div className="mb-2">
              <TurnstileWidget
                onSuccess={setToken}
                onError={resetTurnstile}
                onExpire={resetTurnstile}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || isVerifying || (isTurnstileEnabled && !token)}
          >
            {loading || isVerifying ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {isVerifying ? 'Memverifikasi...' : 'Mengirim...'}
              </span>
            ) : (
              'Kirim Link Reset'
            )}
          </button>

          {/* Back to Login Link */}
          <div className="text-center pt-2">
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Kembali ke Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

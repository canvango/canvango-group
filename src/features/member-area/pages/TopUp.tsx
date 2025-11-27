import React from 'react';
import { Link } from 'react-router-dom';
import { History, Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import TopUpForm, { TopUpFormData } from '../components/topup/TopUpForm';
import { useAuth } from '../contexts/AuthContext';
import { processTopUp } from '../services/topup.service';
import { formatCurrency } from '../utils/formatters';
import { usePageTitle } from '../hooks/usePageTitle';

const TopUp: React.FC = () => {
  usePageTitle('Top Up');
  
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [notification, setNotification] = React.useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleTopUpSubmit = async (data: TopUpFormData) => {
    setLoading(true);
    setNotification(null);

    try {
      // Call top-up service (direct Supabase)
      const result = await processTopUp({
        amount: data.amount,
        paymentMethod: data.paymentMethod
      });

      // Show success notification
      setNotification({
        type: 'success',
        message: result.message || `Top up berhasil! Saldo Anda telah ditambahkan sebesar ${formatCurrency(data.amount)}`
      });

      // Refresh user data to update balance
      await refreshUser();

      // Scroll to top to show notification
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error('Top up failed:', error);
      
      // Show error notification
      const errorMessage = error.message || 'Gagal melakukan top up. Silakan coba lagi.';
      setNotification({
        type: 'error',
        message: errorMessage
      });

      // Scroll to top to show notification
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Top Up Saldo</h1>
          <p className="text-sm leading-relaxed text-gray-600 mt-1">Tambahkan saldo untuk melakukan pembelian</p>
        </div>
        <Link
          to="/riwayat-transaksi"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors shadow-sm"
        >
          <History className="w-4 h-4" />
          <span className="whitespace-nowrap">Riwayat Top Up</span>
        </Link>
      </div>

      {/* Current Balance Card */}
      {user && (
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0866FF] via-[#0A7CFF] to-[#0D96FF] rounded-3xl p-6 text-white shadow-2xl">
          {/* Meta-style mesh gradient background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-400/30 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent"></div>
          
          {/* Animated gradient orbs */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-blue-300/25 via-blue-400/15 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-blue-500/20 via-blue-600/10 to-transparent rounded-full blur-3xl"></div>
          
          {/* Subtle dot pattern */}
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}></div>
          
          {/* Glossy overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/5"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                <Wallet className="w-6 h-6" />
              </div>
              <h2 className="text-base font-semibold drop-shadow-lg">Saldo Saat Ini</h2>
            </div>
            <p className="text-2xl md:text-3xl font-bold drop-shadow-lg">{formatCurrency(user.balance)}</p>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div
          className={`
            rounded-3xl p-4 flex items-start gap-3 shadow-md
            ${notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}
          `}
          role="alert"
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}`}
          >
            Tutup
          </button>
        </div>
      )}

      {/* Top Up Form */}
      <TopUpForm onSubmit={handleTopUpSubmit} loading={loading} />

      {/* Information Box */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="bg-blue-500 text-white rounded-xl p-2 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 mb-3">Informasi Penting</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5 flex-shrink-0">•</span>
                <span className="flex-1">Minimal top up adalah <strong>Rp 10.000</strong></span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5 flex-shrink-0">•</span>
                <span className="flex-1">Saldo akan otomatis masuk setelah pembayaran berhasil</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5 flex-shrink-0">•</span>
                <span className="flex-1">Proses verifikasi pembayaran memakan waktu <strong>1-5 menit</strong></span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5 flex-shrink-0">•</span>
                <span className="flex-1">Simpan bukti pembayaran untuk keperluan konfirmasi</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopUp;

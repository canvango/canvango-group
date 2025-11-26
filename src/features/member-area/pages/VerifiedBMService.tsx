import React from 'react';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import {
  VerifiedBMStatusCards,
  VerifiedBMOrderForm,
  VerifiedBMOrdersTable
} from '../components/verified-bm';
import { 
  useVerifiedBMStats, 
  useVerifiedBMRequests, 
  useSubmitVerifiedBMRequest 
} from '../hooks';
import { VerifiedBMRequestFormData, VerifiedBMRequestStats } from '../types/verified-bm';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../contexts/AuthContext';
import { Skeleton } from '../../../shared/components/SkeletonLoader';

const VerifiedBMService: React.FC = () => {
  usePageTitle('Jasa Verified BM');
  const { user, isGuest } = useAuth();
  const [notification, setNotification] = React.useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Fetch data
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useVerifiedBMStats();
  const { data: requests = [], isLoading: requestsLoading, refetch: refetchRequests } = useVerifiedBMRequests();
  const submitRequestMutation = useSubmitVerifiedBMRequest();

  // Get balance from AuthContext (realtime)
  const userBalance = user?.balance || 0;

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchStats(),
        refetchRequests()
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRequestSubmit = async (formData: VerifiedBMRequestFormData) => {
    setNotification(null);

    try {
      // Parse URLs from textarea (one per line)
      const urls = formData.urls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url !== '');

      // Submit request
      const response = await submitRequestMutation.mutateAsync({
        quantity: formData.quantity,
        urls
      });

      // Show success notification
      setNotification({
        type: 'success',
        message: `Request berhasil dibuat! Request ID: #${response.request_id.slice(0, 8)}. Saldo Anda: ${new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0
        }).format(response.new_balance)}`
      });

      // Scroll to top to show notification
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error('Request submission failed:', error);

      // Show error notification
      const errorMessage = error.message || 'Gagal membuat request. Silakan coba lagi.';
      setNotification({
        type: 'error',
        message: errorMessage
      });

      // Scroll to top to show notification
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Default stats if loading or no data
  const displayStats: VerifiedBMRequestStats = stats || {
    totalRequests: 0,
    pendingRequests: 0,
    processingRequests: 0,
    completedRequests: 0,
    failedRequests: 0
  };

  const displayRequests = requests || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jasa Verified BM</h1>
          <p className="text-sm text-gray-600 mt-1">
            Layanan verifikasi Business Manager - Rp 200.000 per akun
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Refresh data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`
            rounded-3xl p-4 flex items-start gap-3
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

      {/* Status Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-3xl shadow p-6">
              <div className="space-y-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <VerifiedBMStatusCards stats={displayStats} />
      )}

      {/* Request Form */}
      <VerifiedBMOrderForm
        userBalance={userBalance}
        onSubmit={handleRequestSubmit}
        loading={submitRequestMutation.isPending}
        isGuest={isGuest}
      />

      {/* Requests Table */}
      <VerifiedBMOrdersTable 
        requests={displayRequests}
        isLoading={requestsLoading}
      />

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-3xl p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Tentang Layanan Verified BM</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Harga tetap: Rp 200.000 per akun</li>
          <li>Saldo dipotong langsung setelah submit request</li>
          <li>Proses verifikasi memakan waktu 1-3 hari kerja</li>
          <li>Jika gagal, saldo akan dikembalikan otomatis</li>
          <li>Dukungan teknis 24/7 melalui WhatsApp</li>
        </ul>
      </div>
    </div>
  );
};

export default VerifiedBMService;

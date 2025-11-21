import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import {
  VerifiedBMStatusCards,
  VerifiedBMOrderForm,
  VerifiedBMOrdersTable
} from '../components/verified-bm';
import { useVerifiedBMStats, useVerifiedBMOrders, useSubmitVerifiedBMOrder } from '../hooks/useVerifiedBM';
import { VerifiedBMOrderFormData } from '../types/verified-bm';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../contexts/AuthContext';
import { Skeleton } from '../../../shared/components/SkeletonLoader';

const VerifiedBMService: React.FC = () => {
  usePageTitle('Verified BM Service');
  const { isGuest } = useAuth();
  const [notification, setNotification] = React.useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Fetch data - accessible to all users including guests
  const { data: stats, isLoading: statsLoading } = useVerifiedBMStats();
  const { data: orders, isLoading: ordersLoading } = useVerifiedBMOrders();
  const submitOrderMutation = useSubmitVerifiedBMOrder();

  const handleOrderSubmit = async (formData: VerifiedBMOrderFormData) => {
    setNotification(null);

    try {
      // Parse URLs from textarea (one per line)
      const urls = formData.urls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url !== '');

      // Submit order
      const response = await submitOrderMutation.mutateAsync({
        quantity: formData.quantity,
        urls
      });

      // Show success notification
      setNotification({
        type: 'success',
        message: `Pesanan berhasil dibuat! Order ID: #${response.orderId.slice(0, 8)}. Kami akan memproses pesanan Anda dalam 1-3 hari kerja.`
      });

      // Scroll to top to show notification
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error('Order submission failed:', error);

      // Show error notification
      const errorMessage = error.response?.data?.message || 'Gagal membuat pesanan. Silakan coba lagi.';
      setNotification({
        type: 'error',
        message: errorMessage
      });

      // Scroll to top to show notification
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Default stats if loading or no data
  const displayStats = stats || {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0
  };

  const displayOrders = orders || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Jasa Verified BM</h1>
        <p className="text-sm text-gray-600 mt-1">
          Layanan verifikasi Business Manager untuk meningkatkan kredibilitas akun Anda
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`
            rounded-lg p-4 flex items-start gap-3
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
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

      {/* Order Form */}
      <VerifiedBMOrderForm
        onSubmit={handleOrderSubmit}
        loading={submitOrderMutation.isPending}
        isGuest={isGuest}
      />

      {/* Orders Table */}
      <VerifiedBMOrdersTable 
        orders={displayOrders}
        isLoading={ordersLoading}
      />

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Tentang Layanan Verified BM</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Layanan verifikasi resmi untuk Business Manager Facebook</li>
          <li>Meningkatkan kredibilitas dan kepercayaan akun bisnis Anda</li>
          <li>Proses verifikasi memakan waktu 1-3 hari kerja</li>
          <li>Garansi uang kembali jika verifikasi gagal</li>
          <li>Dukungan teknis 24/7 melalui WhatsApp</li>
        </ul>
      </div>
    </div>
  );
};

export default VerifiedBMService;

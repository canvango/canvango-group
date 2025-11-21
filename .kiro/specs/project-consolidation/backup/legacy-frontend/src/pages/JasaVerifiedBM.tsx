import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';

// Types
enum VerifiedBMOrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

interface VerifiedBMOrder {
  id: string;
  quantity: number;
  amount: number;
  status: VerifiedBMOrderStatus;
  createdAt: string;
  urls: string[];
}

interface VerifiedBMOrderStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

interface VerifiedBMOrderFormData {
  quantity: number;
  urls: string;
}

// Mock Data
const mockStats: VerifiedBMOrderStats = {
  pending: 2,
  processing: 3,
  completed: 15,
  failed: 1
};

const mockOrders: VerifiedBMOrder[] = [
  {
    id: 'vbm-001-2024',
    quantity: 5,
    amount: 250000,
    status: VerifiedBMOrderStatus.COMPLETED,
    createdAt: '2024-01-15T10:30:00Z',
    urls: ['https://business.facebook.com/example1']
  },
  {
    id: 'vbm-002-2024',
    quantity: 3,
    amount: 150000,
    status: VerifiedBMOrderStatus.PROCESSING,
    createdAt: '2024-01-14T14:20:00Z',
    urls: ['https://business.facebook.com/example2']
  },
  {
    id: 'vbm-003-2024',
    quantity: 2,
    amount: 100000,
    status: VerifiedBMOrderStatus.PENDING,
    createdAt: '2024-01-13T09:15:00Z',
    urls: ['https://business.facebook.com/example3']
  },
  {
    id: 'vbm-004-2024',
    quantity: 1,
    amount: 50000,
    status: VerifiedBMOrderStatus.FAILED,
    createdAt: '2024-01-12T16:45:00Z',
    urls: ['https://business.facebook.com/example4']
  },
  {
    id: 'vbm-005-2024',
    quantity: 4,
    amount: 200000,
    status: VerifiedBMOrderStatus.COMPLETED,
    createdAt: '2024-01-11T11:00:00Z',
    urls: ['https://business.facebook.com/example5']
  }
];

// Utility Functions
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

// Status Cards Component
const VerifiedBMStatusCards: React.FC<{ stats: VerifiedBMOrderStats }> = ({ stats }) => {
  const statusCards = [
    {
      label: 'Pending',
      value: stats.pending,
      icon: ClockIcon,
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      iconBgColor: 'bg-yellow-100'
    },
    {
      label: 'In Progress',
      value: stats.processing,
      icon: ClockIcon,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100'
    },
    {
      label: 'Successful',
      value: stats.completed,
      icon: CheckCircleIcon,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100'
    },
    {
      label: 'Failed',
      value: stats.failed,
      icon: XCircleIcon,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      iconBgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
      {statusCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`${card.bgColor} rounded-lg p-5 transition-shadow hover:shadow-md`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`${card.iconBgColor} rounded-full p-3`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} aria-hidden="true" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Order Form Component
const VerifiedBMOrderForm: React.FC<{
  onSubmit: (data: VerifiedBMOrderFormData) => void;
  loading?: boolean;
}> = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState<VerifiedBMOrderFormData>({
    quantity: 1,
    urls: ''
  });
  const [errors, setErrors] = useState<{ quantity?: string; urls?: string }>({});

  const pricePerAccount = 50000;
  const totalPrice = formData.quantity * pricePerAccount;

  const validateForm = (): boolean => {
    const newErrors: { quantity?: string; urls?: string } = {};

    if (formData.quantity < 1) {
      newErrors.quantity = 'Minimal 1 akun';
    } else if (formData.quantity > 100) {
      newErrors.quantity = 'Maksimal 100 akun per pesanan';
    }

    if (!formData.urls.trim()) {
      newErrors.urls = 'Silakan masukkan minimal satu URL';
    } else {
      const urls = formData.urls.split('\n').filter(url => url.trim() !== '');
      if (urls.length === 0) {
        newErrors.urls = 'Silakan masukkan minimal satu URL';
      } else {
        const invalidUrls = urls.filter(url => {
          try {
            new URL(url.trim());
            return false;
          } catch {
            return true;
          }
        });
        if (invalidUrls.length > 0) {
          newErrors.urls = 'Semua URL harus valid';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Buat Pesanan Baru</h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Quantity Input */}
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
            Jumlah Akun <span className="text-red-500">*</span>
          </label>
          <input
            id="quantity"
            type="number"
            min={1}
            max={100}
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
            className={`
              w-full px-3 py-2 border rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${errors.quantity ? 'border-red-300' : 'border-gray-300'}
            `}
            placeholder="Masukkan jumlah akun (1-100)"
            disabled={loading}
          />
          {errors.quantity && (
            <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <ExclamationCircleIcon className="w-3 h-3" />
              <span>{errors.quantity}</span>
            </div>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Minimal 1 akun, maksimal 100 akun per pesanan
          </p>
        </div>

        {/* URLs Textarea */}
        <div>
          <label htmlFor="urls" className="block text-sm font-medium text-gray-700 mb-2">
            URL BM atau Akun Personal <span className="text-red-500">*</span>
          </label>
          <textarea
            id="urls"
            value={formData.urls}
            onChange={(e) => setFormData({ ...formData, urls: e.target.value })}
            rows={6}
            className={`
              w-full px-3 py-2 border rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${errors.urls ? 'border-red-300' : 'border-gray-300'}
            `}
            placeholder="Masukkan URL (satu URL per baris)&#10;Contoh:&#10;https://business.facebook.com/...&#10;https://www.facebook.com/..."
            disabled={loading}
          />
          {errors.urls && (
            <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <ExclamationCircleIcon className="w-3 h-3" />
              <span>{errors.urls}</span>
            </div>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Masukkan satu URL per baris. Pastikan URL valid dan dapat diakses.
          </p>
        </div>

        {/* Price Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Harga per akun:</span>
            <span className="font-medium text-gray-900">{formatCurrency(pricePerAccount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Jumlah akun:</span>
            <span className="font-medium text-gray-900">{formData.quantity}</span>
          </div>
          <div className="pt-2 border-t border-gray-200 flex justify-between">
            <span className="text-sm font-semibold text-gray-900">Total:</span>
            <span className="text-lg font-bold text-indigo-600">{formatCurrency(totalPrice)}</span>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Informasi Penting:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Proses verifikasi memakan waktu 1-3 hari kerja</li>
              <li>Pastikan URL yang dimasukkan valid dan dapat diakses</li>
              <li>Anda akan menerima notifikasi setelah proses selesai</li>
            </ul>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Memproses...' : 'Bayar Sekarang'}
        </button>
      </form>
    </div>
  );
};

// Orders Table Component
const VerifiedBMOrdersTable: React.FC<{
  orders: VerifiedBMOrder[];
  isLoading?: boolean;
}> = ({ orders, isLoading = false }) => {
  const getStatusBadge = (status: VerifiedBMOrderStatus) => {
    const badges = {
      [VerifiedBMOrderStatus.PENDING]: {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-800'
      },
      [VerifiedBMOrderStatus.PROCESSING]: {
        label: 'In Progress',
        className: 'bg-blue-100 text-blue-800'
      },
      [VerifiedBMOrderStatus.COMPLETED]: {
        label: 'Completed',
        className: 'bg-green-100 text-green-800'
      },
      [VerifiedBMOrderStatus.FAILED]: {
        label: 'Failed',
        className: 'bg-red-100 text-red-800'
      }
    };

    const badge = badges[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <ArchiveBoxIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Pesanan</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Anda belum memiliki riwayat pesanan verifikasi BM. Buat pesanan baru untuk memulai.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Riwayat Pesanan</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jumlah
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">#{order.id.slice(0, 8)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{formatDate(order.createdAt)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{order.quantity} akun</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(order.amount)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(order.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main Page Component
const JasaVerifiedBM: React.FC = () => {
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats] = useState<VerifiedBMOrderStats>(mockStats);
  const [orders] = useState<VerifiedBMOrder[]>(mockOrders);

  const handleOrderSubmit = async (formData: VerifiedBMOrderFormData) => {
    setNotification(null);
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Parse URLs (for future use)
      formData.urls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url !== '');

      // Show success notification
      const orderId = `vbm-${Date.now()}`;
      setNotification({
        type: 'success',
        message: `Pesanan berhasil dibuat! Order ID: #${orderId.slice(0, 8)}. Kami akan memproses pesanan Anda dalam 1-3 hari kerja.`
      });

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Order submission failed:', error);
      setNotification({
        type: 'error',
        message: 'Gagal membuat pesanan. Silakan coba lagi.'
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

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
            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
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
      <VerifiedBMStatusCards stats={stats} />

      {/* Order Form */}
      <VerifiedBMOrderForm onSubmit={handleOrderSubmit} loading={loading} />

      {/* Orders Table */}
      <VerifiedBMOrdersTable orders={orders} isLoading={false} />

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

export default JasaVerifiedBM;

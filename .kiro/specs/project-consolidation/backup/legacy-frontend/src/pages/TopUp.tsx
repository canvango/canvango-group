import React, { useState } from 'react';
import {
  WalletIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';

// ============================================================================
// INTERFACES
// ============================================================================

interface PaymentMethod {
  id: string;
  name: string;
  category: 'ewallet' | 'va';
  logo: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

// ============================================================================
// COMPONENTS
// ============================================================================

const NominalSelector: React.FC<{
  selectedAmount: number;
  customAmount: string;
  onSelectAmount: (amount: number) => void;
  onCustomAmountChange: (value: string) => void;
}> = ({ selectedAmount, customAmount, onSelectAmount, onCustomAmountChange }) => {
  const predefinedAmounts = [10000, 20000, 50000, 100000, 200000, 500000];

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Pilih Nominal</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {predefinedAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => onSelectAmount(amount)}
            className={`
              px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all
              ${selectedAmount === amount && !customAmount
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }
            `}
          >
            {formatCurrency(amount)}
          </button>
        ))}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Atau Masukkan Nominal Lain
        </label>
        <input
          type="number"
          placeholder="Minimal Rp 10.000"
          value={customAmount}
          onChange={(e) => onCustomAmountChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {customAmount && Number(customAmount) < 10000 && (
          <p className="mt-1 text-sm text-red-600">Minimal top up Rp 10.000</p>
        )}
      </div>
    </div>
  );
};

const PaymentMethodSelector: React.FC<{
  selectedMethod: string;
  onSelectMethod: (methodId: string) => void;
}> = ({ selectedMethod, onSelectMethod }) => {
  const paymentMethods: PaymentMethod[] = [
    { id: 'qris', name: 'QRIS', category: 'ewallet', logo: '💳' },
    { id: 'gopay', name: 'GoPay', category: 'ewallet', logo: '🟢' },
    { id: 'ovo', name: 'OVO', category: 'ewallet', logo: '🟣' },
    { id: 'dana', name: 'DANA', category: 'ewallet', logo: '🔵' },
    { id: 'bca', name: 'BCA Virtual Account', category: 'va', logo: '🏦' },
    { id: 'bri', name: 'BRI Virtual Account', category: 'va', logo: '🏦' },
    { id: 'bni', name: 'BNI Virtual Account', category: 'va', logo: '🏦' },
    { id: 'mandiri', name: 'Mandiri Virtual Account', category: 'va', logo: '🏦' },
  ];

  const ewalletMethods = paymentMethods.filter(m => m.category === 'ewallet');
  const vaMethods = paymentMethods.filter(m => m.category === 'va');

  const MethodCard: React.FC<{ method: PaymentMethod }> = ({ method }) => (
    <button
      onClick={() => onSelectMethod(method.id)}
      className={`
        flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left w-full
        ${selectedMethod === method.id
          ? 'border-indigo-600 bg-indigo-50'
          : 'border-gray-200 hover:border-gray-300'
        }
      `}
    >
      <span className="text-2xl">{method.logo}</span>
      <span className="font-medium text-gray-900">{method.name}</span>
      {selectedMethod === method.id && (
        <CheckCircleIcon className="w-5 h-5 text-indigo-600 ml-auto" />
      )}
    </button>
  );

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Pilih Metode Pembayaran</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">E-Wallet</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ewalletMethods.map((method) => (
              <MethodCard key={method.id} method={method} />
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Virtual Account</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vaMethods.map((method) => (
              <MethodCard key={method.id} method={method} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TopUp: React.FC = () => {
  const { user } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleSelectAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    if (value) {
      setSelectedAmount(Number(value));
    }
  };

  const handleSubmit = async () => {
    const amount = customAmount ? Number(customAmount) : selectedAmount;

    if (amount < 10000) {
      setNotification({
        type: 'error',
        message: 'Minimal top up adalah Rp 10.000'
      });
      return;
    }

    if (!selectedMethod) {
      setNotification({
        type: 'error',
        message: 'Silakan pilih metode pembayaran'
      });
      return;
    }

    setLoading(true);
    setNotification(null);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setNotification({
        type: 'success',
        message: `Top up berhasil! Saldo Anda akan ditambahkan sebesar ${formatCurrency(amount)} setelah pembayaran dikonfirmasi.`
      });
      
      // Reset form
      setSelectedAmount(0);
      setCustomAmount('');
      setSelectedMethod('');
    }, 1500);
  };

  const finalAmount = customAmount ? Number(customAmount) : selectedAmount;
  const isValid = finalAmount >= 10000 && selectedMethod;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Top Up Saldo</h1>
          <p className="text-sm text-gray-600 mt-1">Tambahkan saldo untuk melakukan pembelian</p>
        </div>
        <a
          href="/riwayat-transaksi?tab=topup"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <ClockIcon className="w-4 h-4" />
          <span>Riwayat Top Up</span>
        </a>
      </div>

      {/* Current Balance Card */}
      {user && (
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <WalletIcon className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Saldo Saat Ini</h2>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(user.balance || 0)}</p>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div
          className={`
            rounded-lg p-4 flex items-start gap-3
            ${notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}
          `}
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

      {/* Top Up Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Nominal Selection */}
          <NominalSelector
            selectedAmount={selectedAmount}
            customAmount={customAmount}
            onSelectAmount={handleSelectAmount}
            onCustomAmountChange={handleCustomAmountChange}
          />

          {/* Payment Method Selection */}
          <PaymentMethodSelector
            selectedMethod={selectedMethod}
            onSelectMethod={setSelectedMethod}
          />
        </div>

        {/* Summary & Submit */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">Total Top Up:</span>
            <span className="text-2xl font-bold text-gray-900">
              {finalAmount > 0 ? formatCurrency(finalAmount) : 'Rp 0'}
            </span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className={`
              w-full px-6 py-3 rounded-lg font-medium text-white transition-all
              ${isValid && !loading
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-gray-300 cursor-not-allowed'
              }
            `}
          >
            {loading ? 'Memproses...' : 'Top Up Sekarang'}
          </button>
        </div>
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Informasi Penting</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Minimal top up adalah Rp 10.000</li>
          <li>Saldo akan otomatis masuk setelah pembayaran berhasil</li>
          <li>Proses verifikasi pembayaran memakan waktu 1-5 menit</li>
          <li>Simpan bukti pembayaran untuk keperluan konfirmasi</li>
        </ul>
      </div>

      {/* Help Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Butuh Bantuan?</h3>
        <p className="text-gray-600 mb-4">
          Jika Anda mengalami kesulitan dalam proses top up, silakan hubungi customer support kami:
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-700">
            <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Email: support@canvangogroup.com</span>
          </div>
          <div className="flex items-center text-gray-700">
            <svg className="h-5 w-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>WhatsApp: +62 812-3456-7890</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopUp;

import React from 'react';
import { Link } from 'react-router-dom';
import { History, Wallet, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import TopUpForm from '../components/topup/TopUpForm';
import { PaymentMethodSelector } from '@/features/payment/components/PaymentMethodSelector';
import { FeeCalculator } from '@/features/payment/components/FeeCalculator';
import { TripayPaymentGateway } from '@/features/payment/components/TripayPaymentGateway';
import { useAuth } from '../contexts/AuthContext';
import { useCreatePayment, usePaymentMethods, usePaymentStatus } from '@/hooks/useTripay';
import { checkPaymentStatus } from '@/services/tripay.service';
import { formatCurrency } from '../utils/formatters';
import { usePageTitle } from '../hooks/usePageTitle';

const TopUp: React.FC = () => {
  usePageTitle('Top Up');
  
  const { user } = useAuth();
  const createPayment = useCreatePayment();
  const { data: paymentMethods } = usePaymentMethods();
  const [selectedAmount, setSelectedAmount] = React.useState(0);
  const [selectedMethodCode, setSelectedMethodCode] = React.useState<string | null>(null);
  const [showPaymentSelection, setShowPaymentSelection] = React.useState(false);
  const [paymentResponse, setPaymentResponse] = React.useState<any>(null);
  const [pollingReference, setPollingReference] = React.useState<string | null>(null);
  const [notification, setNotification] = React.useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Auto-poll payment status every 5 seconds
  const { data: paymentStatus } = usePaymentStatus(pollingReference);

  // Get selected method object
  const selectedMethod = React.useMemo(() => {
    if (!selectedMethodCode || !paymentMethods) return null;
    return paymentMethods.find(m => m.code === selectedMethodCode) || null;
  }, [selectedMethodCode, paymentMethods]);

  // Check if payment is completed (auto-polling)
  React.useEffect(() => {
    if (paymentStatus?.tripay_status === 'PAID') {
      setNotification({
        type: 'success',
        message: '🎉 Pembayaran berhasil! Saldo Anda telah ditambahkan.'
      });
      // Stop polling and reset form
      setPollingReference(null);
      setPaymentResponse(null);
      setShowPaymentSelection(false);
      setSelectedAmount(0);
      setSelectedMethodCode(null);
    } else if (paymentStatus?.tripay_status === 'EXPIRED') {
      setNotification({
        type: 'error',
        message: 'Pembayaran telah kadaluarsa. Silakan buat pembayaran baru.'
      });
      setPollingReference(null);
    } else if (paymentStatus?.tripay_status === 'FAILED') {
      setNotification({
        type: 'error',
        message: 'Pembayaran gagal. Silakan coba lagi.'
      });
      setPollingReference(null);
    }
  }, [paymentStatus]);

  // Update amount whenever form changes
  const handleAmountChange = (amount: number) => {
    setSelectedAmount(amount);
    if (amount > 0) {
      setShowPaymentSelection(true);
    } else {
      setShowPaymentSelection(false);
      setSelectedMethodCode(null);
      setPaymentResponse(null);
    }
  };

  const handleSelectMethod = (methodCode: string) => {
    setSelectedMethodCode(methodCode);
  };

  const handlePayment = async () => {
    if (!selectedMethod || !user || !user.email) {
      setNotification({
        type: 'error',
        message: 'Pilih metode pembayaran terlebih dahulu'
      });
      return;
    }

    try {
      const response = await createPayment.mutateAsync({
        amount: selectedAmount,
        paymentMethod: selectedMethod.code,
        customerName: user.fullName || user.email,
        customerEmail: user.email,
        customerPhone: user.phone || '',
        orderItems: [
          {
            name: 'Top-Up Saldo',
            price: selectedAmount,
            quantity: 1,
          }
        ],
      });
      
      // Show payment instructions
      setPaymentResponse(response);
      
      // Debug: Log payment response
      console.log('Payment Response:', response.data);
      console.log('Selected Amount:', selectedAmount);
      console.log('Response Amount:', response.data.amount);
      console.log('Response Total:', response.data.amount_received);
      
      // Start auto-polling status
      setPollingReference(response.data.reference);
      
      setNotification({
        type: 'success',
        message: 'Pembayaran berhasil dibuat! Silakan selesaikan pembayaran.'
      });
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.message || 'Gagal membuat pembayaran'
      });
    }
  };

  // Manual refresh status handler
  const handleRefreshStatus = async () => {
    if (!paymentResponse?.data?.reference) return;
    
    try {
      const status = await checkPaymentStatus(paymentResponse.data.reference as string);
      
      if (status.tripay_status === 'PAID') {
        setNotification({
          type: 'success',
          message: '🎉 Pembayaran berhasil! Saldo Anda telah ditambahkan.'
        });
        setPollingReference(null);
        setPaymentResponse(null);
        setShowPaymentSelection(false);
        setSelectedAmount(0);
        setSelectedMethodCode(null);
      } else if (status.tripay_status === 'EXPIRED') {
        setNotification({
          type: 'error',
          message: 'Pembayaran telah kadaluarsa. Silakan buat pembayaran baru.'
        });
        setPollingReference(null);
      } else if (status.tripay_status === 'FAILED') {
        setNotification({
          type: 'error',
          message: 'Pembayaran gagal. Silakan coba lagi.'
        });
        setPollingReference(null);
      } else {
        setNotification({
          type: 'info',
          message: `Status: ${status.tripay_status || 'Menunggu pembayaran'}`
        });
      }
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: 'Gagal memeriksa status pembayaran'
      });
    }
  };

  // If payment response exists, show full-page payment gateway
  if (paymentResponse) {
    return (
      <TripayPaymentGateway
        paymentData={paymentResponse.data}
        onBack={() => {
          setPaymentResponse(null);
          setPollingReference(null);
          setShowPaymentSelection(false);
          setSelectedAmount(0);
          setSelectedMethodCode(null);
        }}
        onRefreshStatus={handleRefreshStatus}
      />
    );
  }

  // Otherwise, show top-up form
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
            ${notification.type === 'success' ? 'bg-green-50 border border-green-200' : notification.type === 'error' ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}
          `}
          role="alert"
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-800' : notification.type === 'error' ? 'text-red-800' : 'text-blue-800'}`}>
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-600 hover:text-green-700' : notification.type === 'error' ? 'text-red-600 hover:text-red-700' : 'text-blue-600 hover:text-blue-700'}`}
          >
            Tutup
          </button>
        </div>
      )}

      {/* Top Up Form */}
      <TopUpForm onAmountChange={handleAmountChange} />

      {/* Payment Flow */}
      {showPaymentSelection && selectedAmount > 0 && (
        <div id="payment-selection" className="space-y-6">
          {/* Payment Method Selector */}
          <PaymentMethodSelector
            amount={selectedAmount}
            selectedMethod={selectedMethodCode}
            onSelect={handleSelectMethod}
          />

          {/* Fee Calculator */}
          {selectedMethod && (
            <FeeCalculator
              amount={selectedAmount}
              paymentMethod={selectedMethod}
            />
          )}

          {/* Payment Button */}
          {selectedMethod && (
            <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-4 -mx-4 md:mx-0 md:relative md:border-0 md:p-0">
              <button
                onClick={handlePayment}
                disabled={createPayment.isPending}
                className="w-full px-6 py-4 text-base font-semibold text-white bg-blue-600 rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {createPayment.isPending ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Bayar Sekarang
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TopUp;

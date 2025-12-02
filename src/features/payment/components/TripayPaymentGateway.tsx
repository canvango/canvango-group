/**
 * TripayPaymentGateway Component
 * Full-page payment gateway UI (like TriPay checkout page)
 * Responsive: Desktop (2-column), Mobile (1-column stack)
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Copy, Check } from 'lucide-react';

interface PaymentInstruction {
  title: string;
  steps: string[];
}

interface TripayPaymentGatewayProps {
  paymentData: {
    reference: string;
    merchant_ref: string;
    payment_method: string;
    payment_name: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    amount: number;
    fee_merchant: number;
    total_fee: number;
    amount_received: number;
    pay_code?: string;
    qr_url?: string;
    qr_string?: string;
    expired_time: number;
    instructions: PaymentInstruction[];
  };
  onBack: () => void;
  onRefreshStatus?: () => void;
}

export function TripayPaymentGateway({
  paymentData,
  onBack,
  onRefreshStatus,
}: TripayPaymentGatewayProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [copiedReference, setCopiedReference] = useState(false);
  const [copiedPayCode, setCopiedPayCode] = useState(false);

  // Debug: Log payment data
  console.log('TripayPaymentGateway - Payment Data:', {
    amount: paymentData.amount,
    fee_merchant: paymentData.fee_merchant,
    total_fee: paymentData.total_fee,
    amount_received: paymentData.amount_received,
    calculation: `${paymentData.amount} + ${paymentData.total_fee} = ${paymentData.amount + paymentData.total_fee}`,
    expected_total: paymentData.amount + paymentData.total_fee,
    actual_total: paymentData.amount_received,
  });

  // Calculate time left
  useEffect(() => {
    if (!paymentData.expired_time) return;

    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = paymentData.expired_time - now;
      return diff > 0 ? diff : 0;
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentData.expired_time]);

  // Format time left (HH:MM:SS)
  const formatTimeLeft = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Format expired date
  const formatExpiredDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Copy to clipboard
  const handleCopy = async (text: string, type: 'reference' | 'paycode') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'reference') {
        setCopiedReference(true);
        setTimeout(() => setCopiedReference(false), 2000);
      } else {
        setCopiedPayCode(true);
        setTimeout(() => setCopiedPayCode(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Back Button */}
      <div className="px-4 md:px-6 pt-6 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Pembayaran</span>
        </button>
      </div>

      {/* Payment Gateway Container */}
      <div className="px-4 md:px-6">
        <div className="bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-50 rounded-3xl p-4 md:p-8 min-h-[calc(100vh-140px)]">
          
          {/* Status Header - Centered */}
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 md:px-6 py-3 rounded-2xl shadow-sm">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-orange-500 animate-pulse flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">Menunggu Pembayaran</p>
                <p className="text-xs text-gray-600 hidden md:block">
                  Selesaikan pembayaran sebelum {formatExpiredDate(paymentData.expired_time)}
                </p>
              </div>
            </div>
          </div>

          {/* 2-Column Layout (Desktop) / Stack (Mobile) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 max-w-6xl mx-auto">
            
            {/* LEFT PANEL: QR Code / Pay Code */}
            <div className="bg-white rounded-3xl p-6 md:p-8 text-center shadow-sm">
              {/* Payment Method Name */}
              <div className="mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">
                  {paymentData.payment_name}
                </h2>
              </div>

              {/* QR Code (if available) */}
              {paymentData.qr_url && (
                <div className="mb-6">
                  <div className="bg-white p-3 md:p-4 rounded-2xl inline-block border-2 border-gray-200">
                    <img
                      src={paymentData.qr_url}
                      alt="QR Code"
                      className="w-64 h-64 md:w-80 md:h-80"
                    />
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 mt-4">
                    Scan dengan aplikasi pembayaran {paymentData.payment_name}
                  </p>
                </div>
              )}

              {/* Pay Code / Virtual Account (if available) */}
              {paymentData.pay_code && (
                <div className="mb-6">
                  <p className="text-xs text-gray-600 mb-2">
                    {paymentData.payment_method.includes('VA') ? 'Nomor Virtual Account' : 'Kode Pembayaran'}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 md:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                      <p className="text-xl md:text-2xl font-mono font-bold text-blue-900 tracking-wider break-all">
                        {paymentData.pay_code}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(paymentData.pay_code!, 'paycode')}
                      className="btn-primary px-3 md:px-4 py-3 md:py-4 flex-shrink-0"
                      title="Salin kode"
                    >
                      {copiedPayCode ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Gunakan kode ini untuk transfer melalui ATM, Mobile Banking, atau Internet Banking
                  </p>
                </div>
              )}

              {/* Amount */}
              <div className="mb-6">
                <p className="text-xs text-gray-500">Total Pembayaran</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {formatCurrency(paymentData.amount)}
                </p>
                {paymentData.fee_merchant > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    Biaya admin ditanggung oleh kami
                  </p>
                )}
              </div>

              {/* Cara Pembayaran Button */}
              {paymentData.instructions && paymentData.instructions.length > 0 && (
                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="btn-secondary w-full"
                >
                  {showInstructions ? 'Sembunyikan' : 'Cara Pembayaran'}
                </button>
              )}
            </div>

            {/* RIGHT PANEL: Transaction Details */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm">
              {/* Header: Merchant + Timer */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900">CANVANGO GROUP</h3>
                  <p className="text-xs text-gray-500 mt-1">ADVERTISING ACCOUNT PROVIDER</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Waktu Tersisa</p>
                  <p className="text-xl md:text-2xl font-bold text-red-500">
                    {formatTimeLeft(timeLeft)}
                  </p>
                  <p className="text-xs text-gray-500">Jam:Menit:Detik</p>
                </div>
              </div>

              {/* Transaction Info */}
              <div className="space-y-3 text-sm border-b border-gray-200 pb-6 mb-6">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Merchant</span>
                  <span className="text-gray-900 font-medium text-right">CANVANGO GROUP</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Nama Pemesan</span>
                  <span className="text-gray-900 font-medium text-right">{paymentData.customer_name}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Nomor Invoice</span>
                  <span className="text-gray-900 font-medium text-right break-all">{paymentData.merchant_ref}</span>
                </div>
                {paymentData.customer_phone && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Nomor HP</span>
                    <span className="text-gray-900 font-medium text-right">{paymentData.customer_phone}</span>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Nomor Referensi</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-medium text-right break-all">{paymentData.reference}</span>
                    <button
                      onClick={() => handleCopy(paymentData.reference, 'reference')}
                      className="text-blue-600 hover:text-blue-700 flex-shrink-0"
                      title="Salin referensi"
                    >
                      {copiedReference ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Email</span>
                  <span className="text-gray-900 font-medium text-right break-all">{paymentData.customer_email}</span>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Rincian Pembayaran</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Top Up Saldo</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(paymentData.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Biaya Admin</span>
                    <span className="text-green-600 font-medium">
                      Gratis
                    </span>
                  </div>
                  {paymentData.fee_merchant > 0 && (
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Biaya admin ditanggung oleh kami</span>
                      <span className="text-xs text-gray-500 line-through">{formatCurrency(paymentData.fee_merchant)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-lg md:text-xl font-bold text-blue-600">
                      {formatCurrency(paymentData.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Refresh Status Button */}
              {onRefreshStatus && (
                <button
                  onClick={onRefreshStatus}
                  className="btn-secondary w-full mt-6"
                >
                  🔄 Refresh Status Pembayaran
                </button>
              )}
            </div>
          </div>

          {/* Instructions Modal/Section (Mobile: Below, Desktop: Modal) */}
          {showInstructions && paymentData.instructions && (
            <div className="mt-6 max-w-6xl mx-auto">
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Cara Pembayaran</h3>
                  <button
                    onClick={() => setShowInstructions(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                {/* Tabs (if multiple instruction types) */}
                {paymentData.instructions.length > 1 && (
                  <div className="border-b border-gray-200 mb-4">
                    <div className="flex overflow-x-auto gap-2">
                      {paymentData.instructions.map((instruction, index) => (
                        <button
                          key={index}
                          className="px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 border-blue-500 text-blue-600"
                        >
                          {instruction.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instruction Steps */}
                <div className="space-y-6">
                  {paymentData.instructions.map((instruction, idx) => (
                    <div key={idx}>
                      {paymentData.instructions.length === 1 && (
                        <h4 className="text-base font-semibold text-gray-900 mb-3">{instruction.title}</h4>
                      )}
                      <ol className="space-y-3">
                        {instruction.steps.map((step, stepIdx) => (
                          <li key={stepIdx} className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold flex items-center justify-center">
                              {stepIdx + 1}
                            </span>
                            <p className="text-sm text-gray-700 flex-1">{step}</p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-8 text-xs md:text-sm text-gray-600">
            © {new Date().getFullYear()} Canvango Group
          </div>
        </div>
      </div>
    </div>
  );
}

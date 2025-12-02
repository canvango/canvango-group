/**
 * TripayPaymentGateway Component
 * Full-page payment gateway UI (like TriPay checkout page)
 * Responsive: Desktop (2-column), Mobile (1-column stack)
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Copy, Check, RefreshCw } from 'lucide-react';

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
  onBack?: () => void;
  onRefreshStatus?: () => void;
  isModal?: boolean; // NEW: Flag to indicate if used in modal
}

export function TripayPaymentGateway({
  paymentData,
  onBack,
  onRefreshStatus,
  isModal = false,
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
    <div className={isModal ? "" : "min-h-screen bg-gray-50 pb-8"}>
      {/* Back Button - Only show if not modal */}
      {!isModal && onBack && (
        <div className="px-4 md:px-6 pt-6 pb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Pembayaran</span>
          </button>
        </div>
      )}

      {/* Payment Gateway Container */}
      <div className={isModal ? "" : "px-2 sm:px-4 md:px-6 max-w-[1400px] mx-auto"}>
        <div className={`bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-50 ${isModal ? "rounded-2xl p-3 sm:p-4" : "rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8"}`}>
          
          {/* 2-Column Layout (Desktop) / Stack (Mobile) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:items-start">
            
            {/* LEFT PANEL: New Design */}
            <div className="space-y-4 sm:space-y-6 flex flex-col h-full">
              {/* Alert Section - Center */}
              <div className="text-center">
                <div className="inline-flex flex-col items-center gap-2 sm:gap-3">
                  {/* Clock Icon */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-orange-500 flex items-center justify-center">
                    <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  {/* Text */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Menunggu Pembayaran</h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Selesaikan pembayaran sebelum {formatExpiredDate(paymentData.expired_time)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm space-y-4 sm:space-y-6 flex-1 flex flex-col">
                {/* Header: Payment Method + Logo */}
                <div className="flex justify-between items-center">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">{paymentData.payment_name}</h2>
                  {paymentData.payment_method.includes('QRIS') && (
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/QRIS_logo.svg/2560px-QRIS_logo.svg.png" 
                      alt="QRIS" 
                      className="h-5 sm:h-6 w-auto object-contain"
                    />
                  )}
                </div>

                {/* QR Code (if available) */}
                {paymentData.qr_url && (
                  <div className="text-center py-4">
                    <div className="inline-block p-3 sm:p-4 bg-white rounded-xl border border-gray-200">
                      <img
                        src={paymentData.qr_url}
                        alt="QR Code"
                        className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64"
                      />
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-4">
                      Scan dengan aplikasi pembayaran {paymentData.payment_name}
                    </p>
                  </div>
                )}

                {/* Pay Code / Virtual Account (if available) */}
                {paymentData.pay_code && (
                  <div className="text-center py-4">
                    <p className="text-xs sm:text-sm text-slate-600 mb-3">
                      {paymentData.payment_method.includes('VA') ? 'Nomor Virtual Account' : 'Kode Pembayaran'}
                    </p>
                    <div className="flex items-center gap-2 justify-center">
                      <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-lg sm:text-xl md:text-2xl font-mono font-bold text-slate-900 tracking-wider">
                          {paymentData.pay_code}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopy(paymentData.pay_code!, 'paycode')}
                        className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        title="Salin kode"
                      >
                        {copiedPayCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Amount Section */}
                <div>
                  <p className="text-xs sm:text-sm text-slate-600 mb-2">
                    {paymentData.pay_code ? 'Jumlah Bayar' : 'Total Pembayaran'}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                      {formatCurrency(paymentData.amount)}
                    </p>
                    <button
                      onClick={() => handleCopy(paymentData.amount.toString(), 'reference')}
                      className="text-blue-600 text-sm font-semibold hover:text-blue-700 flex items-center gap-1"
                    >
                      Salin
                      {copiedReference ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {paymentData.fee_merchant > 0 && (
                    <p className="text-xs sm:text-sm text-green-600 mt-2">
                      Biaya admin ditanggung oleh kami
                    </p>
                  )}
                </div>

                {/* Cara Pembayaran Button */}
                {paymentData.instructions && paymentData.instructions.length > 0 && (
                  <button
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="w-full px-6 py-3 rounded-full border-2 border-blue-600 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors"
                  >
                    {showInstructions ? 'Sembunyikan' : 'Cara Pembayaran'}
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT PANEL: 2 Separate Cards */}
            <div className="space-y-3 sm:space-y-4 flex flex-col h-full">
              {/* Card 1: Header - Logo + Timer */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-sm">
                <div className="flex justify-between items-center gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <img 
                      src="https://res.cloudinary.com/dubmxw6kl/image/upload/v1764639586/Canvango_Group_5_iu5nrz.png" 
                      alt="Canvango Group" 
                      className="h-8 sm:h-9 md:h-10 w-auto object-contain"
                    />
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-gray-600">Waktu Tersisa</p>
                    <p className="text-base sm:text-lg md:text-xl font-bold text-red-500">
                      {formatTimeLeft(timeLeft)}
                    </p>
                    <p className="text-[10px] text-gray-500">Jam:Menit:Detik</p>
                  </div>
                </div>
              </div>

              {/* Card 2: Transaction Info + Payment Breakdown */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm flex-1 flex flex-col">
                {/* Transaction Info Section */}
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm pb-4 sm:pb-6 mb-4 sm:mb-6 border-b border-gray-200">
                <div className="flex justify-between gap-2 sm:gap-4">
                  <span className="text-gray-600 flex-shrink-0">Merchant</span>
                  <span className="text-gray-900 font-medium text-right">CANVANGO GROUP</span>
                </div>
                <div className="flex justify-between gap-2 sm:gap-4">
                  <span className="text-gray-600 flex-shrink-0">Nama Pemesan</span>
                  <span className="text-gray-900 font-medium text-right break-words">{paymentData.customer_name}</span>
                </div>
                <div className="flex justify-between gap-2 sm:gap-4">
                  <span className="text-gray-600 flex-shrink-0">Nomor Invoice</span>
                  <span className="text-gray-900 font-medium text-right break-all text-[10px] sm:text-xs">{paymentData.merchant_ref}</span>
                </div>
                {paymentData.customer_phone && (
                  <div className="flex justify-between gap-2 sm:gap-4">
                    <span className="text-gray-600 flex-shrink-0">Nomor HP</span>
                    <span className="text-gray-900 font-medium text-right">{paymentData.customer_phone}</span>
                  </div>
                )}
                <div className="flex justify-between gap-2 sm:gap-4">
                  <span className="text-gray-600 flex-shrink-0">Nomor Referensi</span>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-gray-900 font-medium text-right break-all text-[10px] sm:text-xs">{paymentData.reference}</span>
                    <button
                      onClick={() => handleCopy(paymentData.reference, 'reference')}
                      className="text-blue-600 hover:text-blue-700 flex-shrink-0"
                      title="Salin referensi"
                    >
                      {copiedReference ? (
                        <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between gap-2 sm:gap-4">
                  <span className="text-gray-600 flex-shrink-0">Email</span>
                  <span className="text-gray-900 font-medium text-right break-all text-[10px] sm:text-xs">{paymentData.customer_email}</span>
                </div>
              </div>

              {/* Payment Breakdown Section */}
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4">Rincian Pembayaran</h3>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Jumlah Top Up</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(paymentData.amount)}</span>
                  </div>
                  
                  {/* Biaya Admin Section */}
                  <div className="border-t border-gray-100 pt-2 mt-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600 font-medium">BIAYA ADMIN</span>
                      <span className="text-green-600 font-semibold text-xs bg-green-50 px-2 py-0.5 rounded">
                        Ditanggung Seller
                      </span>
                    </div>
                    
                    {paymentData.fee_merchant > 0 && (
                      <>
                        <div className="flex justify-between text-xs text-gray-500 ml-3">
                          <span>Biaya Tetap</span>
                          <span>{formatCurrency(paymentData.fee_merchant)}</span>
                        </div>
                        {paymentData.total_fee > paymentData.fee_merchant && (
                          <div className="flex justify-between text-xs text-gray-500 ml-3">
                            <span>Biaya Persentase</span>
                            <span>{formatCurrency(paymentData.total_fee - paymentData.fee_merchant)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs text-gray-500 ml-3 mt-1">
                          <span>Total Biaya</span>
                          <span>{formatCurrency(paymentData.total_fee || paymentData.fee_merchant)}</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Total Bayar */}
                  <div className="flex justify-between items-center pt-2 sm:pt-3 border-t-2 border-gray-200">
                    <span className="text-sm sm:text-base font-semibold text-gray-900">Total Bayar</span>
                    <span className="text-base sm:text-lg md:text-xl font-bold text-blue-600">
                      {formatCurrency(paymentData.amount)}
                    </span>
                  </div>
                  
                  {/* Info Message */}
                  {paymentData.fee_merchant > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg sm:rounded-xl p-2 sm:p-3 mt-2 sm:mt-3">
                      <p className="text-[10px] sm:text-xs text-green-800 leading-relaxed">
                        ✓ Bayar sebanyak <span className="font-semibold">{formatCurrency(paymentData.amount)}</span> dan saldo Anda akan bertambah <span className="font-semibold">{formatCurrency(paymentData.amount)}</span>. Biaya admin <span className="font-semibold">{formatCurrency(paymentData.total_fee || paymentData.fee_merchant)}</span> ditanggung oleh seller.
                      </p>
                    </div>
                  )}
                </div>
              </div>

                {/* Refresh Status Button */}
                {onRefreshStatus && (
                  <button
                    onClick={onRefreshStatus}
                    className="w-full px-6 py-3 rounded-full border-2 border-blue-600 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors mt-4 sm:mt-6 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Status Pembayaran
                  </button>
                )}
              </div>
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
        </div>
      </div>
    </div>
  );
}

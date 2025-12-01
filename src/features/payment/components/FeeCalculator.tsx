/**
 * FeeCalculator Component
 * Shows fee breakdown before payment
 */

import type { TripayPaymentMethod } from '@/services/tripay.service';

interface FeeCalculatorProps {
  amount: number;
  paymentMethod: TripayPaymentMethod;
}

export function FeeCalculator({ amount, paymentMethod }: FeeCalculatorProps) {
  // Calculate fees
  const flatFee = paymentMethod.fee_merchant.flat || 0;
  const percentFee = (amount * (paymentMethod.fee_merchant.percent || 0)) / 100;
  let totalFee = flatFee + percentFee;

  // Apply minimum fee
  if (paymentMethod.minimum_fee && totalFee < paymentMethod.minimum_fee) {
    totalFee = paymentMethod.minimum_fee;
  }

  // Apply maximum fee
  if (paymentMethod.maximum_fee && totalFee > paymentMethod.maximum_fee) {
    totalFee = paymentMethod.maximum_fee;
  }

  const finalAmount = amount + totalFee;

  // Check if amount meets requirements
  const isAmountTooLow = paymentMethod.minimum_amount && amount < paymentMethod.minimum_amount;
  const isAmountTooHigh = paymentMethod.maximum_amount && amount > paymentMethod.maximum_amount;
  const hasWarning = isAmountTooLow || isAmountTooHigh;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-900">Rincian Pembayaran</h3>
      </div>

      <div className="card-body space-y-4">
        {/* Amount that will be added to balance */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">Jumlah Top Up</span>
          <span className="text-base font-semibold text-gray-900">
            {formatCurrency(amount)}
          </span>
        </div>

        {/* Total Amount to Pay */}
        <div className="border-t-2 border-gray-300 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-gray-900">Total Bayar</span>
            <span className="text-xl font-bold text-blue-600">
              {formatCurrency(finalAmount)}
            </span>
          </div>
        </div>

        {/* Warning Messages */}
        {hasWarning && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex gap-2">
              <svg
                className="w-5 h-5 text-yellow-600 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">Peringatan</p>
                <p className="text-xs text-yellow-700 mt-1">
                  {isAmountTooLow && (
                    <>
                      Nominal minimal untuk metode pembayaran ini adalah{' '}
                      {formatCurrency(paymentMethod.minimum_amount!)}
                    </>
                  )}
                  {isAmountTooHigh && (
                    <>
                      Nominal maksimal untuk metode pembayaran ini adalah{' '}
                      {formatCurrency(paymentMethod.maximum_amount!)}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex gap-2">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-xs text-blue-700">
              Bayar sekarang <span className="font-semibold">{formatCurrency(finalAmount)}</span> dan saldo Anda akan bertambah <span className="font-semibold">{formatCurrency(amount)}</span>. Biaya admin ditanggung oleh sistem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  // Calculate fees (for display only - covered by seller)
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

      <div className="card-body space-y-3">
        {/* Base Amount */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">Jumlah Top Up</span>
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(amount)}
          </span>
        </div>

        {/* Fee Breakdown - Ditanggung Seller */}
        <div className="border-t border-gray-200 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-600 uppercase">Biaya Admin</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
              Ditanggung Seller
            </span>
          </div>

          {flatFee > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Biaya Tetap</span>
              <span className="text-sm text-gray-500 line-through">{formatCurrency(flatFee)}</span>
            </div>
          )}

          {paymentMethod.fee_merchant.percent > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Biaya Persentase ({paymentMethod.fee_merchant.percent}%)
              </span>
              <span className="text-sm text-gray-500 line-through">{formatCurrency(percentFee)}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-700">Total Biaya</span>
            <span className="text-sm font-medium text-gray-500 line-through">
              {formatCurrency(totalFee)}
            </span>
          </div>
        </div>

        {/* Total Amount - Same as Top Up Amount */}
        <div className="border-t-2 border-gray-300 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-gray-900">Total Bayar</span>
            <span className="text-xl font-bold text-blue-600">
              {formatCurrency(amount)}
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

        {/* Info - Seller Covers Fee */}
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex gap-2">
            <svg
              className="w-5 h-5 text-green-600 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-xs text-green-700">
              Bayar sekarang <span className="font-semibold">{formatCurrency(amount)}</span> dan saldo Anda akan bertambah <span className="font-semibold">{formatCurrency(amount)}</span>. Biaya admin <span className="font-semibold">{formatCurrency(totalFee)}</span> ditanggung oleh seller.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

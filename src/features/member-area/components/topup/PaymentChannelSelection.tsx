/**
 * Payment Channel Selection Component
 * Displays payment channels grouped by type for TopUp page
 */

import React from 'react';
import { usePaymentMethods } from '@/hooks/useTripay';
import { calculateTotalAmount, TripayPaymentMethod } from '@/services/tripay.service';
import { Loader2, CreditCard, Wallet, Building2, Store } from 'lucide-react';

interface PaymentChannelSelectionProps {
  amount: number;
  onSelectMethod: (method: TripayPaymentMethod) => void;
  selectedMethod: string | null;
}

export const PaymentChannelSelection: React.FC<PaymentChannelSelectionProps> = ({
  amount,
  onSelectMethod,
  selectedMethod,
}) => {
  const { data: paymentMethods, isLoading } = usePaymentMethods();

  // Group payment methods by type
  const groupedMethods = React.useMemo(() => {
    if (!paymentMethods) return {};

    const groups: Record<string, TripayPaymentMethod[]> = {};
    
    paymentMethods.forEach(method => {
      // Determine group based on code or name
      let group = 'Lainnya';
      
      if (method.code.includes('QRIS') || method.name.toLowerCase().includes('qris')) {
        group = 'E-WALLET';
      } else if (method.code.includes('VA') || method.name.toLowerCase().includes('virtual account')) {
        group = 'VIRTUAL ACCOUNT';
      } else if (['DANA', 'OVO', 'SHOPEEPAY', 'LINKAJA', 'GOPAY'].includes(method.code)) {
        group = 'E-WALLET';
      } else if (['ALFAMART', 'INDOMARET'].includes(method.code)) {
        group = 'RETAIL';
      }

      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(method);
    });

    return groups;
  }, [paymentMethods]);

  const getGroupIcon = (group: string) => {
    switch (group) {
      case 'E-WALLET':
        return <Wallet className="w-5 h-5" />;
      case 'VIRTUAL ACCOUNT':
        return <Building2 className="w-5 h-5" />;
      case 'RETAIL':
        return <Store className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const formatFee = (method: TripayPaymentMethod) => {
    const { flat, percent } = method.fee_merchant;
    if (flat > 0 && percent > 0) {
      return `Rp ${flat.toLocaleString()} + ${percent}%`;
    } else if (flat > 0) {
      return `Rp ${flat.toLocaleString()}`;
    } else if (percent > 0) {
      return `${percent}%`;
    }
    return 'Gratis';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl shadow-sm p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="ml-3 text-sm text-gray-600">Memuat metode pembayaran...</p>
        </div>
      </div>
    );
  }

  if (!paymentMethods || paymentMethods.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-sm p-8">
        <p className="text-center text-sm text-gray-500">
          Tidak ada metode pembayaran tersedia
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Metode Pembayaran</h2>
        <p className="text-sm text-gray-600">Pilih metode pembayaran yang Anda inginkan</p>
      </div>

      {Object.entries(groupedMethods).map(([group, methods]) => (
        <div key={group} className="space-y-3">
          {/* Group Header */}
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 px-4 py-2 rounded-xl">
            {getGroupIcon(group)}
            <span>{group}</span>
          </div>

          {/* Payment Methods */}
          <div className="space-y-2">
            {methods.map((method) => {
              const isSelected = selectedMethod === method.code;
              const totalAmount = calculateTotalAmount(amount, method);
              const fee = totalAmount - amount;

              return (
                <button
                  key={method.code}
                  onClick={() => onSelectMethod(method)}
                  className={`
                    w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all
                    ${isSelected
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    {method.icon_url && (
                      <img
                        src={method.icon_url}
                        alt={method.name}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}

                    {/* Info */}
                    <div className="text-left">
                      <div className="text-sm font-semibold text-gray-900">
                        {method.name}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        Biaya: {formatFee(method)}
                      </div>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-2">
                        <div className="text-xs text-gray-600">Total Bayar</div>
                        <div className="text-sm font-bold text-blue-600">
                          Rp {totalAmount.toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

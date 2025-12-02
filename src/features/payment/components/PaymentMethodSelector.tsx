/**
 * PaymentMethodSelector Component
 * Displays available payment channels with fee calculation
 * Updated: All groups expanded by default, shows even without amount
 */

import { useMemo } from 'react';
import { usePaymentMethods } from '@/hooks/useTripay';
import type { TripayPaymentMethod } from '@/services/tripay.service';

interface PaymentMethodSelectorProps {
  amount: number;
  selectedMethod: string | null;
  onSelect: (method: string) => void;
}

interface GroupedMethods {
  [key: string]: TripayPaymentMethod[];
}

export function PaymentMethodSelector({
  amount,
  selectedMethod,
  onSelect,
}: PaymentMethodSelectorProps) {
  const { data: methods, isLoading, error } = usePaymentMethods();

  // Group payment methods by group_name with priority order
  const groupedMethods = useMemo(() => {
    if (!methods) return {};

    const grouped: GroupedMethods = {};
    methods.forEach((method) => {
      const group = method.group_name || 'Lainnya';
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(method);
    });

    return grouped;
  }, [methods]);

  // Define group order: E-Wallet first, then Virtual Account, then others
  const groupOrder = ['E-Wallet', 'Virtual Account', 'Convenience Store', 'Lainnya'];
  
  const sortedGroups = useMemo(() => {
    const entries = Object.entries(groupedMethods);
    return entries.sort((a, b) => {
      const indexA = groupOrder.indexOf(a[0]);
      const indexB = groupOrder.indexOf(b[0]);
      
      // If both in order list, sort by order
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      // If only A in order list, A comes first
      if (indexA !== -1) return -1;
      // If only B in order list, B comes first
      if (indexB !== -1) return 1;
      // Otherwise, alphabetical
      return a[0].localeCompare(b[0]);
    });
  }, [groupedMethods]);

  // Calculate fee for each method
  const calculateFee = (method: TripayPaymentMethod) => {
    const flatFee = method.fee_merchant.flat || 0;
    const percentFee = (amount * (method.fee_merchant.percent || 0)) / 100;
    let totalFee = flatFee + percentFee;

    // Apply minimum fee
    if (method.minimum_fee && totalFee < method.minimum_fee) {
      totalFee = method.minimum_fee;
    }

    // Apply maximum fee
    if (method.maximum_fee && totalFee > method.maximum_fee) {
      totalFee = method.maximum_fee;
    }

    return totalFee;
  };

  // Check if method is valid for current amount
  const isMethodValid = (method: TripayPaymentMethod) => {
    if (method.minimum_amount && amount < method.minimum_amount) {
      return false;
    }
    if (method.maximum_amount && amount > method.maximum_amount) {
      return false;
    }
    return true;
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-50 border border-red-200">
        <div className="card-body">
          <p className="text-sm text-red-600">
            Gagal memuat metode pembayaran. Silakan refresh halaman.
          </p>
        </div>
      </div>
    );
  }

  if (!methods || methods.length === 0) {
    return (
      <div className="card bg-yellow-50 border border-yellow-200">
        <div className="card-body">
          <p className="text-sm text-yellow-700">
            Tidak ada metode pembayaran yang tersedia saat ini.
          </p>
        </div>
      </div>
    );
  }

  // Get icon for group
  const getGroupIcon = (groupName: string) => {
    switch (groupName) {
      case 'E-Wallet':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
          </svg>
        );
      case 'Virtual Account':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm7 5a1 1 0 10-2 0v1H8a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-4">
      {sortedGroups.map(([groupName, groupMethods]) => (
        <div key={groupName} className="card">
          {/* Group Header with Icon */}
          <div className="card-header">
            <div className="flex items-center gap-2">
              {getGroupIcon(groupName)}
              <h3 className="text-base font-semibold text-gray-700 uppercase tracking-wide">
                {groupName}
              </h3>
            </div>
          </div>

          {/* Payment Methods List */}
          <div className="card-body space-y-2">
            {groupMethods.map((method) => {
              const fee = amount > 0 ? calculateFee(method) : 0;
              const total = amount + fee;
              const isValid = amount > 0 ? isMethodValid(method) : true;
              const isSelected = selectedMethod === method.code;

              return (
                <button
                  key={method.code}
                  onClick={() => isValid && onSelect(method.code)}
                  disabled={!isValid}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : isValid
                      ? 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Icon + Name */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {method.icon_url && (
                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center p-2">
                          <img
                            src={method.icon_url}
                            alt={method.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {method.name}
                        </h4>
                        {amount > 0 && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Biaya: {formatCurrency(fee)}
                          </p>
                        )}
                        {!isValid && amount > 0 && (
                          <p className="text-xs text-red-600 mt-0.5">
                            {method.minimum_amount && amount < method.minimum_amount && (
                              <span>Min. {formatCurrency(method.minimum_amount)}</span>
                            )}
                            {method.maximum_amount && amount > method.maximum_amount && (
                              <span>Maks. {formatCurrency(method.maximum_amount)}</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Total (only if amount > 0) */}
                    {amount > 0 && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(total)}
                        </p>
                        <p className="text-xs text-gray-500">Total</p>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * PaymentMethodSelector Component
 * Displays available payment channels with fee calculation
 */

import { useState, useMemo } from 'react';
import { usePaymentMethods } from '@/hooks/useTripay';
import type { TripayPaymentMethod } from '@/services/tripay.service';
import { calculateTotalAmount } from '@/services/tripay.service';

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
  const [expandedGroup, setExpandedGroup] = useState<string | null>('Virtual Account');

  // Group payment methods by group_name
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

  return (
    <div className="space-y-4">
      {Object.entries(groupedMethods).map(([groupName, groupMethods]) => (
        <div key={groupName} className="card">
          <button
            onClick={() => setExpandedGroup(expandedGroup === groupName ? null : groupName)}
            className="card-header w-full flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-900">{groupName}</h3>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedGroup === groupName ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {expandedGroup === groupName && (
            <div className="card-body space-y-2">
              {groupMethods.map((method) => {
                const fee = calculateFee(method);
                const total = amount + fee;
                const isValid = isMethodValid(method);
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
                        ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          {method.icon_url && (
                            <img
                              src={method.icon_url}
                              alt={method.name}
                              className="w-12 h-12 object-contain"
                            />
                          )}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {method.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              Biaya: {formatCurrency(fee)}
                            </p>
                          </div>
                        </div>

                        {!isValid && (
                          <div className="mt-2 text-xs text-red-600">
                            {method.minimum_amount && amount < method.minimum_amount && (
                              <span>
                                Minimal {formatCurrency(method.minimum_amount)}
                              </span>
                            )}
                            {method.maximum_amount && amount > method.maximum_amount && (
                              <span>
                                Maksimal {formatCurrency(method.maximum_amount)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(total)}
                        </p>
                        <p className="text-xs text-gray-500">Total Bayar</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { getPaymentMethods, createTopUp } from '../../services/topupService';
import Button from '../common/Button';

interface TopUpFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

const TopUpForm: React.FC<TopUpFormProps> = ({ onSuccess, onError }) => {
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [errors, setErrors] = useState<{ amount?: string; paymentMethod?: string }>({});

  // Predefined amount options
  const amountOptions = [
    { label: 'Rp 50,000', value: 50000 },
    { label: 'Rp 100,000', value: 100000 },
    { label: 'Rp 250,000', value: 250000 },
    { label: 'Rp 500,000', value: 500000 },
    { label: 'Rp 1,000,000', value: 1000000 },
  ];

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoadingMethods(true);
      const methods = await getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error: any) {
      onError(error.response?.data?.error?.message || 'Failed to load payment methods');
    } finally {
      setLoadingMethods(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { amount?: string; paymentMethod?: string } = {};

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum)) {
      newErrors.amount = 'Amount is required';
    } else if (amountNum < 10000) {
      newErrors.amount = 'Minimum top up amount is Rp 10,000';
    } else if (amountNum > 10000000) {
      newErrors.amount = 'Maximum top up amount is Rp 10,000,000';
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await createTopUp({
        amount: parseFloat(amount),
        payment_method: paymentMethod,
      });
      
      // Reset form
      setAmount('');
      setPaymentMethod('');
      setErrors({});
      
      onSuccess();
    } catch (error: any) {
      onError(error.response?.data?.error?.message || 'Failed to create top up request');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountOptionClick = (value: number) => {
    setAmount(value.toString());
    setErrors({ ...errors, amount: undefined });
  };

  const formatCurrency = (value: string): string => {
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pilih Nominal Top Up
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {amountOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleAmountOptionClick(option.value)}
              className={`px-4 py-3 border rounded-lg text-sm font-medium transition-colors ${
                amount === option.value.toString()
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Atau Masukkan Nominal Lain
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setErrors({ ...errors, amount: undefined });
            }}
            placeholder="Masukkan nominal"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.amount ? 'border-red-500' : 'border-gray-300'
            }`}
            min="10000"
            max="10000000"
            step="1000"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
          {amount && !errors.amount && (
            <p className="mt-1 text-sm text-gray-600">
              {formatCurrency(amount)}
            </p>
          )}
        </div>
      </div>

      {/* Payment Method Selection */}
      <div>
        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
          Metode Pembayaran
        </label>
        {loadingMethods ? (
          <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
            <p className="text-gray-500">Loading payment methods...</p>
          </div>
        ) : (
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setErrors({ ...errors, paymentMethod: undefined });
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.paymentMethod ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Pilih metode pembayaran</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        )}
        {errors.paymentMethod && (
          <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
        )}
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Informasi Penting:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Minimum top up: Rp 10,000</li>
          <li>Maximum top up: Rp 10,000,000</li>
          <li>Proses verifikasi pembayaran 1-24 jam</li>
          <li>Saldo akan otomatis masuk setelah pembayaran terverifikasi</li>
        </ul>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        loading={loading}
        disabled={loadingMethods}
        className="w-full py-3"
      >
        Submit Top Up
      </Button>
    </form>
  );
};

export default TopUpForm;

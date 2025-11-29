import React from 'react';
import { z } from 'zod';
import NominalSelector from './NominalSelector';
import Button from '../../../../shared/components/Button';
import { MIN_TOPUP_AMOUNT, MAX_TOPUP_AMOUNT } from '../../utils/constants';

// Zod validation schema - only amount now
const topUpSchema = z.object({
  amount: z
    .number()
    .min(MIN_TOPUP_AMOUNT, `Minimal top up Rp ${MIN_TOPUP_AMOUNT.toLocaleString('id-ID')}`)
    .max(MAX_TOPUP_AMOUNT, `Maksimal top up Rp ${MAX_TOPUP_AMOUNT.toLocaleString('id-ID')}`),
});

export interface TopUpFormProps {
  onAmountChange: (amount: number) => void;
}

const TopUpForm: React.FC<TopUpFormProps> = ({ onAmountChange }) => {
  const [amount, setAmount] = React.useState<number>(0);
  const [errors, setErrors] = React.useState<{
    amount?: string;
  }>({});

  const handleAmountChange = (newAmount: number) => {
    setAmount(newAmount);
    
    // Validate
    const result = topUpSchema.safeParse({ amount: newAmount });
    
    if (!result.success) {
      const fieldErrors: { amount?: string } = {};
      result.error.issues.forEach((err: any) => {
        const field = err.path[0] as 'amount';
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      onAmountChange(0); // Invalid amount
    } else {
      setErrors({});
      onAmountChange(newAmount); // Valid amount
    }
  };

  return (
    <div className="space-y-6">
      {/* Nominal Selection */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
        <NominalSelector
          selectedAmount={amount}
          onAmountChange={handleAmountChange}
          error={errors.amount}
        />
      </div>

      {/* Amount Display */}
      {amount > 0 && !errors.amount && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Jumlah Top-Up</p>
              <p className="text-2xl font-bold text-blue-600">
                Rp {amount.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="text-xs text-gray-500">
              Pilih metode pembayaran ↓
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopUpForm;

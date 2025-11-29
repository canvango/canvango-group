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

export type TopUpFormData = z.infer<typeof topUpSchema>;

export interface TopUpFormProps {
  onSubmit: (data: TopUpFormData) => void | Promise<void>;
  loading?: boolean;
}

const TopUpForm: React.FC<TopUpFormProps> = ({ onSubmit, loading = false }) => {
  const [amount, setAmount] = React.useState<number>(0);
  const [errors, setErrors] = React.useState<{
    amount?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});

    // Validate form data
    const result = topUpSchema.safeParse({
      amount,
    });

    if (!result.success) {
      // Extract errors from Zod validation
      const fieldErrors: { amount?: string } = {};
      result.error.issues.forEach((err: any) => {
        const field = err.path[0] as 'amount';
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Submit valid data
    await onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nominal Selection */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
        <NominalSelector
          selectedAmount={amount}
          onAmountChange={setAmount}
          error={errors.amount}
        />
      </div>

      {/* Submit Button */}
      {amount > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Jumlah Top-Up</p>
              <p className="text-3xl font-bold text-blue-600">
                Rp {amount.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Pilih metode pembayaran di bawah
              </p>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading}
              className="w-full sm:w-auto min-w-[200px] shadow-lg hover:shadow-xl"
            >
              {loading ? 'Memproses...' : 'Lanjutkan'}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
};

export default TopUpForm;

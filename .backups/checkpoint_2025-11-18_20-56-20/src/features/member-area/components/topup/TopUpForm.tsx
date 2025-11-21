import React from 'react';
import { z } from 'zod';
import NominalSelector from './NominalSelector';
import PaymentMethodSelector from './PaymentMethodSelector';
import Button from '../../../../shared/components/Button';
import { MIN_TOPUP_AMOUNT, MAX_TOPUP_AMOUNT } from '../../utils/constants';

// Zod validation schema
const topUpSchema = z.object({
  amount: z
    .number()
    .min(MIN_TOPUP_AMOUNT, `Minimal top up ${MIN_TOPUP_AMOUNT.toLocaleString('id-ID')}`)
    .max(MAX_TOPUP_AMOUNT, `Maksimal top up ${MAX_TOPUP_AMOUNT.toLocaleString('id-ID')}`),
  paymentMethod: z.string().min(1, 'Pilih metode pembayaran')
});

export type TopUpFormData = z.infer<typeof topUpSchema>;

export interface TopUpFormProps {
  onSubmit: (data: TopUpFormData) => void | Promise<void>;
  loading?: boolean;
}

const TopUpForm: React.FC<TopUpFormProps> = ({ onSubmit, loading = false }) => {
  const [amount, setAmount] = React.useState<number>(0);
  const [paymentMethod, setPaymentMethod] = React.useState<string>('');
  const [errors, setErrors] = React.useState<{
    amount?: string;
    paymentMethod?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});

    // Validate form data
    const result = topUpSchema.safeParse({
      amount,
      paymentMethod
    });

    if (!result.success) {
      // Extract errors from Zod validation
      const fieldErrors: { amount?: string; paymentMethod?: string } = {};
      result.error.issues.forEach((err: any) => {
        const field = err.path[0] as 'amount' | 'paymentMethod';
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nominal Selection */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-md">
          <NominalSelector
            selectedAmount={amount}
            onAmountChange={setAmount}
            error={errors.amount}
          />
        </div>

        {/* Payment Method Selection */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-md">
          <PaymentMethodSelector
            selectedMethod={paymentMethod}
            onMethodChange={setPaymentMethod}
            error={errors.paymentMethod}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={loading}
          className="w-full lg:w-auto min-w-[200px]"
        >
          Top Up Sekarang
        </Button>
      </div>
    </form>
  );
};

export default TopUpForm;

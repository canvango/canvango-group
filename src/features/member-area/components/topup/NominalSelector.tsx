import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { TOPUP_AMOUNTS, MIN_TOPUP_AMOUNT } from '../../utils/constants';
import Input from '../../../../shared/components/Input';

export interface NominalSelectorProps {
  selectedAmount: number;
  onAmountChange: (amount: number) => void;
  error?: string;
}

const NominalSelector: React.FC<NominalSelectorProps> = ({
  selectedAmount,
  onAmountChange,
  error
}) => {
  const [customAmount, setCustomAmount] = React.useState<string>('');

  const handlePredefinedClick = (amount: number) => {
    // Set the custom amount field to show the selected value
    setCustomAmount(amount.toLocaleString('id-ID'));
    onAmountChange(amount);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove all non-digit characters
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue === '') {
      setCustomAmount('');
      onAmountChange(0);
      return;
    }
    
    const numValue = parseInt(cleanValue, 10);
    if (!isNaN(numValue)) {
      // Format with thousand separators
      setCustomAmount(numValue.toLocaleString('id-ID'));
      onAmountChange(numValue);
    }
  };

  const formatAmountFull = (amount: number): string => {
    return amount.toLocaleString('id-ID');
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Pilih Nominal</h3>
        <div className="grid grid-cols-2 gap-3">
          {TOPUP_AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => handlePredefinedClick(amount)}
              className={`
                px-4 py-3.5 rounded-xl border-2 font-semibold text-sm transition-all duration-200
                ${
                  selectedAmount === amount
                    ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-md ring-2 ring-primary-100'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400 hover:bg-primary-50 hover:shadow-sm'
                }
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                active:scale-[0.98]
              `}
            >
              Rp {formatAmountFull(amount)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Input
          type="text"
          label="Nominal Lainnya"
          placeholder="Masukkan nominal (contoh: 75000)"
          value={customAmount}
          onChange={handleCustomAmountChange}
          error={error}
          helperText={customAmount ? `Total: Rp ${formatAmountFull(selectedAmount)}` : `Minimal Rp ${formatAmountFull(MIN_TOPUP_AMOUNT)}`}
          leftAddon="Rp"
        />
      </div>
    </div>
  );
};

export default NominalSelector;

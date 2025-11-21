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
    setCustomAmount('');
    onAmountChange(amount);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomAmount(value);
    
    const numValue = parseInt(value.replace(/\D/g, ''), 10);
    if (!isNaN(numValue)) {
      onAmountChange(numValue);
    } else if (value === '') {
      onAmountChange(0);
    }
  };

  const formatAmountShort = (amount: number): string => {
    if (amount >= 1000000) {
      return `${amount / 1000000}Jt`;
    } else if (amount >= 1000) {
      return `${amount / 1000}K`;
    }
    return amount.toString();
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Pilih Nominal</h3>
        <div className="grid grid-cols-2 gap-3">
          {TOPUP_AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => handlePredefinedClick(amount)}
              className={`
                px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all duration-200
                ${
                  selectedAmount === amount && !customAmount
                    ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400 hover:bg-primary-50'
                }
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              `}
            >
              Rp {formatAmountShort(amount)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Input
          type="text"
          label="Nominal Lainnya"
          placeholder="Masukkan nominal"
          value={customAmount}
          onChange={handleCustomAmountChange}
          error={error}
          helperText={`Minimal ${formatCurrency(MIN_TOPUP_AMOUNT)}`}
        />
        {customAmount && !error && (
          <p className="mt-2 text-sm text-gray-600">
            Total: <span className="font-semibold text-primary-600">{formatCurrency(selectedAmount)}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default NominalSelector;

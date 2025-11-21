import React from 'react';
import { CreditCard, Wallet, Building2, QrCode } from 'lucide-react';

export interface PaymentMethod {
  id: string;
  name: string;
  category: 'ewallet' | 'va';
  logo?: string;
}

export interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (methodId: string) => void;
  error?: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
  error
}) => {
  const paymentMethods: PaymentMethod[] = [
    // E-Wallet
    { id: 'qris', name: 'QRIS', category: 'ewallet' },
    
    // Virtual Account
    { id: 'bri_va', name: 'BRI Virtual Account', category: 'va' },
    { id: 'bca_va', name: 'BCA Virtual Account', category: 'va' },
    { id: 'bni_va', name: 'BNI Virtual Account', category: 'va' },
    { id: 'mandiri_va', name: 'Mandiri Virtual Account', category: 'va' },
    { id: 'danamon_va', name: 'Danamon Virtual Account', category: 'va' },
    { id: 'other_va', name: 'Bank Lainnya', category: 'va' }
  ];

  const ewalletMethods = paymentMethods.filter(m => m.category === 'ewallet');
  const vaMethods = paymentMethods.filter(m => m.category === 'va');

  const getMethodIcon = (methodId: string) => {
    if (methodId === 'qris') return <QrCode className="w-5 h-5" />;
    return <Building2 className="w-5 h-5" />;
  };

  const renderMethodCard = (method: PaymentMethod) => (
    <button
      key={method.id}
      type="button"
      onClick={() => onMethodChange(method.id)}
      className={`
        w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
        flex items-center gap-3
        ${
          selectedMethod === method.id
            ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm'
            : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400 hover:bg-primary-50'
        }
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
      `}
    >
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
        ${selectedMethod === method.id ? 'bg-primary-100' : 'bg-gray-100'}
      `}>
        {getMethodIcon(method.id)}
      </div>
      <span className="text-sm font-medium text-left">{method.name}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Metode Pembayaran</h3>
        
        {/* E-Wallet Section */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-4 h-4 text-gray-500" />
            <h4 className="text-xs font-semibold text-gray-600 uppercase">E-Wallet</h4>
          </div>
          <div className="space-y-2">
            {ewalletMethods.map(renderMethodCard)}
          </div>
        </div>

        {/* Virtual Account Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-gray-500" />
            <h4 className="text-xs font-semibold text-gray-600 uppercase">Virtual Account</h4>
          </div>
          <div className="space-y-2">
            {vaMethods.map(renderMethodCard)}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default PaymentMethodSelector;

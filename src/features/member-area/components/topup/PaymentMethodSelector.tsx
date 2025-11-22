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
            ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-md ring-2 ring-primary-100'
            : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400 hover:bg-primary-50 hover:shadow-sm'
        }
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        active:scale-[0.98]
      `}
    >
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors
        ${selectedMethod === method.id ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}
      `}>
        {getMethodIcon(method.id)}
      </div>
      <span className="text-sm font-semibold text-left">{method.name}</span>
      {selectedMethod === method.id && (
        <svg className="w-5 h-5 ml-auto text-primary-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Metode Pembayaran</h3>
        
        {/* E-Wallet Section */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-green-100 p-1.5 rounded-lg">
              <Wallet className="w-4 h-4 text-green-600" />
            </div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">E-Wallet</h4>
          </div>
          <div className="space-y-2">
            {ewalletMethods.map(renderMethodCard)}
          </div>
        </div>

        {/* Virtual Account Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-100 p-1.5 rounded-lg">
              <CreditCard className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Virtual Account</h4>
          </div>
          <div className="space-y-2">
            {vaMethods.map(renderMethodCard)}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-sm text-red-700 font-medium" role="alert">
            {error}
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;

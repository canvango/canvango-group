import React, { useState } from 'react';
import { usePaymentMethods, useCreatePayment } from '@/hooks/useTripay';
import { calculateTotalAmount } from '@/services/tripay.service';
import { X, CreditCard, Loader2 } from 'lucide-react';

interface TripayPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  orderItems: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}

export const TripayPaymentModal: React.FC<TripayPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  customerName,
  customerEmail,
  customerPhone,
  orderItems,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  
  const { data: paymentMethods, isLoading: loadingMethods } = usePaymentMethods();
  const createPayment = useCreatePayment();

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (!selectedMethod) {
      alert('Pilih metode pembayaran terlebih dahulu');
      return;
    }

    try {
      await createPayment.mutateAsync({
        amount,
        paymentMethod: selectedMethod,
        customerName,
        customerEmail,
        customerPhone,
        orderItems,
      });
      
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  const selectedMethodData = paymentMethods?.find(m => m.code === selectedMethod);
  const totalAmount = selectedMethodData 
    ? calculateTotalAmount(amount, selectedMethodData)
    : amount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Pilih Metode Pembayaran</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Amount Summary */}
          <div className="bg-blue-50 rounded-2xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-700">Jumlah Top-Up</span>
              <span className="text-sm font-medium text-gray-900">
                Rp {amount.toLocaleString('id-ID')}
              </span>
            </div>
            {selectedMethodData && (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-700">Biaya Admin</span>
                  <span className="text-sm font-medium text-gray-900">
                    Rp {(totalAmount - amount).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                  <span className="text-sm font-semibold text-gray-900">Total Bayar</span>
                  <span className="text-lg font-bold text-blue-600">
                    Rp {totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Payment Methods */}
          {loadingMethods ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Metode Pembayaran
              </h3>
              
              {paymentMethods?.map((method) => (
                <button
                  key={method.code}
                  onClick={() => setSelectedMethod(method.code)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    selectedMethod === method.code
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={method.icon_url}
                      alt={method.name}
                      className="w-12 h-12 object-contain"
                    />
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {method.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Biaya: Rp {method.fee_merchant.flat.toLocaleString('id-ID')}
                        {method.fee_merchant.percent > 0 && ` + ${method.fee_merchant.percent}%`}
                      </div>
                    </div>
                  </div>
                  
                  {selectedMethod === method.code && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handlePayment}
            disabled={!selectedMethod || createPayment.isPending}
            className="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {createPayment.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Bayar Sekarang
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

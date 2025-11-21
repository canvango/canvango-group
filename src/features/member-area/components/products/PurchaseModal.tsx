import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, AlertCircle, Minus, Plus } from 'lucide-react';
import { Product } from '../../types/product';
import { useQuery } from '@tanstack/react-query';
import { fetchUserProfile } from '../../services/user.service';
import MetaInfinityLogo from '../icons/MetaInfinityLogo';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onConfirm: (quantity: number) => void;
  isProcessing?: boolean;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirm,
  isProcessing = false,
}) => {
  const [quantity, setQuantity] = useState(1);

  // Fetch user balance
  const { data: userProfile, isLoading: isLoadingProfile, error: profileError } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
    staleTime: 30 * 1000, // 30 seconds
    retry: 3,
  });

  // Log immediately when modal opens
  React.useEffect(() => {
    if (isOpen) {
      console.log('🔍 PurchaseModal opened, checking userProfile:', {
        userProfile,
        isLoadingProfile,
        profileError: profileError?.message,
        hasData: !!userProfile,
        balance: userProfile?.balance
      });
    }
  }, [isOpen, userProfile, isLoadingProfile, profileError]);

  // Ensure balance is a number, handle string conversion
  const rawBalance = userProfile?.balance;
  const userBalance = typeof rawBalance === 'string' ? parseFloat(rawBalance) : (rawBalance || 0);
  const totalPrice = product.price * quantity;
  const isInsufficientBalance = userBalance < totalPrice;

  // Debug logging
  useEffect(() => {
    if (isOpen) {
      console.log('💰 PurchaseModal Debug:', {
        userProfile,
        rawBalance,
        userBalance,
        userBalanceType: typeof userBalance,
        productPrice: product.price,
        productPriceType: typeof product.price,
        quantity,
        totalPrice,
        totalPriceType: typeof totalPrice,
        isInsufficientBalance,
        comparison: `${userBalance} < ${totalPrice} = ${isInsufficientBalance}`,
        isLoadingProfile
      });
    }
  }, [isOpen, userProfile, rawBalance, userBalance, product.price, quantity, totalPrice, isInsufficientBalance, isLoadingProfile]);

  // Reset quantity when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen]);

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleConfirm = () => {
    // Prevent double submission
    if (isInsufficientBalance || isProcessing) {
      return;
    }
    onConfirm(quantity);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg max-h-[85vh] md:max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Drag Handle - Mobile only */}
        <div className="md:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-3 md:px-6 py-2 md:py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-primary-600" />
            <h2 className="text-base md:text-lg font-bold text-gray-900">Beli Akun</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isProcessing}
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-4 md:space-y-5">
          {/* Product Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary-100 flex items-center justify-center">
              <MetaInfinityLogo className="w-10 h-6 md:w-12 md:h-8 text-primary-600" />
            </div>
          </div>

          {/* Product Info */}
          <div className="text-center">
            <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1">
              {product.title}
            </h3>
            <p className="text-xs md:text-sm text-gray-500">
              Kategori: {product.category === 'bm' ? 'BM VERIFIED' : 'PERSONAL ACCOUNT'}
            </p>
          </div>

          {/* Detail Pembelian */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700">
              <div className="w-4 h-4 md:w-5 md:h-5 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-xs">📋</span>
              </div>
              <span className="text-sm md:text-base font-semibold">Detail Pembelian</span>
            </div>

            {/* Harga Satuan */}
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm text-gray-600">Harga Satuan</span>
              <span className="text-xs md:text-sm font-bold text-gray-900">
                {formatCurrency(product.price)}
              </span>
            </div>

            {/* Stok Tersedia */}
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm text-gray-600">Stok Tersedia</span>
              <span className="text-xs md:text-sm font-bold text-gray-900">
                {product.stock} Akun
              </span>
            </div>

            {/* Jumlah Beli */}
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm text-gray-600">Jumlah Beli</span>
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={handleDecrement}
                  disabled={quantity <= 1 || isProcessing}
                  className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg md:text-xl font-bold text-gray-900 min-w-[2rem] md:min-w-[2.5rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={quantity >= product.stock || isProcessing}
                  className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-2xl p-3 md:p-4 space-y-2 md:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm text-gray-600">Saldo Anda</span>
              <span className="text-xs md:text-sm font-semibold text-gray-900">
                {formatCurrency(userBalance)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm md:text-base font-semibold text-gray-700">Total Pembayaran</span>
              <span className="text-lg md:text-xl font-bold text-primary-600">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>

          {/* Insufficient Balance Warning */}
          {isInsufficientBalance && (
            <div className="bg-pink-50 border border-pink-200 rounded-2xl p-3 md:p-4 flex items-start gap-2 md:gap-3">
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-pink-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs md:text-sm text-pink-700">
                Saldo Anda tidak mencukupi untuk pembelian ini.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-3 md:px-6 py-3 md:py-4 flex gap-2 md:gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-3 md:px-4 py-2 md:py-3 text-sm md:text-base rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Kembali
          </button>
          <button
            onClick={handleConfirm}
            disabled={isInsufficientBalance || isProcessing}
            className="flex-1 px-3 md:px-4 py-2 md:py-3 text-sm md:text-base rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span className="text-xs md:text-sm">Processing...</span>
              </span>
            ) : (
              <span className="text-xs md:text-sm">✓ Konfirmasi Pembelian</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;

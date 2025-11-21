import React, { useEffect } from 'react';
import { X, ShoppingCart, ArrowLeft, Settings } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faExclamationTriangle, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import Button from '../../../../shared/components/Button';
import { Product } from '../../types/product';

/**
 * Props for ProductDetailModal component
 */
export interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onBuyNow: (productId: string) => void;
}

/**
 * ProductDetailModal - Modal untuk menampilkan detail lengkap produk
 * 
 * @description
 * Modal yang menampilkan informasi detail produk termasuk harga, stok,
 * fitur, dan garansi. Dilengkapi dengan tombol untuk membeli atau kembali.
 * 
 * @component
 */
const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onBuyNow,
}) => {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'bm':
        return 'Business Manager';
      case 'personal':
        return 'Personal Account';
      default:
        return category;
    }
  };

  const isOutOfStock = product.stock === 0;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the backdrop, not on modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] backdrop-blur-md"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Modal Content - Centered on all devices */}
      <div className="fixed inset-0 flex items-center justify-center p-3 md:p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg max-h-[85vh] md:max-h-[90vh] overflow-y-auto border border-gray-200">
          {/* Drag Handle - Mobile only */}
          <div className="md:hidden flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
          </div>
          
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-3 md:px-6 py-2 md:py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-7 h-7 md:w-10 md:h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Settings className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary-600" />
            </div>
            <h2 id="modal-title" className="text-base md:text-xl font-bold text-gray-900">
              Detail Akun
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-3 md:px-6 py-3 md:py-6 space-y-3 md:space-y-6">
          {/* Hero Section */}
          <div className="text-center space-y-2 md:space-y-4">
            <div className="w-16 h-16 md:w-24 md:h-24 mx-auto bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
              <div className="w-11 h-11 md:w-16 md:h-16 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg md:text-2xl font-bold">∞</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
                {product.title}
              </h3>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed max-w-xl mx-auto px-2">
                {product.description}
              </p>
            </div>
          </div>

          {/* Detail Section */}
          <div className="bg-gray-50 rounded-xl p-3 md:p-6 space-y-2 md:space-y-4">
            <div className="flex items-center gap-2 mb-2 md:mb-4">
              <Settings className="w-3.5 h-3.5 md:w-5 md:h-5 text-gray-600" />
              <h4 className="text-sm md:text-lg font-semibold text-gray-900">
                Detail Akun & Harga
              </h4>
            </div>

            {/* Detail Items */}
            <div className="space-y-1.5 md:space-y-3">
              {/* Harga Satuan */}
              <div className="flex items-center justify-between py-1.5 md:py-2 border-b border-gray-200">
                <span className="text-xs md:text-base text-gray-600">Harga Satuan</span>
                <span className="text-primary-600 font-bold text-sm md:text-lg">
                  {formatPrice(product.price)}
                </span>
              </div>

              {/* Kategori */}
              <div className="flex items-center justify-between py-1.5 md:py-2 border-b border-gray-200">
                <span className="text-xs md:text-base text-gray-600">Kategori</span>
                <span className="text-xs md:text-base text-gray-900 font-semibold">
                  {getCategoryTitle(product.category)}
                </span>
              </div>

              {/* Tipe */}
              {product.type && (
                <div className="flex items-center justify-between py-1.5 md:py-2 border-b border-gray-200">
                  <span className="text-xs md:text-base text-gray-600">Tipe</span>
                  <span className="text-xs md:text-base text-gray-900 font-semibold">
                    {product.type}
                  </span>
                </div>
              )}

              {/* Status Ketersediaan */}
              <div className="flex items-center justify-between py-1.5 md:py-2 border-b border-gray-200">
                <span className="text-xs md:text-base text-gray-600">Status Ketersediaan</span>
                <span className={`text-xs md:text-base font-semibold ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                  {isOutOfStock ? 'Habis' : `${product.stock} Tersedia`}
                </span>
              </div>

              {/* Garansi */}
              {product.warranty?.enabled && (
                <div className="flex items-center justify-between py-1.5 md:py-2">
                  <span className="text-xs md:text-base text-gray-600">Periode Garansi</span>
                  <span className="text-xs md:text-base text-gray-900 font-semibold">
                    {product.warranty.duration} Hari
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Keunggulan Produk */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-7 h-7 md:w-9 md:h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon={faThumbsUp} className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" />
                </div>
                <h4 className="text-sm md:text-base font-semibold text-gray-900">
                  Keunggulan Produk
                </h4>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3 md:p-4">
                <ul className="space-y-1.5 md:space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 text-sm md:text-base flex-shrink-0">✓</span>
                      <span className="text-gray-700 text-xs md:text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Kekurangan & Peringatan */}
          {product.limitations && product.limitations.length > 0 && (
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-7 h-7 md:w-9 md:h-9 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-600" />
                </div>
                <h4 className="text-sm md:text-base font-semibold text-gray-900">
                  Kekurangan & Peringatan
                </h4>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3 md:p-4">
                <ul className="space-y-1.5 md:space-y-2">
                  {product.limitations.map((limitation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5 text-sm md:text-base flex-shrink-0">✕</span>
                      <span className="text-gray-700 text-xs md:text-sm leading-relaxed">{limitation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Garansi & Ketentuan */}
          {product.warranty?.enabled && product.warranty.terms && product.warranty.terms.length > 0 && (
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-7 h-7 md:w-9 md:h-9 bg-green-100 rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon={faShieldAlt} className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" />
                </div>
                <h4 className="text-sm md:text-base font-semibold text-gray-900">
                  Garansi & Ketentuan
                </h4>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3 md:p-4 space-y-2 md:space-y-3">
                <p className="text-xs md:text-sm font-medium text-gray-900">
                  Syarat & Ketentuan Berlaku:
                </p>
                <ul className="space-y-1.5 md:space-y-2">
                  {product.warranty.terms.map((term, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 text-sm md:text-base flex-shrink-0">✓</span>
                      <span className="text-gray-700 text-xs md:text-sm leading-relaxed">{term}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-3 md:px-6 py-2.5 md:py-4 flex gap-2 md:gap-3 rounded-b-2xl">
          <Button
            variant="outline"
            size="md"
            className="flex-1"
            onClick={onClose}
          >
            <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2" />
            <span className="text-xs md:text-base">Kembali</span>
          </Button>
          
          <Button
            variant={isOutOfStock ? 'danger' : 'primary'}
            size="md"
            className="flex-1"
            onClick={() => !isOutOfStock && onBuyNow(product.id)}
            disabled={isOutOfStock}
          >
            <ShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2" />
            <span className="text-xs md:text-base">{isOutOfStock ? 'Sold Out' : 'Beli Sekarang'}</span>
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;

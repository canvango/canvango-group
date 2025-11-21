import React, { useEffect } from 'react';
import { X, ShoppingCart, ArrowLeft, Settings } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faExclamationTriangle, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { faMeta } from '@fortawesome/free-brands-svg-icons';
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
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg md:max-w-2xl max-h-[85vh] md:max-h-[90vh] overflow-y-auto border border-gray-200">
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
          <div className="text-center space-y-2 md:space-y-3">
            <div className="w-14 h-14 md:w-20 md:h-20 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-600 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faMeta} className="text-white text-lg md:text-2xl" />
              </div>
            </div>
            
            <div>
              <h3 className="text-base md:text-xl font-bold text-gray-900 mb-1">
                {product.title}
              </h3>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed max-w-xl mx-auto px-2">
                {product.description}
              </p>
            </div>
          </div>

          {/* Detail Section - Merged with Dynamic Fields */}
          <div className="bg-gray-50 rounded-xl p-4 md:p-5 space-y-2 md:space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              <h4 className="text-sm md:text-base font-semibold text-gray-900">
                Detail Akun & Harga
              </h4>
            </div>

            {/* Detail Items */}
            <div className="space-y-2 md:space-y-2.5">
              {/* Harga Satuan */}
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm md:text-sm text-gray-600">Harga Satuan</span>
                <span className="text-primary-600 font-bold text-base md:text-base">
                  {formatPrice(product.price)}
                </span>
              </div>

              {/* Dynamic Detail Fields - Integrated */}
              {product.detail_fields && product.detail_fields.length > 0 && (
                <>
                  {product.detail_fields.map((field, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-sm md:text-sm text-gray-600">
                        {field.label}
                      </span>
                      <span className="text-sm md:text-sm text-gray-900 font-semibold">
                        {field.value}
                      </span>
                    </div>
                  ))}
                </>
              )}

              {/* Limit Iklan - Only show if no dynamic fields or not in dynamic fields */}
              {product.ad_limit && (
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm md:text-sm text-gray-600">Limit Iklan</span>
                  <span className="text-sm md:text-sm text-gray-900 font-semibold">
                    {product.ad_limit}
                  </span>
                </div>
              )}

              {/* Verifikasi */}
              {product.verification_status && (
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm md:text-sm text-gray-600">Verifikasi</span>
                  <span className="text-sm md:text-sm text-gray-900 font-semibold">
                    {product.verification_status}
                  </span>
                </div>
              )}

              {/* Akun Iklan */}
              {product.ad_account_type && (
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm md:text-sm text-gray-600">Akun Iklan</span>
                  <span className="text-sm md:text-sm text-gray-900 font-semibold">
                    {product.ad_account_type}
                  </span>
                </div>
              )}

              {/* Status Ketersediaan */}
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm md:text-sm text-gray-600">Status Ketersediaan</span>
                <span className={`text-sm md:text-sm font-semibold ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                  {isOutOfStock ? 'Habis' : `${product.stock} Tersedia`}
                </span>
              </div>

              {/* Garansi */}
              {product.warranty?.enabled && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm md:text-sm text-gray-600">Periode Garansi</span>
                  <span className="text-sm md:text-sm text-gray-900 font-semibold">
                    {product.warranty.duration} Hari
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Keunggulan Produk */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon={faThumbsUp} className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <h4 className="text-sm md:text-sm font-semibold text-gray-900">
                  Keunggulan Produk
                </h4>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3 md:p-4">
                <ul className="space-y-1.5">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 text-sm flex-shrink-0">✓</span>
                      <span className="text-gray-700 text-xs md:text-xs leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Kekurangan & Peringatan */}
          {product.limitations && product.limitations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="w-3.5 h-3.5 text-yellow-600" />
                </div>
                <h4 className="text-sm md:text-sm font-semibold text-gray-900">
                  Kekurangan & Peringatan
                </h4>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3 md:p-4">
                <ul className="space-y-1.5">
                  {product.limitations.map((limitation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5 text-sm flex-shrink-0">✕</span>
                      <span className="text-gray-700 text-xs md:text-xs leading-relaxed">{limitation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Garansi & Ketentuan */}
          {product.warranty?.enabled && product.warranty.terms && product.warranty.terms.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-green-100 rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon={faShieldAlt} className="w-3.5 h-3.5 text-green-600" />
                </div>
                <h4 className="text-sm md:text-sm font-semibold text-gray-900">
                  Garansi & Ketentuan
                </h4>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3 md:p-4 space-y-2">
                <p className="text-xs md:text-xs font-medium text-gray-900">
                  Syarat & Ketentuan Berlaku:
                </p>
                <ul className="space-y-1.5">
                  {product.warranty.terms.map((term, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 text-sm flex-shrink-0">✓</span>
                      <span className="text-gray-700 text-xs md:text-xs leading-relaxed">{term}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 md:px-6 py-3 md:py-3.5 flex gap-2 md:gap-3 rounded-b-2xl">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onClose}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            <span className="text-sm">Kembali</span>
          </Button>
          
          <Button
            variant={isOutOfStock ? 'danger' : 'primary'}
            size="sm"
            className="flex-1"
            onClick={() => !isOutOfStock && onBuyNow(product.id)}
            disabled={isOutOfStock}
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
            <span className="text-sm">{isOutOfStock ? 'Sold Out' : 'Beli Sekarang'}</span>
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;

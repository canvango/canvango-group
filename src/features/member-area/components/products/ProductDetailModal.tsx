import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingCart, ArrowLeft, Settings } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faExclamationTriangle, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { faMeta } from '@fortawesome/free-brands-svg-icons';
import Button from '../../../../shared/components/Button';
import { Product } from '../../types/product';
import { useAuth } from '../../contexts/AuthContext';

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
  const { isGuest } = useAuth();
  const navigate = useNavigate();

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
      className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Modal Content - Centered & Compact */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md md:max-w-lg max-h-[85vh] flex flex-col border border-gray-200 overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 md:px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-100 rounded-xl flex items-center justify-center">
              <Settings className="w-3.5 h-3.5 text-primary-600" />
            </div>
            <h2 id="modal-title" className="text-sm font-semibold text-gray-900">
              Detail Akun
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-xl hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body - Scrollable with custom scrollbar */}
        <div className="flex-1 overflow-y-auto scrollbar-thin pr-1">
          <div className="px-4 md:px-5 py-3 space-y-4">
          {/* Hero Section - Compact */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon={faMeta} className="text-white text-base" />
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                {product.title}
              </h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>

          {/* Detail Section - Compact */}
          <div className="bg-gray-50 rounded-2xl p-3 space-y-2">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Settings className="w-3.5 h-3.5 text-gray-600" />
              <h4 className="text-xs font-semibold text-gray-900">
                Detail Akun & Harga
              </h4>
            </div>

            {/* Detail Items - Compact spacing */}
            <div className="space-y-0">
              {/* Harga Satuan */}
              <div className="flex items-center justify-between py-1.5 border-b border-gray-200">
                <span className="text-xs text-gray-600">Harga Satuan</span>
                {isGuest ? (
                  <span className="text-xs text-blue-600 font-bold">
                    Login untuk melihat harga
                  </span>
                ) : (
                  <span className="text-primary-600 font-bold text-xs">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Dynamic Detail Fields - Integrated */}
              {product.detail_fields && product.detail_fields.length > 0 && (
                <>
                  {product.detail_fields.map((field, index) => (
                    <div key={index} className="flex items-center justify-between py-1.5 border-b border-gray-200">
                      <span className="text-xs text-gray-600">
                        {field.label}
                      </span>
                      <span className="text-xs text-gray-900 font-medium">
                        {field.value}
                      </span>
                    </div>
                  ))}
                </>
              )}

              {/* Limit Iklan */}
              {product.ad_limit && (
                <div className="flex items-center justify-between py-1.5 border-b border-gray-200">
                  <span className="text-xs text-gray-600">Limit Iklan</span>
                  <span className="text-xs text-gray-900 font-medium">
                    {product.ad_limit}
                  </span>
                </div>
              )}

              {/* Verifikasi */}
              {product.verification_status && (
                <div className="flex items-center justify-between py-1.5 border-b border-gray-200">
                  <span className="text-xs text-gray-600">Verifikasi</span>
                  <span className="text-xs text-gray-900 font-medium">
                    {product.verification_status}
                  </span>
                </div>
              )}

              {/* Akun Iklan */}
              {product.ad_account_type && (
                <div className="flex items-center justify-between py-1.5 border-b border-gray-200">
                  <span className="text-xs text-gray-600">Akun Iklan</span>
                  <span className="text-xs text-gray-900 font-medium">
                    {product.ad_account_type}
                  </span>
                </div>
              )}

              {/* Status Ketersediaan */}
              <div className="flex items-center justify-between py-1.5 border-b border-gray-200">
                <span className="text-xs text-gray-600">Status Ketersediaan</span>
                <span className={`text-xs font-medium ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                  {isOutOfStock ? 'Habis' : `${product.stock} Tersedia`}
                </span>
              </div>

              {/* Garansi */}
              {product.warranty?.enabled && (
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-gray-600">Periode Garansi</span>
                  <span className="text-xs text-gray-900 font-medium">
                    {product.warranty.duration} Hari
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Keunggulan Produk - Compact */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faThumbsUp} className="w-2.5 h-2.5 text-blue-600" />
                </div>
                <h4 className="text-xs font-semibold text-gray-900">
                  Keunggulan Produk
                </h4>
              </div>
              <div className="bg-gray-50 rounded-2xl p-2.5">
                <ul className="space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-1.5">
                      <span className="text-green-500 mt-0.5 text-xs flex-shrink-0">✓</span>
                      <span className="text-gray-700 text-xs leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Kekurangan & Peringatan - Compact */}
          {product.limitations && product.limitations.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="w-2.5 h-2.5 text-yellow-600" />
                </div>
                <h4 className="text-xs font-semibold text-gray-900">
                  Kekurangan & Peringatan
                </h4>
              </div>
              <div className="bg-gray-50 rounded-2xl p-2.5">
                <ul className="space-y-1">
                  {product.limitations.map((limitation, index) => (
                    <li key={index} className="flex items-start gap-1.5">
                      <span className="text-red-500 mt-0.5 text-xs flex-shrink-0">✕</span>
                      <span className="text-gray-700 text-xs leading-relaxed">{limitation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Garansi & Ketentuan - Compact */}
          {product.warranty?.enabled && product.warranty.terms && product.warranty.terms.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 bg-green-100 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faShieldAlt} className="w-2.5 h-2.5 text-green-600" />
                </div>
                <h4 className="text-xs font-semibold text-gray-900">
                  Garansi & Ketentuan
                </h4>
              </div>
              <div className="bg-gray-50 rounded-2xl p-2.5 space-y-1.5">
                <p className="text-xs font-medium text-gray-900">
                  Syarat & Ketentuan Berlaku:
                </p>
                <ul className="space-y-1">
                  {product.warranty.terms.map((term, index) => (
                    <li key={index} className="flex items-start gap-1.5">
                      <span className="text-green-500 mt-0.5 text-xs flex-shrink-0">✓</span>
                      <span className="text-gray-700 text-xs leading-relaxed">{term}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Footer Actions - Fixed */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 md:px-5 py-2 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9"
            onClick={onClose}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span className="text-xs font-medium">Kembali</span>
          </Button>
          
          <Button
            variant={isOutOfStock ? 'danger' : 'primary'}
            size="sm"
            className="flex-1 h-9"
            onClick={() => {
              if (isGuest) {
                navigate('/login');
              } else if (!isOutOfStock) {
                onBuyNow(product.id);
              }
            }}
            disabled={isOutOfStock}
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1" />
            <span className="text-xs font-medium">{isOutOfStock ? 'Sold Out' : 'Beli Sekarang'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;

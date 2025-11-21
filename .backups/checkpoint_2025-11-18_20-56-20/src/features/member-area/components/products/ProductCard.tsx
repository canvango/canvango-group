import React from 'react';
import Button from '../../../../shared/components/Button';
import Badge from '../../../../shared/components/Badge';
import { Product } from '../../types/product';
import MetaInfinityLogo from '../icons/MetaInfinityLogo';

/**
 * Props for the ProductCard component
 * 
 * @interface ProductCardProps
 * @property {Product} product - Product data to display
 * @property {(productId: string) => void} onBuy - Callback when Buy button is clicked
 * @property {(productId: string) => void} onViewDetails - Callback when Detail button is clicked
 */
export interface ProductCardProps {
  product: Product;
  onBuy: (productId: string) => void;
  onViewDetails: (productId: string) => void;
}

/**
 * ProductCard - Displays product information with purchase options
 * 
 * @description
 * Shows product details including category badge, icon, title, description,
 * price, stock status, and action buttons. Automatically handles out-of-stock
 * states by disabling the buy button and showing "Sold Out" message. Provides
 * visual feedback with hover effects and proper spacing for mobile devices.
 * 
 * @example
 * ```tsx
 * <ProductCard
 *   product={{
 *     id: '123',
 *     category: 'bm',
 *     title: 'BM Verified Account',
 *     description: 'Verified Business Manager account',
 *     price: 500000,
 *     stock: 10
 *   }}
 *   onBuy={(id) => handlePurchase(id)}
 *   onViewDetails={(id) => showProductDetails(id)}
 * />
 * ```
 * 
 * @component
 * @category Products
 * 
 * @accessibility
 * - All interactive elements keyboard accessible
 * - Stock status communicated with color and text
 * - Disabled state properly indicated
 * - Focus indicators visible
 * 
 * @performance
 * - Uses line-clamp for text truncation
 * - Optimized hover transitions
 * 
 * @see {@link ProductGrid} for displaying multiple product cards
 * @see {@link ProductDetailModal} for detailed product view
 * @see {@link Product} for product data structure
 */
const ProductCard: React.FC<ProductCardProps> = ({ product, onBuy, onViewDetails }) => {
  const isOutOfStock = product.stock === 0;
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'bm':
        return 'success';
      case 'personal':
        return 'success';
      default:
        return 'default';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'bm':
        return 'Business Manager';
      case 'personal':
        return 'Personal Account';
      default:
        return category;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden flex flex-col h-full">
      {/* Thumbnail Image */}
      <div className="relative w-full group" style={{ paddingTop: '60%' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center overflow-hidden">
          {/* Animated background glow on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-200 via-blue-200 to-primary-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Meta Infinity Logo with hover animation */}
          <div className="relative z-10 transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
            <MetaInfinityLogo className="w-16 h-10 md:w-20 md:h-12 text-primary-600 drop-shadow-lg" />
          </div>
          
          {/* Floating particles effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary-400 rounded-full animate-ping"></div>
            <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping animation-delay-200"></div>
            <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-primary-300 rounded-full animate-ping animation-delay-400"></div>
          </div>
        </div>
        {/* Category Badge Overlay */}
        <div className="absolute top-2 right-2 md:top-3 md:right-3">
          <Badge variant={getCategoryBadgeVariant(product.category)} size="sm">
            {getCategoryLabel(product.category)}
          </Badge>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3 md:p-4 flex-1 flex flex-col">
        <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1 line-clamp-2">
          {product.title}
        </h3>
        
        <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Price and Stock */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-lg md:text-xl font-bold text-primary-600">
            {formatPrice(product.price)}
          </p>
          
          {/* Stock Status - Highlighted */}
          <div className={`flex items-center px-2 py-0.5 md:px-2.5 md:py-1 rounded-2xl ${isOutOfStock ? 'bg-red-100' : 'bg-green-100'}`}>
            <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mr-1 md:mr-1.5 ${isOutOfStock ? 'bg-red-500' : 'bg-green-500'}`} />
            <span className={`text-xs font-semibold ${isOutOfStock ? 'text-red-700' : 'text-green-700'}`}>
              {isOutOfStock ? 'Sold Out' : `${product.stock}`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isOutOfStock ? (
            <Button
              variant="danger"
              size="sm"
              className="flex-1"
              disabled
            >
              Sold Out
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={() => onBuy(product.id)}
            >
              Beli
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails(product.id)}
          >
            Detail
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

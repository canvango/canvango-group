import React, { useState } from 'react';
import { Package } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';
import { Product } from '../../types/product';

export interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onBuy: (productId: string) => void;
  onViewDetails: (productId: string) => void;
}

const ProductGridSkeleton: React.FC = () => {
  return (
    <>
      {[...Array(8)].map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
        >
          <div className="p-4">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="flex justify-center py-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

const EmptyState: React.FC = () => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Package className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
        No Products Found
      </h3>
      <p className="text-gray-600 text-center max-w-md">
        We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
      </p>
    </div>
  );
};

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  onBuy,
  onViewDetails,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Debug logging for products with stock
  React.useEffect(() => {
    const productsWithStock = products.filter(p => p.stock > 0);
    if (productsWithStock.length > 0) {
      console.log('📦 ProductGrid - Products with stock:', productsWithStock.map(p => ({
        title: p.title,
        stock: p.stock,
        id: p.id
      })));
    }
  }, [products]);

  const handleViewDetails = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setShowDetailModal(true);
      onViewDetails(productId);
    }
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedProduct(null);
  };

  if (isLoading) {
    return (
      <div className="product-grid-responsive">
        <ProductGridSkeleton />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="grid grid-cols-1">
        <EmptyState />
      </div>
    );
  }

  return (
    <>
      <div className="product-grid-responsive">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onBuy={onBuy}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {/* Product Detail Modal - Only render when product is selected */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={showDetailModal}
          onClose={handleCloseModal}
          onBuyNow={(productId) => {
            handleCloseModal();
            onBuy(productId);
          }}
        />
      )}
    </>
  );
};

export default ProductGrid;

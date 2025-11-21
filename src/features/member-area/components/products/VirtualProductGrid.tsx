import React from 'react';
import VirtualGrid from '../../../../shared/components/VirtualGrid';
import ProductCard from './ProductCard';
import { Product } from '../../types/product';

interface VirtualProductGridProps {
  products: Product[];
  onBuy: (productId: string) => void;
  onViewDetails: (productId: string) => void;
  containerHeight?: number;
  columns?: number;
  emptyMessage?: string;
}

/**
 * VirtualProductGrid component
 * Optimized product grid using virtual scrolling for large datasets
 * Only renders products that are visible in the viewport
 * 
 * Use this component when displaying more than 50 products for better performance
 */
const VirtualProductGrid: React.FC<VirtualProductGridProps> = ({
  products,
  onBuy,
  onViewDetails,
  containerHeight = 800,
  columns = 4,
  emptyMessage = 'No products available',
}) => {
  return (
    <VirtualGrid
      items={products}
      itemHeight={380} // Approximate height of ProductCard
      containerHeight={containerHeight}
      columns={columns}
      gap={24}
      overscan={2}
      className="w-full"
      emptyMessage={emptyMessage}
      renderItem={(product) => (
        <ProductCard
          product={product}
          onBuy={onBuy}
          onViewDetails={onViewDetails}
        />
      )}
    />
  );
};

export default VirtualProductGrid;

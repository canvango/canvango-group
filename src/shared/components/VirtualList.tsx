import React from 'react';
import { useVirtualScroll } from '../hooks/useVirtualScroll';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  emptyMessage?: string;
}

/**
 * VirtualList component for rendering large lists efficiently
 * Only renders items that are visible in the viewport
 * 
 * @example
 * <VirtualList
 *   items={products}
 *   itemHeight={200}
 *   containerHeight={600}
 *   renderItem={(product, index) => (
 *     <ProductCard key={product.id} product={product} />
 *   )}
 * />
 */
function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
  renderItem,
  className = '',
  emptyMessage = 'No items to display',
}: VirtualListProps<T>) {
  const { virtualItems, totalHeight, containerRef } = useVirtualScroll(items, {
    itemHeight,
    containerHeight,
    overscan,
  });

  if (items.length === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ height: containerHeight }}
      >
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {virtualItems.map(({ index, item, offsetTop }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: itemHeight,
              transform: `translateY(${offsetTop}px)`,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VirtualList;

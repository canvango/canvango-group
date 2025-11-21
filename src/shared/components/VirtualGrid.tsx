import React, { useMemo } from 'react';
import { useVirtualScroll } from '../hooks/useVirtualScroll';

interface VirtualGridProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  columns: number;
  gap?: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  emptyMessage?: string;
}

/**
 * VirtualGrid component for rendering large grids efficiently
 * Only renders items that are visible in the viewport
 * Supports multi-column layouts
 * 
 * @example
 * <VirtualGrid
 *   items={products}
 *   itemHeight={300}
 *   containerHeight={800}
 *   columns={4}
 *   gap={16}
 *   renderItem={(product) => (
 *     <ProductCard key={product.id} product={product} />
 *   )}
 * />
 */
function VirtualGrid<T>({
  items,
  itemHeight,
  containerHeight,
  columns,
  gap = 16,
  overscan = 2,
  renderItem,
  className = '',
  emptyMessage = 'No items to display',
}: VirtualGridProps<T>) {
  // Group items into rows
  const rows = useMemo(() => {
    const result: T[][] = [];
    for (let i = 0; i < items.length; i += columns) {
      result.push(items.slice(i, i + columns));
    }
    return result;
  }, [items, columns]);

  const rowHeight = itemHeight + gap;

  const { virtualItems, totalHeight, containerRef } = useVirtualScroll(rows, {
    itemHeight: rowHeight,
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
        {virtualItems.map(({ index: rowIndex, item: row, offsetTop }) => (
          <div
            key={rowIndex}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: itemHeight,
              transform: `translateY(${offsetTop}px)`,
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: `${gap}px`,
            }}
          >
            {row.map((item, colIndex) => {
              const itemIndex = rowIndex * columns + colIndex;
              return (
                <div key={itemIndex}>
                  {renderItem(item, itemIndex)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VirtualGrid;

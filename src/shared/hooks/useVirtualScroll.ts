import { useState, useEffect, useRef, useMemo } from 'react';

interface UseVirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualScrollResult<T> {
  virtualItems: Array<{
    index: number;
    item: T;
    offsetTop: number;
  }>;
  totalHeight: number;
  scrollToIndex: (index: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Custom hook for virtual scrolling
 * Renders only visible items for better performance with large lists
 * 
 * @param items - Array of items to virtualize
 * @param options - Configuration options
 * @returns Virtual scroll utilities and visible items
 * 
 * @example
 * const { virtualItems, totalHeight, containerRef } = useVirtualScroll(
 *   products,
 *   { itemHeight: 200, containerHeight: 600, overscan: 3 }
 * );
 */
export const useVirtualScroll = <T>(
  items: T[],
  options: UseVirtualScrollOptions
): VirtualScrollResult<T> => {
  const { itemHeight, containerHeight, overscan = 3 } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const { startIndex, endIndex } = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    
    return {
      startIndex: Math.max(0, start - overscan),
      endIndex: Math.min(items.length - 1, start + visibleCount + overscan),
      offsetY: Math.max(0, start - overscan) * itemHeight,
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Handle scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Generate virtual items
  const virtualItems = useMemo(() => {
    const result = [];
    for (let i = startIndex; i <= endIndex; i++) {
      result.push({
        index: i,
        item: items[i],
        offsetTop: i * itemHeight,
      });
    }
    return result;
  }, [items, startIndex, endIndex, itemHeight]);

  // Calculate total height
  const totalHeight = items.length * itemHeight;

  // Scroll to specific index
  const scrollToIndex = (index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTop = index * itemHeight;
    }
  };

  return {
    virtualItems,
    totalHeight,
    scrollToIndex,
    containerRef,
  };
};

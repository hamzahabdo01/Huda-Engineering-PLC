import React, { useState, useEffect, useRef, useCallback, ReactNode } from 'react';

interface VirtualScrollProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
}

export function VirtualScroll<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 5,
  className = '',
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const visibleItemCount = Math.ceil(height / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil(scrollTop / itemHeight) + visibleItemCount + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Auto-scroll to top when items change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [items.length]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook for virtual scrolling logic
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = React.useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleItemCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil(scrollTop / itemHeight) + visibleItemCount + overscan
    );

    return {
      startIndex,
      endIndex,
      offsetY: startIndex * itemHeight,
    };
  }, [items.length, itemHeight, containerHeight, overscan, scrollTop]);

  const handleScroll = useCallback((scrollTop: number) => {
    setScrollTop(scrollTop);
  }, []);

  return {
    visibleRange,
    handleScroll,
    totalHeight: items.length * itemHeight,
  };
}

export default VirtualScroll;
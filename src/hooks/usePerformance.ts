import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  interactionTime?: number;
}

export const usePerformance = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  // Track render performance
  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;

    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      
      // Log performance metrics in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${componentName}] Render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
      }

      // Track memory usage if available
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        console.log(`[${componentName}] Memory: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      }
    };
  });

  // Measure interaction performance
  const measureInteraction = useCallback((interactionName: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${componentName}] ${interactionName}: ${(end - start).toFixed(2)}ms`);
    }
  }, [componentName]);

  // Debounce function for performance
  const debounce = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }, []);

  // Throttle function for performance
  const throttle = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }, []);

  return {
    measureInteraction,
    debounce,
    throttle,
    renderCount: renderCount.current,
  };
};

export default usePerformance;
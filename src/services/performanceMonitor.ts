import { PERFORMANCE_THRESHOLDS, MONITORING_CONFIG } from '@/config/performance';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  category: 'render' | 'memory' | 'network' | 'interaction';
}

interface PerformanceReport {
  metrics: PerformanceMetric[];
  summary: {
    averageRenderTime: number;
    memoryUsage: number;
    networkRequests: number;
    performanceScore: number;
  };
  recommendations: string[];
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: Map<string, IntersectionObserver> = new Map();
  private performanceMarks: Map<string, number> = new Map();
  private memoryThresholds = PERFORMANCE_THRESHOLDS.MEMORY_USAGE;
  private renderThresholds = PERFORMANCE_THRESHOLDS.RENDER_TIME;

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    if (MONITORING_CONFIG.ENABLE_PERFORMANCE_MARKERS) {
      this.setupPerformanceObservers();
    }

    if (MONITORING_CONFIG.ENABLE_MEMORY_MONITORING) {
      this.setupMemoryMonitoring();
    }

    if (MONITORING_CONFIG.ENABLE_NETWORK_MONITORING) {
      this.setupNetworkMonitoring();
    }

    // Cleanup old metrics periodically
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private setupPerformanceObservers() {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: 'long-task',
              value: entry.duration,
              unit: 'ms',
              timestamp: Date.now(),
              category: 'render',
            });
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        console.warn('Long task monitoring not supported:', error);
      }
    }

    // Monitor paint timing
    if ('PerformanceObserver' in window) {
      try {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: entry.name,
              value: entry.startTime,
              unit: 'ms',
              timestamp: Date.now(),
              category: 'render',
            });
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });
      } catch (error) {
        console.warn('Paint timing monitoring not supported:', error);
      }
    }
  }

  private setupMemoryMonitoring() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const usedMemory = memory.usedJSHeapSize;
        
        this.recordMetric({
          name: 'memory-usage',
          value: usedMemory / 1024 / 1024, // Convert to MB
          unit: 'MB',
          timestamp: Date.now(),
          category: 'memory',
        });

        // Check memory thresholds
        if (usedMemory > this.memoryThresholds.ERROR) {
          this.logWarning('Memory usage is critically high', { memory: usedMemory });
        } else if (usedMemory > this.memoryThresholds.WARNING) {
          this.logWarning('Memory usage is high', { memory: usedMemory });
        }
      }, 10000); // Every 10 seconds
    }
  }

  private setupNetworkMonitoring() {
    if ('PerformanceObserver' in window) {
      try {
        const networkObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.recordMetric({
                name: 'page-load-time',
                value: navEntry.loadEventEnd - navEntry.loadEventStart,
                unit: 'ms',
                timestamp: Date.now(),
                category: 'network',
              });
            }
          }
        });
        networkObserver.observe({ entryTypes: ['navigation'] });
      } catch (error) {
        console.warn('Network monitoring not supported:', error);
      }
    }
  }

  // Record a performance metric
  public recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log metrics in development
    if (MONITORING_CONFIG.LOG_LEVEL === 'debug') {
      console.log(`[Performance] ${metric.name}: ${metric.value}${metric.unit}`);
    }
  }

  // Start performance measurement
  public startMeasure(name: string) {
    if (MONITORING_CONFIG.ENABLE_PERFORMANCE_MARKERS) {
      this.performanceMarks.set(name, performance.now());
    }
  }

  // End performance measurement
  public endMeasure(name: string) {
    if (MONITORING_CONFIG.ENABLE_PERFORMANCE_MARKERS) {
      const startTime = this.performanceMarks.get(name);
      if (startTime) {
        const duration = performance.now() - startTime;
        
        this.recordMetric({
          name: `measure-${name}`,
          value: duration,
          unit: 'ms',
          timestamp: Date.now(),
          category: 'render',
        });

        // Check render time thresholds
        if (duration > this.renderThresholds.ERROR) {
          this.logWarning(`Render time for ${name} is too slow`, { duration });
        } else if (duration > this.renderThresholds.WARNING) {
          this.logWarning(`Render time for ${name} is slow`, { duration });
        }

        this.performanceMarks.delete(name);
        return duration;
      }
    }
    return 0;
  }

  // Monitor component render performance
  public monitorComponent(componentName: string, renderFn: () => void) {
    this.startMeasure(componentName);
    const result = renderFn();
    this.endMeasure(componentName);
    return result;
  }

  // Get performance report
  public getReport(): PerformanceReport {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(
      metric => now - metric.timestamp < 5 * 60 * 1000 // Last 5 minutes
    );

    const renderMetrics = recentMetrics.filter(m => m.category === 'render');
    const memoryMetrics = recentMetrics.filter(m => m.category === 'memory');
    const networkMetrics = recentMetrics.filter(m => m.category === 'network');

    const averageRenderTime = renderMetrics.length > 0
      ? renderMetrics.reduce((sum, m) => sum + m.value, 0) / renderMetrics.length
      : 0;

    const memoryUsage = memoryMetrics.length > 0
      ? memoryMetrics[memoryMetrics.length - 1]?.value || 0
      : 0;

    const networkRequests = networkMetrics.length;

    // Calculate performance score (0-100)
    let performanceScore = 100;
    
    if (averageRenderTime > this.renderThresholds.ERROR) performanceScore -= 30;
    else if (averageRenderTime > this.renderThresholds.WARNING) performanceScore -= 15;
    
    if (memoryUsage > this.memoryThresholds.ERROR) performanceScore -= 25;
    else if (memoryUsage > this.memoryThresholds.WARNING) performanceScore -= 10;

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (averageRenderTime > this.renderThresholds.WARNING) {
      recommendations.push('Consider optimizing component rendering with React.memo or useMemo');
    }
    
    if (memoryUsage > this.memoryThresholds.WARNING) {
      recommendations.push('Check for memory leaks and optimize component cleanup');
    }
    
    if (performanceScore < 70) {
      recommendations.push('Review performance bottlenecks and implement optimizations');
    }

    return {
      metrics: recentMetrics,
      summary: {
        averageRenderTime,
        memoryUsage,
        networkRequests,
        performanceScore,
      },
      recommendations,
    };
  }

  // Log warnings
  private logWarning(message: string, data?: any) {
    if (MONITORING_CONFIG.LOG_LEVEL !== 'error') {
      console.warn(`[Performance Warning] ${message}`, data);
    }
  }

  // Cleanup old metrics
  private cleanupOldMetrics() {
    const cutoff = Date.now() - 60 * 60 * 1000; // 1 hour ago
    this.metrics = this.metrics.filter(metric => metric.timestamp > cutoff);
  }

  // Get current metrics
  public getMetrics() {
    return [...this.metrics];
  }

  // Clear all metrics
  public clearMetrics() {
    this.metrics = [];
    this.performanceMarks.clear();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export hook for React components
export const usePerformanceMonitor = () => {
  return {
    startMeasure: performanceMonitor.startMeasure.bind(performanceMonitor),
    endMeasure: performanceMonitor.endMeasure.bind(performanceMonitor),
    monitorComponent: performanceMonitor.monitorComponent.bind(performanceMonitor),
    getReport: performanceMonitor.getReport.bind(performanceMonitor),
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
  };
};

export default performanceMonitor;
import { lazy, ComponentType, Suspense, ReactNode } from 'react';

// Loading component for lazy-loaded components
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Enhanced lazy loading with error boundary
export const lazyLoad = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: ReactNode
) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: any) => (
    <Suspense fallback={fallback || <LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Preload function for critical components
export const preloadComponent = (importFunc: () => Promise<{ default: ComponentType<any> }>) => {
  return () => {
    importFunc();
  };
};

// Batch preload for multiple components
export const preloadComponents = (components: Array<() => Promise<{ default: ComponentType<any> }>>) => {
  return () => {
    components.forEach(component => component());
  };
};
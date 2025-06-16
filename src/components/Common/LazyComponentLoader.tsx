import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyComponentLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minHeight?: string;
}

const DefaultFallback = ({ minHeight = "200px" }: { minHeight?: string }) => (
  <div className="w-full space-y-4" style={{ minHeight }}>
    <Skeleton className="h-8 w-1/3" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

export const LazyComponentLoader: React.FC<LazyComponentLoaderProps> = ({ 
  children, 
  fallback,
  minHeight 
}) => {
  const loadingComponent = fallback || <DefaultFallback minHeight={minHeight} />;
  
  return (
    <Suspense fallback={loadingComponent}>
      {children}
    </Suspense>
  );
};

export default LazyComponentLoader; 
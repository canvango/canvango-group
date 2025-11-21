import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton 
          key={index}
          className={`h-4 ${index === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-3xl shadow p-6 ${className}`}>
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <SkeletonText lines={3} />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonTable: React.FC<{ 
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ 
  rows = 5,
  columns = 4,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-3xl shadow overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={`header-${index}`} className="h-4" />
          ))}
        </div>
      </div>
      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-4" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonProductCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-3xl shadow overflow-hidden ${className}`}>
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-full" />
        <SkeletonText lines={2} />
        <Skeleton className="h-8 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonProductGrid: React.FC<{ 
  count?: number;
  className?: string;
}> = ({ 
  count = 8,
  className = ''
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonProductCard key={index} />
      ))}
    </div>
  );
};

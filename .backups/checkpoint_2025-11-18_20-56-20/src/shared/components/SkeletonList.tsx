import React from 'react';

interface SkeletonListProps {
  items?: number;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({ items = 3 }) => {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="card">
          <div className="card-body">
            <div className="h-5 bg-gray-200 rounded w-2/3 mb-3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

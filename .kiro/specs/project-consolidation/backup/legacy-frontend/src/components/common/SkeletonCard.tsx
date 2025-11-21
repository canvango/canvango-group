import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="card animate-pulse">
      <div className="card-body">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;

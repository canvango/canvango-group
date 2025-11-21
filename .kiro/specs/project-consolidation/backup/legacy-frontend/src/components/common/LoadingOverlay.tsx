import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingOverlayProps {
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
};

export default LoadingOverlay;

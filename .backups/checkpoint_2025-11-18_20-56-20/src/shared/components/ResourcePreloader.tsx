import React, { useEffect } from 'react';
import { preloadCriticalResources } from '../utils/resource-preload';

interface ResourcePreloaderProps {
  children?: React.ReactNode;
}

/**
 * ResourcePreloader component
 * Preloads critical resources when the app mounts
 * 
 * Usage:
 * ```tsx
 * <ResourcePreloader>
 *   <App />
 * </ResourcePreloader>
 * ```
 */
const ResourcePreloader: React.FC<ResourcePreloaderProps> = ({ children }) => {
  useEffect(() => {
    preloadCriticalResources();
  }, []);

  return <>{children}</>;
};

export default ResourcePreloader;

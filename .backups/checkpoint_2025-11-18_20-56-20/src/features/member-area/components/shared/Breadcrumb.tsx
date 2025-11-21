import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { generateBreadcrumbs, type Breadcrumb as BreadcrumbItem } from '../../utils/breadcrumbs';
import { useNavigation } from '../../hooks/useNavigation';

interface BreadcrumbProps {
  /**
   * Custom labels for specific paths
   */
  customLabels?: Record<string, string>;
  
  /**
   * Custom class name for the container
   */
  className?: string;
  
  /**
   * Whether to show the home icon
   */
  showHomeIcon?: boolean;
}

/**
 * Breadcrumb navigation component
 * Automatically generates breadcrumbs based on current route
 * 
 * @example
 * ```tsx
 * <Breadcrumb />
 * 
 * // With custom labels
 * <Breadcrumb customLabels={{ '/accounts/bm': 'Business Manager' }} />
 * ```
 */
const Breadcrumb: React.FC<BreadcrumbProps> = ({
  customLabels,
  className = '',
  showHomeIcon = true,
}) => {
  const location = useLocation();
  const { navigateTo } = useNavigation();
  
  const breadcrumbs = generateBreadcrumbs(location.pathname, customLabels);

  // Don't show breadcrumbs if only home/dashboard
  if (breadcrumbs.length <= 1) {
    return null;
  }

  const handleClick = (breadcrumb: BreadcrumbItem) => {
    if (!breadcrumb.isActive) {
      navigateTo(breadcrumb.path);
    }
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center space-x-2 text-sm ${className}`}
    >
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((breadcrumb, index) => {
          const isFirst = index === 0;
          const isLast = breadcrumb.isActive;

          return (
            <li key={breadcrumb.path} className="flex items-center">
              {/* Separator */}
              {!isFirst && (
                <ChevronRight
                  className="w-4 h-4 mx-2 text-gray-400"
                  aria-hidden="true"
                />
              )}

              {/* Breadcrumb item */}
              {isLast ? (
                <span
                  className="font-medium text-gray-900"
                  aria-current="page"
                >
                  {breadcrumb.label}
                </span>
              ) : (
                <button
                  onClick={() => handleClick(breadcrumb)}
                  className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={`Navigate to ${breadcrumb.label}`}
                >
                  {isFirst && showHomeIcon && (
                    <Home className="w-4 h-4 mr-1" aria-hidden="true" />
                  )}
                  {breadcrumb.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

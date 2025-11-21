/**
 * EmptyState Component Usage Examples
 * 
 * This file demonstrates how to use the EmptyState component
 * and the predefined empty state variants.
 */

import React from 'react';
import { Package, AlertCircle } from 'lucide-react';
import EmptyState from './EmptyState';
import {
  NoProductsFound,
  NoTransactionsFound,
  NoSearchResults,
  NoWarrantyClaimsFound,
  NoEligibleAccounts,
  NoOrdersFound,
  NoTutorialsFound,
  NoUpdatesAvailable,
  NoPendingItems,
  GenericError,
  LoadingState,
} from './EmptyStates';

/**
 * Example 1: Basic EmptyState with icon, title, and description
 */
export const BasicExample: React.FC = () => (
  <EmptyState
    icon={Package}
    title="No Items Available"
    description="There are currently no items to display. Please check back later."
  />
);

/**
 * Example 2: EmptyState with action button
 */
export const WithActionExample: React.FC = () => {
  const handleAddItem = () => {
    console.log('Add item clicked');
  };

  return (
    <EmptyState
      icon={Package}
      title="No Items Found"
      description="Get started by adding your first item."
      action={{
        label: 'Add Item',
        onClick: handleAddItem,
        variant: 'primary',
      }}
    />
  );
};

/**
 * Example 3: EmptyState with secondary action button
 */
export const WithSecondaryActionExample: React.FC = () => {
  const handleReset = () => {
    console.log('Reset filters clicked');
  };

  return (
    <EmptyState
      icon={AlertCircle}
      title="No Results"
      description="Try adjusting your filters to see more results."
      action={{
        label: 'Reset Filters',
        onClick: handleReset,
        variant: 'outline',
      }}
    />
  );
};

/**
 * Example 4: Using predefined empty states
 */
export const PredefinedExamples: React.FC = () => {
  const handleReset = () => console.log('Reset');
  const handleViewProducts = () => console.log('View products');
  const handleViewAll = () => console.log('View all');
  const handleRetry = () => console.log('Retry');

  return (
    <div className="space-y-8">
      {/* No products found with reset action */}
      <NoProductsFound onReset={handleReset} />

      {/* No transactions with browse action */}
      <NoTransactionsFound onViewProducts={handleViewProducts} />

      {/* No search results */}
      <NoSearchResults searchTerm="example" onClear={handleReset} />

      {/* No warranty claims */}
      <NoWarrantyClaimsFound />

      {/* No eligible accounts */}
      <NoEligibleAccounts />

      {/* No orders */}
      <NoOrdersFound />

      {/* No tutorials with view all action */}
      <NoTutorialsFound onViewAll={handleViewAll} />

      {/* No updates */}
      <NoUpdatesAvailable />

      {/* No pending items */}
      <NoPendingItems />

      {/* Generic error with retry */}
      <GenericError onRetry={handleRetry} />

      {/* Loading state */}
      <LoadingState message="Loading your data..." />
    </div>
  );
};

/**
 * Example 5: EmptyState in a container
 */
export const InContainerExample: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <EmptyState
      icon={Package}
      title="No Data Available"
      description="This section will display data once it becomes available."
    />
  </div>
);

/**
 * Example 6: Responsive EmptyState
 * The component automatically adapts to different screen sizes
 */
export const ResponsiveExample: React.FC = () => (
  <div className="w-full">
    <EmptyState
      icon={Package}
      title="Responsive Empty State"
      description="This empty state looks great on mobile, tablet, and desktop screens. The icon, text, and button all scale appropriately."
      action={{
        label: 'Take Action',
        onClick: () => console.log('Action clicked'),
      }}
    />
  </div>
);

/**
 * Usage in real components:
 * 
 * // In Dashboard.tsx for no updates
 * {updates.length === 0 && <NoUpdatesAvailable />}
 * 
 * // In VerifiedBMService.tsx for no orders
 * {orders.length === 0 && <NoOrdersFound />}
 * 
 * // In TutorialCenter.tsx for no tutorials
 * {filteredTutorials.length === 0 && (
 *   <NoTutorialsFound onViewAll={() => setCategory('all')} />
 * )}
 * 
 * // In ClaimWarranty.tsx for no eligible accounts
 * {eligibleAccounts.length === 0 && <NoEligibleAccounts />}
 * 
 * // Custom empty state
 * {items.length === 0 && (
 *   <EmptyState
 *     icon={CustomIcon}
 *     title="Custom Title"
 *     description="Custom description"
 *     action={{
 *       label: 'Custom Action',
 *       onClick: handleCustomAction,
 *     }}
 *   />
 * )}
 */

export default {
  BasicExample,
  WithActionExample,
  WithSecondaryActionExample,
  PredefinedExamples,
  InContainerExample,
  ResponsiveExample,
};

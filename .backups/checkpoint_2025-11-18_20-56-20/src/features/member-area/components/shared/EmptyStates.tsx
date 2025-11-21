import React from 'react';
import {
  Package,
  ShoppingBag,
  FileText,
  Search,
  AlertCircle,
  Inbox,
  BookOpen,
  Shield,
  Clock,
} from 'lucide-react';
import EmptyState from './EmptyState';

/**
 * Pre-configured empty state components for common scenarios
 */

export const NoProductsFound: React.FC<{ onReset?: () => void }> = ({ onReset }) => (
  <EmptyState
    icon={Package}
    title="No Products Found"
    description="We couldn't find any products matching your criteria. Try adjusting your filters or search terms."
    action={onReset ? {
      label: 'Clear Filters',
      onClick: onReset,
      variant: 'outline',
    } : undefined}
  />
);

export const NoTransactionsFound: React.FC<{ onViewProducts?: () => void }> = ({ onViewProducts }) => (
  <EmptyState
    icon={ShoppingBag}
    title="No Transactions Yet"
    description="You haven't made any purchases yet. Browse our products to get started."
    action={onViewProducts ? {
      label: 'Browse Products',
      onClick: onViewProducts,
      variant: 'primary',
    } : undefined}
  />
);

export const NoSearchResults: React.FC<{ searchTerm?: string; onClear?: () => void }> = ({ 
  searchTerm, 
  onClear 
}) => (
  <EmptyState
    icon={Search}
    title="No Results Found"
    description={
      searchTerm
        ? `We couldn't find anything matching "${searchTerm}". Try different keywords.`
        : "We couldn't find any results. Try different search terms."
    }
    action={onClear ? {
      label: 'Clear Search',
      onClick: onClear,
      variant: 'outline',
    } : undefined}
  />
);

export const NoWarrantyClaimsFound: React.FC = () => (
  <EmptyState
    icon={Shield}
    title="No Warranty Claims"
    description="You haven't submitted any warranty claims yet. If you have issues with your purchased accounts, you can submit a claim here."
  />
);

export const NoEligibleAccounts: React.FC = () => (
  <EmptyState
    icon={AlertCircle}
    title="No Eligible Accounts"
    description="You don't have any accounts eligible for warranty claims at this time. Accounts must be within the warranty period and not previously claimed."
  />
);

export const NoOrdersFound: React.FC = () => (
  <EmptyState
    icon={FileText}
    title="No Orders Yet"
    description="You haven't placed any verification orders yet. Submit a new order to get started."
  />
);

export const NoTutorialsFound: React.FC<{ onViewAll?: () => void }> = ({ onViewAll }) => (
  <EmptyState
    icon={BookOpen}
    title="No Tutorials Found"
    description="We couldn't find any tutorials in this category. Check back later or browse all tutorials."
    action={onViewAll ? {
      label: 'View All Tutorials',
      onClick: onViewAll,
      variant: 'outline',
    } : undefined}
  />
);

export const NoUpdatesAvailable: React.FC = () => (
  <EmptyState
    icon={Inbox}
    title="No Updates"
    description="There are no new updates at this time. Check back later for the latest news and announcements."
  />
);

export const NoPendingItems: React.FC = () => (
  <EmptyState
    icon={Clock}
    title="No Pending Items"
    description="You don't have any pending items at this time. All your requests have been processed."
  />
);

export const GenericError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <EmptyState
    icon={AlertCircle}
    title="Something Went Wrong"
    description="We encountered an error while loading this content. Please try again."
    action={onRetry ? {
      label: 'Try Again',
      onClick: onRetry,
      variant: 'primary',
    } : undefined}
  />
);

/**
 * Loading state component (not technically empty, but related)
 */
export const LoadingState: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="mb-4">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
    <p className="text-sm text-gray-600">{message}</p>
  </div>
);

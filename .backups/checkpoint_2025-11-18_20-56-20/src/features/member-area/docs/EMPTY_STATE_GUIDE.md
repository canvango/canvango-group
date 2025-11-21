# EmptyState Component Guide

## Overview

The `EmptyState` component provides a consistent way to display friendly messages when no data is available. It follows the design system requirements (12.7) to use friendly icons and helpful messages throughout the application.

## Features

- ✅ Icon display with circular background
- ✅ Title and description text
- ✅ Optional action button with multiple variants
- ✅ Fully responsive design
- ✅ Accessibility support (ARIA labels, semantic HTML)
- ✅ Consistent styling across the application

## Requirements Coverage

This component satisfies the following requirements:

- **2.7**: Dashboard empty state for no recent updates
- **7.7**: Verified BM Service empty state for no previous orders
- **10.6**: Tutorial Center empty state with action to return to all tutorials
- **12.7**: Friendly illustrations/icons with helpful messages for all empty states

## Basic Usage

```tsx
import EmptyState from '@/features/member-area/components/shared/EmptyState';
import { Package } from 'lucide-react';

function MyComponent() {
  return (
    <EmptyState
      icon={Package}
      title="No Items Found"
      description="There are no items to display at this time."
    />
  );
}
```

## With Action Button

```tsx
<EmptyState
  icon={Package}
  title="No Products Available"
  description="Get started by browsing our product catalog."
  action={{
    label: 'Browse Products',
    onClick: () => navigate('/products'),
    variant: 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost'
  }}
/>
```

## Predefined Empty States

The application includes several predefined empty state components for common scenarios:

### NoProductsFound
Used when product filters return no results.

```tsx
import { NoProductsFound } from '@/features/member-area/components/shared/EmptyStates';

<NoProductsFound onReset={() => clearFilters()} />
```

### NoTransactionsFound
Used when a user has no transaction history.

```tsx
import { NoTransactionsFound } from '@/features/member-area/components/shared/EmptyStates';

<NoTransactionsFound onViewProducts={() => navigate('/products')} />
```

### NoSearchResults
Used when search queries return no results.

```tsx
import { NoSearchResults } from '@/features/member-area/components/shared/EmptyStates';

<NoSearchResults 
  searchTerm={searchQuery} 
  onClear={() => setSearchQuery('')} 
/>
```

### NoWarrantyClaimsFound
Used in the warranty claims page when no claims exist.

```tsx
import { NoWarrantyClaimsFound } from '@/features/member-area/components/shared/EmptyStates';

<NoWarrantyClaimsFound />
```

### NoEligibleAccounts
Used when no accounts are eligible for warranty claims.

```tsx
import { NoEligibleAccounts } from '@/features/member-area/components/shared/EmptyStates';

<NoEligibleAccounts />
```

### NoOrdersFound
Used in Verified BM Service page when no orders exist.

```tsx
import { NoOrdersFound } from '@/features/member-area/components/shared/EmptyStates';

<NoOrdersFound />
```

### NoTutorialsFound
Used in Tutorial Center when no tutorials match filters.

```tsx
import { NoTutorialsFound } from '@/features/member-area/components/shared/EmptyStates';

<NoTutorialsFound onViewAll={() => setCategory('all')} />
```

### NoUpdatesAvailable
Used in Dashboard when no platform updates exist.

```tsx
import { NoUpdatesAvailable } from '@/features/member-area/components/shared/EmptyStates';

<NoUpdatesAvailable />
```

### NoPendingItems
Used when all items have been processed.

```tsx
import { NoPendingItems } from '@/features/member-area/components/shared/EmptyStates';

<NoPendingItems />
```

### GenericError
Used for error states with retry functionality.

```tsx
import { GenericError } from '@/features/member-area/components/shared/EmptyStates';

<GenericError onRetry={() => refetch()} />
```

## Props Interface

```typescript
interface EmptyStateProps {
  icon: LucideIcon;              // Icon component from lucide-react
  title: string;                 // Main heading text
  description: string;           // Descriptive text
  action?: {                     // Optional action button
    label: string;               // Button text
    onClick: () => void;         // Click handler
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  };
  className?: string;            // Additional CSS classes
}
```

## Styling

The component uses Tailwind CSS classes and follows the design system:

- **Icon**: 64x64px (w-12 h-12), gray-400 color, in a gray-100 circular background
- **Title**: 18px (text-lg), semibold, gray-900 color
- **Description**: 14px (text-sm), gray-600 color, max-width 28rem
- **Spacing**: Consistent padding and margins for visual hierarchy
- **Responsive**: Adapts to all screen sizes (mobile, tablet, desktop)

## Accessibility

The component includes proper accessibility features:

- `role="status"` - Indicates dynamic content
- `aria-live="polite"` - Announces changes to screen readers
- `aria-hidden="true"` on decorative icon
- Semantic HTML structure
- Keyboard accessible action buttons

## Best Practices

1. **Choose appropriate icons**: Use icons that clearly represent the empty state context
2. **Write helpful descriptions**: Explain why the state is empty and what users can do
3. **Provide actions when relevant**: If users can take action to resolve the empty state, include an action button
4. **Use predefined variants**: Leverage existing empty state components for consistency
5. **Keep messages friendly**: Use encouraging, positive language

## Examples in Context

### Dashboard - No Updates
```tsx
{updates.length === 0 && <NoUpdatesAvailable />}
```

### Transaction History - No Transactions
```tsx
{transactions.length === 0 && (
  <NoTransactionsFound 
    onViewProducts={() => navigate('/products/bm')} 
  />
)}
```

### Product Catalog - No Results
```tsx
{filteredProducts.length === 0 && (
  <NoProductsFound onReset={() => resetFilters()} />
)}
```

### Tutorial Center - No Tutorials
```tsx
{filteredTutorials.length === 0 && (
  <NoTutorialsFound onViewAll={() => setCategory('all')} />
)}
```

### Verified BM Service - No Orders
```tsx
{orders.length === 0 && <NoOrdersFound />}
```

### Warranty Claims - No Eligible Accounts
```tsx
{eligibleAccounts.length === 0 && <NoEligibleAccounts />}
```

## Custom Empty States

For unique scenarios not covered by predefined variants:

```tsx
import EmptyState from '@/features/member-area/components/shared/EmptyState';
import { CustomIcon } from 'lucide-react';

<EmptyState
  icon={CustomIcon}
  title="Custom Empty State"
  description="This is a custom empty state for a specific use case."
  action={{
    label: 'Custom Action',
    onClick: handleCustomAction,
    variant: 'primary',
  }}
/>
```

## Related Components

- **LoadingState**: For loading indicators (see EmptyStates.tsx)
- **SkeletonLoader**: For content placeholders during loading
- **ErrorMessage**: For error states with more detail
- **Toast**: For temporary notifications

## Testing

The component includes comprehensive tests covering:
- Basic rendering with icon, title, and description
- Optional action button rendering and interaction
- Custom className application
- Accessibility attributes
- Different button variants

## Migration Notes

If you're using custom empty state implementations, consider migrating to this component for:
- Consistent styling across the application
- Built-in accessibility features
- Reduced code duplication
- Easier maintenance

## Support

For questions or issues with the EmptyState component, refer to:
- Component source: `src/features/member-area/components/shared/EmptyState.tsx`
- Predefined variants: `src/features/member-area/components/shared/EmptyStates.tsx`
- Examples: `src/features/member-area/components/shared/EmptyStateExample.tsx`
- Design document: `.kiro/specs/member-area-content-framework/design.md`

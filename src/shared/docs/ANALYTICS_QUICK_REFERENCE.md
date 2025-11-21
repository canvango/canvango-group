# Analytics Quick Reference

Quick reference for common analytics tracking patterns.

## Setup

```tsx
import { AnalyticsProvider } from '@/shared/components';
import { useAuth } from '@/features/member-area/contexts/AuthContext';

function App() {
  const { user } = useAuth();
  return (
    <AnalyticsProvider user={user} enabled={true}>
      {/* Your app */}
    </AnalyticsProvider>
  );
}
```

## Common Patterns

### Basic Event Tracking

```tsx
import { useAnalytics } from '@/shared/hooks';

const { trackEvent } = useAnalytics();
trackEvent('Category', 'action', 'label', value, metadata);
```

### Button Clicks

```tsx
import { useButtonTracking } from '@/shared/hooks';

const trackClick = useButtonTracking('Navigation', 'Dashboard Button');
<button onClick={trackClick}>Dashboard</button>
```

### Form Submissions

```tsx
import { useFormTracking } from '@/shared/hooks';

const { trackFormStart, trackFormSubmit, trackFormError } = useFormTracking('Login Form');

<form onFocus={trackFormStart} onSubmit={handleSubmit}>
  {/* On success */}
  trackFormSubmit(true);
  
  {/* On error */}
  trackFormSubmit(false, { error: 'message' });
  trackFormError('email', 'Invalid email');
</form>
```

### Purchases

```tsx
import { usePurchaseTracking } from '@/shared/hooks';

const { trackPurchaseStart, trackPurchaseComplete, trackPurchaseError } = usePurchaseTracking();

// Start
trackPurchaseStart(productId, productName, price);

// Complete
trackPurchaseComplete(transactionId, productId, productName, quantity, total);

// Error
trackPurchaseError(productId, productName, errorMessage);
```

### Search

```tsx
import { useSearchTracking } from '@/shared/hooks';

const { trackSearch, trackSearchResultClick } = useSearchTracking('Product Search');

// Search performed
trackSearch(query, resultsCount);

// Result clicked
trackSearchResultClick(query, resultId, position);
```

### Navigation

```tsx
import { useNavigationTracking } from '@/shared/hooks';

const { trackNavigation, trackExternalLink } = useNavigationTracking();

// Internal navigation
trackNavigation('/dashboard', 'sidebar');

// External link
trackExternalLink('https://example.com', 'Help Center');
```

### Modals

```tsx
import { useModalTracking } from '@/shared/hooks';

const { trackModalOpen, trackModalClose, trackModalAction } = useModalTracking('Confirmation Modal');

// Open
trackModalOpen();

// Close
trackModalClose('button' | 'backdrop' | 'escape');

// Action
trackModalAction('confirm');
```

### Filters & Sorting

```tsx
import { useFilterTracking } from '@/shared/hooks';

const { trackFilterChange, trackSortChange } = useFilterTracking('Product List');

// Filter changed
trackFilterChange('category', 'verified');

// Sort changed
trackSortChange('price', 'asc');
```

### Page Views

```tsx
import { usePageViewTracking } from '@/shared/hooks';

// Automatic tracking with custom title
usePageViewTracking('My Page Title');

// Manual tracking
const { trackPageView } = useAnalytics();
trackPageView('/path', 'Page Title', { metadata });
```

### User Context

```tsx
import { useAnalytics } from '@/shared/hooks';

const { setUserContext, clearUserContext } = useAnalytics();

// Set context
setUserContext({
  userId: user.id,
  username: user.username,
  role: user.role
});

// Clear context (on logout)
clearUserContext();
```

## Event Categories

Use consistent categories across your app:

- **Button**: Button clicks
- **Form**: Form interactions
- **Purchase**: Purchase flow events
- **Search**: Search interactions
- **Navigation**: Navigation events
- **Modal**: Modal/dialog interactions
- **Filter**: Filter changes
- **Sort**: Sort changes
- **Error**: Error events
- **Performance**: Performance metrics

## Event Actions

Common action names:

- **click**: User clicked something
- **submit**: Form submitted
- **start**: Action started
- **complete**: Action completed
- **error**: Error occurred
- **open**: Modal/dropdown opened
- **close**: Modal/dropdown closed
- **change**: Value changed
- **search**: Search performed
- **view**: Item viewed

## Metadata Examples

```tsx
// Purchase metadata
{
  productId: 'prod-123',
  category: 'bm-accounts',
  quantity: 1,
  paymentMethod: 'credit_card'
}

// Form metadata
{
  formName: 'login',
  fieldCount: 2,
  validationErrors: ['email']
}

// Search metadata
{
  query: 'verified bm',
  resultsCount: 15,
  filters: { category: 'verified' }
}

// Error metadata
{
  errorType: 'ValidationError',
  errorMessage: 'Invalid email format',
  field: 'email'
}
```

## Best Practices

1. ✅ Use descriptive categories and actions
2. ✅ Include relevant metadata
3. ✅ Track both success and failure
4. ✅ Use specialized hooks for common patterns
5. ✅ Respect user privacy
6. ❌ Don't track sensitive data (passwords, tokens, etc.)
7. ❌ Don't track personally identifiable information without consent

## Configuration

```typescript
import analytics from '@/shared/utils/analytics';

// Enable/disable
analytics.enable();
analytics.disable();

// Check status
analytics.isEnabled();

// Add provider
import { GoogleAnalyticsProvider } from '@/shared/utils/analytics';
analytics.addProvider(new GoogleAnalyticsProvider('G-XXXXXXXXXX'));
```

## See Also

- [Complete Analytics Guide](./ANALYTICS_GUIDE.md)
- [Analytics Examples](../components/AnalyticsExample.tsx)

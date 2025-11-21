# Analytics and Tracking Guide

Complete guide for implementing analytics and tracking in the Canvango Group Member Area.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Core Concepts](#core-concepts)
4. [Page View Tracking](#page-view-tracking)
5. [Event Tracking](#event-tracking)
6. [User Context](#user-context)
7. [Analytics Providers](#analytics-providers)
8. [React Hooks](#react-hooks)
9. [Best Practices](#best-practices)
10. [Examples](#examples)

## Overview

The analytics system provides a centralized, flexible way to track user interactions and page views across the application. It supports multiple analytics providers (Google Analytics, custom APIs, etc.) and provides React hooks for easy integration.

### Key Features

- **Multiple Providers**: Support for Google Analytics, custom APIs, and console logging
- **Automatic Page Tracking**: Tracks page views on route changes
- **User Context**: Automatically includes user information in events
- **Type-Safe**: Full TypeScript support
- **React Hooks**: Easy-to-use hooks for common tracking scenarios
- **Privacy-Friendly**: Can be easily disabled or configured for GDPR compliance

## Quick Start

### 1. Wrap Your App with AnalyticsProvider

```tsx
import { AnalyticsProvider } from '@/shared/components';
import { useAuth } from '@/features/member-area/contexts/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <AnalyticsProvider user={user} enabled={true}>
      {/* Your app content */}
    </AnalyticsProvider>
  );
}
```

### 2. Track Events in Components

```tsx
import { useAnalytics } from '@/shared/hooks';

function MyComponent() {
  const { trackEvent } = useAnalytics();

  const handleClick = () => {
    trackEvent('Button', 'click', 'Save Button');
    // Your logic here
  };

  return <button onClick={handleClick}>Save</button>;
}
```

## Core Concepts

### Analytics Events

All events have the following structure:

```typescript
interface AnalyticsEvent {
  category: string;      // Event category (e.g., 'Button', 'Form', 'Purchase')
  action: string;        // Action performed (e.g., 'click', 'submit', 'complete')
  label?: string;        // Optional label for more context
  value?: number;        // Optional numeric value
  metadata?: Record<string, any>; // Additional data
}
```

### Page View Events

Page views are tracked automatically but can also be triggered manually:

```typescript
interface PageViewEvent {
  path: string;          // URL path
  title: string;         // Page title
  referrer?: string;     // Referrer URL
  metadata?: Record<string, any>; // Additional data
}
```

### User Context

User information is automatically included with all events:

```typescript
interface UserContext {
  userId?: string;       // User ID
  username?: string;     // Username
  role?: string;         // User role
  sessionId?: string;    // Session ID (auto-generated)
}
```

## Page View Tracking

### Automatic Tracking

Page views are automatically tracked when using `AnalyticsProvider`:

```tsx
<AnalyticsProvider user={user}>
  <Router>
    {/* Page views tracked automatically on route changes */}
  </Router>
</AnalyticsProvider>
```

### Manual Tracking

Track page views manually using the hook:

```tsx
import { usePageViewTracking } from '@/shared/hooks';

function MyPage() {
  // Automatically tracks this page
  usePageViewTracking('My Custom Page Title');

  return <div>Page content</div>;
}
```

Or track programmatically:

```tsx
import { useAnalytics } from '@/shared/hooks';

function MyComponent() {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView('/custom-path', 'Custom Page', {
      section: 'dashboard'
    });
  }, []);
}
```

## Event Tracking

### Basic Event Tracking

```tsx
import { useAnalytics } from '@/shared/hooks';

function MyComponent() {
  const { trackEvent } = useAnalytics();

  const handleAction = () => {
    trackEvent(
      'Category',      // Event category
      'action',        // Action name
      'Label',         // Optional label
      100,             // Optional value
      { key: 'value' } // Optional metadata
    );
  };
}
```

### Button Click Tracking

```tsx
import { useButtonTracking } from '@/shared/hooks';

function MyButton() {
  const trackClick = useButtonTracking('Navigation', 'Dashboard Link');

  return (
    <button onClick={trackClick}>
      Go to Dashboard
    </button>
  );
}
```

### Form Tracking

```tsx
import { useFormTracking } from '@/shared/hooks';

function MyForm() {
  const { trackFormStart, trackFormSubmit, trackFormError } = useFormTracking('Login Form');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await submitForm();
      trackFormSubmit(true);
    } catch (error) {
      trackFormSubmit(false, { error: error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} onFocus={trackFormStart}>
      {/* Form fields */}
    </form>
  );
}
```

### Purchase Tracking

```tsx
import { usePurchaseTracking } from '@/shared/hooks';

function ProductCard({ product }) {
  const { trackPurchaseStart, trackPurchaseComplete, trackPurchaseError } = usePurchaseTracking();

  const handlePurchase = async () => {
    trackPurchaseStart(product.id, product.name, product.price);
    
    try {
      const transaction = await purchaseProduct(product.id);
      trackPurchaseComplete(
        transaction.id,
        product.id,
        product.name,
        1,
        product.price
      );
    } catch (error) {
      trackPurchaseError(product.id, product.name, error.message);
    }
  };

  return <button onClick={handlePurchase}>Buy Now</button>;
}
```

### Search Tracking

```tsx
import { useSearchTracking } from '@/shared/hooks';

function SearchBar() {
  const { trackSearch, trackSearchResultClick } = useSearchTracking('Product Search');
  const [results, setResults] = useState([]);

  const handleSearch = async (query) => {
    const searchResults = await searchProducts(query);
    setResults(searchResults);
    trackSearch(query, searchResults.length);
  };

  const handleResultClick = (result, index) => {
    trackSearchResultClick(query, result.id, index);
    navigate(`/product/${result.id}`);
  };

  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {results.map((result, index) => (
        <div key={result.id} onClick={() => handleResultClick(result, index)}>
          {result.name}
        </div>
      ))}
    </div>
  );
}
```

### Modal Tracking

```tsx
import { useModalTracking } from '@/shared/hooks';

function MyModal({ isOpen, onClose }) {
  const { trackModalOpen, trackModalClose, trackModalAction } = useModalTracking('Purchase Confirmation');

  useEffect(() => {
    if (isOpen) {
      trackModalOpen();
    }
  }, [isOpen]);

  const handleClose = () => {
    trackModalClose('button');
    onClose();
  };

  const handleConfirm = () => {
    trackModalAction('confirm');
    // Confirm logic
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <button onClick={handleConfirm}>Confirm</button>
      <button onClick={handleClose}>Cancel</button>
    </Modal>
  );
}
```

### Filter/Sort Tracking

```tsx
import { useFilterTracking } from '@/shared/hooks';

function ProductFilters() {
  const { trackFilterChange, trackSortChange } = useFilterTracking('Product List');

  const handleCategoryChange = (category) => {
    setCategory(category);
    trackFilterChange('category', category);
  };

  const handleSortChange = (sortBy, sortOrder) => {
    setSortBy(sortBy);
    trackSortChange(sortBy, sortOrder);
  };

  return (
    <div>
      <select onChange={(e) => handleCategoryChange(e.target.value)}>
        {/* Options */}
      </select>
      <select onChange={(e) => handleSortChange('price', e.target.value)}>
        {/* Options */}
      </select>
    </div>
  );
}
```

## User Context

### Setting User Context

User context is automatically set by `AnalyticsProvider`, but you can also set it manually:

```tsx
import { useAnalytics } from '@/shared/hooks';

function LoginComponent() {
  const { setUserContext } = useAnalytics();

  const handleLogin = async (credentials) => {
    const user = await login(credentials);
    
    // Set user context for analytics
    setUserContext({
      userId: user.id,
      username: user.username,
      role: user.role
    });
  };
}
```

### Clearing User Context

Clear user context on logout:

```tsx
import { useAnalytics } from '@/shared/hooks';

function LogoutButton() {
  const { clearUserContext } = useAnalytics();

  const handleLogout = () => {
    clearUserContext();
    logout();
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

## Analytics Providers

### Console Provider (Development)

Logs events to the browser console. Automatically enabled in development mode.

```typescript
import { ConsoleAnalyticsProvider } from '@/shared/utils/analytics';

analytics.addProvider(new ConsoleAnalyticsProvider());
```

### Google Analytics Provider

Integrates with Google Analytics (gtag.js):

```typescript
import { GoogleAnalyticsProvider } from '@/shared/utils/analytics';

const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
analytics.addProvider(new GoogleAnalyticsProvider(GA_MEASUREMENT_ID));
```

Make sure to include the Google Analytics script in your HTML:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Custom API Provider

Send events to your own analytics API:

```typescript
import { CustomAPIAnalyticsProvider } from '@/shared/utils/analytics';

analytics.addProvider(new CustomAPIAnalyticsProvider('https://api.example.com'));
```

### Creating Custom Providers

Implement the `AnalyticsProvider` interface:

```typescript
import { AnalyticsProvider, PageViewEvent, AnalyticsEvent, UserContext } from '@/shared/utils/analytics';

class MyCustomProvider implements AnalyticsProvider {
  name = 'my-custom-provider';

  trackPageView(event: PageViewEvent, userContext?: UserContext): void {
    // Your implementation
  }

  trackEvent(event: AnalyticsEvent, userContext?: UserContext): void {
    // Your implementation
  }

  setUserContext(context: UserContext): void {
    // Your implementation
  }
}

// Add to analytics
analytics.addProvider(new MyCustomProvider());
```

## Best Practices

### 1. Use Descriptive Categories and Actions

```tsx
// Good
trackEvent('Purchase', 'complete', 'BM Account Verified', 50000);

// Bad
trackEvent('click', 'button', 'btn1');
```

### 2. Include Relevant Metadata

```tsx
trackEvent('Purchase', 'complete', product.name, product.price, {
  productId: product.id,
  category: product.category,
  quantity: 1,
  paymentMethod: 'credit_card'
});
```

### 3. Track User Journey

```tsx
// Track key steps in user flows
trackEvent('Onboarding', 'step_1_complete', 'Account Created');
trackEvent('Onboarding', 'step_2_complete', 'Profile Updated');
trackEvent('Onboarding', 'step_3_complete', 'First Purchase');
```

### 4. Respect User Privacy

```tsx
// Check for user consent before enabling analytics
const hasConsent = checkAnalyticsConsent();

<AnalyticsProvider user={user} enabled={hasConsent}>
  {/* App */}
</AnalyticsProvider>
```

### 5. Don't Track Sensitive Data

```tsx
// Good - Track action without sensitive data
trackEvent('Form', 'submit', 'Password Reset');

// Bad - Don't track passwords or personal info
trackEvent('Form', 'submit', 'Password Reset', undefined, {
  password: 'secret123' // ❌ Never do this
});
```

### 6. Use Hooks for Consistency

```tsx
// Use specialized hooks for common patterns
const { trackPurchaseComplete } = usePurchaseTracking();
const { trackFormSubmit } = useFormTracking('Checkout Form');
const { trackSearch } = useSearchTracking('Product Search');
```

### 7. Track Errors and Failures

```tsx
try {
  await submitForm();
  trackFormSubmit(true);
} catch (error) {
  trackFormSubmit(false, {
    errorType: error.type,
    errorMessage: error.message
  });
}
```

## Examples

See `src/shared/components/AnalyticsExample.tsx` for complete working examples of all tracking scenarios.

## Configuration

### Environment Variables

Configure analytics providers using environment variables:

```env
# Google Analytics
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Custom Analytics API
REACT_APP_ANALYTICS_API=https://analytics.example.com

# Enable/Disable Analytics
REACT_APP_ANALYTICS_ENABLED=true
```

### Runtime Configuration

```typescript
import analytics from '@/shared/utils/analytics';

// Enable/disable analytics
analytics.enable();
analytics.disable();

// Check if enabled
if (analytics.isEnabled()) {
  // Track event
}

// Add/remove providers
analytics.addProvider(myProvider);
analytics.removeProvider('provider-name');
```

## Troubleshooting

### Events Not Showing in Console

Make sure you're in development mode and the console provider is added:

```typescript
if (process.env.NODE_ENV === 'development') {
  analytics.addProvider(new ConsoleAnalyticsProvider());
}
```

### Google Analytics Not Working

1. Verify the GA script is loaded in your HTML
2. Check the measurement ID is correct
3. Open browser console and check for errors
4. Use Google Analytics DebugView to see real-time events

### Events Not Including User Context

Make sure `AnalyticsProvider` is wrapping your app and receiving the user prop:

```tsx
<AnalyticsProvider user={user}>
  {/* Your app */}
</AnalyticsProvider>
```

## Related Documentation

- [Analytics Quick Reference](./ANALYTICS_QUICK_REFERENCE.md)
- [Performance Optimization](../../features/member-area/docs/PERFORMANCE_OPTIMIZATION.md)
- [Error Handling](./ERROR_HANDLING.md)

## Support

For questions or issues with analytics tracking, please contact the development team or refer to the examples in the codebase.

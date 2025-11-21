# Analytics Integration for Member Area

This guide shows how to integrate the analytics system into the Member Area application.

## Step 1: Wrap MemberArea with AnalyticsProvider

Update `src/features/member-area/MemberArea.tsx`:

```tsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UIProvider } from './contexts/UIContext';
import { ToastProvider } from '../../shared/contexts/ToastContext';
import { AnalyticsProvider } from '../../shared/components';
import MemberRoutes from './routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Inner component to access auth context
const MemberAreaContent: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <AnalyticsProvider user={user} enabled={true}>
      <UIProvider>
        <ToastProvider>
          <MemberRoutes />
        </ToastProvider>
      </UIProvider>
    </AnalyticsProvider>
  );
};

const MemberArea: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <MemberAreaContent />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default MemberArea;
```

## Step 2: Add Tracking to Dashboard

Update `src/features/member-area/pages/Dashboard.tsx`:

```tsx
import React from 'react';
import { usePageViewTracking, useButtonTracking } from '../../../shared/hooks';

const Dashboard: React.FC = () => {
  // Automatic page view tracking
  usePageViewTracking('Dashboard');
  
  // Track refresh button
  const trackRefresh = useButtonTracking('Dashboard', 'Refresh Button');
  
  const handleRefresh = () => {
    trackRefresh();
    // Refresh logic
  };
  
  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={handleRefresh}>Refresh</button>
      {/* Rest of dashboard */}
    </div>
  );
};

export default Dashboard;
```

## Step 3: Add Purchase Tracking

Update `src/features/member-area/components/products/ProductCard.tsx`:

```tsx
import React from 'react';
import { usePurchaseTracking } from '../../../../shared/hooks';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const {
    trackPurchaseStart,
    trackPurchaseComplete,
    trackPurchaseError
  } = usePurchaseTracking();
  
  const handleBuyClick = () => {
    trackPurchaseStart(product.id, product.title, product.price);
    // Show purchase modal
  };
  
  const handlePurchaseConfirm = async () => {
    try {
      const transaction = await purchaseProduct(product.id);
      
      trackPurchaseComplete(
        transaction.id,
        product.id,
        product.title,
        1,
        product.price
      );
      
      showSuccessToast('Purchase successful!');
    } catch (error: any) {
      trackPurchaseError(product.id, product.title, error.message);
      showErrorToast('Purchase failed');
    }
  };
  
  return (
    <div>
      {/* Product card content */}
      <button onClick={handleBuyClick}>Buy Now</button>
    </div>
  );
};
```

## Step 4: Add Form Tracking

Update `src/features/member-area/components/topup/TopUpForm.tsx`:

```tsx
import React, { useState } from 'react';
import { useFormTracking } from '../../../../shared/hooks';

const TopUpForm: React.FC = () => {
  const [amount, setAmount] = useState(0);
  const { trackFormStart, trackFormSubmit, trackFormError } = useFormTracking('Top Up Form');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount < 10000) {
      trackFormError('amount', 'Amount below minimum');
      return;
    }
    
    try {
      await processTopUp({ amount });
      trackFormSubmit(true, { amount });
      showSuccessToast('Top up successful!');
    } catch (error: any) {
      trackFormSubmit(false, { error: error.message });
      showErrorToast('Top up failed');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} onFocus={trackFormStart}>
      {/* Form fields */}
    </form>
  );
};
```

## Step 5: Add Navigation Tracking

Update `src/features/member-area/components/layout/Sidebar.tsx`:

```tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigationTracking } from '../../../../shared/hooks';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { trackNavigation } = useNavigationTracking();
  
  const handleNavigate = (path: string, label: string) => {
    trackNavigation(path, 'sidebar');
    navigate(path);
  };
  
  return (
    <nav>
      <button onClick={() => handleNavigate('/member/dashboard', 'Dashboard')}>
        Dashboard
      </button>
      <button onClick={() => handleNavigate('/member/transactions', 'Transactions')}>
        Transactions
      </button>
      {/* Other menu items */}
    </nav>
  );
};
```

## Step 6: Add Search Tracking

Update product search components:

```tsx
import React, { useState } from 'react';
import { useSearchTracking } from '../../../../shared/hooks';

const ProductSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const { trackSearch, trackSearchResultClick } = useSearchTracking('Product Search');
  
  const handleSearch = async (searchQuery: string) => {
    const searchResults = await searchProducts(searchQuery);
    setResults(searchResults);
    trackSearch(searchQuery, searchResults.length);
  };
  
  const handleResultClick = (result: Product, index: number) => {
    trackSearchResultClick(query, result.id, index);
    navigate(`/member/accounts/bm/${result.id}`);
  };
  
  return (
    <div>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          handleSearch(e.target.value);
        }}
      />
      {results.map((result, index) => (
        <div key={result.id} onClick={() => handleResultClick(result, index)}>
          {result.title}
        </div>
      ))}
    </div>
  );
};
```

## Step 7: Add Filter Tracking

Update filter components:

```tsx
import React from 'react';
import { useFilterTracking } from '../../../../shared/hooks';

const ProductFilters: React.FC = () => {
  const { trackFilterChange, trackSortChange } = useFilterTracking('BM Accounts');
  
  const handleCategoryChange = (category: string) => {
    setCategory(category);
    trackFilterChange('category', category);
  };
  
  const handleSortChange = (sortBy: string, sortOrder: string) => {
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
};
```

## Step 8: Configure Analytics Providers

### For Development

The console provider is automatically enabled in development mode. Check the browser console to see analytics events.

### For Production with Google Analytics

1. Add Google Analytics script to `public/index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

2. Update `src/shared/utils/analytics.ts`:

```typescript
// In production, add Google Analytics
if (process.env.NODE_ENV === 'production') {
  const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;
  if (GA_MEASUREMENT_ID) {
    analytics.addProvider(new GoogleAnalyticsProvider(GA_MEASUREMENT_ID));
  }
}
```

3. Set environment variable:

```env
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### For Custom Analytics API

1. Update `src/shared/utils/analytics.ts`:

```typescript
if (process.env.NODE_ENV === 'production') {
  const ANALYTICS_API = process.env.REACT_APP_ANALYTICS_API;
  if (ANALYTICS_API) {
    analytics.addProvider(new CustomAPIAnalyticsProvider(ANALYTICS_API));
  }
}
```

2. Set environment variable:

```env
REACT_APP_ANALYTICS_API=https://analytics.canvangogroup.com
```

## Step 9: Test Analytics

### In Development

1. Open browser console
2. Navigate through the app
3. Perform actions (clicks, form submissions, etc.)
4. Check console for analytics events

### In Production

1. Open Google Analytics Real-Time view
2. Navigate through the app
3. Verify events appear in GA
4. Check event parameters and user properties

## Common Tracking Patterns

### Track Modal Interactions

```tsx
import { useModalTracking } from '../../../shared/hooks';

const MyModal: React.FC = ({ isOpen, onClose }) => {
  const { trackModalOpen, trackModalClose, trackModalAction } = useModalTracking('Purchase Confirmation');
  
  useEffect(() => {
    if (isOpen) trackModalOpen();
  }, [isOpen]);
  
  const handleClose = () => {
    trackModalClose('button');
    onClose();
  };
  
  const handleConfirm = () => {
    trackModalAction('confirm');
    // Confirm logic
  };
};
```

### Track API Interactions

```tsx
import { useAnalytics } from '../../../shared/hooks';

const APIKeyDisplay: React.FC = () => {
  const { trackEvent } = useAnalytics();
  
  const handleGenerateKey = async () => {
    trackEvent('API', 'generate_key_start');
    
    try {
      await generateAPIKey();
      trackEvent('API', 'generate_key_success');
    } catch (error) {
      trackEvent('API', 'generate_key_error', undefined, undefined, {
        error: error.message
      });
    }
  };
};
```

### Track Warranty Claims

```tsx
import { useFormTracking } from '../../../shared/hooks';

const WarrantyClaimForm: React.FC = () => {
  const { trackFormStart, trackFormSubmit } = useFormTracking('Warranty Claim');
  
  const handleSubmit = async (data) => {
    try {
      await submitClaim(data);
      trackFormSubmit(true, { reason: data.reason });
    } catch (error) {
      trackFormSubmit(false, { error: error.message });
    }
  };
};
```

## Privacy Considerations

### User Consent

```tsx
import { useState, useEffect } from 'react';
import { AnalyticsProvider } from '../../shared/components';

const MemberAreaContent: React.FC = () => {
  const { user } = useAuth();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  
  useEffect(() => {
    // Check user consent
    const hasConsent = localStorage.getItem('analytics_consent') === 'true';
    setAnalyticsEnabled(hasConsent);
  }, []);
  
  return (
    <AnalyticsProvider user={user} enabled={analyticsEnabled}>
      {/* Content */}
    </AnalyticsProvider>
  );
};
```

### Disable Analytics

```tsx
import analytics from '../../shared/utils/analytics';

// Disable analytics
analytics.disable();

// Enable analytics
analytics.enable();

// Check status
if (analytics.isEnabled()) {
  // Analytics is enabled
}
```

## Troubleshooting

### Events Not Appearing in Console

- Check that you're in development mode
- Verify AnalyticsProvider is wrapping your app
- Check browser console for errors

### Google Analytics Not Working

- Verify GA script is loaded in HTML
- Check measurement ID is correct
- Use GA DebugView to see real-time events
- Check browser console for errors

### User Context Not Included

- Verify AnalyticsProvider receives user prop
- Check that user is authenticated
- Verify AuthContext is providing user data

## Next Steps

1. Add tracking to all key user interactions
2. Set up Google Analytics or custom analytics backend
3. Create dashboards to visualize analytics data
4. Monitor user behavior and optimize UX
5. Set up alerts for important events (purchases, errors, etc.)

## Resources

- [Analytics Guide](../../../shared/docs/ANALYTICS_GUIDE.md)
- [Analytics Quick Reference](../../../shared/docs/ANALYTICS_QUICK_REFERENCE.md)
- [Analytics Examples](../../../shared/components/AnalyticsExample.tsx)
- [Integration Examples](../examples/AnalyticsIntegration.tsx)

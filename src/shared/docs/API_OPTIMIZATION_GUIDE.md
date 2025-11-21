# API Optimization Guide

This guide covers strategies for optimizing API calls in the Member Area application.

## Overview

API optimization improves:
- **Performance**: Faster data loading
- **User Experience**: Reduced waiting times
- **Network Usage**: Less bandwidth consumption
- **Server Load**: Fewer redundant requests

## Optimization Strategies

### 1. Request Deduplication

Prevent duplicate requests for the same resource:

```tsx
import { deduplicateRequest, generateCacheKey } from '@/shared/utils/api-optimization';

// Automatic deduplication
const fetchUser = async () => {
  const key = generateCacheKey({ method: 'GET', url: '/api/user' });
  
  return deduplicateRequest(key, async () => {
    const response = await apiClient.get('/api/user');
    return response.data;
  });
};

// Multiple calls will only trigger one request
Promise.all([
  fetchUser(),
  fetchUser(),
  fetchUser()
]); // Only 1 actual API call
```

### 2. Response Caching

Cache GET requests to avoid redundant calls:

```tsx
import {
  generateCacheKey,
  getCachedResponse,
  setCachedResponse,
  CACHE_PRESETS
} from '@/shared/utils/api-optimization';

const fetchProducts = async (filters: any) => {
  const key = generateCacheKey({
    method: 'GET',
    url: '/api/products',
    params: filters
  });

  // Check cache first
  const cached = getCachedResponse(key);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const response = await apiClient.get('/api/products', { params: filters });
  
  // Cache response
  setCachedResponse(key, response.data, CACHE_PRESETS.medium);
  
  return response.data;
};
```

### 3. React Query Optimization

Use optimized React Query configuration:

```tsx
import { useQuery } from '@tanstack/react-query';
import { queryKeys, cacheConfig } from '@/shared/config/react-query.config';

// Standard query with optimized caching
const { data, isLoading } = useQuery({
  queryKey: queryKeys.products.list({ category: 'bm' }),
  queryFn: () => fetchProducts({ category: 'bm' }),
  ...cacheConfig.standard, // 5 minute cache
});

// Static data with longer cache
const { data: tutorials } = useQuery({
  queryKey: queryKeys.tutorials.all,
  queryFn: fetchTutorials,
  ...cacheConfig.static, // 15 minute cache
});

// Real-time data with short cache
const { data: balance } = useQuery({
  queryKey: queryKeys.user.stats(),
  queryFn: fetchUserStats,
  ...cacheConfig.realtime, // 30 second cache
});
```

### 4. Query Key Optimization

Use consistent query keys:

```tsx
import { queryKeys } from '@/shared/config/react-query.config';

// ✅ Good: Use query key factory
useQuery({
  queryKey: queryKeys.products.list({ category: 'bm', page: 1 }),
  queryFn: fetchProducts
});

// ❌ Bad: Inconsistent keys
useQuery({
  queryKey: ['products', { page: 1, category: 'bm' }], // Different order
  queryFn: fetchProducts
});
```

### 5. Prefetching

Prefetch data before it's needed:

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys, prefetchHelpers } from '@/shared/config/react-query.config';

function ProductCard({ product }) {
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    // Prefetch product details on hover
    prefetchHelpers.prefetchProductDetail(
      queryClient,
      product.id,
      () => fetchProductDetail(product.id)
    );
  };

  return (
    <div onMouseEnter={handleMouseEnter}>
      {/* Card content */}
    </div>
  );
}
```

### 6. Cache Invalidation

Invalidate cache after mutations:

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidationHelpers } from '@/shared/config/react-query.config';

const { mutate } = useMutation({
  mutationFn: purchaseProduct,
  onSuccess: () => {
    // Invalidate related queries
    invalidationHelpers.invalidateProducts(queryClient);
    invalidationHelpers.invalidateTransactions(queryClient);
    invalidationHelpers.invalidateUser(queryClient);
  }
});
```

### 7. Request Batching

Batch multiple requests together:

```tsx
import { RequestBatcher } from '@/shared/utils/api-optimization';

// Create batcher
const productBatcher = new RequestBatcher(
  async (ids: string[]) => {
    // Fetch multiple products in one request
    const response = await apiClient.post('/api/products/batch', { ids });
    return response.data;
  },
  50 // 50ms delay
);

// Add requests
const product1 = await productBatcher.add('1');
const product2 = await productBatcher.add('2');
const product3 = await productBatcher.add('3');
// All 3 requests batched into 1 API call
```

### 8. Request Prioritization

Prioritize critical requests:

```tsx
import { requestQueue, RequestPriority } from '@/shared/utils/api-optimization';

// Critical request (user auth)
requestQueue.add(RequestPriority.CRITICAL, () => 
  apiClient.get('/api/user')
);

// High priority (above-the-fold data)
requestQueue.add(RequestPriority.HIGH, () =>
  apiClient.get('/api/dashboard/stats')
);

// Normal priority (below-the-fold data)
requestQueue.add(RequestPriority.NORMAL, () =>
  apiClient.get('/api/products')
);

// Low priority (prefetch)
requestQueue.add(RequestPriority.LOW, () =>
  apiClient.get('/api/tutorials')
);
```

## Cache Configuration

### Cache Presets

```tsx
import { CACHE_PRESETS } from '@/shared/utils/api-optimization';

// Real-time data (30 seconds)
CACHE_PRESETS.realtime

// Short cache (1 minute)
CACHE_PRESETS.short

// Medium cache (5 minutes) - default
CACHE_PRESETS.medium

// Long cache (15 minutes)
CACHE_PRESETS.long

// Static cache (1 hour)
CACHE_PRESETS.static

// Infinite cache
CACHE_PRESETS.infinite
```

### Cache by Data Type

| Data Type | Cache Duration | Reason |
|-----------|---------------|--------|
| User balance | 30 seconds | Changes frequently |
| Product list | 5 minutes | Updates occasionally |
| Product details | 15 minutes | Rarely changes |
| Tutorials | 1 hour | Static content |
| API documentation | Infinite | Never changes |

## Best Practices

### 1. Use Query Keys Consistently

```tsx
// ✅ Good: Use query key factory
import { queryKeys } from '@/shared/config/react-query.config';

useQuery({
  queryKey: queryKeys.products.list({ category: 'bm' }),
  queryFn: fetchProducts
});

// ❌ Bad: Manual keys
useQuery({
  queryKey: ['products', 'bm'],
  queryFn: fetchProducts
});
```

### 2. Invalidate Related Queries

```tsx
// ✅ Good: Invalidate all related queries
onSuccess: () => {
  invalidationHelpers.invalidateProducts(queryClient);
  invalidationHelpers.invalidateUser(queryClient); // Balance changed
}

// ❌ Bad: Forget to invalidate
onSuccess: () => {
  // Products updated but cache not invalidated
}
```

### 3. Prefetch on User Intent

```tsx
// ✅ Good: Prefetch on hover
<Link
  to="/products/1"
  onMouseEnter={() => prefetchProduct('1')}
>
  View Product
</Link>

// ❌ Bad: Prefetch everything
useEffect(() => {
  // Prefetch all 1000 products
  products.forEach(p => prefetchProduct(p.id));
}, []);
```

### 4. Use Appropriate Cache Duration

```tsx
// ✅ Good: Match cache to data volatility
useQuery({
  queryKey: queryKeys.user.stats(),
  queryFn: fetchUserStats,
  staleTime: CACHE_PRESETS.realtime // 30 seconds
});

// ❌ Bad: Long cache for volatile data
useQuery({
  queryKey: queryKeys.user.stats(),
  queryFn: fetchUserStats,
  staleTime: CACHE_PRESETS.static // 1 hour - too long!
});
```

### 5. Deduplicate Requests

```tsx
// ✅ Good: Automatic deduplication
const fetchUser = () => {
  const key = generateCacheKey({ method: 'GET', url: '/api/user' });
  return deduplicateRequest(key, () => apiClient.get('/api/user'));
};

// ❌ Bad: Multiple identical requests
const fetchUser = () => apiClient.get('/api/user');
// Called 3 times = 3 API calls
```

## Performance Metrics

### Target Metrics

- **Cache Hit Rate**: > 70%
- **Duplicate Requests**: < 5%
- **Average Response Time**: < 500ms
- **Failed Requests**: < 1%

### Monitoring

```tsx
import { getCacheStats, getInFlightStats } from '@/shared/utils/api-optimization';

// Check cache statistics
const cacheStats = getCacheStats();
console.log('Cache stats:', cacheStats);
// { total: 50, valid: 45, expired: 5 }

// Check in-flight requests
const inFlightStats = getInFlightStats();
console.log('In-flight requests:', inFlightStats);
// { count: 3, keys: [...] }
```

## Common Patterns

### Dashboard Data Loading

```tsx
function Dashboard() {
  // Parallel queries with different cache strategies
  const { data: user } = useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: fetchUserProfile,
    ...cacheConfig.standard
  });

  const { data: stats } = useQuery({
    queryKey: queryKeys.user.stats(),
    queryFn: fetchUserStats,
    ...cacheConfig.realtime
  });

  const { data: transactions } = useQuery({
    queryKey: queryKeys.transactions.list({ limit: 5 }),
    queryFn: () => fetchTransactions({ limit: 5 }),
    ...cacheConfig.standard
  });

  return <div>...</div>;
}
```

### Product Listing with Filters

```tsx
function ProductList({ filters }) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => fetchProducts(filters),
    ...cacheConfig.standard,
    keepPreviousData: true // Keep old data while fetching new
  });

  return <div>...</div>;
}
```

### Optimistic Updates

```tsx
const { mutate } = useMutation({
  mutationFn: updateProduct,
  onMutate: async (newProduct) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries({ 
      queryKey: queryKeys.products.detail(newProduct.id) 
    });

    // Snapshot previous value
    const previous = queryClient.getQueryData(
      queryKeys.products.detail(newProduct.id)
    );

    // Optimistically update
    queryClient.setQueryData(
      queryKeys.products.detail(newProduct.id),
      newProduct
    );

    return { previous };
  },
  onError: (err, newProduct, context) => {
    // Rollback on error
    queryClient.setQueryData(
      queryKeys.products.detail(newProduct.id),
      context?.previous
    );
  },
  onSettled: (newProduct) => {
    // Refetch after mutation
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.products.detail(newProduct.id) 
    });
  }
});
```

## Troubleshooting

### Issue: Too Many Requests

**Solution**: Enable request deduplication

```tsx
import { deduplicateRequest, generateCacheKey } from '@/shared/utils/api-optimization';

const fetchData = () => {
  const key = generateCacheKey({ method: 'GET', url: '/api/data' });
  return deduplicateRequest(key, () => apiClient.get('/api/data'));
};
```

### Issue: Stale Data

**Solution**: Reduce stale time or invalidate cache

```tsx
// Option 1: Reduce stale time
useQuery({
  queryKey: queryKeys.user.stats(),
  queryFn: fetchUserStats,
  staleTime: CACHE_PRESETS.realtime // 30 seconds
});

// Option 2: Invalidate on mutation
onSuccess: () => {
  invalidationHelpers.invalidateUser(queryClient);
}
```

### Issue: Slow Initial Load

**Solution**: Prefetch critical data

```tsx
// In app initialization
useEffect(() => {
  prefetchHelpers.prefetchUserProfile(queryClient, fetchUserProfile);
  prefetchHelpers.prefetchProducts(queryClient, fetchProducts);
}, []);
```

## Checklist

- [ ] Request deduplication enabled
- [ ] Response caching configured
- [ ] Query keys use factory functions
- [ ] Cache duration matches data volatility
- [ ] Related queries invalidated after mutations
- [ ] Critical data prefetched
- [ ] Optimistic updates for better UX
- [ ] Cache statistics monitored
- [ ] Performance metrics tracked

## Summary

- Use **request deduplication** to prevent duplicate calls
- Implement **response caching** for GET requests
- Use **React Query** with optimized configuration
- **Prefetch** data on user intent
- **Invalidate** cache after mutations
- **Batch** requests when possible
- **Prioritize** critical requests
- **Monitor** cache hit rate and performance

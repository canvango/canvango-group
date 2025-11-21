# Performance Optimization Guide

This document outlines the performance optimizations implemented in the Member Area Content Framework.

## Table of Contents

1. [Code Splitting](#code-splitting)
2. [React Query Caching](#react-query-caching)
3. [Image Optimization](#image-optimization)
4. [Search Debouncing](#search-debouncing)
5. [Virtual Scrolling](#virtual-scrolling)
6. [Best Practices](#best-practices)

## Code Splitting

### Implementation

All pages are lazy-loaded using React's `lazy()` and `Suspense`:

```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TransactionHistory = lazy(() => import('./pages/TransactionHistory'));
// ... other pages
```

### Benefits

- Reduces initial bundle size
- Faster initial page load
- Pages are loaded on-demand

### Usage

Code splitting is automatically applied to all routes. No additional configuration needed.

## React Query Caching

### Configuration

React Query is configured with optimal cache settings:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 10 * 60 * 1000,        // 10 minutes (garbage collection time)
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});
```

### Benefits

- Reduces redundant API calls
- Improves perceived performance
- Implements stale-while-revalidate strategy
- Automatic cache invalidation on mutations

### Usage

All data fetching hooks automatically use React Query caching:

```typescript
const { data, isLoading } = useProducts({ category: 'bm' });
```

## Image Optimization

### LazyImage Component

Images are lazy-loaded using Intersection Observer:

```typescript
import { LazyImage } from '@/shared/components';

<LazyImage
  src="/path/to/image.jpg"
  alt="Description"
  placeholder="/path/to/placeholder.jpg"
  className="w-full h-auto"
/>
```

### Features

- Lazy loading with Intersection Observer
- Automatic placeholder display
- Smooth fade-in transition
- Fallback for older browsers

### Image Optimization Utilities

```typescript
import {
  isWebPSupported,
  getOptimizedImageSrc,
  generateSrcSet,
  preloadImages,
  createPlaceholder,
  getOptimalImageQuality
} from '@/shared/utils/image-optimization';

// Check WebP support
const supportsWebP = isWebPSupported();

// Get optimized image source
const imageSrc = getOptimizedImageSrc('/images/product', 'png');

// Generate responsive srcset
const srcSet = generateSrcSet('/images/product', [320, 640, 1024]);

// Preload critical images
preloadImages(['/logo.png', '/hero.jpg']);

// Create placeholder
const placeholder = createPlaceholder(400, 300, '#f3f4f6');

// Get optimal quality based on connection
const quality = getOptimalImageQuality();
```

### useLazyLoad Hook

For custom lazy loading implementations:

```typescript
import { useLazyLoad } from '@/shared/hooks/useLazyLoad';

const MyComponent = () => {
  const { ref, isVisible } = useLazyLoad({ rootMargin: '50px' });

  return (
    <div ref={ref}>
      {isVisible && <ExpensiveComponent />}
    </div>
  );
};
```

## Search Debouncing

### useDebounce Hook

Debounces values to reduce unnecessary updates:

```typescript
import { useDebounce } from '@/shared/hooks/useDebounce';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearchTerm = useDebounce(searchTerm, 500);

useEffect(() => {
  // This only runs 500ms after user stops typing
  fetchResults(debouncedSearchTerm);
}, [debouncedSearchTerm]);
```

### useDebouncedCallback Hook

Debounces callback functions:

```typescript
import { useDebouncedCallback } from '@/shared/hooks/useDebounce';

const handleSearch = useDebouncedCallback((term: string) => {
  fetchResults(term);
}, 500);
```

### Implementation in Search Components

Search components automatically implement debouncing:

```typescript
<SearchSortBar
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  debounceDelay={500} // Optional, defaults to 500ms
  // ... other props
/>
```

### Benefits

- Reduces API calls during typing
- Improves server load
- Better user experience with loading indicators
- Configurable delay

## Virtual Scrolling

### When to Use

Use virtual scrolling when displaying:
- More than 50 products in a grid
- More than 100 rows in a table
- Any list with 100+ items

### VirtualList Component

For simple lists:

```typescript
import { VirtualList } from '@/shared/components';

<VirtualList
  items={items}
  itemHeight={60}
  containerHeight={600}
  overscan={3}
  renderItem={(item, index) => (
    <div key={item.id}>{item.name}</div>
  )}
/>
```

### VirtualGrid Component

For grid layouts (recommended for product catalogs):

```typescript
import { VirtualGrid } from '@/shared/components';

<VirtualGrid
  items={products}
  itemHeight={380}
  containerHeight={800}
  columns={4}
  gap={24}
  overscan={2}
  renderItem={(product) => (
    <ProductCard product={product} />
  )}
/>
```

### VirtualTable Component

For large tables:

```typescript
import { VirtualTable } from '@/shared/components';

<VirtualTable
  data={transactions}
  columns={[
    { key: 'id', header: 'ID' },
    { key: 'date', header: 'Date', render: (item) => formatDate(item.date) },
    { key: 'amount', header: 'Amount', render: (item) => formatCurrency(item.amount) },
  ]}
  rowHeight={60}
  containerHeight={600}
  onRowClick={(item) => handleRowClick(item)}
/>
```

### VirtualProductGrid Component

Pre-configured for product displays:

```typescript
import VirtualProductGrid from '@/features/member-area/components/products/VirtualProductGrid';

<VirtualProductGrid
  products={products}
  onBuy={handleBuy}
  onViewDetails={handleViewDetails}
  containerHeight={800}
  columns={4}
/>
```

### useVirtualScroll Hook

For custom implementations:

```typescript
import { useVirtualScroll } from '@/shared/hooks/useVirtualScroll';

const { virtualItems, totalHeight, scrollToIndex, containerRef } = useVirtualScroll(
  items,
  { itemHeight: 60, containerHeight: 600, overscan: 3 }
);
```

### Benefits

- Renders only visible items
- Constant performance regardless of list size
- Smooth scrolling experience
- Reduced memory usage

## Best Practices

### 1. Use Code Splitting for Routes

Always lazy-load page components:

```typescript
// ✅ Good
const Dashboard = lazy(() => import('./pages/Dashboard'));

// ❌ Bad
import Dashboard from './pages/Dashboard';
```

### 2. Leverage React Query Cache

Use React Query for all API calls:

```typescript
// ✅ Good
const { data } = useQuery(['products'], fetchProducts);

// ❌ Bad
const [data, setData] = useState([]);
useEffect(() => {
  fetchProducts().then(setData);
}, []);
```

### 3. Optimize Images

- Use LazyImage for all images
- Provide appropriate placeholders
- Use WebP format when possible
- Compress images before deployment

### 4. Debounce Search Inputs

Always debounce search and filter inputs:

```typescript
// ✅ Good
const debouncedSearch = useDebounce(searchTerm, 500);

// ❌ Bad
onChange={(e) => fetchResults(e.target.value)}
```

### 5. Use Virtual Scrolling for Large Lists

Switch to virtual scrolling when displaying many items:

```typescript
// ✅ Good for 100+ items
<VirtualGrid items={products} ... />

// ✅ Good for < 50 items
<div className="grid grid-cols-4 gap-6">
  {products.map(product => <ProductCard key={product.id} product={product} />)}
</div>
```

### 6. Monitor Bundle Size

Regularly check bundle size:

```bash
npm run build
# Check dist/ folder sizes
```

### 7. Preload Critical Resources

Preload fonts, critical CSS, and above-the-fold images:

```typescript
preloadImages(['/logo.png', '/hero-image.jpg']);
```

### 8. Avoid Unnecessary Re-renders

Use React.memo for expensive components:

```typescript
const ProductCard = React.memo(({ product }) => {
  // Component implementation
});
```

### 9. Optimize API Calls

- Use pagination for large datasets
- Implement infinite scroll for better UX
- Cache responses appropriately
- Batch related requests

### 10. Test Performance

Regularly test performance:

- Use Chrome DevTools Performance tab
- Test on slower devices
- Monitor Core Web Vitals
- Use Lighthouse for audits

## Performance Metrics

### Target Metrics

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

### Monitoring

Use browser DevTools and Lighthouse to monitor:

```bash
# Run Lighthouse audit
npm run build
npx serve -s dist
# Open Chrome DevTools > Lighthouse
```

## Troubleshooting

### Slow Initial Load

- Check bundle size
- Ensure code splitting is working
- Verify lazy loading implementation
- Optimize images

### Slow Search

- Verify debouncing is implemented
- Check API response times
- Consider client-side filtering for small datasets

### Janky Scrolling

- Implement virtual scrolling
- Reduce component complexity
- Use CSS transforms for animations
- Avoid layout thrashing

### High Memory Usage

- Implement virtual scrolling
- Clear unused cache
- Optimize image sizes
- Check for memory leaks

## Additional Resources

- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

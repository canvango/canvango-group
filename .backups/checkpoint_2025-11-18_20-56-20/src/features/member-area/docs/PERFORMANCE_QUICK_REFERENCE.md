# Performance Optimization - Quick Reference

Quick reference guide for implementing performance optimizations in the Member Area.

## 🚀 Quick Wins

### 1. Lazy Load Images
```typescript
import { LazyImage } from '@/shared/components';

<LazyImage src="/image.jpg" alt="Description" />
```

### 2. Debounce Search
```typescript
import { useDebounce } from '@/shared/hooks/useDebounce';

const debouncedValue = useDebounce(searchTerm, 500);
```

### 3. Virtual Scrolling (50+ items)
```typescript
import { VirtualGrid } from '@/shared/components';

<VirtualGrid
  items={items}
  itemHeight={300}
  containerHeight={800}
  columns={4}
  renderItem={(item) => <Card item={item} />}
/>
```

## 📊 When to Use What

| Scenario | Solution | Threshold |
|----------|----------|-----------|
| Product Grid | VirtualGrid | 50+ products |
| Transaction Table | VirtualTable | 100+ rows |
| Search Input | useDebounce | Always |
| Images | LazyImage | Below fold |
| Page Routes | lazy() | Always |

## 🎯 Component Cheat Sheet

### LazyImage
```typescript
<LazyImage
  src="/path/to/image.jpg"
  alt="Description"
  placeholder="/placeholder.jpg"  // Optional
  className="w-full h-auto"
/>
```

### VirtualList
```typescript
<VirtualList
  items={items}
  itemHeight={60}
  containerHeight={600}
  renderItem={(item) => <div>{item.name}</div>}
/>
```

### VirtualGrid
```typescript
<VirtualGrid
  items={products}
  itemHeight={380}
  containerHeight={800}
  columns={4}
  gap={24}
  renderItem={(product) => <ProductCard product={product} />}
/>
```

### VirtualTable
```typescript
<VirtualTable
  data={transactions}
  columns={[
    { key: 'id', header: 'ID' },
    { key: 'date', header: 'Date' },
  ]}
  rowHeight={60}
  containerHeight={600}
/>
```

## 🔧 Hook Cheat Sheet

### useDebounce
```typescript
const [value, setValue] = useState('');
const debouncedValue = useDebounce(value, 500);

useEffect(() => {
  // Runs 500ms after user stops typing
  fetchData(debouncedValue);
}, [debouncedValue]);
```

### useDebouncedCallback
```typescript
const handleSearch = useDebouncedCallback((term: string) => {
  fetchResults(term);
}, 500);

<input onChange={(e) => handleSearch(e.target.value)} />
```

### useLazyLoad
```typescript
const { ref, isVisible } = useLazyLoad();

<div ref={ref}>
  {isVisible && <ExpensiveComponent />}
</div>
```

### useVirtualScroll
```typescript
const { virtualItems, totalHeight, containerRef } = useVirtualScroll(
  items,
  { itemHeight: 60, containerHeight: 600 }
);
```

## 🎨 Image Optimization Utils

```typescript
import {
  isWebPSupported,
  getOptimizedImageSrc,
  generateSrcSet,
  preloadImages,
  createPlaceholder,
} from '@/shared/utils/image-optimization';

// Check WebP support
const supportsWebP = isWebPSupported();

// Get optimized source
const src = getOptimizedImageSrc('/images/product', 'png');

// Generate srcset
const srcSet = generateSrcSet('/images/product', [320, 640, 1024]);

// Preload critical images
preloadImages(['/logo.png', '/hero.jpg']);

// Create placeholder
const placeholder = createPlaceholder(400, 300);
```

## ⚡ Performance Checklist

- [ ] All routes use lazy loading
- [ ] Search inputs are debounced
- [ ] Images use LazyImage component
- [ ] Large lists use virtual scrolling
- [ ] React Query caching is configured
- [ ] Bundle size is monitored
- [ ] Performance metrics are tracked

## 🎯 Target Metrics

| Metric | Target | Critical |
|--------|--------|----------|
| FCP | < 1.8s | < 3.0s |
| LCP | < 2.5s | < 4.0s |
| TTI | < 3.8s | < 7.3s |
| CLS | < 0.1 | < 0.25 |
| FID | < 100ms | < 300ms |

## 🔍 Quick Debugging

### Slow Initial Load
1. Check bundle size: `npm run build`
2. Verify lazy loading in routes
3. Check for large dependencies

### Slow Search
1. Verify debouncing is active
2. Check API response time
3. Consider client-side filtering

### Janky Scrolling
1. Implement virtual scrolling
2. Check for expensive renders
3. Use React DevTools Profiler

### High Memory
1. Use virtual scrolling
2. Check for memory leaks
3. Clear unused cache

## 📚 Full Documentation

For detailed information, see:
`src/features/member-area/docs/PERFORMANCE_OPTIMIZATION.md`

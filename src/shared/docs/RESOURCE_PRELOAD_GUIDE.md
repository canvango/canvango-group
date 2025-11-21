# Resource Preloading Guide

This guide covers strategies for preloading critical resources to improve application performance.

## Overview

Resource preloading helps improve performance by:
- **Reducing load times**: Critical resources load faster
- **Improving perceived performance**: Users see content sooner
- **Optimizing network usage**: Resources load in optimal order
- **Better user experience**: Smoother navigation and interactions

## Preload Types

### 1. Preload (High Priority)

Loads resources that will be needed soon:

```tsx
import { usePreload } from '@/shared/hooks/usePreload';

// Preload a font
usePreload('/fonts/inter-var.woff2', {
  as: 'font',
  type: 'font/woff2',
  crossOrigin: 'anonymous'
});

// Preload an image
usePreload('/images/hero.webp', {
  as: 'image'
});

// Preload a stylesheet
usePreload('/styles/critical.css', {
  as: 'style'
});
```

### 2. Prefetch (Low Priority)

Loads resources that might be needed later:

```tsx
import { usePrefetch } from '@/shared/hooks/usePreload';

// Prefetch next page resources
usePrefetch([
  '/api/products',
  '/images/product-1.webp',
  '/images/product-2.webp'
]);
```

### 3. Preconnect

Establishes early connections to external domains:

```tsx
import { usePreconnect } from '@/shared/hooks/usePreload';

// Preconnect to external services
usePreconnect([
  'https://fonts.googleapis.com',
  'https://api.example.com',
  'https://cdn.example.com'
]);
```

### 4. DNS Prefetch

Resolves DNS for external domains:

```tsx
import { useDNSPrefetch } from '@/shared/hooks/usePreload';

// DNS prefetch for external domains
useDNSPrefetch([
  'https://analytics.example.com',
  'https://cdn.example.com'
]);
```

## Usage Patterns

### Critical Resources on App Mount

```tsx
import { useCriticalResources } from '@/shared/hooks/usePreload';

function App() {
  // Preload critical resources
  useCriticalResources();

  return <div>...</div>;
}
```

Or use the ResourcePreloader component:

```tsx
import ResourcePreloader from '@/shared/components/ResourcePreloader';

<ResourcePreloader>
  <App />
</ResourcePreloader>
```

### Preload Fonts

```tsx
import { usePreloadFonts } from '@/shared/hooks/usePreload';

function App() {
  usePreloadFonts([
    '/fonts/inter-var.woff2',
    '/fonts/inter-bold.woff2'
  ]);

  return <div>...</div>;
}
```

### Prefetch on Hover

Automatically prefetch resources when user hovers over links:

```tsx
import { usePrefetchOnHover } from '@/shared/hooks/usePreload';

function Navigation() {
  // Enable prefetch on hover for all links
  usePrefetchOnHover(true);

  return (
    <nav>
      <a href="/products">Products</a>
      <a href="/about">About</a>
    </nav>
  );
}
```

### Prefetch Next Page

```tsx
import { prefetchNextPage } from '@/shared/utils/resource-preload';

function ProductCard({ product }) {
  const handleMouseEnter = () => {
    // Prefetch product detail page
    prefetchNextPage(`/products/${product.id}`);
  };

  return (
    <div onMouseEnter={handleMouseEnter}>
      {/* Card content */}
    </div>
  );
}
```

### Preload Multiple Resources

```tsx
import { usePreloadResources } from '@/shared/hooks/usePreload';

function Dashboard() {
  usePreloadResources([
    { href: '/fonts/inter-var.woff2', options: { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' } },
    { href: '/images/hero.webp', options: { as: 'image' } },
    { href: '/styles/dashboard.css', options: { as: 'style' } }
  ]);

  return <div>...</div>;
}
```

## Best Practices

### 1. Prioritize Critical Resources

Preload only what's needed immediately:

```tsx
// ✅ Good: Preload critical fonts
usePreloadFonts(['/fonts/inter-var.woff2']);

// ❌ Bad: Preload all fonts
usePreloadFonts([
  '/fonts/inter-var.woff2',
  '/fonts/inter-bold.woff2',
  '/fonts/inter-italic.woff2',
  // ... 10 more fonts
]);
```

### 2. Use Appropriate Preload Type

```tsx
// ✅ Good: Preload for immediate use
usePreload('/images/hero.webp', { as: 'image' });

// ✅ Good: Prefetch for later use
usePrefetch(['/images/gallery-1.webp', '/images/gallery-2.webp']);

// ❌ Bad: Preload everything
usePreload('/images/gallery-50.webp', { as: 'image' }); // Not needed immediately
```

### 3. Preconnect to External Domains

```tsx
// ✅ Good: Preconnect to frequently used domains
usePreconnect([
  'https://fonts.googleapis.com',
  'https://api.example.com'
]);

// ❌ Bad: Preconnect to rarely used domains
usePreconnect([
  'https://rarely-used-service.com'
]);
```

### 4. Avoid Over-Preloading

```tsx
// ✅ Good: Preload 2-3 critical resources
usePreloadResources([
  { href: '/fonts/main.woff2', options: { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' } },
  { href: '/images/hero.webp', options: { as: 'image' } }
]);

// ❌ Bad: Preload 20+ resources
usePreloadResources([
  // ... 20+ resources
]); // Defeats the purpose
```

### 5. Use Prefetch for Navigation

```tsx
// ✅ Good: Prefetch likely next pages
function ProductList() {
  usePrefetch([
    '/products/1',
    '/products/2',
    '/products/3'
  ]);

  return <div>...</div>;
}
```

## Performance Impact

### Preload Benefits

- **Fonts**: 100-300ms faster text rendering
- **Images**: 200-500ms faster image display
- **Styles**: 50-150ms faster style application
- **Scripts**: 100-300ms faster script execution

### Preconnect Benefits

- **DNS Resolution**: 20-120ms saved
- **TCP Connection**: 20-100ms saved
- **TLS Negotiation**: 50-200ms saved
- **Total**: 90-420ms saved per domain

## Common Patterns

### App Initialization

```tsx
// src/App.tsx
import { useCriticalResources } from '@/shared/hooks/usePreload';

function App() {
  useCriticalResources();

  return (
    <Router>
      <Routes>
        {/* Routes */}
      </Routes>
    </Router>
  );
}
```

### Page-Specific Preloading

```tsx
// src/pages/Dashboard.tsx
import { usePreloadResources } from '@/shared/hooks/usePreload';

function Dashboard() {
  usePreloadResources([
    { href: '/api/dashboard/stats', options: { as: 'fetch' } },
    { href: '/images/dashboard-bg.webp', options: { as: 'image' } }
  ]);

  return <div>...</div>;
}
```

### Navigation Prefetching

```tsx
// src/components/Navigation.tsx
import { usePrefetchOnHover } from '@/shared/hooks/usePreload';

function Navigation() {
  usePrefetchOnHover(true);

  return (
    <nav>
      <Link to="/products">Products</Link>
      <Link to="/services">Services</Link>
    </nav>
  );
}
```

## Testing

### Check Preloaded Resources

Open Chrome DevTools → Network tab → Filter by "Other"

Look for resources with:
- **Initiator**: `<link rel="preload">`
- **Priority**: High or Highest

### Measure Impact

Use Lighthouse to measure:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)

### Verify Preconnect

Check Network tab for:
- Early connection establishment
- Reduced connection time for subsequent requests

## Troubleshooting

### Issue: Resources Not Preloading

**Solution**: Check browser support and syntax

```tsx
// Ensure correct syntax
usePreload('/fonts/font.woff2', {
  as: 'font',
  type: 'font/woff2',
  crossOrigin: 'anonymous' // Required for fonts
});
```

### Issue: Too Many Preloads

**Solution**: Limit to 2-3 critical resources

```tsx
// ✅ Good: Only critical resources
usePreloadResources([
  { href: '/fonts/main.woff2', options: { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' } },
  { href: '/images/hero.webp', options: { as: 'image' } }
]);
```

### Issue: Preload Not Used

**Solution**: Ensure resource is actually used

```tsx
// Preload
usePreload('/fonts/inter.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });

// Must be used in CSS
// @font-face {
//   font-family: 'Inter';
//   src: url('/fonts/inter.woff2') format('woff2');
// }
```

## Checklist

- [ ] Critical fonts preloaded
- [ ] Hero images preloaded
- [ ] External domains preconnected
- [ ] API domains DNS prefetched
- [ ] Next pages prefetched on hover
- [ ] Limited to 2-3 preloads per page
- [ ] Preloaded resources are actually used
- [ ] Tested with Lighthouse
- [ ] Network waterfall optimized

## Resources

- [MDN: Preloading Content](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/preload)
- [web.dev: Preload Critical Assets](https://web.dev/preload-critical-assets/)
- [Resource Hints](https://www.w3.org/TR/resource-hints/)

## Summary

- Use **preload** for critical resources needed immediately
- Use **prefetch** for resources needed later
- Use **preconnect** for external domains
- Use **DNS prefetch** for third-party domains
- Limit preloads to 2-3 critical resources
- Test impact with Lighthouse
- Monitor network waterfall for optimization opportunities

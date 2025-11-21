# Bundle Optimization Quick Reference

## Quick Commands

```bash
# Build and analyze bundle
npm run build

# Analyze dependencies
npm run analyze:deps

# Build and open stats visualization
npm run build:analyze

# Development build
npm run dev
```

## Current Bundle Status

### Size Metrics (Gzipped)
- **Total JS**: ~157 KB ✅ (Target: < 200 KB)
- **Total CSS**: ~7 KB ✅ (Target: < 10 KB)
- **Initial Load**: ~30 KB ✅ (Critical path)

### Chunk Breakdown
```
react-vendor:     54.63 KB  (React, React DOM, Router)
supabase-vendor:  39.96 KB  (Supabase client)
index:            21.59 KB  (Main app code)
admin:            14.43 KB  (Admin pages - lazy loaded)
axios-vendor:     14.76 KB  (HTTP client)
ui-vendor:        10.18 KB  (Icons, Toast)
services:          1.02 KB  (API services)
```

## Optimization Checklist

### ✅ Completed
- [x] Bundle analyzer configured
- [x] Code splitting implemented
- [x] Minification enabled (Terser)
- [x] Tree-shaking enabled
- [x] Console.log removal in production
- [x] Gzip compression
- [x] Vendor chunk separation
- [x] Admin pages lazy loaded
- [x] Import patterns optimized
- [x] Dependencies audited

### 🔄 Optional Improvements
- [ ] Replace axios with fetch (~38 KB savings)
- [ ] Extend lazy loading to more routes
- [ ] Dynamic icon imports
- [ ] Image optimization
- [ ] Service worker caching

## Import Best Practices

### ✅ Good Patterns
```typescript
// Named imports (tree-shakeable)
import { HomeIcon, UserIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

// Direct imports
import Button from '../components/Button';
```

### ❌ Bad Patterns
```typescript
// Avoid namespace imports
import * as Icons from '@heroicons/react/24/outline';

// Avoid barrel exports for large libraries
import { Button, Input, Card } from '../components';
```

## Dependency Guidelines

### Keep Dependencies Minimal
- Only add if absolutely necessary
- Check bundle size impact before adding
- Consider native alternatives (e.g., fetch vs axios)
- Verify tree-shaking support

### Before Adding a Dependency
1. Check if native API exists
2. Analyze bundle size impact
3. Verify tree-shaking support
4. Consider maintenance burden
5. Check for lighter alternatives

## Build Configuration

### Vite Config Highlights
```typescript
// Code splitting
manualChunks: (id) => {
  if (id.includes('react')) return 'react-vendor';
  if (id.includes('@supabase')) return 'supabase-vendor';
  // ... more chunks
}

// Minification
minify: 'terser',
terserOptions: {
  compress: {
    drop_console: true,
    drop_debugger: true,
  },
}

// Modern target
target: 'es2015'
```

## Performance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Initial bundle | < 200 KB | 157 KB | ✅ |
| Per-route chunks | < 50 KB | 21 KB | ✅ |
| Vendor chunks | < 200 KB | 54 KB | ✅ |
| CSS | < 10 KB | 7 KB | ✅ |

## Monitoring

### Regular Checks
```bash
# After each build
npm run build
# Check: dist/stats.html

# Monthly dependency audit
npm run analyze:deps
npm outdated
```

### Warning Signs
- ⚠️ Chunk > 500 KB (uncompressed)
- ⚠️ Total bundle > 200 KB (gzipped)
- ⚠️ Duplicate dependencies
- ⚠️ Unused dependencies

## Quick Fixes

### Bundle Too Large?
1. Check `dist/stats.html` for large modules
2. Verify tree-shaking is working
3. Look for duplicate dependencies
4. Consider lazy loading more routes
5. Check for unnecessary imports

### Slow Build?
1. Update dependencies
2. Clear node_modules and reinstall
3. Check for circular dependencies
4. Verify Vite cache is working

### Import Errors?
1. Check import paths
2. Verify package is installed
3. Check TypeScript types
4. Clear Vite cache: `rm -rf node_modules/.vite`

## Axios → Fetch Migration (Optional)

### Quick Migration
```typescript
// Before (axios)
import api from './utils/api';

// After (fetch)
import api from './utils/fetch-wrapper';

// API stays the same!
const data = await api.get('/users');
const result = await api.post('/users', { name: 'John' });
```

**Savings**: ~38 KB (14.76 KB gzipped)

## Resources

- Bundle Analysis: `dist/stats.html`
- Full Guide: `BUNDLE_OPTIMIZATION.md`
- Import Guide: `IMPORT_OPTIMIZATION_GUIDE.md`
- Vite Docs: https://vitejs.dev/guide/build.html

## Common Issues

### Issue: Bundle size increased after adding dependency
**Solution**: 
1. Check `dist/stats.html` to see impact
2. Look for lighter alternatives
3. Verify tree-shaking is working
4. Consider dynamic imports

### Issue: Chunk size warning
**Solution**:
1. Split large chunks further
2. Lazy load heavy components
3. Check for duplicate code
4. Verify code splitting config

### Issue: Slow initial load
**Solution**:
1. Implement more lazy loading
2. Preload critical resources
3. Optimize images
4. Enable compression on server

## Quick Stats

```bash
# View bundle composition
npm run build && open dist/stats.html

# Check dependency sizes
npm run analyze:deps

# List all dependencies
npm list --depth=0

# Check for outdated packages
npm outdated

# Check for security issues
npm audit
```

## Success Criteria

✅ Bundle size < 200 KB (gzipped)  
✅ No unused dependencies  
✅ Tree-shaking working  
✅ Code splitting configured  
✅ Lazy loading implemented  
✅ Minification enabled  
✅ Compression working  

---

**Last Updated**: 2024  
**Bundle Size**: 157 KB (gzipped)  
**Status**: ✅ Optimized

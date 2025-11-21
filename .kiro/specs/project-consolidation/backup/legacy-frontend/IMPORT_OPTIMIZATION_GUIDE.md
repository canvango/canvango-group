# Import Optimization Guide

## Overview
This guide provides best practices for optimizing imports to reduce bundle size and improve tree-shaking effectiveness.

## ✅ Current Good Practices

### 1. Named Imports from Heroicons
```typescript
// ✅ Good - Allows tree-shaking
import { HomeIcon, UserIcon, CogIcon } from '@heroicons/react/24/outline';

// ❌ Bad - Imports entire library
import * as Icons from '@heroicons/react/24/outline';
```

### 2. Direct Component Imports
```typescript
// ✅ Good - Direct imports
import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';

// ❌ Bad - Barrel exports can hurt tree-shaking
import { Button, Input, Card } from '../common';
```

### 3. React Imports
```typescript
// ✅ Good - Named imports
import { useState, useEffect, useMemo } from 'react';

// ❌ Bad - Default import with namespace
import React, { useState } from 'react';
// Then using React.useState, React.useEffect, etc.
```

## 🔄 Optimization Opportunities

### 1. Replace Axios with Fetch API

**Current Bundle Impact**: ~38 KB (14.76 KB gzipped)

#### Before (Axios)
```typescript
import axios from 'axios';

// GET request
const response = await axios.get('/api/users');
const data = response.data;

// POST request
const response = await axios.post('/api/users', {
  name: 'John',
  email: 'john@example.com'
});

// Error handling
try {
  const response = await axios.get('/api/users');
} catch (error) {
  if (axios.isAxiosError(error)) {
    console.error(error.response?.data);
  }
}
```

#### After (Fetch)
```typescript
// Create a fetch wrapper utility
// src/utils/fetch.ts
export async function fetchJSON(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// GET request
const data = await fetchJSON('/api/users');

// POST request
const data = await fetchJSON('/api/users', {
  method: 'POST',
  body: JSON.stringify({
    name: 'John',
    email: 'john@example.com'
  }),
});

// Error handling
try {
  const data = await fetchJSON('/api/users');
} catch (error) {
  console.error(error.message);
}
```

**Benefits**:
- Reduces bundle size by ~38 KB
- Native browser API (no external dependency)
- Modern and well-supported

**Migration Steps**:
1. Create `src/utils/fetch.ts` with fetch wrapper
2. Update `src/utils/api.ts` to use fetch instead of axios
3. Update all service files to use new fetch wrapper
4. Remove axios from package.json
5. Test all API calls

### 2. Lazy Load Routes

**Potential Savings**: 50-100 KB initial bundle

#### Before
```typescript
import Dashboard from './pages/Dashboard';
import AkunBM from './pages/AkunBM';
import AkunPersonal from './pages/AkunPersonal';

<Route path="/dashboard" element={<Dashboard />} />
<Route path="/akun-bm" element={<AkunBM />} />
```

#### After
```typescript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const AkunBM = lazy(() => import('./pages/AkunBM'));
const AkunPersonal = lazy(() => import('./pages/AkunPersonal'));

<Suspense fallback={<LoadingSpinner />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/akun-bm" element={<AkunBM />} />
</Suspense>
```

### 3. Dynamic Icon Imports (Advanced)

For pages with many icons that aren't always visible:

```typescript
// Before - All icons loaded upfront
import {
  HomeIcon,
  UserIcon,
  CogIcon,
  // ... 20 more icons
} from '@heroicons/react/24/outline';

// After - Load icons dynamically
const iconCache = new Map();

async function loadIcon(iconName: string) {
  if (iconCache.has(iconName)) {
    return iconCache.get(iconName);
  }
  
  const module = await import(`@heroicons/react/24/outline/${iconName}.js`);
  const Icon = module.default;
  iconCache.set(iconName, Icon);
  return Icon;
}

// Usage
const [Icon, setIcon] = useState(null);

useEffect(() => {
  loadIcon('HomeIcon').then(setIcon);
}, []);

return Icon ? <Icon className="w-6 h-6" /> : null;
```

**Note**: Only use for icons that are conditionally rendered or in large lists.

## 📋 Import Checklist

### For Every New Import
- [ ] Is this dependency necessary?
- [ ] Can I use a native browser API instead?
- [ ] Am I using named imports (not `import *`)?
- [ ] Is this import tree-shakeable?
- [ ] Should this be lazy-loaded?

### For Large Dependencies
- [ ] Check bundle size impact (use `npm run build:analyze`)
- [ ] Consider alternatives
- [ ] Evaluate if features are worth the size
- [ ] Check if tree-shaking is working

## 🎯 Bundle Size Targets

### Current Status
- Total JS (gzipped): ~157 KB ✅
- CSS (gzipped): ~7 KB ✅
- Largest chunk: 176 KB (React vendor) ✅

### Targets
- Initial bundle: < 200 KB (gzipped) ✅ **Met**
- Per-route chunks: < 50 KB (gzipped) ✅ **Met**
- Vendor chunks: < 200 KB (gzipped) ✅ **Met**

## 🔍 How to Analyze Imports

### 1. Build with Analysis
```bash
npm run build:analyze
```

This will:
1. Build the production bundle
2. Generate `dist/stats.html`
3. Open the visualization in your browser

### 2. Identify Large Dependencies
Look for:
- Large colored blocks in the treemap
- Dependencies you don't recognize
- Multiple versions of the same package

### 3. Check Tree-Shaking
In `stats.html`, look for:
- Unused exports (marked in red)
- Large modules that could be split
- Duplicate code across chunks

## 📚 Resources

- [Vite Build Optimizations](https://vitejs.dev/guide/build.html)
- [Rollup Tree-Shaking](https://rollupjs.org/guide/en/#tree-shaking)
- [Web.dev Bundle Size Guide](https://web.dev/reduce-javascript-payloads-with-tree-shaking/)

## 🚀 Quick Wins

1. **Remove console.log** - Already done ✅
2. **Code splitting** - Already done ✅
3. **Minification** - Already done ✅
4. **Gzip compression** - Server-side (ensure enabled)
5. **Lazy loading** - Partially done (admin pages)

## 📝 Notes

- Always test after optimization changes
- Monitor bundle size in CI/CD
- Set up performance budgets
- Regular audits (monthly recommended)

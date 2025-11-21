# Filter Persistence Guide

This guide explains how to use the filter persistence hooks to maintain user filter preferences across sessions and enable shareable URLs.

## Overview

The filter persistence system provides three hooks:

1. **`useURLFilters`** - Persists filters in URL search parameters
2. **`useLocalStorageFilters`** - Persists filters in localStorage
3. **`usePersistedFilters`** - Combined hook that uses both URL and localStorage

## Features

- ✅ URL-based filter persistence for shareable links
- ✅ Browser back/forward navigation support
- ✅ localStorage persistence for user preferences
- ✅ Automatic cleanup on logout
- ✅ Type-safe filter management
- ✅ Automatic type conversion (string, number, boolean)

## Quick Start

### Basic Usage with Combined Hook

```typescript
import { usePersistedFilters } from '@/shared/hooks/usePersistedFilters';

function ProductsPage() {
  // Define default filters
  const { filters, setFilter, setFilters, resetFilters } = usePersistedFilters(
    'products-page', // Unique storage key
    {
      category: 'all',
      search: '',
      sort: 'newest',
      page: 1,
      minPrice: 0,
      maxPrice: 1000,
      inStock: true,
    }
  );

  // Use filters in your component
  return (
    <div>
      <input
        value={filters.search}
        onChange={(e) => setFilter('search', e.target.value)}
      />
      <select
        value={filters.category}
        onChange={(e) => setFilter('category', e.target.value)}
      >
        <option value="all">All</option>
        <option value="electronics">Electronics</option>
      </select>
    </div>
  );
}
```

## Hook APIs

### usePersistedFilters

Combined hook that persists filters in both URL and localStorage.

```typescript
const {
  filters,        // Current filter values
  setFilter,      // Set a single filter
  setFilters,     // Set multiple filters at once
  resetFilters,   // Reset all filters to defaults
  clearFilter,    // Clear a specific filter
} = usePersistedFilters(
  'storage-key',  // Unique key for localStorage
  defaultFilters, // Default filter values
  {
    useURL: true,          // Enable URL persistence (default: true)
    useLocalStorage: true, // Enable localStorage persistence (default: true)
  }
);
```

### useURLFilters

Persists filters only in URL search parameters.

```typescript
const { filters, setFilter, setFilters, resetFilters, clearFilter } = 
  useURLFilters(defaultFilters);
```

**Benefits:**
- Shareable URLs with filter state
- Browser back/forward navigation
- No storage quota concerns

**Use when:**
- You want shareable filter states
- You don't need persistence across sessions
- You're building public-facing pages

### useLocalStorageFilters

Persists filters only in localStorage.

```typescript
const { filters, setFilter, setFilters, resetFilters, clearFilter } = 
  useLocalStorageFilters('storage-key', defaultFilters);
```

**Benefits:**
- Persists across sessions
- Private to the user
- Survives page refreshes

**Use when:**
- You want to remember user preferences
- URLs should stay clean
- Filters are user-specific

## Examples

### Example 1: Product Catalog with Filters

```typescript
import { usePersistedFilters } from '@/shared/hooks/usePersistedFilters';

function ProductCatalog() {
  const { filters, setFilter, setFilters, resetFilters } = usePersistedFilters(
    'product-catalog',
    {
      category: 'all',
      search: '',
      sort: 'newest',
      page: 1,
      priceRange: 'all',
    }
  );

  const handleCategoryChange = (category: string) => {
    // Reset page when changing category
    setFilters({ category, page: 1 });
  };

  const handleSearchChange = (search: string) => {
    // Reset page when searching
    setFilters({ search, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilter('page', page);
  };

  return (
    <div>
      <input
        value={filters.search}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Search products..."
      />
      
      <select
        value={filters.category}
        onChange={(e) => handleCategoryChange(e.target.value)}
      >
        <option value="all">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
      </select>

      <button onClick={resetFilters}>
        Clear All Filters
      </button>

      {/* Product list using filters */}
      <ProductList filters={filters} />
      
      {/* Pagination */}
      <Pagination
        currentPage={filters.page}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
```

### Example 2: Transaction History with Date Filters

```typescript
function TransactionHistory() {
  const { filters, setFilter, setFilters } = usePersistedFilters(
    'transaction-history',
    {
      tab: 'all',
      status: 'all',
      dateStart: '',
      dateEnd: '',
      page: 1,
      pageSize: 10,
    }
  );

  const handleDateRangeChange = (start: string, end: string) => {
    setFilters({ dateStart: start, dateEnd: end, page: 1 });
  };

  const handleTabChange = (tab: string) => {
    // Reset filters when changing tabs
    setFilters({ tab, status: 'all', page: 1 });
  };

  return (
    <div>
      <Tabs activeTab={filters.tab} onTabChange={handleTabChange} />
      
      <DateRangePicker
        startDate={filters.dateStart}
        endDate={filters.dateEnd}
        onChange={handleDateRangeChange}
      />
      
      <TransactionTable
        filters={filters}
        onPageChange={(page) => setFilter('page', page)}
      />
    </div>
  );
}
```

### Example 3: Tutorial Center with Search and Category

```typescript
function TutorialCenter() {
  const { filters, setFilter } = usePersistedFilters(
    'tutorial-center',
    {
      search: '',
      category: 'all',
    }
  );

  return (
    <div>
      <SearchBar
        value={filters.search}
        onChange={(value) => setFilter('search', value)}
      />
      
      <CategoryTabs
        activeCategory={filters.category}
        onCategoryChange={(category) => setFilter('category', category)}
      />
      
      <TutorialGrid
        search={filters.search}
        category={filters.category}
      />
    </div>
  );
}
```

## Type Safety

All hooks are fully type-safe. The filter object type is inferred from your default filters:

```typescript
const { filters } = usePersistedFilters('key', {
  search: '',      // string
  page: 1,         // number
  inStock: true,   // boolean
});

// TypeScript knows the types:
filters.search;   // string
filters.page;     // number
filters.inStock;  // boolean

// TypeScript will error on invalid types:
setFilter('page', 'invalid'); // ❌ Error: Type 'string' is not assignable to type 'number'
```

## URL Format

Filters are stored in URL search parameters:

```
/products?category=electronics&search=laptop&page=2&inStock=true
```

- Default values are not included in the URL (keeps URLs clean)
- Values are automatically type-converted when reading from URL
- Empty strings and null values remove the parameter

## localStorage Format

Filters are stored with a prefix to avoid conflicts:

```javascript
// Storage key: "canvango_filters_product-catalog"
{
  "category": "electronics",
  "search": "laptop",
  "page": 2
}
```

- Only non-default values are stored
- Automatically cleaned up on logout
- Prefix: `canvango_filters_`

## Clearing Filters on Logout

Filter preferences are automatically cleared when the user logs out. This is handled in the `AuthContext`:

```typescript
import { clearAllFilterPreferences } from '@/shared/hooks/useLocalStorageFilters';

const logout = () => {
  // ... other logout logic
  clearAllFilterPreferences(); // Clears all filter preferences
};
```

## Best Practices

### 1. Use Descriptive Storage Keys

```typescript
// ✅ Good
usePersistedFilters('product-catalog', defaults);
usePersistedFilters('transaction-history', defaults);

// ❌ Bad
usePersistedFilters('filters', defaults);
usePersistedFilters('page1', defaults);
```

### 2. Reset Page on Filter Changes

When changing filters, reset the page to 1:

```typescript
const handleCategoryChange = (category: string) => {
  setFilters({ category, page: 1 }); // ✅ Reset page
};
```

### 3. Provide Sensible Defaults

```typescript
// ✅ Good defaults
const defaults = {
  search: '',
  category: 'all',
  page: 1,
  pageSize: 10,
  sort: 'newest',
};

// ❌ Avoid undefined or null as defaults
const defaults = {
  search: undefined, // Use '' instead
  category: null,    // Use 'all' instead
};
```

### 4. Group Related Filter Changes

Use `setFilters` to update multiple filters at once:

```typescript
// ✅ Good - Single update
setFilters({ category: 'electronics', page: 1, sort: 'price-low' });

// ❌ Bad - Multiple updates
setFilter('category', 'electronics');
setFilter('page', 1);
setFilter('sort', 'price-low');
```

### 5. Choose the Right Hook

- **`usePersistedFilters`**: Default choice for most cases
- **`useURLFilters`**: When you only need shareable URLs
- **`useLocalStorageFilters`**: When URLs should stay clean

## Browser Support

- **URL Filters**: All modern browsers (uses URLSearchParams)
- **localStorage**: All modern browsers (IE11+)
- **Fallback**: If localStorage is unavailable, filters work but don't persist

## Performance Considerations

- URL updates don't cause full page reloads (uses React Router)
- localStorage writes are debounced automatically
- Filter parsing is memoized for performance
- No unnecessary re-renders

## Troubleshooting

### Filters not persisting

1. Check that you're using a unique storage key
2. Verify localStorage is enabled in the browser
3. Check browser console for errors

### URL not updating

1. Ensure you're using React Router's `BrowserRouter`
2. Check that the component is inside a Router context
3. Verify `useURL: true` in options

### Filters reset on logout

This is expected behavior. Filters are cleared on logout for privacy.

### Type errors

Ensure your default filters match the types you're using:

```typescript
// ✅ Correct
const defaults = { page: 1 };
setFilter('page', 2); // number

// ❌ Wrong
const defaults = { page: '1' };
setFilter('page', 2); // Error: expected string
```

## Related Documentation

- [URL Search Parameters (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
- [localStorage (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [React Router - useSearchParams](https://reactrouter.com/en/main/hooks/use-search-params)

## Support

For issues or questions, please refer to the main documentation or contact the development team.

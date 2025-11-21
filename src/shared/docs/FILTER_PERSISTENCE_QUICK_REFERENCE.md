# Filter Persistence - Quick Reference

## Import

```typescript
import { usePersistedFilters } from '@/shared/hooks/usePersistedFilters';
```

## Basic Usage

```typescript
const { filters, setFilter, setFilters, resetFilters, clearFilter } = 
  usePersistedFilters('storage-key', {
    search: '',
    category: 'all',
    page: 1,
  });
```

## API

### filters
Current filter values (read-only)

```typescript
console.log(filters.search);  // Current search value
console.log(filters.page);    // Current page number
```

### setFilter(key, value)
Update a single filter

```typescript
setFilter('search', 'laptop');
setFilter('page', 2);
setFilter('category', 'electronics');
```

### setFilters(updates)
Update multiple filters at once

```typescript
setFilters({ 
  category: 'electronics', 
  page: 1,
  search: '' 
});
```

### resetFilters()
Reset all filters to defaults

```typescript
resetFilters();
```

### clearFilter(key)
Clear a specific filter (reset to default)

```typescript
clearFilter('search');
```

## Common Patterns

### Search with Reset Page

```typescript
const handleSearch = (value: string) => {
  setFilters({ search: value, page: 1 });
};
```

### Category Change with Reset

```typescript
const handleCategoryChange = (category: string) => {
  setFilters({ category, page: 1, search: '' });
};
```

### Pagination

```typescript
const handlePageChange = (page: number) => {
  setFilter('page', page);
};
```

### Clear All Filters

```typescript
<button onClick={resetFilters}>
  Clear All Filters
</button>
```

## Hook Options

```typescript
usePersistedFilters('key', defaults, {
  useURL: true,          // Enable URL persistence
  useLocalStorage: true, // Enable localStorage persistence
});
```

## Supported Types

- `string` - Text values
- `number` - Numeric values
- `boolean` - True/false values

## URL Format

```
/page?search=laptop&category=electronics&page=2
```

## localStorage Key

```
canvango_filters_{storage-key}
```

## Automatic Cleanup

Filters are automatically cleared on logout.

## Examples

### Product Filters

```typescript
const { filters, setFilter, setFilters } = usePersistedFilters('products', {
  category: 'all',
  search: '',
  sort: 'newest',
  page: 1,
  minPrice: 0,
  maxPrice: 1000,
});
```

### Transaction Filters

```typescript
const { filters, setFilter } = usePersistedFilters('transactions', {
  tab: 'all',
  status: 'all',
  dateStart: '',
  dateEnd: '',
  page: 1,
});
```

### Tutorial Filters

```typescript
const { filters, setFilter } = usePersistedFilters('tutorials', {
  search: '',
  category: 'all',
});
```

## Tips

✅ Use descriptive storage keys
✅ Reset page when filters change
✅ Provide sensible defaults
✅ Group related updates with `setFilters`

❌ Don't use undefined/null as defaults
❌ Don't update filters individually when changing multiple
❌ Don't forget to reset page on filter changes

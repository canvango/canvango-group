# Pagination Component Guide

## Overview

The Pagination component provides a comprehensive pagination interface for tables and lists. It includes page navigation, page size selection, and item count display with full accessibility support.

## Location

`src/shared/components/Pagination.tsx`

## Features

✅ **Page Number Buttons** - Smart ellipsis logic for large page counts
✅ **Previous/Next Navigation** - Chevron buttons with disabled states
✅ **Current Page Indicator** - Highlighted active page
✅ **Total Pages Display** - Shows all available pages
✅ **Responsive Design** - Adapts to mobile, tablet, and desktop
✅ **Page Size Selector** - Configurable items per page
✅ **Item Count Display** - Shows current range and total items
✅ **Accessibility** - Full ARIA labels and keyboard navigation
✅ **Touch-Friendly** - 44x44px minimum touch targets

## Requirements Satisfied

- ✅ **Requirement 2.6** - Dashboard recent transactions table pagination
- ✅ **Requirement 3.6** - Transaction history pagination controls
- ✅ **Requirement 13.7** - Clear pagination indicators for long lists

## Props Interface

```typescript
interface PaginationProps {
  currentPage: number;           // Current active page (1-indexed)
  totalPages: number;            // Total number of pages
  pageSize: number;              // Items per page
  totalItems: number;            // Total number of items
  onPageChange: (page: number) => void;  // Page change handler
  onPageSizeChange?: (pageSize: number) => void;  // Optional page size change handler
  pageSizeOptions?: number[];    // Optional page size options (default: [10, 25, 50, 100])
}
```

## Basic Usage

```tsx
import { Pagination } from '@/shared/components';

function MyTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const totalItems = 150;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  return (
    <>
      {/* Your table content */}
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
    </>
  );
}
```

## Advanced Usage

### With Custom Page Size Options

```tsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  pageSize={pageSize}
  totalItems={totalItems}
  onPageChange={setCurrentPage}
  onPageSizeChange={setPageSize}
  pageSizeOptions={[5, 10, 20, 50]}
/>
```

### Without Page Size Selector

```tsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  pageSize={pageSize}
  totalItems={totalItems}
  onPageChange={setCurrentPage}
  // No onPageSizeChange prop - selector won't be shown
/>
```

### With Scroll to Top

```tsx
const handlePageChange = (page: number) => {
  setCurrentPage(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  pageSize={pageSize}
  totalItems={totalItems}
  onPageChange={handlePageChange}
  onPageSizeChange={setPageSize}
/>
```

## Complete Example with Data Fetching

```tsx
import React, { useState, useMemo } from 'react';
import { Pagination } from '@/shared/components';

interface Item {
  id: string;
  name: string;
}

function PaginatedList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Your data source
  const allItems: Item[] = [...]; // 150 items
  
  // Calculate pagination
  const totalItems = allItems.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Get current page items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return allItems.slice(startIndex, endIndex);
  }, [allItems, currentPage, pageSize]);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page
  };
  
  return (
    <div>
      {/* Render items */}
      <div className="space-y-4">
        {paginatedItems.map(item => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>
      
      {/* Pagination */}
      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
```

## Page Number Display Logic

The component uses smart ellipsis logic to handle large page counts:

- **≤ 5 pages**: Shows all page numbers
- **Current page ≤ 3**: Shows `1 2 3 4 ... N`
- **Current page ≥ N-2**: Shows `1 ... N-3 N-2 N-1 N`
- **Middle pages**: Shows `1 ... P-1 P P+1 ... N`

Examples:
- 3 pages: `1 2 3`
- 10 pages, page 2: `1 2 3 4 ... 10`
- 10 pages, page 5: `1 ... 4 5 6 ... 10`
- 10 pages, page 9: `1 ... 7 8 9 10`

## Styling

The component uses Tailwind CSS with the following design:

- **Active page**: Indigo background (`bg-indigo-600`) with white text
- **Inactive pages**: Gray text with hover effect
- **Disabled buttons**: Reduced opacity and disabled cursor
- **Responsive layout**: Stacks vertically on mobile, horizontal on desktop
- **Touch targets**: Minimum 44x44px for accessibility

## Accessibility Features

✅ **ARIA Labels**
- `aria-label="Pagination"` on navigation container
- `aria-label="Previous page"` on previous button
- `aria-label="Next page"` on next button
- `aria-label="Page X"` on each page button
- `aria-current="page"` on active page

✅ **Keyboard Navigation**
- All buttons are keyboard accessible
- Logical tab order
- Disabled states prevent interaction

✅ **Screen Reader Support**
- Semantic HTML with `<nav>` element
- Clear button labels
- Current page announcement

✅ **Touch-Friendly**
- Minimum 44x44px touch targets
- Adequate spacing between buttons

## Integration Examples

### Transaction History Page

```tsx
// src/features/member-area/pages/TransactionHistory.tsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  pageSize={pageSize}
  totalItems={filteredTransactions.length}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
/>
```

### BM Accounts Page

```tsx
// src/features/member-area/pages/BMAccounts.tsx
{totalPages > 1 && (
  <Pagination
    currentPage={page}
    totalPages={totalPages}
    pageSize={pageSize}
    totalItems={productsData?.pagination.total || 0}
    onPageChange={setPage}
    onPageSizeChange={handlePageSizeChange}
  />
)}
```

### Personal Accounts Page

```tsx
// src/features/member-area/pages/PersonalAccounts.tsx
{totalPages > 1 && (
  <Pagination
    currentPage={page}
    totalPages={totalPages}
    pageSize={pageSize}
    totalItems={productsData?.pagination.total || 0}
    onPageChange={setPage}
    onPageSizeChange={handlePageSizeChange}
  />
)}
```

## Best Practices

### 1. Reset Page on Filter Changes

```tsx
const handleFilterChange = (newFilter: string) => {
  setFilter(newFilter);
  setCurrentPage(1); // Reset to first page
};
```

### 2. Reset Page on Page Size Changes

```tsx
const handlePageSizeChange = (newPageSize: number) => {
  setPageSize(newPageSize);
  setCurrentPage(1); // Reset to first page
};
```

### 3. Scroll to Top on Page Change

```tsx
const handlePageChange = (page: number) => {
  setCurrentPage(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
```

### 4. Conditional Rendering

```tsx
{/* Only show pagination if there are items */}
{totalItems > 0 && (
  <Pagination {...props} />
)}

{/* Or only show if there are multiple pages */}
{totalPages > 1 && (
  <Pagination {...props} />
)}
```

### 5. Memoize Paginated Data

```tsx
const paginatedData = useMemo(() => {
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return allData.slice(startIndex, endIndex);
}, [allData, currentPage, pageSize]);
```

## Common Patterns

### Server-Side Pagination

```tsx
const { data, isLoading } = useQuery(
  ['items', currentPage, pageSize],
  () => fetchItems({ page: currentPage, pageSize })
);

<Pagination
  currentPage={currentPage}
  totalPages={data?.pagination.totalPages || 1}
  pageSize={pageSize}
  totalItems={data?.pagination.total || 0}
  onPageChange={setCurrentPage}
  onPageSizeChange={handlePageSizeChange}
/>
```

### Client-Side Pagination

```tsx
const totalPages = Math.ceil(allItems.length / pageSize);
const paginatedItems = allItems.slice(
  (currentPage - 1) * pageSize,
  currentPage * pageSize
);

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  pageSize={pageSize}
  totalItems={allItems.length}
  onPageChange={setCurrentPage}
  onPageSizeChange={handlePageSizeChange}
/>
```

## Troubleshooting

### Issue: Page numbers not updating

**Solution**: Ensure you're updating the `currentPage` state in the `onPageChange` handler.

### Issue: Items not changing when page changes

**Solution**: Make sure you're recalculating the paginated data when `currentPage` or `pageSize` changes.

### Issue: Pagination shows when no items

**Solution**: Add conditional rendering to only show pagination when there are items.

```tsx
{totalItems > 0 && <Pagination {...props} />}
```

### Issue: Page size selector not showing

**Solution**: Ensure you're passing the `onPageSizeChange` prop. The selector only shows when this prop is provided.

## Related Components

- **DataTable** - Uses Pagination internally
- **PaginatedDataTable** - Wrapper that includes built-in pagination
- **ResponsiveDataTable** - Responsive table with pagination support

## See Also

- [DataTable Usage Guide](./DATA_TABLE_USAGE.md)
- [DataTable Quick Reference](./DATA_TABLE_QUICK_REFERENCE.md)
- [Accessibility Guide](./ACCESSIBILITY.md)

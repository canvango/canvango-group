# Pagination Quick Reference

## Import

```tsx
import { Pagination } from '@/shared/components';
// or
import Pagination from '@/shared/components/Pagination';
```

## Basic Usage

```tsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  pageSize={pageSize}
  totalItems={totalItems}
  onPageChange={setCurrentPage}
  onPageSizeChange={setPageSize}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `currentPage` | `number` | ✅ | - | Current active page (1-indexed) |
| `totalPages` | `number` | ✅ | - | Total number of pages |
| `pageSize` | `number` | ✅ | - | Items per page |
| `totalItems` | `number` | ✅ | - | Total number of items |
| `onPageChange` | `(page: number) => void` | ✅ | - | Page change handler |
| `onPageSizeChange` | `(pageSize: number) => void` | ❌ | - | Page size change handler (optional) |
| `pageSizeOptions` | `number[]` | ❌ | `[10, 25, 50, 100]` | Available page size options |

## Common Patterns

### Calculate Total Pages

```tsx
const totalPages = Math.ceil(totalItems / pageSize);
```

### Get Current Page Items

```tsx
const startIndex = (currentPage - 1) * pageSize;
const endIndex = startIndex + pageSize;
const paginatedItems = allItems.slice(startIndex, endIndex);
```

### Handle Page Change with Scroll

```tsx
const handlePageChange = (page: number) => {
  setCurrentPage(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
```

### Handle Page Size Change

```tsx
const handlePageSizeChange = (newPageSize: number) => {
  setPageSize(newPageSize);
  setCurrentPage(1); // Reset to first page
};
```

## Complete Example

```tsx
function MyTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const allItems = [...]; // Your data
  
  const totalPages = Math.ceil(allItems.length / pageSize);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allItems.slice(start, start + pageSize);
  }, [allItems, currentPage, pageSize]);
  
  return (
    <>
      {paginatedItems.map(item => <div key={item.id}>{item.name}</div>)}
      
      {allItems.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={allItems.length}
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      )}
    </>
  );
}
```

## Features

✅ Page number buttons with smart ellipsis
✅ Previous/Next navigation
✅ Current page highlighting
✅ Page size selector (optional)
✅ Item count display
✅ Fully responsive
✅ Accessibility compliant
✅ Touch-friendly (44x44px targets)

## Accessibility

- ✅ ARIA labels on all buttons
- ✅ `aria-current="page"` on active page
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Disabled state handling

## Styling

- Active page: `bg-indigo-600 text-white`
- Inactive pages: `text-gray-700 hover:bg-gray-100`
- Disabled buttons: `opacity-50 cursor-not-allowed`
- Responsive: Stacks on mobile, horizontal on desktop

## Tips

1. **Always reset to page 1** when filters or page size changes
2. **Use conditional rendering** to hide pagination when not needed
3. **Memoize paginated data** for better performance
4. **Add scroll to top** for better UX on page change
5. **Show only when needed**: `{totalPages > 1 && <Pagination />}`

## See Also

- [Full Pagination Guide](./PAGINATION_GUIDE.md)
- [DataTable Usage](./DATA_TABLE_USAGE.md)
- [Accessibility Guide](./ACCESSIBILITY.md)

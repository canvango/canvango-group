# DataTable Quick Reference

## Import

```tsx
import { 
  DataTable, 
  PaginatedDataTable, 
  ResponsiveDataTable,
  Column,
  CardViewConfig 
} from '@/shared/components';
```

## Basic Usage

```tsx
// 1. Define columns
const columns: Column<YourType>[] = [
  { key: 'id', header: 'ID', sortable: true },
  { key: 'name', header: 'Name', sortable: true },
  { 
    key: 'status', 
    header: 'Status',
    render: (status) => <Badge>{status}</Badge>
  }
];

// 2. Use the table
<DataTable
  data={items}
  columns={columns}
  keyExtractor={(item) => item.id}
/>
```

## With Pagination

```tsx
<PaginatedDataTable
  data={items}
  columns={columns}
  keyExtractor={(item) => item.id}
  initialPageSize={25}
/>
```

## Responsive (Mobile-Friendly)

```tsx
const cardView: CardViewConfig<YourType> = {
  title: (item) => item.name,
  content: (item) => <div>...</div>
};

<ResponsiveDataTable
  data={items}
  columns={columns}
  keyExtractor={(item) => item.id}
  cardView={cardView}
/>
```

## Column Options

| Property | Type | Description |
|----------|------|-------------|
| `key` | string | Data property key |
| `header` | string | Column header text |
| `sortable` | boolean | Enable sorting |
| `render` | function | Custom cell renderer |
| `width` | string | Column width |
| `align` | 'left' \| 'center' \| 'right' | Text alignment |
| `className` | string | Additional CSS classes |

## Table Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `data` | T[] | required | Array of data |
| `columns` | Column<T>[] | required | Column configuration |
| `keyExtractor` | function | required | Unique key function |
| `onRowClick` | function | - | Row click handler |
| `emptyMessage` | string | - | Empty state message |
| `hoverable` | boolean | true | Hover effect |
| `striped` | boolean | false | Alternating rows |
| `compact` | boolean | false | Compact padding |
| `bordered` | boolean | true | Table border |
| `stickyHeader` | boolean | false | Sticky header |

## Common Patterns

### Custom Cell Rendering

```tsx
{
  key: 'amount',
  header: 'Amount',
  render: (amount) => formatCurrency(amount)
}
```

### Action Buttons

```tsx
{
  key: 'actions',
  header: 'Actions',
  render: (_, item) => (
    <Button onClick={() => handleEdit(item)}>
      Edit
    </Button>
  )
}
```

### Status Badges

```tsx
{
  key: 'status',
  header: 'Status',
  render: (status) => (
    <Badge variant={getVariant(status)}>
      {status}
    </Badge>
  )
}
```

### Date Formatting

```tsx
{
  key: 'createdAt',
  header: 'Created',
  sortable: true,
  render: (date) => formatDate(date)
}
```

## Accessibility

- ✅ Keyboard navigation (Tab, Enter, Space)
- ✅ ARIA labels and roles
- ✅ Screen reader support
- ✅ Sort announcements
- ✅ Focus management
- ✅ 44x44px touch targets

## Performance Tips

1. Define columns outside component
2. Use stable key extractors
3. Memoize render functions
4. Use pagination for large datasets
5. Consider VirtualTable for 1000+ items

## Migration Guide

### From TransactionTable

```tsx
// Before
<TransactionTable
  transactions={data}
  onViewDetails={handleView}
/>

// After
<PaginatedDataTable
  data={data}
  columns={transactionColumns}
  keyExtractor={(tx) => tx.id}
  onRowClick={handleView}
/>
```

### From Custom Table

```tsx
// Before
<table>
  <thead>...</thead>
  <tbody>
    {data.map(item => <tr>...</tr>)}
  </tbody>
</table>

// After
<DataTable
  data={data}
  columns={columns}
  keyExtractor={(item) => item.id}
/>
```

## Examples

See `src/shared/components/DataTableExample.tsx` for complete examples.

## Documentation

Full documentation: `src/shared/docs/DATA_TABLE_USAGE.md`

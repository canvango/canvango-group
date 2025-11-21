# DataTable Migration Guide

## Overview

This guide helps migrate existing table implementations to the new DataTable component system.

## Benefits of Migration

### Before (Custom Implementation)
- ❌ Duplicate sorting logic in each table
- ❌ Inconsistent pagination implementations
- ❌ No mobile responsiveness
- ❌ Manual accessibility implementation
- ❌ Repetitive code across tables

### After (DataTable Components)
- ✅ Centralized, tested sorting logic
- ✅ Consistent pagination everywhere
- ✅ Built-in mobile card view
- ✅ Accessibility by default
- ✅ DRY (Don't Repeat Yourself)

## Migration Examples

### Example 1: TransactionTable

#### Before (Current Implementation)

```tsx
// src/features/member-area/components/transactions/TransactionTable.tsx
const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onViewDetails
}) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    // Custom sorting logic...
  });

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr>
            <th onClick={() => handleSort('date')}>
              Date
              <SortIcon field="date" />
            </th>
            {/* More headers... */}
          </tr>
        </thead>
        <tbody>
          {sortedTransactions.map((transaction) => (
            <tr key={transaction.id}>
              {/* Row cells... */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

#### After (Using DataTable)

```tsx
// src/features/member-area/components/transactions/TransactionTable.tsx
import { PaginatedDataTable, Column } from '@/shared/components';

const columns: Column<Transaction>[] = [
  {
    key: 'id',
    header: 'ID Transaksi',
    render: (id) => `#${id.slice(0, 8)}`
  },
  {
    key: 'createdAt',
    header: 'Tanggal',
    sortable: true,
    render: (date) => formatDateTime(date)
  },
  {
    key: 'product',
    header: 'Produk',
    render: (product) => product?.title || '-'
  },
  {
    key: 'quantity',
    header: 'Jumlah',
    render: (qty) => qty || '-'
  },
  {
    key: 'amount',
    header: 'Total',
    sortable: true,
    align: 'right',
    render: (amount) => formatCurrency(amount)
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (status) => <StatusBadge status={status} />
  },
  {
    key: 'warranty',
    header: 'Garansi',
    render: (warranty) => <WarrantyBadge warranty={warranty} />
  },
  {
    key: 'actions',
    header: 'Aksi',
    render: (_, tx) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewDetails(tx)}
      >
        <Eye className="w-4 h-4" />
        Lihat
      </Button>
    )
  }
];

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onViewDetails
}) => {
  return (
    <PaginatedDataTable
      data={transactions}
      columns={columns}
      keyExtractor={(tx) => tx.id}
      initialPageSize={10}
      pageSizeOptions={[10, 25, 50]}
      emptyMessage="Tidak ada transaksi ditemukan"
    />
  );
};
```

**Lines of Code:**
- Before: ~150 lines
- After: ~70 lines
- **Reduction: 53%**

**Benefits:**
- ✅ No manual sorting logic
- ✅ Built-in pagination
- ✅ Consistent styling
- ✅ Accessibility included
- ✅ Less code to maintain

### Example 2: VerifiedBMOrdersTable

#### Before

```tsx
const VerifiedBMOrdersTable: React.FC<Props> = ({ orders }) => {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-12">
        <div className="text-center">
          <Package className="w-8 h-8 text-gray-400" />
          <h3>Belum Ada Pesanan</h3>
          <p>Anda belum memiliki riwayat pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h2>Riwayat Pesanan</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table implementation... */}
        </table>
      </div>
    </div>
  );
};
```

#### After

```tsx
import { DataTable, Column } from '@/shared/components';

const columns: Column<VerifiedBMOrder>[] = [
  {
    key: 'id',
    header: 'Order ID',
    render: (id) => `#${id.slice(0, 8)}`
  },
  {
    key: 'createdAt',
    header: 'Tanggal',
    sortable: true,
    render: (date) => formatDate(date)
  },
  {
    key: 'quantity',
    header: 'Jumlah',
    render: (qty) => `${qty} akun`
  },
  {
    key: 'amount',
    header: 'Total',
    sortable: true,
    align: 'right',
    render: (amount) => formatCurrency(amount)
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (status) => <StatusBadge status={status} />
  }
];

const VerifiedBMOrdersTable: React.FC<Props> = ({ orders }) => {
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">Riwayat Pesanan</h2>
      </div>
      <DataTable
        data={orders}
        columns={columns}
        keyExtractor={(order) => order.id}
        emptyMessage="Belum ada pesanan. Buat pesanan baru untuk memulai."
        hoverable={true}
      />
    </div>
  );
};
```

### Example 3: Adding Mobile Support

#### Before (Desktop Only)

```tsx
<table className="w-full min-w-[800px]">
  {/* Table content */}
</table>
```

**Issues:**
- Horizontal scroll on mobile
- Poor UX on small screens
- Hard to read

#### After (Responsive)

```tsx
const cardView: CardViewConfig<Transaction> = {
  title: (tx) => (
    <div className="flex justify-between">
      <span>#{tx.id.slice(0, 8)}</span>
      <StatusBadge status={tx.status} />
    </div>
  ),
  subtitle: (tx) => formatDateTime(tx.createdAt),
  content: (tx) => (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-gray-600">Produk:</span>
        <span className="font-medium">{tx.product?.title}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Total:</span>
        <span className="font-semibold">{formatCurrency(tx.amount)}</span>
      </div>
    </div>
  ),
  actions: (tx) => (
    <Button onClick={() => handleView(tx)} className="w-full">
      View Details
    </Button>
  )
};

<ResponsiveDataTable
  data={transactions}
  columns={columns}
  keyExtractor={(tx) => tx.id}
  cardView={cardView}
  breakpoint="md"
/>
```

**Benefits:**
- ✅ Card view on mobile
- ✅ Table view on desktop
- ✅ User can toggle views
- ✅ Better mobile UX

## Step-by-Step Migration

### Step 1: Define Columns

Extract your table columns into a configuration array:

```tsx
const columns: Column<YourType>[] = [
  {
    key: 'propertyName',
    header: 'Display Name',
    sortable: true,  // If you want sorting
    render: (value, row) => {
      // Custom rendering logic
      return <span>{value}</span>;
    }
  }
];
```

### Step 2: Replace Table Component

Replace your custom table with DataTable:

```tsx
// Before
<CustomTable data={data} onAction={handler} />

// After
<DataTable
  data={data}
  columns={columns}
  keyExtractor={(item) => item.id}
  onRowClick={handler}
/>
```

### Step 3: Add Pagination (Optional)

If you need pagination:

```tsx
<PaginatedDataTable
  data={data}
  columns={columns}
  keyExtractor={(item) => item.id}
  initialPageSize={25}
/>
```

### Step 4: Add Mobile Support (Optional)

If you want mobile card view:

```tsx
const cardView: CardViewConfig<YourType> = {
  title: (item) => item.name,
  content: (item) => <YourCardContent item={item} />
};

<ResponsiveDataTable
  data={data}
  columns={columns}
  keyExtractor={(item) => item.id}
  cardView={cardView}
/>
```

### Step 5: Test

- ✅ Desktop view
- ✅ Mobile view
- ✅ Sorting functionality
- ✅ Pagination
- ✅ Keyboard navigation
- ✅ Screen reader

## Common Patterns

### Pattern 1: Status Badges

```tsx
{
  key: 'status',
  header: 'Status',
  render: (status) => {
    const variant = status === 'success' ? 'success' : 'warning';
    return <Badge variant={variant}>{status}</Badge>;
  }
}
```

### Pattern 2: Action Buttons

```tsx
{
  key: 'actions',
  header: 'Actions',
  align: 'center',
  render: (_, item) => (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => handleEdit(item)}>
        Edit
      </Button>
      <Button size="sm" variant="ghost" onClick={() => handleDelete(item)}>
        Delete
      </Button>
    </div>
  )
}
```

### Pattern 3: Formatted Values

```tsx
{
  key: 'amount',
  header: 'Amount',
  sortable: true,
  align: 'right',
  render: (amount) => formatCurrency(amount)
}
```

### Pattern 4: Conditional Rendering

```tsx
{
  key: 'warranty',
  header: 'Warranty',
  render: (warranty, transaction) => {
    if (!warranty) return <span>-</span>;
    if (warranty.claimed) return <Badge variant="info">Claimed</Badge>;
    return <Badge variant="success">Active</Badge>;
  }
}
```

## Troubleshooting

### Issue: Sorting not working

**Solution:** Ensure the column has `sortable: true` and the data property exists.

```tsx
{
  key: 'createdAt',  // Must match property in data
  header: 'Date',
  sortable: true     // Enable sorting
}
```

### Issue: Custom rendering not showing

**Solution:** Use the `render` function:

```tsx
{
  key: 'status',
  header: 'Status',
  render: (value) => <Badge>{value}</Badge>  // Custom render
}
```

### Issue: Mobile view not working

**Solution:** Ensure you're using ResponsiveDataTable and provided cardView:

```tsx
<ResponsiveDataTable
  cardView={cardViewConfig}  // Required for mobile view
  breakpoint="md"
  {...otherProps}
/>
```

### Issue: Pagination not appearing

**Solution:** Ensure you have enough data:

```tsx
<PaginatedDataTable
  data={data}  // Must have more items than pageSize
  initialPageSize={10}
  showPagination={true}  // Default is true
/>
```

## Performance Comparison

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Lines of Code | ~150 | ~70 | 53% reduction |
| Bundle Size | Custom | Shared | Reusable |
| Accessibility | Manual | Built-in | 100% coverage |
| Mobile Support | None | Full | New feature |
| Maintenance | Per table | Centralized | Easier |

## Checklist

Before migration:
- [ ] Identify all table components
- [ ] Document current functionality
- [ ] Plan column configurations
- [ ] Design mobile card views

During migration:
- [ ] Create column definitions
- [ ] Replace table component
- [ ] Test sorting
- [ ] Test pagination
- [ ] Test mobile view
- [ ] Test accessibility

After migration:
- [ ] Remove old table code
- [ ] Update tests
- [ ] Update documentation
- [ ] Monitor for issues

## Support

- **Documentation:** `src/shared/docs/DATA_TABLE_USAGE.md`
- **Examples:** `src/shared/components/DataTableExample.tsx`
- **Quick Reference:** `src/shared/docs/DATA_TABLE_QUICK_REFERENCE.md`

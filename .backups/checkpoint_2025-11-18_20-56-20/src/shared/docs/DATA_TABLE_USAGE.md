# DataTable Component Usage Guide

This guide covers the usage of the DataTable, PaginatedDataTable, and ResponsiveDataTable components.

## Overview

The DataTable component system provides three levels of functionality:

1. **DataTable** - Basic table with sorting
2. **PaginatedDataTable** - DataTable with built-in pagination
3. **ResponsiveDataTable** - DataTable with responsive card view for mobile

## Basic DataTable

### Simple Usage

```tsx
import { DataTable, Column } from '@/shared/components';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

const columns: Column<User>[] = [
  {
    key: 'name',
    header: 'Name',
    sortable: true
  },
  {
    key: 'email',
    header: 'Email',
    sortable: true
  },
  {
    key: 'role',
    header: 'Role',
    render: (value) => (
      <Badge variant={value === 'admin' ? 'success' : 'default'}>
        {value}
      </Badge>
    )
  },
  {
    key: 'createdAt',
    header: 'Created',
    sortable: true,
    render: (value) => formatDate(value)
  }
];

function UserTable() {
  const users: User[] = [...]; // Your data

  return (
    <DataTable
      data={users}
      columns={columns}
      keyExtractor={(user) => user.id}
      onRowClick={(user) => console.log('Clicked:', user)}
    />
  );
}
```

### Column Configuration

```tsx
interface Column<T> {
  key: string;                    // Property key from data object
  header: string;                 // Column header text
  render?: (value, row, index) => ReactNode;  // Custom cell renderer
  sortable?: boolean;             // Enable sorting
  width?: string;                 // Column width (CSS value)
  align?: 'left' | 'center' | 'right';  // Text alignment
  className?: string;             // Additional CSS classes
}
```

### Custom Cell Rendering

```tsx
const columns: Column<Transaction>[] = [
  {
    key: 'status',
    header: 'Status',
    render: (status, transaction) => {
      const variant = status === 'success' ? 'success' : 'warning';
      return <Badge variant={variant}>{status}</Badge>;
    }
  },
  {
    key: 'amount',
    header: 'Amount',
    align: 'right',
    render: (amount) => formatCurrency(amount)
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (_, transaction) => (
      <Button
        size="sm"
        onClick={() => handleView(transaction)}
      >
        View
      </Button>
    )
  }
];
```

### Table Props

```tsx
interface DataTableProps<T> {
  data: T[];                      // Array of data objects
  columns: Column<T>[];           // Column configuration
  keyExtractor: (row, index) => string;  // Unique key for each row
  onRowClick?: (row, index) => void;     // Row click handler
  emptyMessage?: string;          // Message when no data
  className?: string;             // Additional CSS classes
  rowClassName?: string | ((row, index) => string);  // Row CSS classes
  stickyHeader?: boolean;         // Sticky table header
  striped?: boolean;              // Alternating row colors
  hoverable?: boolean;            // Hover effect on rows
  bordered?: boolean;             // Table border
  compact?: boolean;              // Compact padding
}
```

## PaginatedDataTable

Adds automatic pagination to the DataTable.

```tsx
import { PaginatedDataTable } from '@/shared/components';

function TransactionList() {
  const transactions = [...]; // Your data

  return (
    <PaginatedDataTable
      data={transactions}
      columns={columns}
      keyExtractor={(tx) => tx.id}
      initialPageSize={25}
      pageSizeOptions={[10, 25, 50, 100]}
      paginationPosition="bottom"
    />
  );
}
```

### Props

All DataTable props plus:

```tsx
interface PaginatedDataTableProps<T> {
  initialPageSize?: number;       // Default: 10
  pageSizeOptions?: number[];     // Default: [10, 25, 50, 100]
  showPagination?: boolean;       // Default: true
  paginationPosition?: 'top' | 'bottom' | 'both';  // Default: 'bottom'
}
```

## ResponsiveDataTable

Provides responsive behavior with optional card view for mobile devices.

```tsx
import { ResponsiveDataTable, CardViewConfig } from '@/shared/components';

const cardView: CardViewConfig<Transaction> = {
  title: (tx) => `Transaction #${tx.id.slice(0, 8)}`,
  subtitle: (tx) => formatDateTime(tx.createdAt),
  content: (tx) => (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-gray-600">Product:</span>
        <span className="font-medium">{tx.product?.title}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Amount:</span>
        <span className="font-medium">{formatCurrency(tx.amount)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Status:</span>
        <Badge variant={getStatusVariant(tx.status)}>
          {tx.status}
        </Badge>
      </div>
    </div>
  ),
  actions: (tx) => (
    <Button size="sm" variant="ghost" onClick={() => handleView(tx)}>
      <Eye className="w-4 h-4" />
    </Button>
  )
};

function ResponsiveTransactionTable() {
  return (
    <ResponsiveDataTable
      data={transactions}
      columns={columns}
      keyExtractor={(tx) => tx.id}
      cardView={cardView}
      breakpoint="md"
      showViewToggle={true}
    />
  );
}
```

### Card View Configuration

```tsx
interface CardViewConfig<T> {
  title: (row: T) => ReactNode;      // Card title
  subtitle?: (row: T) => ReactNode;  // Card subtitle
  content: (row: T) => ReactNode;    // Card main content
  footer?: (row: T) => ReactNode;    // Card footer
  actions?: (row: T) => ReactNode;   // Action buttons
}
```

### Props

All DataTable props plus:

```tsx
interface ResponsiveDataTableProps<T> {
  cardView?: CardViewConfig<T>;      // Card view configuration
  defaultView?: 'table' | 'card';    // Default: 'table'
  breakpoint?: 'sm' | 'md' | 'lg';   // Default: 'md'
  showViewToggle?: boolean;          // Default: true
}
```

## Complete Example

```tsx
import React from 'react';
import { 
  ResponsiveDataTable, 
  PaginatedDataTable,
  Column,
  CardViewConfig 
} from '@/shared/components';
import { Eye } from 'lucide-react';
import { Transaction } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

// Define columns
const columns: Column<Transaction>[] = [
  {
    key: 'id',
    header: 'ID',
    render: (id) => `#${id.slice(0, 8)}`,
    width: '100px'
  },
  {
    key: 'createdAt',
    header: 'Date',
    sortable: true,
    render: (date) => formatDateTime(date)
  },
  {
    key: 'product',
    header: 'Product',
    render: (product) => product?.title || '-'
  },
  {
    key: 'amount',
    header: 'Amount',
    sortable: true,
    align: 'right',
    render: (amount) => formatCurrency(amount)
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (status) => (
      <Badge variant={getStatusVariant(status)}>
        {status}
      </Badge>
    )
  },
  {
    key: 'actions',
    header: 'Actions',
    align: 'center',
    render: (_, tx) => (
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleView(tx)}
      >
        <Eye className="w-4 h-4" />
      </Button>
    )
  }
];

// Define card view for mobile
const cardView: CardViewConfig<Transaction> = {
  title: (tx) => (
    <div className="flex items-center justify-between">
      <span>#{tx.id.slice(0, 8)}</span>
      <Badge variant={getStatusVariant(tx.status)}>
        {tx.status}
      </Badge>
    </div>
  ),
  subtitle: (tx) => formatDateTime(tx.createdAt),
  content: (tx) => (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Product:</span>
        <span className="font-medium">{tx.product?.title || '-'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Amount:</span>
        <span className="font-semibold text-gray-900">
          {formatCurrency(tx.amount)}
        </span>
      </div>
    </div>
  ),
  actions: (tx) => (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => handleView(tx)}
    >
      <Eye className="w-4 h-4" />
    </Button>
  )
};

// Component
function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  const handleView = (transaction: Transaction) => {
    console.log('View transaction:', transaction);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Transactions</h2>
      
      <ResponsiveDataTable
        data={transactions}
        columns={columns}
        keyExtractor={(tx) => tx.id}
        cardView={cardView}
        breakpoint="md"
        showViewToggle={true}
        hoverable={true}
        emptyMessage="No transactions found"
      />
    </div>
  );
}

// With pagination
function PaginatedTransactionTable({ transactions }: { transactions: Transaction[] }) {
  return (
    <PaginatedDataTable
      data={transactions}
      columns={columns}
      keyExtractor={(tx) => tx.id}
      initialPageSize={25}
      pageSizeOptions={[10, 25, 50, 100]}
    />
  );
}

export { TransactionTable, PaginatedTransactionTable };
```

## Styling Options

### Compact Table

```tsx
<DataTable
  data={data}
  columns={columns}
  keyExtractor={keyExtractor}
  compact={true}
/>
```

### Striped Rows

```tsx
<DataTable
  data={data}
  columns={columns}
  keyExtractor={keyExtractor}
  striped={true}
/>
```

### Sticky Header

```tsx
<DataTable
  data={data}
  columns={columns}
  keyExtractor={keyExtractor}
  stickyHeader={true}
/>
```

### Custom Row Styling

```tsx
<DataTable
  data={data}
  columns={columns}
  keyExtractor={keyExtractor}
  rowClassName={(row, index) => 
    row.status === 'failed' ? 'bg-red-50' : ''
  }
/>
```

## Accessibility

All table components include:

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader announcements for sorting
- Focus management
- Minimum touch target sizes (44x44px)

## Performance Tips

1. **Use keyExtractor wisely**: Provide stable, unique keys
2. **Memoize columns**: Define columns outside component or use useMemo
3. **Optimize render functions**: Keep custom renderers lightweight
4. **Consider pagination**: Use PaginatedDataTable for large datasets
5. **Virtual scrolling**: For very large datasets, consider VirtualTable

## Migration from Existing Tables

Replace existing table implementations:

```tsx
// Before
<TransactionTable
  transactions={transactions}
  onViewDetails={handleView}
/>

// After
<PaginatedDataTable
  data={transactions}
  columns={transactionColumns}
  keyExtractor={(tx) => tx.id}
  onRowClick={handleView}
  initialPageSize={25}
/>
```

## Best Practices

1. **Define columns outside component** to prevent re-renders
2. **Use custom renderers** for complex cell content
3. **Enable sorting** on relevant columns
4. **Provide meaningful empty messages**
5. **Use card view** for mobile-friendly tables
6. **Test keyboard navigation** and screen reader support
7. **Consider pagination** for datasets > 50 items

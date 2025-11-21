import React from 'react';
import { Eye } from 'lucide-react';
import DataTable, { Column } from './DataTable';
import PaginatedDataTable from './PaginatedDataTable';
import ResponsiveDataTable, { CardViewConfig } from './ResponsiveDataTable';
import Badge from './Badge';
import Button from './Button';

// Example data type
interface ExampleTransaction {
  id: string;
  date: Date;
  product: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
  quantity: number;
}

// Generate sample data
const generateSampleData = (count: number): ExampleTransaction[] => {
  const products = ['BM Verified', 'Personal Account Old', 'BM Limit 250$', 'Personal Account New'];
  const statuses: ('success' | 'pending' | 'failed')[] = ['success', 'pending', 'failed'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `tx-${String(i + 1).padStart(8, '0')}`,
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    product: products[Math.floor(Math.random() * products.length)],
    amount: Math.floor(Math.random() * 500000) + 50000,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    quantity: Math.floor(Math.random() * 5) + 1
  }));
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

// Format date
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Get status badge variant
const getStatusVariant = (status: string): 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'success':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'error';
    default:
      return 'warning';
  }
};

// Define columns
const columns: Column<ExampleTransaction>[] = [
  {
    key: 'id',
    header: 'Transaction ID',
    render: (id) => (
      <span className="font-medium text-gray-900">#{id.slice(3, 11)}</span>
    ),
    width: '140px'
  },
  {
    key: 'date',
    header: 'Date',
    sortable: true,
    render: (date) => (
      <span className="text-gray-600">{formatDate(date)}</span>
    )
  },
  {
    key: 'product',
    header: 'Product',
    sortable: true,
    render: (product) => (
      <span className="text-gray-900">{product}</span>
    )
  },
  {
    key: 'quantity',
    header: 'Qty',
    align: 'center',
    width: '80px',
    render: (quantity) => (
      <span className="text-gray-600">{quantity}</span>
    )
  },
  {
    key: 'amount',
    header: 'Amount',
    sortable: true,
    align: 'right',
    render: (amount) => (
      <span className="font-semibold text-gray-900">{formatCurrency(amount)}</span>
    )
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    align: 'center',
    render: (status) => (
      <Badge variant={getStatusVariant(status)} size="sm">
        {status === 'success' ? 'Berhasil' : status === 'pending' ? 'Pending' : 'Gagal'}
      </Badge>
    )
  },
  {
    key: 'actions',
    header: 'Actions',
    align: 'center',
    width: '100px',
    render: (_, transaction) => (
      <div className="flex items-center justify-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => console.log('View:', transaction)}
          aria-label={`View transaction ${transaction.id}`}
        >
          <Eye className="w-4 h-4" />
        </Button>
      </div>
    )
  }
];

// Card view configuration for mobile
const cardView: CardViewConfig<ExampleTransaction> = {
  title: (tx) => (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">#{tx.id.slice(3, 11)}</span>
      <Badge variant={getStatusVariant(tx.status)} size="sm">
        {tx.status === 'success' ? 'Berhasil' : tx.status === 'pending' ? 'Pending' : 'Gagal'}
      </Badge>
    </div>
  ),
  subtitle: (tx) => (
    <span className="text-xs text-gray-500">{formatDate(tx.date)}</span>
  ),
  content: (tx) => (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Product:</span>
        <span className="font-medium text-gray-900">{tx.product}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Quantity:</span>
        <span className="text-gray-900">{tx.quantity}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Amount:</span>
        <span className="font-semibold text-gray-900">{formatCurrency(tx.amount)}</span>
      </div>
    </div>
  ),
  actions: (tx) => (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => console.log('View:', tx)}
      className="w-full"
    >
      <Eye className="w-4 h-4 mr-2" />
      View Details
    </Button>
  )
};

// Example 1: Basic DataTable
export const BasicDataTableExample: React.FC = () => {
  const data = generateSampleData(10);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Basic DataTable</h3>
        <p className="text-sm text-gray-600 mb-4">
          Simple table with sorting functionality
        </p>
      </div>
      
      <DataTable
        data={data}
        columns={columns}
        keyExtractor={(tx) => tx.id}
        onRowClick={(tx) => console.log('Clicked:', tx)}
        hoverable={true}
      />
    </div>
  );
};

// Example 2: Paginated DataTable
export const PaginatedDataTableExample: React.FC = () => {
  const data = generateSampleData(100);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Paginated DataTable</h3>
        <p className="text-sm text-gray-600 mb-4">
          Table with built-in pagination (100 items)
        </p>
      </div>
      
      <PaginatedDataTable
        data={data}
        columns={columns}
        keyExtractor={(tx) => tx.id}
        initialPageSize={10}
        pageSizeOptions={[10, 25, 50]}
        hoverable={true}
      />
    </div>
  );
};

// Example 3: Responsive DataTable
export const ResponsiveDataTableExample: React.FC = () => {
  const data = generateSampleData(15);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Responsive DataTable</h3>
        <p className="text-sm text-gray-600 mb-4">
          Table with card view for mobile devices (resize window to see)
        </p>
      </div>
      
      <ResponsiveDataTable
        data={data}
        columns={columns}
        keyExtractor={(tx) => tx.id}
        cardView={cardView}
        breakpoint="md"
        showViewToggle={true}
        hoverable={true}
      />
    </div>
  );
};

// Example 4: Compact & Striped
export const CompactStripedExample: React.FC = () => {
  const data = generateSampleData(8);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Compact & Striped Table</h3>
        <p className="text-sm text-gray-600 mb-4">
          Space-efficient table with alternating row colors
        </p>
      </div>
      
      <DataTable
        data={data}
        columns={columns}
        keyExtractor={(tx) => tx.id}
        compact={true}
        striped={true}
        hoverable={true}
      />
    </div>
  );
};

// Example 5: Empty State
export const EmptyStateExample: React.FC = () => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Empty State</h3>
        <p className="text-sm text-gray-600 mb-4">
          Table with no data
        </p>
      </div>
      
      <DataTable
        data={[]}
        columns={columns}
        keyExtractor={(tx) => tx.id}
        emptyMessage="Tidak ada transaksi ditemukan"
      />
    </div>
  );
};

// All examples showcase
export const DataTableShowcase: React.FC = () => {
  return (
    <div className="space-y-12 p-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">DataTable Components</h1>
        <p className="text-gray-600">
          Comprehensive examples of DataTable, PaginatedDataTable, and ResponsiveDataTable components
        </p>
      </div>

      <BasicDataTableExample />
      <hr className="border-gray-200" />
      
      <PaginatedDataTableExample />
      <hr className="border-gray-200" />
      
      <ResponsiveDataTableExample />
      <hr className="border-gray-200" />
      
      <CompactStripedExample />
      <hr className="border-gray-200" />
      
      <EmptyStateExample />
    </div>
  );
};

export default DataTableShowcase;

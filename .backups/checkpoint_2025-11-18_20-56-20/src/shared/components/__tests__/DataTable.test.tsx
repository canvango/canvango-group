/**
 * DataTable Component Tests
 * 
 * Tests for DataTable, PaginatedDataTable, and ResponsiveDataTable components
 */


import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DataTable, { Column } from '../DataTable';
import PaginatedDataTable from '../PaginatedDataTable';
import ResponsiveDataTable, { CardViewConfig } from '../ResponsiveDataTable';

// Test data type
interface TestItem {
  id: string;
  name: string;
  value: number;
  status: 'active' | 'inactive';
  date: Date;
}

// Sample data
const sampleData: TestItem[] = [
  { id: '1', name: 'Item 1', value: 100, status: 'active', date: new Date('2024-01-01') },
  { id: '2', name: 'Item 2', value: 200, status: 'inactive', date: new Date('2024-01-02') },
  { id: '3', name: 'Item 3', value: 150, status: 'active', date: new Date('2024-01-03') }
];

// Sample columns
const columns: Column<TestItem>[] = [
  { key: 'id', header: 'ID', sortable: true },
  { key: 'name', header: 'Name', sortable: true },
  { key: 'value', header: 'Value', sortable: true, align: 'right' },
  { key: 'status', header: 'Status', render: (status) => status.toUpperCase() }
];

describe('DataTable', () => {
  it('renders table with data', () => {
    render(
      <DataTable
        data={sampleData}
        columns={columns}
        keyExtractor={(item) => item.id}
      />
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(
      <DataTable
        data={[]}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyMessage="No items found"
      />
    );

    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('handles sorting on sortable columns', () => {
    render(
      <DataTable
        data={sampleData}
        columns={columns}
        keyExtractor={(item) => item.id}
      />
    );

    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader).toBeInTheDocument();

    // Click to sort ascending
    fireEvent.click(nameHeader!);
    
    // Click again to sort descending
    fireEvent.click(nameHeader!);
    
    // Click again to remove sort
    fireEvent.click(nameHeader!);
  });

  it('calls onRowClick when row is clicked', () => {
    const handleRowClick = jest.fn();
    
    render(
      <DataTable
        data={sampleData}
        columns={columns}
        keyExtractor={(item) => item.id}
        onRowClick={handleRowClick}
      />
    );

    const firstRow = screen.getByText('Item 1').closest('tr');
    fireEvent.click(firstRow!);

    expect(handleRowClick).toHaveBeenCalledWith(sampleData[0], 0);
  });

  it('renders custom cell content', () => {
    render(
      <DataTable
        data={sampleData}
        columns={columns}
        keyExtractor={(item) => item.id}
      />
    );

    // Status column uses custom render
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('INACTIVE')).toBeInTheDocument();
  });

  it('applies alignment classes', () => {
    render(
      <DataTable
        data={sampleData}
        columns={columns}
        keyExtractor={(item) => item.id}
      />
    );

    const valueHeader = screen.getByText('Value').closest('th');
    expect(valueHeader).toHaveClass('text-right');
  });

  it('supports keyboard navigation on sortable headers', () => {
    render(
      <DataTable
        data={sampleData}
        columns={columns}
        keyExtractor={(item) => item.id}
      />
    );

    const nameHeader = screen.getByText('Name').closest('th');
    
    // Should be focusable
    expect(nameHeader).toHaveAttribute('tabIndex', '0');
    
    // Should respond to Enter key
    fireEvent.keyDown(nameHeader!, { key: 'Enter' });
    
    // Should respond to Space key
    fireEvent.keyDown(nameHeader!, { key: ' ' });
  });
});

describe('PaginatedDataTable', () => {
  const largeData = Array.from({ length: 50 }, (_, i) => ({
    id: String(i + 1),
    name: `Item ${i + 1}`,
    value: (i + 1) * 10,
    status: i % 2 === 0 ? 'active' as const : 'inactive' as const,
    date: new Date()
  }));

  it('renders pagination controls', () => {
    render(
      <PaginatedDataTable
        data={largeData}
        columns={columns}
        keyExtractor={(item) => item.id}
        initialPageSize={10}
      />
    );

    expect(screen.getByLabelText('Pagination')).toBeInTheDocument();
  });

  it('displays correct page of data', () => {
    render(
      <PaginatedDataTable
        data={largeData}
        columns={columns}
        keyExtractor={(item) => item.id}
        initialPageSize={10}
      />
    );

    // Should show first 10 items
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 10')).toBeInTheDocument();
    expect(screen.queryByText('Item 11')).not.toBeInTheDocument();
  });

  it('changes page when pagination button clicked', () => {
    render(
      <PaginatedDataTable
        data={largeData}
        columns={columns}
        keyExtractor={(item) => item.id}
        initialPageSize={10}
      />
    );

    // Click next page
    const nextButton = screen.getByLabelText('Next page');
    fireEvent.click(nextButton);

    // Should show items 11-20
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    expect(screen.getByText('Item 11')).toBeInTheDocument();
    expect(screen.getByText('Item 20')).toBeInTheDocument();
  });

  it('changes page size when selector changed', () => {
    render(
      <PaginatedDataTable
        data={largeData}
        columns={columns}
        keyExtractor={(item) => item.id}
        initialPageSize={10}
        pageSizeOptions={[10, 25, 50]}
      />
    );

    const pageSizeSelect = screen.getByLabelText('Per halaman:');
    fireEvent.change(pageSizeSelect, { target: { value: '25' } });

    // Should now show 25 items
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 25')).toBeInTheDocument();
  });

  it('hides pagination when data fits on one page', () => {
    render(
      <PaginatedDataTable
        data={sampleData}
        columns={columns}
        keyExtractor={(item) => item.id}
        initialPageSize={10}
      />
    );

    // Should not show pagination for 3 items with page size 10
    expect(screen.queryByLabelText('Pagination')).not.toBeInTheDocument();
  });
});

describe('ResponsiveDataTable', () => {
  const cardView: CardViewConfig<TestItem> = {
    title: (item) => item.name,
    subtitle: (item) => `ID: ${item.id}`,
    content: (item) => (
      <div>
        <div>Value: {item.value}</div>
        <div>Status: {item.status}</div>
      </div>
    )
  };

  it('renders table view by default', () => {
    render(
      <ResponsiveDataTable
        data={sampleData}
        columns={columns}
        keyExtractor={(item) => item.id}
        cardView={cardView}
      />
    );

    // Should render table
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('shows view toggle when card view is provided', () => {
    render(
      <ResponsiveDataTable
        data={sampleData}
        columns={columns}
        keyExtractor={(item) => item.id}
        cardView={cardView}
        showViewToggle={true}
      />
    );

    expect(screen.getByLabelText('Table view')).toBeInTheDocument();
    expect(screen.getByLabelText('Card view')).toBeInTheDocument();
  });

  it('switches to card view when toggle clicked', () => {
    render(
      <ResponsiveDataTable
        data={sampleData}
        columns={columns}
        keyExtractor={(item) => item.id}
        cardView={cardView}
        showViewToggle={true}
      />
    );

    const cardViewButton = screen.getByLabelText('Card view');
    fireEvent.click(cardViewButton);

    // Should show card view content
    expect(screen.getByText('ID: 1')).toBeInTheDocument();
    expect(screen.getByText('ID: 2')).toBeInTheDocument();
  });

  it('hides view toggle when showViewToggle is false', () => {
    render(
      <ResponsiveDataTable
        data={sampleData}
        columns={columns}
        keyExtractor={(item) => item.id}
        cardView={cardView}
        showViewToggle={false}
      />
    );

    expect(screen.queryByLabelText('Table view')).not.toBeInTheDocument();
  });
});

describe('Accessibility', () => {
  it('has proper ARIA labels on sortable headers', () => {
    render(
      <DataTable
        data={sampleData}
        columns={columns}
        keyExtractor={(item) => item.id}
      />
    );

    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader).toHaveAttribute('role', 'button');
    expect(nameHeader).toHaveAttribute('tabIndex', '0');
  });

  it('announces sort state with aria-sort', () => {
    render(
      <DataTable
        data={sampleData}
        columns={columns}
        keyExtractor={(item) => item.id}
      />
    );

    const nameHeader = screen.getByText('Name').closest('th');
    
    // Click to sort
    fireEvent.click(nameHeader!);
    
    expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
  });

  it('has proper ARIA labels on pagination buttons', () => {
    const largeData = Array.from({ length: 50 }, (_, i) => ({
      id: String(i + 1),
      name: `Item ${i + 1}`,
      value: (i + 1) * 10,
      status: 'active' as const,
      date: new Date()
    }));

    render(
      <PaginatedDataTable
        data={largeData}
        columns={columns}
        keyExtractor={(item) => item.id}
        initialPageSize={10}
      />
    );

    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
  });

  it('supports keyboard navigation on clickable rows', () => {
    const handleRowClick = jest.fn();
    
    render(
      <DataTable
        data={sampleData}
        columns={columns}
        keyExtractor={(item) => item.id}
        onRowClick={handleRowClick}
      />
    );

    const firstRow = screen.getByText('Item 1').closest('tr');
    
    // Should be focusable
    expect(firstRow).toHaveAttribute('tabIndex', '0');
    
    // Should respond to Enter key
    fireEvent.keyDown(firstRow!, { key: 'Enter' });
    expect(handleRowClick).toHaveBeenCalled();
  });
});

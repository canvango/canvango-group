import React from 'react';
import { useVirtualScroll } from '../hooks/useVirtualScroll';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  width?: string;
}

interface VirtualTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowHeight: number;
  containerHeight: number;
  overscan?: number;
  className?: string;
  emptyMessage?: string;
  onRowClick?: (item: T, index: number) => void;
}

/**
 * VirtualTable component for rendering large tables efficiently
 * Only renders rows that are visible in the viewport
 * 
 * @example
 * <VirtualTable
 *   data={transactions}
 *   columns={[
 *     { key: 'id', header: 'ID' },
 *     { key: 'date', header: 'Date', render: (item) => formatDate(item.date) },
 *     { key: 'amount', header: 'Amount', render: (item) => formatCurrency(item.amount) },
 *   ]}
 *   rowHeight={60}
 *   containerHeight={600}
 * />
 */
function VirtualTable<T extends Record<string, any>>({
  data,
  columns,
  rowHeight,
  containerHeight,
  overscan = 5,
  className = '',
  emptyMessage = 'No data to display',
  onRowClick,
}: VirtualTableProps<T>) {
  const { virtualItems, totalHeight, containerRef } = useVirtualScroll(data, {
    itemHeight: rowHeight,
    containerHeight: containerHeight - 48, // Subtract header height
    overscan,
  });

  if (data.length === 0) {
    return (
      <div className={`border border-gray-200 rounded-3xl ${className}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: column.width }}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 rounded-3xl ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>
      
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ height: containerHeight - 48 }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <table className="min-w-full">
            <tbody className="bg-white divide-y divide-gray-200">
              {virtualItems.map(({ index, item, offsetTop }) => (
                <tr
                  key={index}
                  onClick={() => onRowClick?.(item, index)}
                  className={`${
                    onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                  } transition-colors`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: rowHeight,
                    transform: `translateY(${offsetTop}px)`,
                    display: 'table',
                    tableLayout: 'fixed',
                  }}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      style={{ width: column.width }}
                    >
                      {column.render
                        ? column.render(item, index)
                        : item[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default VirtualTable;

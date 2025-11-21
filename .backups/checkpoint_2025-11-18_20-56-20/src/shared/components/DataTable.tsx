import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T, index: number) => string;
  onRowClick?: (row: T, index: number) => void;
  emptyMessage?: string;
  className?: string;
  rowClassName?: string | ((row: T, index: number) => string);
  stickyHeader?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  compact?: boolean;
}

type SortConfig<_T> = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = 'Tidak ada data tersedia',
  className = '',
  rowClassName,
  stickyHeader = false,
  striped = false,
  hoverable = true,
  bordered = true,
  compact = false
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(null);

  // Handle sorting
  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    setSortConfig(current => {
      if (!current || current.key !== columnKey) {
        return { key: columnKey, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key: columnKey, direction: 'desc' };
      }
      return null;
    });
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Handle different types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        const comparison = aValue.getTime() - bValue.getTime();
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      // Default comparison
      const comparison = String(aValue).localeCompare(String(bValue));
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  // Get sort icon for column
  const getSortIcon = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return null;

    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" aria-hidden="true" />;
    }

    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-primary-600" aria-hidden="true" />
    ) : (
      <ChevronDown className="w-4 h-4 text-primary-600" aria-hidden="true" />
    );
  };

  // Get cell value
  const getCellValue = (row: T, column: Column<T>, index: number) => {
    if (column.render) {
      return column.render(row[column.key], row, index);
    }
    return row[column.key];
  };

  // Get row class name
  const getRowClassName = (row: T, index: number) => {
    const baseClasses = [
      hoverable && 'hover:bg-gray-50',
      striped && index % 2 === 1 && 'bg-gray-50',
      onRowClick && 'cursor-pointer',
      'transition-colors'
    ].filter(Boolean).join(' ');

    if (typeof rowClassName === 'function') {
      return `${baseClasses} ${rowClassName(row, index)}`;
    }
    return `${baseClasses} ${rowClassName || ''}`;
  };

  // Get alignment class
  const getAlignmentClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  if (data.length === 0) {
    return (
      <div className={`bg-white rounded-lg ${bordered ? 'border border-gray-200' : ''} ${className}`}>
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg ${bordered ? 'border border-gray-200' : ''} overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-full">
          <thead className={`bg-gray-50 border-b border-gray-200 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    ${compact ? 'px-4 py-2' : 'px-6 py-3'}
                    text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${getAlignmentClass(column.align)}
                    ${column.sortable ? 'cursor-pointer select-none hover:bg-gray-100' : ''}
                    ${column.className || ''}
                  `}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                  role={column.sortable ? 'button' : undefined}
                  tabIndex={column.sortable ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleSort(column.key);
                    }
                  }}
                  aria-sort={
                    sortConfig?.key === column.key
                      ? sortConfig.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  <div className="flex items-center gap-1">
                    <span>{column.header}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((row, index) => (
              <tr
                key={keyExtractor(row, index)}
                className={getRowClassName(row, index)}
                onClick={() => onRowClick?.(row, index)}
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onRowClick(row, index);
                  }
                }}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`
                      ${compact ? 'px-4 py-2' : 'px-6 py-4'}
                      text-sm
                      ${getAlignmentClass(column.align)}
                      ${column.className || ''}
                    `}
                  >
                    {getCellValue(row, column, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;

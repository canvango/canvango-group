import React, { useState } from 'react';
import { Table, LayoutGrid } from 'lucide-react';
import DataTable, { DataTableProps } from './DataTable';

export interface CardViewConfig<T> {
  title: (row: T) => React.ReactNode;
  subtitle?: (row: T) => React.ReactNode;
  content: (row: T) => React.ReactNode;
  footer?: (row: T) => React.ReactNode;
  actions?: (row: T) => React.ReactNode;
}

export interface ResponsiveDataTableProps<T> extends DataTableProps<T> {
  cardView?: CardViewConfig<T>;
  defaultView?: 'table' | 'card';
  breakpoint?: 'sm' | 'md' | 'lg';
  showViewToggle?: boolean;
}

function ResponsiveDataTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  cardView,
  defaultView = 'table',
  breakpoint = 'md',
  showViewToggle = true,
  ...tableProps
}: ResponsiveDataTableProps<T>) {
  const [view, setView] = useState<'table' | 'card'>(defaultView);

  // Breakpoint classes for responsive behavior
  const breakpointClass = {
    sm: 'sm:block',
    md: 'md:block',
    lg: 'lg:block'
  }[breakpoint];

  const CardView = () => {
    if (!cardView) return null;

    return (
      <div className="grid grid-cols-1 gap-4">
        {data.map((row, index) => (
          <div
            key={keyExtractor(row, index)}
            className="bg-white border border-gray-200 rounded-3xl p-4 hover:shadow-md transition-shadow"
            onClick={() => tableProps.onRowClick?.(row, index)}
            role={tableProps.onRowClick ? 'button' : undefined}
            tabIndex={tableProps.onRowClick ? 0 : undefined}
            onKeyDown={(e) => {
              if (tableProps.onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                tableProps.onRowClick(row, index);
              }
            }}
          >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">
                  {cardView.title(row)}
                </div>
                {cardView.subtitle && (
                  <div className="text-sm text-gray-600">
                    {cardView.subtitle(row)}
                  </div>
                )}
              </div>
              {cardView.actions && (
                <div className="ml-4">
                  {cardView.actions(row)}
                </div>
              )}
            </div>

            {/* Card Content */}
            <div className="space-y-2">
              {cardView.content(row)}
            </div>

            {/* Card Footer */}
            {cardView.footer && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                {cardView.footer(row)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const ViewToggle = () => {
    if (!showViewToggle || !cardView) return null;

    return (
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-600">Tampilan:</span>
        <div className="inline-flex rounded-xl border border-gray-300 p-1">
          <button
            onClick={() => setView('table')}
            className={`
              px-3 py-1.5 rounded-md text-sm font-medium transition-colors
              flex items-center gap-2
              ${view === 'table'
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
              }
            `}
            aria-label="Table view"
            aria-pressed={view === 'table'}
          >
            <Table className="w-4 h-4" />
            <span className="hidden sm:inline">Tabel</span>
          </button>
          <button
            onClick={() => setView('card')}
            className={`
              px-3 py-1.5 rounded-md text-sm font-medium transition-colors
              flex items-center gap-2
              ${view === 'card'
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
              }
            `}
            aria-label="Card view"
            aria-pressed={view === 'card'}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Kartu</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {cardView && <ViewToggle />}

      {/* Mobile: Show card view or table with horizontal scroll */}
      <div className={`${breakpointClass} hidden`}>
        <DataTable
          data={data}
          columns={columns}
          keyExtractor={keyExtractor}
          {...tableProps}
        />
      </div>

      {/* Desktop: Show selected view or table only */}
      <div className={`block ${breakpointClass}:hidden`}>
        {cardView && view === 'card' ? (
          <CardView />
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <DataTable
                data={data}
                columns={columns}
                keyExtractor={keyExtractor}
                {...tableProps}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResponsiveDataTable;

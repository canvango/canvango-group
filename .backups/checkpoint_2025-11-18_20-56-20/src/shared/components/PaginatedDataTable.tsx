import React, { useState, useMemo } from 'react';
import DataTable, { DataTableProps } from './DataTable';
import Pagination from './Pagination';

export interface PaginatedDataTableProps<T> extends Omit<DataTableProps<T>, 'data'> {
  data: T[];
  initialPageSize?: number;
  pageSizeOptions?: number[];
  showPagination?: boolean;
  paginationPosition?: 'top' | 'bottom' | 'both';
}

function PaginatedDataTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  showPagination = true,
  paginationPosition = 'bottom',
  ...tableProps
}: PaginatedDataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Calculate pagination values
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Get current page data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    // Reset to first page when page size changes
    setCurrentPage(1);
  };

  // Reset to first page when data changes
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginationComponent = showPagination && totalPages > 1 ? (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      pageSize={pageSize}
      totalItems={totalItems}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      pageSizeOptions={pageSizeOptions}
    />
  ) : null;

  return (
    <div className="space-y-0">
      {paginationPosition === 'top' || paginationPosition === 'both' ? (
        <div className="mb-0">{paginationComponent}</div>
      ) : null}

      <DataTable
        data={paginatedData}
        columns={columns}
        keyExtractor={keyExtractor}
        {...tableProps}
      />

      {paginationPosition === 'bottom' || paginationPosition === 'both' ? (
        <div className="mt-0">{paginationComponent}</div>
      ) : null}
    </div>
  );
}

export default PaginatedDataTable;

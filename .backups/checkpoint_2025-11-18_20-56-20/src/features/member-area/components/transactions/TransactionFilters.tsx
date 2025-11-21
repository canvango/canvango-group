import React from 'react';
import { Filter, Calendar } from 'lucide-react';

export interface TransactionFiltersProps {
  warrantyFilter: string;
  dateRange: {
    start: string;
    end: string;
  };
  onWarrantyFilterChange: (value: string) => void;
  onDateRangeChange: (range: { start: string; end: string }) => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  warrantyFilter,
  dateRange,
  onWarrantyFilterChange,
  onDateRangeChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Warranty Status Filter */}
      <div className="flex-1">
        <label htmlFor="warranty-filter" className="block text-sm font-medium text-gray-700 mb-2">
          <Filter className="w-4 h-4 inline mr-1" />
          Status Garansi
        </label>
        <select
          id="warranty-filter"
          value={warrantyFilter}
          onChange={(e) => onWarrantyFilterChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        >
          <option value="all">Semua Status</option>
          <option value="active">Garansi Aktif</option>
          <option value="expired">Garansi Kadaluarsa</option>
          <option value="claimed">Sudah Diklaim</option>
          <option value="no-warranty">Tanpa Garansi</option>
        </select>
      </div>

      {/* Date Range Filter */}
      <div className="flex-1">
        <label htmlFor="date-start" className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />
          Rentang Tanggal
        </label>
        <div className="flex gap-2">
          <input
            id="date-start"
            type="date"
            value={dateRange.start}
            onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            aria-label="Tanggal mulai"
          />
          <span className="flex items-center text-gray-500">-</span>
          <input
            id="date-end"
            type="date"
            value={dateRange.end}
            onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            aria-label="Tanggal akhir"
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;

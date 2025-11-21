import React, { useState, useEffect } from 'react';
import { Search, ArrowUpDown, Loader2 } from 'lucide-react';

import { useDebounce } from '../../../../shared/hooks/useDebounce';

export interface SortOption {
  value: string;
  label: string;
}

export interface SearchSortBarProps {
  searchValue: string;
  sortValue: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
  sortOptions: SortOption[];
  searchPlaceholder?: string;
  debounceDelay?: number;
  resultCount?: number;
}

const SearchSortBar: React.FC<SearchSortBarProps> = ({
  searchValue,
  sortValue,
  onSearchChange,
  onSortChange,
  sortOptions,
  searchPlaceholder = 'Search products...',
  debounceDelay = 500,
  resultCount,
}) => {
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchValue = useDebounce(localSearchValue, debounceDelay);

  // Update parent component with debounced value
  useEffect(() => {
    if (debouncedSearchValue !== searchValue) {
      onSearchChange(debouncedSearchValue);
      setIsSearching(false);
    }
  }, [debouncedSearchValue]);

  // Sync with external changes
  useEffect(() => {
    if (searchValue !== localSearchValue && searchValue !== debouncedSearchValue) {
      setLocalSearchValue(searchValue);
    }
  }, [searchValue]);

  const handleSearchChange = (value: string) => {
    setLocalSearchValue(value);
    setIsSearching(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div 
        style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 240px',
          gap: '12px',
          alignItems: 'center'
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>
          <input
            type="text"
            value={localSearchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Sort Dropdown */}
        <div style={{ position: 'relative' }}>
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <ArrowUpDown className="w-5 h-5" />
          </div>
          <select
            value={sortValue}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Search Results Count */}
      {resultCount !== undefined && searchValue && (
        <p className="text-sm text-gray-600">
          Found {resultCount} {resultCount === 1 ? 'product' : 'products'}
        </p>
      )}
    </div>
  );
};

export default SearchSortBar;

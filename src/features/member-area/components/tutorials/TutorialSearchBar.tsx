import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useDebounce } from '../../../../shared/hooks/useDebounce';

interface TutorialSearchBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  resultCount?: number;
  debounceDelay?: number;
}

const TutorialSearchBar: React.FC<TutorialSearchBarProps> = ({
  searchValue,
  onSearchChange,
  resultCount,
  debounceDelay = 500,
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
    <div className="w-full">
      <div className="relative">
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
          placeholder="Cari tutorial..."
          className="w-full pl-10 pr-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      {resultCount !== undefined && searchValue && (
        <p className="mt-2 text-sm text-gray-600">
          Ditemukan {resultCount} tutorial
        </p>
      )}
    </div>
  );
};

export default TutorialSearchBar;

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for managing filter state in localStorage
 * Provides persistent filter preferences across sessions
 * Automatically clears on logout
 */

export interface LocalStorageFilterConfig {
  [key: string]: string | number | boolean | null | undefined;
}

const STORAGE_PREFIX = 'canvango_filters_';

export function useLocalStorageFilters<T extends LocalStorageFilterConfig>(
  key: string,
  defaultFilters: T
): {
  filters: T;
  setFilter: (filterKey: keyof T, value: T[keyof T]) => void;
  setFilters: (filters: Partial<T>) => void;
  resetFilters: () => void;
  clearFilter: (filterKey: keyof T) => void;
} {
  const storageKey = `${STORAGE_PREFIX}${key}`;

  // Initialize state from localStorage or defaults
  const [filters, setFiltersState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all keys exist
        return { ...defaultFilters, ...parsed };
      }
    } catch (error) {
      console.error('Error reading filters from localStorage:', error);
    }
    return defaultFilters;
  });

  // Save to localStorage whenever filters change
  useEffect(() => {
    try {
      // Only save non-default values to keep storage clean
      const toSave: Partial<T> = {};
      let hasNonDefault = false;

      Object.keys(filters).forEach((key) => {
        const filterKey = key as keyof T;
        if (filters[filterKey] !== defaultFilters[filterKey]) {
          toSave[filterKey] = filters[filterKey];
          hasNonDefault = true;
        }
      });

      if (hasNonDefault) {
        localStorage.setItem(storageKey, JSON.stringify(toSave));
      } else {
        // Remove from storage if all values are default
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.error('Error saving filters to localStorage:', error);
    }
  }, [filters, storageKey, defaultFilters]);

  // Set a single filter
  const setFilter = useCallback(
    (filterKey: keyof T, value: T[keyof T]) => {
      setFiltersState((prev) => ({
        ...prev,
        [filterKey]: value,
      }));
    },
    []
  );

  // Set multiple filters at once
  const setFilters = useCallback((newFilters: Partial<T>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  // Reset all filters to default
  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error removing filters from localStorage:', error);
    }
  }, [defaultFilters, storageKey]);

  // Clear a specific filter (reset to default)
  const clearFilter = useCallback(
    (filterKey: keyof T) => {
      setFiltersState((prev) => ({
        ...prev,
        [filterKey]: defaultFilters[filterKey],
      }));
    },
    [defaultFilters]
  );

  return {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    clearFilter,
  };
}

/**
 * Clear all filter preferences from localStorage
 * Should be called on logout
 */
export function clearAllFilterPreferences(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing filter preferences:', error);
  }
}

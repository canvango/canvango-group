import { useEffect } from 'react';
import { useURLFilters, URLFilterConfig } from './useURLFilters';
import { useLocalStorageFilters, LocalStorageFilterConfig } from './useLocalStorageFilters';

/**
 * Combined hook that persists filters in both URL and localStorage
 * - URL params: For shareable links and browser back/forward
 * - localStorage: For user preferences across sessions
 * 
 * Priority: URL params override localStorage on initial load
 */

export interface PersistedFilterConfig extends URLFilterConfig, LocalStorageFilterConfig {}

export function usePersistedFilters<T extends PersistedFilterConfig>(
  storageKey: string,
  defaultFilters: T,
  options: {
    useURL?: boolean;
    useLocalStorage?: boolean;
  } = {}
): {
  filters: T;
  setFilter: (key: keyof T, value: T[keyof T]) => void;
  setFilters: (filters: Partial<T>) => void;
  resetFilters: () => void;
  clearFilter: (key: keyof T) => void;
} {
  const { useURL = true, useLocalStorage = true } = options;

  // Get filters from URL
  const urlFilters = useURLFilters(defaultFilters);
  
  // Get filters from localStorage
  const localStorageFilters = useLocalStorageFilters(storageKey, defaultFilters);

  // Determine which filters to use
  const activeFilters = useURL ? urlFilters : localStorageFilters;

  // Sync URL filters to localStorage when they change
  useEffect(() => {
    if (useURL && useLocalStorage) {
      // Check if any URL params are set (non-default)
      const hasURLParams = Object.keys(urlFilters.filters).some(
        (key) => urlFilters.filters[key as keyof T] !== defaultFilters[key as keyof T]
      );

      if (hasURLParams) {
        // Sync URL filters to localStorage
        localStorageFilters.setFilters(urlFilters.filters);
      }
    }
  }, [useURL, useLocalStorage, urlFilters.filters, defaultFilters]);

  // On mount, if no URL params but localStorage has values, sync to URL
  useEffect(() => {
    if (useURL && useLocalStorage) {
      const hasURLParams = Object.keys(urlFilters.filters).some(
        (key) => urlFilters.filters[key as keyof T] !== defaultFilters[key as keyof T]
      );

      const hasLocalStorageValues = Object.keys(localStorageFilters.filters).some(
        (key) => localStorageFilters.filters[key as keyof T] !== defaultFilters[key as keyof T]
      );

      if (!hasURLParams && hasLocalStorageValues) {
        // Restore from localStorage to URL
        const nonDefaultFilters: Partial<T> = {};
        Object.keys(localStorageFilters.filters).forEach((key) => {
          const filterKey = key as keyof T;
          if (localStorageFilters.filters[filterKey] !== defaultFilters[filterKey]) {
            nonDefaultFilters[filterKey] = localStorageFilters.filters[filterKey];
          }
        });
        
        if (Object.keys(nonDefaultFilters).length > 0) {
          urlFilters.setFilters(nonDefaultFilters);
        }
      }
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return activeFilters;
}

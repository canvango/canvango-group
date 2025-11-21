import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Hook for managing filter state in URL search parameters
 * Provides automatic synchronization between component state and URL
 * Supports browser back/forward navigation
 */

export interface URLFilterConfig {
  [key: string]: string | number | boolean | null | undefined;
}

export function useURLFilters<T extends URLFilterConfig>(
  defaultFilters: T
): {
  filters: T;
  setFilter: (key: keyof T, value: T[keyof T]) => void;
  setFilters: (filters: Partial<T>) => void;
  resetFilters: () => void;
  clearFilter: (key: keyof T) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL
  const filters = useMemo(() => {
    const result = { ...defaultFilters } as T;

    Object.keys(defaultFilters).forEach((key) => {
      const urlValue = searchParams.get(key);
      
      if (urlValue !== null) {
        const defaultValue = defaultFilters[key];
        
        // Type conversion based on default value type
        if (typeof defaultValue === 'number') {
          const parsed = Number(urlValue);
          if (!isNaN(parsed)) {
            (result as any)[key] = parsed;
          }
        } else if (typeof defaultValue === 'boolean') {
          (result as any)[key] = urlValue === 'true';
        } else {
          (result as any)[key] = urlValue;
        }
      }
    });

    return result;
  }, [searchParams, defaultFilters]);

  // Set a single filter
  const setFilter = useCallback(
    (key: keyof T, value: T[keyof T]) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        
        if (value === null || value === undefined || value === '' || value === defaultFilters[key]) {
          // Remove param if it's null, undefined, empty string, or default value
          newParams.delete(String(key));
        } else {
          // Set param with string value
          newParams.set(String(key), String(value));
        }
        
        return newParams;
      });
    },
    [setSearchParams, defaultFilters]
  );

  // Set multiple filters at once
  const setFilters = useCallback(
    (newFilters: Partial<T>) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        
        Object.entries(newFilters).forEach(([key, value]) => {
          if (value === null || value === undefined || value === '' || value === defaultFilters[key as keyof T]) {
            newParams.delete(key);
          } else {
            newParams.set(key, String(value));
          }
        });
        
        return newParams;
      });
    },
    [setSearchParams, defaultFilters]
  );

  // Reset all filters to default
  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  // Clear a specific filter
  const clearFilter = useCallback(
    (key: keyof T) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete(String(key));
        return newParams;
      });
    },
    [setSearchParams]
  );

  return {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    clearFilter,
  };
}

import { useEffect } from 'react';

/**
 * Hook to set the page title dynamically
 * @param title - The page title (will be appended to "Canvango Group")
 */
export const usePageTitle = (title: string) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | Canvango Group`;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};

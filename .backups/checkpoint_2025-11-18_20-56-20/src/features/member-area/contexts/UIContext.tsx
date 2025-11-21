import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

/**
 * Theme options for the application
 */
export type Theme = 'light' | 'dark';

/**
 * UI Context type definition
 * Manages global UI state including sidebar, theme, loading, and modals
 */
interface UIContextType {
  // Sidebar state
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  
  // Theme state
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  
  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Modal state
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

/**
 * Props for UIProvider component
 */
interface UIProviderProps {
  children: React.ReactNode;
  initialTheme?: Theme;
}

/**
 * UIProvider component
 * Provides global UI state management for sidebar, theme, and toast notifications
 * 
 * @example
 * ```tsx
 * <UIProvider>
 *   <App />
 * </UIProvider>
 * ```
 */
export const UIProvider: React.FC<UIProviderProps> = ({ 
  children, 
  initialTheme = 'light' 
}) => {
  // Sidebar state management
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Theme state management
  const [theme, setThemeState] = useState<Theme>(() => {
    // Try to load theme from localStorage
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      return savedTheme || initialTheme;
    }
    return initialTheme;
  });
  
  // Loading state management
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal state management
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Initialize sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Listen for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  // Sidebar control functions
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Theme control functions
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);
  
  // Modal control functions
  const openModal = useCallback((modalId: string) => {
    setActiveModal(modalId);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const value: UIContextType = {
    // Sidebar
    sidebarOpen,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    
    // Theme
    theme,
    toggleTheme,
    setTheme,
    
    // Loading
    isLoading,
    setIsLoading,
    
    // Modal
    activeModal,
    openModal,
    closeModal
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

/**
 * Custom hook to access UI context
 * Must be used within a UIProvider
 * 
 * @throws {Error} If used outside of UIProvider
 * 
 * @example
 * ```tsx
 * const { 
 *   sidebarOpen, 
 *   toggleSidebar, 
 *   theme, 
 *   toggleTheme,
 *   isLoading,
 *   setIsLoading,
 *   openModal,
 *   closeModal
 * } = useUI();
 * 
 * // Toggle sidebar
 * toggleSidebar();
 * 
 * // Toggle theme
 * toggleTheme();
 * 
 * // Show loading state
 * setIsLoading(true);
 * 
 * // Open a modal
 * openModal('confirmDialog');
 * 
 * // Close modal
 * closeModal();
 * 
 * // For toast notifications, use useToast from shared contexts
 * const { showSuccess } = useToast();
 * showSuccess('Operation completed successfully');
 * ```
 */
export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

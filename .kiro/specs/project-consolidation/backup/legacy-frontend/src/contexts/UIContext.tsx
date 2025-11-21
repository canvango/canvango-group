/**
 * UI Context
 * Global UI state management (sidebar, theme, etc.)
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface UIContextType {
  // Sidebar state
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  
  // Theme state (optional for future)
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  
  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Modal state
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

interface UIProviderProps {
  children: ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Theme state
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal state
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Sidebar functions
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Theme functions
  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  // Modal functions
  const openModal = useCallback((modalId: string) => {
    setActiveModal(modalId);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  // Initialize theme from localStorage
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [setTheme]);

  const value: UIContextType = {
    sidebarOpen,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    theme,
    setTheme,
    toggleTheme,
    isLoading,
    setIsLoading,
    activeModal,
    openModal,
    closeModal
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

/**
 * useUI Hook
 * Access UI context
 */
export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  
  if (context === undefined) {
    throw new Error('useUI must be used within UIProvider');
  }
  
  return context;
};

export default UIContext;

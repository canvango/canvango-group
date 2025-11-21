/**
 * UIContext Usage Examples
 * Examples of how to use UIContext in components
 */

import React from 'react';
import { useUI } from './UIContext';

/**
 * Example 1: Sidebar Toggle Button
 */
export const SidebarToggleButton: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useUI();

  return (
    <button
      onClick={toggleSidebar}
      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
    >
      {sidebarOpen ? '←' : '→'}
    </button>
  );
};

/**
 * Example 2: Theme Toggle
 */
export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useUI();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

/**
 * Example 3: Loading Overlay
 */
export const LoadingOverlay: React.FC = () => {
  const { isLoading } = useUI();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        <p className="mt-4 text-gray-700">Loading...</p>
      </div>
    </div>
  );
};

/**
 * Example 4: Modal Management
 */
export const ModalExample: React.FC = () => {
  const { activeModal, openModal, closeModal } = useUI();

  return (
    <div>
      <button
        onClick={() => openModal('example-modal')}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
      >
        Open Modal
      </button>

      {activeModal === 'example-modal' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Example Modal</h2>
            <p className="text-gray-600 mb-4">This is an example modal.</p>
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Example 5: Responsive Sidebar
 */
export const ResponsiveSidebar: React.FC = () => {
  const { sidebarOpen, closeSidebar } = useUI();

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static`}
      >
        <div className="p-4">
          <h2 className="text-xl font-semibold">Sidebar</h2>
          {/* Sidebar content */}
        </div>
      </aside>
    </>
  );
};

/**
 * Example 6: Global Loading State
 */
export const DataFetchingComponent: React.FC = () => {
  const { setIsLoading } = useUI();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch data
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={fetchData}
      className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
    >
      Fetch Data
    </button>
  );
};

/**
 * Example 7: Conditional Rendering Based on Sidebar State
 */
export const ContentArea: React.FC = () => {
  const { sidebarOpen } = useUI();

  return (
    <main
      className={`transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
      }`}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold">Content Area</h1>
        <p>Sidebar is {sidebarOpen ? 'open' : 'closed'}</p>
      </div>
    </main>
  );
};

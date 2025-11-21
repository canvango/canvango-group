/**
 * UIContext Usage Examples
 * 
 * This file demonstrates how to use the UIContext and related hooks
 * in the Member Area application.
 */

import React from 'react';
import { useUI } from '../contexts/UIContext';
import { useToast } from '../../../shared/contexts/ToastContext';
import { useUIWithToast } from '../hooks/useUIWithToast';
import { Menu, X, Sun, Moon } from 'lucide-react';

/**
 * Example 1: Using useUI for sidebar and theme control
 */
export const SidebarThemeExample: React.FC = () => {
  const { sidebarOpen, toggleSidebar, theme, toggleTheme } = useUI();

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Sidebar & Theme Control</h2>
      
      <div className="flex gap-4">
        <button
          onClick={toggleSidebar}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          {sidebarOpen ? 'Close' : 'Open'} Sidebar
        </button>

        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          Toggle Theme (Current: {theme})
        </button>
      </div>

      <div className="text-sm text-gray-600">
        Sidebar is currently: <strong>{sidebarOpen ? 'Open' : 'Closed'}</strong>
      </div>
    </div>
  );
};

/**
 * Example 2: Using separate hooks for UI and Toast
 */
export const SeparateHooksExample: React.FC = () => {
  const { closeSidebar } = useUI();
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const handleAction = (type: 'success' | 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'success':
        showSuccess('Success!', 'Operation completed successfully');
        closeSidebar();
        break;
      case 'error':
        showError('Error!', 'Something went wrong');
        break;
      case 'warning':
        showWarning('Warning!', 'Please be careful');
        break;
      case 'info':
        showInfo('Info', 'Here is some information');
        break;
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Toast Notifications</h2>
      
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handleAction('success')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Show Success
        </button>
        
        <button
          onClick={() => handleAction('error')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Show Error
        </button>
        
        <button
          onClick={() => handleAction('warning')}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          Show Warning
        </button>
        
        <button
          onClick={() => handleAction('info')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Show Info
        </button>
      </div>
    </div>
  );
};

/**
 * Example 3: Using combined useUIWithToast hook
 */
export const CombinedHookExample: React.FC = () => {
  const { 
    sidebarOpen, 
    toggleSidebar, 
    theme,
    toggleTheme,
    showSuccess,
    showError 
  } = useUIWithToast();

  const handleSaveSettings = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccess(
        'Settings saved',
        `Theme: ${theme}, Sidebar: ${sidebarOpen ? 'Open' : 'Closed'}`
      );
    } catch (error) {
      showError('Failed to save settings', 'Please try again');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Combined Hook Example</h2>
      
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Sidebar:</span>
          <button
            onClick={toggleSidebar}
            className={`px-3 py-1 rounded ${
              sidebarOpen 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {sidebarOpen ? 'Open' : 'Closed'}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Theme:</span>
          <button
            onClick={toggleTheme}
            className={`px-3 py-1 rounded ${
              theme === 'light'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-800 text-white'
            }`}
          >
            {theme}
          </button>
        </div>

        <button
          onClick={handleSaveSettings}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

/**
 * Example 4: Real-world usage in a form component
 */
export const FormWithUIContext: React.FC = () => {
  const { showSuccess, showError } = useUIWithToast();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!formData.name || !formData.email) {
        throw new Error('Please fill in all fields');
      }

      showSuccess(
        'Form submitted successfully',
        `Welcome, ${formData.name}!`
      );
      
      // Reset form
      setFormData({ name: '', email: '' });
    } catch (error) {
      showError(
        'Submission failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md">
      <h2 className="text-xl font-bold mb-4">Form Example</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Enter your email"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

/**
 * Main example component that showcases all examples
 */
export const UIContextExamples: React.FC = () => {
  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold mb-8">UIContext Usage Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4 bg-white shadow">
          <SidebarThemeExample />
        </div>
        
        <div className="border rounded-lg p-4 bg-white shadow">
          <SeparateHooksExample />
        </div>
        
        <div className="border rounded-lg p-4 bg-white shadow">
          <CombinedHookExample />
        </div>
        
        <div className="border rounded-lg p-4 bg-white shadow">
          <FormWithUIContext />
        </div>
      </div>
    </div>
  );
};

export default UIContextExamples;

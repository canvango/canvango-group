# UI Context Documentation

## Overview

The UI Context provides global state management for UI-related features in the Member Area, including sidebar state and theme management. It works in conjunction with the Toast Context to provide a complete UI state management solution.

## Features

### 1. Sidebar State Management
- Controls sidebar open/close state
- Automatically adjusts based on screen size
- Provides toggle, open, and close functions

### 2. Theme Management
- Supports light and dark themes
- Persists theme preference to localStorage
- Applies theme class to document root

### 3. Toast Notifications
- Integrated with shared ToastContext
- Accessible via `useToast` hook or combined `useUIWithToast` hook

## Usage

### Basic Setup

The UIProvider should wrap your application along with ToastProvider:

```tsx
import { UIProvider } from './contexts/UIContext';
import { ToastProvider } from '../../shared/contexts/ToastContext';

function App() {
  return (
    <UIProvider>
      <ToastProvider>
        <YourApp />
      </ToastProvider>
    </UIProvider>
  );
}
```

### Using the useUI Hook

```tsx
import { useUI } from './contexts/UIContext';

function MyComponent() {
  const { 
    sidebarOpen, 
    toggleSidebar, 
    openSidebar, 
    closeSidebar,
    theme,
    toggleTheme,
    setTheme
  } = useUI();

  return (
    <div>
      <button onClick={toggleSidebar}>
        Toggle Sidebar
      </button>
      
      <button onClick={toggleTheme}>
        Toggle Theme (Current: {theme})
      </button>
      
      {sidebarOpen && <Sidebar onClose={closeSidebar} />}
    </div>
  );
}
```

### Using Toast Notifications

For toast notifications, use the `useToast` hook from shared contexts:

```tsx
import { useToast } from '../../shared/contexts/ToastContext';

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const handleAction = async () => {
    try {
      await someAction();
      showSuccess('Action completed successfully');
    } catch (error) {
      showError('Action failed', error.message);
    }
  };

  return <button onClick={handleAction}>Perform Action</button>;
}
```

### Using Combined Hook

For convenience, use `useUIWithToast` to access both UI and Toast contexts:

```tsx
import { useUIWithToast } from './hooks/useUIWithToast';

function MyComponent() {
  const { 
    sidebarOpen, 
    toggleSidebar,
    theme,
    toggleTheme,
    showSuccess,
    showError
  } = useUIWithToast();

  const handleSave = async () => {
    try {
      await saveData();
      showSuccess('Data saved successfully');
      closeSidebar();
    } catch (error) {
      showError('Failed to save data', error.message);
    }
  };

  return (
    <div>
      <button onClick={handleSave}>Save</button>
      <button onClick={toggleSidebar}>Toggle Sidebar</button>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

## API Reference

### UIContext

#### State

- `sidebarOpen: boolean` - Current sidebar open/close state
- `theme: Theme` - Current theme ('light' | 'dark')

#### Functions

##### Sidebar Control

- `toggleSidebar(): void` - Toggles sidebar open/close state
- `openSidebar(): void` - Opens the sidebar
- `closeSidebar(): void` - Closes the sidebar

##### Theme Control

- `toggleTheme(): void` - Toggles between light and dark theme
- `setTheme(theme: Theme): void` - Sets a specific theme

### Toast Functions (via useToast)

- `showToast(options: ToastOptions): void` - Shows a toast with custom options
- `showSuccess(message: string, description?: string): void` - Shows success toast
- `showError(message: string, description?: string): void` - Shows error toast
- `showWarning(message: string, description?: string): void` - Shows warning toast
- `showInfo(message: string, description?: string): void` - Shows info toast

## Implementation Details

### Sidebar Behavior

The sidebar automatically adjusts based on screen size:
- **Desktop (≥768px)**: Sidebar is open by default
- **Mobile (<768px)**: Sidebar is closed by default

The sidebar state is managed globally and persists across navigation within the member area.

### Theme Persistence

The theme preference is:
1. Saved to localStorage when changed
2. Loaded from localStorage on initial render
3. Applied to the document root element as a class
4. Can be used with Tailwind's dark mode feature

### Responsive Behavior

The UIContext includes a resize listener that automatically:
- Opens the sidebar on desktop screens
- Closes the sidebar on mobile screens
- Cleans up event listeners on unmount

## Best Practices

### 1. Use Appropriate Hooks

- Use `useUI()` when you only need UI state (sidebar, theme)
- Use `useToast()` when you only need toast notifications
- Use `useUIWithToast()` when you need both

### 2. Sidebar Management

```tsx
// Good: Close sidebar after navigation on mobile
const handleNavigate = (path: string) => {
  navigate(path);
  if (window.innerWidth < 768) {
    closeSidebar();
  }
};

// Good: Provide close button in sidebar
<Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
```

### 3. Theme Management

```tsx
// Good: Provide theme toggle in settings
<button onClick={toggleTheme}>
  {theme === 'light' ? <MoonIcon /> : <SunIcon />}
</button>

// Good: Set specific theme based on user preference
useEffect(() => {
  if (userPreference) {
    setTheme(userPreference);
  }
}, [userPreference]);
```

### 4. Toast Notifications

```tsx
// Good: Show appropriate toast types
showSuccess('Item added to cart');
showError('Failed to process payment', 'Please try again');
showWarning('Your session will expire soon');
showInfo('New features available');

// Good: Use toast with actions
showToast({
  type: 'warning',
  message: 'Unsaved changes',
  description: 'You have unsaved changes',
  action: {
    label: 'Save',
    onClick: handleSave
  }
});
```

## Requirements Mapping

This implementation satisfies the following requirements:

- **Requirement 11.3**: Mobile sidebar toggle functionality
- **Requirement 13.3**: Success notifications for completed actions
- **Requirement 13.4**: Error handling with clear messages

## Examples

### Complete Component Example

```tsx
import React, { useState } from 'react';
import { useUIWithToast } from '../hooks/useUIWithToast';

const ProductPurchase: React.FC = () => {
  const { showSuccess, showError } = useUIWithToast();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (productId: string) => {
    setLoading(true);
    try {
      await purchaseProduct(productId);
      showSuccess(
        'Purchase successful',
        'Your product has been added to your account'
      );
    } catch (error) {
      showError(
        'Purchase failed',
        error.message || 'Please try again later'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={() => handlePurchase('123')}
      disabled={loading}
    >
      {loading ? 'Processing...' : 'Buy Now'}
    </button>
  );
};
```

### Layout Component Example

```tsx
import React from 'react';
import { useUI } from '../contexts/UIContext';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sidebarOpen, toggleSidebar, closeSidebar, theme } = useUI();

  return (
    <div className={`min-h-screen ${theme}`}>
      <Header 
        onMenuClick={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />
      
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />
      
      <main className="ml-0 md:ml-60 pt-16">
        {children}
      </main>
    </div>
  );
};
```

## Troubleshooting

### Sidebar not responding to toggle

**Problem**: Sidebar doesn't open/close when toggle is clicked

**Solution**: Ensure UIProvider wraps your component tree:
```tsx
// App.tsx
<UIProvider>
  <YourApp />
</UIProvider>
```

### Theme not persisting

**Problem**: Theme resets on page reload

**Solution**: Check localStorage permissions and ensure UIProvider is mounted before theme-dependent components

### Toast not showing

**Problem**: Toast notifications don't appear

**Solution**: Ensure ToastProvider is included in your provider hierarchy:
```tsx
<UIProvider>
  <ToastProvider>
    <YourApp />
  </ToastProvider>
</UIProvider>
```

### Hook error: "must be used within a UIProvider"

**Problem**: Error when using useUI or useUIWithToast

**Solution**: Ensure the component using the hook is a child of UIProvider

## Related Documentation

- [Toast Context Documentation](../../../shared/docs/ERROR_HANDLING.md)
- [Accessibility Guidelines](../../../shared/docs/ACCESSIBILITY.md)
- [Performance Optimization](./PERFORMANCE_OPTIMIZATION.md)

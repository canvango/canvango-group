# UI Context Quick Reference

## Import Statements

```tsx
// For UI state only (sidebar, theme)
import { useUI } from '../contexts/UIContext';

// For toast notifications only
import { useToast } from '../../../shared/contexts/ToastContext';

// For both UI state and toast notifications
import { useUIWithToast } from '../hooks/useUIWithToast';
```

## Sidebar Control

```tsx
const { sidebarOpen, toggleSidebar, openSidebar, closeSidebar } = useUI();

// Toggle sidebar
toggleSidebar();

// Open sidebar explicitly
openSidebar();

// Close sidebar explicitly
closeSidebar();

// Check if sidebar is open
if (sidebarOpen) {
  // Sidebar is open
}
```

## Theme Control

```tsx
const { theme, toggleTheme, setTheme } = useUI();

// Toggle between light and dark
toggleTheme();

// Set specific theme
setTheme('dark');
setTheme('light');

// Check current theme
if (theme === 'dark') {
  // Dark mode is active
}
```

## Toast Notifications

```tsx
const { showSuccess, showError, showWarning, showInfo, showToast } = useToast();

// Success notification
showSuccess('Operation successful');
showSuccess('Operation successful', 'Details about the success');

// Error notification
showError('Operation failed');
showError('Operation failed', 'Error details');

// Warning notification
showWarning('Warning message');
showWarning('Warning message', 'Warning details');

// Info notification
showInfo('Information');
showInfo('Information', 'Additional info');

// Custom toast with action
showToast({
  type: 'warning',
  message: 'Unsaved changes',
  description: 'You have unsaved changes',
  duration: 5000,
  action: {
    label: 'Save',
    onClick: () => handleSave()
  }
});
```

## Combined Usage

```tsx
const { 
  sidebarOpen, 
  toggleSidebar,
  theme,
  toggleTheme,
  showSuccess,
  showError
} = useUIWithToast();

// Use all features together
const handleAction = async () => {
  try {
    await performAction();
    showSuccess('Action completed');
    closeSidebar();
  } catch (error) {
    showError('Action failed', error.message);
  }
};
```

## Common Patterns

### Mobile Sidebar Close After Navigation

```tsx
const handleNavigate = (path: string) => {
  navigate(path);
  if (window.innerWidth < 768) {
    closeSidebar();
  }
};
```

### Form Submission with Feedback

```tsx
const handleSubmit = async (data: FormData) => {
  try {
    await submitForm(data);
    showSuccess('Form submitted successfully');
  } catch (error) {
    showError('Submission failed', error.message);
  }
};
```

### Theme Toggle Button

```tsx
<button onClick={toggleTheme}>
  {theme === 'light' ? <MoonIcon /> : <SunIcon />}
  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
</button>
```

### Sidebar Toggle Button

```tsx
<button onClick={toggleSidebar}>
  {sidebarOpen ? <XIcon /> : <MenuIcon />}
</button>
```

## Provider Setup

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

## TypeScript Types

```tsx
import { Theme } from '../contexts/UIContext';

// Theme type
type Theme = 'light' | 'dark';

// Toast options
interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

## Requirements Satisfied

- ✅ **Requirement 11.3**: Mobile sidebar toggle functionality
- ✅ **Requirement 13.3**: Success notifications for completed actions
- ✅ **Requirement 13.4**: Error handling with clear messages

## Related Files

- Context: `src/features/member-area/contexts/UIContext.tsx`
- Hook: `src/features/member-area/hooks/useUIWithToast.ts`
- Examples: `src/features/member-area/examples/UIContextExample.tsx`
- Documentation: `src/features/member-area/docs/UI_CONTEXT.md`

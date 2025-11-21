# Error Handling Integration Guide

This guide helps you integrate the error handling system into your components.

## Quick Start

### 1. Install Dependencies (Already Done)
The error handling system is already set up. No additional installation needed.

### 2. Wrap Your App with Providers

```tsx
// src/App.tsx or src/index.tsx
import { ToastProvider } from '@/shared/contexts/ToastContext';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <YourApp />
      </ToastProvider>
    </ErrorBoundary>
  );
}
```

### 3. Use in Components

```tsx
import { useErrorHandler } from '@/shared/hooks';

function MyComponent() {
  const { handleError } = useErrorHandler();

  const handleAction = async () => {
    try {
      await someApiCall();
    } catch (error) {
      handleError(error);
    }
  };

  return <button onClick={handleAction}>Do Something</button>;
}
```

## Integration Checklist

### ✅ For New Components

- [ ] Import `useErrorHandler` hook
- [ ] Wrap async operations in try/catch
- [ ] Call appropriate error handler method
- [ ] Provide custom error messages when needed
- [ ] Add retry logic for user-initiated actions

### ✅ For API Services

- [ ] Use the configured `apiClient` from `services/api.ts`
- [ ] Don't catch errors in services (let them bubble up)
- [ ] Errors are automatically transformed to `ApplicationError`

### ✅ For Forms

- [ ] Use `handleValidationError` for form errors
- [ ] Display field-specific errors from `fieldErrors`
- [ ] Integrate with form libraries (React Hook Form, Formik)

### ✅ For React Query

- [ ] Add `onError` callback to queries/mutations
- [ ] Use `handleError` in the callback
- [ ] Consider retry strategies for network errors

## Common Integration Patterns

### Pattern 1: Simple API Call

```tsx
import { useErrorHandler } from '@/shared/hooks';
import { fetchData } from '@/services/api';

function DataComponent() {
  const { handleError } = useErrorHandler();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchData();
      setData(result);
    } catch (error) {
      handleError(error, {
        customMessage: 'Gagal memuat data'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return <div>{/* Render data */}</div>;
}
```

### Pattern 2: React Query Integration

```tsx
import { useQuery } from '@tanstack/react-query';
import { useErrorHandler } from '@/shared/hooks';
import { fetchProducts } from '@/services/products';

function ProductList() {
  const { handleError } = useErrorHandler();

  const { data, isLoading, error, refetch } = useQuery(
    ['products'],
    fetchProducts,
    {
      onError: (error) => {
        handleError(error, {
          customMessage: 'Gagal memuat produk',
          showRetry: true,
          onRetry: () => refetch()
        });
      }
    }
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage onRetry={refetch} />;

  return <div>{/* Render products */}</div>;
}
```

### Pattern 3: Form with Validation

```tsx
import { useForm } from 'react-hook-form';
import { useErrorHandler } from '@/shared/hooks';
import { submitForm } from '@/services/api';

function MyForm() {
  const { handleValidationError } = useErrorHandler();
  const { register, handleSubmit, setError } = useForm();

  const onSubmit = async (data) => {
    try {
      await submitForm(data);
      // Success handling
    } catch (error) {
      const { fieldErrors } = handleValidationError(error);
      
      // Set field-specific errors
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field, { message });
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### Pattern 4: Mutation with Optimistic Update

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useErrorHandler } from '@/shared/hooks';
import { useToast } from '@/shared/contexts/ToastContext';

function UpdateComponent() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  const { showSuccess } = useToast();

  const mutation = useMutation(updateData, {
    onMutate: async (newData) => {
      await queryClient.cancelQueries(['data']);
      const previous = queryClient.getQueryData(['data']);
      queryClient.setQueryData(['data'], newData);
      return { previous };
    },
    onSuccess: () => {
      showSuccess('Data berhasil diperbarui');
    },
    onError: (error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['data'], context.previous);
      }
      handleError(error, {
        customMessage: 'Gagal memperbarui data',
        showRetry: true,
        onRetry: () => mutation.mutate(variables)
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(['data']);
    }
  });

  return <button onClick={() => mutation.mutate(newData)}>Update</button>;
}
```

### Pattern 5: Protected Route with Auth Error

```tsx
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useErrorHandler } from '@/shared/hooks';
import { fetchUserProfile } from '@/services/user';

function ProtectedPage() {
  const { handleAuthError } = useErrorHandler();

  const { data, error } = useQuery(
    ['user', 'profile'],
    fetchUserProfile,
    {
      retry: false,
      onError: (error) => {
        // Automatically redirects to login
        handleAuthError(error);
      }
    }
  );

  if (error) {
    return <div>Redirecting to login...</div>;
  }

  return <div>{/* Protected content */}</div>;
}
```

## Migration Guide

### Migrating Existing Components

#### Before (Old Pattern)
```tsx
function OldComponent() {
  const [error, setError] = useState(null);

  const handleAction = async () => {
    try {
      await apiCall();
    } catch (err) {
      setError(err.message);
      alert('Error: ' + err.message);
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button onClick={handleAction}>Action</button>
    </div>
  );
}
```

#### After (New Pattern)
```tsx
import { useErrorHandler } from '@/shared/hooks';

function NewComponent() {
  const { handleError } = useErrorHandler();

  const handleAction = async () => {
    try {
      await apiCall();
    } catch (error) {
      handleError(error, {
        customMessage: 'Gagal melakukan aksi'
      });
    }
  };

  return <button onClick={handleAction}>Action</button>;
}
```

### Benefits of Migration
- ✅ Consistent error messages across the app
- ✅ User-friendly Indonesian messages
- ✅ Automatic toast notifications
- ✅ Retry functionality built-in
- ✅ Better error logging in development
- ✅ Less boilerplate code

## Testing Integration

### Unit Test Example

```tsx
import { renderHook } from '@testing-library/react';
import { useErrorHandler } from '@/shared/hooks';
import { ApplicationError, ErrorType } from '@/shared/utils/errors';

describe('useErrorHandler', () => {
  it('handles validation errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const error = new ApplicationError(
      ErrorType.VALIDATION,
      'Invalid input',
      { field: 'email' }
    );
    
    const errorInfo = result.current.handleValidationError(error, {
      showToast: false
    });
    
    expect(errorInfo.fieldErrors).toEqual({ field: 'email' });
  });
});
```

### Integration Test Example

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/shared/contexts/ToastContext';
import MyComponent from './MyComponent';

describe('MyComponent error handling', () => {
  it('shows error toast on API failure', async () => {
    const queryClient = new QueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <MyComponent />
        </ToastProvider>
      </QueryClientProvider>
    );
    
    const button = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Gagal');
    });
  });
});
```

## Troubleshooting

### Issue: Errors not showing toasts

**Solution**: Ensure your app is wrapped with `ToastProvider`:
```tsx
<ToastProvider>
  <App />
</ToastProvider>
```

### Issue: Auth errors not redirecting

**Solution**: Use `handleAuthError` instead of `handleError`:
```tsx
const { handleAuthError } = useErrorHandler();
handleAuthError(error);
```

### Issue: Network errors not retrying

**Solution**: Use `handleNetworkError` with retry callback:
```tsx
const { handleNetworkError } = useErrorHandler();
handleNetworkError(error, () => retryFunction());
```

### Issue: Custom error messages not showing

**Solution**: Pass `customMessage` option:
```tsx
handleError(error, {
  customMessage: 'Your custom message'
});
```

## Best Practices Summary

1. ✅ Always wrap async operations in try/catch
2. ✅ Use specific error handlers (validation, auth, network)
3. ✅ Provide custom messages for better UX
4. ✅ Add retry logic for user-initiated actions
5. ✅ Don't catch errors in service layer
6. ✅ Use ErrorBoundary for component errors
7. ✅ Test error handling in your components
8. ✅ Log errors appropriately (dev vs prod)

## Resources

- [Complete Guide](./ERROR_HANDLING.md)
- [Quick Reference](./ERROR_HANDLING_QUICK_REFERENCE.md)
- [Examples](./ERROR_HANDLING_EXAMPLES.md)

## Support

For questions or issues with error handling:
1. Check the documentation files
2. Review the examples
3. Check existing components for patterns
4. Consult the development team

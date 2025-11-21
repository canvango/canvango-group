# Error Handling Guide

This guide explains how to handle errors consistently across the Canvango Group application.

## Overview

The application uses a centralized error handling system that:
- Transforms all API errors into `ApplicationError` instances
- Provides user-friendly error messages in Indonesian
- Supports retry logic for transient errors
- Integrates with the toast notification system
- Logs errors appropriately in development

## Error Types

```typescript
enum ErrorType {
  VALIDATION = 'validation',      // Form validation errors
  AUTHENTICATION = 'authentication', // Login/auth errors
  AUTHORIZATION = 'authorization',  // Permission errors
  NOT_FOUND = 'not_found',         // Resource not found
  SERVER = 'server',               // Server errors (5xx)
  NETWORK = 'network',             // Network connectivity issues
  UNKNOWN = 'unknown'              // Unexpected errors
}
```

## Using the Error Handler Hook

### Basic Usage

```tsx
import { useErrorHandler } from '@/shared/hooks';

function MyComponent() {
  const { handleError } = useErrorHandler();

  const handleSubmit = async () => {
    try {
      await someApiCall();
    } catch (error) {
      handleError(error);
    }
  };

  return <button onClick={handleSubmit}>Submit</button>;
}
```

### With Custom Message

```tsx
const { handleError } = useErrorHandler();

try {
  await purchaseProduct(productId);
} catch (error) {
  handleError(error, {
    customMessage: 'Gagal membeli produk. Silakan coba lagi.'
  });
}
```

### With Retry Action

```tsx
const { handleError } = useErrorHandler();

const handlePurchase = async () => {
  try {
    await purchaseProduct(productId);
  } catch (error) {
    handleError(error, {
      showRetry: true,
      onRetry: handlePurchase
    });
  }
};
```

### Validation Errors

```tsx
const { handleValidationError } = useErrorHandler();

try {
  await submitForm(formData);
} catch (error) {
  const { fieldErrors } = handleValidationError(error);
  // Use fieldErrors to highlight specific form fields
}
```

### Authentication Errors

```tsx
const { handleAuthError } = useErrorHandler();

try {
  await fetchUserData();
} catch (error) {
  // Automatically redirects to login if auth error
  handleAuthError(error);
}
```

### Network Errors

```tsx
const { handleNetworkError } = useErrorHandler();

try {
  await fetchData();
} catch (error) {
  handleNetworkError(error, () => fetchData());
}
```

## API Error Handling

All API calls automatically transform errors through the API interceptor:

```typescript
// In your service
export const fetchProducts = async () => {
  // Errors are automatically transformed to ApplicationError
  const response = await apiClient.get('/products');
  return response.data;
};

// In your component
const { data, error } = useQuery('products', fetchProducts);

if (error) {
  // error is already an ApplicationError
  handleError(error);
}
```

## Common Error Codes

The system maps common API error codes to user-friendly messages:

| Error Code | User Message |
|------------|--------------|
| `INSUFFICIENT_BALANCE` | Saldo Anda tidak mencukupi. Silakan top up terlebih dahulu. |
| `PRODUCT_OUT_OF_STOCK` | Produk ini sedang habis. Silakan coba lagi nanti. |
| `INVALID_PAYMENT_METHOD` | Metode pembayaran tidak valid. Silakan pilih metode lain. |
| `TRANSACTION_FAILED` | Transaksi gagal. Silakan coba lagi. |
| `WARRANTY_EXPIRED` | Garansi produk ini telah habis. |
| `WARRANTY_ALREADY_CLAIMED` | Garansi untuk produk ini sudah pernah diklaim. |
| `INVALID_API_KEY` | API key tidak valid. Silakan generate API key baru. |
| `RATE_LIMIT_EXCEEDED` | Anda telah mencapai batas permintaan. Silakan coba lagi nanti. |
| `ACCOUNT_SUSPENDED` | Akun Anda telah ditangguhkan. Hubungi customer support. |

## Error Boundary

Wrap your application or specific sections with ErrorBoundary to catch React errors:

```tsx
import { ErrorBoundary } from '@/shared/components';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to error reporting service
        console.error('React Error:', error, errorInfo);
      }}
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

### Custom Error Fallback

```tsx
<ErrorBoundary
  fallback={(error, errorInfo, reset) => (
    <div>
      <h1>Something went wrong</h1>
      <p>{error.message}</p>
      <button onClick={reset}>Try Again</button>
    </div>
  )}
>
  <YourComponent />
</ErrorBoundary>
```

## Toast Notifications

Errors automatically show toast notifications. You can customize this:

```tsx
const { handleError } = useErrorHandler();

// Don't show toast
handleError(error, { showToast: false });

// Show custom toast
const { showError } = useToast();
showError('Custom error message', 'Additional details');
```

## Best Practices

### 1. Always Handle Errors

```tsx
// ❌ Bad
const handleClick = async () => {
  await someApiCall(); // Unhandled error
};

// ✅ Good
const handleClick = async () => {
  try {
    await someApiCall();
  } catch (error) {
    handleError(error);
  }
};
```

### 2. Use React Query Error Handling

```tsx
const { data, error } = useQuery('key', fetchData, {
  onError: (error) => {
    handleError(error);
  }
});
```

### 3. Provide Context in Error Messages

```tsx
// ❌ Bad
handleError(error);

// ✅ Good
handleError(error, {
  customMessage: 'Gagal memuat daftar produk'
});
```

### 4. Use Specific Error Handlers

```tsx
// ❌ Bad
handleError(error);

// ✅ Good - Use specific handler for validation
handleValidationError(error);

// ✅ Good - Use specific handler for auth
handleAuthError(error);
```

### 5. Don't Swallow Errors

```tsx
// ❌ Bad
try {
  await someApiCall();
} catch (error) {
  // Silent failure
}

// ✅ Good
try {
  await someApiCall();
} catch (error) {
  handleError(error);
  // Or at minimum, log it
  console.error(error);
}
```

## Creating Custom Errors

```typescript
import { 
  createValidationError, 
  createNotFoundError,
  ApplicationError,
  ErrorType
} from '@/shared/utils/errors';

// Using factory functions
throw createValidationError('Invalid email format', {
  field: 'email',
  value: userInput
});

throw createNotFoundError('Product');

// Creating custom error
throw new ApplicationError(
  ErrorType.VALIDATION,
  'Custom error message',
  { customField: 'value' },
  'CUSTOM_ERROR_CODE',
  400
);
```

## Testing Error Handling

```tsx
import { renderHook } from '@testing-library/react';
import { useErrorHandler } from '@/shared/hooks';

test('handles error correctly', () => {
  const { result } = renderHook(() => useErrorHandler());
  
  const error = new ApplicationError(
    ErrorType.VALIDATION,
    'Test error'
  );
  
  const errorInfo = result.current.handleError(error, {
    showToast: false // Don't show toast in tests
  });
  
  expect(errorInfo.message).toBe('Test error');
});
```

## Debugging

### Development Mode

In development, errors are logged to the console with full details:

```typescript
// Console output
API Error: {
  type: 'validation',
  message: 'Invalid input',
  code: 'VALIDATION_ERROR',
  statusCode: 400,
  details: { field: 'email' }
}
```

### Error Boundary Stack Traces

In development, ErrorBoundary shows stack traces:

```tsx
// Visible in development only
<details>
  <summary>Stack trace</summary>
  <pre>{errorInfo.componentStack}</pre>
</details>
```

## Integration with External Services

### Error Reporting (e.g., Sentry)

```tsx
import * as Sentry from '@sentry/react';

<ErrorBoundary
  onError={(error, errorInfo) => {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      }
    });
  }}
>
  <App />
</ErrorBoundary>
```

### Analytics

```tsx
const { handleError } = useErrorHandler();

try {
  await someApiCall();
} catch (error) {
  // Track error in analytics
  analytics.track('error_occurred', {
    error_type: error.type,
    error_code: error.code
  });
  
  handleError(error);
}
```

## Summary

- Use `useErrorHandler` hook for consistent error handling
- All API errors are automatically transformed to `ApplicationError`
- Provide user-friendly messages in Indonesian
- Use specific error handlers for validation, auth, and network errors
- Wrap components with `ErrorBoundary` to catch React errors
- Always handle errors - never let them fail silently
- Test error handling in your components

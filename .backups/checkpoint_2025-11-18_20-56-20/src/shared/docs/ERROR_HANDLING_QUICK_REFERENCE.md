# Error Handling Quick Reference

## Import

```typescript
import { useErrorHandler } from '@/shared/hooks';
```

## Basic Usage

```typescript
const { handleError } = useErrorHandler();

try {
  await apiCall();
} catch (error) {
  handleError(error);
}
```

## Common Patterns

### With Custom Message
```typescript
handleError(error, {
  customMessage: 'Gagal memuat data'
});
```

### With Retry
```typescript
handleError(error, {
  showRetry: true,
  onRetry: () => retryFunction()
});
```

### Validation Errors
```typescript
const { handleValidationError } = useErrorHandler();
const { fieldErrors } = handleValidationError(error);
```

### Auth Errors (Auto-redirect)
```typescript
const { handleAuthError } = useErrorHandler();
handleAuthError(error);
```

### Network Errors
```typescript
const { handleNetworkError } = useErrorHandler();
handleNetworkError(error, () => retryFunction());
```

## React Query Integration

```typescript
useQuery('key', fetchData, {
  onError: (error) => handleError(error)
});

useMutation(mutateData, {
  onError: (error) => handleError(error, {
    customMessage: 'Gagal menyimpan data'
  })
});
```

## Error Boundary

```tsx
import { ErrorBoundary } from '@/shared/components';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

## Creating Errors

```typescript
import { 
  createValidationError,
  createNotFoundError,
  createAuthenticationError
} from '@/shared/utils/errors';

throw createValidationError('Invalid input');
throw createNotFoundError('Product');
throw createAuthenticationError();
```

## Error Types

- `validation` - Form/input errors
- `authentication` - Login/auth errors
- `authorization` - Permission errors
- `not_found` - Resource not found
- `server` - Server errors (5xx)
- `network` - Network issues
- `unknown` - Unexpected errors

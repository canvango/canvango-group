# API Services Documentation

This directory contains all API service modules for the Member Area feature. Each service provides functions to interact with specific backend endpoints.

## Service Overview

### Core Services

| Service | File | Description |
|---------|------|-------------|
| API Client | `api.ts` | Base Axios client with authentication and error handling |
| Products | `products.service.ts` | Product catalog, purchase, and statistics |
| Transactions | `transactions.service.ts` | Transaction history and account credentials |
| Top Up | `topup.service.ts` | Balance top-up and payment methods |
| Warranty | `warranty.service.ts` | Warranty claims and eligible accounts |
| Verified BM | `verified-bm.service.ts` | Business Manager verification orders |
| User | `user.service.ts` | User profile, stats, and preferences |
| API Keys | `api-keys.service.ts` | API key management and documentation |
| Tutorials | `tutorials.service.ts` | Tutorial content and categories |

## Architecture

### API Client (`api.ts`)

The base API client provides:

- **Authentication**: Automatic token injection in request headers
- **Token Refresh**: Automatic token refresh on 401 errors
- **CSRF Protection**: CSRF token injection for state-changing requests
- **Rate Limiting**: Rate limit header parsing and caching
- **Error Handling**: Consistent error transformation to `ApplicationError`
- **Request Queuing**: Queue requests during token refresh

#### Key Features

```typescript
// Automatic authentication
const response = await apiClient.get('/user/profile');

// CSRF protection (automatic for POST/PUT/PATCH/DELETE)
const result = await apiClient.post('/products/123/purchase', data);

// Rate limit tracking
const rateLimitInfo = parseRateLimitHeaders(response.headers);
```

### Service Patterns

All services follow consistent patterns:

#### 1. Fetch Operations (GET)

```typescript
// Fetch list with pagination
export const fetchProducts = async (
  params: FetchProductsParams
): Promise<PaginatedResponse<Product>> => {
  const response = await apiClient.get('/products', { params });
  return response.data;
};

// Fetch single item
export const fetchProductById = async (id: string): Promise<Product> => {
  const response = await apiClient.get(`/products/${id}`);
  return response.data;
};
```

#### 2. Mutation Operations (POST/PUT/PATCH/DELETE)

```typescript
// Create/Submit
export const purchaseProduct = async (
  data: PurchaseData
): Promise<PurchaseResponse> => {
  const response = await apiClient.post('/products/123/purchase', data);
  return response.data;
};

// Update
export const updateUserProfile = async (
  data: UpdateData
): Promise<User> => {
  const response = await apiClient.patch('/user/profile', data);
  return response.data;
};
```

#### 3. File Upload Operations

```typescript
export const uploadAvatar = async (file: File): Promise<{ avatarUrl: string }> => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await apiClient.post('/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};
```

## Service Details

### Products Service

**Endpoints:**
- `GET /products` - Fetch products with filters
- `GET /products/:id` - Fetch product details
- `POST /products/:id/purchase` - Purchase product
- `GET /products/stats` - Fetch category statistics

**Key Functions:**
- `fetchProducts(params)` - List products with filtering, sorting, pagination
- `fetchProductById(id)` - Get single product details
- `purchaseProduct(data)` - Purchase a product
- `fetchProductStats(category)` - Get category statistics

**Usage Example:**
```typescript
import { fetchProducts, purchaseProduct } from './services/products.service';

// Fetch BM accounts
const products = await fetchProducts({
  category: 'bm',
  type: 'verified',
  page: 1,
  pageSize: 12
});

// Purchase product
const result = await purchaseProduct({
  productId: 'prod_123',
  quantity: 1
});
```

### Transactions Service

**Endpoints:**
- `GET /transactions` - Fetch transaction history
- `GET /transactions/:id` - Fetch transaction details
- `GET /transactions/:id/accounts` - Fetch purchased accounts
- `GET /transactions/stats` - Fetch transaction statistics

**Key Functions:**
- `fetchTransactions(params)` - List transactions with filters
- `fetchTransactionById(id)` - Get transaction details
- `fetchTransactionAccounts(id)` - Get account credentials
- `fetchTransactionStats()` - Get user statistics

**Usage Example:**
```typescript
import { fetchTransactions, fetchTransactionAccounts } from './services/transactions.service';

// Fetch purchase transactions
const transactions = await fetchTransactions({
  type: 'purchase',
  status: 'success',
  page: 1
});

// Get account credentials
const accounts = await fetchTransactionAccounts('txn_123');
```

### Top Up Service

**Endpoints:**
- `POST /topup` - Process top-up
- `GET /topup/methods` - Fetch payment methods
- `GET /topup/history` - Fetch top-up history

**Key Functions:**
- `processTopUp(data)` - Process balance top-up
- `fetchPaymentMethods()` - Get available payment methods
- `fetchTopUpHistory(page, pageSize)` - Get top-up history

**Usage Example:**
```typescript
import { processTopUp, fetchPaymentMethods } from './services/topup.service';

// Get payment methods
const methods = await fetchPaymentMethods();

// Process top-up
const result = await processTopUp({
  amount: 100000,
  paymentMethod: 'qris'
});
```

### Warranty Service

**Endpoints:**
- `GET /warranty/claims` - Fetch warranty claims
- `GET /warranty/claims/:id` - Fetch claim details
- `POST /warranty/claims` - Submit warranty claim
- `GET /warranty/eligible-accounts` - Fetch eligible accounts
- `GET /warranty/stats` - Fetch warranty statistics

**Key Functions:**
- `fetchWarrantyClaims()` - List all claims
- `fetchClaimById(id)` - Get claim details
- `submitWarrantyClaim(data)` - Submit new claim
- `fetchEligibleAccounts()` - Get accounts eligible for warranty
- `fetchWarrantyStats()` - Get warranty statistics

**Usage Example:**
```typescript
import { submitWarrantyClaim, fetchEligibleAccounts } from './services/warranty.service';

// Get eligible accounts
const { accounts } = await fetchEligibleAccounts();

// Submit claim
const claim = await submitWarrantyClaim({
  accountId: 'acc_123',
  reason: 'disabled',
  description: 'Account was disabled after 2 days'
});
```

### Verified BM Service

**Endpoints:**
- `GET /verified-bm/stats` - Fetch order statistics
- `GET /verified-bm/orders` - Fetch orders
- `POST /verified-bm/orders` - Submit new order

**Key Functions:**
- `fetchVerifiedBMStats()` - Get order statistics
- `fetchVerifiedBMOrders()` - List all orders
- `submitVerifiedBMOrder(data)` - Submit verification order

**Usage Example:**
```typescript
import { submitVerifiedBMOrder, fetchVerifiedBMStats } from './services/verified-bm.service';

// Get statistics
const stats = await fetchVerifiedBMStats();

// Submit order
const result = await submitVerifiedBMOrder({
  quantity: 5,
  urls: ['https://business.facebook.com/...']
});
```

### User Service

**Endpoints:**
- `GET /user/profile` - Fetch user profile
- `GET /user/stats` - Fetch user statistics
- `PATCH /user/profile` - Update profile
- `POST /user/change-password` - Change password
- `POST /user/avatar` - Upload avatar
- `DELETE /user/avatar` - Delete avatar
- `GET /user/preferences/notifications` - Fetch notification preferences
- `PATCH /user/preferences/notifications` - Update notification preferences

**Key Functions:**
- `fetchUserProfile()` - Get user profile
- `fetchUserStats()` - Get user statistics
- `updateUserProfile(data)` - Update profile information
- `changePassword(data)` - Change user password
- `uploadAvatar(file)` - Upload profile avatar
- `deleteAvatar()` - Remove profile avatar
- `fetchNotificationPreferences()` - Get notification settings
- `updateNotificationPreferences(prefs)` - Update notification settings

**Usage Example:**
```typescript
import { fetchUserProfile, updateUserProfile } from './services/user.service';

// Get profile
const user = await fetchUserProfile();

// Update profile
const updated = await updateUserProfile({
  username: 'newusername'
});
```

### API Keys Service

**Endpoints:**
- `GET /api/api-keys` - Fetch API key
- `POST /api/api-keys/generate` - Generate new API key
- `GET /api/api-keys/stats` - Fetch API statistics
- `GET /api/api-keys/endpoints` - Fetch endpoint documentation

**Key Functions:**
- `apiKeysService.fetchAPIKey()` - Get current API key
- `apiKeysService.generateAPIKey()` - Generate new key
- `apiKeysService.fetchAPIStats()` - Get usage statistics
- `apiKeysService.fetchAPIEndpoints()` - Get endpoint docs

**Usage Example:**
```typescript
import { apiKeysService } from './services/api-keys.service';

// Get API key
const apiKey = await apiKeysService.fetchAPIKey();

// Generate new key
const newKey = await apiKeysService.generateAPIKey();
```

### Tutorials Service

**Endpoints:**
- `GET /tutorials` - Fetch tutorials with filters
- `GET /tutorials/:slug` - Fetch tutorial by slug

**Key Functions:**
- `tutorialsService.fetchTutorials(filters)` - List tutorials
- `tutorialsService.fetchTutorialBySlug(slug)` - Get tutorial content

**Usage Example:**
```typescript
import { tutorialsService } from './services/tutorials.service';

// Fetch tutorials by category
const tutorials = await tutorialsService.fetchTutorials({
  category: 'getting-started',
  search: 'account'
});

// Get specific tutorial
const tutorial = await tutorialsService.fetchTutorialBySlug('how-to-purchase');
```

## Error Handling

All services use the centralized error handling from `api.ts`:

### Error Types

```typescript
enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  NETWORK = 'network'
}
```

### Error Handling Pattern

```typescript
import { getApiErrorMessage, isRetryableError } from './services/api';

try {
  const result = await purchaseProduct(data);
} catch (error) {
  const message = getApiErrorMessage(error);
  
  if (isRetryableError(error)) {
    // Show retry option
  } else {
    // Show error message
  }
}
```

### Common Error Codes

| Code | Message | Action |
|------|---------|--------|
| `INSUFFICIENT_BALANCE` | Saldo tidak mencukupi | Redirect to top-up |
| `PRODUCT_OUT_OF_STOCK` | Produk habis | Show notification |
| `RATE_LIMIT_EXCEEDED` | Batas permintaan tercapai | Show retry timer |
| `WARRANTY_EXPIRED` | Garansi habis | Disable claim button |
| `INVALID_API_KEY` | API key tidak valid | Regenerate key |

## Security Features

### 1. Authentication

- JWT tokens stored in localStorage
- Automatic token injection in headers
- Token refresh on expiration
- Logout on invalid token

### 2. CSRF Protection

- CSRF tokens for state-changing requests
- Token generation on login
- Token validation on server

### 3. Rate Limiting

- Rate limit header parsing
- Client-side rate limit tracking
- Warning indicators before limit

### 4. Data Validation

- Input validation before API calls
- Response validation
- Type safety with TypeScript

## Testing

### Unit Testing

```typescript
import { fetchProducts } from './products.service';
import apiClient from './api';

jest.mock('./api');

describe('Products Service', () => {
  it('should fetch products with filters', async () => {
    const mockData = { data: [], pagination: {} };
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockData });

    const result = await fetchProducts({ category: 'bm' });
    
    expect(apiClient.get).toHaveBeenCalledWith('/products', {
      params: expect.objectContaining({ category: 'bm' })
    });
    expect(result).toEqual(mockData);
  });
});
```

### Integration Testing

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useProducts } from '../hooks/useProducts';

describe('Products Integration', () => {
  it('should fetch and display products', async () => {
    const { result } = renderHook(() => useProducts({ category: 'bm' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
  });
});
```

## Best Practices

### 1. Always Use TypeScript Types

```typescript
// Good
const user: User = await fetchUserProfile();

// Bad
const user = await fetchUserProfile();
```

### 2. Handle Errors Properly

```typescript
// Good
try {
  const result = await purchaseProduct(data);
  showSuccessToast('Purchase successful');
} catch (error) {
  const message = getApiErrorMessage(error);
  showErrorToast(message);
}

// Bad
const result = await purchaseProduct(data); // Unhandled error
```

### 3. Use React Query for Data Fetching

```typescript
// Good - with React Query
const { data, isLoading, error } = useQuery(
  ['products', filters],
  () => fetchProducts(filters)
);

// Avoid - direct service calls in components
useEffect(() => {
  fetchProducts(filters).then(setData);
}, [filters]);
```

### 4. Validate Input Before API Calls

```typescript
// Good
const schema = z.object({
  amount: z.number().min(10000),
  paymentMethod: z.string()
});

const validated = schema.parse(data);
await processTopUp(validated);

// Bad
await processTopUp(data); // No validation
```

## Maintenance

### Adding New Services

1. Create service file: `src/features/member-area/services/new-feature.service.ts`
2. Define types in: `src/features/member-area/types/new-feature.ts`
3. Export from: `src/features/member-area/services/index.ts`
4. Create hook in: `src/features/member-area/hooks/useNewFeature.ts`
5. Update this README

### Updating Endpoints

1. Update service function
2. Update JSDoc comments
3. Update types if needed
4. Update tests
5. Update documentation

### Deprecating Services

1. Mark as deprecated in JSDoc
2. Add migration guide
3. Update dependent code
4. Remove after grace period

## Related Documentation

- [API Services Documentation](../docs/API_SERVICES_DOCUMENTATION.md)
- [Error Handling Guide](../../../shared/docs/ERROR_HANDLING.md)
- [Security Implementation](../../../shared/docs/SECURITY_IMPLEMENTATION.md)
- [Rate Limiting Guide](../../../shared/utils/rate-limit.ts)

## Support

For issues or questions:
- Check the [API Documentation](../docs/API_SERVICES_DOCUMENTATION.md)
- Review error messages in browser console
- Check network tab for API responses
- Contact backend team for API issues

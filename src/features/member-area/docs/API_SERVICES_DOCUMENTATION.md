# API Services Documentation

This document provides comprehensive documentation for all API service functions in the Member Area feature.

## Overview

API services are organized by domain and provide typed interfaces for all backend interactions. Each service module handles a specific area of functionality:

- **products.service.ts** - Product catalog and purchasing
- **transactions.service.ts** - Transaction history and account credentials
- **topup.service.ts** - Balance top-up operations
- **warranty.service.ts** - Warranty claims management
- **verified-bm.service.ts** - Verified BM service orders
- **api-keys.service.ts** - API key management
- **tutorials.service.ts** - Tutorial content

## Service Architecture

```
┌─────────────────┐
│   React Hook    │ (useProducts, useTransactions, etc.)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Service Layer  │ (products.service.ts, etc.)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Client    │ (api.ts with interceptors)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend API    │
└─────────────────┘
```

## Common Patterns

### Paginated Responses

Most list endpoints return paginated data:

```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
```

### Error Handling

All service functions throw errors that should be caught and handled:

```typescript
try {
  const products = await fetchProducts({ category: 'bm' });
} catch (error) {
  if (error.response?.status === 401) {
    // Handle authentication error
  } else if (error.response?.status === 404) {
    // Handle not found
  } else {
    // Handle general error
  }
}
```

### Authentication

All requests automatically include authentication tokens via API client interceptors. No manual token management required in service functions.

## Products Service

### fetchProducts

Fetches a paginated list of products with optional filters.

**Parameters:**
- `category` - Filter by product category ('bm' or 'personal')
- `type` - Filter by product type (e.g., 'verified', 'old', 'new')
- `search` - Search query for product title/description
- `sortBy` - Sort field ('price', 'createdAt', etc.)
- `sortOrder` - Sort direction ('asc' or 'desc')
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 12)

**Returns:** `PaginatedResponse<Product>`

**Example:**
```typescript
const products = await fetchProducts({
  category: 'bm',
  type: 'verified',
  sortBy: 'price',
  sortOrder: 'asc',
  page: 1,
  pageSize: 12
});
```

### fetchProductById

Fetches detailed information for a single product.

**Parameters:**
- `productId` - Unique product identifier

**Returns:** `Product`

**Throws:** 404 error if product not found

**Example:**
```typescript
const product = await fetchProductById('prod_123');
console.log(product.title, product.price);
```

### purchaseProduct

Initiates a product purchase.

**Parameters:**
- `productId` - ID of product to purchase
- `quantity` - Number of items to purchase

**Returns:** `PurchaseResponse` with transaction ID and status

**Throws:**
- 400 error if insufficient balance
- 404 error if product not found
- 409 error if out of stock

**Example:**
```typescript
const result = await purchaseProduct({
  productId: 'prod_123',
  quantity: 2
});

if (result.status === 'success') {
  console.log('Transaction ID:', result.transactionId);
}
```

### fetchProductStats

Fetches statistics for a product category.

**Parameters:**
- `category` - Product category ('bm' or 'personal')

**Returns:** `ProductStats` with stock, success rate, and total sold

**Example:**
```typescript
const stats = await fetchProductStats('bm');
console.log(`Stock: ${stats.totalStock}`);
console.log(`Success Rate: ${stats.successRate}%`);
```

## Transactions Service

### fetchTransactions

Fetches transaction history with filters and pagination.

**Parameters:**
- `type` - Filter by type ('purchase' or 'topup')
- `status` - Filter by status ('pending', 'success', 'failed')
- `startDate` - Filter from date (ISO format)
- `endDate` - Filter to date (ISO format)
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 10)

**Returns:** `PaginatedResponse<Transaction>`

**Example:**
```typescript
const transactions = await fetchTransactions({
  type: 'purchase',
  status: 'success',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  page: 1
});
```

### fetchTransactionById

Fetches details for a single transaction.

**Parameters:**
- `transactionId` - Unique transaction identifier

**Returns:** `Transaction`

**Example:**
```typescript
const transaction = await fetchTransactionById('txn_123');
```

### fetchTransactionAccounts

Fetches account credentials for a purchase transaction.

**Parameters:**
- `transactionId` - Transaction ID

**Returns:** `Account[]` with credentials

**Security Note:** This endpoint returns sensitive data. Ensure proper authentication and never log credentials.

**Example:**
```typescript
const accounts = await fetchTransactionAccounts('txn_123');
accounts.forEach(account => {
  // Display credentials securely
  console.log('Account URL:', account.credentials.url);
});
```

### fetchTransactionStats

Fetches transaction statistics for the current user.

**Returns:** `TransactionStats` with totals

**Example:**
```typescript
const stats = await fetchTransactionStats();
console.log(`Total Purchases: ${stats.totalPurchases}`);
console.log(`Total Spending: Rp ${stats.totalSpending.toLocaleString()}`);
```

## Top-Up Service

### processTopUp

Processes a balance top-up request.

**Parameters:**
- `amount` - Amount to top up (minimum: 10,000 IDR)
- `paymentMethod` - Selected payment method ID

**Returns:** `TopUpResponse` with payment URL and transaction ID

**Example:**
```typescript
const result = await processTopUp({
  amount: 100000,
  paymentMethod: 'qris'
});

// Redirect to payment URL
window.location.href = result.paymentUrl;
```

### fetchPaymentMethods

Fetches available payment methods.

**Returns:** `PaymentMethod[]` grouped by category

**Example:**
```typescript
const methods = await fetchPaymentMethods();
const ewallets = methods.filter(m => m.category === 'ewallet');
```

## Warranty Service

### fetchWarrantyClaims

Fetches warranty claim history.

**Parameters:**
- `page` - Page number
- `pageSize` - Items per page

**Returns:** `PaginatedResponse<WarrantyClaim>`

### submitWarrantyClaim

Submits a new warranty claim.

**Parameters:**
- `transactionId` - Transaction to claim warranty for
- `accountId` - Specific account ID
- `reason` - Claim reason ('disabled', 'invalid', 'other')
- `description` - Detailed description

**Returns:** `WarrantyClaim` with claim ID

**Example:**
```typescript
const claim = await submitWarrantyClaim({
  transactionId: 'txn_123',
  accountId: 'acc_456',
  reason: 'disabled',
  description: 'Account was disabled after 2 days'
});
```

## Verified BM Service

### fetchVerifiedBMOrders

Fetches verification order history.

**Returns:** `PaginatedResponse<VerifiedBMOrder>`

### submitVerifiedBMOrder

Submits a new verification order.

**Parameters:**
- `quantity` - Number of accounts (1-100)
- `urls` - Array of account URLs

**Returns:** `VerifiedBMOrder` with order ID

**Example:**
```typescript
const order = await submitVerifiedBMOrder({
  quantity: 5,
  urls: [
    'https://business.facebook.com/...',
    'https://business.facebook.com/...'
  ]
});
```

## API Keys Service

### fetchAPIKey

Fetches the current user's API key.

**Returns:** `APIKey` with key and metadata

### generateAPIKey

Generates a new API key (invalidates previous key).

**Returns:** `APIKey` with new key

**Security Note:** Store the new key securely. Previous key will no longer work.

**Example:**
```typescript
const newKey = await generateAPIKey();
// Display key to user for copying
console.log('New API Key:', newKey.key);
```

## Tutorials Service

### fetchTutorials

Fetches tutorial list with filters.

**Parameters:**
- `category` - Filter by category
- `search` - Search query
- `page` - Page number

**Returns:** `PaginatedResponse<Tutorial>`

### fetchTutorialBySlug

Fetches a single tutorial by slug.

**Parameters:**
- `slug` - Tutorial slug (URL-friendly identifier)

**Returns:** `Tutorial` with full content

## Error Handling Best Practices

### 1. Use Try-Catch Blocks

```typescript
try {
  const products = await fetchProducts({ category: 'bm' });
  setProducts(products.data);
} catch (error) {
  console.error('Failed to fetch products:', error);
  showErrorToast('Unable to load products');
}
```

### 2. Handle Specific Error Codes

```typescript
try {
  await purchaseProduct({ productId, quantity });
} catch (error) {
  if (error.response?.status === 400) {
    showErrorToast('Insufficient balance');
  } else if (error.response?.status === 409) {
    showErrorToast('Product out of stock');
  } else {
    showErrorToast('Purchase failed');
  }
}
```

### 3. Use React Query for Automatic Retries

```typescript
const { data, error, isLoading } = useQuery(
  ['products', filters],
  () => fetchProducts(filters),
  {
    retry: 2,
    retryDelay: 1000
  }
);
```

## Testing Services

### Unit Testing

```typescript
import { fetchProducts } from './products.service';
import apiClient from './api';

jest.mock('./api');

describe('fetchProducts', () => {
  it('should fetch products with filters', async () => {
    const mockResponse = {
      data: {
        data: [{ id: '1', title: 'Product 1' }],
        pagination: { page: 1, pageSize: 12, total: 1, totalPages: 1 }
      }
    };
    
    (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
    
    const result = await fetchProducts({ category: 'bm' });
    
    expect(result.data).toHaveLength(1);
    expect(apiClient.get).toHaveBeenCalledWith('/products', {
      params: expect.objectContaining({ category: 'bm' })
    });
  });
});
```

### Integration Testing

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useProducts } from '../hooks/useProducts';

describe('useProducts integration', () => {
  it('should fetch and display products', async () => {
    const { result } = renderHook(() => useProducts({ category: 'bm' }));
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.data).toBeDefined();
    expect(result.current.data.data.length).toBeGreaterThan(0);
  });
});
```

## Performance Considerations

### 1. Caching with React Query

```typescript
const { data } = useQuery(
  ['products', filters],
  () => fetchProducts(filters),
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000  // 10 minutes
  }
);
```

### 2. Request Deduplication

React Query automatically deduplicates identical requests made within a short time window.

### 3. Pagination

Always use pagination for large datasets:

```typescript
const { data } = useInfiniteQuery(
  ['products', filters],
  ({ pageParam = 1 }) => fetchProducts({ ...filters, page: pageParam }),
  {
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    }
  }
);
```

## Security Best Practices

1. **Never log sensitive data** (credentials, API keys, tokens)
2. **Validate input** before sending to API
3. **Handle authentication errors** by redirecting to login
4. **Use HTTPS** for all API requests
5. **Implement rate limiting** on client side
6. **Sanitize user input** to prevent XSS
7. **Store tokens securely** (httpOnly cookies preferred)

## Maintenance

### Adding New Services

1. Create new service file in `services/` directory
2. Import and configure API client
3. Define TypeScript interfaces for requests/responses
4. Add JSDoc comments to all functions
5. Export functions and types
6. Create corresponding React Query hooks
7. Add tests
8. Update this documentation

### Updating Existing Services

1. Update function signatures and types
2. Update JSDoc comments
3. Update tests
4. Update documentation
5. Communicate breaking changes to team

## Resources

- [Axios Documentation](https://axios-http.com/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [JSDoc Reference](https://jsdoc.app/)

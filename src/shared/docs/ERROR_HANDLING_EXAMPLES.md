# Error Handling Examples

This document provides practical examples of error handling in different scenarios.

## Example 1: Product Purchase with Error Handling

```tsx
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useErrorHandler } from '@/shared/hooks';
import { useToast } from '@/shared/contexts/ToastContext';
import { purchaseProduct } from '@/features/member-area/services/products.service';
import Button from '@/shared/components/Button';

interface ProductPurchaseProps {
  productId: string;
  productName: string;
}

export const ProductPurchase: React.FC<ProductPurchaseProps> = ({
  productId,
  productName
}) => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  const { showSuccess } = useToast();

  const purchaseMutation = useMutation(
    (quantity: number) => purchaseProduct({ productId, quantity }),
    {
      onSuccess: (data) => {
        showSuccess(
          'Pembelian berhasil!',
          `${productName} telah ditambahkan ke akun Anda`
        );
        queryClient.invalidateQueries(['transactions']);
        queryClient.invalidateQueries(['user']);
      },
      onError: (error) => {
        handleError(error, {
          customMessage: `Gagal membeli ${productName}`,
          showRetry: true,
          onRetry: () => purchaseMutation.mutate(1)
        });
      }
    }
  );

  return (
    <Button
      onClick={() => purchaseMutation.mutate(1)}
      loading={purchaseMutation.isLoading}
      disabled={purchaseMutation.isLoading}
    >
      Beli Sekarang
    </Button>
  );
};
```

## Example 2: Form Submission with Validation

```tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useErrorHandler } from '@/shared/hooks';
import { useToast } from '@/shared/contexts/ToastContext';
import { submitTopUp } from '@/features/member-area/services/topup.service';

const topUpSchema = z.object({
  amount: z.number().min(10000, 'Minimal Rp 10.000'),
  paymentMethod: z.string().min(1, 'Pilih metode pembayaran')
});

type TopUpFormData = z.infer<typeof topUpSchema>;

export const TopUpForm: React.FC = () => {
  const { handleValidationError, handleError } = useErrorHandler();
  const { showSuccess } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<TopUpFormData>({
    resolver: zodResolver(topUpSchema)
  });

  const onSubmit = async (data: TopUpFormData) => {
    try {
      const result = await submitTopUp(data);
      showSuccess(
        'Top up berhasil!',
        `Saldo Anda telah ditambah Rp ${data.amount.toLocaleString('id-ID')}`
      );
    } catch (error) {
      // Handle validation errors from API
      const errorInfo = handleValidationError(error);
      
      // If there are field-specific errors, you can use them
      if (errorInfo.fieldErrors) {
        console.log('Field errors:', errorInfo.fieldErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input
          type="number"
          {...register('amount', { valueAsNumber: true })}
        />
        {errors.amount && (
          <span className="error">{errors.amount.message}</span>
        )}
      </div>

      <div>
        <select {...register('paymentMethod')}>
          <option value="">Pilih metode</option>
          <option value="qris">QRIS</option>
          <option value="bca">BCA</option>
        </select>
        {errors.paymentMethod && (
          <span className="error">{errors.paymentMethod.message}</span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Memproses...' : 'Top Up Sekarang'}
      </button>
    </form>
  );
};
```

## Example 3: Data Fetching with Network Error Handling

```tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useErrorHandler } from '@/shared/hooks';
import { fetchProducts } from '@/features/member-area/services/products.service';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ErrorMessage } from '@/shared/components/ErrorMessage';

export const ProductList: React.FC = () => {
  const { handleNetworkError } = useErrorHandler();

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery(
    ['products'],
    () => fetchProducts({ page: 1, pageSize: 12 }),
    {
      retry: 2,
      retryDelay: 1000,
      onError: (error) => {
        handleNetworkError(error, () => refetch());
      }
    }
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage
        message="Gagal memuat produk"
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {data?.data.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

## Example 4: Authentication Error with Redirect

```tsx
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useErrorHandler } from '@/shared/hooks';
import { fetchUserProfile } from '@/features/member-area/services/user.service';

export const UserProfile: React.FC = () => {
  const { handleAuthError } = useErrorHandler();

  const { data, error } = useQuery(
    ['user', 'profile'],
    fetchUserProfile,
    {
      retry: false, // Don't retry auth errors
      onError: (error) => {
        // Automatically redirects to login if auth error
        handleAuthError(error);
      }
    }
  );

  if (error) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <div>
      <h1>Welcome, {data?.username}</h1>
      <p>Balance: Rp {data?.balance.toLocaleString('id-ID')}</p>
    </div>
  );
};
```

## Example 5: Multiple Error Types in One Component

```tsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useErrorHandler } from '@/shared/hooks';
import { useToast } from '@/shared/contexts/ToastContext';
import { submitWarrantyClaim } from '@/features/member-area/services/warranty.service';
import { ApplicationError } from '@/shared/utils/errors';

export const WarrantyClaimForm: React.FC = () => {
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  
  const {
    handleError,
    handleValidationError,
    handleAuthError
  } = useErrorHandler();
  const { showSuccess } = useToast();

  const claimMutation = useMutation(
    () => submitWarrantyClaim({
      accountId: selectedAccount,
      reason,
      description: 'Account issue'
    }),
    {
      onSuccess: () => {
        showSuccess(
          'Klaim berhasil diajukan',
          'Tim kami akan meninjau klaim Anda'
        );
      },
      onError: (error: unknown) => {
        if (error instanceof ApplicationError) {
          // Handle different error types
          switch (error.type) {
            case 'validation':
              handleValidationError(error);
              break;
            case 'authentication':
              handleAuthError(error);
              break;
            case 'authorization':
              handleError(error, {
                customMessage: 'Anda tidak memiliki akses untuk fitur ini'
              });
              break;
            default:
              handleError(error, {
                customMessage: 'Gagal mengajukan klaim',
                showRetry: true,
                onRetry: () => claimMutation.mutate()
              });
          }
        } else {
          handleError(error);
        }
      }
    }
  );

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      claimMutation.mutate();
    }}>
      {/* Form fields */}
      <button type="submit" disabled={claimMutation.isLoading}>
        Ajukan Klaim
      </button>
    </form>
  );
};
```

## Example 6: Error Boundary with Custom Fallback

```tsx
import React from 'react';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '@/shared/components/Button';

export const DashboardWithErrorBoundary: React.FC = () => {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo, reset) => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Terjadi Kesalahan
            </h1>
            
            <p className="text-gray-600 mb-6">
              Maaf, terjadi kesalahan saat memuat dashboard. 
              Silakan coba refresh halaman.
            </p>

            <Button
              variant="primary"
              onClick={reset}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Coba Lagi
            </Button>
          </div>
        </div>
      )}
      onError={(error, errorInfo) => {
        // Log to error reporting service
        console.error('Dashboard Error:', error);
        console.error('Component Stack:', errorInfo.componentStack);
        
        // Send to Sentry or other error tracking service
        // Sentry.captureException(error, { contexts: { react: errorInfo } });
      }}
    >
      <Dashboard />
    </ErrorBoundary>
  );
};
```

## Example 7: Silent Error Handling (No Toast)

```tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useErrorHandler } from '@/shared/hooks';
import { fetchNotifications } from '@/features/member-area/services/notifications.service';

export const NotificationBadge: React.FC = () => {
  const { handleError } = useErrorHandler();

  const { data } = useQuery(
    ['notifications', 'unread'],
    fetchNotifications,
    {
      refetchInterval: 30000, // Poll every 30 seconds
      onError: (error) => {
        // Don't show toast for background polling errors
        handleError(error, {
          showToast: false,
          logError: true
        });
      }
    }
  );

  const unreadCount = data?.unreadCount || 0;

  if (unreadCount === 0) return null;

  return (
    <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
      {unreadCount}
    </span>
  );
};
```

## Example 8: Optimistic Updates with Error Rollback

```tsx
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useErrorHandler } from '@/shared/hooks';
import { useToast } from '@/shared/contexts/ToastContext';
import { updateUserProfile } from '@/features/member-area/services/user.service';

export const ProfileEditor: React.FC = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  const { showSuccess } = useToast();

  const updateMutation = useMutation(
    updateUserProfile,
    {
      // Optimistic update
      onMutate: async (newData) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries(['user', 'profile']);

        // Snapshot previous value
        const previousData = queryClient.getQueryData(['user', 'profile']);

        // Optimistically update
        queryClient.setQueryData(['user', 'profile'], newData);

        // Return context with snapshot
        return { previousData };
      },
      onSuccess: () => {
        showSuccess('Profil berhasil diperbarui');
      },
      onError: (error, variables, context) => {
        // Rollback on error
        if (context?.previousData) {
          queryClient.setQueryData(['user', 'profile'], context.previousData);
        }

        handleError(error, {
          customMessage: 'Gagal memperbarui profil',
          showRetry: true,
          onRetry: () => updateMutation.mutate(variables)
        });
      },
      onSettled: () => {
        // Always refetch after error or success
        queryClient.invalidateQueries(['user', 'profile']);
      }
    }
  );

  return (
    <button onClick={() => updateMutation.mutate({ username: 'newname' })}>
      Update Profile
    </button>
  );
};
```

## Summary

These examples demonstrate:
- Basic error handling with custom messages
- Form validation error handling
- Network error handling with retry
- Authentication error handling with redirect
- Multiple error type handling
- Error boundaries with custom fallbacks
- Silent error handling for background tasks
- Optimistic updates with error rollback

Use these patterns as templates for implementing error handling in your components.

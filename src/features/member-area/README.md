# Member Area Content Framework

Comprehensive member area implementation for Canvango Group application providing authenticated users with access to account management, product purchasing, transaction tracking, warranty claims, API integration, and educational resources.

## Table of Contents

- [Overview](#overview)
- [Folder Structure](#folder-structure)
- [Setup Instructions](#setup-instructions)
- [Development Guidelines](#development-guidelines)
- [Architecture](#architecture)
- [Features](#features)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Performance](#performance)
- [Accessibility](#accessibility)
- [Contributing](#contributing)

## Overview

The Member Area is a feature-complete authenticated section of the Canvango Group application. It provides:

- **Dashboard** - Overview with statistics and recent activity
- **Product Catalog** - Browse and purchase BM and Personal accounts
- **Transaction History** - View purchases and top-ups with account credentials
- **Top-Up System** - Add balance with multiple payment methods
- **Warranty Claims** - Submit and track warranty claims
- **Verified BM Service** - Request account verification services
- **API Documentation** - Developer resources and API key management
- **Tutorial Center** - Guides and documentation

## Folder Structure

```
src/features/member-area/
├── components/                 # React components
│   ├── api/                   # API documentation components
│   │   ├── APIEndpointCard.tsx
│   │   ├── APIKeyDisplay.tsx
│   │   ├── APIStatsCards.tsx
│   │   └── APITabNavigation.tsx
│   ├── dashboard/             # Dashboard components
│   │   ├── AlertBox.tsx
│   │   ├── RecentTransactions.tsx
│   │   ├── SummaryCard.tsx
│   │   └── WelcomeBanner.tsx
│   ├── layout/                # Layout components
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── MainContent.tsx
│   │   ├── Sidebar.tsx
│   │   └── WhatsAppButton.tsx
│   ├── products/              # Product catalog components
│   │   ├── CategoryTabs.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductDetailModal.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── SearchSortBar.tsx
│   │   └── VirtualProductGrid.tsx
│   ├── shared/                # Shared components
│   │   ├── Breadcrumb.tsx
│   │   ├── EmptyState.tsx
│   │   ├── StatusBadge.tsx
│   │   └── WarrantyBadge.tsx
│   ├── topup/                 # Top-up components
│   │   ├── NominalSelector.tsx
│   │   ├── PaymentMethodSelector.tsx
│   │   └── TopUpForm.tsx
│   ├── transactions/          # Transaction components
│   │   ├── TabNavigation.tsx
│   │   ├── TransactionDetailModal.tsx
│   │   ├── TransactionFilters.tsx
│   │   └── TransactionTable.tsx
│   ├── tutorials/             # Tutorial components
│   │   ├── TutorialCard.tsx
│   │   ├── TutorialCategoryTabs.tsx
│   │   ├── TutorialGrid.tsx
│   │   └── TutorialSearchBar.tsx
│   ├── verified-bm/           # Verified BM service components
│   │   ├── VerifiedBMOrderForm.tsx
│   │   ├── VerifiedBMOrdersTable.tsx
│   │   └── VerifiedBMStatusCards.tsx
│   ├── warranty/              # Warranty claim components
│   │   ├── ClaimResponseModal.tsx
│   │   ├── ClaimSubmissionSection.tsx
│   │   ├── WarrantyClaimsTable.tsx
│   │   └── WarrantyStatusCards.tsx
│   ├── MemberAreaLayout.tsx   # Main layout wrapper
│   └── ProtectedRoute.tsx     # Route guard component
├── config/                    # Configuration files
│   ├── api-endpoints.config.ts
│   ├── bm-categories.config.ts
│   ├── personal-types.config.ts
│   └── routes.config.ts
├── contexts/                  # React contexts
│   ├── AuthContext.tsx        # Authentication state
│   └── UIContext.tsx          # UI state (sidebar, toasts)
├── docs/                      # Documentation
│   ├── API_SERVICES_DOCUMENTATION.md
│   ├── COMPONENT_DOCUMENTATION_GUIDE.md
│   ├── ANALYTICS_INTEGRATION.md
│   ├── PERFORMANCE_OPTIMIZATION.md
│   └── [other guides]
├── examples/                  # Usage examples
│   ├── AnalyticsIntegration.tsx
│   └── UIContextExample.tsx
├── hooks/                     # Custom React hooks
│   ├── useAPIKeys.ts
│   ├── useNavigation.ts
│   ├── usePageTitle.ts
│   ├── useProducts.ts
│   ├── usePurchase.ts
│   ├── useTopUp.ts
│   ├── useTransactions.ts
│   ├── useTutorials.ts
│   ├── useVerifiedBM.ts
│   └── useWarranty.ts
├── pages/                     # Page components
│   ├── APIDocumentation.tsx
│   ├── BMAccounts.tsx
│   ├── ClaimWarranty.tsx
│   ├── Dashboard.tsx
│   ├── PersonalAccounts.tsx
│   ├── TopUp.tsx
│   ├── TransactionHistory.tsx
│   ├── TutorialCenter.tsx
│   └── VerifiedBMService.tsx
├── services/                  # API service layer
│   ├── api.ts                 # Axios client with interceptors
│   ├── api-keys.service.ts
│   ├── products.service.ts
│   ├── topup.service.ts
│   ├── transactions.service.ts
│   ├── tutorials.service.ts
│   ├── verified-bm.service.ts
│   ├── warranty.service.ts
│   └── index.ts
├── types/                     # TypeScript type definitions
│   ├── api.ts
│   ├── product.ts
│   ├── transaction.ts
│   ├── tutorial.ts
│   ├── verified-bm.ts
│   └── warranty.ts
├── utils/                     # Utility functions
│   ├── breadcrumbs.ts         # Breadcrumb generation
│   ├── design-system.ts       # Design tokens
│   ├── formatters.ts          # Currency, date formatters
│   ├── helpers.ts             # General helpers
│   ├── icon-sizes.ts          # Icon size constants
│   ├── navigation.ts          # Navigation helpers
│   └── validators.ts          # Input validators
├── MemberArea.tsx             # Main entry component
├── routes.tsx                 # Route configuration
└── README.md                  # This file
```

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm/yarn
- React 18+
- TypeScript 4.9+
- Tailwind CSS configured
- React Router v6
- React Query (TanStack Query)

### Installation

1. **Install dependencies:**

```bash
npm install react-router-dom @tanstack/react-query axios lucide-react zod react-hook-form
```

2. **Configure Tailwind CSS:**

Ensure your `tailwind.config.js` includes the member area paths:

```javascript
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './src/features/member-area/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
        },
      },
    },
  },
};
```

3. **Set up environment variables:**

Create a `.env` file:

```env
REACT_APP_API_URL=https://api.canvangogroup.com
REACT_APP_WHATSAPP_NUMBER=6281234567890
```

4. **Configure React Query:**

In your app root:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MemberArea />
    </QueryClientProvider>
  );
}
```

5. **Set up authentication:**

Wrap your app with AuthProvider:

```tsx
import { AuthProvider } from './features/member-area/contexts/AuthContext';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemberArea />
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

### Quick Start

```tsx
import MemberArea from './features/member-area/MemberArea';

function App() {
  return <MemberArea />;
}
```

## Development Guidelines

### Code Style

- **TypeScript**: Use strict mode, define all types
- **Components**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions
- **File Structure**: One component per file
- **Imports**: Absolute imports from `src/`

### Component Guidelines

1. **Always add JSDoc comments** to components and props
2. **Use TypeScript interfaces** for all props
3. **Implement accessibility** features (ARIA labels, keyboard navigation)
4. **Follow responsive design** patterns (mobile-first)
5. **Add loading and error states** to all data-fetching components
6. **Use shared components** when possible

Example component structure:

```tsx
/**
 * MyComponent - Brief description
 * 
 * @description
 * Detailed description of component purpose and behavior.
 * 
 * @example
 * ```tsx
 * <MyComponent prop1="value" onAction={handler} />
 * ```
 */
interface MyComponentProps {
  prop1: string;
  onAction: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ prop1, onAction }) => {
  // Component implementation
};

export default MyComponent;
```

### API Service Guidelines

1. **Add JSDoc comments** to all service functions
2. **Define request/response types** with TypeScript
3. **Handle errors** appropriately
4. **Use async/await** for all API calls
5. **Include usage examples** in comments

Example service function:

```typescript
/**
 * Fetch products with filters
 * 
 * @async
 * @param {FetchProductsParams} params - Filter parameters
 * @returns {Promise<PaginatedResponse<Product>>} Paginated products
 * @throws {Error} When API request fails
 * 
 * @example
 * ```typescript
 * const products = await fetchProducts({ category: 'bm', page: 1 });
 * ```
 */
export const fetchProducts = async (
  params: FetchProductsParams
): Promise<PaginatedResponse<Product>> => {
  // Implementation
};
```

### Hook Guidelines

1. **Use React Query** for data fetching
2. **Implement proper caching** strategies
3. **Handle loading and error states**
4. **Add TypeScript types** for all hooks
5. **Document hook behavior** with JSDoc

Example custom hook:

```typescript
/**
 * Hook for fetching and managing products
 * 
 * @param {ProductFilters} filters - Product filters
 * @returns {UseQueryResult} Query result with products data
 */
export const useProducts = (filters: ProductFilters) => {
  return useQuery(
    ['products', filters],
    () => fetchProducts(filters),
    {
      staleTime: 5 * 60 * 1000,
    }
  );
};
```

### Testing Guidelines

1. **Write unit tests** for utility functions
2. **Test components** with React Testing Library
3. **Mock API calls** in tests
4. **Test accessibility** features
5. **Aim for 80%+ coverage** on critical paths

### Git Workflow

1. Create feature branch: `git checkout -b feature/component-name`
2. Make changes and commit: `git commit -m "feat: add component"`
3. Push and create PR: `git push origin feature/component-name`
4. Request code review
5. Merge after approval

### Commit Message Format

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

## Architecture

### Component Architecture

```
┌─────────────────────────────────────┐
│         MemberArea (Root)           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      MemberAreaLayout               │
│  ┌─────────────────────────────┐   │
│  │  Header                     │   │
│  ├─────────────────────────────┤   │
│  │ Sidebar │  MainContent      │   │
│  │         │  ┌──────────────┐ │   │
│  │         │  │ Page Content │ │   │
│  │         │  └──────────────┘ │   │
│  ├─────────────────────────────┤   │
│  │  Footer                     │   │
│  └─────────────────────────────┘   │
│  WhatsAppButton (floating)          │
└─────────────────────────────────────┘
```

### Data Flow

```
┌──────────────┐
│  Component   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Custom Hook  │ (useProducts, useTransactions)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ React Query  │ (caching, refetching)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ API Service  │ (products.service.ts)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  API Client  │ (axios with interceptors)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Backend API  │
└──────────────┘
```

### State Management

- **Server State**: React Query (API data, caching)
- **Authentication**: AuthContext (user, tokens)
- **UI State**: UIContext (sidebar, toasts, theme)
- **Local State**: useState, useReducer (component-specific)
- **Form State**: React Hook Form (form data, validation)

## Features

### ✅ Completed Features

#### Core Infrastructure
- Project structure and dependencies
- Shared UI components (Button, Input, Badge, Card, Modal, etc.)
- Authentication context and API client with interceptors
- Layout components (Header, Sidebar, Footer, WhatsApp button)
- Routing with React Router (nested routes, lazy loading)
- Navigation utilities (useNavigation hook, breadcrumbs)
- TypeScript type definitions
- Utility functions (formatters, validators, helpers)
- Error handling system (ErrorBoundary, Toast notifications)
- Loading states (Skeleton loaders, Spinners)

#### Pages
- ✅ Dashboard - Overview with statistics and recent activity
- ✅ Transaction History - View purchases and top-ups
- ✅ Top Up - Add balance with payment methods
- ✅ BM Accounts - Browse and purchase Business Manager accounts
- ✅ Personal Accounts - Browse and purchase Personal accounts
- ✅ Verified BM Service - Request verification services
- ✅ Claim Warranty - Submit and track warranty claims
- ✅ API Documentation - Developer resources and API keys
- ✅ Tutorial Center - Guides and documentation

#### Features
- ✅ Product filtering and sorting
- ✅ Search functionality
- ✅ Pagination
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Accessibility features (WCAG 2.1 AA)
- ✅ Performance optimization (code splitting, lazy loading)
- ✅ Analytics tracking
- ✅ Security measures (XSS prevention, rate limiting)
- ✅ Filter persistence (URL params, localStorage)
- ✅ Copy to clipboard functionality
- ✅ Confirmation dialogs
- ✅ Empty states
- ✅ Status badges
- ✅ Virtual scrolling for large lists

### 🚧 In Progress

- Comprehensive testing (unit, integration, E2E)
- Documentation completion
- Performance monitoring
- Additional accessibility improvements

### 📋 Planned Features

- Dark mode support
- Multi-language support (i18n)
- Advanced analytics dashboard
- Export functionality (CSV, PDF)
- Bulk operations
- Advanced filtering options

## Usage Examples

### Basic Setup

```tsx
import MemberArea from './features/member-area/MemberArea';
import { AuthProvider } from './features/member-area/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemberArea />
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

### Using Components

#### Product Card

```tsx
import ProductCard from './features/member-area/components/products/ProductCard';

function ProductList() {
  const handleBuy = (productId: string) => {
    // Handle purchase
  };

  const handleViewDetails = (productId: string) => {
    // Show product details
  };

  return (
    <ProductCard
      product={{
        id: 'prod_123',
        category: 'bm',
        title: 'BM Verified Account',
        description: 'Verified Business Manager account',
        price: 500000,
        stock: 10
      }}
      onBuy={handleBuy}
      onViewDetails={handleViewDetails}
    />
  );
}
```

#### Data Table

```tsx
import DataTable from './shared/components/DataTable';

function TransactionList() {
  const columns = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'date', header: 'Date', sortable: true },
    { key: 'amount', header: 'Amount', render: (value) => formatCurrency(value) },
    { key: 'status', header: 'Status', render: (value) => <StatusBadge status={value} /> }
  ];

  return (
    <DataTable
      data={transactions}
      columns={columns}
      pagination={{
        page: 1,
        pageSize: 10,
        total: 100,
        onPageChange: (page) => setPage(page)
      }}
    />
  );
}
```

### Using Hooks

#### Fetching Products

```tsx
import { useProducts } from './features/member-area/hooks/useProducts';

function BMAccountsPage() {
  const { data, isLoading, error } = useProducts({
    category: 'bm',
    type: 'verified',
    page: 1,
    pageSize: 12
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <ProductGrid products={data.data} />
  );
}
```

#### Purchasing Products

```tsx
import { usePurchase } from './features/member-area/hooks/usePurchase';

function ProductCard({ product }) {
  const { mutate: purchase, isLoading } = usePurchase();

  const handleBuy = () => {
    purchase(
      { productId: product.id, quantity: 1 },
      {
        onSuccess: (result) => {
          showToast('Purchase successful!', 'success');
          navigate(`/transactions/${result.transactionId}`);
        },
        onError: (error) => {
          showToast('Purchase failed', 'error');
        }
      }
    );
  };

  return (
    <Button onClick={handleBuy} loading={isLoading}>
      Buy Now
    </Button>
  );
}
```

#### Navigation

```tsx
import { useNavigation } from './features/member-area/hooks/useNavigation';

function Navigation() {
  const { navigateTo, isActive } = useNavigation();

  return (
    <nav>
      <button
        onClick={() => navigateTo('/dashboard')}
        className={isActive('/dashboard') ? 'active' : ''}
      >
        Dashboard
      </button>
      <button
        onClick={() => navigateTo('/accounts/bm', { category: 'verified' })}
      >
        BM Accounts
      </button>
    </nav>
  );
}
```

### Using Services

#### Direct API Calls

```tsx
import { fetchProducts, purchaseProduct } from './features/member-area/services/products.service';

async function loadProducts() {
  try {
    const result = await fetchProducts({
      category: 'bm',
      page: 1,
      pageSize: 12
    });
    console.log('Products:', result.data);
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }
}

async function buyProduct(productId: string) {
  try {
    const result = await purchaseProduct({
      productId,
      quantity: 1
    });
    console.log('Transaction ID:', result.transactionId);
  } catch (error) {
    console.error('Purchase failed:', error);
  }
}
```

### Using Contexts

#### Authentication Context

```tsx
import { useAuth } from './features/member-area/contexts/AuthContext';

function UserProfile() {
  const { user, logout, updateProfile } = useAuth();

  return (
    <div>
      <h2>Welcome, {user?.username}</h2>
      <p>Balance: {formatCurrency(user?.balance)}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

#### UI Context

```tsx
import { useUI } from './features/member-area/contexts/UIContext';

function Sidebar() {
  const { sidebarOpen, toggleSidebar, showToast } = useUI();

  const handleAction = () => {
    // Perform action
    showToast('Action completed successfully', 'success');
  };

  return (
    <aside className={sidebarOpen ? 'open' : 'closed'}>
      <button onClick={toggleSidebar}>Toggle</button>
      <button onClick={handleAction}>Do Something</button>
    </aside>
  );
}
```

### Utility Functions

#### Formatters

```tsx
import { formatCurrency, formatDate, formatRelativeTime } from './features/member-area/utils/formatters';

function TransactionItem({ transaction }) {
  return (
    <div>
      <p>Amount: {formatCurrency(transaction.amount)}</p>
      <p>Date: {formatDate(transaction.createdAt)}</p>
      <p>Time: {formatRelativeTime(transaction.createdAt)}</p>
    </div>
  );
}
```

#### Validators

```tsx
import { isValidUrl, isValidEmail, isValidAmount } from './features/member-area/utils/validators';

function TopUpForm() {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!isValidAmount(amount, 10000)) {
      setError('Minimum amount is Rp 10,000');
      return;
    }
    // Process top-up
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={error}
      />
      <Button type="submit">Top Up</Button>
    </form>
  );
}
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test ProductCard.test.tsx
```

### Writing Tests

#### Component Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

#### Hook Tests

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useProducts } from './useProducts';

describe('useProducts', () => {
  it('fetches products successfully', async () => {
    const { result } = renderHook(() => useProducts({ category: 'bm' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data.data.length).toBeGreaterThan(0);
  });
});
```

#### Service Tests

```tsx
import { fetchProducts } from './products.service';
import apiClient from './api';

jest.mock('./api');

describe('fetchProducts', () => {
  it('fetches products with filters', async () => {
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

## Performance

### Optimization Techniques

1. **Code Splitting** - Lazy load pages and heavy components
2. **React Query Caching** - Reduce redundant API calls
3. **Virtual Scrolling** - Handle large lists efficiently
4. **Image Optimization** - Lazy load and compress images
5. **Debouncing** - Reduce search input API calls
6. **Memoization** - Use React.memo for expensive components

### Performance Monitoring

```tsx
import { useAnalytics } from './shared/hooks/useAnalytics';

function ProductPage() {
  const { trackPageView, trackEvent } = useAnalytics();

  useEffect(() => {
    trackPageView('Product Page');
  }, []);

  const handlePurchase = () => {
    trackEvent('Purchase', { productId: 'prod_123' });
  };

  return <ProductCard onBuy={handlePurchase} />;
}
```

## Accessibility

### WCAG 2.1 AA Compliance

- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ ARIA labels and roles
- ✅ Color contrast ratios (4.5:1 for text)
- ✅ Focus indicators
- ✅ Minimum touch target sizes (44x44px)
- ✅ Form labels and error messages
- ✅ Skip links for navigation

### Testing Accessibility

```bash
# Run accessibility tests
npm run test:a11y

# Manual testing checklist
- [ ] Tab through all interactive elements
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Verify color contrast with tools
- [ ] Test keyboard shortcuts
- [ ] Verify focus management in modals
```

## Contributing

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] JSDoc comments added
- [ ] TypeScript types defined
- [ ] Accessibility features implemented
- [ ] Responsive design tested
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Documentation updated

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Accessibility tested

## Screenshots
(if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
```

## Technologies

- **React 18+** - UI library
- **TypeScript 4.9+** - Type safety
- **React Router v6** - Client-side routing
- **React Query (TanStack Query)** - Server state management
- **Lucide React** - Icon library
- **Tailwind CSS** - Utility-first CSS
- **Axios** - HTTP client
- **Zod** - Schema validation
- **React Hook Form** - Form management
- **Jest** - Testing framework
- **React Testing Library** - Component testing

## Resources

### Documentation
- [Component Documentation Guide](./docs/COMPONENT_DOCUMENTATION_GUIDE.md)
- [API Services Documentation](./docs/API_SERVICES_DOCUMENTATION.md)
- [Performance Optimization](./docs/PERFORMANCE_OPTIMIZATION.md)
- [Analytics Integration](./docs/ANALYTICS_INTEGRATION.md)
- [Accessibility Guide](../../shared/docs/ACCESSIBILITY.md)
- [Error Handling](../../shared/docs/ERROR_HANDLING.md)

### External Resources
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Support

For questions or issues:
- Check the [documentation](./docs/)
- Review [examples](./examples/)
- Contact the development team
- Submit an issue on GitHub

## License

Copyright © 2024 Canvango Group. All rights reserved.

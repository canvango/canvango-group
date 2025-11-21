# Design Document

## Overview

The Member Area Content Framework is a comprehensive user interface system that provides authenticated members with access to account management, product purchasing, transaction tracking, warranty claims, API integration, and educational resources. The design follows modern web application patterns with a focus on usability, accessibility, and performance.

### Design Goals

1. **Consistency**: Maintain uniform design patterns across all pages
2. **Usability**: Provide intuitive navigation and clear information hierarchy
3. **Performance**: Ensure fast load times and smooth interactions
4. **Accessibility**: Support keyboard navigation and screen readers
5. **Responsiveness**: Adapt seamlessly to all device sizes
6. **Scalability**: Support future feature additions without major refactoring

### Technology Stack

- **Frontend Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS for utility-first styling
- **Icons**: Lucide React for consistent iconography
- **State Management**: React Context API + React Query for server state
- **Routing**: React Router v6 for client-side navigation
- **Forms**: React Hook Form with Zod validation
- **API Client**: Axios with interceptors for authentication
- **UI Components**: Custom components built on Radix UI primitives

## Architecture

### Component Hierarchy

```
MemberArea/
├── Layout/
│   ├── Header
│   ├── Sidebar
│   ├── MainContent
│   └── Footer
├── Pages/
│   ├── Dashboard
│   ├── TransactionHistory
│   ├── TopUp
│   ├── BMAccounts
│   ├── PersonalAccounts
│   ├── VerifiedBMService
│   ├── ClaimWarranty
│   ├── APIDocumentation
│   └── TutorialCenter
├── Components/
│   ├── Cards/
│   ├── Tables/
│   ├── Forms/
│   ├── Modals/
│   └── EmptyStates/
└── Shared/
    ├── Button
    ├── Badge
    ├── Input
    └── Select
```

### Routing Structure


```
/member
├── /dashboard                    # Dashboard overview
├── /transactions                 # Transaction history
│   ├── ?tab=accounts            # Account transactions
│   └── ?tab=topup               # Top-up transactions
├── /topup                       # Top-up balance page
├── /accounts
│   ├── /bm                      # Business Manager accounts
│   │   └── ?category=verified   # Filtered by category
│   └── /personal                # Personal Facebook accounts
│       └── ?type=old            # Filtered by type
├── /services
│   └── /verified-bm             # Verified BM service
├── /warranty                    # Warranty claims
├── /api                         # API documentation
└── /tutorials                   # Tutorial center
    └── ?category=getting-started # Filtered by category
```

## Components and Interfaces

### 1. Layout Components

#### Header Component

**Purpose**: Provides branding, user identification, and quick access to profile

**Props Interface**:
```typescript
interface HeaderProps {
  user: {
    username: string;
    role: 'member' | 'admin';
    avatar?: string;
  };
  onProfileClick: () => void;
}
```

**Visual Design**:
- Fixed position at top
- White background with subtle bottom border
- Left: Canvango Group logo (custom icon + text)
- Right: User profile button with avatar/initial and username
- Height: 64px
- Z-index: 50


#### Sidebar Component

**Purpose**: Primary navigation menu for all member area sections

**Props Interface**:
```typescript
interface SidebarProps {
  currentPath: string;
  user: {
    username: string;
    balance: number;
    stats?: {
      transactions: number;
    };
  };
  onNavigate: (path: string) => void;
}
```

**Visual Design**:
- Fixed position on left side
- Width: 240px (desktop), collapsible on mobile
- Light gray background (#F9FAFB)
- Sections:
  1. User Profile Card (avatar, username, balance, quick stats)
  2. MENU UTAMA (Main Menu)
  3. AKUN & LAYANAN (Accounts & Services)
  4. LAINNYA (Others)

**Menu Items**:
```typescript
const menuStructure = [
  {
    section: 'MENU UTAMA',
    items: [
      { icon: Home, label: 'Dashboard', path: '/member/dashboard' },
      { icon: History, label: 'Riwayat Transaksi', path: '/member/transactions' },
      { icon: Wallet, label: 'Top Up', path: '/member/topup' }
    ]
  },
  {
    section: 'AKUN & LAYANAN',
    items: [
      { icon: Infinity, label: 'Akun BM', path: '/member/accounts/bm' },
      { icon: User, label: 'Akun Personal', path: '/member/accounts/personal' },
      { icon: CheckCircle, label: 'Jasa Verified BM', path: '/member/services/verified-bm' },
      { icon: Shield, label: 'Claim Garansi', path: '/member/warranty' }
    ]
  },
  {
    section: 'LAINNYA',
    items: [
      { icon: Code, label: 'API', path: '/member/api' },
      { icon: BookOpen, label: 'Tutorial', path: '/member/tutorials' }
    ]
  }
];
```


#### WhatsApp Float Button

**Purpose**: Quick access to customer support via WhatsApp

**Props Interface**:
```typescript
interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
}
```

**Visual Design**:
- Fixed position: bottom-right (24px from edges)
- Size: 56x56px
- Background: WhatsApp green (#25D366)
- Icon: WhatsApp logo (white)
- Shadow: Large shadow for prominence
- Hover: Scale up slightly (1.05)
- Z-index: 100

### 2. Dashboard Components

#### Welcome Banner

**Purpose**: Personalized greeting and operational information

**Props Interface**:
```typescript
interface WelcomeBannerProps {
  username: string;
  message: string;
  operationalInfo?: string;
}
```

**Visual Design**:
- Gradient background: Blue to indigo (#6366F1 to #4F46E5)
- Rounded corners: 12px
- Padding: 32px
- Text color: White
- Icon: Home icon
- Marquee ticker below for announcements

#### Summary Card

**Purpose**: Display key metrics and statistics

**Props Interface**:
```typescript
interface SummaryCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  subInfo?: {
    text: string;
    color: 'green' | 'blue' | 'orange' | 'red';
  };
  bgColor: string;
}
```


**Visual Design**:
- Background: Light color matching theme (blue-50, green-50, orange-50, red-50)
- Border radius: 8px
- Padding: 20px
- Icon: Colored circle background
- Value: Large, bold text
- Label: Smaller, gray text
- Sub-info: Small badge with colored text

#### Alert Box

**Purpose**: Display important notifications and warnings

**Props Interface**:
```typescript
interface AlertBoxProps {
  type: 'info' | 'warning' | 'error' | 'success';
  icon: LucideIcon;
  title: string;
  content: React.ReactNode;
}
```

**Visual Design**:
- Border-left: 4px solid (color based on type)
- Background: Light tint of type color
- Padding: 16px
- Icon: Colored, positioned at top-left
- Title: Bold text
- Content: Can include lists, links, and formatted text

#### Recent Transactions Table

**Purpose**: Display latest transaction records

**Props Interface**:
```typescript
interface TransactionTableProps {
  transactions: Transaction[];
  columns: Column[];
  onViewDetails: (id: string) => void;
}

interface Transaction {
  id: string;
  date: string;
  product: string;
  quantity: number;
  total: number;
  status: 'success' | 'pending' | 'failed';
}
```


**Visual Design**:
- Table header: Gray background, bold text
- Rows: Alternating white/light gray
- Hover: Light blue background
- Status badges: Colored pills (green for success, yellow for pending, red for failed)
- Action buttons: Icon buttons with tooltips
- Responsive: Horizontal scroll on mobile

### 3. Product Catalog Components

#### Product Card

**Purpose**: Display product information with purchase options

**Props Interface**:
```typescript
interface ProductCardProps {
  product: {
    id: string;
    category: string;
    title: string;
    description: string;
    price: number;
    stock: number;
    icon: string;
  };
  onBuy: (id: string) => void;
  onViewDetails: (id: string) => void;
}
```

**Visual Design**:
- Card: White background, rounded corners (8px), subtle shadow
- Category badge: Top position, colored background
- Icon: Large, centered (Meta/Facebook logo)
- Title: Bold, 16px
- Description: Gray text, 14px, 2-3 lines with ellipsis
- Price: Large, blue, bold
- Stock indicator: Small icon with text
- Buttons: 
  - Primary (Buy): Gradient blue, full width
  - Secondary (Detail): Outline blue, full width
- Out of stock: Pink/red button, disabled state


#### Category Filter Tabs

**Purpose**: Filter products by category or type

**Props Interface**:
```typescript
interface FilterTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: LucideIcon;
    count?: number;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}
```

**Visual Design**:
- Horizontal scrollable container
- Tab: Rounded pill shape
- Active: Blue background, white text
- Inactive: Gray background, dark text
- Hover: Slightly darker background
- Icon: Optional, positioned before label
- Count badge: Optional, positioned after label

#### Search and Sort Bar

**Purpose**: Search and sort product listings

**Props Interface**:
```typescript
interface SearchSortBarProps {
  searchValue: string;
  sortValue: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
  sortOptions: Array<{ value: string; label: string }>;
}
```

**Visual Design**:
- Container: Flex row, space between
- Search input: Icon prefix, rounded, border
- Sort dropdown: Icon prefix, rounded, border
- Responsive: Stack vertically on mobile


### 4. Form Components

#### Top Up Form

**Purpose**: Allow users to select amount and payment method

**Props Interface**:
```typescript
interface TopUpFormProps {
  onSubmit: (data: { amount: number; method: string }) => void;
  paymentMethods: PaymentMethod[];
}

interface PaymentMethod {
  id: string;
  name: string;
  logo: string;
  category: 'ewallet' | 'va';
}
```

**Visual Design**:
- Two-column layout (amount selection | payment methods)
- Amount options: Grid of buttons (2x3)
- Selected amount: Blue background
- Custom amount input: Below grid
- Payment methods: Grouped by category
- Method cards: Logo + name, selectable
- Submit button: Large, blue, full width

#### Verified BM Service Form

**Purpose**: Submit verification requests

**Props Interface**:
```typescript
interface VerifiedBMFormProps {
  onSubmit: (data: { quantity: number; urls: string }) => void;
}
```

**Visual Design**:
- Single column layout
- Quantity input: Number input with validation
- URL textarea: Multi-line input with helper text
- Submit button: Blue, full width
- Validation: Inline error messages


### 5. Table Components

#### Data Table

**Purpose**: Display tabular data with sorting and pagination

**Props Interface**:
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  onRowClick?: (row: T) => void;
}

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
}
```

**Visual Design**:
- Responsive: Horizontal scroll on mobile
- Header: Sticky, gray background
- Rows: Hover effect
- Pagination: Bottom, centered
- Empty state: Centered message with icon

### 6. Modal Components

#### Product Detail Modal

**Purpose**: Show detailed product information

**Props Interface**:
```typescript
interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onBuy: (productId: string) => void;
}
```

**Visual Design**:
- Overlay: Semi-transparent black
- Modal: White, centered, max-width 600px
- Close button: Top-right corner
- Content: Scrollable if needed
- Actions: Bottom, right-aligned


### 7. Empty State Components

**Purpose**: Display friendly messages when no data is available

**Props Interface**:
```typescript
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**Visual Design**:
- Centered layout
- Large icon: Gray color, 64x64px
- Title: Bold, 18px
- Description: Gray text, 14px
- Action button: Optional, blue

## Data Models

### User Model

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  role: 'member' | 'admin';
  balance: number;
  avatar?: string;
  createdAt: Date;
  stats: {
    totalPurchases: number;
    totalSpending: number;
    totalTopUps: number;
    successRate: number;
  };
}
```

### Product Model

```typescript
interface Product {
  id: string;
  category: 'bm' | 'personal';
  type: string; // 'verified', 'limit-250', 'old', 'new', etc.
  title: string;
  description: string;
  price: number;
  stock: number;
  features: string[];
  warranty: {
    enabled: boolean;
    duration: number; // days
  };
  createdAt: Date;
  updatedAt: Date;
}
```


### Transaction Model

```typescript
interface Transaction {
  id: string;
  userId: string;
  type: 'purchase' | 'topup';
  status: 'pending' | 'success' | 'failed';
  amount: number;
  quantity?: number;
  product?: {
    id: string;
    title: string;
  };
  paymentMethod?: string;
  accounts?: Account[];
  warranty?: {
    expiresAt: Date;
    claimed: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Account Model

```typescript
interface Account {
  id: string;
  transactionId: string;
  type: 'bm' | 'personal';
  credentials: {
    url: string;
    username?: string;
    password?: string;
    additionalInfo?: Record<string, any>;
  };
  status: 'active' | 'disabled' | 'claimed';
  warranty: {
    expiresAt: Date;
    claimed: boolean;
  };
  createdAt: Date;
}
```

### Warranty Claim Model

```typescript
interface WarrantyClaim {
  id: string;
  transactionId: string;
  accountId: string;
  userId: string;
  reason: 'disabled' | 'invalid' | 'other';
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  adminResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}
```


### Verified BM Order Model

```typescript
interface VerifiedBMOrder {
  id: string;
  userId: string;
  quantity: number;
  urls: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  amount: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
```

### Tutorial Model

```typescript
interface Tutorial {
  id: string;
  title: string;
  slug: string;
  category: 'getting-started' | 'account' | 'transaction' | 'api' | 'troubleshoot';
  content: string;
  thumbnail?: string;
  readTime: number; // minutes
  views: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Handling

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

interface AppError {
  type: ErrorType;
  message: string;
  details?: Record<string, any>;
  code?: string;
}
```


### Error Handling Strategy

1. **Validation Errors**: Display inline with form fields
2. **Authentication Errors**: Redirect to login page
3. **Authorization Errors**: Show 403 page with explanation
4. **Not Found Errors**: Show 404 page with navigation options
5. **Server Errors**: Show error toast with retry option
6. **Network Errors**: Show offline indicator with retry option

### Error Display Components

```typescript
// Toast Notification
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Error Boundary
interface ErrorBoundaryProps {
  fallback: (error: Error) => React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}
```

## Testing Strategy

### Unit Testing

**Components to Test**:
- All form components with validation logic
- Data transformation utilities
- Custom hooks
- State management logic

**Testing Tools**:
- Jest for test runner
- React Testing Library for component testing
- MSW (Mock Service Worker) for API mocking


### Integration Testing

**Scenarios to Test**:
- Complete purchase flow (product selection → payment → confirmation)
- Top-up flow (amount selection → payment method → processing)
- Warranty claim flow (claim submission → status tracking)
- API key generation and usage

### E2E Testing

**Critical Paths**:
- User login → Dashboard view
- Product browsing → Purchase → Transaction history
- Balance top-up → Purchase with new balance
- Warranty claim submission → Admin response

**Testing Tools**:
- Playwright or Cypress for E2E testing

## Performance Optimization

### Code Splitting

```typescript
// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TransactionHistory = lazy(() => import('./pages/TransactionHistory'));
const BMAccounts = lazy(() => import('./pages/BMAccounts'));
// ... other pages

// Route configuration with Suspense
<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/transactions" element={<TransactionHistory />} />
    {/* ... other routes */}
  </Routes>
</Suspense>
```

### Data Fetching Strategy

```typescript
// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});
```


### Image Optimization

- Use WebP format with fallback to PNG/JPG
- Implement lazy loading for images below the fold
- Use appropriate image sizes for different viewports
- Compress images to reduce file size

### Bundle Optimization

- Tree-shaking to remove unused code
- Minification of JavaScript and CSS
- Compression (Gzip/Brotli) for static assets
- CDN for static assets

## Accessibility Features

### Keyboard Navigation

- All interactive elements accessible via Tab key
- Logical tab order following visual layout
- Skip links for main content
- Escape key to close modals and dropdowns
- Arrow keys for navigating lists and menus

### Screen Reader Support

```typescript
// Example: Accessible button
<button
  aria-label="View transaction details"
  aria-describedby="transaction-123"
>
  <EyeIcon aria-hidden="true" />
  <span className="sr-only">View Details</span>
</button>

// Example: Accessible form
<form aria-labelledby="topup-form-title">
  <h2 id="topup-form-title">Top Up Balance</h2>
  <label htmlFor="amount">Amount</label>
  <input
    id="amount"
    type="number"
    aria-required="true"
    aria-invalid={hasError}
    aria-describedby={hasError ? "amount-error" : undefined}
  />
  {hasError && (
    <span id="amount-error" role="alert">
      Please enter a valid amount
    </span>
  )}
</form>
```


### Color Contrast

Ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text):

```typescript
// Color palette with contrast ratios
const colors = {
  primary: {
    DEFAULT: '#4F46E5', // Indigo-600
    hover: '#4338CA',   // Indigo-700
    text: '#FFFFFF'     // White (contrast ratio: 8.59:1)
  },
  success: {
    DEFAULT: '#10B981', // Green-500
    text: '#FFFFFF'     // White (contrast ratio: 4.54:1)
  },
  warning: {
    DEFAULT: '#F59E0B', // Amber-500
    text: '#000000'     // Black (contrast ratio: 7.48:1)
  },
  error: {
    DEFAULT: '#EF4444', // Red-500
    text: '#FFFFFF'     // White (contrast ratio: 4.52:1)
  }
};
```

## Responsive Design Breakpoints

```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet portrait
  lg: '1024px',  // Tablet landscape / Small desktop
  xl: '1280px',  // Desktop
  '2xl': '1536px' // Large desktop
};
```

### Layout Adaptations

**Mobile (< 768px)**:
- Sidebar: Collapsible hamburger menu
- Summary cards: Single column, stacked
- Product grid: Single column
- Tables: Horizontal scroll or card view
- Forms: Full width inputs

**Tablet (768px - 1024px)**:
- Sidebar: Visible, narrower (200px)
- Summary cards: 2 columns
- Product grid: 2 columns
- Tables: Visible with adjusted column widths

**Desktop (> 1024px)**:
- Sidebar: Full width (240px)
- Summary cards: 3-4 columns
- Product grid: 4 columns
- Tables: Full layout with all columns


## API Integration

### API Client Configuration

```typescript
// Axios instance with interceptors
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### API Endpoints

```typescript
// Products
GET    /api/products?category=bm&type=verified
GET    /api/products/:id
POST   /api/products/:id/purchase

// Transactions
GET    /api/transactions?type=purchase&page=1&limit=10
GET    /api/transactions/:id
GET    /api/transactions/:id/accounts

// Top Up
POST   /api/topup
GET    /api/topup/methods

// Warranty Claims
GET    /api/warranty/claims
POST   /api/warranty/claims
GET    /api/warranty/claims/:id

// Verified BM Service
GET    /api/verified-bm/orders
POST   /api/verified-bm/orders

// User
GET    /api/user/profile
GET    /api/user/stats
PATCH  /api/user/profile

// API Keys
GET    /api/api-keys
POST   /api/api-keys/generate

// Tutorials
GET    /api/tutorials?category=getting-started
GET    /api/tutorials/:slug
```


## State Management

### Context Providers

```typescript
// Auth Context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// UI Context
interface UIContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  showToast: (toast: ToastProps) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

// Cart Context (for multi-product purchases)
interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}
```

### Custom Hooks

```typescript
// useProducts - Fetch and filter products
function useProducts(filters: ProductFilters) {
  return useQuery(['products', filters], () => 
    fetchProducts(filters)
  );
}

// useTransactions - Fetch transaction history
function useTransactions(page: number, type?: string) {
  return useQuery(['transactions', page, type], () =>
    fetchTransactions({ page, type })
  );
}

// usePurchase - Handle product purchase
function usePurchase() {
  const queryClient = useQueryClient();
  return useMutation(
    (data: PurchaseData) => purchaseProduct(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['transactions']);
        queryClient.invalidateQueries(['user']);
      }
    }
  );
}

// useTopUp - Handle balance top-up
function useTopUp() {
  const queryClient = useQueryClient();
  return useMutation(
    (data: TopUpData) => processTopUp(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user']);
        queryClient.invalidateQueries(['transactions']);
      }
    }
  );
}
```


## Security Considerations

### Authentication

- JWT tokens stored in httpOnly cookies (preferred) or localStorage
- Token refresh mechanism for long sessions
- Automatic logout on token expiration
- CSRF protection for state-changing operations

### Authorization

- Role-based access control (RBAC)
- Route guards to prevent unauthorized access
- API endpoint protection with middleware
- Sensitive data masking (e.g., partial account credentials)

### Data Validation

```typescript
// Zod schemas for form validation
const topUpSchema = z.object({
  amount: z.number()
    .min(10000, 'Minimum amount is Rp 10,000')
    .max(10000000, 'Maximum amount is Rp 10,000,000'),
  paymentMethod: z.string().min(1, 'Please select a payment method')
});

const verifiedBMSchema = z.object({
  quantity: z.number()
    .min(1, 'Minimum 1 account')
    .max(100, 'Maximum 100 accounts per order'),
  urls: z.string()
    .min(1, 'Please enter at least one URL')
    .refine(
      (val) => val.split('\n').every(url => isValidUrl(url)),
      'All URLs must be valid'
    )
});
```

### XSS Prevention

- Sanitize user-generated content
- Use React's built-in XSS protection
- Content Security Policy (CSP) headers
- Avoid dangerouslySetInnerHTML unless necessary


## Design System

### Typography

```typescript
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'monospace']
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem'  // 36px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
};
```

### Spacing Scale

```typescript
const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem'     // 80px
};
```

### Shadow System

```typescript
const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
};
```


### Animation and Transitions

```typescript
const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)'
};

// Common animations
const animations = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 }
  },
  slideInRight: {
    from: { transform: 'translateX(100%)' },
    to: { transform: 'translateX(0)' }
  },
  scaleIn: {
    from: { transform: 'scale(0.95)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 }
  }
};
```

## Icon System

### Icon Library: Lucide React

Selected icons for each section:

```typescript
import {
  Home,           // Dashboard
  History,        // Transaction History
  Wallet,         // Top Up
  Infinity,       // Business Manager
  User,           // Personal Account
  CheckCircle,    // Verified BM Service
  Shield,         // Warranty/Claim
  Code,           // API
  BookOpen,       // Tutorial
  Search,         // Search
  Filter,         // Filter
  ChevronDown,    // Dropdown
  ChevronRight,   // Navigation
  X,              // Close
  Check,          // Success
  AlertCircle,    // Warning/Error
  Info,           // Information
  Eye,            // View
  ShoppingCart,   // Purchase
  CreditCard,     // Payment
  Package,        // Product
  TrendingUp,     // Statistics
  Clock,          // Pending
  XCircle,        // Failed
  MessageCircle,  // WhatsApp
  ExternalLink,   // External link
  Download,       // Download
  Upload,         // Upload
  RefreshCw,      // Refresh
  Settings        // Settings
} from 'lucide-react';
```


## Page-Specific Designs

### Dashboard Page

**Layout**:
```
┌─────────────────────────────────────────────┐
│ Welcome Banner (gradient blue)              │
│ "Selamat Datang, [username]"               │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Marquee Ticker (announcements)              │
└─────────────────────────────────────────────┘
┌──────────┬──────────┬──────────┬──────────┐
│ Summary  │ Summary  │ Summary  │ Summary  │
│ Card 1   │ Card 2   │ Card 3   │ Card 4   │
└──────────┴──────────┴──────────┴──────────┘
┌────────────────────┬────────────────────────┐
│ Alert Box:         │ Support & Security:    │
│ - Perhatian!       │ - Bantuan Teknis       │
│ - Perubahan Bisnis │ - Kirim Laporan        │
│                    │ - Syarat & Ketentuan   │
│                    │ - Owner Contact        │
└────────────────────┴────────────────────────┘
┌─────────────────────────────────────────────┐
│ Update Terbaru (Latest Updates)             │
│ [Empty state or list of updates]            │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Transaksi Terbaru (Recent Transactions)     │
│ [Table with pagination]                     │
└─────────────────────────────────────────────┘
```

### Transaction History Page

**Layout**:
```
┌──────────┬──────────┬──────────┐
│ Summary  │ Summary  │ Summary  │
│ Card 1   │ Card 2   │ Card 3   │
└──────────┴──────────┴──────────┘
┌─────────────────────────────────┐
│ [Transaksi Akun] [Top Up]       │ ← Tabs
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Riwayat Transaksi Akun          │
│ [Dropdown: Semua Garansi]       │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Transaction Table               │
│ - ID | Date | Qty | Total |     │
│   Status | Warranty | Actions   │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Pagination: [1] 2 3 >           │
└─────────────────────────────────┘
```


### Top Up Page

**Layout**:
```
┌────────────────────┬────────────────────────┐
│ Pilih Nominal      │ Metode Pembayaran      │
│                    │                        │
│ ┌────┬────┬────┐   │ E-WALLET               │
│ │10K │20K │50K │   │ [QRIS]                 │
│ └────┴────┴────┘   │                        │
│ ┌────┬────┬────┐   │ VIRTUAL ACCOUNT        │
│ │100K│200K│500K│   │ [BRI] [BCA]            │
│ └────┴────┴────┘   │ [BNI] [Mandiri]        │
│                    │ [DANAMON] [Other]      │
│ Custom Amount:     │                        │
│ [Rp Minimal 10.000]│                        │
│                    │                        │
│ [Top Up Sekarang]  │                        │
└────────────────────┴────────────────────────┘
```

### BM Accounts Page

**Layout**:
```
┌──────────┬──────────┬──────────┐
│ Summary  │ Summary  │ Summary  │
│ Card 1   │ Card 2   │ Card 3   │
└──────────┴──────────┴──────────┘
┌─────────────────────────────────┐
│ [Semua] [Verified] [Limit 250$] │ ← Filter tabs
│ [BM50] [WhatsApp API] [140 Limit]│
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ [Search...] [Sort by ▼]         │
└─────────────────────────────────┘
┌────┬────┬────┬────┐
│Prod│Prod│Prod│Prod│ ← Product grid (4 cols)
│ 1  │ 2  │ 3  │ 4  │
├────┼────┼────┼────┤
│Prod│Prod│Prod│Prod│
│ 5  │ 6  │ 7  │ 8  │
└────┴────┴────┴────┘
```

### Verified BM Service Page

**Layout**:
```
┌──────────┬──────────┬──────────┬──────────┐
│ Status   │ Status   │ Status   │ Status   │
│ Card 1   │ Card 2   │ Card 3   │ Card 4   │
│ Menunggu │ Proses   │ Berhasil │ Gagal    │
└──────────┴──────────┴──────────┴──────────┘
┌─────────────────────────────────────────────┐
│ Order Jasa Verified BM                      │
│                                             │
│ Jumlah Akun: [____]                         │
│ (Minimal 1, maksimal 100)                   │
│                                             │
│ URL Akses Akun BM / Personal: [_________]   │
│ (Multi-line textarea)                       │
│                                             │
│ [Bayar Sekarang]                            │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Riwayat Order Jasa Verified BM              │
│ [Empty state or order table]                │
└─────────────────────────────────────────────┘
```


### Claim Warranty Page

**Layout**:
```
┌──────────┬──────────┬──────────┬──────────┐
│ Status   │ Status   │ Status   │ Success  │
│ Card 1   │ Card 2   │ Card 3   │ Rate     │
│ Diproses │ Disetujui│ Ditolak  │ 100%     │
└──────────┴──────────┴──────────┴──────────┘
┌─────────────────────────────────────────────┐
│ Ajukan Claim Garansi Baru                   │
│ [Empty state or claimable accounts list]    │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Riwayat Claim Garansi                       │
│ Table: ID | Date | Account | Reason |       │
│        Status | Warranty | Actions          │
└─────────────────────────────────────────────┘
```

### API Documentation Page

**Layout**:
```
┌─────────────────────────────────────────────┐
│ API Key Anda                                │
│ let sig_value = "[redacted]"                │
│                        [Generate API Key]   │
└─────────────────────────────────────────────┘
┌──────────┬──────────┬──────────┐
│ Hit Limit│ Up Time  │ Latency  │
│ 1000/day │ 99.9%    │ <100ms   │
└──────────┴──────────┴──────────┘
┌─────────────────────────────────┐
│ [Endpoints] [Usage] [Rate Limits]│ ← Tabs
└─────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Available Endpoints                         │
│                                             │
│ GET /api/products                           │
│ Description: Get all products               │
│ Parameters: [Table]                         │
│ Response Example: [Code block]              │
│                                             │
│ POST /api/purchase                          │
│ Description: Purchase product               │
│ Parameters: [Table]                         │
│ Response Example: [Code block]              │
└─────────────────────────────────────────────┘
```


### Tutorial Center Page

**Layout**:
```
┌─────────────────────────────────────────────┐
│ Documentation Center                        │
│ Panduan lengkap untuk menggunakan layanan   │
│ Canvango Group (X tutorials)                │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Cari Tutorial                               │
│ [Search input...]                           │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ [Semua] [Getting Started] [Account]         │ ← Category tabs
│ [Transaction] [API] [Troubleshoot]          │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Tutorial & Panduan                          │
│                                             │
│ ┌────┬────┬────┬────┐                       │
│ │Tut │Tut │Tut │Tut │ ← Tutorial cards     │
│ │ 1  │ 2  │ 3  │ 4  │                       │
│ └────┴────┴────┴────┘                       │
│                                             │
│ [Or empty state if no tutorials]            │
└─────────────────────────────────────────────┘
```

## Implementation Notes

### Priority Order

**Phase 1 - Core Infrastructure** (Week 1-2):
1. Layout components (Header, Sidebar, Footer)
2. Routing setup
3. Authentication integration
4. Base UI components (Button, Input, Card, Badge)

**Phase 2 - Dashboard & Transactions** (Week 3-4):
5. Dashboard page with summary cards
6. Transaction history page
7. Data table component
8. Empty states

**Phase 3 - Product Catalog** (Week 5-6):
9. BM Accounts page
10. Personal Accounts page
11. Product card component
12. Filter and search functionality

**Phase 4 - Services** (Week 7-8):
13. Top Up page
14. Verified BM Service page
15. Warranty Claim page
16. Form components and validation

**Phase 5 - Documentation** (Week 9-10):
17. API Documentation page
18. Tutorial Center page
19. Code syntax highlighting
20. Search functionality

**Phase 6 - Polish & Testing** (Week 11-12):
21. Responsive design refinements
22. Accessibility improvements
23. Performance optimization
24. E2E testing
25. Bug fixes and polish


### File Structure

```
src/
├── features/
│   └── member-area/
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Header.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   ├── MainContent.tsx
│       │   │   ├── Footer.tsx
│       │   │   └── WhatsAppButton.tsx
│       │   ├── dashboard/
│       │   │   ├── WelcomeBanner.tsx
│       │   │   ├── SummaryCard.tsx
│       │   │   ├── AlertBox.tsx
│       │   │   └── RecentTransactions.tsx
│       │   ├── products/
│       │   │   ├── ProductCard.tsx
│       │   │   ├── ProductGrid.tsx
│       │   │   ├── CategoryTabs.tsx
│       │   │   └── SearchSortBar.tsx
│       │   ├── transactions/
│       │   │   ├── TransactionTable.tsx
│       │   │   ├── TransactionFilters.tsx
│       │   │   └── TransactionDetail.tsx
│       │   ├── forms/
│       │   │   ├── TopUpForm.tsx
│       │   │   ├── VerifiedBMForm.tsx
│       │   │   └── WarrantyClaimForm.tsx
│       │   └── shared/
│       │       ├── DataTable.tsx
│       │       ├── EmptyState.tsx
│       │       ├── StatusBadge.tsx
│       │       └── Pagination.tsx
│       ├── pages/
│       │   ├── Dashboard.tsx
│       │   ├── TransactionHistory.tsx
│       │   ├── TopUp.tsx
│       │   ├── BMAccounts.tsx
│       │   ├── PersonalAccounts.tsx
│       │   ├── VerifiedBMService.tsx
│       │   ├── ClaimWarranty.tsx
│       │   ├── APIDocumentation.tsx
│       │   └── TutorialCenter.tsx
│       ├── hooks/
│       │   ├── useProducts.ts
│       │   ├── useTransactions.ts
│       │   ├── usePurchase.ts
│       │   ├── useTopUp.ts
│       │   └── useWarrantyClaim.ts
│       ├── contexts/
│       │   ├── AuthContext.tsx
│       │   ├── UIContext.tsx
│       │   └── CartContext.tsx
│       ├── services/
│       │   ├── api.ts
│       │   ├── products.ts
│       │   ├── transactions.ts
│       │   └── user.ts
│       ├── types/
│       │   ├── user.ts
│       │   ├── product.ts
│       │   ├── transaction.ts
│       │   └── api.ts
│       └── utils/
│           ├── formatters.ts
│           ├── validators.ts
│           └── constants.ts
└── shared/
    └── components/
        ├── Button.tsx
        ├── Input.tsx
        ├── Select.tsx
        ├── Badge.tsx
        ├── Card.tsx
        ├── Modal.tsx
        └── Toast.tsx
```

## Conclusion

This design document provides a comprehensive blueprint for implementing the Member Area Content Framework. The design emphasizes:

- **User-centric approach**: Intuitive navigation and clear information hierarchy
- **Consistency**: Unified design patterns and components across all pages
- **Performance**: Optimized loading and smooth interactions
- **Accessibility**: WCAG AA compliance and keyboard navigation support
- **Scalability**: Modular architecture supporting future enhancements
- **Security**: Robust authentication, authorization, and data validation

The implementation should follow the phased approach outlined, with continuous testing and refinement throughout the development process.

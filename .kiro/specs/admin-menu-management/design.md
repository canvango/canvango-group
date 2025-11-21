# Design Document - Admin Menu Management

## Overview

Admin Menu Management adalah sistem pengelolaan khusus untuk administrator dalam aplikasi Canvango Group. Sistem ini menyediakan 8 menu administrasi yang diletakkan di sidebar di bawah menu Tutorial, memungkinkan admin untuk mengelola seluruh aspek sistem.

### Goals
- Menyediakan interface yang user-friendly untuk admin mengelola sistem
- Memastikan keamanan dengan role-based authorization
- Mencatat semua aktivitas admin untuk audit trail
- Menyediakan dashboard dengan visualisasi data yang informatif
- Mengintegrasikan dengan Supabase untuk database operations

### Non-Goals
- Tidak membuat mobile app khusus untuk admin (responsive web sudah cukup)
- Tidak membuat real-time notifications (bisa ditambahkan di future)
- Tidak membuat advanced analytics/reporting (basic stats sudah cukup untuk MVP)

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Sidebar Component (with Admin Menu Section)           │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Admin Pages                                           │ │
│  │  - AdminDashboard                                      │ │
│  │  - UserManagement                                      │ │
│  │  - TransactionManagement                               │ │
│  │  - ClaimManagement                                     │ │
│  │  - TutorialManagement                                  │ │
│  │  - ProductManagement (NEW)                             │ │
│  │  - SystemSettings                                      │ │
│  │  - AuditLog                                            │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Protected Routes (Admin Only)                         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Express + TypeScript)             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Middleware                                            │ │
│  │  - auth.middleware (JWT validation)                    │ │
│  │  - role.middleware (Admin authorization)               │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Controllers                                           │ │
│  │  - admin.controller (dashboard stats)                  │ │
│  │  - user.controller (user management)                   │ │
│  │  - transaction.controller                              │ │
│  │  - claim.controller                                    │ │
│  │  - tutorial.controller                                 │ │
│  │  - product.controller (NEW)                            │ │
│  │  - settings.controller                                 │ │
│  │  - auditLog.controller                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Models (Supabase Client)                              │ │
│  │  - User.model                                          │ │
│  │  - Transaction.model                                   │ │
│  │  - Claim.model                                         │ │
│  │  - Tutorial.model                                      │ │
│  │  - Product.model (NEW)                                 │ │
│  │  - SystemSettings.model                                │ │
│  │  - AdminAuditLog.model                                 │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Supabase Client
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (PostgreSQL)                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Tables                                                │ │
│  │  - users                                               │ │
│  │  - transactions                                        │ │
│  │  - claims                                              │ │
│  │  - tutorials                                           │ │
│  │  - products (NEW)                                      │ │
│  │  - system_settings                                     │ │
│  │  - admin_audit_logs                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  RPC Functions                                         │ │
│  │  - update_user_balance                                 │ │
│  │  - increment_tutorial_views                            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Flow

1. **Admin Login** → AuthContext validates role → Sidebar shows Admin menu
2. **Admin clicks menu** → Protected route checks authorization → Page loads
3. **Admin performs action** → API call with JWT → Backend validates → Database operation → Audit log created
4. **Response** → Toast notification → UI updates

## Components and Interfaces

### 1. Frontend Components

#### Sidebar Component (Modified)
**File:** `canvango-app/frontend/src/components/layout/Sidebar.tsx`

**Changes:**
- Add new section "ADMIN" below Tutorial menu
- Show/hide based on user role
- Add 8 new menu items with icons

**Props:**
```typescript
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Menu Structure:**
```typescript
const adminMenuItems = [
  { name: 'Dashboard Admin', path: '/admin/dashboard', icon: ChartBarIcon },
  { name: 'Kelola Pengguna', path: '/admin/users', icon: UsersIcon },
  { name: 'Kelola Transaksi', path: '/admin/transactions', icon: CreditCardIcon },
  { name: 'Kelola Klaim', path: '/admin/claims', icon: ShieldCheckIcon },
  { name: 'Kelola Tutorial', path: '/admin/tutorials', icon: BookOpenIcon },
  { name: 'Kelola Produk', path: '/admin/products', icon: CubeIcon },
  { name: 'Pengaturan Sistem', path: '/admin/settings', icon: CogIcon },
  { name: 'Log Aktivitas', path: '/admin/audit-logs', icon: ClipboardListIcon },
];
```

#### Admin Dashboard Page
**File:** `canvango-app/frontend/src/pages/admin/AdminDashboard.tsx`

**Features:**
- Statistics cards (users, transactions, claims, tutorials, products)
- Charts for data visualization (using recharts or chart.js)
- Recent activities table
- Quick actions buttons

**State:**
```typescript
interface DashboardStats {
  users: {
    total: number;
    guests: number;
    members: number;
    admins: number;
  };
  transactions: {
    total: number;
    pending: number;
    completed: number;
    failed: number;
    refunded: number;
    totalAmount: number;
  };
  claims: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  tutorials: {
    total: number;
    totalViews: number;
  };
  products: {
    total: number;
    available: number;
    outOfStock: number;
  };
  recentActivities: AuditLog[];
}
```

#### User Management Page
**File:** `canvango-app/frontend/src/pages/admin/UserManagement.tsx`

**Features:**
- Table with user data
- Search and filter functionality
- Edit user modal
- Delete confirmation modal
- Pagination

**State:**
```typescript
interface UserManagementState {
  users: User[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  roleFilter: 'all' | 'guest' | 'member' | 'admin';
  currentPage: number;
  totalPages: number;
  selectedUser: User | null;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
}
```

#### Transaction Management Page
**File:** `canvango-app/frontend/src/pages/admin/TransactionManagement.tsx`

**Features:**
- Table with transaction data
- Search, filter, and date range
- Update status modal
- Refund confirmation modal
- Transaction detail view

**State:**
```typescript
interface TransactionManagementState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  statusFilter: 'all' | 'pending' | 'completed' | 'failed' | 'refunded';
  dateRange: { start: Date | null; end: Date | null };
  currentPage: number;
  totalPages: number;
  selectedTransaction: Transaction | null;
  isStatusModalOpen: boolean;
  isRefundModalOpen: boolean;
  isDetailModalOpen: boolean;
}
```

#### Claim Management Page
**File:** `canvango-app/frontend/src/pages/admin/ClaimManagement.tsx`

**Features:**
- Table with claim data
- Filter by status
- Review claim modal with approve/reject
- Refund processing

**State:**
```typescript
interface ClaimManagementState {
  claims: Claim[];
  loading: boolean;
  error: string | null;
  statusFilter: 'all' | 'pending' | 'approved' | 'rejected';
  currentPage: number;
  totalPages: number;
  selectedClaim: Claim | null;
  isReviewModalOpen: boolean;
  adminResponse: string;
}
```

#### Tutorial Management Page
**File:** `canvango-app/frontend/src/pages/admin/TutorialManagement.tsx`

**Features:**
- Table with tutorial data
- Create tutorial form
- Edit tutorial form
- Delete confirmation
- Search functionality

**State:**
```typescript
interface TutorialManagementState {
  tutorials: Tutorial[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  selectedTutorial: Tutorial | null;
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  formData: {
    title: string;
    content: string;
    category: string;
    tags: string[];
    is_published: boolean;
  };
}
```

#### Product Management Page (NEW)
**File:** `canvango-app/frontend/src/pages/admin/ProductManagement.tsx`

**Features:**
- Table with product data
- Create product form
- Edit product form
- Delete confirmation
- Search and filter functionality

**State:**
```typescript
interface ProductManagementState {
  products: Product[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  productTypeFilter: 'all' | 'bm_account' | 'personal_account' | 'verified_bm' | 'api';
  stockStatusFilter: 'all' | 'available' | 'out_of_stock';
  currentPage: number;
  totalPages: number;
  selectedProduct: Product | null;
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  formData: {
    product_name: string;
    product_type: string;
    category: string;
    description: string;
    price: number;
    stock_status: 'available' | 'out_of_stock';
    is_active: boolean;
  };
}
```

#### System Settings Page
**File:** `canvango-app/frontend/src/pages/admin/SystemSettings.tsx`

**Features:**
- Form with system settings
- Toggle switches for features
- Save button with confirmation

**State:**
```typescript
interface SystemSettingsState {
  settings: SystemSettings;
  loading: boolean;
  error: string | null;
  hasChanges: boolean;
}

interface SystemSettings {
  site_name: string;
  maintenance_mode: boolean;
  email_notifications: boolean;
  payment_methods: string[];
  updated_at: string;
}
```

#### Audit Log Page
**File:** `canvango-app/frontend/src/pages/admin/AuditLog.tsx`

**Features:**
- Table with audit log data
- Multiple filters (admin, action, entity, date)
- JSON viewer for changes
- Pagination
- Read-only (no edit/delete)

**State:**
```typescript
interface AuditLogState {
  logs: AuditLog[];
  loading: boolean;
  error: string | null;
  adminFilter: string;
  actionFilter: 'all' | 'create' | 'update' | 'delete';
  entityFilter: 'all' | 'user' | 'transaction' | 'claim' | 'tutorial' | 'product' | 'settings';
  dateRange: { start: Date | null; end: Date | null };
  currentPage: number;
  totalPages: number;
  selectedLog: AuditLog | null;
  isDetailModalOpen: boolean;
}
```

### 2. Backend API Endpoints

#### Admin Dashboard Endpoints
```typescript
GET /api/admin/dashboard/stats
- Returns: DashboardStats
- Auth: Required (Admin only)
- Description: Get all statistics for dashboard
```

#### User Management Endpoints
```typescript
GET /api/admin/users
- Query: page, limit, search, role
- Returns: { users: User[], total: number, pages: number }
- Auth: Required (Admin only)

PUT /api/admin/users/:id
- Body: { username?, email?, role?, balance? }
- Returns: { user: User }
- Auth: Required (Admin only)
- Audit: Log changes

DELETE /api/admin/users/:id
- Returns: { message: string }
- Auth: Required (Admin only)
- Audit: Log deletion
```

#### Transaction Management Endpoints
```typescript
GET /api/admin/transactions
- Query: page, limit, search, status, startDate, endDate
- Returns: { transactions: Transaction[], total: number, pages: number }
- Auth: Required (Admin only)

PUT /api/admin/transactions/:id/status
- Body: { status: string }
- Returns: { transaction: Transaction }
- Auth: Required (Admin only)
- Audit: Log status change

POST /api/admin/transactions/:id/refund
- Returns: { transaction: Transaction, user: User }
- Auth: Required (Admin only)
- Audit: Log refund
- Side effect: Update user balance
```

#### Claim Management Endpoints
```typescript
GET /api/admin/claims
- Query: page, limit, status
- Returns: { claims: Claim[], total: number, pages: number }
- Auth: Required (Admin only)

PUT /api/admin/claims/:id/approve
- Body: { admin_response: string }
- Returns: { claim: Claim }
- Auth: Required (Admin only)
- Audit: Log approval

PUT /api/admin/claims/:id/reject
- Body: { admin_response: string }
- Returns: { claim: Claim }
- Auth: Required (Admin only)
- Audit: Log rejection

POST /api/admin/claims/:id/refund
- Returns: { claim: Claim, user: User }
- Auth: Required (Admin only)
- Audit: Log refund
- Side effect: Update user balance
```

#### Tutorial Management Endpoints
```typescript
GET /api/admin/tutorials
- Query: page, limit, search
- Returns: { tutorials: Tutorial[], total: number, pages: number }
- Auth: Required (Admin only)

POST /api/admin/tutorials
- Body: { title, content, category, tags, is_published }
- Returns: { tutorial: Tutorial }
- Auth: Required (Admin only)
- Audit: Log creation

PUT /api/admin/tutorials/:id
- Body: { title?, content?, category?, tags?, is_published? }
- Returns: { tutorial: Tutorial }
- Auth: Required (Admin only)
- Audit: Log update

DELETE /api/admin/tutorials/:id
- Returns: { message: string }
- Auth: Required (Admin only)
- Audit: Log deletion
```

#### Product Management Endpoints (NEW)
```typescript
GET /api/admin/products
- Query: page, limit, search, productType, stockStatus
- Returns: { products: Product[], total: number, pages: number }
- Auth: Required (Admin only)

POST /api/admin/products
- Body: { product_name, product_type, category, description, price, stock_status, is_active }
- Returns: { product: Product }
- Auth: Required (Admin only)
- Audit: Log creation

PUT /api/admin/products/:id
- Body: { product_name?, product_type?, category?, description?, price?, stock_status?, is_active? }
- Returns: { product: Product }
- Auth: Required (Admin only)
- Audit: Log update

DELETE /api/admin/products/:id
- Returns: { message: string }
- Auth: Required (Admin only)
- Audit: Log deletion
```

#### System Settings Endpoints
```typescript
GET /api/admin/settings
- Returns: { settings: SystemSettings }
- Auth: Required (Admin only)

PUT /api/admin/settings
- Body: { site_name?, maintenance_mode?, email_notifications?, payment_methods? }
- Returns: { settings: SystemSettings }
- Auth: Required (Admin only)
- Audit: Log changes
```

#### Audit Log Endpoints
```typescript
GET /api/admin/audit-logs
- Query: page, limit, admin, action, entity, startDate, endDate
- Returns: { logs: AuditLog[], total: number, pages: number }
- Auth: Required (Admin only)

GET /api/admin/audit-logs/:id
- Returns: { log: AuditLog }
- Auth: Required (Admin only)
```

## Data Models

### Product Model (NEW)
```typescript
interface Product {
  id: string;
  product_name: string;
  product_type: 'bm_account' | 'personal_account' | 'verified_bm' | 'api';
  category: string;
  description: string;
  price: number;
  stock_status: 'available' | 'out_of_stock';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Database Schema for Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_name VARCHAR(255) NOT NULL,
  product_type VARCHAR(50) NOT NULL CHECK (product_type IN ('bm_account', 'personal_account', 'verified_bm', 'api')),
  category VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  stock_status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (stock_status IN ('available', 'out_of_stock')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_product_type ON products(product_type);
CREATE INDEX idx_products_stock_status ON products(stock_status);
CREATE INDEX idx_products_is_active ON products(is_active);
```

### Existing Models (Reference)

**User Model** - Already exists
**Transaction Model** - Already exists
**Claim Model** - Already exists
**Tutorial Model** - Already exists
**SystemSettings Model** - Already exists
**AdminAuditLog Model** - Already exists

## Error Handling

### Frontend Error Handling

1. **API Errors**
   - Display toast notification with error message
   - Log error to console for debugging
   - Show error state in UI

2. **Validation Errors**
   - Display inline validation messages
   - Prevent form submission
   - Highlight invalid fields

3. **Authorization Errors**
   - Redirect to unauthorized page
   - Clear invalid tokens
   - Show appropriate message

### Backend Error Handling

1. **Authentication Errors (401)**
   ```typescript
   {
     success: false,
     error: 'Unauthorized',
     message: 'Invalid or expired token'
   }
   ```

2. **Authorization Errors (403)**
   ```typescript
   {
     success: false,
     error: 'Forbidden',
     message: 'Admin access required'
   }
   ```

3. **Validation Errors (400)**
   ```typescript
   {
     success: false,
     error: 'Validation Error',
     message: 'Invalid input data',
     details: [
       { field: 'email', message: 'Invalid email format' }
     ]
   }
   ```

4. **Not Found Errors (404)**
   ```typescript
   {
     success: false,
     error: 'Not Found',
     message: 'Resource not found'
   }
   ```

5. **Server Errors (500)**
   ```typescript
   {
     success: false,
     error: 'Internal Server Error',
     message: 'An unexpected error occurred'
   }
   ```

## Testing Strategy

### Unit Tests

1. **Frontend Components**
   - Test component rendering
   - Test user interactions
   - Test state management
   - Test API calls (mocked)

2. **Backend Controllers**
   - Test request handling
   - Test validation logic
   - Test error handling
   - Test authorization checks

3. **Backend Models**
   - Test CRUD operations
   - Test data validation
   - Test database queries

### Integration Tests

1. **API Endpoints**
   - Test full request/response cycle
   - Test authentication/authorization
   - Test database operations
   - Test audit log creation

2. **Frontend-Backend Integration**
   - Test API calls from components
   - Test data flow
   - Test error handling

### E2E Tests (Optional)

1. **Admin Workflows**
   - Login as admin
   - Navigate to admin pages
   - Perform CRUD operations
   - Verify audit logs

## Security Considerations

### Authentication & Authorization

1. **JWT Validation**
   - Validate token on every request
   - Check token expiration
   - Verify token signature

2. **Role-Based Access Control**
   - Check user role before showing admin menu
   - Validate admin role on backend for every admin endpoint
   - Return 403 for unauthorized access

3. **Audit Logging**
   - Log all admin actions
   - Include user ID, action, entity, changes, IP address
   - Make audit logs immutable (no edit/delete)

### Data Protection

1. **Input Validation**
   - Validate all user inputs
   - Sanitize data before database operations
   - Use parameterized queries (Supabase handles this)

2. **Password Security**
   - Use Supabase Auth for password management
   - Never expose passwords in API responses
   - Use bcrypt for any legacy password hashing

3. **Sensitive Data**
   - Don't log sensitive data (passwords, tokens)
   - Mask sensitive data in audit logs if needed
   - Use HTTPS for all communications

### Rate Limiting

1. **API Rate Limiting**
   - Limit requests per IP address
   - Implement exponential backoff
   - Return 429 for rate limit exceeded

## Performance Considerations

### Frontend Optimization

1. **Code Splitting**
   - Lazy load admin pages
   - Split vendor bundles
   - Use React.lazy and Suspense

2. **Data Fetching**
   - Implement pagination for large datasets
   - Use debounce for search inputs
   - Cache API responses when appropriate

3. **UI Performance**
   - Virtualize long lists
   - Optimize re-renders with React.memo
   - Use loading skeletons

### Backend Optimization

1. **Database Queries**
   - Use indexes for frequently queried columns
   - Limit result sets with pagination
   - Use database functions for complex operations

2. **Caching**
   - Cache dashboard statistics (short TTL)
   - Cache system settings
   - Use Redis for session management (optional)

3. **API Response**
   - Compress responses with gzip
   - Return only necessary fields
   - Use efficient data formats

## Deployment Considerations

### Environment Variables

**Frontend:**
```env
VITE_API_URL=https://api.canvango.com
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
```

**Backend:**
```env
PORT=5000
NODE_ENV=production
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx
CORS_ORIGIN=https://canvango.com
```

### Database Migration

1. Create products table
2. Add indexes
3. Seed initial products (optional)
4. Test all queries

### Rollout Plan

1. **Phase 1: Backend**
   - Deploy product model and endpoints
   - Test all admin endpoints
   - Verify audit logging

2. **Phase 2: Frontend**
   - Deploy sidebar changes
   - Deploy admin pages
   - Test all admin workflows

3. **Phase 3: Testing**
   - QA testing
   - Security audit
   - Performance testing

4. **Phase 4: Production**
   - Deploy to production
   - Monitor logs
   - Gather feedback

## Future Enhancements

1. **Real-time Notifications**
   - Use Supabase Realtime for live updates
   - Notify admin of new transactions, claims

2. **Advanced Analytics**
   - Revenue charts
   - User growth charts
   - Product performance metrics

3. **Bulk Operations**
   - Bulk user updates
   - Bulk transaction status changes
   - CSV import/export

4. **Email Notifications**
   - Email admin on critical events
   - Email users on status changes
   - Scheduled reports

5. **Mobile App**
   - React Native app for admin
   - Push notifications
   - Offline support

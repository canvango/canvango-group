# Design Document - Canvango Group Web Application

## Overview

Aplikasi web Canvango Group adalah platform layanan digital marketing dan verifikasi akun bisnis yang dibangun dengan arsitektur modern berbasis komponen. Aplikasi ini menggunakan pendekatan role-based access control (RBAC) untuk membedakan akses antara Guest, Member, dan Admin.

### Technology Stack Recommendations

- **Frontend Framework**: React.js dengan TypeScript
- **Routing**: React Router v6
- **State Management**: Context API + React Query untuk data fetching
- **UI Framework**: Tailwind CSS atau Material-UI
- **Authentication**: JWT (JSON Web Token)
- **Backend**: Node.js dengan Express.js atau Next.js API Routes
- **Database**: PostgreSQL atau MongoDB
- **Session Management**: HTTP-only cookies untuk keamanan

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │           React Application (SPA)                  │  │
│  │  ┌─────────────┐  ┌──────────────┐               │  │
│  │  │   Router    │  │ Auth Context │               │  │
│  │  └─────────────┘  └──────────────┘               │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │         Protected Routes & Guards           │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │              Page Components                │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS/REST API
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend Server                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │              API Layer (Express)                   │  │
│  │  ┌──────────────┐  ┌──────────────┐              │  │
│  │  │ Auth Routes  │  │  API Routes  │              │  │
│  │  └──────────────┘  └──────────────┘              │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │           Middleware Layer                         │  │
│  │  ┌──────────────┐  ┌──────────────┐              │  │
│  │  │ Auth Guard   │  │ Role Guard   │              │  │
│  │  └──────────────┘  └──────────────┘              │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │           Business Logic Layer                     │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │  │
│  │  │  User    │ │Transaction│ │ Tutorial │          │  │
│  │  │ Service  │ │  Service  │ │ Service  │          │  │
│  │  └──────────┘ └──────────┘ └──────────┘          │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │            Data Access Layer                       │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │  │
│  │  │   User   │ │Transaction│ │ Tutorial │          │  │
│  │  │   Model  │ │   Model   │ │  Model   │          │  │
│  │  └──────────┘ └──────────┘ └──────────┘          │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │  Database   │
                   │ PostgreSQL  │
                   └─────────────┘
```

### Authentication Flow

```
┌──────┐                ┌──────────┐              ┌──────────┐
│ User │                │  Client  │              │  Server  │
└──┬───┘                └────┬─────┘              └────┬─────┘
   │                         │                         │
   │ 1. Enter credentials    │                         │
   ├────────────────────────>│                         │
   │                         │ 2. POST /api/auth/login │
   │                         ├────────────────────────>│
   │                         │                         │
   │                         │    3. Validate creds    │
   │                         │                         │
   │                         │ 4. Return JWT + User    │
   │                         │<────────────────────────┤
   │                         │                         │
   │ 5. Store token & user   │                         │
   │                         │                         │
   │ 6. Redirect to dashboard│                         │
   │<────────────────────────┤                         │
   │                         │                         │
```

## Components and Interfaces

### Frontend Component Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx              # Header dengan login/user info
│   │   ├── Sidebar.tsx             # Sidebar navigation
│   │   ├── Layout.tsx              # Main layout wrapper
│   │   └── Footer.tsx              # Footer component
│   ├── auth/
│   │   ├── LoginForm.tsx           # Form login
│   │   ├── RegisterForm.tsx        # Form registrasi
│   │   └── ProtectedRoute.tsx      # Route guard component
│   ├── dashboard/
│   │   ├── WelcomeBanner.tsx       # Welcome message
│   │   ├── AlertSection.tsx        # Perhatian section
│   │   ├── SupportSection.tsx      # Customer support info
│   │   └── UpdateSection.tsx       # Update terbaru
│   ├── transaction/
│   │   ├── TransactionTable.tsx    # Tabel riwayat transaksi
│   │   └── TransactionRow.tsx      # Row item transaksi
│   ├── topup/
│   │   └── TopUpForm.tsx           # Form top up
│   ├── claim/
│   │   └── ClaimForm.tsx           # Form claim garansi
│   └── tutorial/
│       ├── TutorialList.tsx        # List tutorial
│       └── TutorialDetail.tsx      # Detail tutorial
├── pages/
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── TransactionHistory.tsx
│   ├── TopUp.tsx
│   ├── ClaimGaransi.tsx
│   ├── AkunBM.tsx
│   ├── AkunPersonal.tsx
│   ├── JasaVerifiedBM.tsx
│   ├── API.tsx
│   ├── Tutorial.tsx
│   └── admin/
│       ├── AdminDashboard.tsx
│       ├── UserManagement.tsx
│       ├── TransactionManagement.tsx
│       ├── ClaimManagement.tsx
│       ├── TutorialManagement.tsx
│       └── SystemSettings.tsx
├── contexts/
│   └── AuthContext.tsx             # Authentication context
├── hooks/
│   ├── useAuth.ts                  # Custom hook untuk auth
│   └── useProtectedRoute.ts        # Custom hook untuk route protection
├── services/
│   ├── authService.ts              # API calls untuk auth
│   ├── transactionService.ts       # API calls untuk transaksi
│   ├── topupService.ts             # API calls untuk top up
│   └── tutorialService.ts          # API calls untuk tutorial
├── types/
│   ├── user.types.ts               # Type definitions untuk user
│   ├── transaction.types.ts        # Type definitions untuk transaksi
│   └── api.types.ts                # Type definitions untuk API responses
└── utils/
    ├── api.ts                      # Axios instance dengan interceptors
    └── constants.ts                # Constants dan enums
```

### Key Component Interfaces

#### AuthContext Interface

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}
```

#### Sidebar Component Props

```typescript
interface SidebarProps {
  userRole: 'guest' | 'member' | 'admin';
}

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
  allowedRoles: ('guest' | 'member' | 'admin')[];
  section: 'main' | 'account' | 'other' | 'admin';
}
```

#### ProtectedRoute Component

```typescript
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'member' | 'admin';
  allowedRoles?: ('member' | 'admin')[];
  redirectTo?: string;
}
```

### Backend API Structure

```
src/
├── routes/
│   ├── auth.routes.ts              # POST /api/auth/login, /register, /logout
│   ├── user.routes.ts              # GET /api/users/me
│   ├── transaction.routes.ts       # GET /api/transactions
│   ├── topup.routes.ts             # POST /api/topup
│   ├── claim.routes.ts             # POST /api/claims
│   └── tutorial.routes.ts          # GET /api/tutorials
├── controllers/
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   ├── transaction.controller.ts
│   ├── topup.controller.ts
│   ├── claim.controller.ts
│   └── tutorial.controller.ts
├── services/
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── transaction.service.ts
│   ├── topup.service.ts
│   ├── claim.service.ts
│   └── tutorial.service.ts
├── models/
│   ├── User.model.ts
│   ├── Transaction.model.ts
│   ├── Claim.model.ts
│   └── Tutorial.model.ts
├── middleware/
│   ├── auth.middleware.ts          # Verify JWT token
│   ├── role.middleware.ts          # Check user role
│   └── validation.middleware.ts    # Request validation
└── utils/
    ├── jwt.util.ts                 # JWT generation & verification
    ├── password.util.ts            # Password hashing
    └── response.util.ts            # Standardized API responses
```

### API Endpoints

#### Authentication Endpoints

```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login user
POST   /api/auth/logout            # Logout user
GET    /api/auth/me                # Get current user info
```

#### User Endpoints

```
GET    /api/users/me               # Get current user profile
PUT    /api/users/me               # Update user profile
```

#### Transaction Endpoints

```
GET    /api/transactions           # Get user transactions (Member only)
GET    /api/transactions/:id       # Get transaction detail (Member only)
```

#### Top Up Endpoints

```
POST   /api/topup                  # Create top up request (Member only)
GET    /api/topup/methods          # Get available payment methods
```

#### Claim Endpoints

```
POST   /api/claims                 # Submit claim request (Member only)
GET    /api/claims                 # Get user claims (Member only)
GET    /api/claims/:id             # Get claim detail (Member only)
```

#### Tutorial Endpoints

```
GET    /api/tutorials              # Get all tutorials (Member only)
GET    /api/tutorials/:id          # Get tutorial detail (Member only)
GET    /api/tutorials/search       # Search tutorials (Member only)
```

#### Admin Endpoints

```
# User Management
GET    /api/admin/users            # Get all users (Admin only)
GET    /api/admin/users/:id        # Get user detail (Admin only)
PUT    /api/admin/users/:id        # Update user (Admin only)
DELETE /api/admin/users/:id        # Delete user (Admin only)
PUT    /api/admin/users/:id/balance # Update user balance (Admin only)
PUT    /api/admin/users/:id/role   # Update user role (Admin only)

# Transaction Management
GET    /api/admin/transactions     # Get all transactions (Admin only)
PUT    /api/admin/transactions/:id # Update transaction status (Admin only)
DELETE /api/admin/transactions/:id # Delete transaction (Admin only)

# Claim Management
GET    /api/admin/claims           # Get all claims (Admin only)
PUT    /api/admin/claims/:id       # Update claim status (Admin only)
POST   /api/admin/claims/:id/resolve # Resolve claim (Admin only)

# Tutorial Management
POST   /api/admin/tutorials        # Create tutorial (Admin only)
PUT    /api/admin/tutorials/:id    # Update tutorial (Admin only)
DELETE /api/admin/tutorials/:id    # Delete tutorial (Admin only)

# System Statistics
GET    /api/admin/stats/overview   # Get system overview stats (Admin only)
GET    /api/admin/stats/users      # Get user statistics (Admin only)
GET    /api/admin/stats/transactions # Get transaction statistics (Admin only)
GET    /api/admin/stats/revenue    # Get revenue statistics (Admin only)
```

## Admin Features

### Admin Dashboard

Admin dashboard menyediakan overview lengkap sistem dengan fitur-fitur berikut:

1. **System Statistics**
   - Total users (Guest, Member, Admin)
   - Total transactions (by status)
   - Total revenue
   - Pending claims count
   - Active sessions

2. **User Management**
   - View all users dengan filtering dan search
   - Edit user details (name, email, role)
   - Update user balance
   - Change user role (Member ↔ Admin)
   - Suspend/activate user accounts
   - View user transaction history

3. **Transaction Management**
   - View all transactions dengan filtering
   - Update transaction status
   - Refund transactions
   - Export transaction reports
   - View transaction analytics

4. **Claim Management**
   - View all claims dengan status filtering
   - Review claim details
   - Approve/reject claims
   - Add response notes
   - Process refunds for approved claims

5. **Tutorial Management**
   - Create new tutorials
   - Edit existing tutorials
   - Delete tutorials
   - Manage tutorial categories
   - View tutorial analytics (views, engagement)

6. **System Settings**
   - Configure payment methods
   - Set system-wide notifications
   - Manage email templates
   - Configure security settings
   - View system logs

### Admin Access Control

```typescript
interface AdminPermission {
  resource: 'users' | 'transactions' | 'claims' | 'tutorials' | 'settings';
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

interface AdminRole {
  id: string;
  name: string;
  permissions: AdminPermission[];
}
```

### Admin Audit Log Model

```typescript
interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}
```

## Data Models

### User Model

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  password: string; // hashed
  fullName: string;
  role: 'guest' | 'member' | 'admin';
  balance: number;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}
```

### Transaction Model

```typescript
interface Transaction {
  id: string;
  userId: string;
  productName: string;
  productType: 'RMSO_NEW' | 'PERSONAL_TUA' | 'RM_NEW' | 'RM_TUA' | 'J202_VERIFIED_BM';
  quantity: number;
  totalAmount: number;
  status: 'BERHASIL' | 'PENDING' | 'GAGAL';
  createdAt: Date;
  updatedAt: Date;
}
```

### TopUp Model

```typescript
interface TopUp {
  id: string;
  userId: string;
  amount: number;
  paymentMethod: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  transactionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Claim Model

```typescript
interface Claim {
  id: string;
  userId: string;
  transactionId: string;
  reason: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  responseNote: string | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
}
```

### Tutorial Model

```typescript
interface Tutorial {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Handling

### Frontend Error Handling

1. **API Error Interceptor**: Axios interceptor untuk menangkap error responses
2. **Error Boundary**: React Error Boundary untuk menangkap runtime errors
3. **Toast Notifications**: Notifikasi user-friendly untuk errors
4. **Validation Errors**: Form validation dengan error messages yang jelas

### Backend Error Handling

```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}
```

### Error Codes

```
AUTH_001: Invalid credentials
AUTH_002: Token expired
AUTH_003: Unauthorized access
AUTH_004: User already exists
TRANS_001: Transaction not found
TRANS_002: Insufficient balance
CLAIM_001: Claim already submitted
CLAIM_002: Transaction not eligible for claim
TOPUP_001: Invalid payment method
TOPUP_002: Minimum amount not met
```

## Security Considerations

### Authentication Security

1. **Password Hashing**: Menggunakan bcrypt dengan salt rounds minimal 10
2. **JWT Security**: 
   - Access token dengan expiry 15 menit
   - Refresh token dengan expiry 7 hari
   - HTTP-only cookies untuk menyimpan tokens
3. **CSRF Protection**: CSRF tokens untuk form submissions
4. **Rate Limiting**: Limit login attempts (5 attempts per 15 menit)

### Authorization Security

1. **Role-Based Access Control**: Middleware untuk verify user role (Guest, Member, Admin)
2. **Route Protection**: Protected routes di frontend dan backend
3. **Data Isolation**: User hanya bisa akses data mereka sendiri (kecuali Admin)
4. **Admin Privileges**: Admin memiliki akses penuh untuk management
5. **Action Logging**: Log semua admin actions untuk audit trail

### General Security

1. **HTTPS Only**: Enforce HTTPS di production
2. **Input Validation**: Validate semua input di backend
3. **SQL Injection Prevention**: Menggunakan parameterized queries atau ORM
4. **XSS Prevention**: Sanitize user input dan output
5. **CORS Configuration**: Whitelist allowed origins

## Testing Strategy

### Unit Testing

1. **Frontend Components**: Jest + React Testing Library
   - Test rendering components
   - Test user interactions
   - Test conditional rendering based on user role
   
2. **Backend Services**: Jest + Supertest
   - Test business logic
   - Test API endpoints
   - Test middleware functions

### Integration Testing

1. **API Integration**: Test end-to-end API flows
2. **Database Integration**: Test database operations
3. **Authentication Flow**: Test complete auth flow

### E2E Testing

1. **User Flows**: Cypress atau Playwright
   - Guest browsing flow
   - Login flow
   - Member transaction flow
   - Top up flow
   - Claim submission flow

### Test Coverage Goals

- Unit tests: 80% coverage
- Integration tests: Critical paths covered
- E2E tests: Main user journeys covered

## Performance Considerations

### Frontend Optimization

1. **Code Splitting**: Lazy loading untuk routes
2. **Memoization**: React.memo untuk expensive components
3. **Virtual Scrolling**: Untuk list panjang (transaction history)
4. **Image Optimization**: Lazy loading dan responsive images
5. **Bundle Size**: Keep bundle size < 200KB (gzipped)

### Backend Optimization

1. **Database Indexing**: Index pada foreign keys dan frequently queried fields
2. **Query Optimization**: Avoid N+1 queries
3. **Caching**: Redis untuk session dan frequently accessed data
4. **Pagination**: Implement pagination untuk list endpoints
5. **Connection Pooling**: Database connection pooling

### API Response Time Goals

- Authentication: < 200ms
- Data fetching: < 500ms
- Transaction creation: < 1s
- File uploads: < 3s

## Deployment Strategy

### Environment Configuration

```
Development:
- Local database
- Debug mode enabled
- Hot reload enabled

Staging:
- Staging database
- Production-like configuration
- Testing environment

Production:
- Production database
- Optimized builds
- Monitoring enabled
- Auto-scaling enabled
```

### CI/CD Pipeline

1. **Build**: Compile TypeScript, bundle assets
2. **Test**: Run unit and integration tests
3. **Lint**: ESLint and Prettier checks
4. **Deploy**: Deploy to staging/production
5. **Monitor**: Health checks and error tracking

## Monitoring and Logging

### Application Monitoring

1. **Error Tracking**: Sentry atau similar service
2. **Performance Monitoring**: New Relic atau similar
3. **Uptime Monitoring**: Pingdom atau similar

### Logging Strategy

1. **Application Logs**: Winston atau Pino
2. **Access Logs**: Morgan for HTTP requests
3. **Error Logs**: Separate error log file
4. **Log Levels**: DEBUG, INFO, WARN, ERROR
5. **Log Rotation**: Daily rotation with 30-day retention

## Future Enhancements

1. **Multi-language Support**: i18n implementation
2. **Email Notifications**: Transactional emails
3. **Push Notifications**: Real-time notifications
4. **Advanced Analytics**: User behavior tracking
5. **Mobile App**: React Native mobile application
6. **Admin Dashboard**: Separate admin interface
7. **Payment Gateway Integration**: Multiple payment options
8. **Two-Factor Authentication**: Enhanced security

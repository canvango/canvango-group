# Canvango Group API Documentation

## Base URL

```
Development: http://localhost:5000/api
Production: https://api.canvango.com/api
```

## Architecture Overview

The Canvango Group application uses a hybrid architecture:

- **Frontend:** React application with Supabase client for authentication
- **Backend:** Express.js API with Supabase client for database operations
- **Database:** PostgreSQL hosted on Supabase
- **Authentication:** Supabase Auth (JWT tokens)

### Authentication Flow

```
┌─────────┐                    ┌──────────┐                    ┌─────────┐
│ Frontend│                    │ Supabase │                    │ Backend │
└────┬────┘                    └────┬─────┘                    └────┬────┘
     │                              │                               │
     │ 1. Register/Login            │                               │
     ├─────────────────────────────>│                               │
     │                              │                               │
     │ 2. JWT Token                 │                               │
     │<─────────────────────────────┤                               │
     │                              │                               │
     │ 3. API Request + JWT         │                               │
     ├───────────────────────────────────────────────────────────>│
     │                              │                               │
     │                              │ 4. Validate JWT               │
     │                              │<──────────────────────────────┤
     │                              │                               │
     │                              │ 5. User Info                  │
     │                              ├──────────────────────────────>│
     │                              │                               │
     │                              │                          6. Process
     │                              │                          Request
     │                              │                               │
     │ 7. Response                  │                               │
     │<───────────────────────────────────────────────────────────┤
     │                              │                               │
```

### Key Points

- **No backend auth endpoints:** Registration and login are handled by Supabase Auth on the frontend
- **JWT validation:** Backend validates Supabase JWT tokens on each request
- **Database operations:** Backend uses Supabase client for all database queries
- **Service role key:** Backend uses service_role key for admin operations (bypasses RLS)

## Authentication

Most endpoints require authentication using Supabase JWT tokens. The application uses Supabase Auth for user authentication.

### Authentication Flow

1. **Frontend:** User registers/logs in via Supabase Auth
2. **Frontend:** Receives JWT token from Supabase
3. **Frontend:** Includes token in API requests
4. **Backend:** Validates token with Supabase and extracts user info

### Authorization Header Format

Include the Supabase JWT token in the Authorization header:

```
Authorization: Bearer <supabase_jwt_token>
```

**Example:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNjQyNTg...
```

### Token Lifecycle

- **Issued by:** Supabase Auth
- **Expiration:** Configurable in Supabase (default: 1 hour)
- **Refresh:** Handled automatically by Supabase client
- **Validation:** Backend validates with Supabase on each request

## Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

## Error Codes

### Authentication Errors

| Code | Description | HTTP Status |
|------|-------------|-------------|
| AUTH_001 | Invalid credentials | 401 |
| AUTH_002 | Invalid or expired token | 401 |
| AUTH_003 | No token provided | 401 |
| AUTH_004 | User already exists | 409 |
| AUTH_005 | Insufficient permissions | 403 |

### Supabase-Specific Errors

| Code | Description | HTTP Status |
|------|-------------|-------------|
| SUPABASE_001 | Supabase connection error | 500 |
| SUPABASE_002 | Invalid Supabase token | 401 |
| SUPABASE_003 | User not found in Supabase | 404 |
| SUPABASE_004 | Supabase rate limit exceeded | 429 |

### Business Logic Errors

| Code | Description | HTTP Status |
|------|-------------|-------------|
| TRANS_001 | Transaction not found | 404 |
| TRANS_002 | Insufficient balance | 400 |
| CLAIM_001 | Claim already submitted | 409 |
| CLAIM_002 | Transaction not eligible for claim | 400 |
| TOPUP_001 | Invalid payment method | 400 |
| TOPUP_002 | Minimum amount not met | 400 |
| USER_001 | User not found | 404 |
| USER_002 | Invalid user data | 400 |

### System Errors

| Code | Description | HTTP Status |
|------|-------------|-------------|
| INTERNAL_ERROR | Internal server error | 500 |
| VALIDATION_ERROR | Request validation failed | 400 |
| RATE_LIMIT_EXCEEDED | Too many requests | 429 |

---

## Authentication Endpoints

### Important: Supabase Auth Integration

**Authentication is handled by Supabase Auth on the frontend.** The backend does not have register/login endpoints. Instead:

1. **Frontend** uses Supabase client to register/login users
2. **Frontend** receives JWT token from Supabase
3. **Frontend** includes token in API requests to backend
4. **Backend** validates token with Supabase

### Register User (Frontend Only)

User registration is handled by Supabase Auth via the frontend.

**Implementation:** `supabase.auth.signUp()`

**Frontend Code Example:**
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'john@example.com',
  password: 'SecurePass123!',
  options: {
    data: {
      username: 'johndoe',
      full_name: 'John Doe'
    }
  }
});
```

**Process:**
1. User fills registration form
2. Frontend calls Supabase Auth API
3. Supabase creates auth user and sends confirmation email
4. User confirms email (if email confirmation enabled)
5. Backend creates user record in database on first API call

**Validation Rules:**
- Email: Valid email format
- Password: Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number
- Username: 3-20 characters, alphanumeric
- Full Name: 2-50 characters

---

### Login (Frontend Only)

User login is handled by Supabase Auth via the frontend.

**Implementation:** `supabase.auth.signInWithPassword()`

**Frontend Code Example:**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'john@example.com',
  password: 'SecurePass123!'
});

// Token is available in data.session.access_token
const token = data.session?.access_token;
```

**Process:**
1. User enters email and password
2. Frontend calls Supabase Auth API
3. Supabase validates credentials and returns JWT token
4. Frontend stores token and uses it for API requests

**Rate Limiting:** Handled by Supabase (default: 5 attempts per hour per IP)

---

### Forgot Password (Frontend Only)

Request password reset email via Supabase Auth.

**Implementation:** `supabase.auth.resetPasswordForEmail()`

**Frontend Code Example:**
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(
  'john@example.com',
  {
    redirectTo: 'http://localhost:5173/reset-password'
  }
);
```

**Process:**
1. User enters email on `/forgot-password` page
2. Frontend calls Supabase Auth API
3. Supabase sends email with reset link
4. Link redirects to `/reset-password` with token in URL

**Email Configuration:** Configure email templates in Supabase Dashboard > Authentication > Email Templates

---

### Reset Password (Frontend Only)

Update password using reset token from email.

**Implementation:** `supabase.auth.updateUser()`

**Frontend Code Example:**
```typescript
const { error } = await supabase.auth.updateUser({
  password: 'NewSecurePass123!'
});
```

**Process:**
1. User clicks reset link from email
2. Supabase validates token and creates temporary session
3. User enters new password on `/reset-password` page
4. Frontend calls Supabase Auth API to update password
5. User redirected to login page

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

---

### Logout (Frontend Only)

Invalidate current Supabase session.

**Implementation:** `supabase.auth.signOut()`

**Frontend Code Example:**
```typescript
const { error } = await supabase.auth.signOut();
```

**Process:**
1. User clicks logout button
2. Frontend calls Supabase Auth API
3. Supabase invalidates session
4. Frontend clears local storage and redirects to login

**Note:** No backend endpoint needed for logout. Session is managed by Supabase.

---

## User Endpoints

### Get Current User Profile

Retrieve authenticated user's profile information.

**Endpoint:** `GET /users/me`

**Access:** Member, Admin

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "member",
    "balance": 50000,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLoginAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Update User Profile

Update authenticated user's profile information.

**Endpoint:** `PUT /users/me`

**Access:** Member, Admin

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "John Updated Doe",
  "email": "newemail@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "johndoe",
    "email": "newemail@example.com",
    "fullName": "John Updated Doe",
    "role": "member",
    "balance": 50000
  },
  "message": "Profile updated successfully"
}
```

---

## Transaction Endpoints

### Get User Transactions

Retrieve transaction history for authenticated user.

**Endpoint:** `GET /transactions`

**Access:** Member, Admin

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status (BERHASIL, PENDING, GAGAL)

**Example Request:**
```
GET /transactions?page=1&limit=10&status=BERHASIL
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "userId": "uuid",
        "productName": "Akun BM RMSO New",
        "productType": "RMSO_NEW",
        "quantity": 5,
        "totalAmount": 250000,
        "status": "BERHASIL",
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

---

### Get Transaction Detail

Retrieve detailed information for a specific transaction.

**Endpoint:** `GET /transactions/:id`

**Access:** Member, Admin

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "productName": "Akun BM RMSO New",
    "productType": "RMSO_NEW",
    "quantity": 5,
    "totalAmount": 250000,
    "status": "BERHASIL",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:05:00.000Z"
  }
}
```

---

## Top Up Endpoints

### Get Payment Methods

Retrieve available payment methods for top up.

**Endpoint:** `GET /topup/methods`

**Access:** Member, Admin

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "methods": [
      {
        "id": "bank_transfer",
        "name": "Bank Transfer",
        "description": "Transfer via BCA, Mandiri, BNI",
        "minAmount": 10000,
        "maxAmount": 10000000,
        "fee": 0
      },
      {
        "id": "e_wallet",
        "name": "E-Wallet",
        "description": "OVO, GoPay, Dana",
        "minAmount": 10000,
        "maxAmount": 5000000,
        "fee": 1000
      }
    ]
  }
}
```

---

### Create Top Up Request

Submit a top up request to add balance.

**Endpoint:** `POST /topup`

**Access:** Member, Admin

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 100000,
  "paymentMethod": "bank_transfer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "amount": 100000,
    "paymentMethod": "bank_transfer",
    "status": "PENDING",
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  "message": "Top up request created successfully"
}
```

---

## Claim Endpoints

### Get User Claims

Retrieve claim history for authenticated user.

**Endpoint:** `GET /claims`

**Access:** Member, Admin

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (PENDING, APPROVED, REJECTED)

**Response:**
```json
{
  "success": true,
  "data": {
    "claims": [
      {
        "id": "uuid",
        "userId": "uuid",
        "transactionId": "uuid",
        "reason": "Product not working",
        "description": "The account credentials are invalid",
        "status": "PENDING",
        "responseNote": null,
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 15,
      "itemsPerPage": 10
    }
  }
}
```

---

### Submit Claim Request

Submit a warranty claim for a transaction.

**Endpoint:** `POST /claims`

**Access:** Member, Admin

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "transactionId": "uuid",
  "reason": "Product not working",
  "description": "The account credentials provided are invalid and cannot be used"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "transactionId": "uuid",
    "reason": "Product not working",
    "description": "The account credentials provided are invalid and cannot be used",
    "status": "PENDING",
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  "message": "Claim submitted successfully"
}
```

**Validation:**
- Transaction must belong to the user
- Transaction must be eligible for claim (status: BERHASIL)
- Cannot submit duplicate claim for same transaction

---

## Tutorial Endpoints

### Get All Tutorials

Retrieve list of available tutorials.

**Endpoint:** `GET /tutorials`

**Access:** Member, Admin

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `search` (optional): Search by title or description
- `category` (optional): Filter by category
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example Request:**
```
GET /tutorials?search=facebook&category=social_media&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tutorials": [
      {
        "id": "uuid",
        "title": "How to Use Facebook Business Manager",
        "description": "Complete guide to setting up and using Facebook BM",
        "category": "social_media",
        "tags": ["facebook", "business manager", "ads"],
        "viewCount": 1250,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

---

### Get Tutorial Detail

Retrieve detailed content for a specific tutorial.

**Endpoint:** `GET /tutorials/:id`

**Access:** Member, Admin

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "How to Use Facebook Business Manager",
    "description": "Complete guide to setting up and using Facebook BM",
    "content": "# Introduction\n\nFacebook Business Manager is...",
    "category": "social_media",
    "tags": ["facebook", "business manager", "ads"],
    "viewCount": 1251,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-10T00:00:00.000Z"
  }
}
```

**Note:** View count is automatically incremented when this endpoint is accessed.

---

## Admin Endpoints

All admin endpoints require `admin` role.

### Admin User Management

#### Get All Users

**Endpoint:** `GET /admin/users`

**Access:** Admin only

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `search` (optional): Search by username, email, or full name
- `role` (optional): Filter by role (guest, member, admin)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "username": "johndoe",
        "email": "john@example.com",
        "fullName": "John Doe",
        "role": "member",
        "balance": 50000,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "lastLoginAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100,
      "itemsPerPage": 10
    }
  }
}
```

---

#### Update User

**Endpoint:** `PUT /admin/users/:id`

**Access:** Admin only

**Request Body:**
```json
{
  "fullName": "John Updated",
  "email": "updated@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "johndoe",
    "email": "updated@example.com",
    "fullName": "John Updated",
    "role": "member",
    "balance": 50000
  },
  "message": "User updated successfully"
}
```

---

#### Update User Balance

**Endpoint:** `PUT /admin/users/:id/balance`

**Access:** Admin only

**Request Body:**
```json
{
  "balance": 100000,
  "reason": "Manual adjustment - refund"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "balance": 100000
  },
  "message": "User balance updated successfully"
}
```

**Note:** This action is logged in admin audit log.

---

#### Update User Role

**Endpoint:** `PUT /admin/users/:id/role`

**Access:** Admin only

**Request Body:**
```json
{
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "role": "admin"
  },
  "message": "User role updated successfully"
}
```

**Note:** This action is logged in admin audit log.

---

#### Delete User

**Endpoint:** `DELETE /admin/users/:id`

**Access:** Admin only

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Note:** This is a soft delete. User data is retained but account is deactivated.

---

### Admin Transaction Management

#### Get All Transactions

**Endpoint:** `GET /admin/transactions`

**Access:** Admin only

**Query Parameters:**
- `status` (optional): Filter by status
- `startDate` (optional): Filter from date (ISO 8601)
- `endDate` (optional): Filter to date (ISO 8601)
- `userId` (optional): Filter by user ID
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "userId": "uuid",
        "user": {
          "username": "johndoe",
          "email": "john@example.com"
        },
        "productName": "Akun BM RMSO New",
        "productType": "RMSO_NEW",
        "quantity": 5,
        "totalAmount": 250000,
        "status": "BERHASIL",
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 20,
      "totalItems": 200,
      "itemsPerPage": 10
    }
  }
}
```

---

#### Update Transaction Status

**Endpoint:** `PUT /admin/transactions/:id`

**Access:** Admin only

**Request Body:**
```json
{
  "status": "BERHASIL"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "BERHASIL"
  },
  "message": "Transaction status updated successfully"
}
```

---

#### Refund Transaction

**Endpoint:** `POST /admin/transactions/:id/refund`

**Access:** Admin only

**Request Body:**
```json
{
  "reason": "Product issue - full refund"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "refundAmount": 250000,
    "newBalance": 300000
  },
  "message": "Transaction refunded successfully"
}
```

**Note:** Refund amount is automatically added to user's balance.

---

#### Export Transactions

**Endpoint:** `GET /admin/transactions/export`

**Access:** Admin only

**Query Parameters:**
- `format` (optional): Export format (csv, excel) - default: csv
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date
- `status` (optional): Filter by status

**Response:** File download (CSV or Excel)

---

### Admin Claim Management

#### Get All Claims

**Endpoint:** `GET /admin/claims`

**Access:** Admin only

**Query Parameters:**
- `status` (optional): Filter by status
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "claims": [
      {
        "id": "uuid",
        "userId": "uuid",
        "user": {
          "username": "johndoe",
          "email": "john@example.com"
        },
        "transactionId": "uuid",
        "transaction": {
          "productName": "Akun BM RMSO New",
          "totalAmount": 250000
        },
        "reason": "Product not working",
        "description": "Account credentials invalid",
        "status": "PENDING",
        "responseNote": null,
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 45,
      "itemsPerPage": 10
    }
  }
}
```

---

#### Update Claim Status

**Endpoint:** `PUT /admin/claims/:id`

**Access:** Admin only

**Request Body:**
```json
{
  "status": "APPROVED",
  "responseNote": "Claim approved. Refund will be processed."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "APPROVED",
    "responseNote": "Claim approved. Refund will be processed."
  },
  "message": "Claim status updated successfully"
}
```

---

#### Resolve Claim

**Endpoint:** `POST /admin/claims/:id/resolve`

**Access:** Admin only

**Request Body:**
```json
{
  "refundAmount": 250000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "claimId": "uuid",
    "refundAmount": 250000,
    "newBalance": 300000
  },
  "message": "Claim resolved and refund processed"
}
```

**Note:** This automatically updates user balance and claim status.

---

### Admin Tutorial Management

#### Create Tutorial

**Endpoint:** `POST /admin/tutorials`

**Access:** Admin only

**Request Body:**
```json
{
  "title": "New Tutorial Title",
  "description": "Brief description",
  "content": "# Full tutorial content in markdown",
  "category": "social_media",
  "tags": ["facebook", "tutorial"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "New Tutorial Title",
    "description": "Brief description",
    "content": "# Full tutorial content in markdown",
    "category": "social_media",
    "tags": ["facebook", "tutorial"],
    "viewCount": 0,
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  "message": "Tutorial created successfully"
}
```

---

#### Update Tutorial

**Endpoint:** `PUT /admin/tutorials/:id`

**Access:** Admin only

**Request Body:**
```json
{
  "title": "Updated Tutorial Title",
  "content": "# Updated content"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Updated Tutorial Title",
    "content": "# Updated content",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  },
  "message": "Tutorial updated successfully"
}
```

---

#### Delete Tutorial

**Endpoint:** `DELETE /admin/tutorials/:id`

**Access:** Admin only

**Response:**
```json
{
  "success": true,
  "message": "Tutorial deleted successfully"
}
```

---

### Admin Statistics

#### Get System Overview

**Endpoint:** `GET /admin/stats/overview`

**Access:** Admin only

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "totalMembers": 1200,
    "totalAdmins": 5,
    "totalTransactions": 5430,
    "pendingTransactions": 45,
    "successfulTransactions": 5200,
    "failedTransactions": 185,
    "totalRevenue": 125000000,
    "pendingClaims": 23,
    "activeSessions": 156
  }
}
```

---

#### Get User Statistics

**Endpoint:** `GET /admin/stats/users`

**Access:** Admin only

**Query Parameters:**
- `period` (optional): Time period (7d, 30d, 90d, 1y) - default: 30d

**Response:**
```json
{
  "success": true,
  "data": {
    "userGrowth": [
      {
        "date": "2024-01-01",
        "newUsers": 45,
        "totalUsers": 1000
      },
      {
        "date": "2024-01-02",
        "newUsers": 52,
        "totalUsers": 1052
      }
    ],
    "roleDistribution": {
      "member": 1200,
      "admin": 5
    }
  }
}
```

---

#### Get Transaction Statistics

**Endpoint:** `GET /admin/stats/transactions`

**Access:** Admin only

**Query Parameters:**
- `period` (optional): Time period (7d, 30d, 90d, 1y) - default: 30d
- `groupBy` (optional): Group by (day, week, month) - default: day

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionsByPeriod": [
      {
        "date": "2024-01-01",
        "count": 125,
        "revenue": 3500000
      },
      {
        "date": "2024-01-02",
        "count": 142,
        "revenue": 4200000
      }
    ],
    "productTypeDistribution": {
      "RMSO_NEW": 2500,
      "PERSONAL_TUA": 1200,
      "RM_NEW": 800,
      "RM_TUA": 600,
      "J202_VERIFIED_BM": 330
    }
  }
}
```

---

### Admin System Settings

#### Get System Settings

**Endpoint:** `GET /admin/settings`

**Access:** Admin only

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentMethods": [
      {
        "id": "bank_transfer",
        "name": "Bank Transfer",
        "enabled": true,
        "minAmount": 10000,
        "maxAmount": 10000000
      }
    ],
    "notifications": {
      "emailEnabled": true,
      "smsEnabled": false
    },
    "maintenance": {
      "enabled": false,
      "message": ""
    }
  }
}
```

---

#### Update System Settings

**Endpoint:** `PUT /admin/settings`

**Access:** Admin only

**Request Body:**
```json
{
  "paymentMethods": [
    {
      "id": "bank_transfer",
      "enabled": true,
      "minAmount": 10000
    }
  ],
  "notifications": {
    "emailEnabled": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentMethods": [...],
    "notifications": {...}
  },
  "message": "Settings updated successfully"
}
```

---

#### Get System Logs

**Endpoint:** `GET /admin/logs`

**Access:** Admin only

**Query Parameters:**
- `type` (optional): Log type (audit, error, access)
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid",
        "adminId": "uuid",
        "action": "UPDATE_USER_BALANCE",
        "resource": "users",
        "resourceId": "uuid",
        "changes": {
          "oldBalance": 50000,
          "newBalance": 100000
        },
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 50,
      "totalItems": 500,
      "itemsPerPage": 10
    }
  }
}
```

---

## Rate Limiting

### Backend API Rate Limits

API endpoints are rate-limited to prevent abuse:

| Endpoint Type | Rate Limit |
|---------------|------------|
| General API | 100 requests per minute |
| Admin API | 200 requests per minute |

When rate limit is exceeded, the API returns:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 900
  }
}
```

### Supabase Auth Rate Limits

Authentication rate limits are managed by Supabase:

| Action | Rate Limit |
|--------|------------|
| Sign Up | 5 requests per hour per IP |
| Sign In | 5 requests per hour per IP |
| Password Reset | 5 requests per hour per IP |
| Email Verification | 5 requests per hour per IP |

**Note:** Supabase rate limits are configurable in the Supabase Dashboard under Authentication > Rate Limits.

---

## Pagination

List endpoints support pagination with the following parameters:

- `page`: Page number (starts at 1)
- `limit`: Items per page (default: 10, max: 100)

Pagination response format:

```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## Webhooks (Future Feature)

Webhook support for real-time notifications is planned for future releases.

---

## API Versioning

Current API version: v1

The API version is included in the base URL. Future versions will be available at:
- v2: `/api/v2/...`
- v3: `/api/v3/...`

---

## Support

For API support and questions:
- Email: api-support@canvango.com
- Documentation: https://docs.canvango.com
- Status Page: https://status.canvango.com

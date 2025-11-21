# Authentication System Implementation

## Overview
Authentication system using Supabase Auth for user authentication and JWT-based authorization for backend API access.

## Architecture

The application uses a hybrid authentication approach:
- **Frontend**: Supabase Auth handles user registration, login, password reset
- **Backend**: Validates Supabase JWT tokens and enforces role-based authorization

## Implemented Components

### 1. Supabase Client Configuration (`src/config/supabase.ts`)
- `getSupabaseClient()` - Returns singleton Supabase client instance
- Uses service role key for server-side operations
- Bypasses Row Level Security (RLS) for admin operations

### 2. Authentication Middleware (`src/middleware/auth.middleware.ts`)
- `authenticate` - Verifies Supabase JWT token from Authorization header
- `optionalAuthenticate` - Attaches user if token exists, doesn't fail if missing
- Validates token with Supabase Auth
- Fetches user role from database
- Extends Express Request type to include `user` property

### 3. Role-Based Authorization Middleware (`src/middleware/role.middleware.ts`)
- `requireRole(...roles)` - Requires specific role(s)
- `requireMinRole(role)` - Requires minimum role level
- `requireMember` - Shortcut for member-only routes
- `requireAdmin` - Shortcut for admin-only routes
- `isGuest` - Checks if user is guest
- `requireOwnership(paramName)` - Ensures user owns the resource

### 4. Frontend Authentication (Supabase Auth)
Authentication is handled on the frontend using Supabase Auth:
- User registration via `supabase.auth.signUp()`
- User login via `supabase.auth.signInWithPassword()`
- Password reset via `supabase.auth.resetPasswordForEmail()`
- Session management handled automatically by Supabase

## Security Features

### Password Security
- Handled by Supabase Auth
- Bcrypt hashing with configurable salt rounds
- Password strength requirements configurable in Supabase Dashboard

### Token Security
- Supabase JWT tokens
- Tokens validated on backend using Supabase Auth API
- Automatic token refresh handled by Supabase client
- Secure token storage in browser localStorage (managed by Supabase)

### Error Codes
- `AUTH_002` - Invalid or expired token
- `AUTH_003` - No authentication token provided
- `AUTH_004` - Insufficient permissions

## Usage Examples

### Frontend Authentication (Supabase)

#### Register
```typescript
import { supabase } from './utils/supabase';

const { data, error } = await supabase.auth.signUp({
  email: 'john@example.com',
  password: 'securepass123',
  options: {
    data: {
      username: 'johndoe',
      full_name: 'John Doe'
    }
  }
});
```

#### Login
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'john@example.com',
  password: 'securepass123'
});
```

#### Get Current Session
```typescript
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

### Backend API Requests

#### Making Authenticated Requests
```typescript
// Frontend sends token in Authorization header
const response = await fetch('http://localhost:5000/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`
  }
});
```

### Protected Route Example
```typescript
import { authenticate, requireMember } from './middleware/index.js';

router.get('/transactions', authenticate, requireMember, getTransactions);
```

### Admin-Only Route Example
```typescript
import { authenticate, requireAdmin } from './middleware/index.js';

router.get('/admin/users', authenticate, requireAdmin, getAllUsers);
```

## Environment Variables

### Backend
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT Configuration (for backward compatibility)
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_token_secret_here
```

### Frontend
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Migration from Custom Auth

The application has been migrated from custom JWT authentication to Supabase Auth:
- ✅ Frontend uses Supabase Auth for all authentication
- ✅ Backend validates Supabase JWT tokens
- ✅ Role-based authorization maintained
- ❌ Custom auth endpoints removed (`/api/auth/*`)

## Next Steps
- Configure email templates in Supabase Dashboard
- Enable/disable email confirmation based on environment
- Set up custom SMTP for production (optional)
- Configure Row Level Security (RLS) policies in Supabase

# Supabase Auth Migration - Complete Guide

## Overview

Aplikasi Canvango Group telah **sepenuhnya dimigrasikan** ke Supabase Auth untuk semua fitur authentication:
- ✅ Register
- ✅ Login
- ✅ Logout
- ✅ Forgot Password
- ✅ Reset Password

## ⚠️ PENTING: Konfigurasi Supabase Dashboard

Sebelum testing, Anda HARUS mengkonfigurasi Supabase Dashboard:

### 1. Disable Email Confirmation (Untuk Development)

**Kenapa?** Secara default, Supabase memerlukan email confirmation untuk register. Untuk development, kita disable ini agar bisa langsung login setelah register.

**Cara:**
1. Login ke [Supabase Dashboard](https://app.supabase.com/project/gpittnsfzgkdbqnccncn)
2. Go to: **Authentication** → **Providers** → **Email**
3. Scroll ke bawah ke section **"Email Confirmation"**
4. **UNCHECK** "Enable email confirmations"
5. Click **Save**

### 2. URL Configuration (Sudah Dikonfigurasi ✅)

- Site URL: `http://localhost:5173`
- Redirect URL: `http://localhost:5173/reset-password`

## 🔄 Perubahan dari Custom Backend ke Supabase

### Sebelum (Custom Backend):
```typescript
// Register/Login ke Express backend
POST http://localhost:5000/api/auth/register
POST http://localhost:5000/api/auth/login
```

### Sesudah (Supabase Auth):
```typescript
// Register/Login ke Supabase
supabase.auth.signUp()
supabase.auth.signInWithPassword()
```

## 📋 User Data Structure

### Supabase Auth User:
```typescript
{
  id: string;              // Supabase user ID (UUID)
  email: string;           // User email
  user_metadata: {
    username: string;      // Custom field
    full_name: string;     // Custom field
  }
}
```

### Application User (Frontend):
```typescript
{
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'member' | 'admin';  // Default: 'member'
  balance: number;            // Default: 0
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}
```

## 🧪 Testing Guide

### 1. Test Register Flow

```bash
# Start frontend
cd canvango-app/frontend
npm run dev
```

1. Navigate to: `http://localhost:5173/register`
2. Fill in form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Full Name: `Test User`
   - Password: `Test123!` (min 8 chars, uppercase, lowercase, number)
3. Click "Register"
4. **Expected**: Success message + auto login + redirect to dashboard

### 2. Test Login Flow

1. Navigate to: `http://localhost:5173/login`
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `Test123!`
3. Click "Login"
4. **Expected**: Success message + redirect to dashboard

### 3. Test Logout Flow

1. While logged in, click "Logout" button
2. **Expected**: Success message + redirect to public page

### 4. Test Forgot Password Flow

1. Navigate to: `http://localhost:5173/login`
2. Click "Forgot your password?"
3. Enter email: `test@example.com`
4. Click "Send Reset Link"
5. Check email inbox
6. Click reset link
7. Enter new password
8. **Expected**: Success + redirect to login

## 🔧 Troubleshooting

### "Email not confirmed" Error

**Problem**: User can't login after register

**Solution**: Disable email confirmation in Supabase Dashboard (see step 1 above)

### "Invalid login credentials" Error

**Problem**: Wrong email or password

**Solution**: 
- Make sure email is correct
- Password is case-sensitive
- Try forgot password flow

### "User already registered" Error

**Problem**: Email already exists in Supabase

**Solution**:
- Use different email, OR
- Delete user from Supabase Dashboard:
  1. Go to **Authentication** → **Users**
  2. Find user and click delete

### Backend Still Running?

**Problem**: Old backend might interfere

**Solution**: Stop backend server if running. Frontend now connects directly to Supabase.

## 📊 Supabase Dashboard - User Management

### View Users
1. Go to: [Authentication → Users](https://app.supabase.com/project/gpittnsfzgkdbqnccncn/auth/users)
2. See all registered users
3. View user details, metadata, sessions

### Delete User
1. Find user in list
2. Click "..." menu
3. Click "Delete user"

### Reset User Password (Admin)
1. Find user in list
2. Click "..." menu
3. Click "Send password reset email"

## 🔐 Security Notes

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

### Session Management
- Sessions stored in browser localStorage
- Auto-refresh tokens
- Secure HTTP-only cookies (in production)

### Rate Limiting
Supabase has built-in rate limiting:
- Register: Limited per IP
- Login: Limited per IP
- Password reset: Limited per email

## 🚀 Production Deployment

### 1. Enable Email Confirmation
For production, you should enable email confirmation:
1. Go to **Authentication** → **Providers** → **Email**
2. **CHECK** "Enable email confirmations"
3. Customize email template if needed

### 2. Update URLs
1. Update Site URL to production domain
2. Add production Redirect URLs
3. Update environment variables

### 3. Custom SMTP (Optional)
For better email deliverability:
1. Go to **Settings** → **Auth** → **SMTP Settings**
2. Configure custom SMTP provider
3. Test email delivery

## 📝 Migration Checklist

- [x] AuthContext migrated to Supabase
- [x] Register flow using Supabase
- [x] Login flow using Supabase
- [x] Logout flow using Supabase
- [x] Forgot Password using Supabase
- [x] Reset Password using Supabase
- [ ] Disable email confirmation in Supabase (YOU NEED TO DO THIS!)
- [ ] Test register flow
- [ ] Test login flow
- [ ] Test logout flow
- [ ] Test forgot password flow

## 🎯 Next Steps

1. **Configure Supabase Dashboard** (disable email confirmation)
2. **Test all auth flows**
3. **Verify everything works**
4. **(Optional) Setup custom user profiles table in Supabase**
5. **(Optional) Implement role-based access with Supabase RLS**

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Auth with React](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)
- [Supabase Dashboard](https://app.supabase.com/project/gpittnsfzgkdbqnccncn)

## ⚠️ Important Notes

1. **Backend is no longer used for auth** - All auth goes through Supabase
2. **User data is stored in Supabase Auth** - Not in PostgreSQL backend
3. **Email confirmation is disabled by default** - Enable for production
4. **Default role is 'member'** - Admin role needs manual assignment

## 🔄 Rollback (If Needed)

If you need to rollback to custom backend:
1. Revert `AuthContext.tsx` changes
2. Change import from `supabase` back to `api`
3. Restart backend server
4. Update frontend to call backend API

---

**Status**: ✅ Migration Complete - Ready for Testing (after Supabase configuration)

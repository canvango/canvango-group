# Forgot Password - Visual Flow Diagram

## 🔄 Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                     FORGOT PASSWORD FLOW                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   /login     │  User at login page
└──────┬───────┘
       │
       │ Click "Lupa kata sandi?"
       ↓
┌──────────────────┐
│ /forgot-password │  ✅ Route registered (GuestRoute)
└──────┬───────────┘
       │
       │ Input: email@example.com
       │ Click: "Send Reset Link"
       ↓
┌──────────────────────────────────────┐
│  Supabase Auth API                   │
│  supabase.auth.resetPasswordForEmail │
└──────┬───────────────────────────────┘
       │
       │ Generate token (valid 1 hour)
       │ Send email via Supabase
       ↓
┌──────────────────────────────────┐
│  Email Inbox                     │
│  Subject: "Reset Your Password"  │
│  Link: /reset-password?token=xxx │
└──────┬───────────────────────────┘
       │
       │ User clicks link
       ↓
┌──────────────────┐
│ /reset-password  │  ✅ Route registered (No GuestRoute)
└──────┬───────────┘
       │
       │ Validate token
       ↓
┌──────────────────────────────┐
│  Token Valid?                │
├──────────────────────────────┤
│  ✅ YES → Show form          │
│  ❌ NO  → Error + redirect   │
└──────┬───────────────────────┘
       │
       │ Input: NewPassword123
       │ Confirm: NewPassword123
       │ Click: "Reset Password"
       ↓
┌──────────────────────────────┐
│  Password Validation         │
├──────────────────────────────┤
│  ✅ Min 8 characters         │
│  ✅ Has uppercase            │
│  ✅ Has lowercase            │
│  ✅ Has number               │
│  ✅ Passwords match          │
└──────┬───────────────────────┘
       │
       │ All valid
       ↓
┌──────────────────────────────┐
│  Supabase Auth API           │
│  supabase.auth.updateUser    │
└──────┬───────────────────────┘
       │
       │ Password updated
       │ Show success toast
       │ Wait 2 seconds
       ↓
┌──────────────┐
│   /login     │  Redirect to login
└──────┬───────┘
       │
       │ Input: email@example.com
       │ Input: NewPassword123
       │ Click: "Masuk"
       ↓
┌──────────────────┐
│   /dashboard     │  ✅ Login successful
└──────────────────┘
```

---

## 🎯 Key Integration Points

### 1. Route Registration
```tsx
// src/main.tsx
<Route path="/forgot-password" 
       element={<GuestRoute><ForgotPassword /></GuestRoute>} />
<Route path="/reset-password" 
       element={<ResetPassword />} />
```

**Why different?**
- `/forgot-password` → GuestRoute (only for logged-out users)
- `/reset-password` → No guard (accessed via email token)

### 2. Supabase Integration
```tsx
// Request reset
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`
});

// Update password
await supabase.auth.updateUser({
  password: newPassword
});
```

### 3. Token Flow
```
Email Link → Browser → /reset-password?token=xxx
                              ↓
                    Supabase validates token
                              ↓
                    Creates temporary session
                              ↓
                    User can update password
```

---

## 🔒 Security Layers

```
┌─────────────────────────────────────────┐
│         Security Features               │
├─────────────────────────────────────────┤
│  1. Token Expiry (1 hour)              │
│  2. One-time use token                 │
│  3. Password validation                │
│  4. Guest route protection             │
│  5. HTTPS in production                │
│  6. Rate limiting (Supabase)           │
└─────────────────────────────────────────┘
```

---

## 📊 State Management

### ForgotPassword Component States
```
┌─────────────┐
│   Initial   │  email = "", loading = false
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Loading   │  loading = true
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Email Sent │  emailSent = true
└─────────────┘
```

### ResetPassword Component States
```
┌─────────────────┐
│   Validating    │  isValidSession = false
└──────┬──────────┘
       │
       ├─→ Valid Token
       │   ↓
       │   ┌─────────────┐
       │   │  Show Form  │  isValidSession = true
       │   └─────────────┘
       │
       └─→ Invalid Token
           ↓
           ┌──────────────────┐
           │  Error + Redirect │
           └──────────────────┘
```

---

## 🧪 Testing Checkpoints

```
Checkpoint 1: Route Access
├─ URL: http://localhost:5173/forgot-password
├─ Expected: Form displayed
└─ Status: [ ]

Checkpoint 2: Email Submission
├─ Action: Submit email
├─ Expected: Success message
└─ Status: [ ]

Checkpoint 3: Email Delivery
├─ Check: Email inbox
├─ Expected: Reset email received
└─ Status: [ ]

Checkpoint 4: Token Validation
├─ Action: Click email link
├─ Expected: Form displayed
└─ Status: [ ]

Checkpoint 5: Password Update
├─ Action: Submit new password
├─ Expected: Success + redirect
└─ Status: [ ]

Checkpoint 6: Login
├─ Action: Login with new password
├─ Expected: Access granted
└─ Status: [ ]
```

---

## 🐛 Error Handling Flow

```
┌─────────────────────────────────────────┐
│           Error Scenarios               │
├─────────────────────────────────────────┤
│                                         │
│  Email not found                        │
│  ↓                                      │
│  Supabase still sends "success"         │
│  (Security: don't reveal user exists)   │
│                                         │
│  Token expired                          │
│  ↓                                      │
│  Show error message                     │
│  Redirect to /forgot-password           │
│                                         │
│  Password validation fails              │
│  ↓                                      │
│  Show specific error                    │
│  Keep form open                         │
│                                         │
│  Network error                          │
│  ↓                                      │
│  Show generic error                     │
│  Allow retry                            │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📱 Responsive Behavior

```
Desktop (≥1024px)
┌────────────────────────────────────┐
│                                    │
│     ┌──────────────────────┐      │
│     │                      │      │
│     │   Forgot Password    │      │
│     │   Form (max-w-md)    │      │
│     │                      │      │
│     └──────────────────────┘      │
│                                    │
└────────────────────────────────────┘

Mobile (≤768px)
┌──────────────────┐
│                  │
│  Forgot Password │
│  Form (full-w)   │
│                  │
│                  │
└──────────────────┘
```

---

## 🎨 UI Components Used

```
ForgotPassword.tsx
├─ Card (rounded-3xl)
├─ Input (email)
├─ Button (btn-primary)
├─ Link (to /login)
└─ Toast (success/error)

ResetPassword.tsx
├─ Card (rounded-3xl)
├─ Input (password) × 2
├─ Button (btn-primary)
├─ Validation hints
└─ Toast (success/error)
```

---

## 🔗 File Dependencies

```
src/main.tsx
├─ imports ForgotPassword
├─ imports ResetPassword
└─ imports GuestRoute

ForgotPassword.tsx
├─ uses supabase client
├─ uses useToast
└─ uses Link (react-router)

ResetPassword.tsx
├─ uses supabase client
├─ uses useToast
├─ uses useNavigate
└─ uses useEffect

LoginForm.tsx
└─ has Link to /forgot-password
```

---

## ✅ Integration Verification

```bash
# Check routes registered
grep -n "forgot-password" src/main.tsx
grep -n "reset-password" src/main.tsx

# Check imports
grep -n "ForgotPassword" src/main.tsx
grep -n "ResetPassword" src/main.tsx

# Check no errors
npm run build

# All should pass ✅
```

---

**Visual Guide Version:** 1.0  
**Last Updated:** 26 November 2025  
**Status:** Complete & Ready for Testing

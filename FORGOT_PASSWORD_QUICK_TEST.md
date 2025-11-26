# Forgot Password - Quick Test Guide 🚀

## ⚡ 5-Minute Quick Test

### Prerequisites
```bash
# 1. Start app
npm run dev

# 2. Open browser
http://localhost:5173/login
```

### Test Flow (5 steps)

#### Step 1: Access Forgot Password (30 sec)
```
1. Click "Lupa kata sandi?" link
2. Verify URL: http://localhost:5173/forgot-password
3. See form with email input
```
✅ **Pass:** Form displayed  
❌ **Fail:** 404 or redirect → Check routes in main.tsx

---

#### Step 2: Request Reset (1 min)
```
1. Input: admin1@gmail.com
2. Click "Send Reset Link"
3. Wait for confirmation
```
✅ **Pass:** "Check Your Email" message  
❌ **Fail:** Error message → Check Supabase config

---

#### Step 3: Check Email (2 min)
```
1. Open email inbox
2. Look for "Reset Your Password" email
3. Check spam folder if not in inbox
```
✅ **Pass:** Email received with reset link  
❌ **Fail:** No email → See troubleshooting below

---

#### Step 4: Reset Password (1 min)
```
1. Click link in email
2. Verify URL: http://localhost:5173/reset-password?token=xxx
3. Input new password: TestPass123
4. Confirm: TestPass123
5. Click "Reset Password"
```
✅ **Pass:** Success message + redirect to login  
❌ **Fail:** "Invalid token" → Token expired or config issue

---

#### Step 5: Login with New Password (30 sec)
```
1. At login page
2. Input email: admin1@gmail.com
3. Input password: TestPass123
4. Click "Masuk"
```
✅ **Pass:** Login successful  
❌ **Fail:** Invalid credentials → Password not updated

---

## 🐛 Quick Troubleshooting

### No email received?
```bash
# Check Supabase logs
# Go to: https://app.supabase.com/project/gpittnsfzgkdbqnccncn
# Navigate to: Authentication > Logs
# Look for: "password_recovery" events
```

**Quick fixes:**
1. Wait 2-5 minutes (free tier delay)
2. Check spam folder
3. Verify email exists in database:
```sql
SELECT email, email_confirmed_at FROM auth.users WHERE email = 'admin1@gmail.com';
```

### "Invalid or expired reset link"?
**Cause:** Token expired (> 1 hour) or already used

**Fix:** Request new reset link

### Route not found (404)?
**Cause:** Routes not registered

**Fix:**
```bash
# Verify routes exist
grep "forgot-password" src/main.tsx
grep "reset-password" src/main.tsx

# Should show route definitions
# If not, routes not registered properly
```

---

## ⚙️ Supabase Dashboard Quick Check

**URL:** https://app.supabase.com/project/gpittnsfzgkdbqnccncn

### 1. URL Configuration (30 sec)
```
Path: Authentication > URL Configuration

Check:
✅ Site URL: http://localhost:5173
✅ Redirect URLs includes: http://localhost:5173/reset-password
```

### 2. Email Template (30 sec)
```
Path: Authentication > Email Templates > Reset Password

Check:
✅ Template enabled
✅ Contains: {{ .SiteURL }}/reset-password
```

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

[ ] Step 1: Access forgot password page
[ ] Step 2: Request reset email
[ ] Step 3: Receive email
[ ] Step 4: Reset password
[ ] Step 5: Login with new password

Issues found:
_________________________________
_________________________________

Overall: PASS / FAIL
```

---

## 🎯 Success Criteria

All these must work:
- ✅ Can access /forgot-password
- ✅ Can submit email
- ✅ Email received (within 5 min)
- ✅ Can click link and access /reset-password
- ✅ Can set new password
- ✅ Can login with new password

**If all pass:** Feature is working perfectly! 🎉

---

## 📞 Need Help?

**Check full documentation:**
- `FORGOT_PASSWORD_INTEGRATION_COMPLETE.md` - Complete guide
- `canvango-app/SUPABASE_SETUP.md` - Supabase setup

**Common issues:**
1. Email not received → Check Supabase logs
2. Invalid token → Request new reset
3. 404 error → Check routes registration
4. Password validation → Check requirements (8+ chars, uppercase, lowercase, number)

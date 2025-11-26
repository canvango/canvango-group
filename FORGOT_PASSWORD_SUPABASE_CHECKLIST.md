# Supabase Dashboard Configuration Checklist

## 🎯 CRITICAL: Complete This Before Testing

**Project:** Canvango Group  
**Supabase URL:** https://gpittnsfzgkdbqnccncn.supabase.co  
**Dashboard:** https://app.supabase.com/project/gpittnsfzgkdbqnccncn

---

## ✅ Configuration Steps

### Step 1: URL Configuration (REQUIRED)

**Path:** Authentication > URL Configuration

#### Development Setup
```
Site URL: http://localhost:5173
```

**Add Redirect URLs:**
```
http://localhost:5173/reset-password
```

**How to add:**
1. Go to Authentication > URL Configuration
2. Find "Site URL" field
3. Enter: `http://localhost:5173`
4. Click "Save"
5. Scroll to "Redirect URLs" section
6. Click "Add URL"
7. Enter: `http://localhost:5173/reset-password`
8. Click "Save"

**Verification:**
- [ ] Site URL set to `http://localhost:5173`
- [ ] Redirect URL includes `http://localhost:5173/reset-password`
- [ ] Changes saved (green checkmark appears)

---

### Step 2: Email Template Verification (REQUIRED)

**Path:** Authentication > Email Templates > Reset Password

**Check these:**
- [ ] Template is enabled (toggle ON)
- [ ] Subject line exists
- [ ] Email body contains reset link
- [ ] Link format: `{{ .SiteURL }}/reset-password?token={{ .Token }}`

**Default template should look like:**
```html
<h2>Reset Your Password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .SiteURL }}/reset-password?token={{ .Token }}">Reset Password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>
```

**Verification:**
- [ ] Template enabled
- [ ] Contains `{{ .SiteURL }}/reset-password`
- [ ] Contains `{{ .Token }}`
- [ ] No syntax errors

---

### Step 3: Email Settings (OPTIONAL but RECOMMENDED)

**Path:** Settings > Auth > SMTP Settings

**Current:** Using Supabase built-in email (free tier)

**Limitations:**
- May be slow (2-5 minutes delay)
- May go to spam
- Limited daily quota

**For Production (Optional):**
Configure custom SMTP for better deliverability:
- Gmail SMTP
- SendGrid
- AWS SES
- Mailgun

**Verification:**
- [ ] Aware of free tier limitations
- [ ] (Optional) Custom SMTP configured

---

### Step 4: Auth Settings Verification

**Path:** Authentication > Settings

**Check these settings:**

#### Email Auth
- [ ] Email provider: Enabled
- [ ] Confirm email: Enabled (recommended)
- [ ] Secure email change: Enabled (recommended)

#### Password Requirements
- [ ] Minimum password length: 8 (or higher)
- [ ] Password strength: Medium or Strong

#### Session Settings
- [ ] JWT expiry: 3600 seconds (1 hour) - default
- [ ] Refresh token expiry: 2592000 seconds (30 days) - default

**Verification:**
- [ ] Email auth enabled
- [ ] Password requirements set
- [ ] Session settings appropriate

---

### Step 5: Test Email Delivery

**Path:** Authentication > Logs

**After requesting reset password:**
1. Go to Authentication > Logs
2. Look for recent events
3. Check for "password_recovery" event
4. Verify status is "success"

**Verification:**
- [ ] Can see password_recovery events in logs
- [ ] Events show "success" status
- [ ] No error messages

---

## 🚀 Production Configuration (When Deploying)

### Update URLs for Production

**Site URL:**
```
https://yourdomain.com
```

**Redirect URLs:**
```
https://yourdomain.com/reset-password
```

**Steps:**
1. Go to Authentication > URL Configuration
2. Update Site URL to production domain
3. Add production redirect URL
4. Keep development URLs for testing
5. Save changes

**Verification:**
- [ ] Production Site URL added
- [ ] Production Redirect URL added
- [ ] Both dev and prod URLs configured
- [ ] Changes saved

---

## 📊 Configuration Status

### Quick Check
```bash
# Run this in browser console on Supabase Dashboard
# Authentication > URL Configuration page

// Should see:
Site URL: http://localhost:5173
Redirect URLs:
  - http://localhost:5173/reset-password
```

### Verification Checklist

**Before Testing:**
- [ ] Step 1: URL Configuration complete
- [ ] Step 2: Email template verified
- [ ] Step 3: Email settings reviewed
- [ ] Step 4: Auth settings verified
- [ ] Step 5: Ready to test email delivery

**After First Test:**
- [ ] Email received successfully
- [ ] Reset link works
- [ ] Password updated
- [ ] Can login with new password

---

## 🐛 Common Configuration Issues

### Issue: Email not received

**Check:**
1. Site URL is correct
2. Email template is enabled
3. User email is confirmed in database
4. Check spam folder
5. Wait 2-5 minutes (free tier delay)

**SQL to verify user:**
```sql
SELECT 
  email, 
  email_confirmed_at,
  recovery_sent_at
FROM auth.users 
WHERE email = 'your-email@example.com';
```

### Issue: "Invalid redirect URL"

**Cause:** Redirect URL not in allowed list

**Fix:**
1. Go to Authentication > URL Configuration
2. Add exact URL to Redirect URLs list
3. Must match exactly (including http/https)
4. Save changes

### Issue: Reset link doesn't work

**Check:**
1. Token in URL is present
2. URL format: `/reset-password?token=xxx`
3. Token not expired (< 1 hour)
4. Site URL matches current domain

---

## 📞 Support Resources

**Supabase Documentation:**
- [Auth Configuration](https://supabase.com/docs/guides/auth/auth-email)
- [Password Reset](https://supabase.com/docs/guides/auth/passwords)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)

**Project Documentation:**
- `FORGOT_PASSWORD_INTEGRATION_COMPLETE.md` - Full integration guide
- `FORGOT_PASSWORD_QUICK_TEST.md` - Quick testing guide
- `canvango-app/SUPABASE_SETUP.md` - Detailed setup guide

---

## ✨ Configuration Complete?

**If all checkboxes above are checked:**
✅ Configuration is complete  
✅ Ready to test forgot password feature  
✅ Proceed to `FORGOT_PASSWORD_QUICK_TEST.md`

**If any issues:**
❌ Review the specific step  
❌ Check common issues section  
❌ Verify in Supabase Dashboard  
❌ Check Supabase logs for errors

---

**Last Updated:** 26 November 2025  
**Version:** 1.0  
**Status:** Ready for Configuration

# ✅ Supabase Configuration Checklist - Forgot Password

## 🎯 Quick Access Links

**Supabase Dashboard**: https://supabase.com/dashboard/project/gpittnsfzgkdbqnccncn

### Direct Links to Configuration Pages:

1. **URL Configuration**
   ```
   https://supabase.com/dashboard/project/gpittnsfzgkdbqnccncn/auth/url-configuration
   ```

2. **Email Templates**
   ```
   https://supabase.com/dashboard/project/gpittnsfzgkdbqnccncn/auth/templates
   ```

3. **Auth Settings**
   ```
   https://supabase.com/dashboard/project/gpittnsfzgkdbqnccncn/settings/auth
   ```

4. **Auth Logs**
   ```
   https://supabase.com/dashboard/project/gpittnsfzgkdbqnccncn/logs/auth-logs
   ```

---

## 📋 Configuration Steps

### ✅ Step 1: URL Configuration

**Navigate to:** Authentication → URL Configuration

#### Required Settings:

**Site URL:**
```
http://localhost:5173
```

**Redirect URLs (Add all of these):**
```
http://localhost:5173/**
http://localhost:5173/reset-password
http://localhost:5173/reset-password/**
```

**Why this matters:**
- Site URL is used in email templates as `{{ .SiteURL }}`
- Redirect URLs whitelist where users can be redirected after clicking email links
- Without proper configuration, reset links will fail with "Invalid redirect URL" error

#### Verification:
- [ ] Site URL set to `http://localhost:5173`
- [ ] Redirect URLs include `/reset-password`
- [ ] Wildcard `/**` added for flexibility

---

### ✅ Step 2: Email Templates

**Navigate to:** Authentication → Email Templates → **Reset Password**

#### Template Configuration:

**Subject Line:**
```
Reset Password - Canvango Group
```

**Email Body (Copy this HTML):**
```html
<h2>Reset Password Anda</h2>

<p>Halo,</p>

<p>Kami menerima permintaan untuk reset password akun Anda di Canvango Group.</p>

<p>Klik tombol di bawah ini untuk membuat password baru:</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery" 
     style="display: inline-block; 
            padding: 14px 28px; 
            background-color: #5271ff; 
            color: white; 
            text-decoration: none; 
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;">
    Reset Password
  </a>
</p>

<p>Atau copy dan paste link berikut ke browser Anda:</p>
<p style="word-break: break-all; color: #666; font-size: 14px;">
  {{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery
</p>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

<p style="color: #666; font-size: 13px;">
  <strong>⚠️ Penting:</strong><br>
  • Link ini akan kadaluarsa dalam <strong>1 jam</strong><br>
  • Jika Anda tidak meminta reset password, abaikan email ini<br>
  • Jangan bagikan link ini kepada siapapun
</p>

<p style="color: #999; font-size: 12px; margin-top: 30px;">
  Email ini dikirim secara otomatis oleh sistem Canvango Group.<br>
  Jika Anda memiliki pertanyaan, hubungi support kami.
</p>
```

#### Important Variables (DO NOT CHANGE):
- `{{ .SiteURL }}` - Automatically replaced with your Site URL
- `{{ .Token }}` - Automatically replaced with reset token
- `{{ .Email }}` - User's email address (optional to use)

#### Verification:
- [ ] Subject line updated
- [ ] Email body contains `{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery`
- [ ] Template saved successfully
- [ ] Preview looks correct

---

### ✅ Step 3: SMTP Configuration (Optional for Development)

**Navigate to:** Project Settings → Auth → SMTP Settings

#### For Development:
- **Default Supabase Email Service** (already active)
- Sender: `noreply@mail.app.supabase.io`
- Limitation: 4 emails per hour per project
- ⚠️ Emails might go to spam folder

#### For Production (Recommended):

**Option A: Gmail SMTP**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Password: [App Password - NOT your Gmail password]
Sender Email: noreply@canvangogroup.com
Sender Name: Canvango Group
```

**How to get Gmail App Password:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate password for "Mail"
5. Use that password in SMTP settings

**Option B: SendGrid**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: [Your SendGrid API Key]
Sender Email: noreply@canvangogroup.com
Sender Name: Canvango Group
```

**Option C: AWS SES**
```
SMTP Host: email-smtp.us-east-1.amazonaws.com
SMTP Port: 587
SMTP User: [Your SES SMTP Username]
SMTP Password: [Your SES SMTP Password]
Sender Email: noreply@canvangogroup.com
Sender Name: Canvango Group
```

#### Verification:
- [ ] SMTP configured (if production)
- [ ] Test email sent successfully
- [ ] Emails not going to spam

---

### ✅ Step 4: Rate Limiting

**Navigate to:** Authentication → Rate Limits

#### Recommended Settings:
```
Password Reset: 5 requests per hour per email
Email Confirmation: 5 requests per hour per email
```

#### Why this matters:
- Prevents abuse and spam
- Protects against brute force attacks
- Ensures fair usage of email service

#### Verification:
- [ ] Rate limits configured
- [ ] Limits are reasonable for your use case

---

### ✅ Step 5: Email Confirmations

**Navigate to:** Authentication → Settings

#### Settings to Check:
```
Enable email confirmations: ✅ ON
Confirm email: ✅ ON
Secure email change: ✅ ON
```

#### Verification:
- [ ] Email confirmations enabled
- [ ] Users must confirm email before login

---

## 🧪 Testing Procedure

### Test 1: Send Reset Email

1. **Open test page:**
   ```bash
   # Open in browser:
   file:///[your-path]/test-forgot-password.html
   ```

2. **Or use the app:**
   ```bash
   npm run dev
   # Navigate to: http://localhost:5173/forgot-password
   ```

3. **Select test user:**
   - member1@gmail.com
   - member2@gmail.com
   - admin1@gmail.com
   - admin2@gmail.com

4. **Click "Send Reset Email"**

5. **Expected Result:**
   - ✅ Success message shown
   - ✅ No errors in console
   - ✅ Email sent (check logs)

### Test 2: Check Email Delivery

1. **Check email inbox** for selected user

2. **If not received:**
   - Wait 1-2 minutes
   - Check spam/junk folder
   - Check Supabase Auth Logs (see below)

3. **Email should contain:**
   - Subject: "Reset Password - Canvango Group"
   - From: noreply@mail.app.supabase.io (or your custom sender)
   - Reset button/link
   - Link format: `http://localhost:5173/reset-password?token=xxx&type=recovery`

### Test 3: Click Reset Link

1. **Click "Reset Password" button** in email

2. **Expected Result:**
   - ✅ Redirected to: `http://localhost:5173/reset-password?token=xxx&type=recovery`
   - ✅ Reset password form shown
   - ✅ No "Invalid link" error

3. **If error occurs:**
   - Check URL configuration (Step 1)
   - Check token not expired (< 1 hour)
   - Check redirect URLs whitelist

### Test 4: Reset Password

1. **Enter new password:**
   - Minimum 8 characters
   - At least 1 uppercase (A-Z)
   - At least 1 lowercase (a-z)
   - At least 1 number (0-9)

2. **Confirm password** (must match)

3. **Click "Reset Password"**

4. **Expected Result:**
   - ✅ Success message: "Password berhasil diperbarui"
   - ✅ Auto redirect to login after 2 seconds

### Test 5: Login with New Password

1. **Go to login page:**
   ```
   http://localhost:5173/login
   ```

2. **Login with:**
   - Email: [test user email]
   - Password: [new password]

3. **Expected Result:**
   - ✅ Login successful
   - ✅ Redirected to dashboard
   - ✅ User session active

---

## 🔍 Debugging Guide

### Check Auth Logs

**Navigate to:** Logs → Auth Logs

**Filter by:**
- Search: "recovery" or "reset"
- Time range: Last 1 hour

**Look for:**
```json
{
  "msg": "Sent recovery email",
  "email": "member1@gmail.com",
  "status": 200
}
```

**Common Error Messages:**

1. **"Invalid redirect URL"**
   - Fix: Add redirect URL to whitelist (Step 1)

2. **"Rate limit exceeded"**
   - Fix: Wait 1 hour or increase rate limit (Step 4)

3. **"Email not found"**
   - Fix: Use confirmed user email from database

4. **"SMTP error"**
   - Fix: Check SMTP configuration (Step 3)

### Check Browser Console

**Open DevTools** (F12) and look for:

**Success:**
```javascript
✅ Supabase client initialized
🚀 Sending password reset email...
📧 Email: member1@gmail.com
✅ Success!
```

**Error:**
```javascript
❌ Error: Invalid redirect URL
❌ Error: Rate limit exceeded
❌ Error: Email not found
```

### Check Network Tab

**Filter:** XHR/Fetch

**Look for:**
```
POST https://gpittnsfzgkdbqnccncn.supabase.co/auth/v1/recover
Status: 200 OK
```

**If 400/500 error:**
- Check request payload
- Check response error message
- Verify Supabase configuration

---

## 📊 Configuration Status

### Before Configuration:
- [ ] Site URL not set
- [ ] Redirect URLs not configured
- [ ] Email template using default
- [ ] SMTP not configured
- [ ] Rate limits default

### After Configuration:
- [ ] Site URL: `http://localhost:5173`
- [ ] Redirect URLs: `/reset-password` added
- [ ] Email template: Custom HTML with branding
- [ ] SMTP: Configured (production) or using default (dev)
- [ ] Rate limits: 5 per hour

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Update Site URL to production domain
- [ ] Update Redirect URLs to production domain
- [ ] Configure custom SMTP (Gmail/SendGrid/AWS SES)
- [ ] Update email template with production branding
- [ ] Test email delivery in production
- [ ] Set appropriate rate limits
- [ ] Monitor auth logs for issues
- [ ] Set up email domain authentication (SPF/DKIM)
- [ ] Test from different email providers (Gmail, Outlook, etc.)
- [ ] Verify emails not going to spam

---

## 📞 Support Resources

**Supabase Documentation:**
- Auth: https://supabase.com/docs/guides/auth
- Email Templates: https://supabase.com/docs/guides/auth/auth-email-templates
- SMTP: https://supabase.com/docs/guides/auth/auth-smtp

**Common Issues:**
- https://supabase.com/docs/guides/auth/troubleshooting

**Community:**
- Discord: https://discord.supabase.com
- GitHub: https://github.com/supabase/supabase

---

**Last Updated**: November 27, 2025
**Project**: Canvango Group
**Supabase Ref**: gpittnsfzgkdbqnccncn

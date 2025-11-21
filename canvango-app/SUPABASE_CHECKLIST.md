# ✅ Supabase Configuration Checklist

## Credentials Setup
- [x] Supabase URL: `https://gpittnsfzgkdbqnccncn.supabase.co`
- [x] Anon Key: Configured in `.env`
- [x] Environment variables added to `canvango-app/frontend/.env`

## Supabase Dashboard Configuration

### 1. Disable Email Confirmation (CRITICAL for Development!)
Go to: [Email Provider Settings](https://app.supabase.com/project/gpittnsfzgkdbqnccncn/auth/providers)

- [ ] Go to **Authentication** → **Providers** → **Email**
- [ ] Scroll to **"Email Confirmation"** section
- [ ] **UNCHECK** "Enable email confirmations"
- [ ] Click **Save**

**Why?** Without this, users can't login after register until they confirm email. For development, we disable this.

### 2. Authentication URL Settings
Go to: [Supabase Dashboard](https://app.supabase.com/project/gpittnsfzgkdbqnccncn/auth/url-configuration)

#### Site URL Configuration
- [ ] Set **Site URL** to: `http://localhost:5173` (for development)
- [ ] For production, update to your production domain

#### Redirect URLs
- [ ] Add redirect URL: `http://localhost:5173/reset-password`
- [ ] For production, add: `https://yourdomain.com/reset-password`

**How to configure:**
1. Login to Supabase Dashboard
2. Select your project: `gpittnsfzgkdbqnccncn`
3. Go to **Authentication** → **URL Configuration**
4. Set **Site URL**: `http://localhost:5173`
5. Under **Redirect URLs**, click "Add URL"
6. Add: `http://localhost:5173/reset-password`
7. Click "Save"

### 2. Email Templates (Optional)
Go to: [Email Templates](https://app.supabase.com/project/gpittnsfzgkdbqnccncn/auth/templates)

- [ ] Review "Reset Password" email template
- [ ] Customize if needed (optional)
- [ ] Ensure link redirects to: `{{ .SiteURL }}/reset-password`

### 3. Email Provider (Optional for Production)
Go to: [SMTP Settings](https://app.supabase.com/project/gpittnsfzgkdbqnccncn/settings/auth)

For development, Supabase's built-in email service is sufficient.

For production:
- [ ] Configure custom SMTP (SendGrid, AWS SES, etc.)
- [ ] Test email delivery

## Testing Checklist

### Prerequisites
- [ ] Frontend development server running: `npm run dev`
- [ ] Backend server running (if needed): `npm run dev`
- [ ] Site URL and Redirect URLs configured in Supabase

### Test Forgot Password Flow
1. [ ] Navigate to `http://localhost:5173/login`
2. [ ] Click "Forgot your password?"
3. [ ] Enter a test email address
4. [ ] Click "Send Reset Link"
5. [ ] Verify success message appears
6. [ ] Check email inbox (and spam folder)
7. [ ] Verify email received from Supabase

### Test Reset Password Flow
1. [ ] Click reset link in email
2. [ ] Verify redirect to `/reset-password`
3. [ ] Verify form appears (not "Invalid or expired reset link")
4. [ ] Enter new password (must meet requirements)
5. [ ] Confirm password matches
6. [ ] Click "Reset Password"
7. [ ] Verify success notification
8. [ ] Verify redirect to `/login`
9. [ ] Login with new password
10. [ ] Verify login successful

## Troubleshooting

### Email not received
- [ ] Check spam/junk folder
- [ ] Verify email address is correct
- [ ] Check Supabase Dashboard → Authentication → Logs for errors
- [ ] Verify SMTP settings (if using custom SMTP)

### "Invalid or expired reset link"
- [ ] Verify Site URL is configured correctly
- [ ] Verify Redirect URL includes `/reset-password`
- [ ] Token expires after 1 hour - request new reset link
- [ ] Check browser console for errors

### "Supabase credentials not found" warning
- [ ] Verify `.env` file exists in `canvango-app/frontend/`
- [ ] Verify variable names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] Restart development server after updating `.env`

## Quick Links

- **Supabase Dashboard**: https://app.supabase.com/project/gpittnsfzgkdbqnccncn
- **URL Configuration**: https://app.supabase.com/project/gpittnsfzgkdbqnccncn/auth/url-configuration
- **Email Templates**: https://app.supabase.com/project/gpittnsfzgkdbqnccncn/auth/templates
- **Auth Logs**: https://app.supabase.com/project/gpittnsfzgkdbqnccncn/auth/logs

## Production Deployment

When deploying to production:

1. [ ] Update Site URL in Supabase to production domain
2. [ ] Add production Redirect URL
3. [ ] Set environment variables in hosting platform:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. [ ] Test forgot/reset password flow in production
5. [ ] Configure custom SMTP for better email deliverability
6. [ ] Monitor email delivery in Supabase logs

## Status

**Current Status:** ✅ Credentials configured, ready for Supabase Dashboard setup

**Next Step:** Configure Site URL and Redirect URLs in Supabase Dashboard (see section 1 above)

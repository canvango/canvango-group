# 📧 Custom Email SMTP Setup - canvango.com

## 🎯 Goal

Setup email pengirim dari domain sendiri:
```
From: Canvango Group <noreply@canvango.com>
```

Bukan dari:
```
From: noreply@mail.app.supabase.io
```

---

## 📊 Pilihan SMTP Provider

### Option 1: Gmail SMTP (Paling Mudah) ⭐ RECOMMENDED

**Pros:**
- ✅ Gratis
- ✅ Setup cepat (10 menit)
- ✅ Reliable
- ✅ Tidak perlu DNS configuration

**Cons:**
- ⚠️ Email akan dari Gmail (bukan @canvango.com)
- ⚠️ Limit: 500 email/hari

**Best for:** Development & Testing

---

### Option 2: Google Workspace (Professional) ⭐⭐ BEST

**Pros:**
- ✅ Email dari @canvango.com
- ✅ Professional
- ✅ Reliable (99.9% uptime)
- ✅ Limit: 2000 email/hari

**Cons:**
- 💰 Biaya: $6/user/bulan
- ⚙️ Perlu setup domain

**Best for:** Production (Recommended)

---

### Option 3: SendGrid (Email Service) ⭐⭐⭐

**Pros:**
- ✅ Email dari @canvango.com
- ✅ Free tier: 100 email/hari
- ✅ Paid: 40,000 email/bulan ($19.95)
- ✅ Analytics & tracking
- ✅ High deliverability

**Cons:**
- ⚙️ Perlu DNS configuration (SPF, DKIM)
- 📚 Setup lebih kompleks

**Best for:** Production dengan volume tinggi

---

### Option 4: AWS SES (Amazon) ⭐⭐

**Pros:**
- ✅ Sangat murah ($0.10 per 1000 email)
- ✅ Scalable
- ✅ Email dari @canvango.com

**Cons:**
- ⚙️ Setup kompleks
- ⚙️ Perlu AWS account
- ⚙️ Perlu DNS configuration

**Best for:** Enterprise scale

---

## 🚀 Setup Guide - Option 1: Gmail SMTP (Quick Start)

### Step 1: Buat Gmail App Password

1. **Login ke Google Account:**
   ```
   https://myaccount.google.com/
   ```

2. **Enable 2-Step Verification:**
   - Go to: Security → 2-Step Verification
   - Follow setup wizard
   - Enable 2FA

3. **Generate App Password:**
   - Go to: Security → App Passwords
   - Select app: Mail
   - Select device: Other (Custom name)
   - Name: "Canvango Supabase"
   - Click Generate
   - **Copy password** (16 characters, e.g., `abcd efgh ijkl mnop`)

### Step 2: Configure Supabase SMTP

**Go to:** Supabase Dashboard → Project Settings → Auth → SMTP Settings

**Configuration:**
```
Enable Custom SMTP: ✅ ON

SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Password: [paste App Password dari Step 1]

Sender Email: noreply@gmail.com (atau your-email@gmail.com)
Sender Name: Canvango Group
```

### Step 3: Test Email

1. Go to: Authentication → Email Templates → Reset Password
2. Click "Send test email"
3. Check inbox

**Expected Result:**
```
From: Canvango Group <noreply@gmail.com>
Subject: Reset Password - Canvango Group
```

---

## 🚀 Setup Guide - Option 2: Google Workspace (Professional)

### Prerequisites:
- ✅ Google Workspace account ($6/month)
- ✅ Domain canvango.com verified
- ✅ Email account created (e.g., noreply@canvango.com)

### Step 1: Create Email Account

1. **Login to Google Workspace Admin:**
   ```
   https://admin.google.com/
   ```

2. **Create user:**
   - Go to: Users → Add new user
   - Email: noreply@canvango.com
   - Name: Canvango Group
   - Password: [strong password]

3. **Enable 2-Step Verification** (for that user)

4. **Generate App Password** (same as Gmail option)

### Step 2: Configure Supabase SMTP

**Go to:** Supabase Dashboard → Project Settings → Auth → SMTP Settings

**Configuration:**
```
Enable Custom SMTP: ✅ ON

SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: noreply@canvango.com
SMTP Password: [App Password]

Sender Email: noreply@canvango.com
Sender Name: Canvango Group
```

### Step 3: Test Email

**Expected Result:**
```
From: Canvango Group <noreply@canvango.com>
Subject: Reset Password - Canvango Group
```

✅ **Perfect! Email dari domain sendiri**

---

## 🚀 Setup Guide - Option 3: SendGrid (Recommended for Production)

### Step 1: Create SendGrid Account

1. **Sign up:**
   ```
   https://signup.sendgrid.com/
   ```

2. **Verify email**

3. **Choose plan:**
   - Free: 100 emails/day
   - Essentials: $19.95/month (40,000 emails)

### Step 2: Domain Authentication (DNS Setup)

1. **Go to:** Settings → Sender Authentication → Authenticate Your Domain

2. **Enter domain:** canvango.com

3. **Copy DNS records** (SendGrid will provide):
   ```
   Type: CNAME
   Host: em1234.canvango.com
   Value: u1234567.wl123.sendgrid.net
   
   Type: CNAME
   Host: s1._domainkey.canvango.com
   Value: s1.domainkey.u1234567.wl123.sendgrid.net
   
   Type: CNAME
   Host: s2._domainkey.canvango.com
   Value: s2.domainkey.u1234567.wl123.sendgrid.net
   ```

4. **Add DNS records** di domain registrar Anda (e.g., Cloudflare, GoDaddy)

5. **Verify domain** (klik Verify di SendGrid)

### Step 3: Create API Key

1. **Go to:** Settings → API Keys → Create API Key

2. **Name:** Canvango Supabase

3. **Permissions:** Full Access (atau Mail Send saja)

4. **Copy API Key** (starts with `SG.`)

### Step 4: Configure Supabase SMTP

**Go to:** Supabase Dashboard → Project Settings → Auth → SMTP Settings

**Configuration:**
```
Enable Custom SMTP: ✅ ON

SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: [paste SendGrid API Key]

Sender Email: noreply@canvango.com
Sender Name: Canvango Group
```

### Step 5: Test Email

**Expected Result:**
```
From: Canvango Group <noreply@canvango.com>
Subject: Reset Password - Canvango Group
```

✅ **Professional email dengan high deliverability**

---

## 🚀 Setup Guide - Option 4: AWS SES

### Step 1: Create AWS Account

1. **Sign up:** https://aws.amazon.com/

2. **Go to:** SES (Simple Email Service)

3. **Verify domain:** canvango.com

4. **Add DNS records** (SPF, DKIM, DMARC)

### Step 2: Create SMTP Credentials

1. **Go to:** SES → SMTP Settings → Create SMTP Credentials

2. **Copy:**
   - SMTP Username
   - SMTP Password

### Step 3: Configure Supabase SMTP

**Configuration:**
```
Enable Custom SMTP: ✅ ON

SMTP Host: email-smtp.us-east-1.amazonaws.com
SMTP Port: 587
SMTP User: [SMTP Username]
SMTP Password: [SMTP Password]

Sender Email: noreply@canvango.com
Sender Name: Canvango Group
```

---

## 📊 Comparison Table

| Provider | Cost | Setup Time | Email From | Deliverability | Limit |
|----------|------|------------|------------|----------------|-------|
| **Gmail** | Free | 10 min | @gmail.com | Good | 500/day |
| **Google Workspace** | $6/mo | 20 min | @canvango.com | Excellent | 2000/day |
| **SendGrid** | Free-$20/mo | 30 min | @canvango.com | Excellent | 100-40k/mo |
| **AWS SES** | $0.10/1000 | 45 min | @canvango.com | Excellent | Unlimited |

---

## 🎯 Recommendation untuk Canvango

### For Development/Testing:
**Use: Gmail SMTP**
- Quick setup (10 minutes)
- Free
- Good enough for testing

### For Production:
**Use: Google Workspace** ⭐ BEST CHOICE
- Professional email (@canvango.com)
- Easy to manage
- Reliable
- Worth the $6/month

**Alternative: SendGrid**
- If you need more than 2000 emails/day
- If you want email analytics
- Free tier available

---

## 📧 Email Template Configuration

After SMTP setup, update email template:

**Go to:** Supabase Dashboard → Authentication → Email Templates → Reset Password

**Subject:**
```
Reset Password - Canvango Group
```

**Body:**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #5271ff 0%, #4160dd 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0;">Canvango Group</h1>
  </div>
  
  <div style="padding: 30px; background: #f9f9f9;">
    <h2 style="color: #333;">Reset Password Anda</h2>
    
    <p style="color: #666; line-height: 1.6;">
      Halo,<br><br>
      Kami menerima permintaan untuk reset password akun Anda di Canvango Group.
    </p>
    
    <p style="color: #666; line-height: 1.6;">
      Klik tombol di bawah ini untuk membuat password baru:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
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
    </div>
    
    <p style="color: #666; font-size: 14px; line-height: 1.6;">
      Atau copy dan paste link berikut ke browser Anda:
    </p>
    <p style="word-break: break-all; color: #5271ff; font-size: 13px;">
      {{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery
    </p>
    
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
    
    <p style="color: #999; font-size: 13px; line-height: 1.6;">
      <strong>⚠️ Penting:</strong><br>
      • Link ini akan kadaluarsa dalam <strong>1 jam</strong><br>
      • Jika Anda tidak meminta reset password, abaikan email ini<br>
      • Jangan bagikan link ini kepada siapapun
    </p>
  </div>
  
  <div style="padding: 20px; text-align: center; background: #333; color: #999; font-size: 12px;">
    <p style="margin: 0;">
      © 2025 Canvango Group. All rights reserved.<br>
      <a href="https://www.canvango.com" style="color: #5271ff;">www.canvango.com</a>
    </p>
  </div>
</div>
```

---

## ✅ Quick Start Checklist

### For Gmail (Quick - 10 minutes):
- [ ] Enable 2-Step Verification di Google Account
- [ ] Generate App Password
- [ ] Configure Supabase SMTP dengan Gmail settings
- [ ] Test email
- [ ] Update email template

### For Google Workspace (Professional - 20 minutes):
- [ ] Subscribe to Google Workspace ($6/month)
- [ ] Create noreply@canvango.com account
- [ ] Enable 2-Step Verification
- [ ] Generate App Password
- [ ] Configure Supabase SMTP
- [ ] Test email
- [ ] Update email template

### For SendGrid (Advanced - 30 minutes):
- [ ] Create SendGrid account
- [ ] Authenticate domain (add DNS records)
- [ ] Create API Key
- [ ] Configure Supabase SMTP
- [ ] Test email
- [ ] Update email template

---

## 🧪 Testing

After SMTP configuration:

1. **Test via Supabase Dashboard:**
   - Go to: Authentication → Email Templates
   - Click "Send test email"
   - Enter your email
   - Check inbox

2. **Test via App:**
   ```bash
   npm run dev
   # Go to: http://localhost:5173/forgot-password
   # Enter: member1@gmail.com
   # Check email
   ```

3. **Verify:**
   - [ ] Email received
   - [ ] From: Canvango Group <noreply@canvango.com>
   - [ ] Not in spam folder
   - [ ] Reset link works
   - [ ] Professional appearance

---

## 🎯 My Recommendation for You

**Start with:** Google Workspace ⭐

**Why:**
1. ✅ Professional email (@canvango.com)
2. ✅ Easy setup (20 minutes)
3. ✅ Reliable (99.9% uptime)
4. ✅ Good deliverability
5. ✅ Worth $6/month for professional image
6. ✅ Can use for other business emails too

**Steps:**
1. Subscribe to Google Workspace
2. Add domain: canvango.com
3. Create email: noreply@canvango.com
4. Follow setup guide above
5. Test and verify

**Alternative if budget concern:**
- Start with Gmail (free) for testing
- Upgrade to Google Workspace when ready for production

---

## 📞 Need Help?

**Google Workspace Support:**
- https://support.google.com/a/

**SendGrid Support:**
- https://docs.sendgrid.com/

**AWS SES Support:**
- https://docs.aws.amazon.com/ses/

---

**Created:** November 27, 2025  
**Domain:** canvango.com  
**Purpose:** Professional email setup for password reset  
**Status:** Ready to implement

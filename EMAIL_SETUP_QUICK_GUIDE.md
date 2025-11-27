# 📧 Email Setup - Quick Reference Card

## 🎯 Goal
Email dari: **Canvango Group <noreply@canvango.com>**

---

## ⚡ Quick Decision

### Pilih Salah Satu:

#### 1️⃣ Gmail (Gratis - 10 menit) 
**Email dari:** noreply@gmail.com  
**Best for:** Testing  
**Setup:** CUSTOM_EMAIL_SMTP_SETUP.md → Option 1

#### 2️⃣ Google Workspace ($6/bulan - 20 menit) ⭐ RECOMMENDED
**Email dari:** noreply@canvango.com  
**Best for:** Production  
**Setup:** CUSTOM_EMAIL_SMTP_SETUP.md → Option 2

#### 3️⃣ SendGrid (Gratis/Paid - 30 menit)
**Email dari:** noreply@canvango.com  
**Best for:** High volume  
**Setup:** CUSTOM_EMAIL_SMTP_SETUP.md → Option 3

---

## 🚀 Quick Setup - Google Workspace (Recommended)

### Step 1: Subscribe (5 min)
```
1. Go to: https://workspace.google.com/
2. Choose plan: Business Starter ($6/month)
3. Add domain: canvango.com
4. Verify domain ownership
```

### Step 2: Create Email (3 min)
```
1. Go to: https://admin.google.com/
2. Users → Add new user
3. Email: noreply@canvango.com
4. Name: Canvango Group
5. Set password
```

### Step 3: Generate App Password (5 min)
```
1. Login as noreply@canvango.com
2. Go to: https://myaccount.google.com/security
3. Enable 2-Step Verification
4. Go to: App Passwords
5. Generate for "Mail" → "Other (Canvango Supabase)"
6. Copy 16-character password
```

### Step 4: Configure Supabase (5 min)
```
1. Go to: Supabase Dashboard → Project Settings → Auth → SMTP
2. Enable Custom SMTP: ON
3. Fill:
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: noreply@canvango.com
   SMTP Password: [paste App Password]
   Sender Email: noreply@canvango.com
   Sender Name: Canvango Group
4. Save
```

### Step 5: Test (2 min)
```
1. Go to: Authentication → Email Templates
2. Click "Send test email"
3. Check inbox
4. Verify: From: Canvango Group <noreply@canvango.com>
```

**Total Time:** 20 minutes  
**Cost:** $6/month  
**Result:** Professional email ✅

---

## 📊 Comparison

| Option | Email From | Cost | Time | Professional |
|--------|------------|------|------|--------------|
| Gmail | @gmail.com | Free | 10m | ⭐⭐ |
| Google Workspace | @canvango.com | $6/mo | 20m | ⭐⭐⭐⭐⭐ |
| SendGrid | @canvango.com | Free-$20 | 30m | ⭐⭐⭐⭐ |

---

## ✅ After Setup

**Email akan terlihat seperti ini:**

```
From: Canvango Group <noreply@canvango.com>
To: member1@gmail.com
Subject: Reset Password - Canvango Group

[Professional email template with Canvango branding]
```

**Bukan lagi:**
```
From: noreply@mail.app.supabase.io
```

---

## 🎯 My Recommendation

**Use: Google Workspace**

**Why:**
- ✅ Email dari domain sendiri (@canvango.com)
- ✅ Professional image
- ✅ Easy setup
- ✅ Reliable
- ✅ Worth $6/month

**When:**
- Before production launch
- When ready to go professional

**Alternative:**
- Use Gmail for testing now
- Upgrade to Google Workspace later

---

**Full Guide:** CUSTOM_EMAIL_SMTP_SETUP.md  
**Created:** November 27, 2025

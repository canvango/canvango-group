# 🚀 Quick Start - Tripay Admin Settings

## ✅ Status: READY TO USE

**Merchant:** T47159 (Production)
**Mode:** Production
**Deployment:** ✅ Complete

---

## 📍 Akses Admin Settings

**URL:** https://canvango.com/admin/settings

**Login:** Admin account

**Section:** "Tripay Payment Gateway"

---

## 🔑 Credentials Anda

### Merchant Code
```
T47159
```

### API Key
```
LYIV2DddSP0DnEaxiMyAYleC3EKAFdaIYalrB2Wd
```

### Private Key
```
BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz
```

### Callback URL
```
https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback
```

**⚠️ Callback URL ini harus dikonfigurasi di Tripay Dashboard!**

---

## 🎯 Cara Edit Credentials

### Step 1: Buka Admin Settings
```
https://canvango.com/admin/settings
```

### Step 2: Scroll ke "Tripay Payment Gateway"

### Step 3: Edit Field yang Perlu Diubah
- Merchant Code
- API Key
- Private Key

### Step 4: Klik "Save Settings"

### Step 5: Selesai!
Tidak perlu redeploy, credentials langsung aktif.

---

## 🧪 Test Payment

### Step 1: Login sebagai Member

### Step 2: Buka Top-Up
```
https://canvango.com/top-up
```

### Step 3: Isi Amount
```
Rp 10.000
```

### Step 4: Pilih Payment Method
```
QRIS
```

### Step 5: Klik "Bayar Sekarang"

### Step 6: Verify
- Redirect ke Tripay checkout ✅
- No errors in console ✅
- Payment created ✅

---

## 📊 Check Status

### Database
```sql
SELECT tripay_config FROM system_settings;
```

### Edge Function Logs
```bash
npx supabase functions logs tripay-create-payment --tail
```

### Recent Payments
```sql
SELECT * FROM transactions 
WHERE transaction_type = 'topup' 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🔧 Tripay Dashboard Setup

### Step 1: Login
```
https://tripay.co.id/member
```

### Step 2: Merchant Settings

### Step 3: Set Callback URL
```
https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback
```

### Step 4: Enable Callback
Enable untuk semua payment methods

### Step 5: Save

---

## 🐛 Quick Troubleshooting

### Payment Error: "Invalid API Key"
**Fix:** Verify merchant T47159 approved di Tripay dashboard

### Credentials Tidak Tersimpan
**Fix:** Check admin logged in, clear cache, try again

### Payment Tidak Redirect
**Fix:** Check browser console, verify Edge Function logs

---

## 📞 Support Contacts

### Tripay Support
- **Email:** support@tripay.co.id
- **Dashboard:** https://tripay.co.id/member
- **Merchant:** T47159

### Edge Function Logs
```bash
npx supabase functions logs tripay-create-payment
```

### Database Check
```sql
SELECT * FROM system_settings;
```

---

## ✅ Checklist

- [ ] Vercel deployment selesai
- [ ] Admin settings accessible
- [ ] Credentials terlihat di UI
- [ ] Bisa edit & save credentials
- [ ] Test payment berhasil
- [ ] Callback URL configured di Tripay
- [ ] Merchant T47159 approved

---

## 🎉 Done!

Tripay admin settings sudah siap digunakan!

**Edit credentials kapan saja di:**
https://canvango.com/admin/settings

**No redeploy needed!** ✅


# 📧 Template Email untuk Tripay Support

## 🎯 Tujuan
Request sandbox API credentials untuk testing sementara merchant masih dalam review.

---

## 📝 Template Email/Ticket

### Subject:
```
Request Sandbox API Credentials - Merchant T32769 Under Review
```

### Message:
```
Halo Tripay Team,

Saya sedang mengintegrasikan Tripay Payment Gateway ke aplikasi saya (canvango.com).

Merchant saya dengan kode T32769 saat ini masih dalam proses review/approval.

Untuk mempercepat development dan testing, saya mohon bantuan untuk mendapatkan 
sandbox API credentials agar saya bisa melakukan testing terlebih dahulu.

Detail Aplikasi:
- Domain: canvango.com
- Merchant Code: T32769 (under review)
- Callback URL: https://canvango.com/api/tripay-callback
- Purpose: Top-up saldo member

Yang saya butuhkan:
1. Sandbox API Key
2. Sandbox Private Key
3. Sandbox Merchant Code
4. Panduan testing di sandbox environment

Terima kasih atas bantuannya!

Best regards,
[Nama Anda]
[Email Anda]
```

---

## 🔗 Cara Submit Ticket

### Step 1: Login ke Dashboard
```
https://tripay.co.id/member
```

### Step 2: Buka Menu Support
```
Dashboard → Support → Create Ticket
atau
Dashboard → Ticket → New Ticket
```

### Step 3: Isi Form
- **Subject:** Request Sandbox API Credentials - Merchant T32769 Under Review
- **Category:** Technical Support / API
- **Priority:** Normal
- **Message:** Copy template di atas

### Step 4: Submit & Wait
- Expected response: 1-2 hari kerja
- Check email untuk notifikasi
- Check dashboard untuk reply

---

## 📞 Alternative: Email Langsung

Jika tidak ada menu ticket, email langsung ke:

**Email:** support@tripay.co.id

**Subject:** Request Sandbox API Credentials - Merchant T32769

**Body:** Copy template di atas

---

## 🎯 Expected Response

Tripay support biasanya akan memberikan:

```
Halo,

Berikut sandbox credentials untuk testing:

API Key: DEV-xxxxxxxxxxxxxxxxxxxxx
Private Key: xxxxx-xxxxx-xxxxx-xxxxx
Merchant Code: SANDBOX

Sandbox URL: https://tripay.co.id/api-sandbox

Untuk testing, gunakan credentials di atas.
Setelah merchant approved, ganti dengan production credentials.

Terima kasih.
```

---

## ✅ Setelah Dapat Credentials

### Update .env

```bash
# Sandbox credentials (for testing)
VITE_TRIPAY_API_KEY=DEV-xxxxxxxxxxxxxxxxxxxxx
VITE_TRIPAY_PRIVATE_KEY=xxxxx-xxxxx-xxxxx-xxxxx
VITE_TRIPAY_MERCHANT_CODE=SANDBOX
VITE_TRIPAY_MODE=sandbox
```

### Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Test Payment Flow

1. Open: http://localhost:5173/top-up
2. Input amount: Rp 10.000
3. Click "Top Up Sekarang"
4. Select payment method
5. Click "Bayar Sekarang"
6. **Should redirect to Tripay checkout** ✅
7. Complete test payment
8. Verify callback received
9. Verify balance updated

---

## 🐛 If Still Error After Getting Credentials

### Error: "Invalid Signature"

**Fix:**
- Verify API Key correct
- Verify Private Key correct
- Check signature generation in `tripay.service.ts`

### Error: "Merchant Not Found"

**Fix:**
- Verify Merchant Code correct
- Use SANDBOX code, not T32769
- Check TRIPAY_MODE=sandbox

### Error: "Callback URL Invalid"

**Fix:**
- Verify callback URL accessible
- Test: https://canvango.com/api/tripay-callback
- Should return 200 OK

### Error: "Amount Too Low"

**Fix:**
- Minimum amount: Rp 10.000
- Check form validation

---

## 📊 Testing Checklist After Getting Credentials

### Basic Testing
- [ ] Create payment succeeds
- [ ] Redirects to Tripay checkout
- [ ] Payment instructions show
- [ ] Can see payment details

### Payment Completion
- [ ] Complete test payment
- [ ] Callback received (check logs)
- [ ] Balance updated in database
- [ ] Transaction status updated to PAID
- [ ] Transaction history shows payment

### Error Handling
- [ ] Expired payment handled
- [ ] Failed payment handled
- [ ] Duplicate payment prevented
- [ ] Invalid signature rejected

---

## 🎯 Timeline Estimate

| Action | Timeline |
|--------|----------|
| Submit ticket | Today |
| Tripay response | 1-2 hari |
| Get credentials | 1-2 hari |
| Testing complete | 1 hari |
| Merchant approval | 1-3 hari |
| Production ready | 3-7 hari total |

---

## 📞 Follow Up

Jika tidak ada response dalam 2 hari:

### Follow Up Email:
```
Subject: Follow Up - Request Sandbox Credentials (Ticket #xxxxx)

Halo Tripay Team,

Saya ingin follow up ticket saya mengenai request sandbox credentials
untuk merchant T32769.

Mohon informasi status request saya.

Terima kasih.
```

### Alternative: Live Chat
- Check if Tripay has live chat
- Usually faster response
- Can explain situation directly

---

## ✅ Summary

**Action Required:**
1. ✅ Login ke Tripay dashboard
2. ✅ Create support ticket
3. ✅ Copy template di atas
4. ✅ Submit ticket
5. ⏳ Wait for response (1-2 days)
6. ✅ Update .env dengan credentials
7. ✅ Test payment flow
8. 🎉 Done!

**While Waiting:**
- Test UI/UX (sudah bisa sekarang)
- Verify responsive design
- Check all user flows
- Prepare for production

---

**Good luck!** 🚀

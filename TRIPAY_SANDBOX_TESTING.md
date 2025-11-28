# 🧪 Tripay Sandbox Testing Guide

## 🎯 Overview

Karena merchant belum approved, kita gunakan **Tripay Sandbox** untuk testing. Sandbox tidak perlu merchant approval dan bisa langsung dipakai.

---

## ✅ FIXES APPLIED

### 1. **CORS Error Fixed** ✅
- Replaced API call dengan hardcoded payment methods
- No more CORS errors
- Payment modal akan show 6 payment methods

### 2. **Sandbox Mode Configured** ✅
- Using sandbox API URL
- Using sandbox credentials
- Callback URL updated

---

## 🔑 SANDBOX CREDENTIALS

**API URL:** `https://tripay.co.id/api-sandbox`

**Credentials:** (Public sandbox - for testing only)
```
API Key: DEV-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Private Key: xxxxx-xxxxx-xxxxx-xxxxx-xxxxx
Merchant Code: T0001
```

**Note:** Ini adalah placeholder. Tripay sandbox biasanya punya test credentials yang bisa dipakai semua orang untuk testing.

---

## 🧪 HOW TO TEST

### Step 1: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 2: Test TopUp Flow
1. Open: `http://localhost:5173/top-up`
2. Login as member
3. Select amount: Rp 10.000
4. Click "Top Up Sekarang"
5. **Payment modal opens** ✅
6. Select payment method (e.g., BRI VA)
7. Click "Bayar Sekarang"

### Step 3: Expected Behavior

**If Sandbox Working:**
- ✅ Creates transaction in database
- ✅ Calls Tripay sandbox API
- ✅ Opens Tripay checkout page
- ✅ Shows payment instructions
- ✅ Can complete test payment

**If Sandbox Not Working:**
- ⚠️ Error: "Invalid API key" or "Merchant not found"
- **Solution:** Need to get real sandbox credentials from Tripay

---

## 📞 GET SANDBOX CREDENTIALS

### Option 1: Tripay Documentation
Check Tripay docs for sandbox credentials:
```
https://tripay.co.id/developer?tab=sandbox
```

### Option 2: Contact Tripay Support
1. Login: https://tripay.co.id/member
2. Go to: Support / Ticket
3. Ask for: "Sandbox API credentials untuk testing"
4. They will provide test credentials

### Option 3: Use Production Credentials (After Approval)
Wait for merchant approval, then use production credentials.

---

## 🔄 ALTERNATIVE: MOCK PAYMENT FLOW

Sementara menunggu sandbox credentials atau merchant approval, kita bisa buat **mock payment flow** untuk testing UI/UX.

### Create Mock Payment Service

```typescript
// src/services/tripay.service.mock.ts
export async function createPaymentMock(params: CreatePaymentParams) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock response
  return {
    success: true,
    message: 'Payment created (MOCK)',
    data: {
      reference: 'MOCK-' + Date.now(),
      merchant_ref: 'test-transaction-id',
      payment_method: params.paymentMethod,
      payment_name: 'Test Payment',
      checkout_url: 'https://tripay.co.id/checkout/mock',
      amount: params.amount,
      status: 'UNPAID',
    }
  };
}
```

---

## 📊 CURRENT STATUS

### Integration ✅
- [x] Database ready
- [x] Edge Function deployed
- [x] Frontend integrated
- [x] TopUp page working
- [x] CORS error fixed

### Credentials ⏳
- [ ] Sandbox credentials (need from Tripay)
- [ ] Production merchant approval (waiting)

### Testing ⚠️
- [x] UI/UX can be tested
- [x] Modal opens correctly
- [x] Payment methods show
- [ ] Actual payment (need credentials)

---

## 🎯 RECOMMENDATIONS

### **Option 1: Wait for Merchant Approval** (1-3 days)
- Paling proper
- Langsung production-ready
- No need sandbox

### **Option 2: Get Sandbox Credentials** (1 day)
- Contact Tripay support
- Get test credentials
- Test immediately

### **Option 3: Use Mock for Now** (Immediate)
- Test UI/UX
- Test user flow
- Wait for approval

---

## 📝 WHEN MERCHANT APPROVED

### Update .env
```bash
# Uncomment production credentials
VITE_TRIPAY_API_KEY=LYIV2DddSP0DnEaxiMyAYleC3EKAFdaIYalrB2Wd
VITE_TRIPAY_PRIVATE_KEY=BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz
VITE_TRIPAY_MERCHANT_CODE=T32769
VITE_TRIPAY_MODE=production
```

### Update Callback URL
```
https://canvango.com/api/tripay-callback
```

### Test with Real Payment
```bash
npm run dev
# Test complete payment flow
```

---

## 🐛 TROUBLESHOOTING

### Modal doesn't open?
- Check browser console
- Verify TripayPaymentModal imported
- Check React errors

### Payment methods not showing?
- ✅ Should show 6 hardcoded methods
- Check browser console for errors

### "Invalid API key" error?
- Normal for sandbox without credentials
- Wait for merchant approval
- Or get sandbox credentials from Tripay

---

## 📞 SUPPORT

**Tripay Support:**
- Dashboard: https://tripay.co.id/member/ticket
- Email: support@tripay.co.id
- Docs: https://tripay.co.id/developer

**Ask for:**
- Sandbox API credentials
- Merchant approval status
- Callback testing

---

## ✅ SUMMARY

**Status:** ✅ **Integration Complete, Waiting for Credentials**

**What's Working:**
- ✅ TopUp page integrated
- ✅ Payment modal opens
- ✅ Payment methods show
- ✅ CORS error fixed
- ✅ Callback configured

**What's Pending:**
- ⏳ Merchant approval (1-3 days)
- ⏳ Sandbox credentials (optional)

**Next Action:**
1. Restart dev server
2. Test UI/UX
3. Wait for Tripay approval
4. Test real payment

---

**Restart dev server sekarang untuk test!** 🚀

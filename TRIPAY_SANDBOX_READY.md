# 🎉 Tripay Sandbox Credentials - READY!

## ✅ Credentials Configured

**Sandbox Merchant:**
- Merchant Code: T47116
- Merchant Name: Merchant Sandbox
- API Key: DEV-V745Csasrrs04BsIYS5dzwbJZ8wLudy5joxBGq1G
- Private Key: BAo71-gUqRM-1ahAp-Gt8AM-1S71q
- Callback URL: https://canvango.com/api/tripay-callback

**Status:** ✅ Configured in `.env`

---

## 🚀 READY TO TEST!

### Step 1: Restart Dev Server

```bash
# Stop current server (Ctrl+C if running)
npm run dev
```

### Step 2: Test Payment Flow

1. **Open:** http://localhost:5173/top-up
2. **Login** as member
3. **Input amount:** Rp 10.000 (atau lebih)
4. **Click:** "Top Up Sekarang"
5. **Modal opens** ✅
6. **Select payment method** (e.g., BRI VA)
7. **Click:** "Bayar Sekarang"

### Step 3: Expected Result

**Should work now!** ✅

- ✅ Creates transaction in database
- ✅ Calls Tripay sandbox API
- ✅ Opens Tripay checkout page in new tab
- ✅ Shows payment instructions
- ✅ Can complete test payment

---

## 🧪 Testing Scenarios

### Test 1: Virtual Account (BRI)

1. Select: BRI Virtual Account
2. Amount: Rp 10.000
3. Click: Bayar Sekarang
4. **Expected:** Redirects to Tripay checkout
5. **Shows:** Virtual Account number
6. **Shows:** Payment instructions

### Test 2: QRIS

1. Select: QRIS
2. Amount: Rp 20.000
3. Click: Bayar Sekarang
4. **Expected:** Redirects to Tripay checkout
5. **Shows:** QR Code
6. **Shows:** Scan instructions

### Test 3: E-Wallet (ShopeePay)

1. Select: ShopeePay
2. Amount: Rp 50.000
3. Click: Bayar Sekarang
4. **Expected:** Redirects to Tripay checkout
5. **Shows:** Payment link
6. **Shows:** Instructions

---

## 🎯 What to Verify

### Frontend
- [ ] Modal opens correctly
- [ ] Payment methods show
- [ ] Can select payment method
- [ ] Fee calculation correct
- [ ] Total amount correct
- [ ] Loading state shows
- [ ] No console errors

### API Call
- [ ] Transaction created in database
- [ ] Tripay API called successfully
- [ ] No "Invalid API key" error
- [ ] No "Invalid signature" error
- [ ] Checkout URL received

### Checkout Page
- [ ] Redirects to Tripay checkout
- [ ] Payment details correct
- [ ] Amount correct
- [ ] Payment instructions show
- [ ] Can see payment code/QR

### Callback (After Payment)
- [ ] Callback received (check logs)
- [ ] Transaction status updated
- [ ] Balance updated
- [ ] Transaction history shows payment

---

## 🐛 Troubleshooting

### Error: "Invalid API Key"

**Check:**
- `.env` file has correct API key
- Dev server restarted after `.env` change
- No typos in API key

**Fix:**
```bash
# Verify .env
cat .env | grep TRIPAY

# Restart server
npm run dev
```

### Error: "Invalid Signature"

**Check:**
- Private key correct in `.env`
- Signature generation using HMAC SHA256
- Merchant code correct

**Fix:**
- Verify all credentials match screenshot
- Check `tripay.service.ts` signature function

### Error: "Merchant Not Found"

**Check:**
- Merchant code: T47116
- Using sandbox mode
- API URL: https://tripay.co.id/api-sandbox

**Fix:**
```bash
# Verify merchant code
VITE_TRIPAY_MERCHANT_CODE=T47116
VITE_TRIPAY_MODE=sandbox
```

### Checkout doesn't open

**Check:**
- Browser popup blocker
- Console for errors
- Network tab for API response

**Fix:**
- Allow popups for localhost
- Check browser console
- Verify API response has checkout_url

---

## 📊 Sandbox Testing Notes

### Sandbox Limitations

1. **Test payments only** - no real money
2. **Instant payment** - can mark as paid immediately
3. **All payment methods available** - even if not activated in production
4. **Callback works** - will receive notifications

### Sandbox vs Production

| Feature | Sandbox | Production |
|---------|---------|------------|
| API URL | api-sandbox | api |
| Merchant | T47116 | T32769 |
| Real money | No | Yes |
| Approval needed | No | Yes |
| All methods | Yes | Based on activation |

---

## 🎯 Next Steps After Testing

### If Sandbox Works ✅

1. **Test all payment methods**
2. **Test callback functionality**
3. **Verify balance updates**
4. **Check transaction history**
5. **Test error scenarios**

### When Production Ready

**Wait for merchant T32769 approval**, then:

1. Update `.env`:
   ```bash
   VITE_TRIPAY_API_KEY=LYIV2DddSP0DnEaxiMyAYleC3EKAFdaIYalrB2Wd
   VITE_TRIPAY_PRIVATE_KEY=BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz
   VITE_TRIPAY_MERCHANT_CODE=T32769
   VITE_TRIPAY_MODE=production
   ```

2. Test with small amount first
3. Verify callback works
4. Go live!

---

## 📞 Support

**If issues persist:**

1. Check Tripay dashboard: https://tripay.co.id/member
2. View transaction logs
3. Check callback logs
4. Contact Tripay support if needed

---

## ✅ Summary

**Status:** 🎉 **READY TO TEST!**

**Credentials:** ✅ Configured

**Next Action:**
1. Restart dev server
2. Test payment flow
3. Verify checkout works
4. Complete test payment
5. Verify callback & balance update

---

**START TESTING NOW!** 🚀

```bash
npm run dev
```

Open: http://localhost:5173/top-up

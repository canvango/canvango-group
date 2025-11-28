# 🚀 TEST SEKARANG!

## ✅ Sandbox Credentials Configured

Credentials dari Tripay sudah dimasukkan ke `.env`:
- Merchant: T47116 (Merchant Sandbox)
- API Key: DEV-V745Csasrrs04BsIYS5dzwbJZ8wLudy5joxBGq1G
- Private Key: BAo71-gUqRM-1ahAp-Gt8AM-1S71q

---

## 🎯 LANGKAH TESTING

### 1. Restart Dev Server

```bash
npm run dev
```

**Penting:** Restart diperlukan agar `.env` changes ter-load.

### 2. Buka TopUp Page

```
http://localhost:5173/top-up
```

### 3. Test Payment Flow

1. **Login** sebagai member
2. **Input:** Rp 10.000
3. **Click:** "Top Up Sekarang"
4. **Modal opens** dengan 6 payment methods
5. **Select:** BRI Virtual Account (atau method lain)
6. **Click:** "Bayar Sekarang"

### 4. Expected Result

**✅ Should work now!**

- Transaction created in database
- Tripay API called successfully
- **New tab opens** dengan Tripay checkout page
- Payment instructions displayed
- Virtual Account number / QR code shown

---

## 🎉 If It Works

**Congratulations!** Integration successful! 🎉

**Next:**
1. Test different payment methods
2. Complete a test payment
3. Verify callback received
4. Check balance updated
5. View transaction history

---

## 🐛 If Error Occurs

### "Invalid API Key"

**Fix:**
```bash
# Verify .env
cat .env | grep TRIPAY

# Should show:
# VITE_TRIPAY_API_KEY=DEV-V745Csasrrs04BsIYS5dzwbJZ8wLudy5joxBGq1G

# Restart server
npm run dev
```

### "Invalid Signature"

**Check:**
- Private key correct: BAo71-gUqRM-1ahAp-Gt8AM-1S71q
- Merchant code correct: T47116
- Signature using HMAC SHA256

### Console Errors

**Check browser console:**
- Press F12
- Go to Console tab
- Look for red errors
- Share error message for help

---

## 📊 What to Check

### Browser Console (F12)
- No "Invalid API key" errors
- No "CORS" errors
- No "Invalid signature" errors
- Should see: "Creating Tripay payment: {...}"

### Network Tab (F12)
- Look for: POST to `tripay.co.id/api-sandbox/transaction/create`
- Status: 200 OK
- Response: `{ success: true, data: {...} }`

### Database
- Check `transactions` table
- Should have new record with status: 'pending'
- Should have `tripay_reference`
- Should have `tripay_checkout_url`

---

## ✅ Success Indicators

**Frontend:**
- ✅ Modal opens
- ✅ Payment methods show
- ✅ Can select method
- ✅ Loading spinner shows
- ✅ New tab opens

**Backend:**
- ✅ Transaction created
- ✅ API call successful
- ✅ Checkout URL received
- ✅ No errors in console

**Tripay Checkout:**
- ✅ Page loads
- ✅ Payment details correct
- ✅ Amount correct
- ✅ Instructions clear
- ✅ Payment code/QR shown

---

## 🎯 After Successful Test

### Test Complete Payment

1. On Tripay checkout page
2. Click "Simulasi Pembayaran" (if available)
3. Or mark as paid in Tripay dashboard
4. Wait for callback
5. Check balance updated
6. Check transaction status: PAID

### Verify Callback

**Check Supabase logs:**
```
Dashboard → Edge Functions → tripay-callback → Logs
```

**Should see:**
- Callback received
- Signature verified
- Transaction updated
- Balance updated

---

## 📞 Need Help?

**Check documentation:**
- `TRIPAY_SANDBOX_READY.md` - Full testing guide
- `TRIPAY_STATUS_FINAL.md` - Complete status
- `START_HERE.md` - Quick start

**Tripay Dashboard:**
- https://tripay.co.id/member
- Check transaction logs
- View callback logs

---

## 🚀 START NOW!

```bash
npm run dev
```

**Then test payment flow!** 🎉

Good luck! 🍀

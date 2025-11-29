# 🚨 CRITICAL: Test Tripay Integration NOW

**Status:** Ready to test  
**Mode:** Production  
**Credentials:** ✅ Configured

---

## ✅ What's Already Working

1. **Database:**
   - ✅ Tripay credentials stored (Production mode)
   - ✅ Merchant Code: T47159
   - ✅ Payment channels synced (6 active channels)

2. **Backend:**
   - ✅ Vercel API route: `/api/tripay-proxy`
   - ✅ Signature generation implemented
   - ✅ Transaction creation logic ready

3. **Frontend:**
   - ✅ Top Up page exists
   - ✅ Payment channel selection ready
   - ✅ Services configured

---

## 🧪 Test Steps (5 minutes)

### Step 1: Check Environment Variables

Verify Vercel has these variables:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Check:** https://vercel.com/your-project/settings/environment-variables

### Step 2: Test Payment Channels API

Open browser console on your site:

```javascript
// Test fetch payment channels
fetch('/api/tripay-proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_USER_TOKEN'
  },
  body: JSON.stringify({
    amount: 50000,
    paymentMethod: 'BRIVA',
    customerName: 'Test User',
    customerEmail: 'test@example.com',
    orderItems: [{
      name: 'Top Up Balance',
      price: 50000,
      quantity: 1
    }]
  })
})
.then(r => r.json())
.then(console.log)
```

### Step 3: Test via UI

1. Login to your site
2. Go to **Top Up** page
3. Select payment method (e.g., BRI Virtual Account)
4. Enter amount: 50,000
5. Click **Bayar Sekarang**

**Expected:**
- ✅ Redirected to Tripay payment page
- ✅ Transaction saved to database
- ✅ Payment instructions shown

---

## 🐛 If Not Working

### Issue 1: CORS Error

**Symptom:** `Access-Control-Allow-Origin` error

**Fix:** Check `api/tripay-proxy.ts` has CORS headers:
```typescript
res.setHeader('Access-Control-Allow-Origin', '*');
```

### Issue 2: 401 Unauthorized

**Symptom:** "Missing authorization" or "Unauthorized"

**Fix:** User must be logged in. Check:
```javascript
// Get user token
const { data: { session } } = await supabase.auth.getSession();
console.log('Token:', session?.access_token);
```

### Issue 3: 500 Server Error

**Symptom:** "Tripay configuration not found"

**Fix:** Verify `system_settings` table has `tripay_config`:
```sql
SELECT tripay_config FROM system_settings LIMIT 1;
```

### Issue 4: Tripay API Error

**Symptom:** Tripay returns error message

**Common Errors:**
- **"Signature invalid"** → Check private key correct
- **"Merchant not found"** → Check merchant code correct
- **"Amount too low"** → Minimum 10,000 IDR
- **"Payment method not available"** → Check channel is active

---

## 📊 Success Criteria

Your integration is working when:

✅ **Payment Channels Load**
- Top Up page shows payment methods
- Icons and names display correctly

✅ **Transaction Creation**
- Can select payment method
- Can enter amount
- Click "Bayar" creates transaction

✅ **Redirect to Payment**
- Redirects to Tripay checkout page
- Shows payment instructions
- Shows virtual account number or QR code

✅ **Database Updated**
- Transaction saved with status "pending"
- Tripay reference stored
- Payment URL stored

---

## 🔍 Debug Checklist

If something fails, check:

- [ ] User is logged in
- [ ] Vercel environment variables set
- [ ] Tripay credentials correct in database
- [ ] Payment channels synced
- [ ] Amount >= 10,000 IDR
- [ ] Network tab shows API call
- [ ] Console shows no errors
- [ ] Vercel logs show no errors

---

## 📝 Test Report

After testing, document:

**Test Date:** ___________

**Test Results:**
- [ ] Payment channels load: ✅ / ❌
- [ ] Can select payment method: ✅ / ❌
- [ ] Can create transaction: ✅ / ❌
- [ ] Redirects to payment page: ✅ / ❌
- [ ] Transaction saved to DB: ✅ / ❌

**Errors Encountered:**
```
(paste error messages here)
```

**Screenshots:**
- [ ] Top Up page
- [ ] Payment selection
- [ ] Tripay payment page

---

## 🚀 Next Steps After Success

Once working:

1. **Test Multiple Payment Methods**
   - BRI VA
   - BCA VA
   - QRIS
   - etc.

2. **Test Callback**
   - Make actual payment (small amount)
   - Verify callback updates status
   - Check balance updated

3. **Optimize (Optional)**
   - Migrate to Cloudflare Worker for better performance
   - Add error handling
   - Add loading states

---

## 💡 Quick Fixes

### Fix 1: Update Vercel Environment Variables

```bash
# Via Vercel CLI
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Or via Dashboard
# https://vercel.com/your-project/settings/environment-variables
```

### Fix 2: Redeploy Vercel

```bash
vercel --prod
```

### Fix 3: Check Vercel Logs

```bash
vercel logs
```

---

**Priority:** 🔴 CRITICAL  
**Estimated Time:** 5-10 minutes  
**Difficulty:** Easy 🟢

**START TESTING NOW!** 🚀

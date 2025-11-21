# Testing Guide - Balance 404 Fix

## 🎯 What to Test
Verify bahwa balance user sekarang muncul dengan benar di PurchaseModal

## ✅ Pre-requisites
- Backend server running di port 3000 ✓
- Frontend running di port 5174 ✓
- User member1 dengan balance Rp 2.000.000 ✓

## 📋 Test Steps

### Test 1: Login dan Check Balance
1. Buka browser: http://localhost:5174
2. Login dengan:
   - Username: `member1`
   - Password: `password123`
3. Verify di Dashboard bahwa balance muncul: **Rp 2.000.000**

### Test 2: Open Purchase Modal
1. Navigate ke halaman **BM Accounts** atau **Personal Accounts**
2. Klik tombol **"Beli"** pada produk yang tersedia (contoh: BM50 Standard)
3. **Expected Result:**
   - Modal terbuka
   - Saldo Anda menampilkan: **Rp 2.000.000** (bukan Rp 0)
   - Total Pembayaran menampilkan harga produk
   - Tombol "Konfirmasi Pembelian" ENABLED (bukan disabled)

### Test 3: Complete Purchase
1. Di PurchaseModal, adjust quantity jika perlu
2. Klik **"✓ Konfirmasi Pembelian"**
3. **Expected Result:**
   - Purchase berhasil
   - Balance berkurang sesuai harga
   - Produk masuk ke Transaction History
   - Account details tersedia

## 🔍 Debug Checklist

### If Balance Still Shows Rp 0:
1. Open Browser DevTools (F12)
2. Go to **Network** tab
3. Look for request to `/api/user/profile`
4. Check:
   - Status Code: Should be **200 OK** (not 404)
   - Response body: Should contain `balance: 2000000`

### If 404 Still Occurs:
1. Check backend logs for errors
2. Verify routes are loaded:
   ```bash
   # Should see both:
   # - /api/users/me
   # - /api/user/profile
   ```
3. Restart backend if needed

### Check Console Logs:
Look for these debug messages in browser console:
```
🔍 PurchaseModal opened, checking userProfile: {...}
💰 PurchaseModal Debug: {
  userBalance: 2000000,
  productPrice: 100000,
  isInsufficientBalance: false
}
```

## 📊 Expected vs Actual

### Before Fix:
- ❌ GET /api/user/profile → 404 Not Found
- ❌ Balance shows: Rp 0
- ❌ Button disabled: "Saldo Anda tidak mencukupi"

### After Fix:
- ✅ GET /api/user/profile → 200 OK
- ✅ Balance shows: Rp 2.000.000
- ✅ Button enabled: "✓ Konfirmasi Pembelian"
- ✅ Purchase can be completed

## 🐛 Known Issues to Watch
1. **Snake_case vs camelCase**: Already fixed with transformer
2. **String vs Number balance**: Already fixed with parseFloat
3. **RLS Policy**: Already fixed for stock query
4. **Auth token**: Should be automatically included by apiClient

## 📝 Files Changed
- `server/src/routes/user.routes.ts` - Added /profile routes
- `server/src/index.ts` - Added /user mount point

## 🚀 Next Actions After Testing
If test passes:
1. ✅ Mark balance issue as RESOLVED
2. ✅ Test complete purchase flow
3. ✅ Verify transaction history updates
4. ✅ Ready for deployment

If test fails:
1. Check browser console for errors
2. Check backend logs
3. Verify auth token is being sent
4. Check network request/response

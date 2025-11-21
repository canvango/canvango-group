# Quick Test: Claim Warranty Unknown Product Fix

## 🎯 Tujuan
Memverifikasi bahwa dropdown "Pilih Akun" di halaman Claim Warranty menampilkan nama produk dengan benar, bukan "Unknown Product".

## ✅ Yang Sudah Dilakukan

### 1. Database Verification
```sql
-- ✅ Semua 28 purchases memiliki product_name di account_details
SELECT COUNT(*) FROM purchases 
WHERE status = 'active' 
  AND warranty_expires_at > NOW()
  AND (account_details->>'product_name') IS NOT NULL;
-- Result: 28
```

### 2. Frontend Fix
**File:** `src/features/member-area/components/warranty/ClaimSubmissionSection.tsx`

**Perubahan:**
- ✅ Prioritas fallback chain diubah
- ✅ `account_details.product_name` sekarang menjadi prioritas utama
- ✅ Support untuk `accountDetails.atas` sebagai fallback email
- ✅ No TypeScript errors

**Before:**
```tsx
const productName = 
  account.products?.product_name ||      // JOIN (tidak reliable)
  accountDetails.product_name ||         // account_details
  'Unknown Product';
```

**After:**
```tsx
const productName = 
  accountDetails.product_name ||         // account_details (PRIORITY) ✅
  account.products?.product_name ||      // JOIN (fallback)
  'Unknown Product';
```

## 🚀 Testing Steps

### Step 1: Rebuild Frontend
```bash
npm run build
```

**Expected Output:**
```
✓ built in XXs
dist/index.html
dist/assets/...
```

### Step 2: Restart Server
```bash
# Option 1: PM2
pm2 restart canvango-app

# Option 2: npm
npm run dev
```

### Step 3: Clear Browser Cache
- Hard refresh: `Ctrl + Shift + R` (Windows)
- Atau: DevTools → Network → Disable cache

### Step 4: Login & Navigate
1. Login sebagai user dengan akun garansi aktif
   - Email: `member1@gmail.com` (atau user lain yang punya purchases)
2. Navigate ke: `/claim-garansi`

### Step 5: Verify Dropdown

**Klik dropdown "Pilih Akun"**

**✅ EXPECTED (CORRECT):**
```
BM Account - Limit 250 - user@email.com (Garansi: 18 Des 2025)
BM Account - Limit 1000 - #db443527 (Garansi: 19 Des 2025)
BM Verified - Basic - aaaaaaab (Garansi: 19 Des 2025)
```

**❌ NOT EXPECTED (WRONG):**
```
Unknown Product - #fd160d68 (Garansi: N/A)
Unknown Product - #db443527 (Garansi: N/A)
Unknown Product - #c6330170 (Garansi: N/A)
```

### Step 6: Verify Info Box

**Select salah satu akun dari dropdown**

**✅ EXPECTED:**
```
┌─────────────────────────────────────────────────────────────┐
│ BM Account - Limit 250                                      │
│ user@email.com                                              │
│ Dibeli: 18 Nov 2025 • Garansi hingga: 18 Des 2025         │
└─────────────────────────────────────────────────────────────┘
```

**❌ NOT EXPECTED:**
```
┌─────────────────────────────────────────────────────────────┐
│ Unknown Product                                             │
│ #fd160d68                                                   │
│ Dibeli: 18 Nov 2025 • Garansi hingga: N/A                 │
└─────────────────────────────────────────────────────────────┘
```

## 🔍 Debugging (Jika Masih Bermasalah)

### Check 1: Browser Console
```javascript
// Buka DevTools → Console
// Cari error atau warning
```

### Check 2: Network Tab
```
1. DevTools → Network
2. Filter: "eligible-accounts"
3. Click request
4. Preview tab
5. Expand response → data → accounts → [0]
6. Check: account_details.product_name
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "accounts": [
      {
        "id": "fd160d68-...",
        "product_id": "6a420391-...",
        "account_details": {
          "product_name": "BM Account - Limit 250"  ← Should exist
        },
        "warranty_expires_at": "2025-12-18T04:55:59.317376+00:00",
        "products": {
          "product_name": "BM Account - Limit 250"  ← May or may not exist
        }
      }
    ]
  }
}
```

### Check 3: Backend Logs
```bash
# Look for these logs in server console:
📦 Purchases found: 28
📋 Product data check: {
  hasProducts: true/false,
  productNameFromJoin: "BM Account - Limit 250" or undefined,
  productNameFromDetails: "BM Account - Limit 250",  ← Should have value
  accountDetails: { product_name: "..." },
  productType: "object"
}
```

### Check 4: Database Direct Query
```sql
SELECT 
  id,
  product_id,
  account_details->>'product_name' as product_name,
  warranty_expires_at
FROM purchases
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'member1@gmail.com')
  AND status = 'active'
  AND warranty_expires_at > NOW()
LIMIT 5;
```

**Expected Result:**
```
id          | product_id | product_name              | warranty_expires_at
------------|------------|---------------------------|--------------------
fd160d68... | 6a420391...| BM Account - Limit 250    | 2025-12-18 04:55:59
db443527... | 3da4ecb4...| BM Account - Limit 1000   | 2025-12-19 03:54:18
```

## 📋 Test Checklist

### Frontend
- [ ] Rebuild completed without errors
- [ ] Server restarted successfully
- [ ] Browser cache cleared
- [ ] Login successful
- [ ] Navigate to `/claim-garansi` successful

### Dropdown Display
- [ ] Dropdown shows product names (NOT "Unknown Product")
- [ ] Dropdown shows email/identifier
- [ ] Dropdown shows warranty dates (NOT "N/A")
- [ ] Format: `{Product Name} - {Email/ID} (Garansi: {Date})`

### Info Box
- [ ] Info box appears after selecting account
- [ ] Product name displayed correctly
- [ ] Email/identifier displayed correctly
- [ ] Purchase date displayed correctly
- [ ] Warranty expiry date displayed correctly

### Different Account Types
- [ ] BM Account dengan email: Shows email
- [ ] BM Verified dengan 'atas': Shows 'atas' value
- [ ] Account tanpa email: Shows ID (first 8 chars)

## ✅ Success Criteria

**ALL of these must be TRUE:**
1. ✅ No "Unknown Product" in dropdown
2. ✅ Product names display correctly
3. ✅ Warranty dates display correctly (not "N/A")
4. ✅ Info box shows correct details
5. ✅ No console errors
6. ✅ No network errors

## 🐛 Common Issues & Solutions

### Issue 1: Masih "Unknown Product"
**Cause:** Browser cache belum clear
**Solution:** Hard refresh (`Ctrl + Shift + R`)

### Issue 2: Dropdown kosong
**Cause:** User tidak punya akun dengan garansi aktif
**Solution:** Test dengan user lain atau buat purchase baru

### Issue 3: "Garansi: N/A"
**Cause:** `warranty_expires_at` null atau invalid
**Solution:** Check database, update warranty_expires_at

### Issue 4: Network error
**Cause:** Server belum restart atau backend error
**Solution:** Check server logs, restart server

## 📊 Expected vs Actual

### Test Result Template
```
Date: ___________
Tester: ___________
Browser: ___________

✅ / ❌  Dropdown shows product names
✅ / ❌  Dropdown shows email/ID
✅ / ❌  Dropdown shows warranty dates
✅ / ❌  Info box displays correctly
✅ / ❌  No "Unknown Product"
✅ / ❌  No console errors

Notes:
_________________________________
_________________________________
```

## 🎯 Next Steps

### If Test PASSES ✅
1. Mark as RESOLVED
2. Update documentation
3. Deploy to production
4. Monitor user feedback

### If Test FAILS ❌
1. Check debugging steps above
2. Review backend logs
3. Check database data
4. Review frontend console
5. Contact developer if needed

## 📚 Related Documentation

- `CLAIM_WARRANTY_UNKNOWN_PRODUCT_FIX.md` - Detailed fix documentation
- `UNKNOWN_PRODUCT_FIX_COMPLETE.md` - Backend fix
- `QUICK_REFERENCE_CLAIM_DROPDOWN.md` - User guide

---

**Status:** 🟡 READY FOR TESTING
**Priority:** HIGH
**Estimated Test Time:** 5-10 minutes

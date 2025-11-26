# Testing Guide: Claim Limit Feature

## 🎯 Objective
Verify bahwa setiap produk hanya bisa di-claim **1 kali** dan UI menampilkan empty state yang bagus ketika tidak ada produk yang bisa di-claim.

## 🧪 Test Scenarios

### Scenario 1: Normal Flow - Ada Produk yang Bisa Di-claim

**Steps:**
1. Login ke aplikasi sebagai user yang memiliki produk dengan garansi aktif
2. Navigate ke `/claim-garansi`
3. Verify dropdown "Pilih Akun" menampilkan produk

**Expected Result:**
```
✅ Dropdown menampilkan produk dengan format:
   "Product Name - Email (Garansi: DD/MM/YYYY)"
✅ Form claim dapat diisi
✅ Button "Ajukan Claim" enabled
```

**Screenshot Location:**
- Dropdown dengan produk eligible
- Form claim lengkap

---

### Scenario 2: Submit Claim Pertama Kali

**Steps:**
1. Pilih produk dari dropdown
2. Pilih alasan claim (e.g., "Akun tidak bisa login")
3. Isi deskripsi masalah (min 10 karakter)
4. (Optional) Upload screenshot
5. Click "Ajukan Claim"

**Expected Result:**
```
✅ Loading state muncul
✅ Success toast: "Klaim garansi berhasil diajukan!"
✅ Form di-reset
✅ Produk yang baru di-claim HILANG dari dropdown
```

**Verify in Database:**
```sql
SELECT * FROM warranty_claims 
WHERE purchase_id = 'PURCHASE_ID_YANG_BARU_DI_CLAIM'
ORDER BY created_at DESC LIMIT 1;
```

---

### Scenario 3: Produk Sudah Di-claim - Tidak Muncul di Dropdown

**Steps:**
1. Setelah submit claim (Scenario 2)
2. Refresh page `/claim-garansi`
3. Check dropdown "Pilih Akun"

**Expected Result:**
```
✅ Produk yang sudah di-claim TIDAK muncul di dropdown
✅ Hanya produk yang belum di-claim yang muncul
✅ Jika ada produk lain yang eligible, masih bisa di-claim
```

**Verify in Service:**
```typescript
// fetchEligibleAccounts() should exclude claimed purchases
const claimedIds = await getClaimedPurchaseIds(user.id);
// Products with these IDs should NOT appear in dropdown
```

---

### Scenario 4: Empty State - Semua Produk Sudah Di-claim

**Steps:**
1. Claim semua produk yang memiliki garansi aktif
2. Refresh page `/claim-garansi`
3. Observe UI

**Expected Result:**
```
✅ Empty state muncul dengan design:
   ┌─────────────────────────────────────┐
   │         🛡️ (Shield Icon)           │
   │         (Blue background)           │
   │                                     │
   │  Tidak ada akun yang dapat         │
   │  di-claim                           │
   │                                     │
   │  Semua akun Anda sudah melewati    │
   │  masa garansi, tidak memiliki      │
   │  garansi, atau sudah pernah        │
   │  di-claim.                          │
   └─────────────────────────────────────┘

✅ Form claim TIDAK ditampilkan
✅ Hanya empty state yang terlihat
```

**Visual Checklist:**
- [ ] Icon shield berwarna biru (`text-blue-500`)
- [ ] Background icon: `bg-blue-50 rounded-full`
- [ ] Container: `rounded-3xl border border-gray-200`
- [ ] Title: `text-xl font-semibold`
- [ ] Description: `text-sm text-gray-600`
- [ ] Center aligned
- [ ] Max-width untuk readability

---

### Scenario 5: Try Duplicate Claim (API Level)

**Steps:**
1. Buka browser console
2. Get purchase_id yang sudah di-claim
3. Try submit claim lagi via API call

**Test Code:**
```javascript
// In browser console
const { data, error } = await supabase
  .from('warranty_claims')
  .insert({
    user_id: 'USER_ID',
    purchase_id: 'ALREADY_CLAIMED_PURCHASE_ID',
    claim_type: 'replacement',
    reason: 'test',
    status: 'pending'
  });

console.log('Error:', error);
```

**Expected Result:**
```
✅ Error muncul dengan message:
   "duplicate key value violates unique constraint 
    'warranty_claims_purchase_id_unique'"
✅ Insert GAGAL
✅ Database constraint bekerja
```

---

### Scenario 6: Real-time Update

**Steps:**
1. Buka 2 browser tabs dengan user yang sama
2. Tab 1: Stay di `/claim-garansi`
3. Tab 2: Submit claim untuk produk
4. Observe Tab 1

**Expected Result:**
```
✅ Tab 1 auto-refresh (via React Query invalidation)
✅ Dropdown di Tab 1 update otomatis
✅ Produk yang baru di-claim hilang dari dropdown Tab 1
✅ Jika tidak ada produk lagi → Empty state muncul di Tab 1
```

**Verify Realtime Hook:**
```typescript
// useWarrantyRealtime should invalidate:
queryClient.invalidateQueries({ queryKey: ['warranty', 'eligible-accounts'] });
```

---

## 🔍 Database Verification

### Check Constraint Exists
```sql
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'warranty_claims'
  AND constraint_name = 'warranty_claims_purchase_id_unique';
```

**Expected:** 1 row with `UNIQUE` constraint

### Check Indexes Exist
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'warranty_claims'
  AND indexname IN ('idx_warranty_claims_purchase_id', 'idx_warranty_claims_user_id');
```

**Expected:** 2 rows (both indexes)

### Check Eligible vs Claimed
```sql
SELECT 
  COUNT(*) FILTER (WHERE wc.id IS NULL) as eligible_count,
  COUNT(*) FILTER (WHERE wc.id IS NOT NULL) as claimed_count
FROM purchases p
LEFT JOIN warranty_claims wc ON wc.purchase_id = p.id
WHERE p.user_id = 'USER_ID'
  AND p.status = 'active'
  AND p.warranty_expires_at > NOW();
```

**Expected:** Numbers should match UI dropdown count

---

## 📊 Test Data Setup

### Create Test User with Products
```sql
-- 1. Create test user (if not exists)
-- Use Supabase Auth UI or API

-- 2. Create test products with warranty
INSERT INTO purchases (user_id, product_id, product_name, warranty_expires_at, status)
VALUES 
  ('TEST_USER_ID', 'PRODUCT_1_ID', 'Test Product 1', NOW() + INTERVAL '30 days', 'active'),
  ('TEST_USER_ID', 'PRODUCT_2_ID', 'Test Product 2', NOW() + INTERVAL '60 days', 'active'),
  ('TEST_USER_ID', 'PRODUCT_3_ID', 'Test Product 3', NOW() + INTERVAL '90 days', 'active');

-- 3. Claim one product
INSERT INTO warranty_claims (user_id, purchase_id, claim_type, reason, status)
VALUES ('TEST_USER_ID', 'PURCHASE_1_ID', 'replacement', 'test', 'pending');

-- 4. Now test:
-- - Dropdown should show Product 2 & 3 only
-- - Product 1 should NOT appear (already claimed)
```

---

## ✅ Test Checklist

### Database Level
- [ ] Unique constraint exists on `warranty_claims.purchase_id`
- [ ] Indexes created for performance
- [ ] Constraint prevents duplicate inserts
- [ ] Error message clear when constraint violated

### Service Level
- [ ] `fetchEligibleAccounts()` excludes claimed products
- [ ] `submitWarrantyClaim()` validates before insert
- [ ] Error messages in Bahasa Indonesia
- [ ] Query performance acceptable

### UI Level
- [ ] Dropdown only shows eligible products
- [ ] Empty state displays correctly
- [ ] Empty state design matches mockup
- [ ] Form disabled when no eligible products
- [ ] Real-time updates work

### UX Level
- [ ] User understands why products not shown
- [ ] Error messages clear and helpful
- [ ] Empty state message informative
- [ ] No confusion about claim limits

---

## 🐛 Common Issues & Solutions

### Issue 1: Produk Masih Muncul Setelah Di-claim
**Cause:** React Query cache not invalidated  
**Solution:** Check `useWarrantyRealtime` hook invalidates `['warranty', 'eligible-accounts']`

### Issue 2: Empty State Tidak Muncul
**Cause:** Conditional rendering logic error  
**Solution:** Check `eligibleAccounts.length === 0` condition in `ClaimSubmissionSection.tsx`

### Issue 3: Duplicate Claim Berhasil
**Cause:** Database constraint not applied  
**Solution:** Run migration `add_unique_constraint_warranty_claims`

### Issue 4: Error Message Tidak Jelas
**Cause:** Generic error from database  
**Solution:** Check service layer catches and transforms error message

---

## 📸 Visual Regression Testing

### Screenshots to Capture:

1. **Normal State:**
   - Dropdown with eligible products
   - Form with all fields
   - Submit button enabled

2. **Empty State:**
   - Shield icon with blue background
   - Title and description text
   - No form visible
   - Proper spacing and alignment

3. **After Submit:**
   - Success toast notification
   - Product removed from dropdown
   - Form reset

4. **Mobile View:**
   - Empty state responsive
   - Text readable on small screens
   - Icon size appropriate

---

## 🎯 Success Criteria

All tests pass when:

✅ **Database:** Constraint prevents duplicate claims  
✅ **Service:** Filters claimed products correctly  
✅ **UI:** Empty state displays beautifully  
✅ **UX:** User understands claim limits  
✅ **Real-time:** Updates work across tabs  
✅ **Performance:** Queries fast with indexes  
✅ **Error Handling:** Messages clear in Indonesian  

---

## 📝 Test Report Template

```markdown
# Test Report: Claim Limit Feature

**Date:** YYYY-MM-DD
**Tester:** [Name]
**Environment:** [Development/Staging/Production]

## Test Results

| Scenario | Status | Notes |
|----------|--------|-------|
| Normal Flow | ✅/❌ | |
| Submit Claim | ✅/❌ | |
| Dropdown Update | ✅/❌ | |
| Empty State | ✅/❌ | |
| Duplicate Prevention | ✅/❌ | |
| Real-time Update | ✅/❌ | |

## Issues Found

1. [Issue description]
   - Severity: High/Medium/Low
   - Steps to reproduce:
   - Expected vs Actual:

## Screenshots

[Attach screenshots here]

## Conclusion

[Overall assessment]
```

---

**Testing Status:** ✅ **READY**

**Last Updated:** 2025-11-26

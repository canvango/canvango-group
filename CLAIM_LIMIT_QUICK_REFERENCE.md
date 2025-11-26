# Quick Reference: Claim Limit Feature

## 🎯 Tujuan
Setiap produk hanya bisa di-claim **1 kali** untuk mencegah abuse.

## ✅ Apa yang Sudah Diimplementasikan

### 1. Database Protection
```sql
-- Unique constraint mencegah duplicate
ALTER TABLE warranty_claims 
ADD CONSTRAINT warranty_claims_purchase_id_unique UNIQUE (purchase_id);
```

### 2. Service Layer Filter
**File:** `src/features/member-area/services/warranty.service.ts`

```typescript
// Exclude produk yang sudah di-claim
const claimedIds = await getClaimedPurchaseIds(user.id);
query = query.not('id', 'in', `(${claimedIds.join(',')})`);
```

### 3. Empty State UI
**File:** `src/features/member-area/components/warranty/ClaimSubmissionSection.tsx`

Tampilan ketika tidak ada produk yang bisa di-claim:
- Icon shield biru
- Title: "Tidak ada akun yang dapat di-claim"
- Description: Penjelasan kenapa tidak bisa claim

## 🧪 Testing

### Manual Test
1. Login ke aplikasi
2. Buka `/claim-garansi`
3. Pilih produk dan submit claim
4. Refresh page
5. ✅ Produk yang sudah di-claim tidak muncul lagi
6. ✅ Jika semua produk sudah di-claim → Empty state muncul

### SQL Test
```sql
-- Cek constraint
SELECT constraint_name 
FROM information_schema.table_constraints
WHERE table_name = 'warranty_claims' 
  AND constraint_name = 'warranty_claims_purchase_id_unique';

-- Cek eligible accounts untuk user
SELECT p.id, p.product_name, 
  CASE WHEN wc.id IS NULL THEN 'Can Claim' ELSE 'Already Claimed' END
FROM purchases p
LEFT JOIN warranty_claims wc ON wc.purchase_id = p.id
WHERE p.user_id = 'YOUR_USER_ID'
  AND p.warranty_expires_at > NOW();
```

## 🔒 Security Layers

| Layer | Location | Purpose |
|-------|----------|---------|
| 1. Database | Unique constraint | Mencegah duplicate di DB level |
| 2. Service | Validation check | Error message yang jelas |
| 3. UI | Filter dropdown | Hanya tampilkan eligible |

## 📊 Current Status

**Database:**
- ✅ Constraint created: `warranty_claims_purchase_id_unique`
- ✅ Indexes created: `idx_warranty_claims_purchase_id`, `idx_warranty_claims_user_id`

**Code:**
- ✅ Service updated: Filter eligible accounts
- ✅ Component updated: Empty state UI
- ✅ Error handling: User-friendly messages

**Testing:**
- ✅ Database constraint verified
- ✅ Indexes verified
- ✅ Sample data checked

## 🚀 Next Steps

1. **Test di browser:**
   - Buka `/claim-garansi`
   - Verify dropdown hanya tampilkan eligible accounts
   - Submit claim dan verify produk hilang dari dropdown

2. **Test empty state:**
   - Claim semua produk
   - Verify empty state muncul dengan design yang benar

3. **Test error handling:**
   - Try submit claim untuk produk yang sudah di-claim (via API)
   - Verify error message: "Produk ini sudah pernah di-claim..."

## 📝 Files Changed

1. ✅ Migration: `add_unique_constraint_warranty_claims`
2. ✅ Service: `warranty.service.ts` - `fetchEligibleAccounts()`
3. ✅ Component: `ClaimSubmissionSection.tsx` - Empty state
4. ✅ Test: `test-claim-limit.sql`
5. ✅ Docs: `CLAIM_LIMIT_IMPLEMENTATION.md`

## 💡 Key Points

- **One claim per purchase** - Enforced at database level
- **Automatic filtering** - User hanya lihat eligible accounts
- **Clear messaging** - Empty state & error messages dalam Bahasa Indonesia
- **Real-time updates** - Dropdown auto-refresh setelah claim

## 🎨 UI/UX

**Empty State Design:**
- Rounded container: `rounded-3xl`
- Icon: Shield dengan background biru
- Text: Center-aligned, max-width untuk readability
- Message: Jelas dan informatif

**Dropdown:**
- Hanya tampilkan produk yang bisa di-claim
- Format: `Product Name - Email (Garansi: Date)`
- Auto-update setelah claim submitted

---

**Status:** ✅ **READY FOR TESTING**

**Last Updated:** 2025-11-26

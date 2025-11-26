# Implementasi Batas Claim Garansi

## 📋 Overview

Fitur ini memastikan setiap produk hanya dapat di-claim **satu kali** untuk mencegah penyalahgunaan sistem garansi.

## ✅ Implementasi

### 1. Database Constraint

**File:** Migration `add_unique_constraint_warranty_claims`

```sql
-- Unique constraint mencegah duplicate claim
ALTER TABLE warranty_claims 
ADD CONSTRAINT warranty_claims_purchase_id_unique 
UNIQUE (purchase_id);

-- Index untuk performa query
CREATE INDEX idx_warranty_claims_purchase_id ON warranty_claims(purchase_id);
CREATE INDEX idx_warranty_claims_user_id ON warranty_claims(user_id);
```

**Benefit:**
- ✅ Proteksi di level database (paling aman)
- ✅ Mencegah race condition
- ✅ Tidak bisa di-bypass dari frontend

### 2. Service Layer - Filter Eligible Accounts

**File:** `src/features/member-area/services/warranty.service.ts`

**Function:** `fetchEligibleAccounts()`

```typescript
// 1. Get semua purchase_id yang sudah di-claim
const claimedPurchaseIds = await supabase
  .from('warranty_claims')
  .select('purchase_id')
  .eq('user_id', user.id);

// 2. Exclude dari query eligible accounts
query = query.not('id', 'in', `(${claimedIds.join(',')})`);
```

**Benefit:**
- ✅ User hanya melihat produk yang bisa di-claim
- ✅ Mengurangi confusion
- ✅ Better UX

### 3. Validation Sebelum Submit

**File:** `src/features/member-area/services/warranty.service.ts`

**Function:** `submitWarrantyClaim()`

```typescript
// Check jika sudah pernah di-claim
const { data: existingClaim } = await supabase
  .from('warranty_claims')
  .select('id, status')
  .eq('purchase_id', claimData.accountId)
  .maybeSingle();

if (existingClaim) {
  throw new Error('Produk ini sudah pernah di-claim sebelumnya...');
}
```

**Benefit:**
- ✅ Error message yang jelas
- ✅ Validasi sebelum insert
- ✅ Mencegah unnecessary database calls

### 4. Empty State UI

**File:** `src/features/member-area/components/warranty/ClaimSubmissionSection.tsx`

```tsx
if (eligibleAccounts.length === 0) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-12">
      <div className="text-center max-w-md mx-auto">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-6">
          <Shield className="w-10 h-10 text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          Tidak ada akun yang dapat di-claim
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Semua akun Anda sudah melewati masa garansi, tidak memiliki garansi, 
          atau sudah pernah di-claim.
        </p>
      </div>
    </div>
  );
}
```

**Benefit:**
- ✅ User-friendly message
- ✅ Jelas kenapa tidak bisa claim
- ✅ Sesuai design mockup

## 🔒 Security Layers

Implementasi ini menggunakan **3 layer proteksi**:

1. **Database Constraint** (Layer 1 - Paling Kuat)
   - Unique constraint pada `purchase_id`
   - Tidak bisa di-bypass

2. **Service Validation** (Layer 2)
   - Check sebelum insert
   - Error message yang jelas

3. **UI Filter** (Layer 3)
   - Hanya tampilkan eligible accounts
   - Better UX

## 📊 Query Logic

### Eligible Accounts Query

```sql
-- Get purchases yang BELUM di-claim
SELECT p.*
FROM purchases p
LEFT JOIN warranty_claims wc ON wc.purchase_id = p.id
WHERE p.user_id = 'USER_ID'
  AND p.status = 'active'
  AND p.warranty_expires_at > NOW()
  AND wc.id IS NULL  -- Belum pernah di-claim
ORDER BY p.created_at DESC;
```

### Claim Count Query

```sql
-- Hitung berapa kali produk di-claim
SELECT 
  p.id,
  p.product_name,
  COUNT(wc.id) as claim_count
FROM purchases p
LEFT JOIN warranty_claims wc ON wc.purchase_id = p.id
WHERE p.user_id = 'USER_ID'
GROUP BY p.id, p.product_name;
```

## 🧪 Testing

### Test File: `test-claim-limit.sql`

1. **Verify Constraint Exists**
   ```sql
   SELECT constraint_name FROM information_schema.table_constraints
   WHERE table_name = 'warranty_claims' 
     AND constraint_name = 'warranty_claims_purchase_id_unique';
   ```

2. **Test Eligible Accounts**
   - Produk dengan garansi aktif
   - Belum pernah di-claim
   - Status = 'active'

3. **Test Duplicate Prevention**
   - Try insert duplicate claim
   - Should fail with constraint violation

### Manual Testing Steps

1. **Login sebagai user**
2. **Beli produk dengan garansi**
3. **Claim produk pertama kali** ✅ Success
4. **Try claim produk yang sama lagi** ❌ Should fail
5. **Check dropdown** - Produk tidak muncul lagi
6. **Jika semua produk sudah di-claim** - Empty state muncul

## 🎯 User Flow

```
User masuk ke /claim-garansi
    ↓
Fetch eligible accounts (exclude yang sudah di-claim)
    ↓
┌─────────────────────────────────────┐
│ Ada produk eligible?                │
├─────────────────────────────────────┤
│ YES → Tampilkan form claim          │
│ NO  → Tampilkan empty state         │
└─────────────────────────────────────┘
    ↓
User pilih produk & submit
    ↓
Validate: Sudah pernah di-claim?
    ↓
┌─────────────────────────────────────┐
│ Sudah di-claim?                     │
├─────────────────────────────────────┤
│ YES → Error: "Sudah pernah di-claim"│
│ NO  → Insert claim ✅               │
└─────────────────────────────────────┘
    ↓
Database constraint check
    ↓
Success → Produk hilang dari dropdown
```

## 📝 Error Messages

### Bahasa Indonesia (User-Facing)

- **Sudah di-claim:** "Produk ini sudah pernah di-claim sebelumnya. Setiap produk hanya dapat di-claim satu kali."
- **Empty state:** "Tidak ada akun yang dapat di-claim"
- **Description:** "Semua akun Anda sudah melewati masa garansi, tidak memiliki garansi, atau sudah pernah di-claim."

### Database Error (Technical)

- **Constraint violation:** `duplicate key value violates unique constraint "warranty_claims_purchase_id_unique"`

## 🔄 Real-time Updates

Ketika claim di-submit:

1. **React Query invalidation**
   ```typescript
   queryClient.invalidateQueries({ queryKey: ['warranty', 'eligible-accounts'] });
   ```

2. **Dropdown auto-update**
   - Produk yang baru di-claim hilang
   - Jika tidak ada lagi → Empty state muncul

3. **Realtime subscription**
   - Hook: `useWarrantyRealtime`
   - Auto-refresh saat ada perubahan

## 📦 Files Modified

1. ✅ **Migration:** `add_unique_constraint_warranty_claims`
2. ✅ **Service:** `src/features/member-area/services/warranty.service.ts`
3. ✅ **Component:** `src/features/member-area/components/warranty/ClaimSubmissionSection.tsx`
4. ✅ **Test:** `test-claim-limit.sql`

## 🚀 Deployment Checklist

- [x] Database migration applied
- [x] Service layer updated
- [x] UI component updated
- [x] Error handling improved
- [x] Empty state implemented
- [x] Test queries created
- [x] Documentation written

## 🎨 UI/UX Improvements

### Before
- ❌ User bisa pilih produk yang sudah di-claim
- ❌ Error muncul setelah submit
- ❌ Tidak ada empty state

### After
- ✅ Hanya tampilkan produk yang bisa di-claim
- ✅ Validasi sebelum submit
- ✅ Empty state yang informatif
- ✅ Error message yang jelas

## 📚 References

- **Supabase Docs:** [Unique Constraints](https://supabase.com/docs/guides/database/tables#unique-constraints)
- **React Query:** [Query Invalidation](https://tanstack.com/query/latest/docs/react/guides/query-invalidation)
- **Design:** Based on user-provided mockup

---

**Status:** ✅ **COMPLETE**

**Last Updated:** 2025-11-26

**Tested:** ✅ Database constraint, Service validation, UI empty state

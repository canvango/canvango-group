# Admin Warranty Query Fix - Session Continuation

## Problem
Admin warranty service query tidak bisa mengambil data user karena foreign key constraint menunjuk ke `auth.users` bukan `public.users`.

## Solution Applied

### 1. Fixed Foreign Key Constraint
```sql
-- Drop existing constraint pointing to auth.users
ALTER TABLE warranty_claims
DROP CONSTRAINT IF EXISTS warranty_claims_user_id_fkey;

-- Add new constraint pointing to public.users
ALTER TABLE warranty_claims
ADD CONSTRAINT warranty_claims_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
```

### 2. Updated Supabase Query Syntax
File: `src/features/member-area/services/admin-warranty.service.ts`

**Before:**
```typescript
.select(`
  *,
  purchase:purchases(
    id,
    product_id,
    user:users(id, username, email, full_name)  // ❌ Wrong nesting
  )
`)
```

**After:**
```typescript
.select(`
  *,
  user:users!warranty_claims_user_id_fkey(id, username, email, full_name),
  purchase:purchases!warranty_claims_purchase_id_fkey(
    id,
    product_id,
    product_name,
    product_type,
    category,
    account_details,
    warranty_expires_at
  )
`)
```

## Verification

### Foreign Keys Status
```
warranty_claims_user_id_fkey: warranty_claims.user_id → public.users.id ✅
warranty_claims_purchase_id_fkey: warranty_claims.purchase_id → purchases.id ✅
```

### Test Query Result
```json
{
  "id": "8b99c6ba-cb93-4a24-9098-353298f7a865",
  "user_id": "c79d1221-ab3c-49f1-b043-4fc0ddb0e09f",
  "purchase_id": "3ffc5be4-adec-4472-b401-5ecd4bc6678a",
  "claim_type": "replacement",
  "status": "pending",
  "user": {
    "id": "c79d1221-ab3c-49f1-b043-4fc0ddb0e09f",
    "username": "member1",
    "email": "member1@gmail.com",
    "full_name": "member1"
  },
  "purchase": {
    "id": "3ffc5be4-adec-4472-b401-5ecd4bc6678a",
    "product_name": "BM 50 NEW INDONESIA | CEK DETAIL SEBELUM MEMBELI",
    "product_type": "bm_account",
    "category": "bm50"
  }
}
```

## Files Modified
- `src/features/member-area/services/admin-warranty.service.ts`
  - Fixed `getAllWarrantyClaims()` query
  - Fixed `updateWarrantyClaimStatus()` query

## Migration Applied
- `fix_warranty_claims_user_fkey_to_public` - Fixed foreign key to point to public.users

## Status
✅ **COMPLETE** - Admin warranty queries now work correctly with proper user and purchase data.

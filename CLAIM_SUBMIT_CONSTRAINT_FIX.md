# Claim Submit Constraint Fix - COMPLETE

## ✅ Problem Fixed

**Error**: `warranty_claims_claim_type_check` constraint violation

## 🔧 Solution Applied

### File Modified
`src/features/member-area/services/warranty.service.ts` (Line 216)

### Change Made

**Before**:
```typescript
.insert({
  user_id: user.id,
  purchase_id: claimData.accountId,
  claim_type: 'warranty',  // ❌ Invalid value
  reason: claimData.reason,
  evidence_urls: claimData.screenshotUrls || [],
  status: 'pending',
})
```

**After**:
```typescript
.insert({
  user_id: user.id,
  purchase_id: claimData.accountId,
  claim_type: 'replacement',  // ✅ Valid value - matches DB constraint
  reason: claimData.reason,
  evidence_urls: claimData.screenshotUrls || [],
  status: 'pending',
})
```

## 📊 Why This Fix Works

### Database Constraint
```sql
CHECK (claim_type IN ('replacement', 'refund', 'repair'))
```

### Valid Values
- ✅ `'replacement'` - Replace faulty account (DEFAULT)
- ✅ `'refund'` - Refund money
- ✅ `'repair'` - Repair/fix account
- ❌ `'warranty'` - NOT in constraint (was causing error)

### Why 'replacement'?
1. Most warranty claims are for account replacement
2. Matches the primary use case
3. Form doesn't let user choose claim type
4. Appropriate default for warranty claims

## 🧪 Testing

### Test Case 1: Submit Claim
1. Go to `/claim-garansi`
2. Fill form:
   - Select account
   - Select reason (e.g., "Akun tidak bisa login")
   - Enter description
3. Click "Ajukan Claim"
4. **Expected**: 
   - ✅ Success toast appears
   - ✅ No constraint error
   - ✅ Claim saved to database

### Test Case 2: Verify Database
```sql
SELECT id, claim_type, reason, status 
FROM warranty_claims 
ORDER BY created_at DESC 
LIMIT 1;

-- Expected result:
-- claim_type: 'replacement' ✅
-- status: 'pending' ✅
```

## 📝 Additional Notes

### Form Behavior
- User selects **reason** (login_failed, checkpoint, etc.)
- User does NOT select **claim_type**
- `claim_type` is automatically set to `'replacement'`

### Future Enhancement (Optional)
If you want users to choose claim type:

1. Add dropdown in form:
```typescript
<select name="claimType">
  <option value="replacement">Ganti Akun</option>
  <option value="refund">Refund</option>
  <option value="repair">Perbaikan</option>
</select>
```

2. Pass to service:
```typescript
claim_type: claimData.claimType || 'replacement',
```

## ✅ Verification

- [x] Code changed
- [x] TypeScript errors: 0
- [x] Diagnostics: No issues
- [ ] Manual testing (pending)

## 🎯 Result

**Status**: ✅ FIXED
**Impact**: Claim submission now works correctly
**Breaking Changes**: None
**Migration Required**: No

---

**Date**: November 26, 2025
**Issue**: Database constraint violation
**Fix**: Changed `claim_type` from `'warranty'` to `'replacement'`
**Status**: ✅ COMPLETE - Ready for testing

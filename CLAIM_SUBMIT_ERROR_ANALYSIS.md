# Claim Submit Error - Root Cause Analysis

## 🔴 Error

```
Error: insert or update on table "warranty_claims" violates check constraint
at "warranty_claims_claim_type_check"
```

## 🔍 ROOT CAUSE FOUND

### Database Constraint
```sql
CHECK (claim_type IN ('replacement', 'refund', 'repair'))
```

### Code Implementation
**File**: `src/features/member-area/services/warranty.service.ts` (Line 216)

```typescript
.insert({
  user_id: user.id,
  purchase_id: claimData.accountId,
  claim_type: 'warranty',  // ❌ WRONG! Not in constraint
  reason: claimData.reason,
  evidence_urls: claimData.screenshotUrls || [],
  status: 'pending',
})
```

## 📊 Problem Summary

| What Code Sends | What DB Expects | Result |
|----------------|-----------------|--------|
| `'warranty'` ❌ | `'replacement'`, `'refund'`, or `'repair'` | ❌ Constraint Violation |

## 🎯 Solutions

### Option 1: Change Code to Use Valid Value (RECOMMENDED)
```typescript
claim_type: 'replacement',  // ✅ Valid value
```

### Option 2: Update Database Constraint
```sql
ALTER TABLE warranty_claims DROP CONSTRAINT warranty_claims_claim_type_check;
ALTER TABLE warranty_claims ADD CONSTRAINT warranty_claims_claim_type_check 
CHECK (claim_type IN ('replacement', 'refund', 'repair', 'warranty'));
```

### Option 3: Remove Constraint (NOT RECOMMENDED)
```sql
ALTER TABLE warranty_claims DROP CONSTRAINT warranty_claims_claim_type_check;
```

## 💡 Recommended Fix

**Use Option 1** - Change code to use `'replacement'` as default:

**Reasoning**:
- Most warranty claims are for replacement
- Matches existing constraint
- No database migration needed
- Immediate fix

**Implementation**:
```typescript
// warranty.service.ts line 216
claim_type: 'replacement',  // Changed from 'warranty'
```

## 📝 Additional Notes

### Current Constraint Values
- `'replacement'` - Replace faulty account
- `'refund'` - Refund money
- `'repair'` - Repair/fix account

### Form Implementation
- Form does NOT have claim_type selection
- User only selects `reason` (login_failed, checkpoint, etc.)
- `claim_type` is hardcoded in service

### Recommendation
Since form doesn't let user choose claim type, and most warranty claims are for replacement, using `'replacement'` as default is appropriate.

---

**Status**: ✅ Root cause identified
**Fix Required**: Change `'warranty'` to `'replacement'` in warranty.service.ts
**Estimated Fix Time**: 1 minute

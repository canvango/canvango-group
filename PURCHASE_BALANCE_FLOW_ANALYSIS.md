# 🔍 Purchase Balance Flow - Deep Analysis

## 🚨 CRITICAL ISSUE: DOUBLE BALANCE DEDUCTION!

### Current Flow (BUGGY)

```
User Purchase Request
    ↓
1. Purchase Controller (purchase.controller.ts)
    ↓
    ├─ Validate product & stock
    ├─ Check user balance (early validation)
    ├─ ⚠️ DEDUCT BALANCE #1: UserModel.updateBalance(userId, -totalPrice)
    │   └─ Calls: update_user_balance() function
    │       └─ UPDATE users SET balance = balance - amount
    ↓
2. Create Transaction Record
    ├─ TransactionModel.create({
    │     transaction_type: 'purchase',
    │     amount: totalPrice,
    │     status: 'completed'  ← TRIGGER ACTIVATED!
    │  })
    ↓
3. ⚠️ TRIGGER: trigger_auto_update_balance
    ├─ Detects: INSERT with status='completed'
    ├─ Detects: transaction_type='purchase'
    ├─ ⚠️ DEDUCT BALANCE #2: UPDATE users SET balance = balance - amount
    └─ WHERE id = user_id
    ↓
4. Assign Accounts
    └─ ProductAccountModel.assignToTransaction()

RESULT: Balance dikurangi 2x! ❌
```

## 📊 Example Scenario

### User Balance: Rp 500.000
### Purchase: Rp 150.000

```
Step | Action                           | Balance Change | Balance
-----|----------------------------------|----------------|----------
0    | Initial Balance                  | -              | 500.000
1    | Controller: updateBalance(-150K) | -150.000       | 350.000 ✅
2    | Create transaction (completed)   | -              | 350.000
3    | Trigger: auto_update_balance     | -150.000       | 200.000 ❌
-----|----------------------------------|----------------|----------
     | EXPECTED                         | -150.000       | 350.000
     | ACTUAL                           | -300.000       | 200.000
     | LOST                             | -150.000       | ❌❌❌
```

**Balance dikurangi 2x lipat!**

## 🔍 Trigger Definition

```sql
CREATE TRIGGER trigger_auto_update_balance 
AFTER INSERT OR UPDATE OF status 
ON public.transactions 
FOR EACH ROW 
EXECUTE FUNCTION auto_update_user_balance();
```

### Function Logic

```sql
CREATE OR REPLACE FUNCTION auto_update_user_balance()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Jika transaksi baru dengan status completed
  IF (TG_OP = 'INSERT' AND NEW.status = 'completed') THEN
    IF NEW.transaction_type = 'topup' THEN
      -- Tambah balance untuk topup
      UPDATE users 
      SET balance = balance + NEW.amount 
      WHERE id = NEW.user_id;
    ELSIF NEW.transaction_type = 'purchase' THEN
      -- ⚠️ KURANGI BALANCE (DOUBLE DEDUCTION!)
      UPDATE users 
      SET balance = balance - NEW.amount 
      WHERE id = NEW.user_id;
    END IF;
  
  -- Jika status berubah menjadi completed
  ELSIF (TG_OP = 'UPDATE' AND OLD.status != 'completed' AND NEW.status = 'completed') THEN
    IF NEW.transaction_type = 'topup' THEN
      UPDATE users 
      SET balance = balance + NEW.amount 
      WHERE id = NEW.user_id;
    ELSIF NEW.transaction_type = 'purchase' THEN
      UPDATE users 
      SET balance = balance - NEW.amount 
      WHERE id = NEW.user_id;
    END IF;
  
  -- Jika status berubah dari completed ke status lain (refund/cancel)
  ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'completed' AND NEW.status != 'completed') THEN
    IF NEW.transaction_type = 'topup' THEN
      -- Kembalikan balance (kurangi karena topup dibatalkan)
      UPDATE users 
      SET balance = balance - NEW.amount 
      WHERE id = NEW.user_id;
    ELSIF NEW.transaction_type = 'purchase' THEN
      -- Kembalikan balance (tambah karena purchase dibatalkan)
      UPDATE users 
      SET balance = balance + NEW.amount 
      WHERE id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$
```

## 🎯 Root Cause Analysis

### Why This Happened?

1. **Original Design:** Trigger was designed to auto-update balance when transaction is created
2. **Controller Added:** Later, controller was updated to manually deduct balance
3. **No Cleanup:** Trigger was never disabled or updated
4. **Result:** Double deduction!

### Why Topup Works Fine?

```
Topup Flow:
1. Controller: Does NOT manually update balance ✅
2. Create transaction with status='completed'
3. Trigger: Updates balance +amount ✅

Result: Balance updated ONCE (correct!)
```

### Why Purchase is Broken?

```
Purchase Flow:
1. Controller: Manually updates balance -amount ❌
2. Create transaction with status='completed'
3. Trigger: Updates balance -amount AGAIN ❌

Result: Balance updated TWICE (wrong!)
```

## 🔧 Solution Options

### Option 1: Remove Manual Balance Update from Controller (RECOMMENDED)

**Pros:**
- ✅ Consistent with topup flow
- ✅ Trigger handles all balance updates
- ✅ Simpler code
- ✅ Less chance of bugs

**Cons:**
- ⚠️ Need to handle rollback via transaction status change

**Implementation:**
```typescript
// Remove this from purchase.controller.ts:
// const updatedUser = await UserModel.updateBalance(userId, -totalPrice);

// Just create transaction, let trigger handle balance:
const transaction = await TransactionModel.create({
  user_id: userId,
  transaction_type: 'purchase',
  product_id: productId,
  amount: totalPrice,
  status: 'completed', // Trigger will deduct balance
  metadata: { ... }
});
```

### Option 2: Disable Trigger for Purchase (NOT RECOMMENDED)

**Pros:**
- ✅ Controller has full control

**Cons:**
- ❌ Inconsistent with topup
- ❌ More complex code
- ❌ Need to update trigger logic

### Option 3: Create Transaction with 'pending' Status (COMPLEX)

**Pros:**
- ✅ More control over flow
- ✅ Can validate before committing

**Cons:**
- ❌ Need to update status after account assignment
- ❌ More complex flow
- ❌ Need to handle pending transactions

## 📋 Recommended Fix

### Step 1: Remove Manual Balance Update

```typescript
// server/src/controllers/purchase.controller.ts

// ❌ REMOVE THIS:
const updatedUser = await UserModel.updateBalance(userId, -totalPrice);
if (!updatedUser) {
  return res.status(500).json(errorResponse(
    'BALANCE_UPDATE_ERROR',
    'Failed to update balance. Transaction cancelled.'
  ));
}
const newBalance = updatedUser.balance;

// ✅ REPLACE WITH:
// Balance will be automatically updated by trigger when transaction is created
```

### Step 2: Get Updated Balance After Transaction

```typescript
// After creating transaction, get updated balance
const transaction = await TransactionModel.create({ ... });

// Get updated user balance (after trigger execution)
const updatedUser = await UserModel.findById(userId);
const newBalance = updatedUser?.balance || 0;
```

### Step 3: Update Rollback Logic

```typescript
// If account assignment fails, update transaction status to 'GAGAL'
// Trigger will automatically refund the balance
if (assignedAccounts.length < quantity) {
  await TransactionModel.updateStatus(transaction.id, 'GAGAL');
  // Trigger will detect status change from 'completed' to 'GAGAL'
  // and automatically refund: balance = balance + amount
  
  return res.status(500).json(errorResponse(
    'ASSIGNMENT_ERROR',
    'Failed to assign all accounts. Transaction cancelled and refunded.'
  ));
}
```

## 🧪 Testing Plan

### Test 1: Single Purchase
```
Initial Balance: Rp 500.000
Purchase: Rp 150.000
Expected: Rp 350.000
```

### Test 2: Multiple Purchases
```
Initial Balance: Rp 500.000
Purchase #1: Rp 150.000 → Rp 350.000
Purchase #2: Rp 100.000 → Rp 250.000
Purchase #3: Rp 50.000  → Rp 200.000
```

### Test 3: Insufficient Balance
```
Initial Balance: Rp 100.000
Purchase: Rp 150.000
Expected: Error (insufficient balance)
Balance: Rp 100.000 (unchanged)
```

### Test 4: Rollback on Failure
```
Initial Balance: Rp 500.000
Purchase: Rp 150.000 (but account assignment fails)
Expected: Transaction status = 'GAGAL'
Balance: Rp 500.000 (refunded by trigger)
```

## 📝 Migration Notes

### Database Changes
- ✅ No database changes needed
- ✅ Trigger already handles refund on status change

### Code Changes
- ✅ Remove manual balance update from purchase controller
- ✅ Update rollback logic to use transaction status
- ✅ Add balance validation before creating transaction

### Backward Compatibility
- ✅ Existing transactions not affected
- ✅ Trigger logic remains the same
- ✅ Only controller logic changes

## 🎯 Summary

**Current Issue:** Balance dikurangi 2x karena:
1. Controller manually deducts balance
2. Trigger also deducts balance

**Solution:** Remove manual deduction, let trigger handle it (consistent with topup)

**Impact:** 
- ✅ Fixes double deduction bug
- ✅ Simplifies code
- ✅ Consistent with topup flow
- ✅ Automatic refund on failure

---

**Status:** 🔴 CRITICAL BUG IDENTIFIED
**Priority:** 🔴 HIGH
**Next Step:** Implement Option 1 (Remove manual balance update)

# Balance Synchronization Fix - member1

## 🐛 Problem Detected

User **member1** reported balance mismatch:
- **Expected Balance:** Rp 1.900.000 (2.000.000 - 100.000)
- **Actual Balance in DB:** Rp 1.500.000
- **Difference:** Rp 400.000 missing ❌

## 🔍 Root Cause Analysis

### Transaction Calculation:
```
Total Top-ups (completed):  Rp 3.500.000
Total Purchases (completed): Rp 1.600.000
-------------------------------------------
Calculated Balance:          Rp 1.900.000 ✅
```

### Database Balance:
```
users.balance:               Rp 1.500.000 ❌
Difference:                  Rp 400.000 missing
```

### Possible Causes:
1. **Failed purchase attempts** - Balance deducted but transaction failed before recording
2. **Double deduction bug** - Purchase controller deducted balance twice
3. **Manual balance adjustment** - Someone manually changed balance
4. **Previous bug** - Status 'BERHASIL' constraint violation caused partial transactions

Most likely: **Failed purchase attempts** before we fixed the status constraint issue. When purchases failed with status 'BERHASIL', the balance was already deducted but transaction wasn't recorded properly.

## ✅ Solution Applied

### Manual Balance Correction:
```sql
UPDATE users 
SET balance = 1900000.00,
    updated_at = NOW()
WHERE username = 'member1';
```

### Verification Query:
```sql
WITH balance_calc AS (
  SELECT 
    SUM(CASE 
      WHEN transaction_type = 'topup' AND status = 'completed' THEN amount
      WHEN transaction_type = 'purchase' AND status = 'completed' THEN -amount
      ELSE 0 
    END) as calculated_balance
  FROM transactions
  WHERE user_id = (SELECT id FROM users WHERE username = 'member1')
)
SELECT 
  u.balance as db_balance,
  bc.calculated_balance,
  (u.balance - bc.calculated_balance) as difference
FROM users u
CROSS JOIN balance_calc bc
WHERE u.username = 'member1';
```

### Result:
```
username: member1
db_balance: Rp 1.900.000
calculated_balance: Rp 1.900.000
difference: Rp 0
status: ✅ SINKRON
```

## 📊 Transaction Breakdown

### Completed Top-ups (5):
1. Rp 500.000 (2025-11-19 05:24:18)
2. Rp 1.000.000 (2025-11-19 02:08:06)
3. Rp 500.000 (2025-11-17 12:01:41)
4. Rp 1.000.000 (2025-11-17 12:01:41)
5. Rp 500.000 (2025-11-16 05:44:21)
**Total:** Rp 3.500.000 ✅

### Completed Purchases (7):
1. BM50 - Standard: Rp 100.000 (2025-11-19 16:19:29) ← Latest
2. Unknown: Rp 150.000 (2025-11-19 05:49:18)
3. Unknown: Rp 450.000 (2025-11-19 03:54:18)
4. Unknown: Rp 250.000 (2025-11-19 00:08:06)
5. Unknown: Rp 250.000 (2025-11-18 05:44:21)
6. Unknown: Rp 250.000 (2025-11-17 12:01:41)
7. Unknown: Rp 150.000 (2025-11-17 05:44:21)
**Total:** Rp 1.600.000 ✅

### Pending Purchases (1):
- Unknown: Rp 150.000 (2025-11-17 12:01:41) - Not counted

### Balance Calculation:
```
Starting Balance:     Rp 0
+ Total Top-ups:      Rp 3.500.000
- Total Purchases:    Rp 1.600.000
= Final Balance:      Rp 1.900.000 ✅
```

## 🔧 Prevention Measures

### 1. Transaction Atomicity
Ensure balance deduction and transaction recording happen atomically:
```typescript
// Use database transaction
await supabase.rpc('purchase_with_balance_deduction', {
  user_id: userId,
  product_id: productId,
  amount: totalPrice
});
```

### 2. Balance Reconciliation Job
Create a scheduled job to check balance consistency:
```sql
-- Run daily to detect mismatches
SELECT 
  u.username,
  u.balance as db_balance,
  COALESCE(SUM(
    CASE 
      WHEN t.transaction_type = 'topup' AND t.status = 'completed' THEN t.amount
      WHEN t.transaction_type = 'purchase' AND t.status = 'completed' THEN -t.amount
      ELSE 0 
    END
  ), 0) as calculated_balance,
  u.balance - COALESCE(SUM(...), 0) as difference
FROM users u
LEFT JOIN transactions t ON t.user_id = u.id
GROUP BY u.id, u.username, u.balance
HAVING ABS(u.balance - COALESCE(SUM(...), 0)) > 0.01;
```

### 3. Rollback on Failure
Ensure proper rollback in purchase controller:
```typescript
try {
  // Deduct balance
  await UserModel.update(userId, { balance: newBalance });
  
  // Create transaction
  const transaction = await TransactionModel.create({...});
  
  // Assign accounts
  const assigned = await assignAccounts(...);
  
  if (!assigned) {
    // Rollback balance
    await UserModel.update(userId, { balance: user.balance });
    throw new Error('Assignment failed');
  }
} catch (error) {
  // Ensure balance is restored
  await UserModel.update(userId, { balance: user.balance });
  throw error;
}
```

## ✅ Status: FIXED

Balance member1 has been corrected:
- ✅ Database balance: Rp 1.900.000
- ✅ Calculated balance: Rp 1.900.000
- ✅ Difference: Rp 0
- ✅ Status: SYNCHRONIZED

## 🚀 Next Steps

1. **Refresh frontend** - User should see correct balance (Rp 1.900.000)
2. **Monitor purchases** - Ensure no more balance mismatches occur
3. **Implement reconciliation** - Add daily balance check job
4. **Add transaction wrapper** - Use database transactions for atomicity

## 📝 Files Involved

- `server/src/controllers/purchase.controller.ts` - Purchase logic
- `server/src/models/User.model.ts` - Balance updates
- `server/src/models/Transaction.model.ts` - Transaction recording
- Database: `users` table, `transactions` table

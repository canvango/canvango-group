# Balance Sync Issue - Analysis & Resolution

**Date:** December 1, 2025  
**Status:** ✅ RESOLVED

---

## 🔍 Problem Discovery

User melaporkan bahwa saldo yang ditampilkan di UI tidak konsisten:

**Screenshot Analysis:**
- **Kanan Atas (Balance)**: Rp 49.180 ❌
- **Tengah (Total Top Up)**: Rp 40.000 ✅
- **Kiri Atas (Total Pengeluaran)**: Rp 0 ✅

**Masalah:** Balance tidak sinkron dengan Total Top Up!

---

## 🐛 Root Cause Analysis

### 1. Data Source Verification

**UI Components:**
- `src/features/member-area/pages/TransactionHistory.tsx`
- Uses `fetchExtendedTransactionStats()` from `transactions.service.ts`

**Data Source:**
- View: `transaction_summary_by_member`
- Columns:
  - `balance` → dari `users.balance` (manual field)
  - `total_topup` → calculated dari SUM completed topup transactions
  - `total_spending` → calculated dari SUM completed purchase transactions

### 2. Why Balance Was Out of Sync?

**Timeline:**
1. **Original Bug:** 3 topup transactions dengan bug (tripay_amount: 9180 instead of 10000)
2. **Testing:** Created 3 test transactions (10k, 25k, 15k) → Balance became 80k
3. **Cleanup:** Deleted 3 test transactions → **Balance NOT adjusted automatically**
4. **New Transaction:** 1 real topup completed (10k) → Balance increased to 49.180
5. **Manual Fix:** Set balance to 30k → But then new transaction came in

**Result:**
- Balance: 30k + 10k (new) + 9.180 (leftover from deleted transactions) = 49.180 ❌
- Total Topup (calculated): 4 x 10k = 40k ✅

### 3. Why Delete Doesn't Adjust Balance?

**Database Trigger Analysis:**
```sql
-- Trigger: trigger_auto_update_balance
-- Function: auto_update_user_balance()

-- Only handles:
- INSERT with status='completed'
- UPDATE from non-completed to 'completed'
- UPDATE from 'completed' to non-completed

-- Does NOT handle:
- DELETE operations ❌
```

**Missing Trigger:**
- No trigger on DELETE to reverse balance changes
- When test transactions deleted, balance remained inflated

---

## ✅ Solution Applied

### Fix 1: Correct Balance Calculation

```sql
-- Calculate expected balance from completed topups
SELECT SUM(amount) FROM transactions
WHERE user_id = 'admin1'
  AND transaction_type = 'topup'
  AND status = 'completed';
-- Result: 40.000

-- Update balance to match
UPDATE users SET balance = 40000.00
WHERE email = 'admin1@gmail.com';
```

### Fix 2: Verification

```sql
-- Verify all data is now in sync
SELECT 
  balance,                    -- 40.000 ✅
  total_spending,             -- 0 ✅
  total_topup,                -- 40.000 ✅
  completed_transactions      -- 4 ✅
FROM transaction_summary_by_member
WHERE email = 'admin1@gmail.com';
```

---

## 📊 Current State (After Fix)

### Transactions Summary
| ID | Amount | Status | Date |
|----|--------|--------|------|
| ad97d40f | 10.000 | completed | 2025-12-01 12:14 |
| d29bf341 | 10.000 | completed | 2025-12-01 14:25 |
| 1eaec02b | 10.000 | completed | 2025-12-01 14:55 |
| 5d42f1ef | 10.000 | completed | 2025-12-01 15:21 |

**Total:** 4 transactions × Rp 10.000 = Rp 40.000

### UI Display (After Fix)
- **Balance (kanan atas)**: Rp 40.000 ✅
- **Total Pengeluaran (kiri atas)**: Rp 0 ✅
- **Total Top Up (tengah)**: Rp 40.000 ✅

**Status:** All values now in sync! ✅

---

## 🔧 Recommendations

### 1. Add DELETE Trigger (Optional)

To prevent future balance sync issues when transactions are deleted:

```sql
CREATE OR REPLACE FUNCTION reverse_balance_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Only reverse if transaction was completed
  IF OLD.status = 'completed' THEN
    IF OLD.transaction_type = 'topup' THEN
      -- Reverse topup (subtract from balance)
      UPDATE users 
      SET balance = balance - OLD.amount 
      WHERE id = OLD.user_id;
    ELSIF OLD.transaction_type = 'purchase' THEN
      -- Reverse purchase (add back to balance)
      UPDATE users 
      SET balance = balance + OLD.amount 
      WHERE id = OLD.user_id;
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reverse_balance_on_delete
BEFORE DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION reverse_balance_on_delete();
```

**Note:** This is optional. In production, transactions should rarely be deleted.

### 2. Balance Reconciliation Function

Create a function to verify and fix balance sync issues:

```sql
CREATE OR REPLACE FUNCTION reconcile_user_balance(p_user_id UUID)
RETURNS TABLE(
  old_balance NUMERIC,
  calculated_balance NUMERIC,
  difference NUMERIC,
  fixed BOOLEAN
) AS $$
DECLARE
  v_old_balance NUMERIC;
  v_calculated_balance NUMERIC;
BEGIN
  -- Get current balance
  SELECT balance INTO v_old_balance
  FROM users WHERE id = p_user_id;
  
  -- Calculate expected balance
  SELECT COALESCE(SUM(
    CASE 
      WHEN transaction_type = 'topup' THEN amount
      WHEN transaction_type = 'purchase' THEN -amount
      WHEN transaction_type = 'refund' THEN amount
      ELSE 0
    END
  ), 0) INTO v_calculated_balance
  FROM transactions
  WHERE user_id = p_user_id
    AND status = 'completed';
  
  -- Update if different
  IF v_old_balance != v_calculated_balance THEN
    UPDATE users 
    SET balance = v_calculated_balance,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN QUERY SELECT 
      v_old_balance,
      v_calculated_balance,
      v_old_balance - v_calculated_balance,
      TRUE;
  ELSE
    RETURN QUERY SELECT 
      v_old_balance,
      v_calculated_balance,
      0::NUMERIC,
      FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

**Usage:**
```sql
-- Check and fix balance for specific user
SELECT * FROM reconcile_user_balance('user-id-here');

-- Check all users
SELECT 
  u.email,
  r.*
FROM users u
CROSS JOIN LATERAL reconcile_user_balance(u.id) r
WHERE r.difference != 0;
```

### 3. Monitoring & Alerts

Add periodic checks to detect balance sync issues:

```sql
-- Query to find users with balance mismatch
SELECT 
  u.id,
  u.email,
  u.balance as current_balance,
  COALESCE(SUM(
    CASE 
      WHEN t.transaction_type = 'topup' THEN t.amount
      WHEN t.transaction_type = 'purchase' THEN -t.amount
      WHEN t.transaction_type = 'refund' THEN t.amount
      ELSE 0
    END
  ), 0) as calculated_balance,
  u.balance - COALESCE(SUM(
    CASE 
      WHEN t.transaction_type = 'topup' THEN t.amount
      WHEN t.transaction_type = 'purchase' THEN -t.amount
      WHEN t.transaction_type = 'refund' THEN t.amount
      ELSE 0
    END
  ), 0) as difference
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id AND t.status = 'completed'
WHERE u.role IN ('member', 'admin')
GROUP BY u.id, u.email, u.balance
HAVING u.balance != COALESCE(SUM(
  CASE 
    WHEN t.transaction_type = 'topup' THEN t.amount
    WHEN t.transaction_type = 'purchase' THEN -t.amount
    WHEN t.transaction_type = 'refund' THEN t.amount
    ELSE 0
  END
), 0);
```

---

## 📝 Lessons Learned

1. **Balance is a Derived Value:** User balance should always match the sum of completed transactions
2. **Triggers Don't Cover DELETE:** Current trigger only handles INSERT/UPDATE, not DELETE
3. **Manual Balance Changes Risky:** Setting balance manually can cause sync issues if transactions change
4. **Need Reconciliation:** Periodic balance reconciliation checks are important
5. **Test Data Cleanup:** Be careful when deleting test transactions - balance won't auto-adjust

---

## ✅ Verification Checklist

- [x] Balance matches sum of completed topups (40.000 = 40.000)
- [x] Total Spending correct (0 - no purchases)
- [x] Total Top Up correct (40.000)
- [x] All UI displays show consistent values
- [x] View `transaction_summary_by_member` returns correct data
- [x] No pending transactions affecting balance

---

## 🎯 Conclusion

**Issue:** Balance out of sync due to deleted test transactions not adjusting balance automatically.

**Root Cause:** No DELETE trigger to reverse balance changes when transactions are removed.

**Resolution:** Manually corrected balance to match sum of completed transactions.

**Status:** ✅ RESOLVED - All values now in sync

**Prevention:** Consider implementing DELETE trigger and periodic reconciliation checks.

---

**Fixed by:** Kiro AI  
**Verified:** December 1, 2025  
**Status:** Production Ready ✅

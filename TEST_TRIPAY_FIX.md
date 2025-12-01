# 🧪 TEST TRIPAY FIX - VERIFICATION GUIDE

**Purpose:** Verify double balance bug is fixed  
**Expected:** User topup 10.000 → Balance +10.000 (not +19.180)  

---

## ✅ QUICK TEST (Recommended)

### Test Case: Small Topup

**Steps:**
1. Login as test user
2. Note current balance: **X**
3. Go to: `/member/top-up`
4. Enter amount: **Rp 10.000**
5. Select payment: **QRIS**
6. Create payment
7. Pay via Tripay (scan QR)
8. Wait 30 seconds for callback
9. Check new balance: **X + 10.000** ✅

**Expected Result:**
```
Before: X
After:  X + 10.000 ✅

NOT: X + 19.180 ❌
```

---

## 📊 DATABASE VERIFICATION

### Check Transaction Created Correctly

```sql
-- Get latest topup transaction
SELECT 
  id,
  user_id,
  transaction_type,
  amount,              -- Should be 10.000
  tripay_amount,       -- Should be 9.180
  tripay_fee,          -- Should be 820
  tripay_total_amount, -- Should be 10.000
  status,
  created_at
FROM transactions
WHERE transaction_type = 'topup'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:**
```
amount: 10000
tripay_amount: 9180
tripay_fee: 820
tripay_total_amount: 10000
status: completed
```

### Check Balance Updated Correctly

```sql
-- Check user balance after topup
SELECT 
  email,
  balance,
  updated_at
FROM users
WHERE id = 'user-id-from-test';
```

**Expected:** Balance increased by exactly 10.000

---

## 🔍 VERCEL LOGS VERIFICATION

### Check Callback Logs

**Steps:**
1. Go to: https://vercel.com/dashboard
2. Select: **canvango** project
3. Click: **Logs** tab
4. Filter: `api/tripay-callback`

**Expected Logs:**
```
[Tripay Callback] Merchant Ref: INV...
[Tripay Callback] Status: PAID
[Tripay Callback] ✅ Signature verified
[Tripay Callback] ✅ Transaction updated: completed
[Tripay Callback] 💵 Balance will be updated automatically by database trigger
=== TRIPAY CALLBACK PROCESSED SUCCESSFULLY ===
```

**⚠️ SHOULD NOT SEE:**
```
[Tripay Callback] Updating user balance...
[Tripay Callback] Amount: 9180
[Tripay Callback] ✅ Balance updated
[Tripay Callback] Old balance: ...
[Tripay Callback] New balance: ...
```

---

## ✅ BALANCE CONSISTENCY CHECK

### Verify All Users Consistent

```sql
SELECT 
  u.email,
  u.balance as current_balance,
  COALESCE(SUM(
    CASE 
      WHEN t.transaction_type = 'topup' AND t.status = 'completed' 
      THEN t.amount 
      WHEN t.transaction_type = 'refund' AND t.status = 'completed'
      THEN t.amount
      WHEN t.transaction_type = 'purchase' AND t.status = 'completed' 
      THEN -t.amount 
      ELSE 0 
    END
  ), 0) as expected_balance,
  u.balance = COALESCE(SUM(
    CASE 
      WHEN t.transaction_type = 'topup' AND t.status = 'completed' 
      THEN t.amount 
      WHEN t.transaction_type = 'refund' AND t.status = 'completed'
      THEN t.amount
      WHEN t.transaction_type = 'purchase' AND t.status = 'completed' 
      THEN -t.amount 
      ELSE 0 
    END
  ), 0) as is_consistent
FROM users u
LEFT JOIN transactions t ON t.user_id = u.id
GROUP BY u.id, u.email, u.balance
ORDER BY u.email;
```

**Expected:** All users `is_consistent = true`

---

## 🎯 SUCCESS CRITERIA

### Fix is Working If:
- [x] User topup 10.000 → balance +10.000 (not +19.180)
- [x] Logs show "Balance will be updated automatically by database trigger"
- [x] No manual balance update logs
- [x] Transaction.amount = 10.000
- [x] All user balances consistent

### Fix is NOT Working If:
- [ ] Balance still increases by 19.180
- [ ] Logs show manual balance update
- [ ] Balance inconsistency detected
- [ ] Trigger not firing

---

## 🚨 IF TEST FAILS

### Scenario 1: Balance Still Double (19.180)

**Check:**
1. Is code deployed? Check Vercel deployment status
2. Is trigger active? Run trigger verification query
3. Is transaction.amount correct? Check transaction table

**Action:**
```sql
-- Verify trigger
SELECT * FROM pg_trigger WHERE tgname = 'trigger_auto_update_balance';

-- Check transaction
SELECT amount, tripay_amount FROM transactions 
WHERE id = 'transaction-id-from-test';
```

### Scenario 2: Balance Not Increasing

**Check:**
1. Is trigger disabled?
2. Is transaction status = 'completed'?
3. Check Supabase logs for trigger errors

**Action:**
```sql
-- Check trigger function
SELECT routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'auto_update_user_balance';
```

### Scenario 3: Callback Error

**Check:**
1. Vercel logs for error details
2. Signature verification passed?
3. Environment variables correct?

**Action:**
- Check Vercel logs
- Verify TRIPAY_PRIVATE_KEY set
- Test callback signature manually

---

## 📞 EMERGENCY ROLLBACK

### If Critical Issue Detected

**Step 1: Rollback Database**
```sql
UPDATE users u
SET balance = b.balance, updated_at = b.updated_at
FROM users_backup_20251202 b
WHERE u.id = b.id;
```

**Step 2: Revert Code**
```bash
git revert 15f1f6c
git push origin main
```

**Step 3: Verify Rollback**
```sql
SELECT email, balance FROM users ORDER BY email;
```

---

## 📝 TEST CHECKLIST

### Pre-Test
- [ ] Backup verified exists
- [ ] Code deployed to production
- [ ] Trigger verified active

### During Test
- [ ] Note balance before topup
- [ ] Create topup transaction
- [ ] Pay via Tripay
- [ ] Wait for callback

### Post-Test
- [ ] Check balance increased by 10.000 only
- [ ] Verify Vercel logs correct
- [ ] Check database transaction
- [ ] Verify balance consistency

### Monitoring (24 Hours)
- [ ] Monitor all topup transactions
- [ ] Check for balance inconsistencies
- [ ] Alert if issues detected
- [ ] Document any anomalies

---

## ✅ EXPECTED OUTCOME

```
✅ User topup Rp 10.000
✅ Balance increases by Rp 10.000
✅ No double calculation
✅ All balances consistent
✅ Logs show trigger handling balance
✅ No manual balance update
```

---

**Test Guide by:** Kiro AI  
**Date:** 2 Desember 2025  
**Status:** Ready for Testing

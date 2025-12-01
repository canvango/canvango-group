# Debug: Transaction Not Saved to Database

## Problem
Transaksi top-up berhasil redirect ke Tripay payment page, tapi tidak tersimpan di database.

## Evidence

### Tripay Dashboard
- ✅ Transaction exists: `T67602870707W2G2M`
- ✅ Date: 01-12-2025 12:38:50
- ✅ Amount: Rp 10,000
- ✅ Status: BELUM DIBAYAR
- ✅ Customer: admin1@gmail.com

### Database
- ❌ Transaction NOT found in database
- ❌ No transactions created today (01-12-2025)
- ✅ Old transactions exist (29-11-2025)

## Root Cause Analysis

### Possible Causes

1. **Database Insert Failed Silently**
   - Error not thrown, just logged
   - Need to check Vercel logs for error details

2. **Unique Constraint Violation**
   - `tripay_reference` has UNIQUE constraint
   - If duplicate reference, insert will fail
   - But Tripay should generate unique references

3. **Trigger Error**
   - `trigger_auto_update_balance` runs AFTER INSERT
   - But only affects 'completed' status, not 'pending'
   - Should not cause insert to fail

4. **Permission Issue**
   - Supabase client might not have permission
   - But using service role key should have full access

## Changes Made

### File: `api/tripay-proxy.ts`

**Added detailed logging:**
```typescript
// Before insert
console.log('Saving transaction to database:', {
  user_id: user.id,
  tripay_reference: tripayData.reference,
  amount: amount,
});

// After insert - success
console.log('Transaction saved successfully:', {
  id: insertedData.id,
  reference: insertedData.tripay_reference,
});

// After insert - error
console.error('Failed to save transaction:', {
  error: dbError,
  code: dbError.code,
  message: dbError.message,
  details: dbError.details,
});
```

**Added metadata field:**
```typescript
metadata: {
  order_items: orderItems,
  customer_name: customerName,
  customer_email: customerEmail,
  customer_phone: customerPhone,
},
```

**Added .select() to verify insert:**
```typescript
const { data: insertedData, error: dbError } = await supabase
  .from('transactions')
  .insert(transactionData)
  .select()
  .single();
```

## Testing Steps

### 1. Wait for Deployment
Check: https://vercel.com/canvango/canvango-group
Status should show: ✅ Ready

### 2. Create New Top-Up Transaction
1. Go to: https://canvango.com/top-up
2. Select amount: Rp 10,000
3. Select method: QRIS
4. Click: "Bayar Sekarang"
5. Should redirect to Tripay ✅

### 3. Check Vercel Logs
1. Go to: https://vercel.com/canvango/canvango-group/logs
2. Filter: `/api/tripay-proxy`
3. Look for recent logs
4. Find these log messages:
   - "Tripay Proxy Configuration"
   - "Forwarding to GCP proxy"
   - "GCP proxy response"
   - "Saving transaction to database"
   - "Transaction saved successfully" OR "Failed to save transaction"

### 4. Check Database
```sql
SELECT 
  t.id,
  t.tripay_reference,
  t.amount,
  t.status,
  t.created_at,
  u.email
FROM transactions t
JOIN users u ON t.user_id = u.id
WHERE DATE(t.created_at) = CURRENT_DATE
ORDER BY t.created_at DESC;
```

Expected: New transaction should appear

### 5. Check Transaction History Page
1. Go to: https://canvango.com/riwayat-transaksi?tab=topup
2. Should see new transaction with status "Pending"

## Expected Logs (Success)

```
Tripay Proxy Configuration: { 
  gcpProxyUrl: 'http://34.182.126.200:3000', 
  hasEnvVar: true 
}

Forwarding to GCP proxy: {
  url: 'http://34.182.126.200:3000/create-transaction',
  request: { ... }
}

GCP proxy response: {
  status: 200,
  success: true,
  hasData: true
}

Saving transaction to database: {
  user_id: '4565ef2e-575e-4973-8e61-c9af5c9c8622',
  tripay_reference: 'T67602870707W2G2M',
  amount: 10000
}

Transaction saved successfully: {
  id: 'uuid-here',
  reference: 'T67602870707W2G2M'
}
```

## Expected Logs (Error)

```
Failed to save transaction: {
  error: { ... },
  code: '23505',  // Unique constraint violation
  message: 'duplicate key value violates unique constraint',
  details: 'Key (tripay_reference)=(T67602870707W2G2M) already exists.'
}
```

## Possible Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 23505 | Unique constraint violation | Check if reference already exists |
| 23503 | Foreign key violation | Check if user_id exists |
| 42501 | Insufficient privilege | Check Supabase permissions |
| 23502 | Not null violation | Check required fields |

## Database Constraints

### Unique Constraints
- `tripay_reference` - Must be unique
- Each Tripay transaction should have unique reference

### Foreign Keys
- `user_id` → `auth.users(id)` - Must exist
- `product_id` → `products(id)` - Can be NULL for topup

### Check Constraints
- `status` - Must be: pending, processing, completed, failed, cancelled
- `transaction_type` - Must be: purchase, topup, refund, warranty_claim

### Triggers
- `trigger_auto_update_balance` - Updates user balance on status change
- `update_transactions_updated_at` - Updates updated_at timestamp

## Next Actions

1. ✅ Deploy changes with detailed logging
2. ⏳ Wait for deployment (2-3 minutes)
3. ⏳ Create new test transaction
4. ⏳ Check Vercel logs for error details
5. ⏳ Fix based on error found
6. ⏳ Verify transaction appears in database
7. ⏳ Verify transaction appears in UI

## Status

- [x] Root cause investigation
- [x] Add detailed logging
- [x] Deploy changes
- [ ] Test new transaction
- [ ] Check Vercel logs
- [ ] Identify specific error
- [ ] Implement fix
- [ ] Verify fix works

---

**Current Status:** Waiting for deployment and test transaction

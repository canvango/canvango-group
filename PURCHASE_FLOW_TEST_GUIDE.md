# Purchase Flow - Quick Test Guide

## Test Environment

**Test User:**
- Email: `member1@gmail.com`
- Balance: Rp 6.000.000
- Role: member

**Available Products:**
1. **BM 50 NEW INDONESIA** - Rp 150.000 (1 stock available)
2. **AKUN BM VERIFIED SUPPORT WhatsApp API** - Rp 1.500.000 (1 stock available)

## Test Steps

### 1. Login as Test User

1. Open browser: `http://localhost:5173`
2. Login with:
   - Email: `member1@gmail.com`
   - Password: [your password]

### 2. Navigate to BM Accounts

1. Click "Akun BM" in sidebar
2. URL should be: `http://localhost:5173/akun-bm`

### 3. Test Purchase Flow

#### Test Case 1: Successful Purchase (BM 50 NEW)

1. Find product "BM 50 NEW INDONESIA"
2. Verify stock shows: "1 Akun"
3. Click "Beli" button
4. **Verify Purchase Modal:**
   - ✅ Product name displayed correctly
   - ✅ Price: Rp 150.000
   - ✅ Your balance: Rp 6.000.000
   - ✅ Stock: 1 Akun
   - ✅ Quantity: 1 (default)
   - ✅ Total: Rp 150.000
   - ✅ "Konfirmasi Pembelian" button is enabled
5. Click "Konfirmasi Pembelian"
6. **Expected Result:**
   - ✅ Success alert with transaction ID
   - ✅ Modal closes
   - ✅ Balance updated to: Rp 5.850.000
   - ✅ Product stock updated to: 0 Akun
   - ✅ Product shows "Stok Habis" badge

#### Test Case 2: Out of Stock

1. Try to buy "BM 50 NEW INDONESIA" again
2. **Expected Result:**
   - ✅ "Beli" button is disabled
   - ✅ Shows "Stok Habis" badge

#### Test Case 3: Successful Purchase (WhatsApp API)

1. Find product "AKUN BM VERIFIED SUPPORT WhatsApp API"
2. Click "Beli" button
3. Verify modal shows:
   - Price: Rp 1.500.000
   - Your balance: Rp 5.850.000
   - Total: Rp 1.500.000
4. Click "Konfirmasi Pembelian"
5. **Expected Result:**
   - ✅ Success alert
   - ✅ Balance updated to: Rp 4.350.000
   - ✅ Product stock: 0

## Console Logs to Check

Open browser DevTools (F12) → Console tab

**Expected logs during purchase:**

```
🛒 purchaseProduct called with: {productId: "...", quantity: 1}
✅ User authenticated: c79d1221-ab3c-49f1-b043-4fc0ddb0e09f
📥 Purchase RPC result: {success: true, transaction_id: "...", ...}
✅ Purchase completed successfully
```

**No errors should appear!**

## Database Verification

After successful purchase, verify in database:

### Check Transaction Created

```sql
SELECT 
  t.id,
  t.transaction_type,
  t.amount,
  t.status,
  t.created_at,
  p.product_name
FROM transactions t
JOIN products p ON t.product_id = p.id
WHERE t.user_id = 'c79d1221-ab3c-49f1-b043-4fc0ddb0e09f'
ORDER BY t.created_at DESC
LIMIT 1;
```

**Expected:**
- transaction_type: 'purchase'
- status: 'completed'
- amount: 150000 or 1500000

### Check Purchase Record

```sql
SELECT 
  p.id,
  p.product_name,
  p.quantity,
  p.total_price,
  p.account_details,
  p.warranty_expires_at,
  p.status,
  p.created_at
FROM purchases p
WHERE p.user_id = 'c79d1221-ab3c-49f1-b043-4fc0ddb0e09f'
ORDER BY p.created_at DESC
LIMIT 1;
```

**Expected:**
- quantity: 1
- total_price: 150000 or 1500000
- account_details: JSON with account credentials
- warranty_expires_at: 30 days from now
- status: 'active'

### Check Account Assigned

```sql
SELECT 
  pa.id,
  pa.status,
  pa.assigned_to_transaction_id,
  pa.assigned_at,
  p.product_name
FROM product_accounts pa
JOIN products p ON pa.product_id = p.id
WHERE pa.assigned_to_transaction_id IS NOT NULL
ORDER BY pa.assigned_at DESC
LIMIT 1;
```

**Expected:**
- status: 'sold'
- assigned_to_transaction_id: [transaction UUID]
- assigned_at: [current timestamp]

### Check User Balance

```sql
SELECT 
  id,
  email,
  balance,
  updated_at
FROM users
WHERE id = 'c79d1221-ab3c-49f1-b043-4fc0ddb0e09f';
```

**Expected:**
- balance: 5850000 (after first purchase) or 4350000 (after both)

## Troubleshooting

### Error: "User not authenticated"

**Solution:**
1. Refresh page
2. Login again
3. Check browser console for auth errors

### Error: "Insufficient stock available"

**Cause:** Product has no available accounts in pool

**Solution:**
1. Check database: `SELECT * FROM product_accounts WHERE product_id = '...' AND status = 'available'`
2. Add accounts to pool if needed

### Error: "Insufficient balance"

**Cause:** User balance < product price

**Solution:**
1. Check user balance: `SELECT balance FROM users WHERE id = '...'`
2. Top up balance if needed (admin panel)

### Modal shows wrong balance

**Cause:** React Query cache not updated

**Solution:**
1. Refresh page
2. Check if `fetchUserProfile` is working
3. Check console for API errors

## Success Criteria

✅ Purchase completes without errors
✅ Balance is deducted correctly
✅ Stock is reduced correctly
✅ Transaction record created
✅ Purchase record created with account details
✅ Account marked as 'sold' in pool
✅ Warranty expiration calculated correctly
✅ UI updates immediately (React Query invalidation)

## Next Steps After Testing

If all tests pass:
1. ✅ Mark purchase flow as working
2. ✅ Test with different products
3. ✅ Test edge cases (concurrent purchases)
4. ⏳ Implement purchase history page
5. ⏳ Implement account details view
6. ⏳ Implement warranty claim feature

## Support

If you encounter issues:
1. Check console logs
2. Check database records
3. Review `PURCHASE_FLOW_FIX.md` for architecture details
4. Check Supabase logs for RPC errors

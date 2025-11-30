# Tripay Callback - Old vs New Implementation

## 🔄 Major Changes

### Environment Variables

**Old:**
```typescript
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const tripayPrivateKey = process.env.VITE_TRIPAY_PRIVATE_KEY;
```

**New:**
```typescript
const supabaseUrl = process.env.SUPABASE_URL;
const tripayPrivateKey = process.env.TRIPAY_PRIVATE_KEY;
```

**Why:** Server-side code should NOT use `VITE_*` prefix (that's for frontend only)

### Event Validation

**Old:**
```typescript
// No event validation
```

**New:**
```typescript
const callbackEvent = req.headers['x-callback-event'] as string;

if (callbackEvent !== 'payment_status') {
  return res.status(200).json({
    success: false,
    message: `Unrecognized callback event: ${callbackEvent || 'none'}`
  });
}
```

**Why:** Tripay documentation requires event validation

### Transaction Lookup

**Old:**
```typescript
// Update by merchant_ref only
await supabase
  .from('transactions')
  .update({ ... })
  .eq('merchant_ref', merchant_ref);
```

**New:**
```typescript
// Find by merchant_ref AND reference
const { data: transaction } = await supabase
  .from('transactions')
  .select('*')
  .eq('tripay_merchant_ref', merchant_ref)
  .eq('tripay_reference', reference)
  .single();

// Only process if status is 'pending'
if (transaction.status !== 'pending') {
  return res.status(200).json({
    success: true,
    message: 'Transaction already processed'
  });
}
```

**Why:** 
- More secure (verify both merchant_ref and reference)
- Idempotent (prevent double processing)
- Uses correct column names (tripay_merchant_ref, tripay_reference)

### Balance Update

**Old:**
```typescript
// Relied on database trigger
console.log('Note: User balance will be updated automatically by database trigger');
```

**New:**
```typescript
// Explicitly update balance in callback
if (shouldUpdateBalance && amount_received > 0) {
  const { data: user } = await supabase
    .from('users')
    .select('balance')
    .eq('id', transaction.user_id)
    .single();

  const newBalance = Number(user.balance) + Number(amount_received);
  
  await supabase
    .from('users')
    .update({
      balance: newBalance,
      updated_at: new Date().toISOString()
    })
    .eq('id', transaction.user_id);
}
```

**Why:** 
- Explicit is better than implicit
- No dependency on database triggers
- Full control over balance updates
- Better logging and error handling

### Response Format

**Old:**
```typescript
// Sometimes returned success:false
return res.status(200).json({ 
  success: false, 
  message: 'Invalid signature' 
});

// Sometimes returned success:true with extra fields
return res.status(200).json({ 
  success: true,
  message: 'Callback processed (test mode - no database update)',
});
```

**New:**
```typescript
// Success: Only {"success": true}
return res.status(200).json({
  success: true
});

// Error: {"success": false, "message": "..."}
return res.status(200).json({
  success: false,
  message: 'Invalid signature'
});
```

**Why:** Follows Tripay documentation exactly

### Status Mapping

**Old:**
```typescript
switch (status) {
  case 'PAID':
    transactionStatus = 'completed';
    break;
  case 'EXPIRED':
    transactionStatus = 'expired';
    break;
  case 'FAILED':
    transactionStatus = 'failed';
    break;
  case 'REFUND':
    transactionStatus = 'refunded';
    break;
  default:
    transactionStatus = 'pending';
}
```

**New:**
```typescript
switch (status) {
  case 'PAID':
    newStatus = 'completed';
    shouldUpdateBalance = true;
    break;
  case 'EXPIRED':
    newStatus = 'expired';
    break;
  case 'FAILED':
    newStatus = 'failed';
    break;
  case 'REFUND':
    newStatus = 'refunded';
    break;
  default:
    return res.status(200).json({
      success: false,
      message: 'Unrecognized payment status'
    });
}
```

**Why:** 
- Explicit error for unknown status
- Flag for balance update
- No fallback to 'pending'

### Database Fields

**Old:**
```typescript
await supabase
  .from('transactions')
  .update({
    status: transactionStatus,
    payment_reference: reference,
    payment_method: payment_method,
    payment_method_code: payment_method_code,
    total_amount: total_amount,
    fee_merchant: fee_merchant,
    fee_customer: fee_customer,
    total_fee: total_fee,
    amount_received: amount_received,
    paid_at: paid_at ? new Date(paid_at * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),
  })
  .eq('merchant_ref', merchant_ref);
```

**New:**
```typescript
await supabase
  .from('transactions')
  .update({
    status: newStatus,
    tripay_status: status,
    tripay_paid_at: paid_at ? new Date(paid_at * 1000).toISOString() : null,
    tripay_callback_data: callbackData,
    payment_method: payment_method,
    tripay_payment_method: payment_method_code,
    tripay_payment_name: payment_method,
    tripay_amount: total_amount - total_fee,
    tripay_fee: total_fee,
    tripay_total_amount: total_amount,
    completed_at: status === 'PAID' ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  })
  .eq('id', transaction.id);
```

**Why:** 
- Uses correct Tripay-prefixed column names
- Stores full callback data for debugging
- Updates by transaction ID (more secure)
- Sets completed_at timestamp

## 📊 Comparison Table

| Aspect | Old Implementation | New Implementation |
|--------|-------------------|-------------------|
| **Env Vars** | `VITE_SUPABASE_URL`, `VITE_TRIPAY_PRIVATE_KEY` | `SUPABASE_URL`, `TRIPAY_PRIVATE_KEY` |
| **Event Validation** | ❌ None | ✅ Validates "payment_status" |
| **Transaction Lookup** | By merchant_ref only | By merchant_ref + reference |
| **Idempotency** | ❌ No check | ✅ Only process if 'pending' |
| **Balance Update** | Database trigger | Explicit in callback |
| **Response Format** | Inconsistent | Follows Tripay docs |
| **Status Mapping** | Fallback to 'pending' | Error on unknown status |
| **Database Fields** | Generic names | Tripay-prefixed names |
| **Callback Data** | ❌ Not stored | ✅ Stored in tripay_callback_data |
| **Logging** | Basic | Comprehensive |
| **Error Handling** | Sometimes success:true | Proper success:false |

## 🎯 Benefits of New Implementation

### 1. Follows Official Documentation

✅ Implements all requirements from https://tripay.co.id/developer?tab=callback
✅ Proper signature verification
✅ Event validation
✅ Correct response format

### 2. Better Security

✅ Validates both merchant_ref and reference
✅ Checks transaction status before processing
✅ Uses correct environment variable names

### 3. Idempotency

✅ Prevents double processing
✅ Returns success if already processed
✅ No duplicate balance updates

### 4. Better Debugging

✅ Stores full callback data
✅ Comprehensive logging
✅ Clear error messages

### 5. Explicit Balance Updates

✅ No dependency on database triggers
✅ Full control over balance logic
✅ Better error handling

### 6. Correct Database Schema

✅ Uses tripay_* prefixed columns
✅ Stores all Tripay data
✅ Proper timestamps

## 🔄 Migration Steps

### 1. Update Environment Variables

**Vercel Dashboard → Settings → Environment Variables**

Remove:
- `VITE_SUPABASE_URL`
- `VITE_TRIPAY_PRIVATE_KEY`

Add:
- `SUPABASE_URL` = https://your-project.supabase.co
- `TRIPAY_PRIVATE_KEY` = BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz

Keep:
- `SUPABASE_SERVICE_ROLE_KEY` (unchanged)

### 2. Deploy New Code

```bash
git add api/tripay-callback.ts
git commit -m "feat: rewrite Tripay callback per official documentation"
git push origin main
```

### 3. Test Callback

1. Wait 1-2 minutes for deployment
2. Test in Tripay Dashboard
3. Verify logs in Vercel

### 4. Monitor Real Payments

1. Create test top-up transaction
2. Make payment
3. Verify callback received
4. Check transaction status updated
5. Check balance updated

## ⚠️ Breaking Changes

### Environment Variables

**Action Required:** Update environment variables in Vercel

**Old:**
```
VITE_SUPABASE_URL
VITE_TRIPAY_PRIVATE_KEY
```

**New:**
```
SUPABASE_URL
TRIPAY_PRIVATE_KEY
```

### Database Columns

**No action required** - New implementation uses existing columns:
- `tripay_merchant_ref`
- `tripay_reference`
- `tripay_status`
- `tripay_paid_at`
- `tripay_callback_data`
- etc.

### Response Format

**No action required** - Tripay only cares about `{"success": true/false}`

## ✅ Backward Compatibility

- ✅ Uses existing database schema
- ✅ Works with existing transactions
- ✅ No data migration needed
- ✅ Only environment variables need update

## 🎉 Summary

**Old Implementation:**
- Worked but had issues
- Not following official docs
- Used wrong env var names
- No event validation
- Relied on database triggers
- Inconsistent responses

**New Implementation:**
- ✅ Follows official Tripay documentation
- ✅ Proper environment variable names
- ✅ Event validation
- ✅ Explicit balance updates
- ✅ Idempotent processing
- ✅ Better error handling
- ✅ Comprehensive logging
- ✅ Stores full callback data

---

**Recommendation:** Deploy new implementation immediately
**Risk:** Low (backward compatible, only env vars need update)
**Benefit:** High (proper implementation, better reliability)

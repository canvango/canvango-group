# Tripay Callback - Official Implementation

## 📋 Overview

Endpoint callback Tripay telah ditulis ulang sesuai dokumentasi resmi:
https://tripay.co.id/developer?tab=callback

**File:** `api/tripay-callback.ts`
**Endpoint:** `POST https://canvango.com/api/tripay-callback`

## 🎯 Implementation Details

### 1. Raw Body Reading

```typescript
// Read raw body for signature verification
let rawBody: string;
let callbackData: any;

if (typeof req.body === 'string') {
  rawBody = req.body;
  callbackData = JSON.parse(rawBody);
} else if (req.body && typeof req.body === 'object') {
  callbackData = req.body;
  rawBody = JSON.stringify(req.body);
} else {
  // Read from stream
  rawBody = '';
  await new Promise<void>((resolve, reject) => {
    req.on('data', (chunk) => {
      rawBody += chunk.toString('utf8');
    });
    req.on('end', () => resolve());
    req.on('error', (err) => reject(err));
  });
  callbackData = JSON.parse(rawBody);
}
```

### 2. Signature Verification

```typescript
function verifyTripaySignature(
  rawBody: string,
  receivedSignature: string,
  privateKey: string
): boolean {
  const calculatedSignature = crypto
    .createHmac('sha256', privateKey)
    .update(rawBody)
    .digest('hex');
  
  return calculatedSignature === receivedSignature;
}
```

**Environment Variable:** `TRIPAY_PRIVATE_KEY` (bukan `VITE_TRIPAY_PRIVATE_KEY`)

### 3. Event Validation

```typescript
const callbackEvent = req.headers['x-callback-event'] as string;

if (callbackEvent !== 'payment_status') {
  return res.status(200).json({
    success: false,
    message: `Unrecognized callback event: ${callbackEvent || 'none'}`
  });
}
```

### 4. Transaction Lookup

```typescript
const { data: transaction, error: findError } = await supabase
  .from('transactions')
  .select('*')
  .eq('tripay_merchant_ref', merchant_ref)
  .eq('tripay_reference', reference)
  .single();

// Only process if status is still 'pending'
if (transaction.status !== 'pending') {
  return res.status(200).json({
    success: true,
    message: 'Transaction already processed'
  });
}
```

### 5. Status Mapping

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

### 6. Transaction Update

```typescript
const { error: updateError } = await supabase
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

### 7. Balance Update (PAID Status Only)

```typescript
if (shouldUpdateBalance && amount_received > 0) {
  // Get current balance
  const { data: user } = await supabase
    .from('users')
    .select('balance')
    .eq('id', transaction.user_id)
    .single();

  // Update balance
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

## 📊 Callback Data Structure

Tripay mengirim JSON seperti ini:

```json
{
  "reference": "T0001000023000XXXXX",
  "merchant_ref": "INV123456",
  "payment_method": "BCA Virtual Account",
  "payment_method_code": "BCAVA",
  "total_amount": 200000,
  "fee_merchant": 2000,
  "fee_customer": 0,
  "total_fee": 2000,
  "amount_received": 198000,
  "is_closed_payment": 1,
  "status": "PAID",
  "paid_at": 1608133017,
  "note": null
}
```

**Headers:**
- `X-Callback-Signature`: HMAC-SHA256(privateKey, rawJsonBody)
- `X-Callback-Event`: "payment_status"

## 🔧 Environment Variables

**Required:**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
TRIPAY_PRIVATE_KEY=BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz
```

**Important:** Gunakan `TRIPAY_PRIVATE_KEY` (bukan `VITE_TRIPAY_PRIVATE_KEY`)

## 📝 Response Format

### Success Response

```json
{
  "success": true
}
```

### Error Responses

```json
{
  "success": false,
  "message": "Invalid signature"
}
```

```json
{
  "success": false,
  "message": "Unrecognized callback event: test_event"
}
```

```json
{
  "success": false,
  "message": "Transaction not found or already processed"
}
```

```json
{
  "success": false,
  "message": "Unrecognized payment status"
}
```

**All responses return HTTP 200** (Tripay requirement)

## 🔄 Flow Diagram

```
1. Tripay sends POST request
   ↓
2. Verify X-Callback-Event = "payment_status"
   ↓
3. Read raw body
   ↓
4. Verify HMAC-SHA256 signature
   ↓
5. Find transaction by merchant_ref + reference
   ↓
6. Check if status is still 'pending'
   ↓
7. Map Tripay status to our status
   ↓
8. Update transaction in database
   ↓
9. If PAID: Update user balance
   ↓
10. Return {"success": true}
```

## 🧪 Testing

### Test Callback (Tripay Dashboard)

1. Login to Tripay Merchant Dashboard
2. Go to: Pengaturan → Callback
3. URL: `https://canvango.com/api/tripay-callback`
4. Click "Test Callback"

**Expected Response:**
```json
{
  "success": true,
  "message": "Test callback acknowledged"
}
```

### Real Payment Flow

1. User creates top-up transaction
2. User pays via Tripay
3. Tripay sends callback to our endpoint
4. Endpoint verifies signature
5. Endpoint updates transaction status
6. Endpoint updates user balance
7. User sees updated balance in dashboard

## 📊 Database Changes

### transactions Table

**Updated Fields:**
- `status`: 'pending' → 'completed'/'expired'/'failed'/'refunded'
- `tripay_status`: 'PAID'/'EXPIRED'/'FAILED'/'REFUND'
- `tripay_paid_at`: Timestamp when paid
- `tripay_callback_data`: Full callback JSON
- `payment_method`: Payment method name
- `tripay_payment_method`: Payment method code
- `tripay_payment_name`: Payment method name
- `tripay_amount`: Amount before fee
- `tripay_fee`: Transaction fee
- `tripay_total_amount`: Total amount including fee
- `completed_at`: Timestamp when completed
- `updated_at`: Current timestamp

### users Table

**Updated Fields (PAID status only):**
- `balance`: balance + amount_received
- `updated_at`: Current timestamp

## 🔍 Logging

All important events are logged:

```
[Tripay Callback] Merchant Ref: INV123456
[Tripay Callback] Reference: T0001000023000XXXXX
[Tripay Callback] Status: PAID
[Tripay Callback] Payment Method: BCA Virtual Account
[Tripay Callback] ✅ Signature verified
[Tripay Callback] Found transaction: uuid-here
[Tripay Callback] Current status: pending
[Tripay Callback] New status: PAID
[Tripay Callback] ✅ Transaction updated: completed
[Tripay Callback] Updating user balance...
[Tripay Callback] User ID: uuid-here
[Tripay Callback] Amount: 198000
[Tripay Callback] ✅ Balance updated
[Tripay Callback] Old balance: 0
[Tripay Callback] New balance: 198000
=== TRIPAY CALLBACK PROCESSED SUCCESSFULLY ===
```

## ⚠️ Important Notes

1. **Signature Verification:** Menggunakan HMAC-SHA256 dengan raw body
2. **Event Validation:** Hanya menerima "payment_status"
3. **Idempotency:** Hanya proses transaksi dengan status 'pending'
4. **Balance Update:** Hanya untuk status 'PAID'
5. **HTTP 200:** Selalu return 200 (Tripay requirement)
6. **Service Role:** Menggunakan Supabase service role key

## 🚀 Deployment

```bash
git add api/tripay-callback.ts
git commit -m "feat: rewrite Tripay callback per official documentation"
git push origin main
```

Vercel will auto-deploy in 1-2 minutes.

## ✅ Success Criteria

- [x] Raw body reading for signature verification
- [x] HMAC-SHA256 signature verification
- [x] Event validation (payment_status)
- [x] Transaction lookup by merchant_ref + reference
- [x] Status mapping (PAID/EXPIRED/FAILED/REFUND)
- [x] Transaction update with all Tripay fields
- [x] Balance update on PAID status
- [x] Proper error handling
- [x] HTTP 200 response always
- [x] Comprehensive logging

---

**Status:** ✅ READY FOR DEPLOYMENT
**Based on:** Tripay Official Documentation
**Date:** 2025-12-01

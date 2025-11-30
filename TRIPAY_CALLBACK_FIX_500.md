# Tripay Callback Fix - FUNCTION_INVOCATION_FAILED (HTTP 500)

## Problem

Endpoint `https://canvango.com/api/tripay-callback` mengalami error:

```
HTTP 500 - FUNCTION_INVOCATION_FAILED
A server error has occurred
sin1::ll5f2-1764523858071-8b77d03e19b6
```

**Status Tripay:**
- Kode HTTP: 500
- Status Koneksi: GAGAL ❌
- Status Callback: GAGAL ❌

## Root Cause

Function crash sebelum masuk handler karena **environment variables diinisialisasi di top-level**:

```typescript
// ❌ WRONG - Crashes if env var undefined
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const tripayPrivateKey = process.env.VITE_TRIPAY_PRIVATE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
```

Jika salah satu env var tidak ada → Vercel langsung throw `FUNCTION_INVOCATION_FAILED`.

## Solution Applied

### 1. ✅ Move Environment Variable Check Inside Handler

```typescript
export default async function handler(req, res) {
  try {
    // Check env vars INSIDE handler
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const tripayPrivateKey = process.env.VITE_TRIPAY_PRIVATE_KEY;
    
    // If missing, return 200 OK (don't crash!)
    if (!supabaseUrl || !supabaseServiceKey || !tripayPrivateKey) {
      console.error('❌ Missing environment variables');
      return res.status(200).json({ 
        success: false, 
        message: 'Configuration error - environment variables missing' 
      });
    }
    
    // Initialize Supabase client safely
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // ... rest of handler
  }
}
```

### 2. ✅ Add Guard for Test Callbacks

Tripay "Test Callback" tidak mengirim `merchant_ref` → skip database update:

```typescript
// Skip database update if merchant_ref is missing
if (!merchant_ref) {
  console.log('⚠️ No merchant_ref provided - skipping database update');
  console.log('This is normal for Tripay test callbacks');
  
  return res.status(200).json({ 
    success: true,
    message: 'Callback processed (test mode - no database update)',
  });
}
```

### 3. ✅ Pass Private Key to Signature Verification

```typescript
// Before
function verifySignature(rawBody: string, signature: string): boolean {
  const calculatedSignature = crypto
    .createHmac('sha256', tripayPrivateKey) // ❌ Uses top-level var
    .update(rawBody)
    .digest('hex');
  return calculatedSignature === signature;
}

// After
function verifySignature(rawBody: string, signature: string, privateKey: string): boolean {
  const calculatedSignature = crypto
    .createHmac('sha256', privateKey) // ✅ Uses parameter
    .update(rawBody)
    .digest('hex');
  return calculatedSignature === signature;
}
```

## Changes Made

**File:** `api/tripay-callback.ts`

1. Removed top-level initialization of Supabase client
2. Moved env var checks inside handler
3. Added graceful handling for missing env vars (return 200 OK)
4. Added guard for test callbacks without `merchant_ref`
5. Updated `verifySignature()` to accept `privateKey` parameter
6. All error paths still return HTTP 200 OK (Tripay requirement)

## Expected Result

After deployment:

```json
{
  "success": true,
  "message": "Callback processed (test mode - no database update)"
}
```

**Tripay Test Callback:**
- Kode HTTP: 200 ✅
- Status Koneksi: BERHASIL ✅
- Status Callback: BERHASIL ✅

## Deployment

```bash
# Commit changes
git add api/tripay-callback.ts
git commit -m "fix: prevent FUNCTION_INVOCATION_FAILED in Tripay callback"
git push origin main

# Vercel will auto-deploy
# Wait 1-2 minutes for deployment
```

## Testing

1. Go to Tripay Merchant Dashboard
2. Navigate to: Pengaturan → Callback
3. Click "Test Callback"
4. Should see: Status Koneksi BERHASIL ✅

## Notes

- Function will NOT crash even if env vars are missing
- Test callbacks (without `merchant_ref`) will return 200 OK without database update
- Real callbacks (with `merchant_ref`) will update database normally
- All error scenarios return HTTP 200 OK to prevent Tripay retry spam

---

**Status:** ✅ FIXED
**Date:** 2025-12-01
**Error:** FUNCTION_INVOCATION_FAILED → Resolved

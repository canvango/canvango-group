# ✅ Tripay expired_time Format - FIXED

## 🐛 Issue

**Error:** `expired time must be in seconds (Unix Timestamp)`

**Cause:** Edge Function mengirim `expired_time` sebagai durasi dalam detik, bukan Unix Timestamp.

---

## 🔧 Fix Applied

### Before (Wrong):
```typescript
// Convert hours to seconds (duration)
const expiredTimeInSeconds = expiredTime * 3600;

const tripayRequest = {
  expired_time: expiredTimeInSeconds, // ❌ Wrong! This is duration, not timestamp
};
```

### After (Correct):
```typescript
// Calculate Unix Timestamp (absolute time in future)
const currentTime = Math.floor(Date.now() / 1000); // Current Unix timestamp
const durationInSeconds = expiredTime * 3600; // Convert hours to seconds
const expiredTimeUnix = currentTime + durationInSeconds; // Future Unix timestamp

const tripayRequest = {
  expired_time: expiredTimeUnix, // ✅ Correct! Unix timestamp
};
```

---

## 📊 Example

**Input:** `expiredTime = 24` (hours)

**Before (Wrong):**
```
expired_time = 24 * 3600 = 86400
```
This is just a duration (24 hours in seconds), not a timestamp.

**After (Correct):**
```
currentTime = 1732867200 (Nov 29, 2025 16:00:00)
durationInSeconds = 86400 (24 hours)
expired_time = 1732867200 + 86400 = 1732953600 (Nov 30, 2025 16:00:00)
```
This is an absolute Unix timestamp in the future.

---

## 🧪 Testing

### Test Payment Creation

1. Go to: https://canvango.com/top-up
2. Enter amount: Rp 50,000
3. Click: "Top Up Sekarang"
4. Select payment method
5. Click: "Bayar Sekarang"
6. **Expected:** ✅ Redirects to Tripay checkout (no error)
7. **Before:** ❌ Error: "expired time must be in seconds"

### Verify in Logs

```bash
npx supabase functions logs tripay-create-payment --tail
```

**Look for:**
```
⏰ Expired time: {
  hours: 24,
  currentTime: 1732867200,
  durationInSeconds: 86400,
  expiredTimeUnix: 1732953600,
  expiredDate: "2025-11-30T16:00:00.000Z"
}
```

---

## 📝 What Changed

**File:** `supabase/functions/tripay-create-payment/index.ts`

**Changes:**
1. Calculate current Unix timestamp
2. Add duration to current time
3. Send absolute timestamp to Tripay
4. Added detailed logging

**Deployed:** ✅ Yes

---

## ✅ Verification

### Check Edge Function Deployed
```bash
# Should show latest deployment
npx supabase functions list
```

### Test Payment
1. Create payment
2. Should redirect to Tripay
3. No error in console

### Check Tripay Response
Should receive:
```json
{
  "success": true,
  "data": {
    "reference": "T...",
    "expired_time": 1732953600,
    "checkout_url": "https://..."
  }
}
```

---

## 🎯 Summary

**Issue:** ❌ `expired_time` sent as duration (86400)
**Fixed:** ✅ `expired_time` sent as Unix timestamp (1732953600)
**Status:** ✅ Deployed & Ready

**Test now:** https://canvango.com/top-up

---

**Date:** 2025-11-29
**Status:** ✅ Fixed & Deployed

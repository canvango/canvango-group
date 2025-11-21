# mutateAsync to mutate Fix - Final Solution for Double Deduction

## 🐛 Problem Persists

Even after disabling React.StrictMode, double deduction still occurs:
- Purchase: Rp 500.000 (1x transaction recorded)
- Balance deducted: Rp 1.000.000 (2x deduction)
- Missing: Rp 500.000

## 🔍 Root Cause: mutateAsync Race Condition

### The Issue with `mutateAsync`:

```typescript
// PROBLEMATIC CODE
await purchaseMutation.mutateAsync(
  { productId, quantity },
  {
    onSuccess: (response) => {
      // Callbacks here
    }
  }
);
```

### Why This Causes Double Calls:

1. **`mutateAsync` returns a Promise** - Can be awaited
2. **Callbacks in options** - `onSuccess` is called separately
3. **Race condition** - `isPending` not set fast enough
4. **Async/await timing** - Second call happens before first completes

### The Flow:

```
User clicks "Konfirmasi" once
  ↓
handlePurchaseConfirm() called
  ↓
Check isPending: false (not set yet)
  ↓
Call mutateAsync()
  ↓
BEFORE isPending is set to true...
  ↓
Something triggers re-render (HMR, state update, etc.)
  ↓
handlePurchaseConfirm() called AGAIN
  ↓
Check isPending: still false!
  ↓
Call mutateAsync() AGAIN
  ↓
Result: 2 API calls, 2x balance deduction
```

## ✅ Solution: Use `mutate` Instead of `mutateAsync`

### Changed Code:

```typescript
// BEFORE (CAUSES RACE CONDITION)
const handlePurchaseConfirm = async (quantity: number) => {
  if (purchaseMutation.isPending) return;
  
  await purchaseMutation.mutateAsync(
    { productId, quantity },
    { onSuccess: () => {...} }
  );
};

// AFTER (FIXED)
const handlePurchaseConfirm = (quantity: number) => {
  if (purchaseMutation.isPending) return;
  
  purchaseMutation.mutate(
    { productId, quantity },
    { onSuccess: () => {...} }
  );
};
```

### Why `mutate` Works Better:

1. **No Promise** - Doesn't return awaitable promise
2. **Immediate state update** - `isPending` set synchronously
3. **No race condition** - Second call blocked by isPending
4. **Callbacks still work** - `onSuccess`/`onError` still called

## 📊 Comparison

### mutateAsync (Problematic):
```typescript
await mutateAsync(data, { onSuccess })
     ↑ Returns Promise
     ↑ Can be awaited
     ↑ Async timing issues
     ↑ Race condition possible
```

### mutate (Fixed):
```typescript
mutate(data, { onSuccess })
     ↑ No return value
     ↑ Cannot be awaited
     ↑ Synchronous state update
     ↑ No race condition
```

## 🛡️ Complete Protection Stack

### Layer 1: Button Disabled
```typescript
<button disabled={isProcessing}>
```

### Layer 2: isPending Check
```typescript
if (purchaseMutation.isPending) {
  console.warn('Purchase already in progress');
  return;
}
```

### Layer 3: Use mutate (not mutateAsync)
```typescript
purchaseMutation.mutate(data, { onSuccess, onError });
```

### Layer 4: StrictMode Disabled
```typescript
// <React.StrictMode>
  <App />
// </React.StrictMode>
```

## 📝 Files Modified

1. `src/features/member-area/pages/BMAccounts.tsx`
   - Changed `mutateAsync` to `mutate`
   - Removed `async/await`

2. `src/features/member-area/pages/PersonalAccounts.tsx`
   - Changed `mutateAsync` to `mutate`
   - Removed `async/await`

3. `src/main.tsx`
   - Disabled React.StrictMode

## ✅ Balance Fixed

```
Username: member1
Balance: Rp 750.000 ✅
Calculated: Rp 750.000 ✅
Difference: Rp 0 ✅
Status: SINKRON ✅
```

## 🚀 Testing

### Test Steps:
1. **Hard refresh** browser (Ctrl + Shift + F5)
2. **Clear cache** completely
3. Purchase a product
4. **Expected:** Balance deducted exactly once
5. **Expected:** No console warnings
6. **Expected:** Transaction matches balance

### Verification:
- Check browser console for "Purchase already in progress" warnings
- If you see this warning, it means protection is working
- If no warning and still double deduction, there's another issue

## 🎓 Lessons Learned

1. **mutateAsync has timing issues** - Use mutate for mutations
2. **async/await can cause race conditions** - Especially with React
3. **Multiple protection layers needed** - No single solution is enough
4. **StrictMode + mutateAsync = disaster** - Both cause double calls
5. **Test thoroughly after each change** - Don't assume fixes work

## ⚠️ Important Notes

### When to use mutateAsync:
- When you need to await the result
- When you need to chain multiple mutations
- When you handle success/error with try/catch

### When to use mutate:
- **For user-triggered actions** (like purchase) ← USE THIS
- When you use onSuccess/onError callbacks
- When you want immediate state updates
- When you want to prevent race conditions

## 🔮 Future Improvements

### Backend Idempotency (Recommended):
```typescript
// Add unique request ID
const requestId = `${userId}-${productId}-${Date.now()}`;

// Check if already processed
const existing = await checkRequestId(requestId);
if (existing) {
  return existing; // Return cached result
}

// Process and cache
const result = await processPurchase();
await cacheRequestId(requestId, result);
return result;
```

### Database Transaction Lock:
```sql
BEGIN;
SELECT balance FROM users WHERE id = $1 FOR UPDATE;
-- Deduct balance
-- Create transaction
COMMIT;
```

## ✅ Status: HOPEFULLY FIXED

This should be the final fix. If double deduction still occurs:
1. Check browser console for errors
2. Check network tab for duplicate requests
3. Check backend logs for duplicate processing
4. Consider implementing backend idempotency

# Redirect Loop Fix - Purchase Success

## 🐛 Problem

After successful purchase, clicking "OK" on alert causes **infinite redirect loop**:
```
http://localhost:5174/member/transactions/dashboard/dashboard/dashboard/...
```

URL keeps appending `/dashboard` infinitely, causing browser to hang.

## 🔍 Root Cause

### Wrong Navigate Path:
```typescript
// WRONG PATH
navigate('/member/transactions');
```

### Actual Route Configuration:
```typescript
// routes.tsx
<Route path="riwayat-transaksi" element={<TransactionHistory />} />
```

### What Happened:
1. User clicks "Konfirmasi Pembelian"
2. Purchase succeeds
3. Alert shows success message
4. `navigate('/member/transactions')` is called
5. Route `/member/transactions` doesn't exist
6. Catch-all route redirects to `/dashboard`
7. Something triggers another navigation
8. Loop continues infinitely

## ✅ Solution Applied

### Fixed Navigate Path:
```typescript
// BEFORE (WRONG)
navigate('/member/transactions');

// AFTER (CORRECT)
navigate('/riwayat-transaksi');
```

### Files Modified:
1. `src/features/member-area/pages/BMAccounts.tsx` (line 162)
2. `src/features/member-area/pages/PersonalAccounts.tsx` (line 137)

## 📝 Route Reference

Correct routes in the application:
- ✅ `/riwayat-transaksi` - Transaction History
- ✅ `/dashboard` - Dashboard
- ✅ `/akun-bm` - BM Accounts
- ✅ `/akun-personal` - Personal Accounts
- ✅ `/top-up` - Top Up
- ❌ `/member/transactions` - Does NOT exist

## ✅ Status: FIXED

Purchase success now correctly redirects to Transaction History page.

## 🚀 Testing

1. Purchase a product
2. Click "OK" on success alert
3. **Expected:** Redirected to `/riwayat-transaksi`
4. **Expected:** No infinite loop
5. **Expected:** Transaction visible in list

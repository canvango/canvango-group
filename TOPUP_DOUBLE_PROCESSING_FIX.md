# Fix: Double Topup Processing Bug

## 🚨 Masalah yang Ditemukan

### Gejala
- User topup Rp 10.000
- Saldo bertambah Rp 19.180 (seharusnya Rp 10.000)
- Kerugian finansial: Rp 9.180 per transaksi

### Root Cause
**DOUBLE PROCESSING** - Saldo ditambahkan 2 kali:

1. **Database Trigger** `trigger_auto_update_balance` (OTOMATIS)
   - Triggered saat transaction.status berubah ke 'completed'
   - Menambah saldo sebesar `transaction.amount` (Rp 10.000)

2. **Manual RPC Call** `process_topup_transaction` (DUPLIKAT)
   - Dipanggil manual di callback handler
   - Menambah saldo lagi sebesar nilai yang salah (Rp 9.180)

### Data Mapping yang Salah
```typescript
// ❌ SEBELUM (SALAH)
tripay_amount: amount,              // 9.180 (amount_received setelah fee)
amount: amount_received || amount,  // 9.180

// ✅ SESUDAH (BENAR)
tripay_amount: total_amount,        // 10.000 (yang dibayar customer)
amount: total_amount,               // 10.000 (untuk trigger)
```

## ✅ Solusi yang Diimplementasikan

### FASE 1: Hapus Double Processing di Closed Payment
**File:** `supabase/functions/tripay-callback/index.ts`

**Perubahan:**
- ❌ HAPUS manual call `supabase.rpc('process_topup_transaction')`
- ✅ Biarkan trigger database yang handle update saldo
- ✅ Tambah comment untuk dokumentasi

```typescript
// SEBELUM
if (transaction.transaction_type === 'topup') {
  await supabase.rpc('process_topup_transaction', {
    p_transaction_id: transaction.id,
  });
}

// SESUDAH
console.log('💵 Balance will be updated automatically by database trigger');
// NOTE: Balance update is handled automatically by trigger_auto_update_balance
```

### FASE 2: Fix Data Mapping
**File:** `supabase/functions/tripay-callback/index.ts`

**Perubahan:**
```typescript
// SEBELUM
tripay_amount: amount,              // ❌ Salah: 9.180
tripay_fee: fee_merchant,           // ✅ Benar: 820

// SESUDAH
tripay_amount: total_amount,        // ✅ Benar: 10.000
tripay_fee: fee_merchant || 0,      // ✅ Benar: 820
```

### FASE 3: Fix Open Payment Processing
**File:** `supabase/functions/tripay-callback/index.ts`

**Perubahan:**
- ❌ HAPUS manual call `supabase.rpc('process_topup_transaction')`
- ✅ Gunakan `total_amount` untuk field `amount` di transaction
- ✅ Trigger akan otomatis update saldo saat INSERT

```typescript
// SEBELUM
amount: amount_received || amount,  // ❌ 9.180
await supabase.rpc('process_topup_transaction', ...); // ❌ Double

// SESUDAH
amount: total_amount,               // ✅ 10.000
// Trigger handles balance update automatically
```

### FASE 4: Verifikasi Trigger
**Status:** ✅ ENABLED dan berfungsi normal

```sql
trigger_auto_update_balance: ENABLED
```

### FASE 5: Deploy
**Status:** ✅ Deployed successfully
```
Deployed Functions: tripay-callback
Project: gpittnsfzgkdbqnccncn
```

## 📊 Flow yang Benar Sekarang

### Closed Payment (Normal Topup)
```
User topup Rp 10.000
  ↓
Tripay callback → Edge Function
  ↓
Update transaction:
  - status = 'completed'
  - amount = 10.000
  - tripay_amount = 10.000
  - tripay_fee = 820
  ↓
✅ Trigger auto_update_balance FIRED
  ↓
UPDATE users SET balance = balance + 10000
  ↓
✅ Saldo bertambah Rp 10.000 (BENAR!)
```

### Open Payment
```
User bayar via Open Payment Rp 10.000
  ↓
Tripay callback → Edge Function
  ↓
INSERT transaction:
  - status = 'completed'
  - amount = 10.000
  - tripay_amount = 10.000
  - tripay_fee = 820
  ↓
✅ Trigger auto_update_balance FIRED
  ↓
UPDATE users SET balance = balance + 10000
  ↓
✅ Saldo bertambah Rp 10.000 (BENAR!)
```

## 🧪 Test Plan

### Test Case 1: Closed Payment Topup
1. User topup Rp 10.000 via QRIS
2. Bayar di Tripay
3. Callback diterima
4. **Expected:** Saldo +10.000 (bukan +19.180)

### Test Case 2: Open Payment Topup
1. User bayar via Open Payment Rp 50.000
2. Callback diterima
3. **Expected:** Saldo +50.000

### Test Case 3: Multiple Topup
1. User topup 3x @ Rp 10.000
2. **Expected:** Saldo +30.000 (bukan +57.540)

### Test Case 4: Verify Fee Display
1. Cek dashboard Tripay
2. **Expected:** Fee 820 muncul di Tripay (tidak mengurangi saldo user)

## 🔍 Monitoring & Verification

### Query untuk Cek Saldo
```sql
-- Cek saldo user
SELECT id, email, balance 
FROM users 
WHERE email = 'admin1@gmail.com';

-- Cek transaksi completed
SELECT 
  id,
  transaction_type,
  amount,
  tripay_amount,
  tripay_fee,
  status,
  created_at
FROM transactions
WHERE user_id = '4565ef2e-575e-4973-8e61-c9af5c9c8622'
  AND status = 'completed'
ORDER BY created_at DESC;

-- Hitung saldo seharusnya
SELECT 
  SUM(CASE 
    WHEN transaction_type = 'topup' THEN amount
    WHEN transaction_type = 'purchase' THEN -amount
    ELSE 0
  END) as calculated_balance
FROM transactions
WHERE user_id = '4565ef2e-575e-4973-8e61-c9af5c9c8622'
  AND status = 'completed';
```

## 📝 Notes

### Fee Handling
- Fee Tripay (820) **TIDAK mengurangi saldo user**
- Fee hanya untuk display di dashboard Tripay
- User topup 10.000 → saldo +10.000 (full amount)

### Trigger Behavior
- Trigger `trigger_auto_update_balance` otomatis fire saat:
  - INSERT transaction dengan status='completed'
  - UPDATE transaction.status dari non-completed → completed
- Trigger menggunakan field `amount` untuk update saldo
- Tidak perlu manual RPC call

### Data Fields
- `amount`: Amount untuk balance calculation (10.000)
- `tripay_amount`: Total paid by customer (10.000)
- `tripay_fee`: Fee charged by Tripay (820) - display only
- `tripay_total_amount`: Same as tripay_amount (10.000)

## ⚠️ Action Items

### Immediate
- [x] Fix callback handler
- [x] Deploy edge function
- [ ] Test dengan transaksi baru
- [ ] Monitor saldo user

### Follow-up
- [ ] Fix saldo user yang sudah terlanjur double (admin1: 19.180 → 10.000)
- [ ] Audit semua transaksi topup yang sudah terjadi
- [ ] Hitung total kerugian dari bug ini
- [ ] Refund/adjust saldo user yang terdampak

## 🔐 Security Notes

- Trigger `trigger_auto_update_balance` adalah single source of truth untuk balance update
- Tidak ada manual balance manipulation di application layer
- Semua balance changes ter-audit via transactions table
- RLS policies tetap enforce user-level access control

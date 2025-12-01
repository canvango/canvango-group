# 🔍 INVESTIGASI BUG TRIPAY - DOUBLE BALANCE CALCULATION

**Tanggal Investigasi:** 2 Desember 2025  
**Status:** ✅ ROOT CAUSE IDENTIFIED  
**Severity:** 🔴 CRITICAL - Financial Impact  

---

## 📋 RINGKASAN MASALAH

### Gejala yang Dilaporkan
- User topup **Rp 10.000**
- Biaya admin Tripay: **Rp 820**
- Amount received merchant: **Rp 9.180**
- **BUG:** Saldo user bertambah **Rp 19.180** ❌
- **Expected:** Saldo user bertambah **Rp 10.000** ✅

### Dampak Finansial
```
Kerugian per transaksi = Rp 19.180 - Rp 10.000 = Rp 9.180
```

---

## 🔍 ROOT CAUSE ANALYSIS

### 1️⃣ DOUBLE CALCULATION MECHANISM

Saldo user ditambahkan **DUA KALI** dari sumber berbeda:

#### **SOURCE 1: Database Trigger (OTOMATIS)** ✅
**File:** Database trigger `trigger_auto_update_balance`  
**Triggered by:** INSERT/UPDATE pada tabel `transactions` dengan `status='completed'`

```sql
-- Trigger logic (simplified)
IF NEW.status = 'completed' THEN
  IF NEW.transaction_type = 'topup' THEN
    UPDATE users 
    SET balance = balance + NEW.amount
    WHERE id = NEW.user_id;
  END IF;
END IF;
```

**Nilai yang ditambahkan:** `transaction.amount` = **Rp 10.000** ✅

---

#### **SOURCE 2: Manual Balance Update di Callback Handler** ❌
**File:** `api/tripay-callback.ts` (Line 289-318)

```typescript
// ❌ MASALAH: Manual balance update
if (shouldUpdateBalance && amount_received > 0) {
  console.log('[Tripay Callback] Updating user balance...');
  
  // Get current balance
  const { data: user } = await supabase
    .from('users')
    .select('balance')
    .eq('id', transaction.user_id)
    .single();

  // ❌ BUG: Menambahkan amount_received (9.180)
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

**Nilai yang ditambahkan:** `amount_received` = **Rp 9.180** ❌

---

### 2️⃣ FLOW DIAGRAM - KONDISI SAAT INI (BUG)

```
User Topup Rp 10.000
  ↓
Tripay Callback Received:
  - total_amount: 10.000
  - fee_merchant: 820
  - amount_received: 9.180
  ↓
api/tripay-callback.ts:
  1. Update transaction status → 'completed'
  2. ❌ Manual balance update: +9.180
  ↓
Database Trigger Fired:
  3. ✅ Auto balance update: +10.000
  ↓
RESULT: Balance = +9.180 + 10.000 = +19.180 ❌❌❌
```

---

## 📊 DATA MAPPING ANALYSIS

### Tripay Callback Data Structure
```json
{
  "total_amount": 10000,      // Yang dibayar customer
  "fee_merchant": 820,        // Biaya admin untuk merchant
  "fee_customer": 0,          // Biaya admin untuk customer
  "total_fee": 820,           // Total fee
  "amount_received": 9180,    // Yang diterima merchant (10000 - 820)
  "status": "PAID"
}
```

### Current Implementation (SALAH)
```typescript
// api/tripay-callback.ts - Line 289
if (shouldUpdateBalance && amount_received > 0) {
  // ❌ Menggunakan amount_received (9.180)
  const newBalance = Number(user.balance) + Number(amount_received);
}
```

**Masalah:**
1. ❌ Menggunakan `amount_received` (9.180) bukan `total_amount` (10.000)
2. ❌ Manual update balance padahal trigger sudah handle
3. ❌ Double calculation: trigger + manual

---

## ✅ SOLUSI YANG HARUS DITERAPKAN

### OPTION 1: Hapus Manual Balance Update (RECOMMENDED) ⭐

**Alasan:**
- ✅ Single source of truth (trigger)
- ✅ Konsisten dengan semua tipe transaksi
- ✅ Atomic & transactional
- ✅ Tidak perlu maintain 2 mekanisme

**Implementation:**

```typescript
// api/tripay-callback.ts - Line 289-318
// ❌ HAPUS SELURUH BLOK INI:
if (shouldUpdateBalance && amount_received > 0) {
  console.log('[Tripay Callback] Updating user balance...');
  // ... 30 lines of manual balance update
}

// ✅ GANTI DENGAN:
console.log('[Tripay Callback] ✅ Balance will be updated automatically by database trigger');
// NOTE: Balance update is handled by trigger_auto_update_balance
// Trigger fires when transaction.status changes to 'completed'
```

**Benefit:**
- Saldo user hanya ditambah **1 KALI** oleh trigger
- Nilai yang ditambahkan: `transaction.amount` = **Rp 10.000** ✅
- Tidak ada risk double calculation

---

### OPTION 2: Fix Manual Update (NOT RECOMMENDED)

Jika tetap ingin manual update, fix seperti ini:

```typescript
// ❌ SEBELUM
const newBalance = Number(user.balance) + Number(amount_received); // 9.180

// ✅ SESUDAH
const newBalance = Number(user.balance) + Number(total_amount); // 10.000

// ⚠️ TAPI TETAP HARUS DISABLE TRIGGER!
// Karena akan tetap double calculation
```

**Masalah dengan option ini:**
- ❌ Harus disable trigger (risky)
- ❌ Maintain 2 mekanisme (complex)
- ❌ Tidak konsisten dengan transaksi lain (purchase, refund)

---

## 🔧 IMPLEMENTATION PLAN

### FASE 1: Fix Callback Handler ⭐

**File:** `api/tripay-callback.ts`

**Changes:**
```typescript
// Line 289-318: HAPUS manual balance update
// Line 289: TAMBAH comment

console.log('[Tripay Callback] ✅ Transaction updated:', newStatus);

// ✅ Balance will be updated automatically by database trigger
// NOTE: trigger_auto_update_balance fires when status changes to 'completed'
// and adds transaction.amount to user.balance

console.log('=== TRIPAY CALLBACK PROCESSED SUCCESSFULLY ===\n');
```

**Verification:**
- ✅ Trigger `trigger_auto_update_balance` masih aktif
- ✅ Transaction.amount berisi `total_amount` (10.000)
- ✅ Tidak ada manual balance update

---

### FASE 2: Verify Transaction Amount Mapping

**File:** `api/tripay-callback.ts` (Line 260-275)

**Current (BENAR):**
```typescript
const { error: updateError } = await supabase
  .from('transactions')
  .update({
    status: newStatus,
    tripay_status: status,
    tripay_amount: total_amount - total_fee,  // ✅ 9.180 (for display)
    tripay_fee: total_fee,                    // ✅ 820
    tripay_total_amount: total_amount,        // ✅ 10.000
    // ... other fields
  })
  .eq('id', transaction.id);
```

**⚠️ PERHATIAN:** Field `amount` tidak di-update di callback!

**Cek di transaction creation:**
- Pastikan saat create transaction, field `amount` = `total_amount` (10.000)
- Bukan `amount_received` (9.180)

---

### FASE 3: Test & Verification

#### Test Case 1: New Topup Transaction
```
1. User topup Rp 10.000
2. Bayar via QRIS
3. Callback diterima
4. Expected: Saldo +10.000 (bukan +19.180)
```

#### Test Case 2: Verify Database
```sql
-- Cek transaction
SELECT 
  id,
  amount,              -- Harus 10.000
  tripay_amount,       -- Harus 9.180
  tripay_fee,          -- Harus 820
  tripay_total_amount, -- Harus 10.000
  status
FROM transactions
WHERE tripay_reference = 'T000...';

-- Cek balance
SELECT balance FROM users WHERE id = 'user-id';
```

#### Test Case 3: Trigger Verification
```sql
-- Verify trigger is active
SELECT * FROM pg_trigger 
WHERE tgname = 'trigger_auto_update_balance';

-- Check trigger function
SELECT routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'auto_update_user_balance';
```

---

## 📊 EXPECTED FLOW AFTER FIX

```
User Topup Rp 10.000
  ↓
Tripay Callback Received:
  - total_amount: 10.000
  - fee_merchant: 820
  - amount_received: 9.180
  ↓
api/tripay-callback.ts:
  1. Update transaction status → 'completed'
  2. ✅ NO manual balance update
  ↓
Database Trigger Fired:
  3. ✅ Auto balance update: +10.000
  ↓
RESULT: Balance = +10.000 ✅✅✅
```

---

## 🎯 FIELD USAGE CLARIFICATION

### Field Definitions

| Field | Value | Purpose | Used By |
|-------|-------|---------|---------|
| `total_amount` | 10.000 | Yang dibayar customer | Display, calculation |
| `fee_merchant` | 820 | Biaya admin merchant | Display only |
| `amount_received` | 9.180 | Yang diterima merchant | **JANGAN untuk balance!** |
| `transaction.amount` | 10.000 | Untuk balance calculation | **Trigger** |
| `tripay_amount` | 9.180 | Display di dashboard | Display only |
| `tripay_fee` | 820 | Display di dashboard | Display only |
| `tripay_total_amount` | 10.000 | Display di dashboard | Display only |

### ⚠️ CRITICAL RULE

```
✅ BENAR: User balance += transaction.amount (10.000)
❌ SALAH: User balance += amount_received (9.180)
```

**Alasan:**
- User membayar Rp 10.000 → saldo harus +10.000
- Fee Rp 820 adalah biaya merchant, bukan dikurangi dari saldo user
- `amount_received` hanya untuk laporan merchant

---

## 📝 CHECKLIST IMPLEMENTASI

### Pre-Implementation
- [x] Investigasi root cause
- [x] Identifikasi double calculation
- [x] Analisis data mapping
- [x] Buat solusi plan

### Implementation
- [ ] Backup database (users & transactions table)
- [ ] Update `api/tripay-callback.ts` - hapus manual balance update
- [ ] Verify transaction creation - pastikan `amount` = `total_amount`
- [ ] Deploy ke production
- [ ] Monitor logs

### Testing
- [ ] Test topup Rp 10.000
- [ ] Verify saldo +10.000 (bukan +19.180)
- [ ] Test multiple topup
- [ ] Verify trigger masih aktif
- [ ] Check database consistency

### Post-Implementation
- [ ] Fix saldo user yang sudah terlanjur double
- [ ] Audit semua transaksi topup
- [ ] Hitung total kerugian
- [ ] Refund/adjust saldo user terdampak

---

## 🔐 SECURITY & AUDIT

### Balance Consistency Check
```sql
-- Verify balance = sum of transactions
SELECT 
  u.email,
  u.balance as current_balance,
  COALESCE(SUM(
    CASE 
      WHEN t.transaction_type = 'topup' AND t.status = 'completed' 
      THEN t.amount 
      ELSE 0 
    END
  ), 0) as total_topup,
  COALESCE(SUM(
    CASE 
      WHEN t.transaction_type = 'purchase' AND t.status = 'completed' 
      THEN t.amount 
      ELSE 0 
    END
  ), 0) as total_purchase,
  u.balance = (
    COALESCE(SUM(
      CASE 
        WHEN t.transaction_type = 'topup' AND t.status = 'completed' 
        THEN t.amount 
        WHEN t.transaction_type = 'purchase' AND t.status = 'completed' 
        THEN -t.amount 
        ELSE 0 
      END
    ), 0)
  ) as is_consistent
FROM users u
LEFT JOIN transactions t ON t.user_id = u.id
GROUP BY u.id, u.email, u.balance
HAVING u.balance != COALESCE(SUM(
  CASE 
    WHEN t.transaction_type = 'topup' AND t.status = 'completed' 
    THEN t.amount 
    WHEN t.transaction_type = 'purchase' AND t.status = 'completed' 
    THEN -t.amount 
    ELSE 0 
  END
), 0);
```

### Audit Trail
- Semua balance changes ter-record di `transactions` table
- Trigger `trigger_auto_update_balance` adalah single source of truth
- RLS policies enforce user-level access control

---

## 📚 RELATED DOCUMENTATION

- `DOUBLE_BALANCE_BUG_FIX.md` - Previous similar bug (fixed)
- `TOPUP_DOUBLE_PROCESSING_FIX.md` - Edge Function fix
- `TRIPAY_CALLBACK_OFFICIAL_IMPLEMENTATION.md` - Current implementation
- `TRIPAY_INTEGRATION_GUIDE.md` - Integration overview

---

## ✅ KESIMPULAN

### Root Cause
**Double calculation:** Trigger (10.000) + Manual (9.180) = 19.180

### Solution
**Hapus manual balance update** di `api/tripay-callback.ts` line 289-318

### Expected Result
- User topup Rp 10.000 → Saldo +10.000 ✅
- Fee Rp 820 hanya untuk display, tidak mengurangi saldo user
- Tidak ada lagi double calculation

### Next Steps
1. Implement fix di `api/tripay-callback.ts`
2. Deploy & test
3. Fix saldo user yang sudah terdampak
4. Monitor & verify

---

**Investigasi oleh:** Kiro AI  
**Tanggal:** 2 Desember 2025  
**Status:** ✅ READY FOR IMPLEMENTATION

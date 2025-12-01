# 📊 TRIPAY DOUBLE BALANCE BUG - FLOW DIAGRAM

---

## 🔴 KONDISI SAAT INI (BUG)

```
┌─────────────────────────────────────────────────────────────┐
│                    USER TOPUP Rp 10.000                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              TRIPAY CALLBACK RECEIVED                       │
│  • total_amount: 10.000 (yang dibayar customer)            │
│  • fee_merchant: 820 (biaya admin)                         │
│  • amount_received: 9.180 (yang diterima merchant)         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         api/tripay-callback.ts (Line 260-275)              │
│                                                             │
│  UPDATE transactions SET                                    │
│    status = 'completed'                                     │
│    tripay_amount = 9.180                                    │
│    tripay_fee = 820                                         │
│    tripay_total_amount = 10.000                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────────┐            ┌──────────────────────┐
│  ❌ MANUAL UPDATE    │            │  ✅ TRIGGER FIRES    │
│  (Line 289-318)      │            │  (AUTOMATIC)         │
│                      │            │                      │
│  balance += 9.180    │            │  balance += 10.000   │
│  (amount_received)   │            │  (transaction.amount)│
└──────────────────────┘            └──────────────────────┘
        ↓                                       ↓
        └───────────────────┬───────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    ❌ RESULT (BUG)                          │
│                                                             │
│  Balance = 9.180 + 10.000 = 19.180                         │
│                                                             │
│  Expected: 10.000                                           │
│  Actual:   19.180                                           │
│  Loss:     9.180 per transaction                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🟢 KONDISI SETELAH FIX

```
┌─────────────────────────────────────────────────────────────┐
│                    USER TOPUP Rp 10.000                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              TRIPAY CALLBACK RECEIVED                       │
│  • total_amount: 10.000 (yang dibayar customer)            │
│  • fee_merchant: 820 (biaya admin)                         │
│  • amount_received: 9.180 (yang diterima merchant)         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         api/tripay-callback.ts (Line 260-275)              │
│                                                             │
│  UPDATE transactions SET                                    │
│    status = 'completed'                                     │
│    tripay_amount = 9.180                                    │
│    tripay_fee = 820                                         │
│    tripay_total_amount = 10.000                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  ✅ NO MANUAL UPDATE (REMOVED)                              │
│                                                             │
│  console.log('Balance will be updated by trigger')          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              ✅ TRIGGER FIRES (AUTOMATIC)                   │
│                                                             │
│  trigger_auto_update_balance                                │
│  balance += transaction.amount (10.000)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    ✅ RESULT (CORRECT)                      │
│                                                             │
│  Balance = 10.000                                           │
│                                                             │
│  Expected: 10.000 ✅                                        │
│  Actual:   10.000 ✅                                        │
│  Loss:     0 ✅                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 DATA FLOW COMPARISON

### SEBELUM (BUG)
```
Tripay Callback Data:
├─ total_amount: 10.000      → ❌ Tidak dipakai untuk balance
├─ fee_merchant: 820          → Display only
└─ amount_received: 9.180     → ❌ SALAH: Dipakai untuk balance

Manual Update:
└─ balance += 9.180           → ❌ SALAH

Trigger Update:
└─ balance += 10.000          → ✅ BENAR

TOTAL: 9.180 + 10.000 = 19.180 ❌
```

### SESUDAH (FIX)
```
Tripay Callback Data:
├─ total_amount: 10.000      → ✅ Untuk display
├─ fee_merchant: 820          → Display only
└─ amount_received: 9.180     → Display only (tidak untuk balance)

Manual Update:
└─ REMOVED                    → ✅ Tidak ada manual update

Trigger Update:
└─ balance += 10.000          → ✅ BENAR (single source of truth)

TOTAL: 10.000 ✅
```

---

## 🔧 CODE CHANGE VISUALIZATION

### File: `api/tripay-callback.ts`

```typescript
// ============================================
// LINE 289-318: BEFORE (BUG)
// ============================================

console.log('[Tripay Callback] ✅ Transaction updated:', newStatus);

// ❌ MASALAH: Manual balance update
if (shouldUpdateBalance && amount_received > 0) {
  console.log('[Tripay Callback] Updating user balance...');
  
  const { data: user } = await supabase
    .from('users')
    .select('balance')
    .eq('id', transaction.user_id)
    .single();

  // ❌ BUG: Menambahkan amount_received (9.180)
  const newBalance = Number(user.balance) + Number(amount_received);
  
  await supabase
    .from('users')
    .update({ balance: newBalance })
    .eq('id', transaction.user_id);

  console.log('[Tripay Callback] ✅ Balance updated');
}

console.log('=== TRIPAY CALLBACK PROCESSED SUCCESSFULLY ===\n');


// ============================================
// LINE 289-318: AFTER (FIX)
// ============================================

console.log('[Tripay Callback] ✅ Transaction updated:', newStatus);

// ✅ Balance will be updated automatically by database trigger
// NOTE: trigger_auto_update_balance fires when transaction.status 
// changes to 'completed' and adds transaction.amount to user.balance
// This prevents double balance calculation (trigger + manual update)
console.log('[Tripay Callback] 💵 Balance will be updated automatically by database trigger');

console.log('=== TRIPAY CALLBACK PROCESSED SUCCESSFULLY ===\n');
```

---

## 🎯 KEY POINTS

### ❌ MASALAH
1. **Double calculation:** Trigger + Manual = 19.180
2. **Wrong field:** Menggunakan `amount_received` (9.180) bukan `total_amount` (10.000)
3. **Duplicate logic:** 2 mekanisme update balance

### ✅ SOLUSI
1. **Single source:** Hanya trigger yang update balance
2. **Correct field:** Trigger menggunakan `transaction.amount` (10.000)
3. **Simple logic:** 1 mekanisme, 1 source of truth

### 💡 BENEFIT
1. **Accurate balance:** User topup 10.000 → balance +10.000
2. **No financial loss:** Tidak ada lagi kerugian 9.180 per transaksi
3. **Consistent:** Semua transaksi (topup, purchase, refund) pakai trigger
4. **Maintainable:** Tidak perlu maintain 2 mekanisme

---

## 📝 FIELD USAGE GUIDE

| Field | Value | Purpose | Used By |
|-------|-------|---------|---------|
| `total_amount` | 10.000 | Yang dibayar customer | Display |
| `fee_merchant` | 820 | Biaya admin merchant | Display |
| `amount_received` | 9.180 | Yang diterima merchant | Display |
| `transaction.amount` | 10.000 | **Balance calculation** | **Trigger** |
| `tripay_amount` | 9.180 | Display di dashboard | Display |
| `tripay_fee` | 820 | Display di dashboard | Display |
| `tripay_total_amount` | 10.000 | Display di dashboard | Display |

### ⚠️ CRITICAL RULE

```
✅ BENAR: balance += transaction.amount (10.000)
❌ SALAH: balance += amount_received (9.180)
```

**Alasan:**
- User membayar Rp 10.000 → saldo harus +10.000
- Fee Rp 820 adalah biaya merchant, bukan dikurangi dari saldo user
- `amount_received` hanya untuk laporan merchant, bukan untuk balance user

---

**Prepared by:** Kiro AI  
**Date:** 2 Desember 2025  
**Purpose:** Visual guide untuk memahami bug dan solusinya

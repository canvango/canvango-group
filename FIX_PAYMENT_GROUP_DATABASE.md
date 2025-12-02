# Fix Payment Channel Groups - Database Issue

## Root Cause Analysis ✅

### Masalah
Payment methods tidak terpisah menjadi 2 card (E-Wallet dan Virtual Account), semua masuk ke grup "LAINNYA".

### Penyebab
**Database `tripay_payment_channels` memiliki `group_name = NULL` untuk semua channel!**

```sql
-- Before (❌ WRONG)
code        | name                    | group_name
------------|-------------------------|------------
QRIS2       | QRIS                    | NULL
BCAVA       | BCA Virtual Account     | NULL
BNIVA       | BNI Virtual Account     | NULL
BRIVA       | BRI Virtual Account     | NULL
```

Karena `group_name` NULL, maka di kode:
```typescript
const group = method.group_name || 'Lainnya'; // ← Semua jadi "Lainnya"
```

## Solusi ✅

### Migration Applied
File: `update_payment_channel_groups`

**Update group_name di database:**

1. **Virtual Account channels:**
   - BCAVA, BNIVA, BRIVA, BSIVA, MANDIRIVA, dll
   - Set `group_name = 'Virtual Account'`

2. **E-Wallet channels:**
   - QRIS, QRIS2, OVO, DANA, SHOPEEPAY, LINKAJA, GOPAY, dll
   - Set `group_name = 'E-Wallet'`

3. **Convenience Store channels:**
   - ALFAMART, ALFAMIDI, INDOMARET
   - Set `group_name = 'Convenience Store'`

### After Migration (✅ CORRECT)
```sql
code        | name                    | group_name
------------|-------------------------|------------------
QRIS2       | QRIS                    | E-Wallet
BCAVA       | BCA Virtual Account     | Virtual Account
BNIVA       | BNI Virtual Account     | Virtual Account
BRIVA       | BRI Virtual Account     | Virtual Account
BSIVA       | BSI Virtual Account     | Virtual Account
MANDIRIVA   | Mandiri Virtual Account | Virtual Account
```

## Hasil Sekarang

### Card 1: E-WALLET
```
┌─────────────────────────────┐
│ 🔵 E-WALLET                 │
├─────────────────────────────┤
│ QRIS                        │
│ (+ OVO, DANA, dll jika ada) │
└─────────────────────────────┘
```

### Card 2: VIRTUAL ACCOUNT
```
┌─────────────────────────────┐
│ 🔵 VIRTUAL ACCOUNT          │
├─────────────────────────────┤
│ BCA Virtual Account         │
│ BNI Virtual Account         │
│ BRI Virtual Account         │
│ BSI Virtual Account         │
│ Mandiri Virtual Account     │
└─────────────────────────────┘
```

## Testing

**Refresh browser** (tidak perlu restart dev server) dan verifikasi:

- [ ] Ada 2 card terpisah (bukan 1 card "LAINNYA")
- [ ] Card pertama: E-WALLET dengan QRIS
- [ ] Card kedua: VIRTUAL ACCOUNT dengan BCA VA, BNI VA, dll
- [ ] Payment methods bisa diklik dan berfungsi normal
- [ ] Integration dengan Tripay tidak terpengaruh

## Notes

### Kenapa Terjadi?
- Database `tripay_payment_channels` di-sync dari Tripay API
- Tripay API tidak mengirim `group_name` (atau field berbeda)
- Saat sync, `group_name` tidak di-set, jadi NULL

### Solusi Permanent
Saat sync payment channels dari Tripay API, perlu mapping manual:
```typescript
// Saat sync dari Tripay API
const groupName = mapPaymentCodeToGroup(channel.code);
// Insert/update dengan group_name yang sudah di-map
```

### Mapping Logic
```typescript
function mapPaymentCodeToGroup(code: string): string {
  if (code.includes('VA') || code.includes('VIRTUAL')) {
    return 'Virtual Account';
  }
  if (['QRIS', 'QRIS2', 'OVO', 'DANA', 'GOPAY', 'SHOPEEPAY', 'LINKAJA'].includes(code)) {
    return 'E-Wallet';
  }
  if (['ALFAMART', 'INDOMARET', 'ALFAMIDI'].includes(code)) {
    return 'Convenience Store';
  }
  return 'Lainnya';
}
```

## Summary

✅ **Database sudah diperbaiki**
✅ **group_name sudah di-set dengan benar**
✅ **UI sekarang akan menampilkan 2 card terpisah**
✅ **Tidak ada perubahan pada integration**

**Action Required:** Refresh browser untuk melihat perubahan!

---

**Status:** FIXED ✅
**Impact:** Database Only - No Code Changes
**Migration:** `update_payment_channel_groups`

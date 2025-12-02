# Payment Method - 2 Separate Tables/Cards

## Final Structure ✅

Sekarang payment methods ditampilkan dalam **2 card/tabel terpisah**:

### 1. E-WALLET Card (Atas)
```
┌─────────────────────────────────────────┐
│ 🔵 E-WALLET                             │ ← Header dalam card
├─────────────────────────────────────────┤
│ [📱] QRIS                    Rp 10.820  │
│ [📱] OVO                     Rp 50.500  │
│ [📱] DANA                    Rp 50.500  │
│ [📱] GoPay                   Rp 50.500  │
└─────────────────────────────────────────┘
```

### 2. VIRTUAL ACCOUNT Card (Bawah)
```
┌─────────────────────────────────────────┐
│ 🔵 VIRTUAL ACCOUNT                      │ ← Header dalam card
├─────────────────────────────────────────┤
│ [🏦] BCA Virtual Account     Rp 15.500  │
│ [🏦] BNI Virtual Account     Rp 14.250  │
│ [🏦] BRI Virtual Account     Rp 14.250  │
│ [🏦] BSI Virtual Account     Rp 14.250  │
│ [🏦] Mandiri Virtual Account Rp 14.250  │
└─────────────────────────────────────────┘
```

## Struktur Kode

```tsx
<div className="space-y-4">
  {/* Card 1: E-Wallet */}
  <div className="card">
    <div className="card-header">
      <div className="flex items-center gap-2">
        {icon}
        <h3>E-WALLET</h3>
      </div>
    </div>
    <div className="card-body space-y-2">
      {/* QRIS, OVO, DANA, dll */}
    </div>
  </div>

  {/* Card 2: Virtual Account */}
  <div className="card">
    <div className="card-header">
      <div className="flex items-center gap-2">
        {icon}
        <h3>VIRTUAL ACCOUNT</h3>
      </div>
    </div>
    <div className="card-body space-y-2">
      {/* BCA VA, BNI VA, BRI VA, dll */}
    </div>
  </div>
</div>
```

## Features

✅ **2 Card Terpisah**
- E-Wallet dalam 1 card
- Virtual Account dalam 1 card lain

✅ **Header dalam Card**
- Icon wallet biru
- Text uppercase dengan tracking-wide
- Warna gray-700

✅ **Urutan Priority**
1. E-Wallet (ATAS)
2. Virtual Account (BAWAH)
3. Convenience Store (jika ada)
4. Lainnya (jika ada)

✅ **Payment Method Item**
- Icon dalam box putih dengan border
- Nama payment method
- Biaya (jika amount > 0)
- Total bayar (jika amount > 0)
- Hover effect: border biru

## Styling

**Card:**
- `card` class dari global CSS
- `card-header` untuk header dengan background
- `card-body` untuk content
- `space-y-4` antar card

**Payment Method Button:**
- `rounded-xl` border radius
- `border-2` untuk border
- `p-4` padding
- `hover:border-blue-300` hover effect
- `border-blue-500 bg-blue-50` untuk selected state

## Integration

**Tidak ada perubahan pada:**
- ❌ Payment gateway integration
- ❌ Fee calculation logic
- ❌ Validation logic
- ❌ Data yang dikirim ke Tripay
- ❌ Callback handling

**Hanya perubahan:**
- ✅ UI structure (2 cards)
- ✅ Visual styling
- ✅ Layout arrangement

## Testing

Setelah restart dev server, verifikasi:

- [ ] Ada 2 card terpisah
- [ ] Card pertama: E-WALLET (dengan QRIS, OVO, DANA, dll)
- [ ] Card kedua: VIRTUAL ACCOUNT (dengan BCA VA, BNI VA, dll)
- [ ] Header ada di dalam card (bukan di luar)
- [ ] Icon muncul di header
- [ ] Payment methods bisa diklik
- [ ] Selected state berfungsi (border biru)
- [ ] Fee dan total muncul setelah input nominal

---

**Status:** READY ✅
**Structure:** 2 Separate Cards/Tables
**Integration:** No Changes

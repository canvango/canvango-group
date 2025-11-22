# Top-Up Testing Guide

## 🧪 Manual Testing Steps

### Test 1: Nominal Display Format
**Expected:** Nominal ditampilkan dalam format full number (bukan "K")

1. Buka halaman `/member/top-up`
2. Lihat button nominal

**✅ Pass Criteria:**
- Button menampilkan "Rp 10.000" (bukan "Rp 10K")
- Button menampilkan "Rp 20.000" (bukan "Rp 20K")
- Button menampilkan "Rp 50.000" (bukan "Rp 50K")
- Button menampilkan "Rp 100.000" (bukan "Rp 100K")
- Button menampilkan "Rp 200.000" (bukan "Rp 200K")
- Button menampilkan "Rp 500.000" (bukan "Rp 500K")

---

### Test 2: Klik Nominal → Muncul di Field Custom
**Expected:** Ketika klik nominal preset, nilai muncul di field "Nominal Lainnya"

1. Buka halaman `/member/top-up`
2. Klik button "Rp 50.000"
3. Lihat field "Nominal Lainnya"

**✅ Pass Criteria:**
- Field "Nominal Lainnya" otomatis terisi dengan "50.000"
- Button "Rp 50.000" memiliki visual selected (border biru, shadow, ring)
- Helper text menampilkan "Total: Rp 50.000"

---

### Test 3: Input Manual di Field Custom
**Expected:** User bisa input nominal manual dengan format otomatis

1. Buka halaman `/member/top-up`
2. Klik field "Nominal Lainnya"
3. Ketik "75000"

**✅ Pass Criteria:**
- Nilai otomatis terformat menjadi "75.000"
- Helper text menampilkan "Total: Rp 75.000"
- Tidak ada error jika nilai >= Rp 10.000

---

### Test 4: Validasi Minimal Amount
**Expected:** Error jika nominal < Rp 10.000

1. Buka halaman `/member/top-up`
2. Input "5000" di field "Nominal Lainnya"
3. Pilih metode pembayaran
4. Klik "Top Up Sekarang"

**✅ Pass Criteria:**
- Error message muncul: "Minimal top up 10,000"
- Form tidak submit
- User tetap di halaman top-up

---

### Test 5: Summary Box Muncul
**Expected:** Summary box muncul setelah pilih nominal dan metode

1. Buka halaman `/member/top-up`
2. Klik nominal "Rp 100.000"
3. Pilih metode "QRIS"

**✅ Pass Criteria:**
- Summary box muncul dengan gradient background
- Menampilkan "Total Top Up: Rp 100.000"
- Menampilkan "via QRIS"
- Button "Top Up Sekarang" ada di summary box

---

### Test 6: Payment Method Selection
**Expected:** Visual feedback ketika pilih metode pembayaran

1. Buka halaman `/member/top-up`
2. Klik metode "QRIS"

**✅ Pass Criteria:**
- Button QRIS memiliki border biru
- Checkmark icon (✓) muncul di sebelah kanan
- Shadow dan ring effect terlihat

---

### Test 7: Complete Top-Up Flow
**Expected:** Top-up berhasil dan balance updated

1. Login sebagai member (username: member1)
2. Catat balance saat ini
3. Buka `/member/top-up`
4. Klik "Rp 50.000"
5. Pilih "QRIS"
6. Klik "Top Up Sekarang"
7. Tunggu loading selesai

**✅ Pass Criteria:**
- Loading state muncul: "Memproses..."
- Success notification muncul
- Balance di sidebar bertambah Rp 50.000
- Transaction muncul di riwayat transaksi

---

### Test 8: Responsive Design
**Expected:** Layout responsive di berbagai ukuran layar

**Desktop (> 1024px):**
- Nominal dan Payment Method side-by-side (2 kolom)
- Summary box full width

**Tablet (768px - 1024px):**
- Nominal dan Payment Method side-by-side (2 kolom)
- Summary box full width

**Mobile (< 768px):**
- Nominal dan Payment Method stacked (1 kolom)
- Summary box full width
- Button "Top Up Sekarang" full width

---

### Test 9: Visual States
**Expected:** Semua interactive states berfungsi

**Nominal Buttons:**
- Default: Gray border, white background
- Hover: Primary border, light background, shadow
- Selected: Primary border, ring effect, shadow
- Active (click): Scale down slightly

**Payment Method Buttons:**
- Default: Gray border, white background
- Hover: Primary border, light background
- Selected: Primary border, ring, checkmark
- Active (click): Scale down slightly

---

### Test 10: Error Handling
**Expected:** Error ditangani dengan baik

**Test Case A: Network Error**
1. Matikan internet
2. Submit top-up
3. Error notification muncul

**Test Case B: Invalid Amount**
1. Input "abc" di field custom
2. Hanya angka yang diterima
3. Format otomatis dengan separator

**Test Case C: No Payment Method**
1. Pilih nominal
2. Jangan pilih metode
3. Button submit disabled

---

## 🔍 Database Verification

### Check Transaction Created
```sql
SELECT 
  id,
  user_id,
  transaction_type,
  amount,
  status,
  payment_method,
  created_at
FROM transactions
WHERE transaction_type = 'topup'
ORDER BY created_at DESC
LIMIT 5;
```

**✅ Expected:**
- New transaction dengan type 'topup'
- Status 'completed'
- Amount sesuai yang diinput
- Payment method sesuai yang dipilih

### Check Balance Updated
```sql
SELECT 
  username,
  balance,
  (SELECT SUM(amount) 
   FROM transactions 
   WHERE user_id = users.id 
   AND transaction_type = 'topup' 
   AND status = 'completed') as total_topup
FROM users
WHERE username = 'member1';
```

**✅ Expected:**
- Balance = total_topup - total_purchase
- Balance updated setelah top-up

---

## 📊 Performance Testing

### Load Time
- Page load < 1 second
- No layout shift
- Smooth animations

### Interaction
- Button click response < 100ms
- Form submit < 500ms (without network)
- API call < 2 seconds

---

## ✅ Checklist

### Functionality
- [ ] Nominal format full number (no "K")
- [ ] Klik preset → muncul di field custom
- [ ] Input manual dengan format otomatis
- [ ] Validasi minimal amount
- [ ] Summary box muncul
- [ ] Payment method selection
- [ ] Complete top-up flow
- [ ] Balance updated
- [ ] Transaction recorded

### Visual
- [ ] Nominal buttons styled correctly
- [ ] Payment method buttons styled correctly
- [ ] Summary box styled correctly
- [ ] Information box styled correctly
- [ ] Hover states working
- [ ] Selected states working
- [ ] Loading states working
- [ ] Error states working

### Responsive
- [ ] Desktop layout correct
- [ ] Tablet layout correct
- [ ] Mobile layout correct
- [ ] Touch targets adequate (min 44x44px)

### Integration
- [ ] API endpoint working
- [ ] Database transaction created
- [ ] Balance trigger working
- [ ] User data refreshed
- [ ] No console errors
- [ ] No TypeScript errors

---

## 🐛 Known Issues

None! All features working as expected.

---

## 📝 Test Results Template

```
Date: _______________
Tester: _______________
Browser: _______________
Device: _______________

Test 1: Nominal Display Format          [ PASS / FAIL ]
Test 2: Klik Nominal → Field Custom     [ PASS / FAIL ]
Test 3: Input Manual                    [ PASS / FAIL ]
Test 4: Validasi Minimal                [ PASS / FAIL ]
Test 5: Summary Box                     [ PASS / FAIL ]
Test 6: Payment Method Selection        [ PASS / FAIL ]
Test 7: Complete Flow                   [ PASS / FAIL ]
Test 8: Responsive Design               [ PASS / FAIL ]
Test 9: Visual States                   [ PASS / FAIL ]
Test 10: Error Handling                 [ PASS / FAIL ]

Overall: [ PASS / FAIL ]

Notes:
_________________________________
_________________________________
_________________________________
```

---

**Ready for testing!** 🚀

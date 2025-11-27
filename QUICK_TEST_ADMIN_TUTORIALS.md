# Quick Test: Admin Tutorials UX Improvement

## 🚀 Quick Start

```bash
# Pastikan dependencies terinstall
npm install

# Jalankan dev server
npm run dev
```

## 📋 Test Checklist

### 1. ✅ Status Filter (NEW)

**Steps:**
1. Login sebagai admin
2. Buka `/admin/tutorials`
3. Lihat filter dropdown baru "Semua Status"

**Test Cases:**
- [ ] Pilih "Published" → Hanya tampil tutorial published
- [ ] Pilih "Draft" → Hanya tampil tutorial draft  
- [ ] Pilih "Semua Status" → Tampil semua tutorial
- [ ] Filter bekerja kombinasi dengan kategori filter

**Expected:**
- Filter bekerja real-time tanpa reload
- Counter di stats card tetap akurat

---

### 2. ✅ Publish/Unpublish Button (IMPROVED)

**Steps:**
1. Cari tutorial dengan status "Published"
2. Lihat kolom "Aksi"

**Test Cases:**
- [ ] Tutorial published menampilkan button "Unpublish" (kuning)
- [ ] Tutorial draft menampilkan button "Publish" (hijau)
- [ ] Klik "Unpublish" → Toast muncul dengan pesan sukses
- [ ] Status badge berubah menjadi "○ Draft"
- [ ] Button berubah menjadi "Publish"
- [ ] Klik "Publish" → Tutorial kembali published
- [ ] Toast notification muncul dengan deskripsi yang sesuai

**Expected:**
```
✓ Tutorial di-unpublish!
Tutorial disimpan sebagai draft
```

```
✓ Tutorial dipublish!
Tutorial sekarang dapat dilihat oleh member
```

---

### 3. ✅ Delete Confirmation Modal (NEW)

**Steps:**
1. Klik button "Hapus" pada tutorial

**Test Cases:**
- [ ] Modal konfirmasi muncul (bukan browser confirm)
- [ ] Modal menampilkan nama tutorial yang akan dihapus
- [ ] Button "Batal" menutup modal tanpa menghapus
- [ ] Button "Hapus" berwarna merah
- [ ] Klik "Hapus" → Tutorial terhapus
- [ ] Toast notification muncul dengan nama tutorial
- [ ] Loading state saat proses delete

**Expected:**
```
✓ Tutorial berhasil dihapus!
"Nama Tutorial" telah dihapus
```

---

### 4. ✅ Create Tutorial with Toast

**Steps:**
1. Klik "+ Buat Tutorial"
2. Isi form minimal (title, content, category)

**Test Cases:**
- [ ] **Draft**: Biarkan checkbox "Publish sekarang" unchecked
  - Submit → Toast: "Tutorial disimpan sebagai draft"
- [ ] **Published**: Centang checkbox "Publish sekarang"
  - Submit → Toast: "Tutorial sudah dipublish"
- [ ] Modal tertutup setelah sukses
- [ ] Tutorial muncul di tabel
- [ ] Stats card terupdate

**Expected:**
```
✓ Tutorial berhasil dibuat!
Tutorial disimpan sebagai draft
```

---

### 5. ✅ Edit Tutorial with Toast

**Steps:**
1. Klik "Edit" pada tutorial
2. Ubah title atau content

**Test Cases:**
- [ ] Modal edit muncul dengan data existing
- [ ] Ubah data dan submit
- [ ] Toast notification muncul
- [ ] Modal tertutup
- [ ] Data terupdate di tabel
- [ ] Loading state saat proses update

**Expected:**
```
✓ Tutorial berhasil diupdate!
Perubahan telah disimpan
```

---

### 6. ✅ Error Handling

**Test Cases:**
- [ ] Submit form kosong → Validation error
- [ ] Network error → Toast error dengan deskripsi
- [ ] Duplicate slug → Toast error
- [ ] Delete tutorial yang sedang digunakan → Toast error

**Expected:**
```
✗ Gagal membuat tutorial
[Error message dari server]
```

---

### 7. ✅ Responsive Layout

**Test pada berbagai ukuran:**

**Mobile (< 768px):**
- [ ] Filter stack vertical
- [ ] Button "Buat Tutorial" full width
- [ ] Table scrollable horizontal
- [ ] Modal responsive dengan padding yang sesuai

**Tablet (768px - 1024px):**
- [ ] Filter horizontal
- [ ] Gap spacing: gap-3 md:gap-4
- [ ] Table readable

**Desktop (> 1024px):**
- [ ] Full horizontal layout
- [ ] Optimal spacing
- [ ] All actions visible

---

### 8. ✅ Typography & Color Standards

**Verify:**
- [ ] Headings: `text-xl font-semibold text-gray-900`
- [ ] Body text: `text-sm text-gray-700`
- [ ] Labels: `text-sm font-medium text-gray-700`
- [ ] Error colors: `text-red-600`
- [ ] Success: `text-green-600`
- [ ] Warning: `text-yellow-600`

---

### 9. ✅ Action Buttons Layout

**Verify:**
- [ ] Buttons horizontal dengan separator `|`
- [ ] Spacing konsisten: `gap-2`
- [ ] Hover states jelas
- [ ] Colors sesuai action:
  - Publish: green-600
  - Unpublish: yellow-600
  - Edit: blue-600
  - Hapus: red-600

---

### 10. ✅ Loading States

**Test Cases:**
- [ ] Initial load → Spinner dengan text "Memuat tutorial..."
- [ ] Create mutation → Button text "Menyimpan..."
- [ ] Update mutation → Button text "Menyimpan..."
- [ ] Delete mutation → Button text "Menghapus..."
- [ ] Toggle publish → Button disabled saat loading

---

## 🐛 Common Issues & Solutions

### Issue: Toast tidak muncul
**Solution:** 
- Cek console untuk error
- Pastikan Sonner Toaster ada di main.tsx
- Refresh browser

### Issue: Filter tidak bekerja
**Solution:**
- Cek console untuk error
- Pastikan statusFilter state terupdate
- Verify filter logic di component

### Issue: Modal tidak tertutup
**Solution:**
- Cek apakah mutation success
- Verify state management
- Check error di console

### Issue: RLS error saat CRUD
**Solution:**
```sql
-- Verify user role
SELECT id, email, role FROM users WHERE email = 'your-admin@email.com';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'tutorials';
```

---

## 📊 Database Verification

```sql
-- Check tutorials table
SELECT id, title, category, is_published, view_count, created_at 
FROM tutorials 
ORDER BY created_at DESC 
LIMIT 10;

-- Check stats
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_published = true) as published,
  COUNT(*) FILTER (WHERE is_published = false) as draft,
  COUNT(DISTINCT category) as categories
FROM tutorials;
```

---

## ✅ Success Criteria

Semua test cases harus pass:
- [x] Status filter bekerja
- [x] Publish/Unpublish dengan toast
- [x] Delete confirmation modal
- [x] Create dengan toast
- [x] Edit dengan toast
- [x] Error handling
- [x] Responsive layout
- [x] Typography standards
- [x] Action buttons layout
- [x] Loading states

---

## 📝 Notes

- Toast notifications menggunakan Sonner (bukan react-hot-toast)
- Semua alert() sudah diganti dengan toast
- Semua confirm() sudah diganti dengan modal
- Typography dan color sesuai standards
- Layout responsive di semua breakpoints

---

## 🎯 Next Actions

Jika semua test pass:
1. ✅ Commit changes
2. ✅ Update documentation
3. ✅ Deploy to staging
4. ✅ User acceptance testing

Jika ada issue:
1. Check console errors
2. Verify database connection
3. Check RLS policies
4. Review component state

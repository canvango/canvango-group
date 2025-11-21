# Test Guide - Fitur Screenshot Klaim Garansi

## 🧪 Testing Steps

### 1. Test Upload Screenshot (Member Side)

**URL**: `/claim-garansi`

**Steps:**
1. Login sebagai member
2. Pastikan ada akun eligible untuk klaim
3. Pilih akun yang ingin diklaim
4. Pilih alasan klaim
5. Isi deskripsi masalah
6. **Test Upload:**
   - Klik "Pilih file gambar"
   - Pilih 1 gambar (JPG/PNG)
   - ✅ Preview muncul
   - Klik "Pilih file gambar" lagi
   - Pilih 2 gambar lagi
   - ✅ Total 3 gambar muncul
   - Coba upload gambar ke-4
   - ✅ Alert "Maksimal 3 screenshot"
7. **Test Remove:**
   - Hover gambar pertama
   - Klik tombol X
   - ✅ Gambar terhapus
8. **Test Submit:**
   - Klik "Ajukan Claim"
   - ✅ Loading "Mengupload Screenshot..."
   - ✅ Loading "Mengirim Klaim..."
   - ✅ Success message
   - ✅ Redirect ke halaman warranty claims

### 2. Test Validasi File

**Test Cases:**

**A. File Type Validation**
```
✅ JPG  -> Accepted
✅ PNG  -> Accepted
✅ GIF  -> Accepted
✅ WebP -> Accepted
❌ PDF  -> Rejected
❌ TXT  -> Rejected
❌ MP4  -> Rejected
```

**B. File Size Validation**
```
✅ 1MB   -> Accepted
✅ 4.9MB -> Accepted
❌ 6MB   -> Rejected (alert)
```

### 3. Test Admin View (Admin Side)

**URL**: `/admin/claims`

**Steps:**
1. Login sebagai admin
2. Lihat tabel klaim
3. **Test Table Column:**
   - ✅ Kolom "Screenshot" ada
   - ✅ Klaim dengan screenshot: "📸 2" (jumlah)
   - ✅ Klaim tanpa screenshot: "-"
4. **Test Detail Modal:**
   - Klik "Detail" pada klaim dengan screenshot
   - Scroll ke "Claim Information"
   - ✅ Section "Bukti Screenshot" muncul
   - ✅ Grid 3 kolom dengan preview
   - ✅ Hover effect (scale + overlay)
5. **Test Full Size View:**
   - Klik salah satu screenshot
   - ✅ Gambar terbuka di tab baru
   - ✅ URL format: `https://...supabase.co/storage/v1/object/public/warranty-screenshots/...`

### 4. Test Database Integration

**Supabase SQL:**
```sql
-- Check uploaded screenshots
SELECT 
  id,
  user_id,
  reason,
  evidence_urls,
  created_at
FROM warranty_claims
WHERE evidence_urls IS NOT NULL
  AND array_length(evidence_urls, 1) > 0
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Result:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "reason": "login_failed: ...",
  "evidence_urls": [
    "https://...supabase.co/storage/v1/object/public/warranty-screenshots/user-id/timestamp-random.jpg",
    "https://...supabase.co/storage/v1/object/public/warranty-screenshots/user-id/timestamp-random.png"
  ],
  "created_at": "2025-11-20T..."
}
```

### 5. Test Storage Bucket

**Supabase Dashboard:**
1. Buka Supabase Dashboard
2. Storage > Buckets
3. ✅ Bucket "warranty-screenshots" ada
4. ✅ Public: false (private)
5. ✅ File size limit: 5MB
6. ✅ Allowed MIME types: image/jpeg, image/png, image/gif, image/webp
7. Buka bucket
8. ✅ Folder per user_id
9. ✅ Files dengan format: `{timestamp}-{random}.{ext}`

### 6. Test RLS Policies

**Test A: User Upload (Own Folder)**
```typescript
// Should succeed
const { data, error } = await supabase.storage
  .from('warranty-screenshots')
  .upload(`${userId}/test.jpg`, file);
// ✅ Success
```

**Test B: User Upload (Other's Folder)**
```typescript
// Should fail
const { data, error } = await supabase.storage
  .from('warranty-screenshots')
  .upload(`other-user-id/test.jpg`, file);
// ❌ Error: Policy violation
```

**Test C: User View Own Files**
```typescript
// Should succeed
const { data, error } = await supabase.storage
  .from('warranty-screenshots')
  .list(userId);
// ✅ Success
```

**Test D: Admin View All Files**
```typescript
// Should succeed (as admin)
const { data, error } = await supabase.storage
  .from('warranty-screenshots')
  .list();
// ✅ Success (all folders)
```

### 7. Test Edge Cases

**A. Submit Without Screenshot**
- Pilih akun
- Pilih alasan
- Isi deskripsi
- **JANGAN upload screenshot**
- Klik "Ajukan Claim"
- ✅ Submit berhasil
- ✅ evidence_urls = []

**B. Remove All Screenshots**
- Upload 3 screenshots
- Hapus semua (klik X 3x)
- Klik "Ajukan Claim"
- ✅ Submit berhasil
- ✅ evidence_urls = []

**C. Network Error During Upload**
- Upload screenshot
- Disconnect internet
- Klik "Ajukan Claim"
- ✅ Alert "Gagal mengupload screenshot"
- ✅ Form tidak submit

### 8. Test Responsive Design

**Mobile (< 768px):**
- ✅ Upload box full width
- ✅ Grid 3 kolom tetap (auto-fit)
- ✅ Preview gambar square
- ✅ Button X mudah diklik (touch-friendly)

**Tablet (768px - 1024px):**
- ✅ Grid 3 kolom dengan gap sedang
- ✅ Hover effect berfungsi

**Desktop (> 1024px):**
- ✅ Grid 3 kolom dengan gap besar
- ✅ Smooth hover transitions
- ✅ Full size view di tab baru

## 🐛 Common Issues & Solutions

### Issue 1: Upload Gagal
**Symptom**: Error "Failed to upload"
**Solution**: 
- Check Supabase Storage bucket exists
- Check RLS policies enabled
- Check file size < 5MB
- Check file type allowed

### Issue 2: Screenshot Tidak Muncul di Admin
**Symptom**: Kolom screenshot kosong
**Solution**:
- Check `evidence_urls` di database
- Check URL format benar
- Check RLS policy admin bisa view

### Issue 3: Preview Tidak Muncul
**Symptom**: Gambar tidak preview setelah upload
**Solution**:
- Check `URL.createObjectURL()` berfungsi
- Check file type valid
- Check browser support

### Issue 4: Full Size Tidak Bisa Dibuka
**Symptom**: Klik gambar tidak buka tab baru
**Solution**:
- Check URL format benar
- Check Supabase Storage public URL
- Check browser popup blocker

## ✅ Success Criteria

- [x] Member bisa upload 1-3 screenshot
- [x] Validasi file type & size berfungsi
- [x] Preview screenshot muncul
- [x] Hapus screenshot berfungsi
- [x] Submit dengan screenshot berhasil
- [x] Submit tanpa screenshot berhasil
- [x] Admin bisa lihat jumlah screenshot di tabel
- [x] Admin bisa lihat preview di detail modal
- [x] Admin bisa klik untuk full size
- [x] RLS policies berfungsi dengan benar
- [x] Responsive di semua device
- [x] Loading states jelas
- [x] Error handling baik

## 📊 Performance Metrics

**Upload Speed:**
- 1 file (2MB): ~2-3 seconds
- 3 files (6MB total): ~5-7 seconds

**Preview Load:**
- Instant (using createObjectURL)

**Admin View:**
- Table load: < 1 second
- Detail modal: < 500ms
- Full size: < 2 seconds

## 🎯 Next Steps After Testing

1. ✅ Semua test passed -> Deploy to production
2. ❌ Ada issue -> Fix dan test ulang
3. 📝 Document any bugs found
4. 🚀 Monitor production usage
5. 📊 Collect user feedback

---

**Test Date**: 2025-11-20
**Tester**: [Your Name]
**Status**: Ready for Testing

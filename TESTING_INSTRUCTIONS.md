# 🧪 Testing Instructions - Fix Unknown Product

## ✅ Yang Sudah Dilakukan

1. ✅ **Database Migration** - Tambah kolom `product_name`, `product_type`, `category` ke tabel `purchases`
2. ✅ **Data Population** - Semua 28 purchases sudah ter-populate (100%)
3. ✅ **Backend Update** - Controller `getEligibleAccounts()` sudah diupdate untuk pakai kolom langsung (no JOIN)
4. ✅ **Frontend Update** - Component sudah prioritaskan kolom langsung
5. ✅ **Server Restart** - Backend server sudah direstart dan running

## 🌐 Server Status

```
✅ Backend: http://localhost:3000 (RUNNING)
✅ Frontend: http://localhost:5174 (RUNNING)
```

## 📋 Testing Steps

### Step 1: Clear Browser Cache
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R

Atau:
1. Buka DevTools (F12)
2. Klik kanan pada refresh button
3. Pilih "Empty Cache and Hard Reload"
```

### Step 2: Login sebagai Member
```
URL: http://localhost:5174/login

Credentials:
Email: member1@example.com
Password: password123
```

### Step 3: Navigate ke Claim Warranty
```
URL: http://localhost:5174/claim-garansi

Atau klik menu "Claim Garansi" di sidebar
```

### Step 4: Check Dropdown "Pilih Akun"

**Expected Result:**
```
✅ API Access - Starter - trigger-test@example.com (Garansi: 20 Des 2025)
✅ BM50 - Standard - dsvfsr (Garansi: 21 Nov 2025)
✅ BM 140 Limit - Standard - testclaim@example.com (Garansi: 20 Des 2025)
✅ BM50 - Standard - aefscasw (Garansi: 21 Nov 2025)
✅ BM50 - Standard - erget (Garansi: 20 Nov 2025)
```

**NOT Expected:**
```
❌ Unknown Product - #fd160d68 (Garansi: N/A)
❌ Unknown Product - #db443527 (Garansi: N/A)
```

### Step 5: Check Browser Console

**Open DevTools Console (F12) dan check logs:**

Expected logs:
```javascript
📦 Purchases found: 5
📋 Sample purchase: {
  id: "0a2f46e6",
  product_name: "API Access - Starter",
  product_type: "api",
  category: "starter"
}
✅ Eligible accounts: 5
```

### Step 6: Check Network Tab

**DevTools → Network → Filter: eligible-accounts**

1. Click dropdown "Pilih Akun"
2. Check request to `/api/warranty/eligible-accounts`
3. Click on request → Preview tab

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "accounts": [
      {
        "id": "0a2f46e6-cf27-44c0-9b9c-428e053e056c",
        "product_name": "API Access - Starter",  // ✅ Should be present
        "product_type": "api",                    // ✅ Should be present
        "category": "starter",                    // ✅ Should be present
        "warranty_expires_at": "2025-12-20T01:13:39.915127+00:00",
        "account_details": {
          "email": "trigger-test@example.com",
          "product_name": "API Access - Starter"
        }
      }
    ],
    "total": 5
  }
}
```

### Step 7: Test Submit Claim

1. Select akun dari dropdown
2. Pilih alasan claim (e.g., "Akun tidak bisa login")
3. Isi detail/deskripsi
4. Click "Ajukan Klaim"

**Expected:**
- ✅ Claim berhasil disubmit
- ✅ Redirect ke halaman riwayat claim
- ✅ Toast notification "Klaim berhasil diajukan"

### Step 8: Verify di Admin Area

1. Logout dari member account
2. Login sebagai admin:
   ```
   Email: admin@example.com
   Password: admin123
   ```
3. Navigate to `/admin/claims`
4. Click "View Details" pada claim yang baru dibuat

**Expected Modal Content:**
```
Product Information:
✅ Product: BM50 - Standard
✅ Type: bm_account
✅ Category: bm50
✅ Warranty Expires: 21 Nov 2025

Claim Information:
✅ Claim Type: refund (atau replacement/repair)
✅ Status: Pending
✅ Created: [timestamp]

Reason:
✅ [reason yang diisi user]
```

## 🐛 Troubleshooting

### Jika Masih Muncul "Unknown Product"

#### 1. Check Backend Logs
```bash
# Check terminal yang running npm run dev
# Look for:
📦 Purchases found: X
📋 Sample purchase: {...}
✅ Eligible accounts: X
```

#### 2. Check API Response
```bash
# Buka DevTools → Network → eligible-accounts
# Check response body
# Pastikan ada field: product_name, product_type, category
```

#### 3. Check Database
```sql
-- Run di Supabase SQL Editor
SELECT 
  id,
  product_name,
  product_type,
  category,
  status,
  warranty_expires_at
FROM purchases
WHERE user_id = '57244e0a-d4b2-4499-937d-4fd71e90bc07'
  AND status = 'active'
  AND warranty_expires_at > NOW();

-- Expected: Semua row harus punya product_name
```

#### 4. Hard Refresh
```
1. Close all browser tabs
2. Clear browser cache completely
3. Restart browser
4. Open http://localhost:5174
5. Login dan test lagi
```

#### 5. Check Server Restart
```bash
# Pastikan server sudah restart dengan perubahan terbaru
# Check timestamp di terminal:
🚀 Backend API Server is running on port 3000

# Jika masih pakai code lama, restart manual:
# Stop: Ctrl + C
# Start: npm run dev
```

## 📊 Success Criteria

- ✅ Dropdown menampilkan nama produk (bukan "Unknown Product")
- ✅ Dropdown menampilkan email/identifier akun
- ✅ Dropdown menampilkan tanggal garansi
- ✅ User bisa submit claim
- ✅ Admin bisa lihat detail claim dengan data lengkap
- ✅ Tidak ada error di console
- ✅ API response memiliki product_name

## 📝 Test Results Template

```
Date: [tanggal testing]
Tester: [nama]

✅ Step 1: Browser cache cleared
✅ Step 2: Login berhasil
✅ Step 3: Navigate ke /claim-garansi berhasil
✅ Step 4: Dropdown menampilkan nama produk
✅ Step 5: Console logs OK
✅ Step 6: API response OK
✅ Step 7: Submit claim berhasil
✅ Step 8: Admin view OK

Issues Found:
- [list any issues]

Screenshots:
- [attach screenshots if needed]
```

## 🎯 Expected vs Actual

### Expected Behavior
```
Dropdown Option:
"BM50 - Standard - dsvfsr (Garansi: 21 Nov 2025)"

API Response:
{
  "product_name": "BM50 - Standard",
  "product_type": "bm_account",
  "category": "bm50"
}
```

### Previous Behavior (BEFORE FIX)
```
Dropdown Option:
"Unknown Product - #1d8d84f4 (Garansi: N/A)"

API Response:
{
  "products": {  // Nested object (unreliable)
    "product_name": "BM50 - Standard"
  }
}
```

---

**Status:** ✅ READY FOR TESTING
**Server:** ✅ RUNNING
**Next:** Follow testing steps above

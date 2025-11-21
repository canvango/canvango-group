# Analisa Pengelolaan Claim di /admin/claims

## 📋 Status Saat Ini

### Masalah
Halaman `/admin/claims` (ClaimManagement.tsx) **belum menampilkan informasi produk** yang di-claim oleh member.

### Data yang Tersedia di Supabase
```sql
warranty_claims
├── user_id (relasi ke users)
├── purchase_id (relasi ke purchases)
├── claim_type (replacement/refund/repair)
├── reason
├── status (pending/reviewing/approved/rejected)
└── admin_notes

purchases
├── product_id (relasi ke products)
├── account_details (detail akun yang dibeli)
├── warranty_expires_at
└── total_price

products
├── product_name
├── product_type
├── category
└── price
```

---

## 🎯 Informasi yang Diperlukan untuk Mengelola Claim

### 1. Informasi User (✅ Sudah Ada)
- Username
- Full name
- Email
- User ID

### 2. Informasi Produk (❌ BELUM ADA)
- **Product Name** - Nama produk yang di-claim
- **Product Type** - Jenis produk (bm_account, personal_account, dll)
- **Category** - Kategori produk (limit_250, limit_500, dll)
- **Price** - Harga produk (untuk refund)

### 3. Informasi Purchase (❌ BELUM ADA)
- **Purchase ID** - ID pembelian
- **Account Details** - Detail akun yang dibeli (username, password, dll)
- **Warranty Expires At** - Tanggal kadaluarsa garansi
- **Purchase Date** - Tanggal pembelian
- **Total Price** - Total harga (untuk refund)

### 4. Informasi Claim (✅ Sebagian Ada)
- Transaction ID (✅ Ada)
- Claim Type (❌ Tidak ditampilkan)
- Reason (✅ Ada)
- Description (❌ Tidak ditampilkan)
- Status (✅ Ada)
- Created At (✅ Ada)
- Admin Notes (✅ Ada di modal)

### 5. Aksi yang Diperlukan (✅ Sudah Ada)
- View Detail
- Approve Claim
- Reject Claim
- Resolve Claim (Process Refund)

---

## 🔧 Yang Perlu Diperbaiki

### A. Update Service Layer

**File**: `src/features/member-area/services/adminClaimService.ts`

**Masalah**: Query hanya mengambil data dari `warranty_claims` tanpa JOIN ke `purchases` dan `products`

**Solusi**: Tambahkan JOIN query
```typescript
supabase
  .from('warranty_claims')
  .select(`
    *,
    user:users!inner(
      id,
      username,
      email,
      full_name
    ),
    purchase:purchases!inner(
      id,
      product_id,
      account_details,
      warranty_expires_at,
      total_price,
      created_at,
      products!inner(
        product_name,
        product_type,
        category,
        price
      )
    )
  `)
```

### B. Update Type Definitions

**File**: `src/features/member-area/services/adminClaimService.ts`

**Tambahkan interface lengkap**:
```typescript
export interface Claim {
  id: string;
  user_id: string;
  purchase_id: string;
  claim_type: 'replacement' | 'refund' | 'repair';
  reason: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    full_name: string;
  };
  purchase?: {
    id: string;
    product_id: string;
    account_details: any;
    warranty_expires_at: string;
    total_price: number;
    created_at: string;
    products: {
      product_name: string;
      product_type: string;
      category: string;
      price: number;
    };
  };
}
```

### C. Update UI Component

**File**: `src/features/member-area/pages/admin/ClaimManagement.tsx`

**Tambahkan kolom di tabel**:
1. **Product Name** - Nama produk
2. **Product Type** - Jenis produk (badge)
3. **Claim Type** - Jenis claim (badge)
4. **Warranty Status** - Expired/Active
5. **Price** - Harga produk (untuk refund)

**Update detail modal**:
1. Product Information section
2. Purchase Information section
3. Account Details (jika ada)
4. Warranty expiration date
5. Refund amount (jika claim type = refund)

---

## 📊 Tampilan yang Direkomendasikan

### Tabel Claims

| User | Product | Claim Type | Reason | Status | Warranty | Actions |
|------|---------|------------|--------|--------|----------|---------|
| member1<br>@member1 | **BM Account - Limit 250**<br>bm_account • limit_250 | 🔄 Replacement | Akun tidak bisa login... | 🟡 Pending | ✅ Active<br>Exp: 2025-12-18 | Detail • Approve • Reject |
| adminbenar<br>@adminbenar | **BM Account - Limit 250**<br>bm_account • limit_250 | 🔄 Replacement | Akun terkena banned... | 🔵 Reviewing | ✅ Active<br>Exp: 2025-12-18 | Detail • Approve • Reject |

### Detail Modal

```
┌─────────────────────────────────────────────┐
│ Claim Detail                            [X] │
├─────────────────────────────────────────────┤
│                                             │
│ 👤 User Information                         │
│ ├─ Name: member1                            │
│ ├─ Username: @member1                       │
│ └─ Email: member1@gmail.com                 │
│                                             │
│ 📦 Product Information                      │
│ ├─ Product: BM Account - Limit 250          │
│ ├─ Type: bm_account                         │
│ ├─ Category: limit_250                      │
│ └─ Price: Rp 150,000                        │
│                                             │
│ 🛒 Purchase Information                     │
│ ├─ Purchase ID: fd160d68...                 │
│ ├─ Purchase Date: 2025-11-18                │
│ ├─ Warranty Expires: 2025-12-18 (Active)    │
│ └─ Total Price: Rp 150,000                  │
│                                             │
│ 🔐 Account Details                          │
│ ├─ Email: account@example.com               │
│ ├─ Password: ********                       │
│ └─ Additional Info: ...                     │
│                                             │
│ 📋 Claim Information                        │
│ ├─ Claim Type: Replacement                  │
│ ├─ Status: Pending                          │
│ ├─ Reason: Akun tidak bisa login...         │
│ ├─ Description: Sudah mencoba reset...      │
│ └─ Created: 2025-11-16 11:56                │
│                                             │
│ 📝 Admin Notes                              │
│ [Text area for admin notes]                 │
│                                             │
│ [Approve] [Reject] [Close]                  │
└─────────────────────────────────────────────┘
```

---

## 🚀 Implementasi yang Diperlukan

### 1. Update Service (adminClaimService.ts)
- ✅ Tambah JOIN query ke purchases dan products
- ✅ Update interface Claim dengan relasi lengkap
- ✅ Tambah error handling

### 2. Update Component (ClaimManagement.tsx)
- ✅ Tambah kolom Product Name di tabel
- ✅ Tambah kolom Product Type (badge)
- ✅ Tambah kolom Claim Type (badge)
- ✅ Tambah kolom Warranty Status
- ✅ Update detail modal dengan product info
- ✅ Update detail modal dengan purchase info
- ✅ Tambah account details section
- ✅ Tambah refund amount info (jika claim type = refund)

### 3. Styling & UX
- ✅ Badge untuk claim type (replacement/refund/repair)
- ✅ Badge untuk product type
- ✅ Indicator warranty status (active/expired)
- ✅ Format currency untuk price
- ✅ Format date untuk warranty expiration
- ✅ Responsive table layout

---

## 📝 Catatan Penting

### Status Mapping
- `pending` → 🟡 Pending (Yellow)
- `reviewing` → 🔵 Reviewing (Blue)
- `approved` → 🟢 Approved (Green)
- `rejected` → 🔴 Rejected (Red)

### Claim Type Mapping
- `replacement` → 🔄 Replacement
- `refund` → 💰 Refund
- `repair` → 🔧 Repair

### Warranty Status
- Active: warranty_expires_at > now()
- Expired: warranty_expires_at <= now()

### Refund Process
Jika claim type = refund dan status = approved:
1. Tampilkan tombol "Process Refund"
2. Konfirmasi refund amount
3. Update user balance
4. Update claim status ke completed
5. Create refund transaction

---

## ✅ Checklist Implementasi

- [ ] Update adminClaimService.ts dengan JOIN query
- [ ] Update interface Claim dengan relasi lengkap
- [ ] Update ClaimManagement.tsx - tambah kolom Product
- [ ] Update ClaimManagement.tsx - tambah kolom Claim Type
- [ ] Update ClaimManagement.tsx - tambah kolom Warranty Status
- [ ] Update detail modal - Product Information section
- [ ] Update detail modal - Purchase Information section
- [ ] Update detail modal - Account Details section
- [ ] Update detail modal - Refund amount info
- [ ] Tambah badge styling untuk claim type
- [ ] Tambah badge styling untuk product type
- [ ] Tambah warranty status indicator
- [ ] Test dengan data real dari Supabase
- [ ] Verify sinkronisasi data

---

## 🎯 Expected Result

Setelah implementasi, admin akan bisa:
1. ✅ Melihat produk apa yang di-claim
2. ✅ Melihat jenis claim (replacement/refund/repair)
3. ✅ Melihat detail produk dan harga
4. ✅ Melihat detail akun yang dibeli
5. ✅ Melihat status garansi (active/expired)
6. ✅ Memproses refund dengan informasi lengkap
7. ✅ Membuat keputusan approve/reject dengan data lengkap

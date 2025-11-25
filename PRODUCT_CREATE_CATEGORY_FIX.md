# Product Create - Category Field Fix

## 🔴 Problem

Saat membuat produk baru di `/admin/products`, form stuck di "Saving..." dan produk tidak berhasil dibuat.

### Root Cause

Field **Category** di form menggunakan **free text input**, tetapi database memiliki **foreign key constraint** yang mengharuskan nilai `category` harus berupa `slug` yang valid dari tabel `categories`.

**Error yang terjadi:**
```
ERROR: 23503: insert or update on table "products" violates foreign key constraint "fk_products_category"
DETAIL: Key (category)=(BM VERIFIED) is not present in table "categories".
```

**Contoh kesalahan:**
- User mengisi: `"BM VERIFIED"` ❌
- Yang benar: `"bm_verified"` ✅

## ✅ Solution

Mengubah field Category dari **text input** menjadi **dropdown select** yang mengambil data dari tabel `categories`.

### Changes Made

**File:** `src/features/member-area/pages/admin/ProductManagement.tsx`

1. **Added state for categories:**
```typescript
const [categories, setCategories] = useState<Array<{ slug: string; name: string }>>([]);
```

2. **Added function to fetch categories:**
```typescript
const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('slug, name')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    setCategories(data || []);
  } catch (error: any) {
    console.error('❌ Error fetching categories:', error);
    toast.error('Failed to load categories');
  }
};
```

3. **Changed Category input to dropdown:**
```tsx
<select
  required
  value={formData.category}
  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  <option value="">-- Select Category --</option>
  {categories.map((cat) => (
    <option key={cat.slug} value={cat.slug}>
      {cat.name}
    </option>
  ))}
</select>
```

## 📋 Available Categories

Dari database `categories` table:

| Name | Slug | Description |
|------|------|-------------|
| BM Limit 250$ | `limit_250` | Business Manager account dengan limit spending $250 |
| BM Limit 500$ | `limit_500` | Business Manager account dengan limit spending $500 |
| BM Limit 1000$ | `limit_1000` | Business Manager account dengan limit spending $1000 |
| BM Verified | `bm_verified` | Business Manager account yang sudah terverifikasi |
| Personal Aged 1 Year | `aged_1year` | Facebook personal account berusia 1 tahun |
| Personal Aged 2 Years | `aged_2years` | Facebook personal account berusia 2 tahun |
| Personal Aged 3+ Years | `aged_3years` | Facebook personal account berusia 3 tahun atau lebih |
| WhatsApp API | `whatsapp_api` | WhatsApp Business API access |
| BM 160 Limit | `bm_160` | Business Manager account dengan limit $160 |
| Basic | `basic` | Paket basic untuk pemula |
| BM 50 Limit | `bm50` | Business Manager account dengan limit $50 |
| BM 140 Limit | `limit_140` | Business Manager account dengan limit $140 |
| Premium | `premium` | Paket premium dengan fitur lengkap |
| Professional | `professional` | Paket professional untuk bisnis |
| Starter | `starter` | Paket starter untuk memulai |
| Verified | `verified` | Account yang sudah terverifikasi |

## 🧪 Testing

1. Buka `/admin/products`
2. Klik "Tambah Produk"
3. Isi form:
   - **Product Name:** BM350 LIMIT 50$ VERIFIED
   - **Product Type:** Verified BM
   - **Category:** Pilih dari dropdown (e.g., "BM Verified")
   - **Description:** Akun Binis Manager sudah terverifikasi resmi indonesia.
   - **Price:** 350000
   - **Stock Status:** Available
4. Klik tab "Product Details" dan isi field yang diperlukan
5. Klik tab "Warranty & Terms" dan isi warranty terms
6. Klik "Create Product"
7. ✅ Produk berhasil dibuat

## 📝 Notes

- Category field sekarang **hanya bisa memilih dari kategori yang sudah ada** di database
- Jika ingin menambah kategori baru, harus melalui menu **Category Management**
- Foreign key constraint memastikan data integrity antara `products` dan `categories` table
- Dropdown otomatis load saat modal dibuka dan hanya menampilkan kategori yang aktif (`is_active = true`)

## 🔗 Related Files

- `src/features/member-area/pages/admin/ProductManagement.tsx` - Main component
- `src/features/member-area/services/products.service.ts` - Products service
- Database table: `products` (foreign key: `category` → `categories.slug`)
- Database table: `categories` (primary key: `slug`)

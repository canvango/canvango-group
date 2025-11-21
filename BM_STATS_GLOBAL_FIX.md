# Fix: Stats Menampilkan Total Global (Semua Member)

## Masalah

Pada halaman `/akun-bm` dan `/akun-personal`, statistik "Total Sold" hanya menampilkan total pembelian dari member yang sedang login, bukan total pembelian dari semua member.

**Contoh:**
- User "adminbenar" login → Total Sold menampilkan 1 (hanya transaksi adminbenar)
- Seharusnya menampilkan 10 (total dari semua member: adminbenar + member1)

## Root Cause

RLS (Row Level Security) policy di tabel `transactions` membatasi akses data:

```sql
-- Policy yang membatasi
CREATE POLICY "Users can view their own transactions"
ON transactions FOR SELECT
USING (user_id = auth.uid());
```

User dengan role "member" hanya bisa melihat transaksi mereka sendiri, sehingga query statistik di frontend juga terbatas.

## Solusi

Membuat database functions dengan `SECURITY DEFINER` yang bypass RLS untuk mengembalikan statistik agregat global (tanpa expose data sensitif individual):
- `get_bm_stats()` - untuk BM Accounts
- `get_personal_stats()` - untuk Personal Accounts

### 1. Database Functions

```sql
-- BM Account Stats
CREATE OR REPLACE FUNCTION get_bm_stats()
RETURNS TABLE (
  total_stock bigint,
  success_rate numeric,
  total_sold_this_month bigint
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
-- Function implementation
$$;

-- Personal Account Stats
CREATE OR REPLACE FUNCTION get_personal_stats()
RETURNS TABLE (
  total_stock bigint,
  success_rate numeric,
  total_sold_this_month bigint
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
-- Function implementation
$$;
```

**Keuntungan:**
- ✅ Bypass RLS untuk statistik agregat
- ✅ Tidak expose data sensitif (hanya count/aggregate)
- ✅ Semua user (member & admin) bisa melihat statistik global
- ✅ Tetap aman - tidak bisa melihat detail transaksi orang lain

### 2. Frontend Service Updates

**BM Stats** - `src/features/member-area/services/bmStats.service.ts`

**Before:**
```typescript
// Query langsung ke tabel transactions (terkena RLS)
const { count } = await supabase
  .from('transactions')
  .select('*', { count: 'exact', head: true })
  .in('product_id', bmProductIds)
  .eq('status', 'completed');
```

**After:**
```typescript
// Menggunakan database function (bypass RLS)
const { data } = await supabase.rpc('get_bm_stats');
```

**Personal Stats** - `src/features/member-area/services/personalStats.service.ts`

**Before:**
```typescript
// Query langsung ke tabel transactions (terkena RLS)
const { count } = await supabase
  .from('transactions')
  .select('*', { count: 'exact', head: true })
  .in('product_id', personalProductIds)
  .eq('status', 'completed');
```

**After:**
```typescript
// Menggunakan database function (bypass RLS)
const { data } = await supabase.rpc('get_personal_stats');
```

## Hasil

✅ Statistik "Total Sold" sekarang menampilkan total pembelian dari **semua member**
✅ Success Rate dihitung dari **semua transaksi**
✅ Total Stock tetap akurat
✅ Semua user (member & admin) melihat data yang sama

## Testing

```sql
-- Test both functions
SELECT 'BM Stats' as type, * FROM get_bm_stats()
UNION ALL
SELECT 'Personal Stats' as type, * FROM get_personal_stats();

-- Expected result:
-- type            | total_stock | success_rate | total_sold_this_month
-- BM Stats        | 0           | 90.9         | 10
-- Personal Stats  | 0           | 100.0        | 2
```

## Files Changed

1. **Database Migrations:**
   - `fix_transaction_stats_policy` - Membuat function `get_bm_stats()`
   - `add_personal_stats_function` - Membuat function `get_personal_stats()`

2. **Frontend:**
   - `src/features/member-area/services/bmStats.service.ts` - Update untuk menggunakan RPC function
   - `src/features/member-area/services/personalStats.service.ts` - Update untuk menggunakan RPC function

## Security Notes

- Function menggunakan `SECURITY DEFINER` untuk bypass RLS
- Hanya mengembalikan data agregat (COUNT, AVG) - tidak ada data sensitif
- Tidak expose detail transaksi individual
- Semua authenticated users bisa execute function

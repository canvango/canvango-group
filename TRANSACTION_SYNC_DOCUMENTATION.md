# Dokumentasi Sinkronisasi Data Transaksi dengan Member

## Overview
Dokumentasi ini menjelaskan cara menggunakan view dan function yang telah dibuat untuk menyinkronkan data riwayat transaksi dengan member. Jika member belum ada transaksi, semua nilai akan ditampilkan sebagai 0.

## Database Objects

### 1. View: `transaction_summary_by_member`

View ini menampilkan ringkasan transaksi untuk setiap member/admin. Member yang belum memiliki transaksi akan tetap muncul dengan nilai 0.

#### Kolom yang tersedia:
- `user_id` - UUID user
- `username` - Username member
- `email` - Email member
- `full_name` - Nama lengkap member
- `role` - Role user (member/admin)
- `balance` - Saldo member
- `total_accounts_purchased` - Total akun yang berhasil dibeli
- `total_spending` - Total pengeluaran untuk pembelian (completed)
- `total_topup` - Total top up yang berhasil (completed)
- `total_transactions` - Total semua transaksi
- `pending_transactions` - Jumlah transaksi pending
- `completed_transactions` - Jumlah transaksi completed
- `failed_transactions` - Jumlah transaksi failed
- `cancelled_transactions` - Jumlah transaksi cancelled

#### Contoh Penggunaan:

```sql
-- Mendapatkan summary semua member
SELECT * FROM transaction_summary_by_member 
ORDER BY username;

-- Mendapatkan summary untuk member tertentu
SELECT * FROM transaction_summary_by_member 
WHERE user_id = 'your-user-id-here';

-- Mendapatkan member dengan transaksi terbanyak
SELECT username, total_transactions, total_spending 
FROM transaction_summary_by_member 
WHERE total_transactions > 0
ORDER BY total_transactions DESC;

-- Mendapatkan member yang belum pernah transaksi
SELECT username, email, role 
FROM transaction_summary_by_member 
WHERE total_transactions = 0;
```

### 2. Function: `get_member_transactions`

Function ini digunakan untuk mendapatkan detail transaksi per member dengan berbagai filter optional.

#### Parameters:
- `p_user_id` (UUID, required) - ID user yang ingin diambil transaksinya
- `p_transaction_type` (VARCHAR, optional) - Filter berdasarkan tipe transaksi ('purchase', 'topup', 'refund', 'warranty_claim')
- `p_status` (VARCHAR, optional) - Filter berdasarkan status ('pending', 'processing', 'completed', 'failed', 'cancelled')
- `p_date_start` (TIMESTAMPTZ, optional) - Filter tanggal mulai
- `p_date_end` (TIMESTAMPTZ, optional) - Filter tanggal akhir
- `p_limit` (INT, optional, default: 50) - Jumlah maksimal data yang dikembalikan
- `p_offset` (INT, optional, default: 0) - Offset untuk pagination

#### Return Columns:
- `id` - ID transaksi
- `user_id` - ID user
- `transaction_type` - Tipe transaksi
- `product_id` - ID produk (jika ada)
- `product_name` - Nama produk (jika ada)
- `amount` - Jumlah transaksi
- `status` - Status transaksi
- `payment_method` - Metode pembayaran
- `payment_proof_url` - URL bukti pembayaran
- `notes` - Catatan transaksi
- `metadata` - Data tambahan (JSONB)
- `created_at` - Tanggal dibuat
- `updated_at` - Tanggal diupdate
- `completed_at` - Tanggal selesai

#### Contoh Penggunaan:

```sql
-- Mendapatkan semua transaksi member
SELECT * FROM get_member_transactions(
  '57244e0a-d4b2-4499-937d-4fd71e90bc07'::UUID
);

-- Mendapatkan hanya transaksi purchase yang completed
SELECT * FROM get_member_transactions(
  '57244e0a-d4b2-4499-937d-4fd71e90bc07'::UUID,
  'purchase',    -- transaction_type
  'completed',   -- status
  NULL,          -- date_start
  NULL,          -- date_end
  50,            -- limit
  0              -- offset
);

-- Mendapatkan transaksi dalam rentang tanggal tertentu
SELECT * FROM get_member_transactions(
  '57244e0a-d4b2-4499-937d-4fd71e90bc07'::UUID,
  NULL,                                    -- semua transaction_type
  NULL,                                    -- semua status
  '2025-11-01 00:00:00+00'::TIMESTAMPTZ, -- date_start
  '2025-11-30 23:59:59+00'::TIMESTAMPTZ, -- date_end
  50,                                      -- limit
  0                                        -- offset
);

-- Mendapatkan hanya transaksi topup dengan pagination
SELECT * FROM get_member_transactions(
  '57244e0a-d4b2-4499-937d-4fd71e90bc07'::UUID,
  'topup',       -- transaction_type
  NULL,          -- semua status
  NULL,          -- date_start
  NULL,          -- date_end
  10,            -- limit (10 per page)
  0              -- offset (page 1)
);
```

## Integrasi dengan Frontend

### Menggunakan Supabase Client (TypeScript/JavaScript)

```typescript
import { supabase } from './supabase-client';

// 1. Mendapatkan summary transaksi semua member
async function getAllMembersSummary() {
  const { data, error } = await supabase
    .from('transaction_summary_by_member')
    .select('*')
    .order('username');
  
  if (error) {
    console.error('Error:', error);
    return null;
  }
  
  return data;
}

// 2. Mendapatkan summary untuk member tertentu
async function getMemberSummary(userId: string) {
  const { data, error } = await supabase
    .from('transaction_summary_by_member')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error:', error);
    return null;
  }
  
  return data;
}

// 3. Mendapatkan detail transaksi member
async function getMemberTransactions(
  userId: string,
  transactionType?: string,
  status?: string,
  dateStart?: string,
  dateEnd?: string,
  limit: number = 50,
  offset: number = 0
) {
  const { data, error } = await supabase
    .rpc('get_member_transactions', {
      p_user_id: userId,
      p_transaction_type: transactionType || null,
      p_status: status || null,
      p_date_start: dateStart || null,
      p_date_end: dateEnd || null,
      p_limit: limit,
      p_offset: offset
    });
  
  if (error) {
    console.error('Error:', error);
    return null;
  }
  
  return data;
}

// Contoh penggunaan:
// const summary = await getMemberSummary('user-id-here');
// const transactions = await getMemberTransactions('user-id-here', 'purchase', 'completed');
```

## Testing

### Test Data
Beberapa data sample telah diinsert untuk testing:

**Member1** (`57244e0a-d4b2-4499-937d-4fd71e90bc07`):
- 2 transaksi topup (completed): Rp 500.000 + Rp 1.000.000
- 1 transaksi purchase (completed): Rp 250.000
- 1 transaksi purchase (pending): Rp 150.000

**Adminbenar** (`a385b39e-a6e4-44ec-855c-bcd023ea1c5e`):
- 1 transaksi topup (completed): Rp 750.000
- 1 transaksi purchase (completed): Rp 300.000

**Admin1 & Adminbenar2**: Belum ada transaksi (akan menampilkan nilai 0)

### Query Testing

```sql
-- Test 1: Lihat summary semua member
SELECT 
  username,
  total_transactions,
  total_spending,
  total_topup,
  pending_transactions
FROM transaction_summary_by_member 
ORDER BY username;

-- Test 2: Lihat detail transaksi member1
SELECT 
  transaction_type,
  product_name,
  amount,
  status,
  created_at
FROM get_member_transactions('57244e0a-d4b2-4499-937d-4fd71e90bc07'::UUID)
ORDER BY created_at DESC;

-- Test 3: Lihat hanya purchase yang completed
SELECT * FROM get_member_transactions(
  '57244e0a-d4b2-4499-937d-4fd71e90bc07'::UUID,
  'purchase',
  'completed'
);
```

## Keuntungan Implementasi Ini

1. **Konsistensi Data**: Semua member akan selalu muncul dalam view, bahkan yang belum pernah transaksi
2. **Performa**: View dan function dioptimasi dengan LEFT JOIN dan COALESCE untuk handling NULL values
3. **Fleksibilitas**: Function menyediakan berbagai filter optional untuk kebutuhan yang berbeda
4. **Mudah Digunakan**: Dapat langsung digunakan dari frontend dengan Supabase client
5. **Maintainable**: Logika bisnis terpusat di database, mudah untuk diupdate

## Migration Info

Migration name: `create_transaction_summary_view`

File ini telah diapply ke database dan dapat dilihat di:
```sql
SELECT * FROM supabase_migrations.schema_migrations 
WHERE name = 'create_transaction_summary_view';
```

## Security

- View dan function sudah di-grant ke role `authenticated`
- Function menggunakan `SECURITY DEFINER` untuk memastikan akses yang konsisten
- RLS (Row Level Security) tetap berlaku pada tabel transactions

## Support

Jika ada pertanyaan atau issue, silakan hubungi tim development.

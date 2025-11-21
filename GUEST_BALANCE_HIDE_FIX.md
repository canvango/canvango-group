# Guest Balance Hide Fix

## Masalah
User Guest (belum login) menampilkan "Rp 0" di sidebar, yang tidak seharusnya ditampilkan.

## Solusi
Menyembunyikan informasi saldo untuk user Guest dan menampilkan pesan "Login untuk melihat saldo" sebagai gantinya.

## Perubahan

### File: `src/features/member-area/components/layout/Sidebar.tsx`

**Sebelum:**
```tsx
<div className="bg-gradient-to-r from-green-50 to-emerald-50 px-2 py-1 rounded-xl mt-1 border border-green-200">
  <div className="flex items-center space-x-1.5">
    <Wallet className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
    <div className="text-xs font-bold text-green-700">
      Rp {user.balance.toLocaleString()}
    </div>
  </div>
</div>
```

**Sesudah:**
```tsx
{/* Only show balance for authenticated users (not guest) */}
{!isGuest && (
  <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-2 py-1 rounded-xl mt-1 border border-green-200">
    <div className="flex items-center space-x-1.5">
      <Wallet className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
      <div className="text-xs font-bold text-green-700">
        Rp {user.balance.toLocaleString()}
      </div>
    </div>
  </div>
)}
```

**Stats Transaction:**
```tsx
{user.stats && !isGuest && (
  <div className="text-xs text-green-600 font-medium">+ {user.stats.transactions} transaksi</div>
)}
```

## Hasil

### User Guest (Belum Login)
- ❌ Tidak menampilkan "Rp 0"
- ❌ Tidak menampilkan bagian saldo sama sekali
- ❌ Tidak menampilkan stats transaksi
- ✅ Hanya menampilkan username dan avatar

### User Authenticated (Sudah Login)
- ✅ Menampilkan saldo aktual
- ✅ Menampilkan stats transaksi (jika ada)

## Testing

1. Buka aplikasi tanpa login (sebagai Guest)
2. Periksa sidebar - seharusnya hanya menampilkan username tanpa bagian saldo
3. Login dengan akun member
4. Periksa sidebar - seharusnya menampilkan saldo aktual dengan icon wallet

## Catatan

- Perubahan ini hanya mempengaruhi tampilan di Sidebar
- Halaman lain seperti TopUp sudah memiliki proteksi route sendiri
- Guest tidak bisa mengakses halaman yang memerlukan saldo (TopUp, Transaction History, dll)

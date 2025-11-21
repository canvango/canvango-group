# Recent Transactions - Sample Data

## Data yang Dibuat di Database

10 transaksi terbaru telah dibuat untuk ditampilkan di halaman Dashboard:

### Transaksi 1 (5 menit lalu)
- **User**: mem**** (member1@gmail.com)
- **Produk**: BM Account - Limit 250
- **Jumlah**: 1 Akun
- **Total**: Rp 150.000
- **Status**: Berhasil
- **Payment**: Balance

### Transaksi 2 (15 menit lalu)
- **User**: adm**** (adminbenar@gmail.com)
- **Produk**: BM Account - Limit 500
- **Jumlah**: 1 Akun
- **Total**: Rp 250.000
- **Status**: Berhasil
- **Payment**: Balance

### Transaksi 3 (30 menit lalu)
- **User**: mem**** (member1@gmail.com)
- **Produk**: Top Up Saldo
- **Jumlah**: -
- **Total**: Rp 500.000
- **Status**: Berhasil
- **Payment**: QRIS

### Transaksi 4 (1 jam lalu)
- **User**: adm**** (adminbenar@gmail.com)
- **Produk**: Personal Account - Aged 1 Year
- **Jumlah**: 1 Akun
- **Total**: Rp 100.000
- **Status**: Berhasil
- **Payment**: Balance

### Transaksi 5 (2 jam lalu)
- **User**: mem**** (member1@gmail.com)
- **Produk**: BM Account - Limit 1000
- **Jumlah**: 1 Akun
- **Total**: Rp 450.000
- **Status**: Berhasil
- **Payment**: Balance

### Transaksi 6 (3 jam lalu)
- **User**: adm**** (adminbenar@gmail.com)
- **Produk**: Personal Account - Aged 2 Years
- **Jumlah**: 1 Akun
- **Total**: Rp 180.000
- **Status**: Berhasil
- **Payment**: Balance

### Transaksi 7 (4 jam lalu)
- **User**: mem**** (member1@gmail.com)
- **Produk**: Top Up Saldo
- **Jumlah**: -
- **Total**: Rp 1.000.000
- **Status**: Berhasil
- **Payment**: BCA Virtual Account

### Transaksi 8 (5 jam lalu)
- **User**: adm**** (adminbenar@gmail.com)
- **Produk**: BM Account - Limit 250
- **Jumlah**: 1 Akun
- **Total**: Rp 150.000
- **Status**: Berhasil
- **Payment**: Balance

### Transaksi 9 (6 jam lalu)
- **User**: mem**** (member1@gmail.com)
- **Produk**: BM Account - Limit 500
- **Jumlah**: 2 Akun
- **Total**: Rp 250.000
- **Status**: Berhasil
- **Payment**: Balance

### Transaksi 10 (7 jam lalu)
- **User**: adm**** (adminbenar@gmail.com)
- **Produk**: BM Account - Limit 1000
- **Jumlah**: 1 Akun
- **Total**: Rp 450.000
- **Status**: Berhasil
- **Payment**: Balance

## Cara Melihat

1. Buka halaman `/dashboard` (tidak perlu login)
2. Scroll ke bawah ke section "Transaksi Terbaru"
3. Tabel akan menampilkan 10 transaksi di atas

## API Endpoint

```
GET /api/transactions/recent?limit=10
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "transactionType": "purchase",
        "status": "completed",
        "amount": 150000,
        "paymentMethod": "Balance",
        "createdAt": "2025-11-19T05:49:18.123Z",
        "productName": "BM Account - Limit 250",
        "quantity": 1,
        "username": "mem****"
      }
    ]
  }
}
```

## Features

- ✅ Public endpoint (tidak perlu login)
- ✅ Username di-mask untuk privacy
- ✅ Real-time data dari database
- ✅ Menampilkan transaksi dari semua user
- ✅ Social proof untuk meningkatkan trust

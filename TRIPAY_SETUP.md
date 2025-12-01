# Tripay Payment Gateway Setup Guide

## Overview

Panduan ini menjelaskan cara setup dan konfigurasi Tripay Payment Gateway untuk aplikasi.

## Prerequisites

1. Akun Tripay (Sandbox atau Production)
2. API Key dan Private Key dari Tripay Dashboard
3. Merchant Code dari Tripay
4. Supabase project yang sudah setup

## Environment Variables

### Required Variables

Tambahkan environment variables berikut ke file `.env`:

```env
# Tripay Configuration
VITE_TRIPAY_MODE=sandbox                    # Mode: 'sandbox' atau 'production'
VITE_TRIPAY_MERCHANT_CODE=T1234             # Merchant code dari Tripay
VITE_TRIPAY_API_KEY=your_api_key_here       # API Key dari Tripay
VITE_TRIPAY_PRIVATE_KEY=your_private_key    # Private Key untuk signature
```

### Vercel API Routes Environment Variables

Untuk Vercel serverless functions, tambahkan di Vercel Dashboard:

```env
TRIPAY_MODE=sandbox
TRIPAY_MERCHANT_CODE=T1234
TRIPAY_API_KEY=your_api_key_here
TRIPAY_PRIVATE_KEY=your_private_key
TRIPAY_SANDBOX_API_URL=https://tripay.co.id/api-sandbox
TRIPAY_PRODUCTION_API_URL=https://tripay.co.id/api
```

### Supabase Edge Function Environment Variables

Untuk Supabase Edge Functions, set di Supabase Dashboard:

```env
TRIPAY_PRIVATE_KEY=your_private_key
```

## Getting Tripay Credentials

### 1. Register Tripay Account

1. Kunjungi [Tripay.co.id](https://tripay.co.id)
2. Register akun baru
3. Verifikasi email
4. Login ke dashboard

### 2. Get API Credentials

**Sandbox Mode (Testing):**
1. Login ke Tripay Dashboard
2. Pilih menu "API Keys" → "Sandbox"
3. Copy:
   - Merchant Code
   - API Key
   - Private Key

**Production Mode (Live):**
1. Lengkapi verifikasi akun
2. Pilih menu "API Keys" → "Production"
3. Copy credentials yang sama

## Database Setup

### 1. Run Migrations

Migrations sudah dibuat di `supabase/migrations/`:

```bash
# Apply migrations
supabase db push
```

### 2. Verify Tables

Pastikan tables berikut sudah dibuat:
- `tripay_payment_channels` - Payment methods dari Tripay
- `open_payments` - Open Payment codes
- `open_payment_transactions` - History pembayaran Open Payment
- `transactions` - Existing table dengan kolom Tripay

### 3. Setup RLS Policies

RLS policies sudah included di migrations. Verify dengan:

```sql
SELECT * FROM pg_policies WHERE tablename IN (
  'tripay_payment_channels',
  'open_payments', 
  'open_payment_transactions'
);
```

## Callback URL Configuration

### 1. Deploy Supabase Edge Function

```bash
# Deploy callback handler
supabase functions deploy tripay-callback
```

### 2. Get Callback URL

Callback URL format:
```
https://[project-ref].supabase.co/functions/v1/tripay-callback
```

### 3. Configure in Tripay Dashboard

1. Login ke Tripay Dashboard
2. Pilih menu "Settings" → "Callback URL"
3. Masukkan callback URL
4. Save

### 4. Test Callback

Gunakan Tripay Sandbox untuk test callback:
1. Buat transaksi test
2. Simulasikan pembayaran di Tripay Dashboard
3. Check logs di Supabase Functions

## Initial Setup Steps

### 1. Sync Payment Channels

Setelah setup environment variables, sync payment channels:

```typescript
// Di admin panel, klik "Sync dari Tripay"
// Atau via code:
import { syncPaymentChannels } from '@/services/tripayChannels.service';
await syncPaymentChannels();
```

### 2. Enable Payment Channels

1. Login sebagai admin
2. Buka "Payment Channel Management"
3. Enable channels yang ingin digunakan
4. Atur display order jika perlu

### 3. Test Payment Flow

**Sandbox Testing:**
1. Buat transaksi test dengan nominal kecil
2. Gunakan payment method yang tersedia
3. Simulasikan pembayaran di Tripay Dashboard
4. Verify callback diterima dan status updated

## API Endpoints

### Frontend API Routes (Vercel)

```
POST   /api/tripay-proxy              # Create Closed Payment
GET    /api/tripay-channels           # Get payment channels
POST   /api/tripay-open-payment       # Create Open Payment
GET    /api/tripay-open-payment/:uuid # Get Open Payment detail
GET    /api/tripay-transaction-detail # Get transaction detail
GET    /api/tripay-transaction-status # Quick status check
```

### Supabase Edge Functions

```
POST   /functions/v1/tripay-callback  # Receive payment callbacks
```

## Testing

### Sandbox Mode Testing

1. Set `VITE_TRIPAY_MODE=sandbox`
2. Use sandbox credentials
3. Test all payment flows:
   - Top-up
   - Product purchase
   - Open Payment
4. Simulate payments in Tripay Dashboard
5. Verify callbacks and status updates

### Production Checklist

Before going live:

- [ ] Verify production credentials
- [ ] Set `VITE_TRIPAY_MODE=production`
- [ ] Update callback URL to production
- [ ] Test with small real transaction
- [ ] Monitor first few transactions
- [ ] Setup error alerting

## Troubleshooting

### Payment Creation Fails

**Error: "Invalid API Key"**
- Check API key di environment variables
- Pastikan mode (sandbox/production) sesuai dengan credentials

**Error: "Invalid Signature"**
- Check Private Key
- Verify signature generation logic
- Check merchant code

### Callback Not Received

1. Check callback URL di Tripay Dashboard
2. Verify Edge Function deployed
3. Check Edge Function logs:
   ```bash
   supabase functions logs tripay-callback
   ```
4. Test callback manually dengan curl

### Payment Status Not Updated

1. Check callback signature validation
2. Verify database permissions (RLS)
3. Check transaction reference exists
4. Review Edge Function logs

## Security Best Practices

1. **Never expose Private Key** di frontend
2. **Always validate callback signature** di Edge Function
3. **Use HTTPS** untuk semua endpoints
4. **Implement rate limiting** untuk API routes
5. **Log all callback events** untuk audit trail
6. **Monitor failed callbacks** dan retry jika perlu

## Support

### Tripay Support
- Email: support@tripay.co.id
- Docs: https://tripay.co.id/developer
- Dashboard: https://tripay.co.id/member

### Internal Support
- Check Edge Function logs
- Review database audit logs
- Contact development team

## Additional Resources

- [Tripay API Documentation](https://tripay.co.id/developer)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Project README](./README.md)

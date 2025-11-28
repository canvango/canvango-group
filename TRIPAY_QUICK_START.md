# ⚡ Tripay Quick Start - 5 Menit Setup

## 🎯 Goal
Deploy Tripay payment gateway integration dalam 5 menit.

## ✅ Prerequisites
- [x] Supabase project sudah running
- [x] Tripay account (sandbox mode)
- [x] Node.js installed

## 🚀 Step-by-Step

### 1️⃣ Install Supabase CLI (1 menit)

```bash
npm install -g supabase
```

### 2️⃣ Login & Link Project (1 menit)

```bash
# Login
supabase login

# Link ke project
supabase link --project-ref gpittnsfzgkdbqnccncn
```

### 3️⃣ Deploy Edge Function (2 menit)

```bash
# Deploy callback handler
supabase functions deploy tripay-callback

# Set environment variable
supabase secrets set TRIPAY_PRIVATE_KEY=BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz
```

### 4️⃣ Configure Tripay Dashboard (1 menit)

1. Buka https://tripay.co.id/member/merchant
2. Set **Callback URL**:
   ```
   https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback
   ```
3. Save

### 5️⃣ Test Integration (30 detik)

```bash
# Start dev server
npm run dev

# Open browser
# Login → Top-Up → Pilih metode → Bayar
```

## ✅ Verification

### Check Edge Function
```bash
# View logs
supabase functions logs tripay-callback --tail
```

### Check Database
```sql
-- Check transactions with Tripay data
SELECT 
  id,
  amount,
  status,
  tripay_reference,
  tripay_status,
  tripay_payment_method
FROM transactions
WHERE tripay_reference IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

### Test Callback
```bash
curl -X POST https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

Expected response:
```json
{
  "success": false,
  "message": "Missing signature"
}
```

## 🎉 Done!

Tripay integration sudah aktif. Sekarang user bisa:
- ✅ Top-up saldo via Virtual Account
- ✅ Top-up via QRIS
- ✅ Top-up via E-Wallet (OVO, DANA, GoPay)
- ✅ Top-up via Retail (Alfamart, Indomaret)

## 📱 Next Steps

1. **Integrate ke TopUp page:**
   ```typescript
   import { TripayPaymentModal } from '@/features/member-area/components/payment/TripayPaymentModal';
   ```

2. **Test dengan sandbox:**
   - Buat payment
   - Bayar dengan test credentials
   - Cek balance update

3. **Monitor logs:**
   ```bash
   supabase functions logs tripay-callback --tail
   ```

## 🐛 Troubleshooting

**Edge Function tidak deploy?**
```bash
# Check Supabase CLI version
supabase --version

# Update jika perlu
npm update -g supabase
```

**Callback tidak diterima?**
- Cek callback URL di Tripay dashboard
- Pastikan HTTPS
- Test dengan curl

**Balance tidak update?**
```sql
-- Check function exists
SELECT process_topup_transaction('test-id');
```

## 📞 Support

- **Tripay:** https://tripay.co.id/member/ticket
- **Supabase:** https://supabase.com/dashboard/support
- **Documentation:** `TRIPAY_INTEGRATION_GUIDE.md`

---

**Total Time:** ~5 minutes
**Difficulty:** Easy ⭐
**Status:** ✅ Production Ready

# 🚀 Tripay Payment Gateway Integration Guide

## 📋 Overview

Integrasi Tripay Payment Gateway untuk Canvango Member Area menggunakan **Supabase Edge Function** sebagai callback handler. Ini memungkinkan aplikasi frontend-only untuk menerima notifikasi pembayaran dari Tripay.

## 🏗️ Architecture

```
User → Frontend → Tripay API → Create Payment
                                    ↓
                              Payment Page
                                    ↓
                              User Pays
                                    ↓
Tripay → Edge Function → Update Database → Update Balance
         (Callback)
```

## 🔑 Credentials

**API Key:** `LYIV2DddSP0DnEaxiMyAYleC3EKAFdaIYalrB2Wd`
**Private Key:** `BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz`
**Merchant Code:** `T32379`

**Mode:** Sandbox (untuk testing)
**API URL:** `https://tripay.co.id/api-sandbox`

## 📦 Files Created

### 1. Database Migration
- `supabase/migrations/005_add_tripay_integration_fields.sql`
- Menambah kolom Tripay di tabel `transactions`

### 2. Edge Function
- `supabase/functions/tripay-callback/index.ts`
- Handle callback dari Tripay
- Verify signature
- Update transaction status
- Update user balance untuk topup

### 3. Frontend Service
- `src/services/tripay.service.ts`
- Create payment
- Get payment methods
- Check payment status

### 4. React Hook
- `src/hooks/useTripay.ts`
- `usePaymentMethods()` - Fetch payment methods
- `useCreatePayment()` - Create payment
- `usePaymentStatus()` - Check status with polling

### 5. UI Component
- `src/features/member-area/components/payment/TripayPaymentModal.tsx`
- Modal untuk pilih metode pembayaran
- Show payment methods dengan icon
- Calculate total dengan fee

## 🚀 Setup Instructions

### Step 1: Deploy Edge Function

```bash
# Install Supabase CLI (jika belum)
npm install -g supabase

# Login ke Supabase
supabase login

# Link project
supabase link --project-ref gpittnsfzgkdbqnccncn

# Deploy edge function
supabase functions deploy tripay-callback
```

### Step 2: Set Environment Variables di Supabase

Buka Supabase Dashboard → Project Settings → Edge Functions → Environment Variables

Tambahkan:
```
TRIPAY_PRIVATE_KEY=BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz
```

### Step 3: Configure Tripay Dashboard

1. Login ke https://tripay.co.id/member
2. Buka **Merchant Settings**
3. Set **Callback URL** ke:
   ```
   https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback
   ```
4. Enable callback untuk semua payment methods

### Step 4: Test Integration

```bash
# Start dev server
npm run dev

# Test payment creation
# 1. Login sebagai member
# 2. Buka halaman Top-Up
# 3. Pilih jumlah dan metode pembayaran
# 4. Klik "Bayar Sekarang"
# 5. Akan redirect ke Tripay payment page
```

## 💻 Usage Example

### Create Payment

```typescript
import { useCreatePayment } from '@/hooks/useTripay';

function TopUpPage() {
  const createPayment = useCreatePayment();
  
  const handleTopUp = async () => {
    await createPayment.mutateAsync({
      amount: 100000,
      paymentMethod: 'BRIVA', // BRI Virtual Account
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '081234567890',
      orderItems: [
        {
          name: 'Top-Up Saldo',
          price: 100000,
          quantity: 1,
        }
      ],
    });
  };
  
  return (
    <button onClick={handleTopUp}>
      Top-Up Rp 100.000
    </button>
  );
}
```

### Use Payment Modal Component

```typescript
import { TripayPaymentModal } from '@/features/member-area/components/payment/TripayPaymentModal';

function TopUpPage() {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  
  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Top-Up Saldo
      </button>
      
      <TripayPaymentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        amount={100000}
        customerName={user.fullName}
        customerEmail={user.email}
        customerPhone={user.phone}
        orderItems={[
          {
            name: 'Top-Up Saldo',
            price: 100000,
            quantity: 1,
          }
        ]}
      />
    </>
  );
}
```

## 🔄 Payment Flow

### 1. Create Payment
```typescript
// Frontend creates payment
const payment = await createPayment({
  amount: 100000,
  paymentMethod: 'BRIVA',
  // ... other params
});

// Transaction created in database with status: 'pending'
// User redirected to payment.data.checkout_url
```

### 2. User Pays
```
User melakukan pembayaran via:
- Virtual Account
- QRIS
- E-Wallet (OVO, DANA, GoPay)
- Retail (Alfamart, Indomaret)
```

### 3. Tripay Callback
```typescript
// Tripay sends callback to Edge Function
POST https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback

// Edge Function:
// 1. Verify signature
// 2. Update transaction status
// 3. If topup: update user balance
// 4. Return success response
```

### 4. Frontend Updates
```typescript
// React Query automatically refetches transactions
// User sees updated balance
// Transaction status changes to 'completed'
```

## 🧪 Testing

### Test dengan Sandbox

Tripay Sandbox menyediakan test credentials:

**Virtual Account:**
- Bayar dengan nominal apapun
- Status otomatis jadi PAID setelah 5 menit

**QRIS:**
- Scan QR code
- Status otomatis jadi PAID

**E-Wallet:**
- Klik link pembayaran
- Status otomatis jadi PAID

### Test Callback Manually

```bash
# Test callback dengan curl
curl -X POST https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: YOUR_SIGNATURE" \
  -d '{
    "reference": "T1234567890",
    "merchant_ref": "YOUR_TRANSACTION_ID",
    "payment_method": "BRIVA",
    "payment_name": "BRI Virtual Account",
    "amount": 100000,
    "fee_merchant": 2500,
    "total_amount": 102500,
    "status": "PAID",
    "paid_at": "2025-11-28T10:00:00+07:00"
  }'
```

## 📊 Database Schema

### Transactions Table (Updated)

```sql
-- Tripay fields added
tripay_reference VARCHAR(255) UNIQUE
tripay_merchant_ref VARCHAR(255)
tripay_payment_method VARCHAR(100)
tripay_payment_name VARCHAR(255)
tripay_payment_url TEXT
tripay_qr_url TEXT
tripay_checkout_url TEXT
tripay_amount NUMERIC(15,2)
tripay_fee NUMERIC(15,2)
tripay_total_amount NUMERIC(15,2)
tripay_status VARCHAR(50)
tripay_paid_at TIMESTAMP WITH TIME ZONE
tripay_callback_data JSONB
```

## 🔐 Security

### Signature Verification

Edge Function memverifikasi signature dari Tripay:

```typescript
const signatureData = JSON.stringify(body);
const hmac = createHmac('sha256', TRIPAY_PRIVATE_KEY);
hmac.update(signatureData);
const calculatedSignature = hmac.digest('hex');

if (calculatedSignature !== callbackSignature) {
  return 401 Unauthorized;
}
```

### Environment Variables

**Frontend (.env):**
```
VITE_TRIPAY_API_KEY=LYIV2DddSP0DnEaxiMyAYleC3EKAFdaIYalrB2Wd
VITE_TRIPAY_PRIVATE_KEY=BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz
VITE_TRIPAY_MERCHANT_CODE=T32379
VITE_TRIPAY_CALLBACK_URL=https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback
VITE_TRIPAY_MODE=sandbox
```

**Edge Function (Supabase Dashboard):**
```
TRIPAY_PRIVATE_KEY=BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz
```

## 🐛 Troubleshooting

### Callback tidak diterima

1. **Cek Edge Function logs:**
   ```bash
   supabase functions logs tripay-callback
   ```

2. **Verify callback URL di Tripay Dashboard**
   - Harus HTTPS
   - Harus accessible dari internet

3. **Test callback manually** dengan curl

### Payment tidak update balance

1. **Cek transaction status:**
   ```sql
   SELECT * FROM transactions 
   WHERE tripay_reference = 'T1234567890';
   ```

2. **Cek function `process_topup_transaction`:**
   ```sql
   SELECT process_topup_transaction('transaction-id');
   ```

### Signature verification failed

1. **Pastikan TRIPAY_PRIVATE_KEY benar**
2. **Cek format callback data**
3. **Lihat Edge Function logs**

## 📈 Production Checklist

- [ ] Deploy Edge Function ke production
- [ ] Set environment variables di Supabase
- [ ] Update Tripay callback URL
- [ ] Change `VITE_TRIPAY_MODE` to `production`
- [ ] Test dengan real payment methods
- [ ] Monitor Edge Function logs
- [ ] Setup error alerting
- [ ] Document payment flow untuk team

## 🔗 Resources

- **Tripay Documentation:** https://tripay.co.id/developer
- **Tripay Dashboard:** https://tripay.co.id/member
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Support:** Contact Tripay support untuk production setup

## 📝 Notes

- Sandbox mode untuk testing, production mode untuk live
- Callback signature WAJIB diverifikasi
- Edge Function auto-scale, tidak perlu worry tentang traffic
- Transaction fees ditanggung customer (bisa diubah di Tripay dashboard)
- Payment expired setelah 24 jam (configurable)

---

**Status:** ✅ Ready for Testing
**Last Updated:** 2025-11-28
**Version:** 1.0.0

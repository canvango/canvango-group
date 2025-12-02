# Analisis: TriPay Embedded Payment (Tanpa Redirect)

## 📋 Situasi Saat Ini

### Current Flow (Dengan Redirect)
```
User → Pilih Metode → Klik "Bayar Sekarang"
  ↓
Frontend → createPayment() → Vercel API → TriPay API
  ↓
Response: { checkout_url, pay_code, qr_url, instructions }
  ↓
Frontend → Tampilkan PaymentInstructions Component
  ↓
User → Klik "Lanjutkan ke Halaman Pembayaran" (checkout_url)
  ↓
🔴 REDIRECT ke tab baru TriPay Payment Gateway
```

**Masalah:**
- User di-redirect ke halaman TriPay eksternal
- User keluar dari aplikasi canvango.com
- UX kurang seamless

---

## ✅ Solusi: Embedded Payment (Seperti Gambar)

### Target Flow (Embedded)
```
User → Pilih Metode → Klik "Bayar Sekarang"
  ↓
Frontend → createPayment() → Vercel API → TriPay API
  ↓
Response: { pay_code, qr_url, qr_string, instructions }
  ↓
Frontend → Tampilkan EMBEDDED payment UI di halaman yang sama
  ↓
✅ User tetap di canvango.com/top-up
✅ Tampilkan QR Code / Virtual Account / Pay Code
✅ Countdown timer
✅ Auto-refresh status
```

---

## 🎯 Yang Perlu Diubah

### 1. **Hapus Checkout URL Button**

**File:** `src/features/payment/components/PaymentInstructions.tsx`

**Current Code (Lines 135-152):**
```tsx
{/* Checkout URL */}
{checkoutUrl && (
  <div className="card bg-green-50 border border-green-200">
    <div className="card-body">
      <a
        href={checkoutUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <span>Lanjutkan ke Halaman Pembayaran</span>
        <svg>...</svg>
      </a>
    </div>
  </div>
)}
```

**Action:** ❌ **HAPUS** section ini sepenuhnya

**Alasan:**
- `checkout_url` adalah link ke halaman TriPay eksternal
- Kita tidak ingin redirect, jadi tidak perlu tombol ini
- Semua informasi pembayaran sudah ada di `pay_code`, `qr_url`, dan `instructions`

---

### 2. **Enhance Payment Display**

**File:** `src/features/payment/components/PaymentInstructions.tsx`

**Current:** Sudah ada QR Code dan Pay Code display ✅

**Enhancement Needed:**
- Perbesar QR Code untuk mobile (saat ini 48x48 = 192px)
- Tambahkan visual emphasis pada pay code
- Tambahkan status indicator (Menunggu Pembayaran)

**Suggested Changes:**

```tsx
{/* Status Badge - ADD THIS */}
<div className="card bg-yellow-50 border-2 border-yellow-300">
  <div className="card-body">
    <div className="flex items-center gap-3">
      <div className="animate-pulse">
        <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-yellow-900">Menunggu Pembayaran</p>
        <p className="text-xs text-yellow-700">Selesaikan pembayaran untuk melanjutkan</p>
      </div>
    </div>
  </div>
</div>

{/* QR Code - ENHANCE SIZE */}
{qrUrl && (
  <div className="card">
    <div className="card-body text-center">
      <p className="text-sm font-medium text-gray-700 mb-3">Scan QR Code</p>
      <div className="bg-white p-4 rounded-2xl inline-block border-2 border-gray-200">
        <img
          src={qrUrl}
          alt="QR Code"
          className="w-64 h-64 md:w-80 md:h-80" {/* LARGER SIZE */}
        />
      </div>
      <p className="text-xs text-gray-500 mt-3">
        Scan QR code ini menggunakan aplikasi mobile banking atau e-wallet Anda
      </p>
    </div>
  </div>
)}

{/* Pay Code - ENHANCE VISUAL */}
{payCode && (
  <div className="card border-2 border-blue-300">
    <div className="card-body">
      <p className="text-sm font-medium text-gray-700 mb-2">Kode Pembayaran / Virtual Account</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
          <p className="text-2xl font-mono font-bold text-blue-900 text-center tracking-wider">
            {payCode}
          </p>
        </div>
        <button
          onClick={handleCopyPayCode}
          className="btn-primary px-4 py-4" {/* LARGER BUTTON */}
          title="Salin kode"
        >
          {/* ... icon ... */}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Gunakan kode ini untuk transfer melalui ATM, Mobile Banking, atau Internet Banking
      </p>
    </div>
  </div>
)}
```

---

### 3. **Add Auto-Refresh Status**

**File:** `src/features/payment/components/PaymentInstructions.tsx`

**Current:** Ada `onRefreshStatus` prop tapi tidak digunakan di TopUp.tsx

**Action:** Implement auto-polling di TopUp.tsx

**File:** `src/features/member-area/pages/TopUp.tsx`

**Add after line 17:**
```tsx
import { usePaymentStatus } from '@/hooks/useTripay';
```

**Add state after line 27:**
```tsx
const [pollingReference, setPollingReference] = React.useState<string | null>(null);

// Auto-poll payment status
const { data: paymentStatus } = usePaymentStatus(pollingReference, {
  enabled: !!pollingReference,
  refetchInterval: 5000, // Poll every 5 seconds
});

// Check if payment is completed
React.useEffect(() => {
  if (paymentStatus?.tripay_status === 'PAID') {
    setNotification({
      type: 'success',
      message: '🎉 Pembayaran berhasil! Saldo Anda telah ditambahkan.'
    });
    setPollingReference(null);
    setPaymentResponse(null);
    setShowPaymentSelection(false);
    setSelectedAmount(0);
    setSelectedMethodCode(null);
  }
}, [paymentStatus]);
```

**Update handlePayment (line 54):**
```tsx
const handlePayment = async () => {
  if (!selectedMethod || !user) {
    setNotification({
      type: 'error',
      message: 'Pilih metode pembayaran terlebih dahulu'
    });
    return;
  }

  try {
    const response = await createPayment.mutateAsync({
      amount: selectedAmount,
      paymentMethod: selectedMethod.code,
      customerName: user.fullName,
      customerEmail: user.email,
      customerPhone: user.phone || '',
      orderItems: [
        {
          name: 'Top-Up Saldo',
          price: selectedAmount,
          quantity: 1,
        }
      ],
    });
    
    // Show payment instructions
    setPaymentResponse(response);
    
    // Start polling status
    setPollingReference(response.data.reference); // ADD THIS
    
    setNotification({
      type: 'success',
      message: 'Pembayaran berhasil dibuat! Silakan selesaikan pembayaran.'
    });
  } catch (error: any) {
    setNotification({
      type: 'error',
      message: error.message || 'Gagal membuat pembayaran'
    });
  }
};
```

**Add manual refresh handler:**
```tsx
const handleRefreshStatus = async () => {
  if (!paymentResponse?.data?.reference) return;
  
  try {
    const status = await checkPaymentStatus(paymentResponse.data.reference);
    
    if (status.tripay_status === 'PAID') {
      setNotification({
        type: 'success',
        message: '🎉 Pembayaran berhasil! Saldo Anda telah ditambahkan.'
      });
      setPollingReference(null);
      setPaymentResponse(null);
      setShowPaymentSelection(false);
      setSelectedAmount(0);
      setSelectedMethodCode(null);
    } else if (status.tripay_status === 'EXPIRED') {
      setNotification({
        type: 'error',
        message: 'Pembayaran telah kadaluarsa. Silakan buat pembayaran baru.'
      });
    } else {
      setNotification({
        type: 'info',
        message: `Status: ${status.tripay_status}`
      });
    }
  } catch (error: any) {
    setNotification({
      type: 'error',
      message: 'Gagal memeriksa status pembayaran'
    });
  }
};
```

**Update PaymentInstructions call (line 234):**
```tsx
<PaymentInstructions
  instructions={paymentResponse.data.instructions}
  payCode={paymentResponse.data.pay_code}
  qrUrl={paymentResponse.data.qr_url}
  checkoutUrl={undefined} {/* REMOVE checkout_url */}
  expiredTime={paymentResponse.data.expired_time}
  onRefreshStatus={handleRefreshStatus} {/* ADD THIS */}
/>
```

---

### 4. **Verify TriPay Response Data**

**Dokumentasi TriPay mengatakan:**
> "Bisa Kak, silahkan untuk menggunakan data pay_code, qr_url, dan lain-lain dari response API kami"

**Response dari TriPay API sudah include:**
```typescript
{
  success: true,
  data: {
    reference: "T1234567890",
    pay_code: "8277123456789012", // ✅ Virtual Account / Pay Code
    qr_url: "https://tripay.co.id/qr/...", // ✅ QR Code URL
    qr_string: "00020101021126...", // ✅ QR String (optional)
    checkout_url: "https://tripay.co.id/checkout/...", // ❌ TIDAK DIGUNAKAN
    instructions: [...], // ✅ Step-by-step instructions
    expired_time: 1234567890, // ✅ Expiration timestamp
    status: "UNPAID"
  }
}
```

**Kesimpulan:** ✅ **Data sudah lengkap dari API, tidak perlu perubahan backend**

---

## 📝 Summary Perubahan

### Files to Modify:

1. **`src/features/payment/components/PaymentInstructions.tsx`**
   - ❌ Hapus section "Lanjutkan ke Halaman Pembayaran" (checkout_url button)
   - ✅ Tambah status badge "Menunggu Pembayaran"
   - ✅ Perbesar QR Code (w-64 h-64 → w-80 h-80)
   - ✅ Enhance pay code visual (gradient background, larger text)

2. **`src/features/member-area/pages/TopUp.tsx`**
   - ✅ Import `usePaymentStatus` dan `checkPaymentStatus`
   - ✅ Add auto-polling state (`pollingReference`)
   - ✅ Add `useEffect` untuk detect payment success
   - ✅ Add `handleRefreshStatus` function
   - ✅ Pass `onRefreshStatus` ke PaymentInstructions
   - ✅ Remove `checkoutUrl` prop

3. **`src/hooks/useTripay.ts`** (Verify)
   - ✅ Check if `usePaymentStatus` hook exists
   - ✅ Ensure polling is implemented

---

## 🎨 Expected Result (Seperti Gambar)

### Layout Embedded Payment:

```
┌─────────────────────────────────────────┐
│  ⚠️  Menunggu Pembayaran                │
│  Selesaikan pembayaran untuk melanjutkan│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  ⏱️  Batas Waktu Pembayaran             │
│  00:29:25                               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Scan QR Code                           │
│  ┌─────────────────────┐                │
│  │                     │                │
│  │    [QR CODE]        │                │
│  │                     │                │
│  └─────────────────────┘                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Kode Pembayaran / Virtual Account      │
│  ┌─────────────────────────────────┐    │
│  │  8277 1234 5678 9012           │ 📋 │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Cara Pembayaran                        │
│  [ATM] [Mobile Banking] [Internet Bank] │
│                                         │
│  1. Masuk ke menu transfer              │
│  2. Pilih Virtual Account               │
│  3. Masukkan nomor: 8277...             │
│  4. Konfirmasi pembayaran               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  🔄 Refresh Status Pembayaran           │
└─────────────────────────────────────────┘
```

---

## ✅ Keuntungan Embedded Payment

1. **Better UX:** User tidak keluar dari aplikasi
2. **Seamless Flow:** Semua informasi di satu halaman
3. **Auto-Update:** Status otomatis ter-update tanpa refresh manual
4. **Mobile-Friendly:** QR Code besar, mudah di-scan
5. **Clear Instructions:** Step-by-step guide langsung terlihat

---

## 🚀 Next Steps

1. Hapus checkout_url button dari PaymentInstructions
2. Enhance visual QR Code dan Pay Code
3. Implement auto-polling di TopUp.tsx
4. Test dengan berbagai payment methods (QRIS, VA, E-Wallet)
5. Verify callback tetap berfungsi untuk update balance

---

## 📚 Reference

- TriPay Documentation: https://tripay.co.id/developer?tab=transaction-create
- Spec File: `.kiro/specs/tripay-payment-integration/design.md`
- Support Response: "Bisa Kak, silahkan untuk menggunakan data pay_code, qr_url, dan lain-lain dari response API kami"

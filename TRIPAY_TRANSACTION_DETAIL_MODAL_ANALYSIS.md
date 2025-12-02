# Analisis: TriPay Transaction Detail Modal

## 📋 Requirement

**User Request:**
> Pada `/riwayat-transaksi?tab=topup`, ketika klik tombol "Lihat" pada transaksi Top Up (TriPay), tampilkan modal dengan detail payment gateway TriPay seperti di `/top-up` setelah klik "Bayar Sekarang".

**Scope:**
- ✅ **HANYA untuk tab "Top Up"** (transaksi TriPay)
- ❌ **TIDAK mengubah tab "Transaksi Akun"**

---

## 🔍 Current Implementation Analysis

### 1. **TransactionHistory.tsx**
- Menggunakan `TransactionDetailModal` untuk menampilkan detail transaksi
- Modal dipanggil via `handleViewDetails(transaction)`
- Data transaksi sudah include TriPay fields dari database

### 2. **TransactionDetailModal.tsx** (Current)
- Modal generic untuk semua jenis transaksi
- Menampilkan:
  - ID Transaksi
  - Tanggal
  - Total
  - Produk (jika ada)
  - Payment Method
  - Warranty (jika ada)
  - Account Credentials (jika ada)

**Masalah:**
- ❌ Tidak menampilkan detail TriPay payment gateway
- ❌ Tidak ada QR Code
- ❌ Tidak ada payment instructions
- ❌ Tidak ada countdown timer
- ❌ Tidak ada status "Menunggu Pembayaran"

### 3. **Database Structure** (TriPay Fields Available)
```sql
tripay_reference          -- T4715928826465AA8GA
tripay_merchant_ref       -- UUID transaction
tripay_payment_method     -- QRIS2
tripay_payment_name       -- QRIS
tripay_status             -- UNPAID, PAID, EXPIRED, FAILED
tripay_qr_url             -- https://tripay.co.id/qr/...
tripay_payment_url        -- URL instruksi
tripay_checkout_url       -- URL checkout (tidak digunakan)
tripay_amount             -- Amount asli
tripay_fee                -- Fee
tripay_total_amount       -- Total dengan fee
tripay_callback_data      -- JSONB (instructions, expired_time, dll)
```

### 4. **TripayPaymentGateway Component** (Already Exists!)
- Component full-page payment gateway yang sudah dibuat
- Location: `src/features/payment/components/TripayPaymentGateway.tsx`
- Features:
  - ✅ QR Code display
  - ✅ Pay Code / Virtual Account
  - ✅ Payment instructions
  - ✅ Countdown timer
  - ✅ Transaction details
  - ✅ Payment breakdown
  - ✅ Refresh status button

---

## 🎯 Solution Strategy

### Option 1: Reuse TripayPaymentGateway in Modal ✅ (RECOMMENDED)
**Pros:**
- ✅ Reuse existing component (DRY principle)
- ✅ Consistent UI dengan payment flow
- ✅ All features already implemented
- ✅ Minimal code changes

**Cons:**
- ⚠️ Need to adapt full-page component to modal size
- ⚠️ Need to fetch additional data (instructions, expired_time)

### Option 2: Create New Modal Component
**Pros:**
- ✅ Custom design for modal
- ✅ Lighter component

**Cons:**
- ❌ Code duplication
- ❌ More work
- ❌ Inconsistent UI

**Decision:** **Option 1** - Reuse TripayPaymentGateway

---

## 📐 Implementation Plan

### Step 1: Create TripayTransactionDetailModal Component

**File:** `src/features/payment/components/TripayTransactionDetailModal.tsx`

**Purpose:** Modal wrapper untuk TripayPaymentGateway component

**Props:**
```typescript
interface TripayTransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}
```

**Features:**
- Fetch full TriPay data from `tripay_callback_data` (JSONB)
- Extract payment instructions, expired_time, etc.
- Pass data to TripayPaymentGateway component
- Wrap in Modal component
- Add "Tutup" button

---

### Step 2: Modify TripayPaymentGateway for Modal Use

**Current:** Full-page component with back button

**Changes Needed:**
1. Add prop `isModal?: boolean` to control layout
2. If `isModal === true`:
   - Remove back button
   - Remove outer padding
   - Adjust container sizing
   - Remove min-height constraints

**Example:**
```typescript
export function TripayPaymentGateway({
  paymentData,
  onBack,
  onRefreshStatus,
  isModal = false, // NEW PROP
}: TripayPaymentGatewayProps & { isModal?: boolean }) {
  
  return (
    <div className={isModal ? "" : "min-h-screen bg-gray-50 pb-8"}>
      {/* Back Button - Only show if not modal */}
      {!isModal && (
        <div className="px-2 sm:px-4 md:px-6 pt-6 pb-4">
          <button onClick={onBack}>← Pembayaran</button>
        </div>
      )}
      
      {/* Payment Gateway Container */}
      <div className={isModal ? "p-0" : "px-2 sm:px-4 md:px-6"}>
        {/* ... rest of component ... */}
      </div>
    </div>
  );
}
```

---

### Step 3: Update TransactionHistory.tsx

**Changes:**
1. Import `TripayTransactionDetailModal`
2. Add state for TriPay modal
3. Modify `handleViewDetails` to check transaction type
4. Render both modals conditionally

**Code:**
```typescript
// Add state
const [isTripayDetailModalOpen, setIsTripayDetailModalOpen] = useState(false);

// Modify handleViewDetails
const handleViewDetails = (transaction: Transaction) => {
  setSelectedTransaction(transaction);
  
  // Check if it's a TriPay transaction (topup with tripay_reference)
  if (transaction.type === TransactionType.TOPUP && transaction.tripayReference) {
    setIsTripayDetailModalOpen(true);
  } else {
    setIsDetailModalOpen(true);
  }
};

// Render both modals
<>
  {/* Regular Transaction Detail Modal */}
  <TransactionDetailModal
    transaction={selectedTransaction}
    isOpen={isDetailModalOpen}
    onClose={() => {
      setIsDetailModalOpen(false);
      setSelectedTransaction(null);
    }}
  />

  {/* TriPay Transaction Detail Modal */}
  <TripayTransactionDetailModal
    transaction={selectedTransaction}
    isOpen={isTripayDetailModalOpen}
    onClose={() => {
      setIsTripayDetailModalOpen(false);
      setSelectedTransaction(null);
    }}
  />
</>
```

---

### Step 4: Update Transaction Type

**File:** `src/features/member-area/types/transaction.ts`

**Add TriPay fields:**
```typescript
export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  quantity?: number;
  product?: {
    id: string;
    title: string;
  };
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
  warranty?: {
    expiresAt: Date;
    claimed: boolean;
  };
  purchaseId?: string;
  accountDetails?: any;
  
  // TriPay fields (NEW)
  tripayReference?: string;
  tripayMerchantRef?: string;
  tripayPaymentMethod?: string;
  tripayPaymentName?: string;
  tripayStatus?: string;
  tripayQrUrl?: string;
  tripayPaymentUrl?: string;
  tripayAmount?: number;
  tripayFee?: number;
  tripayTotalAmount?: number;
  tripayCallbackData?: {
    instructions?: Array<{
      title: string;
      steps: string[];
    }>;
    expired_time?: number;
    pay_code?: string;
    qr_string?: string;
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
  };
}
```

---

### Step 5: Update mapDbTransactionToTransaction

**File:** `src/features/member-area/pages/TransactionHistory.tsx`

**Add TriPay field mapping:**
```typescript
const mapDbTransactionToTransaction = (dbTxn: any): Transaction => {
  // ... existing code ...
  
  return {
    // ... existing fields ...
    
    // TriPay fields
    tripayReference: dbTxn.tripay_reference,
    tripayMerchantRef: dbTxn.tripay_merchant_ref,
    tripayPaymentMethod: dbTxn.tripay_payment_method,
    tripayPaymentName: dbTxn.tripay_payment_name,
    tripayStatus: dbTxn.tripay_status,
    tripayQrUrl: dbTxn.tripay_qr_url,
    tripayPaymentUrl: dbTxn.tripay_payment_url,
    tripayAmount: dbTxn.tripay_amount ? Number(dbTxn.tripay_amount) : undefined,
    tripayFee: dbTxn.tripay_fee ? Number(dbTxn.tripay_fee) : undefined,
    tripayTotalAmount: dbTxn.tripay_total_amount ? Number(dbTxn.tripay_total_amount) : undefined,
    tripayCallbackData: dbTxn.tripay_callback_data,
  };
};
```

---

### Step 6: Update getMemberTransactions Query

**File:** `src/features/member-area/services/transactions.service.ts`

**Add TriPay fields to SELECT:**
```typescript
export async function getMemberTransactions(params: {
  userId: string;
  limit?: number;
  offset?: number;
}): Promise<any[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      products:product_id (
        id,
        name
      ),
      purchases:purchase_id (
        id,
        account_details,
        warranty_expires_at,
        purchase_status
      ),
      tripay_reference,
      tripay_merchant_ref,
      tripay_payment_method,
      tripay_payment_name,
      tripay_status,
      tripay_qr_url,
      tripay_payment_url,
      tripay_amount,
      tripay_fee,
      tripay_total_amount,
      tripay_callback_data
    `)
    .eq('user_id', params.userId)
    .order('created_at', { ascending: false })
    .limit(params.limit || 100)
    .range(params.offset || 0, (params.offset || 0) + (params.limit || 100) - 1);

  if (error) throw error;
  return data || [];
}
```

---

## 🎨 UI/UX Considerations

### Modal Size
- Use `size="full"` or `size="xl"` for Modal
- Ensure responsive on mobile
- Allow scroll if content is long

### Layout Adjustments
- Remove back button (modal has close button)
- Remove outer padding (modal provides padding)
- Adjust max-width for modal context
- Keep 2-column layout on desktop
- Stack on mobile

### User Flow
```
User clicks "Lihat" on TriPay transaction
  ↓
Modal opens with TripayPaymentGateway
  ↓
Shows:
  - Status "Menunggu Pembayaran" (if UNPAID)
  - QR Code (if available)
  - Pay Code / Virtual Account
  - Countdown timer (if not expired)
  - Transaction details
  - Payment breakdown
  - Payment instructions
  - Refresh Status button
  ↓
User can:
  - View payment details
  - Copy pay code
  - Refresh status
  - Close modal
```

---

## ✅ Implementation Checklist

### Phase 1: Prepare Components
- [ ] Add `isModal` prop to TripayPaymentGateway
- [ ] Adjust TripayPaymentGateway layout for modal use
- [ ] Create TripayTransactionDetailModal component
- [ ] Test TripayPaymentGateway in modal context

### Phase 2: Update Data Layer
- [ ] Add TriPay fields to Transaction type
- [ ] Update mapDbTransactionToTransaction
- [ ] Update getMemberTransactions query
- [ ] Verify data mapping

### Phase 3: Integrate with TransactionHistory
- [ ] Import TripayTransactionDetailModal
- [ ] Add state for TriPay modal
- [ ] Modify handleViewDetails logic
- [ ] Render TripayTransactionDetailModal
- [ ] Test modal open/close

### Phase 4: Testing
- [ ] Test with UNPAID transaction (show QR, timer)
- [ ] Test with PAID transaction (show success)
- [ ] Test with EXPIRED transaction (show expired)
- [ ] Test refresh status button
- [ ] Test responsive (mobile/tablet/desktop)
- [ ] Test with different payment methods (QRIS, VA, E-Wallet)

### Phase 5: Edge Cases
- [ ] Handle missing tripay_callback_data
- [ ] Handle expired transactions
- [ ] Handle failed transactions
- [ ] Handle transactions without QR code
- [ ] Handle long transaction IDs

---

## 🚀 Expected Result

**Before:**
- Click "Lihat" → Generic modal with basic info
- No payment gateway details
- No QR code
- No instructions

**After:**
- Click "Lihat" → Full TriPay payment gateway modal
- Shows QR Code (if available)
- Shows Pay Code / Virtual Account
- Shows countdown timer
- Shows payment instructions
- Shows transaction details
- Shows payment breakdown
- Can refresh status
- Consistent with `/top-up` payment flow

---

## 📊 Data Flow

```
TransactionHistory
  ↓
User clicks "Lihat" on TriPay transaction
  ↓
handleViewDetails(transaction)
  ↓
Check: transaction.type === TOPUP && transaction.tripayReference
  ↓
Open TripayTransactionDetailModal
  ↓
Extract data from transaction.tripayCallbackData
  ↓
Pass to TripayPaymentGateway (isModal=true)
  ↓
Render payment gateway in modal
```

---

## 🔐 Security Considerations

- ✅ Only show to transaction owner (already filtered by user_id)
- ✅ No sensitive data exposed (payment gateway data is safe)
- ✅ Refresh status uses authenticated API
- ✅ Modal can only be opened from authenticated page

---

## 📝 Notes

1. **Reuse Existing Component:** TripayPaymentGateway already has all features needed
2. **Minimal Changes:** Only need to add `isModal` prop and adjust layout
3. **Consistent UI:** Same look and feel as payment flow
4. **No Breaking Changes:** Tab "Transaksi Akun" not affected
5. **Future-Proof:** Easy to add more features later

---

## 🎯 Success Criteria

- ✅ Modal opens when clicking "Lihat" on TriPay transaction
- ✅ Shows full payment gateway details (QR, instructions, etc.)
- ✅ Countdown timer works (if not expired)
- ✅ Refresh status button works
- ✅ Responsive on all devices
- ✅ Tab "Transaksi Akun" unchanged
- ✅ No errors or console warnings

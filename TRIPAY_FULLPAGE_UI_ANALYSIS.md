# Analisis: TriPay Full-Page Payment Gateway UI

## 📋 Requirement Analysis

Berdasarkan gambar referensi, user menginginkan:

**"Full 1 halaman isinya hanya page payment gateway TriPay dengan sidebar masih ada"**

---

## 🎨 Current UI vs Target UI

### Current Implementation (Jelek):
```
┌─────────────────────────────────────────────────────┐
│ Top Up Saldo Header                                 │
├─────────────────────────────────────────────────────┤
│ Saldo Card (Blue gradient)                          │
├─────────────────────────────────────────────────────┤
│ ✅ Pembayaran berhasil dibuat notification          │
├─────────────────────────────────────────────────────┤
│ ⚠️ Menunggu Pembayaran (Yellow badge)              │
├─────────────────────────────────────────────────────┤
│ ⏱️ Batas Waktu Pembayaran (Blue card)              │
├─────────────────────────────────────────────────────┤
│ 📱 Scan QR Code (White card)                        │
│    [QR CODE IMAGE]                                  │
├─────────────────────────────────────────────────────┤
│ 📋 Cara Pembayaran (Tabs + Instructions)           │
├─────────────────────────────────────────────────────┤
│ 🔄 Refresh Status Button                            │
├─────────────────────────────────────────────────────┤
│ Buat Pembayaran Baru Button                        │
└─────────────────────────────────────────────────────┘
```

**Masalah:**
- Terlalu banyak elemen di atas payment gateway
- User harus scroll untuk lihat QR Code
- Tidak fokus pada payment
- Terlihat seperti "payment instructions" bukan "payment gateway"

---

### Target UI (Seperti Gambar Referensi):
```
┌──────────┬──────────────────────────────────────────┐
│          │  ← Pembayaran                            │
│ SIDEBAR  │                                          │
│          │  ┌────────────────────────────────────┐  │
│ (Tetap   │  │  PAYMENT GATEWAY CONTAINER         │  │
│  Ada)    │  │  (Light blue background)           │  │
│          │  │                                    │  │
│          │  │  ┌──────────────────────────────┐ │  │
│          │  │  │  ⏱️ Menunggu Pembayaran      │ │  │
│          │  │  │  Status + Timer              │ │  │
│          │  │  └──────────────────────────────┘ │  │
│          │  │                                    │  │
│          │  │  ┌──────────────────────────────┐ │  │
│          │  │  │  LEFT PANEL (White card)     │ │  │
│          │  │  │                              │ │  │
│          │  │  │  QRIS Logo                   │ │  │
│          │  │  │                              │ │  │
│          │  │  │  [QR CODE - LARGE]           │ │  │
│          │  │  │                              │ │  │
│          │  │  │  Scan dengan aplikasi QRIS   │ │  │
│          │  │  │                              │ │  │
│          │  │  │  Jumlah Bayar: Rp10.000      │ │  │
│          │  │  │                              │ │  │
│          │  │  │  [Cara Pembayaran Button]    │ │  │
│          │  │  │                              │ │  │
│          │  │  └──────────────────────────────┘ │  │
│          │  │                                    │  │
│          │  │  RIGHT PANEL (White card)          │  │
│          │  │  - Merchant Info                   │  │
│          │  │  - Waktu Tersisa                   │  │
│          │  │  - Nama Pemesan                    │  │
│          │  │  - Nomor Invoice                   │  │
│          │  │  - Nomor HP                        │  │
│          │  │  - Nomor Referensi                 │  │
│          │  │  - Email                           │  │
│          │  │  - Rincian Pembayaran              │  │
│          │  │    * Top Up Saldo: Rp10.000        │  │
│          │  │    * Biaya Admin: Gratis           │  │
│          │  │    * Total: Rp10.000               │  │
│          │  │                                    │  │
│          │  └────────────────────────────────────┘  │
│          │                                          │
│          │  Footer: © 2025 Rere Media Group         │
└──────────┴──────────────────────────────────────────┘
```

---

## 🎯 Key Differences

### 1. **Layout Structure**

**Current:**
- Vertical stacking (top to bottom)
- Multiple separate cards
- Scroll required

**Target:**
- **2-column layout** (Left: QR Code, Right: Details)
- **Single container** dengan background light blue
- **Full viewport height** - no scroll needed
- **Centered content** dalam container

---

### 2. **Visual Hierarchy**

**Current:**
```
Header → Saldo → Notification → Status → Timer → QR → Instructions
```

**Target:**
```
Back Button → Payment Container (Full Focus)
  ├─ Status + Timer (Top)
  ├─ QR Code (Left, Prominent)
  └─ Transaction Details (Right)
```

---

### 3. **Component Breakdown**

#### A. **Container Layout**
```tsx
<div className="min-h-screen bg-gray-50">
  {/* Sidebar - Tetap ada */}
  <Sidebar />
  
  {/* Main Content Area */}
  <div className="ml-[sidebar-width] p-6">
    {/* Back Button */}
    <button>← Pembayaran</button>
    
    {/* Payment Gateway Container - FULL PAGE */}
    <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl p-8 min-h-[calc(100vh-120px)]">
      
      {/* Status Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-white/80 px-6 py-3 rounded-2xl">
          <Clock icon />
          <div>
            <p>Menunggu Pembayaran</p>
            <p>Selesaikan pembayaran sebelum...</p>
          </div>
        </div>
      </div>
      
      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        
        {/* LEFT: QR Code Panel */}
        <div className="bg-white rounded-3xl p-8 text-center">
          <img src="qris-logo" />
          <div className="my-8">
            <img src="qr-code" className="w-80 h-80 mx-auto" />
          </div>
          <p>Scan dengan aplikasi pembayaran QRIS</p>
          <p className="text-2xl font-bold mt-4">Rp10.000</p>
          <button>Cara Pembayaran</button>
        </div>
        
        {/* RIGHT: Transaction Details Panel */}
        <div className="bg-white rounded-3xl p-8">
          {/* Merchant Logo */}
          <div className="flex justify-between items-start mb-6">
            <img src="merchant-logo" />
            <div className="text-right">
              <p>Waktu Tersisa</p>
              <p className="text-red-500 text-2xl">00:29:25</p>
            </div>
          </div>
          
          {/* Transaction Info */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Merchant</span>
              <span>RERE MEDIA GROUP</span>
            </div>
            <div className="flex justify-between">
              <span>Nama Pemesan</span>
              <span>canvango</span>
            </div>
            {/* ... more details ... */}
          </div>
          
          {/* Payment Breakdown */}
          <div className="mt-6 pt-6 border-t">
            <h3>Rincian Pembayaran</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Top Up Saldo</span>
                <span>Rp10.000</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Admin</span>
                <span>Gratis</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-blue-600">Rp10.000</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Footer */}
      <div className="text-center mt-8 text-sm text-gray-600">
        © 2025 Rere Media Group
      </div>
      
    </div>
  </div>
</div>
```

---

## 🔄 Implementation Strategy

### Step 1: Create New Component
**File:** `src/features/payment/components/TripayPaymentGateway.tsx`

**Purpose:** Full-page payment gateway UI (seperti gambar referensi)

**Props:**
```typescript
interface TripayPaymentGatewayProps {
  paymentData: {
    reference: string;
    merchant_ref: string;
    payment_method: string;
    payment_name: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    amount: number;
    fee: number;
    total: number;
    pay_code?: string;
    qr_url?: string;
    qr_string?: string;
    expired_time: number;
    instructions: PaymentInstruction[];
  };
  onBack: () => void;
  onRefreshStatus: () => void;
}
```

---

### Step 2: Update TopUp.tsx Flow

**Current Flow:**
```tsx
// TopUp.tsx
{!paymentResponse && (
  <>
    <TopUpForm />
    <PaymentMethodSelector />
    <FeeCalculator />
    <Button onClick={handlePayment}>Bayar</Button>
  </>
)}

{paymentResponse && (
  <PaymentInstructions {...paymentResponse} />
)}
```

**New Flow:**
```tsx
// TopUp.tsx
{!paymentResponse && (
  <>
    <TopUpForm />
    <PaymentMethodSelector />
    <FeeCalculator />
    <Button onClick={handlePayment}>Bayar</Button>
  </>
)}

{paymentResponse && (
  <TripayPaymentGateway 
    paymentData={paymentResponse.data}
    onBack={handleBackToForm}
    onRefreshStatus={handleRefreshStatus}
  />
)}
```

---

### Step 3: Layout Considerations

#### A. **Sidebar Handling**
- Sidebar tetap ada (tidak hide)
- Main content area adjust dengan `ml-[sidebar-width]`
- Responsive: sidebar collapse di mobile

#### B. **Full Page Container**
```tsx
<div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl p-6 md:p-8">
  {/* Content */}
</div>
```

#### C. **Responsive Grid**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
  {/* Left: QR Code */}
  {/* Right: Details */}
</div>
```

---

## 📐 Design Specifications

### Colors:
- **Container Background:** `bg-gradient-to-br from-blue-100 to-blue-50`
- **Card Background:** `bg-white`
- **Primary Text:** `text-gray-900`
- **Secondary Text:** `text-gray-600`
- **Timer (Red):** `text-red-500`
- **Total (Blue):** `text-blue-600`

### Spacing:
- **Container Padding:** `p-6 md:p-8`
- **Card Padding:** `p-6 md:p-8`
- **Grid Gap:** `gap-6`
- **Section Spacing:** `space-y-3` or `space-y-4`

### Typography:
- **Timer:** `text-2xl font-bold`
- **Amount:** `text-2xl font-bold`
- **Total:** `text-lg font-bold`
- **Labels:** `text-sm text-gray-600`
- **Values:** `text-sm text-gray-900 font-medium`

### Border Radius:
- **Container:** `rounded-3xl`
- **Cards:** `rounded-3xl`
- **Status Badge:** `rounded-2xl`
- **Buttons:** `rounded-xl`

### QR Code:
- **Size Desktop:** `w-80 h-80` (320px × 320px)
- **Size Mobile:** `w-64 h-64` (256px × 256px)
- **Border:** `border-2 border-gray-200`
- **Background:** `bg-white p-4`

---

## 🎯 Key Features to Implement

### 1. **Back Button**
```tsx
<button 
  onClick={onBack}
  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4"
>
  <ArrowLeft className="w-5 h-5" />
  <span>Pembayaran</span>
</button>
```

### 2. **Status Header (Centered)**
```tsx
<div className="text-center mb-8">
  <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-sm">
    <Clock className="w-6 h-6 text-orange-500 animate-pulse" />
    <div className="text-left">
      <p className="text-sm font-semibold text-gray-900">Menunggu Pembayaran</p>
      <p className="text-xs text-gray-600">Selesaikan pembayaran sebelum 2 Desember 2025 pukul 16:35</p>
    </div>
  </div>
</div>
```

### 3. **Timer Display (Top Right of Details Panel)**
```tsx
<div className="text-right">
  <p className="text-xs text-gray-600">Waktu Tersisa</p>
  <p className="text-2xl font-bold text-red-500">00:29:25</p>
  <p className="text-xs text-gray-500">Jam:Menit:Detik</p>
</div>
```

### 4. **QR Code Panel (Left)**
```tsx
<div className="bg-white rounded-3xl p-8 text-center shadow-sm">
  {/* Payment Method Logo */}
  <div className="flex justify-center mb-6">
    <img src={paymentMethodLogo} alt="QRIS" className="h-12" />
  </div>
  
  {/* QR Code */}
  <div className="bg-white p-4 rounded-2xl inline-block border-2 border-gray-200 mb-6">
    <img 
      src={qrUrl} 
      alt="QR Code" 
      className="w-80 h-80"
    />
  </div>
  
  {/* Instructions */}
  <p className="text-sm text-gray-600 mb-4">
    Scan dengan aplikasi pembayaran QRIS
  </p>
  
  {/* Amount */}
  <div className="mb-6">
    <p className="text-xs text-gray-500">Jumlah Bayar</p>
    <p className="text-2xl font-bold text-gray-900">Rp10.000</p>
  </div>
  
  {/* Cara Pembayaran Button */}
  <button className="btn-secondary w-full">
    Cara Pembayaran
  </button>
</div>
```

### 5. **Transaction Details Panel (Right)**
```tsx
<div className="bg-white rounded-3xl p-8 shadow-sm">
  {/* Header: Merchant + Timer */}
  <div className="flex justify-between items-start mb-6">
    <div>
      <img src={merchantLogo} alt="Merchant" className="h-12" />
      <p className="text-xs text-gray-500 mt-1">ADVERTISING ACCOUNT PROVIDER</p>
    </div>
    <div className="text-right">
      <p className="text-xs text-gray-600">Waktu Tersisa</p>
      <p className="text-2xl font-bold text-red-500">{formatTimer(timeLeft)}</p>
    </div>
  </div>
  
  {/* Transaction Info */}
  <div className="space-y-3 text-sm border-b border-gray-200 pb-6 mb-6">
    <div className="flex justify-between">
      <span className="text-gray-600">Merchant</span>
      <span className="text-gray-900 font-medium">RERE MEDIA GROUP</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-600">Nama Pemesan</span>
      <span className="text-gray-900 font-medium">{customerName}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-600">Nomor Invoice</span>
      <span className="text-gray-900 font-medium">{merchantRef}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-600">Nomor HP</span>
      <span className="text-gray-900 font-medium">{customerPhone}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-600">Nomor Referensi</span>
      <span className="text-gray-900 font-medium">{reference}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-600">Email</span>
      <span className="text-gray-900 font-medium">{customerEmail}</span>
    </div>
  </div>
  
  {/* Payment Breakdown */}
  <div>
    <h3 className="text-sm font-semibold text-gray-900 mb-3">Rincian Pembayaran</h3>
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Top Up Saldo</span>
        <span className="text-gray-900 font-medium">Rp{amount.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Biaya Admin</span>
        <span className="text-gray-900 font-medium">{fee > 0 ? `Rp${fee.toLocaleString()}` : 'Gratis'}</span>
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
        <span className="text-base font-semibold text-gray-900">Total</span>
        <span className="text-lg font-bold text-blue-600">Rp{total.toLocaleString()}</span>
      </div>
    </div>
  </div>
</div>
```

---

## 🔄 State Management

### Payment Gateway State:
```typescript
const [showInstructions, setShowInstructions] = useState(false);
const [timeLeft, setTimeLeft] = useState<number>(0);

// Countdown timer
useEffect(() => {
  if (!expiredTime) return;
  
  const calculateTimeLeft = () => {
    const now = Math.floor(Date.now() / 1000);
    const diff = expiredTime - now;
    return diff > 0 ? diff : 0;
  };
  
  setTimeLeft(calculateTimeLeft());
  
  const interval = setInterval(() => {
    const remaining = calculateTimeLeft();
    setTimeLeft(remaining);
    
    if (remaining === 0) {
      clearInterval(interval);
      // Show expired notification
    }
  }, 1000);
  
  return () => clearInterval(interval);
}, [expiredTime]);
```

---

## 📱 Responsive Behavior

### Desktop (≥ 1024px):
- 2-column grid layout
- QR Code: 320px × 320px
- Max width: 1152px (max-w-6xl)
- Sidebar visible

### Tablet (768px - 1023px):
- 2-column grid layout (narrower)
- QR Code: 256px × 256px
- Sidebar collapsible

### Mobile (< 768px):
- 1-column stack layout
- QR Code: 256px × 256px
- Sidebar hidden (hamburger menu)
- Full width cards

---

## 🎨 Visual Enhancements

### 1. **Glassmorphism Effect (Status Badge)**
```tsx
className="bg-white/80 backdrop-blur-sm"
```

### 2. **Subtle Shadows**
```tsx
className="shadow-sm hover:shadow-md transition-shadow"
```

### 3. **Gradient Background**
```tsx
className="bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-50"
```

### 4. **Pulse Animation (Timer Icon)**
```tsx
<Clock className="animate-pulse text-orange-500" />
```

---

## ✅ Implementation Checklist

### Phase 1: Component Structure
- [ ] Create `TripayPaymentGateway.tsx`
- [ ] Define props interface
- [ ] Setup basic layout (container + grid)
- [ ] Add back button
- [ ] Add status header

### Phase 2: Left Panel (QR Code)
- [ ] Payment method logo
- [ ] QR Code display (large)
- [ ] Scan instructions
- [ ] Amount display
- [ ] "Cara Pembayaran" button
- [ ] Instructions modal/drawer

### Phase 3: Right Panel (Details)
- [ ] Merchant logo + info
- [ ] Countdown timer
- [ ] Transaction details list
- [ ] Payment breakdown
- [ ] Total amount (prominent)

### Phase 4: Integration
- [ ] Update TopUp.tsx to use new component
- [ ] Pass payment data props
- [ ] Handle back navigation
- [ ] Handle refresh status
- [ ] Handle auto-polling

### Phase 5: Responsive
- [ ] Mobile layout (1-column)
- [ ] Tablet layout (2-column narrow)
- [ ] Desktop layout (2-column wide)
- [ ] Sidebar behavior

### Phase 6: Polish
- [ ] Add loading states
- [ ] Add error states
- [ ] Add success animation
- [ ] Add expired state
- [ ] Test all payment methods (QRIS, VA, E-Wallet)

---

## 🚀 Expected Result

**Full-page payment gateway** yang:
1. ✅ Fokus 100% pada payment (no distractions)
2. ✅ Sidebar tetap ada (navigation accessible)
3. ✅ Layout seperti gambar referensi (2-column)
4. ✅ QR Code prominent dan mudah di-scan
5. ✅ Transaction details lengkap dan jelas
6. ✅ Timer countdown visible
7. ✅ Responsive di semua device
8. ✅ Professional dan clean UI

---

## 📊 Comparison

| Aspect | Current UI | Target UI |
|--------|-----------|-----------|
| Layout | Vertical stack | 2-column grid |
| Focus | Mixed (form + payment) | 100% payment |
| QR Size | Medium (192px) | Large (320px) |
| Details | Scattered | Organized panel |
| Timer | Separate card | Integrated (top-right) |
| Scroll | Required | Not required |
| Professional | 6/10 | 9/10 |

---

## 🎯 Conclusion

Untuk mencapai UI seperti gambar referensi, perlu:

1. **Create new component** `TripayPaymentGateway.tsx` dengan full-page layout
2. **2-column grid** (QR Code left, Details right)
3. **Single container** dengan gradient background
4. **Prominent QR Code** (320px × 320px)
5. **Organized details panel** dengan merchant info, timer, transaction details, payment breakdown
6. **Back button** untuk kembali ke form
7. **Responsive** untuk mobile (1-column stack)

**Next Step:** Implement `TripayPaymentGateway.tsx` component sesuai analisis ini.

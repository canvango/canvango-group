# Design Document - Tripay Payment Gateway Integration

## Overview

Dokumen ini menjelaskan desain teknis untuk integrasi Tripay Payment Gateway ke dalam aplikasi. Integrasi ini akan menambahkan kemampuan pembayaran otomatis menggunakan berbagai channel pembayaran Indonesia (Virtual Account, E-Wallet, QRIS, Convenience Store) tanpa mengubah arsitektur aplikasi yang sudah ada.

### Tujuan

1. Menambahkan payment gateway otomatis untuk transaksi top-up dan pembelian produk
2. Mendukung Closed Payment (sekali pakai) dan Open Payment (reusable pay code)
3. Menerima notifikasi callback real-time dari Tripay untuk update status pembayaran
4. Menyediakan UI yang user-friendly untuk memilih metode pembayaran dan melihat instruksi
5. Memberikan admin tools untuk monitoring dan management transaksi

### Prinsip Desain

- **Frontend-only Architecture**: Tetap menggunakan Supabase sebagai backend, tidak ada server terpisah
- **Incremental Implementation**: Menambahkan fitur baru tanpa mengubah yang sudah ada
- **Security First**: Validasi signature untuk semua callback dari Tripay
- **User Experience**: Proses pembayaran yang smooth dengan instruksi yang jelas
- **Admin Control**: Dashboard untuk monitoring dan troubleshooting

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Payment UI   │  │ Transaction  │  │ Admin Panel  │          │
│  │ Components   │  │ History      │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                  │
│                            │                                     │
│                   ┌────────▼────────┐                           │
│                   │  React Query    │                           │
│                   │  Hooks Layer    │                           │
│                   └────────┬────────┘                           │
│                            │                                     │
│                   ┌────────▼────────┐                           │
│                   │  Service Layer  │                           │
│                   │  (tripay.service)│                          │
│                   └────────┬────────┘                           │
└────────────────────────────┼─────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼────────┐     │     ┌────────▼────────┐
     │  Vercel API     │     │     │   Supabase      │
     │  Routes         │     │     │   Database      │
     │  (Proxy)        │     │     │   + RLS         │
     └────────┬────────┘     │     └────────▲────────┘
              │              │              │
     ┌────────▼────────┐     │              │
     │  GCP Proxy      │     │              │
     │  (Optional)     │     │              │
     └────────┬────────┘     │              │
              │              │              │
     ┌────────▼──────────────▼──────────────┘
     │      Tripay API                      
     │  (Payment Gateway)                   
     └──────────────┬───────────────────────
                    │
                    │ Callback
                    │
     ┌──────────────▼───────────────────────┐
     │  Supabase Edge Function              │
     │  /functions/v1/tripay-callback       │
     └──────────────────────────────────────┘
```


### Data Flow

#### 1. Payment Creation Flow (Closed Payment)

```
User → Select Payment Method → Enter Amount
  ↓
Frontend calculates fee and shows total
  ↓
User confirms payment
  ↓
Frontend → Service Layer → Vercel API Route
  ↓
Vercel API validates user session
  ↓
Vercel API → GCP Proxy (optional) → Tripay API
  ↓
Tripay returns payment details (reference, pay_code, checkout_url)
  ↓
Vercel API saves transaction to Supabase (status: pending)
  ↓
Frontend receives response and shows payment instructions
  ↓
User completes payment at bank/e-wallet
  ↓
Tripay sends callback to Supabase Edge Function
  ↓
Edge Function validates signature and updates transaction (status: paid)
  ↓
Edge Function updates user balance
  ↓
Frontend polls status or receives real-time update
```

#### 2. Payment Creation Flow (Open Payment)

```
User → Select Payment Method → Request Permanent Pay Code
  ↓
Frontend → Service Layer → Vercel API Route
  ↓
Vercel API → Tripay API /open-payment/create
  ↓
Tripay returns UUID, pay_code (permanent, reusable)
  ↓
Vercel API saves open_payment to Supabase
  ↓
Frontend shows permanent pay_code to user
  ↓
User can use pay_code multiple times with different amounts
  ↓
Each payment triggers callback → creates new transaction record
```

#### 3. Callback Processing Flow

```
Tripay Payment Gateway
  ↓
POST /functions/v1/tripay-callback
  ↓
Edge Function receives callback data
  ↓
Validate X-Callback-Signature header
  ↓
Check idempotency (already processed?)
  ↓
Find transaction by merchant_ref or reference
  ↓
Start database transaction (atomic)
  ↓
Update transaction status
  ↓
If status = PAID:
  - Update user balance
  - Set completed_at timestamp
  - Create purchase record if product transaction
  ↓
Commit database transaction
  ↓
Log callback event to audit_logs
  ↓
Return 200 OK to Tripay
```

## Components and Interfaces

### 1. Database Schema

#### Existing Tables (Already Implemented)

**transactions** - Sudah memiliki semua kolom Tripay yang diperlukan:
- `tripay_reference` - Unique reference dari Tripay
- `tripay_merchant_ref` - Reference dari aplikasi kita
- `tripay_payment_method` - Kode metode pembayaran
- `tripay_payment_name` - Nama metode pembayaran
- `tripay_payment_url` - URL instruksi pembayaran
- `tripay_qr_url` - URL QR code
- `tripay_checkout_url` - URL checkout
- `tripay_amount` - Amount sebelum fee
- `tripay_fee` - Fee Tripay
- `tripay_total_amount` - Total termasuk fee
- `tripay_status` - Status dari Tripay (UNPAID, PAID, EXPIRED, FAILED)
- `tripay_paid_at` - Timestamp pembayaran
- `tripay_callback_data` - Raw callback data (JSONB)

**tripay_payment_channels** - Cache payment methods dari Tripay:
- `code` - Kode channel (BRIVA, QRIS, dll)
- `name` - Nama channel
- `group_name` - Grup (Virtual Account, E-Wallet, dll)
- `fee_merchant`, `fee_customer`, `total_fee` - Fee structure (JSONB)
- `minimum_fee`, `maximum_fee` - Batas fee
- `minimum_amount`, `maximum_amount` - Batas nominal
- `is_active` - Status dari Tripay API
- `is_enabled` - Status enable/disable oleh admin
- `display_order` - Urutan tampilan

#### New Tables (To Be Created)

**open_payments** - Tracking Open Payment codes:
```sql
CREATE TABLE open_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  uuid VARCHAR NOT NULL UNIQUE, -- UUID dari Tripay
  merchant_ref VARCHAR NOT NULL UNIQUE,
  payment_method VARCHAR NOT NULL,
  payment_name VARCHAR NOT NULL,
  customer_name VARCHAR,
  pay_code VARCHAR NOT NULL,
  qr_string TEXT,
  qr_url TEXT,
  status VARCHAR NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED
  expired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_open_payments_user_id ON open_payments(user_id);
CREATE INDEX idx_open_payments_uuid ON open_payments(uuid);
CREATE INDEX idx_open_payments_status ON open_payments(status);
```

**open_payment_transactions** - History pembayaran per Open Payment:
```sql
CREATE TABLE open_payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  open_payment_id UUID NOT NULL REFERENCES open_payments(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  reference VARCHAR NOT NULL, -- Tripay reference untuk pembayaran ini
  amount NUMERIC NOT NULL,
  fee_merchant NUMERIC DEFAULT 0,
  fee_customer NUMERIC DEFAULT 0,
  total_fee NUMERIC DEFAULT 0,
  amount_received NUMERIC NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'PAID',
  paid_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_open_payment_txn_open_payment_id ON open_payment_transactions(open_payment_id);
CREATE INDEX idx_open_payment_txn_reference ON open_payment_transactions(reference);
```


### 2. API Endpoints

#### Vercel API Routes (Frontend → Backend Proxy)

**POST /api/tripay-proxy** (Already Exists)
- Purpose: Create Closed Payment transaction
- Auth: Bearer token (Supabase session)
- Request Body:
  ```typescript
  {
    amount: number;
    paymentMethod: string; // channel code
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    orderItems: Array<{
      name: string;
      price: number;
      quantity: number;
    }>;
    returnUrl?: string;
    expiredTime?: number; // hours
  }
  ```
- Response: Tripay payment response
- Implementation: Forwards to GCP Proxy → Tripay API

**POST /api/tripay-channels** (To Be Created)
- Purpose: Fetch payment channels from Tripay
- Auth: None (public)
- Response: Array of payment channels
- Implementation: Forwards to GCP Proxy → Tripay API

**POST /api/tripay-open-payment** (To Be Created)
- Purpose: Create Open Payment
- Auth: Bearer token
- Request Body:
  ```typescript
  {
    paymentMethod: string;
    customerName?: string;
    expiredTime?: number; // unix timestamp
  }
  ```
- Response: Open Payment details (uuid, pay_code)

**GET /api/tripay-transaction-detail** (To Be Created)
- Purpose: Get transaction detail from Tripay API
- Auth: Bearer token
- Query: `?reference=T1234567890`
- Response: Full transaction details

**GET /api/tripay-transaction-status** (To Be Created)
- Purpose: Quick status check
- Auth: Bearer token
- Query: `?reference=T1234567890`
- Response: `{ status: "PAID" | "UNPAID" | "EXPIRED" | "FAILED" }`

#### Supabase Edge Function

**POST /functions/v1/tripay-callback** (To Be Created)
- Purpose: Receive payment callback from Tripay
- Auth: Signature validation (X-Callback-Signature header)
- Request Headers:
  - `X-Callback-Event`: "payment_status"
  - `X-Callback-Signature`: HMAC-SHA256 signature
- Request Body:
  ```typescript
  {
    merchant_ref: string;
    reference: string;
    status: "PAID" | "FAILED" | "REFUND";
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    callback_virtual_account_id?: string;
    external_id?: string;
    account_number?: string;
    payment_name: string;
    is_closed_payment: 0 | 1;
  }
  ```
- Response: `{ success: true }`
- Implementation:
  1. Validate signature
  2. Check idempotency
  3. Update transaction status
  4. Update user balance if PAID
  5. Log to audit_logs

### 3. Service Layer

#### tripay.service.ts (Existing - To Be Enhanced)

Current functions:
- `getPaymentMethods()` - Fetch from database
- `createPayment()` - Create Closed Payment
- `checkPaymentStatus()` - Check from database
- `calculateTotalAmount()` - Calculate fee
- `getPaymentMethodByCode()` - Get single method

New functions to add:
```typescript
// Open Payment
export async function createOpenPayment(params: {
  paymentMethod: string;
  customerName?: string;
  expiredTime?: number;
}): Promise<OpenPaymentResponse>;

export async function getOpenPaymentDetail(uuid: string): Promise<OpenPaymentDetail>;

export async function getOpenPaymentTransactions(
  uuid: string,
  filters?: {
    reference?: string;
    merchantRef?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    perPage?: number;
  }
): Promise<OpenPaymentTransactionList>;

// Transaction Detail
export async function getTransactionDetail(reference: string): Promise<TransactionDetail>;

export async function quickCheckStatus(reference: string): Promise<{ status: string }>;

// Signature Generation
export function generateClosedPaymentSignature(
  merchantCode: string,
  merchantRef: string,
  amount: number,
  privateKey: string
): string;

export function generateOpenPaymentSignature(
  merchantCode: string,
  channel: string,
  merchantRef: string,
  privateKey: string
): string;

export function validateCallbackSignature(
  payload: string,
  signature: string,
  privateKey: string
): boolean;
```

#### tripayChannels.service.ts (Existing - Already Complete)

Functions:
- `fetchPaymentChannelsFromTripay()` - Fetch from API
- `getPaymentChannelsFromDB()` - Get from database
- `syncPaymentChannels()` - Sync API → DB
- `updateChannelStatus()` - Enable/disable channel
- `updateChannelOrder()` - Change display order
- `getLastSyncTime()` - Get last sync timestamp

### 4. React Hooks

#### useTripay.ts (Existing - To Be Enhanced)

Current hooks:
- `usePaymentMethods()` - Get payment channels
- `useCreatePayment()` - Create Closed Payment
- `usePaymentStatus()` - Poll payment status

New hooks to add:
```typescript
// Open Payment
export function useCreateOpenPayment() {
  return useMutation({
    mutationFn: tripayService.createOpenPayment,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['open-payments']);
      notification.success('Kode pembayaran permanen berhasil dibuat');
    },
  });
}

export function useOpenPaymentDetail(uuid: string | null) {
  return useQuery({
    queryKey: ['open-payment', uuid],
    queryFn: () => tripayService.getOpenPaymentDetail(uuid!),
    enabled: !!uuid,
  });
}

export function useOpenPaymentTransactions(uuid: string | null, filters?: any) {
  return useQuery({
    queryKey: ['open-payment-transactions', uuid, filters],
    queryFn: () => tripayService.getOpenPaymentTransactions(uuid!, filters),
    enabled: !!uuid,
  });
}

// Transaction Detail
export function useTransactionDetail(reference: string | null) {
  return useQuery({
    queryKey: ['transaction-detail', reference],
    queryFn: () => tripayService.getTransactionDetail(reference!),
    enabled: !!reference,
  });
}

// Admin hooks
export function useAllTransactions(filters?: any) {
  return useQuery({
    queryKey: ['admin-transactions', filters],
    queryFn: () => tripayService.getAllTransactions(filters),
  });
}

export function useSyncTransactionStatus() {
  return useMutation({
    mutationFn: (reference: string) => 
      tripayService.syncTransactionStatus(reference),
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      notification.success('Status berhasil disinkronkan');
    },
  });
}
```


### 5. UI Components

#### Payment Components (To Be Created)

**PaymentMethodSelector**
- Purpose: Display available payment channels with fee calculation
- Props:
  ```typescript
  {
    amount: number;
    selectedMethod: string | null;
    onSelect: (method: string) => void;
  }
  ```
- Features:
  - Group channels by type (Virtual Account, E-Wallet, QRIS, etc)
  - Show fee breakdown for each channel
  - Show total amount including fee
  - Highlight selected method
  - Disable channels that don't meet min/max amount

**FeeCalculator**
- Purpose: Show fee breakdown before payment
- Props:
  ```typescript
  {
    amount: number;
    paymentMethod: TripayPaymentMethod;
  }
  ```
- Display:
  - Base amount
  - Flat fee
  - Percentage fee
  - Total fee
  - Final amount to pay

**PaymentInstructions**
- Purpose: Display step-by-step payment instructions
- Props:
  ```typescript
  {
    instructions: Array<{
      title: string;
      steps: string[];
    }>;
    payCode?: string;
    qrUrl?: string;
    checkoutUrl?: string;
  }
  ```
- Features:
  - Tabbed interface for different instruction types (ATM, Mobile Banking, etc)
  - Copy button for pay code
  - QR code display if available
  - Countdown timer for expiration
  - Auto-refresh status

**TransactionDetailModal**
- Purpose: Show full transaction details
- Props:
  ```typescript
  {
    reference: string;
    isOpen: boolean;
    onClose: () => void;
  }
  ```
- Features:
  - Transaction info (reference, amount, status, etc)
  - Payment instructions
  - Order items list
  - Status timeline
  - Refresh status button
  - Copy reference button

**OpenPaymentCard**
- Purpose: Display Open Payment details
- Props:
  ```typescript
  {
    openPayment: OpenPayment;
    onViewTransactions: () => void;
  }
  ```
- Features:
  - Permanent pay code display
  - QR code if available
  - Status badge (Active/Expired)
  - Expiration date
  - Total amount received
  - Transaction count
  - View history button

#### Admin Components (To Be Created)

**AdminTransactionTable**
- Purpose: Admin view of all transactions
- Features:
  - Filterable columns (status, payment method, user, date range)
  - Sortable columns
  - Pagination
  - Bulk actions
  - Export to CSV
  - Sync status button per row
  - View detail modal

**PaymentChannelManager**
- Purpose: Manage payment channels
- Features:
  - List all channels from Tripay
  - Enable/disable toggle per channel
  - Reorder channels (drag & drop)
  - Sync from Tripay button
  - Last sync timestamp
  - Fee information display

## Data Models

### TypeScript Interfaces

```typescript
// Payment Channel
export interface TripayPaymentChannel {
  id?: string;
  code: string;
  name: string;
  group_name?: string;
  type?: 'direct' | 'redirect';
  fee_merchant: {
    flat: number;
    percent: number;
  };
  fee_customer: {
    flat: number;
    percent: number;
  };
  total_fee: {
    flat: number;
    percent: number;
  };
  minimum_fee?: number;
  maximum_fee?: number;
  minimum_amount?: number;
  maximum_amount?: number;
  icon_url?: string;
  is_active: boolean;
  is_enabled: boolean;
  display_order: number;
}

// Closed Payment
export interface ClosedPaymentRequest {
  amount: number;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  orderItems: OrderItem[];
  returnUrl?: string;
  expiredTime?: number;
}

export interface ClosedPaymentResponse {
  success: boolean;
  message: string;
  data: {
    reference: string;
    merchant_ref: string;
    payment_method: string;
    payment_name: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    callback_url: string;
    return_url: string;
    amount: number;
    fee_merchant: number;
    fee_customer: number;
    total_fee: number;
    amount_received: number;
    pay_code: string;
    pay_url: string;
    checkout_url: string;
    qr_url?: string;
    qr_string?: string;
    status: 'UNPAID' | 'PAID' | 'EXPIRED' | 'FAILED';
    expired_time: number;
    order_items: OrderItem[];
    instructions: PaymentInstruction[];
  };
}

// Open Payment
export interface OpenPaymentRequest {
  paymentMethod: string;
  customerName?: string;
  expiredTime?: number;
}

export interface OpenPaymentResponse {
  success: boolean;
  message: string;
  data: {
    uuid: string;
    reference: string;
    merchant_ref: string;
    payment_method: string;
    payment_name: string;
    customer_name?: string;
    pay_code: string;
    qr_string?: string;
    qr_url?: string;
    status: 'UNPAID';
    expired_time: number;
    instructions: PaymentInstruction[];
  };
}

export interface OpenPayment {
  id: string;
  user_id: string;
  uuid: string;
  merchant_ref: string;
  payment_method: string;
  payment_name: string;
  customer_name?: string;
  pay_code: string;
  qr_string?: string;
  qr_url?: string;
  status: 'ACTIVE' | 'EXPIRED';
  expired_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OpenPaymentTransaction {
  id: string;
  open_payment_id: string;
  transaction_id?: string;
  reference: string;
  amount: number;
  fee_merchant: number;
  fee_customer: number;
  total_fee: number;
  amount_received: number;
  status: string;
  paid_at: string;
  created_at: string;
}

// Transaction
export interface Transaction {
  id: string;
  user_id: string;
  transaction_type: 'topup' | 'purchase' | 'refund' | 'warranty_claim';
  product_id?: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payment_method?: string;
  tripay_reference?: string;
  tripay_merchant_ref?: string;
  tripay_payment_method?: string;
  tripay_payment_name?: string;
  tripay_payment_url?: string;
  tripay_qr_url?: string;
  tripay_checkout_url?: string;
  tripay_amount?: number;
  tripay_fee?: number;
  tripay_total_amount?: number;
  tripay_status?: 'UNPAID' | 'PAID' | 'EXPIRED' | 'FAILED' | 'REFUND';
  tripay_paid_at?: string;
  tripay_callback_data?: any;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// Supporting Types
export interface OrderItem {
  sku?: string;
  name: string;
  price: number;
  quantity: number;
  subtotal?: number;
  product_url?: string;
  image_url?: string;
}

export interface PaymentInstruction {
  title: string;
  steps: string[];
}

// Callback
export interface TripayCallback {
  merchant_ref: string;
  reference: string;
  status: 'PAID' | 'FAILED' | 'REFUND';
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  callback_virtual_account_id?: string;
  external_id?: string;
  account_number?: string;
  payment_name: string;
  is_closed_payment: 0 | 1;
}
```


## Error Handling

### Error Types

```typescript
export enum TripayErrorCode {
  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',
  
  // Authentication Errors
  INVALID_API_KEY = 'INVALID_API_KEY',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  UNAUTHORIZED = 'UNAUTHORIZED',
  
  // Validation Errors
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_PAYMENT_METHOD = 'INVALID_PAYMENT_METHOD',
  AMOUNT_TOO_LOW = 'AMOUNT_TOO_LOW',
  AMOUNT_TOO_HIGH = 'AMOUNT_TOO_HIGH',
  
  // Transaction Errors
  TRANSACTION_NOT_FOUND = 'TRANSACTION_NOT_FOUND',
  TRANSACTION_EXPIRED = 'TRANSACTION_EXPIRED',
  DUPLICATE_MERCHANT_REF = 'DUPLICATE_MERCHANT_REF',
  
  // Callback Errors
  INVALID_CALLBACK_SIGNATURE = 'INVALID_CALLBACK_SIGNATURE',
  CALLBACK_ALREADY_PROCESSED = 'CALLBACK_ALREADY_PROCESSED',
  
  // Database Errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  
  // General Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class TripayError extends Error {
  constructor(
    public code: TripayErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'TripayError';
  }
}
```

### Error Handling Strategy

#### Frontend Error Handling

```typescript
// In service layer
try {
  const response = await axios.post('/api/tripay-proxy', data);
  return response.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    const errorData = error.response?.data;
    
    // Map API errors to user-friendly messages
    const userMessage = mapErrorToUserMessage(errorData?.code);
    throw new TripayError(
      errorData?.code || TripayErrorCode.UNKNOWN_ERROR,
      userMessage,
      errorData
    );
  }
  throw error;
}

// In React components
const { mutate, isError, error } = useCreatePayment();

if (isError && error instanceof TripayError) {
  // Show user-friendly error message
  notification.error(error.message);
  
  // Log technical details for debugging
  console.error('Payment error:', {
    code: error.code,
    details: error.details,
  });
}
```

#### Backend Error Handling (Vercel API Routes)

```typescript
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Validate request
    if (!req.body.amount || req.body.amount <= 0) {
      return res.status(400).json({
        success: false,
        code: TripayErrorCode.INVALID_AMOUNT,
        message: 'Nominal pembayaran tidak valid',
      });
    }
    
    // Process payment
    const result = await createPayment(req.body);
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('Payment creation error:', error);
    
    // Map errors to appropriate HTTP status codes
    if (error instanceof TripayError) {
      const statusCode = mapErrorToStatusCode(error.code);
      return res.status(statusCode).json({
        success: false,
        code: error.code,
        message: error.message,
        details: error.details,
      });
    }
    
    // Unknown errors
    return res.status(500).json({
      success: false,
      code: TripayErrorCode.UNKNOWN_ERROR,
      message: 'Terjadi kesalahan sistem',
    });
  }
}
```

#### Callback Error Handling (Edge Function)

```typescript
// In Supabase Edge Function
try {
  // Validate signature
  const isValid = validateSignature(payload, signature, privateKey);
  if (!isValid) {
    console.error('Invalid callback signature', { payload, signature });
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid signature' }),
      { status: 403 }
    );
  }
  
  // Check idempotency
  const alreadyProcessed = await checkIfProcessed(merchantRef);
  if (alreadyProcessed) {
    console.warn('Callback already processed', { merchantRef });
    return new Response(
      JSON.stringify({ success: true, message: 'Already processed' }),
      { status: 200 }
    );
  }
  
  // Process callback
  await processCallback(callbackData);
  
  return new Response(
    JSON.stringify({ success: true }),
    { status: 200 }
  );
  
} catch (error) {
  console.error('Callback processing error:', error);
  
  // Log to audit trail
  await logCallbackError(callbackData, error);
  
  return new Response(
    JSON.stringify({ success: false, message: 'Internal error' }),
    { status: 500 }
  );
}
```

### Error Messages Mapping

```typescript
const ERROR_MESSAGES: Record<TripayErrorCode, string> = {
  [TripayErrorCode.NETWORK_ERROR]: 'Tidak dapat terhubung ke server pembayaran',
  [TripayErrorCode.TIMEOUT]: 'Koneksi timeout, silakan coba lagi',
  [TripayErrorCode.INVALID_API_KEY]: 'Konfigurasi pembayaran tidak valid',
  [TripayErrorCode.INVALID_AMOUNT]: 'Nominal pembayaran tidak valid',
  [TripayErrorCode.AMOUNT_TOO_LOW]: 'Nominal terlalu kecil untuk metode pembayaran ini',
  [TripayErrorCode.AMOUNT_TOO_HIGH]: 'Nominal melebihi batas maksimal',
  [TripayErrorCode.INVALID_PAYMENT_METHOD]: 'Metode pembayaran tidak tersedia',
  [TripayErrorCode.TRANSACTION_NOT_FOUND]: 'Transaksi tidak ditemukan',
  [TripayErrorCode.TRANSACTION_EXPIRED]: 'Transaksi sudah kadaluarsa',
  [TripayErrorCode.DATABASE_ERROR]: 'Terjadi kesalahan database',
  [TripayErrorCode.UNKNOWN_ERROR]: 'Terjadi kesalahan, silakan coba lagi',
};
```

### Retry Strategy

```typescript
// Exponential backoff for API calls
async function callTripayAPIWithRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on validation errors
      if (error instanceof TripayError && 
          [TripayErrorCode.INVALID_AMOUNT, 
           TripayErrorCode.INVALID_PAYMENT_METHOD].includes(error.code)) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}
```

## Testing Strategy

### Unit Tests

#### Service Layer Tests

```typescript
describe('tripay.service', () => {
  describe('generateClosedPaymentSignature', () => {
    it('should generate correct HMAC-SHA256 signature', () => {
      const signature = generateClosedPaymentSignature(
        'T12345',
        'INV-001',
        100000,
        'secret-key'
      );
      expect(signature).toBe('expected-hash');
    });
  });
  
  describe('calculateTotalAmount', () => {
    it('should calculate total with flat and percentage fee', () => {
      const method = {
        fee_merchant: { flat: 4000, percent: 1.5 },
        minimum_fee: 0,
        maximum_fee: 0,
      };
      const total = calculateTotalAmount(100000, method);
      expect(total).toBe(105500); // 100000 + 4000 + 1500
    });
    
    it('should apply minimum fee if calculated fee is lower', () => {
      const method = {
        fee_merchant: { flat: 100, percent: 0 },
        minimum_fee: 1000,
        maximum_fee: 0,
      };
      const total = calculateTotalAmount(10000, method);
      expect(total).toBe(11000); // 10000 + 1000 (minimum)
    });
  });
  
  describe('validateCallbackSignature', () => {
    it('should return true for valid signature', () => {
      const payload = JSON.stringify({ merchant_ref: 'INV-001' });
      const signature = crypto
        .createHmac('sha256', 'secret-key')
        .update(payload)
        .digest('hex');
      
      const isValid = validateCallbackSignature(payload, signature, 'secret-key');
      expect(isValid).toBe(true);
    });
    
    it('should return false for invalid signature', () => {
      const payload = JSON.stringify({ merchant_ref: 'INV-001' });
      const isValid = validateCallbackSignature(payload, 'invalid-sig', 'secret-key');
      expect(isValid).toBe(false);
    });
  });
});
```

#### Component Tests

```typescript
describe('PaymentMethodSelector', () => {
  it('should display all enabled payment methods', () => {
    const methods = [
      { code: 'BRIVA', name: 'BRI Virtual Account', is_enabled: true },
      { code: 'QRIS', name: 'QRIS', is_enabled: true },
    ];
    
    render(<PaymentMethodSelector methods={methods} amount={100000} />);
    
    expect(screen.getByText('BRI Virtual Account')).toBeInTheDocument();
    expect(screen.getByText('QRIS')).toBeInTheDocument();
  });
  
  it('should calculate and display fee for each method', () => {
    const methods = [
      {
        code: 'BRIVA',
        name: 'BRI VA',
        fee_merchant: { flat: 4000, percent: 0 },
      },
    ];
    
    render(<PaymentMethodSelector methods={methods} amount={100000} />);
    
    expect(screen.getByText(/Rp 4\.000/)).toBeInTheDocument();
    expect(screen.getByText(/Total: Rp 104\.000/)).toBeInTheDocument();
  });
});
```


### Integration Tests

```typescript
describe('Payment Flow Integration', () => {
  it('should complete full payment creation flow', async () => {
    // 1. Get payment methods
    const methods = await getPaymentMethods();
    expect(methods.length).toBeGreaterThan(0);
    
    // 2. Select method and calculate fee
    const selectedMethod = methods[0];
    const total = calculateTotalAmount(100000, selectedMethod);
    expect(total).toBeGreaterThan(100000);
    
    // 3. Create payment
    const payment = await createPayment({
      amount: 100000,
      paymentMethod: selectedMethod.code,
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      orderItems: [{ name: 'Top Up', price: 100000, quantity: 1 }],
    });
    
    expect(payment.success).toBe(true);
    expect(payment.data.reference).toBeDefined();
    expect(payment.data.pay_code).toBeDefined();
    
    // 4. Check transaction saved to database
    const { data: transaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('tripay_reference', payment.data.reference)
      .single();
    
    expect(transaction).toBeDefined();
    expect(transaction.status).toBe('pending');
  });
});

describe('Callback Processing Integration', () => {
  it('should process PAID callback and update balance', async () => {
    // Setup: Create a pending transaction
    const { data: transaction } = await supabase
      .from('transactions')
      .insert({
        user_id: testUserId,
        transaction_type: 'topup',
        amount: 100000,
        status: 'pending',
        tripay_merchant_ref: 'TEST-001',
        tripay_reference: 'T123456789',
      })
      .select()
      .single();
    
    // Get user's initial balance
    const { data: userBefore } = await supabase
      .from('users')
      .select('balance')
      .eq('id', testUserId)
      .single();
    
    // Simulate callback
    const callbackPayload = {
      merchant_ref: 'TEST-001',
      reference: 'T123456789',
      status: 'PAID',
      customer_name: 'Test User',
      customer_email: 'test@example.com',
      customer_phone: '081234567890',
      payment_name: 'BRI Virtual Account',
      is_closed_payment: 1,
    };
    
    const signature = generateCallbackSignature(callbackPayload, privateKey);
    
    const response = await fetch('/functions/v1/tripay-callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Callback-Event': 'payment_status',
        'X-Callback-Signature': signature,
      },
      body: JSON.stringify(callbackPayload),
    });
    
    expect(response.status).toBe(200);
    
    // Verify transaction updated
    const { data: transactionAfter } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transaction.id)
      .single();
    
    expect(transactionAfter.status).toBe('completed');
    expect(transactionAfter.tripay_status).toBe('PAID');
    expect(transactionAfter.completed_at).toBeDefined();
    
    // Verify balance updated
    const { data: userAfter } = await supabase
      .from('users')
      .select('balance')
      .eq('id', testUserId)
      .single();
    
    expect(userAfter.balance).toBe(userBefore.balance + 100000);
  });
  
  it('should reject callback with invalid signature', async () => {
    const callbackPayload = {
      merchant_ref: 'TEST-001',
      reference: 'T123456789',
      status: 'PAID',
    };
    
    const response = await fetch('/functions/v1/tripay-callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Callback-Event': 'payment_status',
        'X-Callback-Signature': 'invalid-signature',
      },
      body: JSON.stringify(callbackPayload),
    });
    
    expect(response.status).toBe(403);
  });
  
  it('should handle idempotent callbacks', async () => {
    // First callback
    const callbackPayload = { /* ... */ };
    const signature = generateCallbackSignature(callbackPayload, privateKey);
    
    const response1 = await fetch('/functions/v1/tripay-callback', {
      method: 'POST',
      headers: {
        'X-Callback-Signature': signature,
      },
      body: JSON.stringify(callbackPayload),
    });
    expect(response1.status).toBe(200);
    
    // Second callback (duplicate)
    const response2 = await fetch('/functions/v1/tripay-callback', {
      method: 'POST',
      headers: {
        'X-Callback-Signature': signature,
      },
      body: JSON.stringify(callbackPayload),
    });
    expect(response2.status).toBe(200);
    
    // Verify balance only updated once
    const { data: user } = await supabase
      .from('users')
      .select('balance')
      .eq('id', testUserId)
      .single();
    
    expect(user.balance).toBe(initialBalance + 100000); // Not doubled
  });
});
```

### Manual Testing Checklist

#### Payment Creation
- [ ] Select payment method and see fee calculation
- [ ] Create payment with valid data
- [ ] Receive payment instructions
- [ ] See QR code for QRIS payments
- [ ] Copy pay code successfully
- [ ] Countdown timer shows correct expiration
- [ ] Redirect to checkout URL for redirect channels

#### Payment Status
- [ ] Status updates automatically when payment completed
- [ ] Manual refresh status button works
- [ ] Expired transactions show correct status
- [ ] Failed transactions show error message

#### Open Payment
- [ ] Create permanent pay code
- [ ] View pay code and QR code
- [ ] Make multiple payments with same code
- [ ] View transaction history per pay code
- [ ] Expired pay codes show correct status

#### Callback Processing
- [ ] Callback updates transaction status
- [ ] Balance updated correctly for PAID status
- [ ] Duplicate callbacks don't double-update balance
- [ ] Invalid signature rejected
- [ ] Callback logged to audit trail

#### Admin Features
- [ ] View all transactions from all users
- [ ] Filter by status, payment method, date
- [ ] Sync status from Tripay API
- [ ] View transaction details
- [ ] Enable/disable payment channels
- [ ] Reorder payment channels

#### Error Handling
- [ ] Network error shows user-friendly message
- [ ] Invalid amount shows validation error
- [ ] Expired transaction shows appropriate message
- [ ] API timeout handled gracefully
- [ ] Database errors logged properly

## Security Considerations

### 1. Signature Validation

**Callback Signature Validation**
```typescript
// CRITICAL: Always validate callback signature
function validateCallbackSignature(
  payload: string,
  signature: string,
  privateKey: string
): boolean {
  const calculatedSignature = crypto
    .createHmac('sha256', privateKey)
    .update(payload)
    .digest('hex');
  
  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );
}
```

**Request Signature Generation**
```typescript
// For Closed Payment
function generateClosedPaymentSignature(
  merchantCode: string,
  merchantRef: string,
  amount: number,
  privateKey: string
): string {
  const data = merchantCode + merchantRef + amount;
  return crypto
    .createHmac('sha256', privateKey)
    .update(data)
    .digest('hex');
}

// For Open Payment
function generateOpenPaymentSignature(
  merchantCode: string,
  channel: string,
  merchantRef: string,
  privateKey: string
): string {
  const data = merchantCode + channel + merchantRef;
  return crypto
    .createHmac('sha256', privateKey)
    .update(data)
    .digest('hex');
}
```

### 2. Environment Variables Security

```typescript
// NEVER expose these in frontend
const TRIPAY_API_KEY = process.env.TRIPAY_API_KEY; // Server-side only
const TRIPAY_PRIVATE_KEY = process.env.TRIPAY_PRIVATE_KEY; // Server-side only
const TRIPAY_MERCHANT_CODE = process.env.TRIPAY_MERCHANT_CODE; // Server-side only

// Frontend can access mode
const TRIPAY_MODE = import.meta.env.VITE_TRIPAY_MODE; // 'sandbox' or 'production'
```

### 3. Database Security (RLS Policies)

```sql
-- Transactions: Users can only view/create their own
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view/update all transactions
CREATE POLICY "Admins can view all transactions"
  ON transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Callback handler needs service role access
-- Edge Function uses service role key to bypass RLS
```

### 4. Idempotency

```typescript
// Prevent duplicate callback processing
async function checkIfCallbackProcessed(merchantRef: string): Promise<boolean> {
  const { data } = await supabase
    .from('transactions')
    .select('tripay_callback_data')
    .eq('tripay_merchant_ref', merchantRef)
    .single();
  
  // Check if callback already processed
  return data?.tripay_callback_data?.processed === true;
}

async function markCallbackAsProcessed(merchantRef: string): Promise<void> {
  await supabase
    .from('transactions')
    .update({
      tripay_callback_data: { processed: true, processed_at: new Date().toISOString() }
    })
    .eq('tripay_merchant_ref', merchantRef);
}
```

### 5. Rate Limiting

```typescript
// Implement rate limiting for API routes
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
});

// Apply to payment creation endpoint
app.use('/api/tripay-proxy', limiter);
```

### 6. Input Validation

```typescript
// Validate all inputs before processing
function validatePaymentRequest(data: any): void {
  if (!data.amount || data.amount <= 0) {
    throw new TripayError(
      TripayErrorCode.INVALID_AMOUNT,
      'Amount must be greater than 0'
    );
  }
  
  if (!data.paymentMethod || typeof data.paymentMethod !== 'string') {
    throw new TripayError(
      TripayErrorCode.INVALID_PAYMENT_METHOD,
      'Invalid payment method'
    );
  }
  
  if (!data.customerEmail || !isValidEmail(data.customerEmail)) {
    throw new TripayError(
      TripayErrorCode.INVALID_INPUT,
      'Invalid email address'
    );
  }
  
  // Sanitize inputs
  data.customerName = sanitizeString(data.customerName);
  data.customerEmail = sanitizeEmail(data.customerEmail);
}
```

## Performance Optimization

### 1. Caching Strategy

```typescript
// Cache payment channels in database
// Sync from Tripay API periodically (e.g., daily)
// Frontend fetches from database, not API

// React Query caching
export function usePaymentMethods() {
  return useQuery({
    queryKey: ['tripay', 'payment-methods'],
    queryFn: getPaymentMethods,
    staleTime: 1000 * 60 * 60, // 1 hour
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
```

### 2. Database Indexing

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_transactions_tripay_reference 
  ON transactions(tripay_reference);

CREATE INDEX idx_transactions_tripay_merchant_ref 
  ON transactions(tripay_merchant_ref);

CREATE INDEX idx_transactions_user_status 
  ON transactions(user_id, status);

CREATE INDEX idx_transactions_created_at 
  ON transactions(created_at DESC);

CREATE INDEX idx_open_payments_uuid 
  ON open_payments(uuid);

CREATE INDEX idx_open_payments_user_status 
  ON open_payments(user_id, status);
```

### 3. Pagination

```typescript
// Implement cursor-based pagination for large datasets
export async function getTransactions(
  userId: string,
  cursor?: string,
  limit = 25
) {
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (cursor) {
    query = query.lt('created_at', cursor);
  }
  
  const { data, error } = await query;
  
  return {
    data,
    nextCursor: data && data.length === limit 
      ? data[data.length - 1].created_at 
      : null,
  };
}
```

### 4. Lazy Loading

```typescript
// Load payment instructions only when needed
const PaymentInstructions = lazy(() => 
  import('./components/PaymentInstructions')
);

// Load admin components only for admins
const AdminTransactionTable = lazy(() => 
  import('./components/admin/AdminTransactionTable')
);
```

## Deployment Considerations

### Environment Variables

```bash
# Production (.env.production)
VITE_TRIPAY_MODE=production
TRIPAY_API_KEY=your_production_api_key
TRIPAY_PRIVATE_KEY=your_production_private_key
TRIPAY_MERCHANT_CODE=your_merchant_code
GCP_PROXY_URL=https://your-gcp-proxy.com

# Sandbox (.env.development)
VITE_TRIPAY_MODE=sandbox
TRIPAY_API_KEY=your_sandbox_api_key
TRIPAY_PRIVATE_KEY=your_sandbox_private_key
TRIPAY_MERCHANT_CODE=your_sandbox_merchant_code
GCP_PROXY_URL=http://localhost:3000
```

### Database Migrations

```sql
-- Run migrations in order
-- 1. Create open_payments table
-- 2. Create open_payment_transactions table
-- 3. Add indexes
-- 4. Update RLS policies
```

### Monitoring

```typescript
// Log important events
console.log('[TRIPAY] Payment created:', {
  reference: payment.reference,
  amount: payment.amount,
  method: payment.payment_method,
});

console.log('[TRIPAY] Callback received:', {
  merchant_ref: callback.merchant_ref,
  status: callback.status,
});

// Track metrics
// - Payment success rate
// - Average payment time
// - Failed payment reasons
// - Callback processing time
```

### Rollback Plan

1. Keep old payment flow functional during migration
2. Feature flag for new Tripay integration
3. Database migrations are reversible
4. Monitor error rates after deployment
5. Quick rollback if issues detected


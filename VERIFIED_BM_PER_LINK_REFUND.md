# Verified BM Per-Link Refund System

## Overview

Sistem refund per-link untuk Verified BM service yang memungkinkan admin untuk:
- Memproses setiap URL secara individual
- Refund per-link jika ada yang gagal
- Tracking status detail untuk setiap URL
- Auto-update status request berdasarkan status URL

## Database Changes

### New Table: `verified_bm_urls`

Tabel baru untuk tracking individual URLs dalam setiap request:

```sql
CREATE TABLE verified_bm_urls (
  id UUID PRIMARY KEY,
  request_id UUID REFERENCES verified_bm_requests(id),
  url TEXT NOT NULL,
  url_index INTEGER NOT NULL,
  status VARCHAR(50) CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  admin_notes TEXT,
  refund_amount NUMERIC(10,2),
  refunded_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### New Functions

#### 1. `create_verified_bm_url_records()`
- **Trigger**: Auto-runs when new request is created
- **Purpose**: Membuat record untuk setiap URL dalam array
- **Result**: Setiap URL punya tracking record sendiri

#### 2. `refund_verified_bm_url(p_url_id, p_admin_notes)`
- **Purpose**: Refund satu URL spesifik
- **Process**:
  1. Validasi URL belum di-refund
  2. Hitung refund amount (total / quantity)
  3. Update status URL ke 'refunded'
  4. Kembalikan balance ke user
  5. Buat transaction record
  6. Auto-update parent request status

#### 3. `update_verified_bm_url_status(p_url_id, p_status, p_admin_notes)`
- **Purpose**: Update status individual URL
- **Statuses**: pending → processing → completed/failed
- **Auto-updates**: Parent request status

#### 4. `update_verified_bm_request_status(p_request_id)`
- **Purpose**: Auto-update request status based on URL statuses
- **Logic**:
  - All completed → request completed
  - All refunded → request failed
  - Mix completed/refunded → request completed (partial)
  - Any processing → request processing
  - All pending → request pending

## Frontend Changes

### 1. New Component: `URLStatusList`

**Location**: `src/features/member-area/components/verified-bm/URLStatusList.tsx`

**Features**:
- Display all URLs with individual status
- Status badges (pending, processing, completed, failed, refunded)
- Admin actions per URL (Process, Complete, Fail, Refund)
- Show refund amount and timestamp
- Show admin notes per URL

**Props**:
```typescript
interface URLStatusListProps {
  urls: VerifiedBMURL[];
  pricePerUrl: number;
  isAdmin?: boolean;
  onUpdateStatus?: (urlId: string, status) => void;
  onRefund?: (urlId: string) => void;
}
```

### 2. Updated Admin Panel

**Location**: `src/features/member-area/pages/admin/VerifiedBMManagement.tsx`

**New Features**:
- Expandable rows showing URL details
- Per-URL status management
- Per-URL refund with notes
- Real-time status updates
- Refund confirmation modal

**Admin Actions**:
1. **Pending URL**: Button "Proses" → status jadi processing
2. **Processing URL**: 
   - Button "Selesai" → status jadi completed
   - Button "Gagal" → status jadi failed
3. **Failed/Completed URL**: Button "Refund" → refund balance

### 3. Updated Member Page

**Location**: `src/features/member-area/components/verified-bm/VerifiedBMOrdersTable.tsx`

**New Features**:
- Display URL details with status
- Show refund information per URL
- Color-coded status badges
- Admin notes per URL visible to member

### 4. Updated Types

**Location**: `src/features/member-area/types/verified-bm.ts`

**New Types**:
```typescript
export type VerifiedBMURLStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export interface VerifiedBMURL {
  id: string;
  request_id: string;
  url: string;
  url_index: number;
  status: VerifiedBMURLStatus;
  admin_notes: string | null;
  refund_amount: number | null;
  refunded_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VerifiedBMRequest {
  // ... existing fields
  url_details?: VerifiedBMURL[]; // New field
}
```

### 5. Updated Services

**Location**: `src/features/member-area/services/admin-verified-bm.service.ts`

**New Functions**:
```typescript
// Update individual URL status
export const updateURLStatus = async (
  urlId: string,
  status: 'processing' | 'completed' | 'failed',
  adminNotes?: string
): Promise<any>

// Refund individual URL
export const refundURL = async (
  urlId: string,
  adminNotes: string
): Promise<any>

// Get request details with URL tracking
export const getRequestDetails = async (
  requestId: string
): Promise<VerifiedBMRequestWithUser> // Now includes url_details
```

**Location**: `src/features/member-area/services/verified-bm.service.ts`

**Updated**:
```typescript
// Now fetches URL details for each request
export const fetchVerifiedBMRequests = async (): Promise<VerifiedBMRequest[]>
```

### 6. Updated Hooks

**Location**: `src/hooks/useAdminVerifiedBM.ts`

**New Hooks**:
```typescript
// Update individual URL status
export const useUpdateURLStatus = () => useMutation(...)

// Refund individual URL
export const useRefundURL = () => useMutation(...)
```

## User Flow

### Admin Workflow

1. **View Request**
   - Admin melihat list requests di tab Pending
   - Click expand untuk lihat detail URLs

2. **Process URLs**
   - Setiap URL punya tombol action sendiri
   - Admin bisa proses URL satu per satu
   - Status: Pending → Processing → Completed/Failed

3. **Handle Failures**
   - Jika URL gagal, admin bisa refund URL tersebut
   - Masukkan admin notes (required)
   - System auto-refund balance ke user
   - URL status jadi 'refunded'

4. **Auto Status Update**
   - Request status auto-update based on URL statuses
   - Jika semua URL completed → request completed
   - Jika ada mix completed/refunded → request completed (partial)

### Member View

1. **View Request History**
   - Member lihat list requests mereka
   - Click expand untuk detail

2. **See URL Status**
   - Setiap URL ditampilkan dengan status badge
   - Warna berbeda untuk setiap status
   - Lihat admin notes jika ada

3. **Track Refunds**
   - Jika ada URL di-refund, member bisa lihat:
     - Refund amount
     - Refund timestamp
     - Admin notes (alasan refund)

## Example Scenario

### Scenario: 5 Akun, 1 Gagal

**Initial State**:
- Member order 5 akun verified BM
- Total: Rp 1,000,000 (Rp 200,000 per akun)
- Balance deducted: Rp 1,000,000

**Admin Processing**:
1. URL #1: Pending → Processing → Completed ✅
2. URL #2: Pending → Processing → Completed ✅
3. URL #3: Pending → Processing → Failed ❌
4. URL #4: Pending → Processing → Completed ✅
5. URL #5: Pending → Processing → Completed ✅

**Admin Refund URL #3**:
- Click "Refund" pada URL #3
- Input admin notes: "Akun tidak bisa diverifikasi karena limit tercapai"
- Confirm refund
- System refund Rp 200,000 ke user balance
- URL #3 status: refunded

**Final State**:
- Request status: completed (4 completed, 1 refunded)
- User balance: +Rp 200,000 (refund)
- Transaction created: type 'refund', amount Rp 200,000

## Benefits

1. **Granular Control**: Admin bisa manage setiap URL independently
2. **Fair Refunds**: Refund hanya untuk URL yang gagal, bukan full request
3. **Transparency**: Member bisa lihat status detail setiap URL
4. **Audit Trail**: Semua refund tercatat dengan notes dan timestamp
5. **Auto Status**: Request status auto-update, no manual intervention needed
6. **Balance Accuracy**: Refund langsung ke balance, no manual adjustment

## Migration Notes

- Existing requests akan auto-create URL records via migration
- Backward compatible: requests tanpa url_details tetap bisa ditampilkan
- RLS policies ensure security: members hanya lihat URL mereka sendiri

## Testing Checklist

- [ ] Create new request → URL records auto-created
- [ ] Admin update URL status → parent request status updated
- [ ] Admin refund URL → balance returned, transaction created
- [ ] Member view → URL details displayed with status
- [ ] Multiple refunds → balance correctly accumulated
- [ ] All URLs completed → request status = completed
- [ ] All URLs refunded → request status = failed
- [ ] Mix completed/refunded → request status = completed

## Security

- RLS policies on `verified_bm_urls` table
- Members can only view their own URLs
- Only admins can update/refund URLs
- Refund function uses SECURITY DEFINER
- Validation prevents double refunds

## Performance

- Indexed on `request_id` and `status` for fast queries
- Batch fetch URL details for multiple requests
- Efficient grouping using Map in frontend
- Minimal re-renders with React Query caching

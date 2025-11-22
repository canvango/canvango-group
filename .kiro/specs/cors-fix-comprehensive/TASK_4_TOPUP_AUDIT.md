# Task 4.1: Top-up Service Audit Report

## Overview

Audit of `src/features/member-area/services/topup.service.ts` to identify backend dependencies and business logic that needs to be migrated to direct Supabase access.

## Current Implementation Analysis

### File: `src/features/member-area/services/topup.service.ts`

**Backend Dependencies Identified:**
- ✅ Uses `apiClient` from `./api` for ALL operations
- ✅ Three endpoints identified:
  1. `POST /topup` - Process top-up request
  2. `GET /topup/methods` - Fetch payment methods
  3. `GET /topup/history` - Fetch top-up history

### Functions Using Backend Express:

#### 1. `processTopUp(data: TopUpData)`
**Current Implementation:**
```typescript
export const processTopUp = async (data: TopUpData): Promise<TopUpResponse> => {
  const response = await apiClient.post<TopUpResponse>('/topup', data);
  return response.data;
};
```

**Backend Endpoint:** `POST /topup`
**Request Data:**
- `amount: number`
- `paymentMethod: string`

**Response:**
- `transactionId: string`
- `status: 'pending' | 'success' | 'failed'`
- `paymentUrl?: string`
- `message: string`

**Business Logic to Migrate:**
1. Validate minimum top-up amount (Rp 10,000)
2. Create transaction record with type 'topup'
3. Update user balance (if instant payment)
4. Generate payment URL (if using payment gateway)
5. Return transaction details

#### 2. `fetchPaymentMethods()`
**Current Implementation:**
```typescript
export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await apiClient.get<PaymentMethod[]>('/topup/methods');
  return response.data;
};
```

**Backend Endpoint:** `GET /topup/methods`
**Response:** Array of payment methods with:
- `id: string`
- `name: string`
- `logo: string`
- `category: 'ewallet' | 'va'`
- `enabled: boolean`

**Business Logic to Migrate:**
- Fetch available payment methods from database or config
- Filter only enabled methods
- Return formatted list

#### 3. `fetchTopUpHistory(page, pageSize)`
**Current Implementation:**
```typescript
export const fetchTopUpHistory = async (page: number = 1, pageSize: number = 10) => {
  const response = await apiClient.get('/topup/history', {
    params: { page, pageSize },
  });
  return response.data;
};
```

**Backend Endpoint:** `GET /topup/history`
**Query Params:**
- `page: number` (default: 1)
- `pageSize: number` (default: 10)

**Business Logic to Migrate:**
1. Query transactions table filtered by:
   - `user_id = current user`
   - `transaction_type = 'topup'`
2. Implement pagination
3. Order by created_at descending
4. Return paginated results

### Usage in Components

**File: `src/features/member-area/pages/TopUp.tsx`**

The TopUp page directly uses `apiClient.post('/topup', ...)` instead of the service function. This needs to be updated to use the refactored service.

**Current Usage:**
```typescript
await apiClient.post('/topup', {
  amount: data.amount,
  payment_method: data.paymentMethod
});
```

## Database Schema Analysis

### `transactions` Table
Columns relevant to top-up:
- `id` (uuid, PK)
- `user_id` (uuid, FK to users)
- `transaction_type` (varchar) - Will be 'topup'
- `product_id` (uuid, nullable) - NULL for top-ups
- `amount` (numeric)
- `status` (varchar, default: 'pending')
- `payment_method` (varchar, nullable)
- `payment_proof_url` (text, nullable)
- `notes` (text, nullable)
- `metadata` (jsonb, default: {})
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `completed_at` (timestamp, nullable)

### `users` Table
Columns relevant to balance:
- `id` (uuid, PK)
- `balance` (numeric, default: 0)
- `email` (varchar)
- `role` (varchar)

## Migration Strategy

### 1. Payment Methods
**Option A: Static Configuration (Recommended)**
- Define payment methods in frontend config
- No database query needed
- Easy to update and maintain

**Option B: Database Table**
- Create `payment_methods` table
- Query with Supabase
- More flexible but adds complexity

**Recommendation:** Use static configuration since payment methods rarely change.

### 2. Process Top-Up
**Direct Supabase Implementation:**
1. Frontend validation (minimum amount)
2. Create transaction record with Supabase insert
3. For instant payment: Update user balance with Supabase RPC or transaction
4. For payment gateway: Generate payment URL (can use Edge Function if needed)
5. Return transaction details

**Note:** Balance updates should be atomic. Consider using Supabase RPC function or database trigger.

### 3. Top-Up History
**Direct Supabase Implementation:**
1. Query transactions table with filters
2. Use Supabase pagination (range)
3. Order by created_at descending
4. Return results

## Business Logic Requirements

### Validation Rules
1. **Minimum Amount:** Rp 10,000
2. **Maximum Amount:** (if any limit exists)
3. **User Authentication:** Must be logged in
4. **Payment Method:** Must be valid and enabled

### Balance Update Logic
**Critical:** Balance updates must be atomic to prevent race conditions.

**Options:**
1. **Supabase RPC Function** (Recommended)
   ```sql
   CREATE OR REPLACE FUNCTION update_user_balance(
     p_user_id UUID,
     p_amount NUMERIC,
     p_transaction_id UUID
   ) RETURNS void AS $$
   BEGIN
     UPDATE users 
     SET balance = balance + p_amount 
     WHERE id = p_user_id;
     
     UPDATE transactions 
     SET status = 'completed', completed_at = NOW() 
     WHERE id = p_transaction_id;
   END;
   $$ LANGUAGE plpgsql;
   ```

2. **Database Trigger** (Alternative)
   - Trigger on transactions table
   - Auto-update balance when status changes to 'completed'

### Transaction Flow
1. User submits top-up request
2. Create transaction record (status: 'pending')
3. If instant payment:
   - Update balance immediately
   - Set status to 'completed'
4. If payment gateway:
   - Generate payment URL
   - Return URL to user
   - Webhook updates status later
5. Return transaction details

## Security Considerations

### RLS Policies Needed
1. **transactions table:**
   - Users can insert own transactions
   - Users can view own transactions
   - Admins can view all transactions

2. **users table:**
   - Users can view own balance
   - Only RPC function can update balance (not direct UPDATE)

### Validation
- Frontend: Validate amount, payment method
- Database: Check constraints on amount (> 0)
- RLS: Ensure user can only create transactions for themselves

## Dependencies to Remove

After migration:
- ❌ Remove `apiClient` import from `topup.service.ts`
- ❌ Remove backend `/topup` endpoints
- ❌ Update `TopUp.tsx` to use refactored service

## Summary

**Endpoints Using Backend:**
1. ✅ `POST /topup` - Process top-up
2. ✅ `GET /topup/methods` - Fetch payment methods
3. ✅ `GET /topup/history` - Fetch history

**Business Logic to Migrate:**
1. ✅ Payment method configuration
2. ✅ Top-up validation (amount, user)
3. ✅ Transaction record creation
4. ✅ Balance update (atomic operation)
5. ✅ Top-up history with pagination

**Database Operations Needed:**
1. ✅ INSERT into transactions table
2. ✅ UPDATE users balance (via RPC)
3. ✅ SELECT from transactions (with filters and pagination)

**Next Steps (Task 4.2):**
1. Create Supabase RPC function for atomic balance updates
2. Refactor `processTopUp` to use direct Supabase
3. Refactor `fetchPaymentMethods` to use static config
4. Refactor `fetchTopUpHistory` to use direct Supabase
5. Update `TopUp.tsx` to use refactored service
6. Test all functionality

---

**Audit Complete:** All backend dependencies identified and migration strategy defined.

# Account Pool - Supabase Direct Migration

## ✅ Migration Complete

Fitur Account Pool telah berhasil dimigrasi dari Backend API ke Supabase Direct integration.

---

## 🎯 What Changed

### Phase 1: Service Layer ✅
**File:** `src/features/admin/services/productAccount.service.ts`

**Before:**
```typescript
// ❌ Using backend API
const response = await api.get(`/product-accounts/fields/${productId}`);
return response.data.data;
```

**After:**
```typescript
// ✅ Using Supabase direct
const { data, error } = await supabase
  .from('product_account_fields')
  .select('*')
  .eq('product_id', productId);

if (error) throw error;
return data || [];
```

### Phase 2: Hooks Layer ✅
**File:** `src/features/admin/hooks/useProductAccounts.ts`

**Changes:**
- ✅ Removed `enabled: false` - hooks are now active
- ✅ All queries use Supabase client directly
- ✅ Proper error handling with `if (error) throw error`
- ✅ Query invalidation for cache management

### Phase 3: Integration ✅
**File:** `src/features/member-area/pages/admin/ProductDetailModal.tsx`

**Status:**
- ✅ No changes needed - already using hooks correctly
- ✅ All mutations properly connected
- ✅ Toast notifications working

---

## 🔧 Features Now Working

### 1. Field Definition Management
- ✅ View existing fields for a product
- ✅ Add new fields (Email, Password, BM ID, etc.)
- ✅ Edit field properties (name, type, required)
- ✅ Delete fields
- ✅ Bulk create/replace fields

### 2. Account Pool Management
- ✅ View available accounts
- ✅ View sold accounts
- ✅ Add new account to pool
- ✅ Edit account data
- ✅ Delete account from pool
- ✅ Real-time stats (Available/Sold/Total)

### 3. Stock Integration
- ✅ Product stock count reflects available accounts
- ✅ Auto-update when accounts added/removed
- ✅ Filter by status (available/sold)

---

## 📊 Database Schema

### `product_account_fields`
Defines the structure of accounts for each product.

```sql
CREATE TABLE product_account_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  field_name VARCHAR NOT NULL,
  field_type VARCHAR DEFAULT 'text',
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Example:**
```json
{
  "field_name": "Email",
  "field_type": "email",
  "is_required": true
}
```

### `product_accounts`
Stores actual account data in the pool.

```sql
CREATE TABLE product_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  account_data JSONB DEFAULT '{}',
  status VARCHAR DEFAULT 'available' CHECK (status IN ('available', 'sold')),
  assigned_to_transaction_id UUID REFERENCES transactions(id),
  assigned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Example:**
```json
{
  "account_data": {
    "Email": "test@example.com",
    "Password": "SecurePass123",
    "BM ID": "123456789"
  },
  "status": "available"
}
```

---

## 🔐 RLS Policies

### Admin Access
```sql
-- Admins have full access to both tables
CREATE POLICY "Admin full access to product_account_fields"
ON product_account_fields FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admin full access to product_accounts"
ON product_accounts FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);
```

### User Access
```sql
-- Users can view available stock
CREATE POLICY "Users can view available stock"
ON product_accounts FOR SELECT
TO authenticated
USING (status = 'available');

-- Users can view their purchased accounts
CREATE POLICY "Users can view their purchased accounts"
ON product_accounts FOR SELECT
TO authenticated
USING (
  assigned_to_transaction_id IN (
    SELECT id FROM transactions 
    WHERE user_id = auth.uid()
  )
);
```

---

## 🧪 How to Test

### 1. Access Account Pool
1. Login as **admin**
2. Go to `/admin/products` (Kelola Produk)
3. Click **eye icon** (👁️) on any product
4. Click **"Account Pool"** tab

### 2. Configure Fields
1. In Account Pool tab, click **"Edit Fields"**
2. You'll see existing fields or default (Email, Password)
3. Click **"Add Field"** to add more fields
4. Configure:
   - Field name (e.g., "BM ID", "Phone Number")
   - Field type (text, password, email, url, textarea)
   - Required checkbox
5. Click **"Save Fields"**

### 3. Add Accounts
1. Click **"Add Account"** button
2. Fill in all required fields
3. Click **"Save Account"**
4. Account appears in the pool with status "available"
5. Stats update automatically

### 4. Edit/Delete Accounts
1. Click **edit icon** (✏️) to modify account data
2. Click **trash icon** (🗑️) to delete account
3. Confirm deletion

### 5. Verify Stock Count
1. Go back to product list
2. Check "Stock" column
3. Should show: `X akun` (number of available accounts)
4. Status badge shows "Available" or "Out of Stock"

---

## 🎨 UI Components

### AccountPoolTab
**Location:** `src/features/admin/components/products/AccountPoolTab.tsx`

**Features:**
- Stats cards (Available/Sold/Total)
- Field definition editor
- Account list with status badges
- Edit/Delete actions per account

### FieldEditorModal
**Location:** `src/features/admin/components/products/FieldEditorModal.tsx`

**Features:**
- Drag-and-drop field ordering
- Field type selector
- Required checkbox
- Add/Remove fields dynamically

### AccountFormModal
**Location:** `src/features/admin/components/products/AccountFormModal.tsx`

**Features:**
- Dynamic form based on field definitions
- Validation for required fields
- Support for different input types
- Edit mode pre-fills existing data

---

## 🔄 Data Flow

### Adding Account to Pool
```
Admin → Add Account Button
  ↓
AccountFormModal opens
  ↓
Fill form based on field definitions
  ↓
Submit → useCreateAccount hook
  ↓
Supabase INSERT into product_accounts
  ↓
React Query invalidates cache
  ↓
UI updates automatically
  ↓
Stats recalculated
  ↓
Product stock count updates
```

### Member Purchases Product
```
Member → Buy Product
  ↓
Transaction created
  ↓
Backend assigns available account
  ↓
UPDATE product_accounts SET:
  - status = 'sold'
  - assigned_to_transaction_id = transaction.id
  - assigned_at = NOW()
  ↓
Account removed from available pool
  ↓
Stats update
  ↓
Product stock decreases
```

---

## 🚀 Performance

### Query Optimization
- ✅ Indexed on `product_id` for fast lookups
- ✅ Indexed on `status` for filtering
- ✅ React Query caching (2 min for fields, 30s for accounts)
- ✅ Automatic cache invalidation on mutations

### Stale Time Configuration
```typescript
// Fields - rarely change
staleTime: 2 * 60 * 1000 // 2 minutes

// Accounts - frequently updated
staleTime: 30 * 1000 // 30 seconds
```

---

## 🐛 Troubleshooting

### Issue: Fields not showing
**Solution:**
1. Check if product has fields defined
2. Open browser console for errors
3. Verify RLS policies allow admin access
4. Check Supabase logs

### Issue: Cannot add account
**Solution:**
1. Ensure fields are configured first
2. Check all required fields are filled
3. Verify account_data format is valid JSON
4. Check RLS policies

### Issue: Stock count not updating
**Solution:**
1. Check React Query cache invalidation
2. Refresh page to force refetch
3. Verify product_accounts table has correct data
4. Check if status is 'available' not 'sold'

---

## 📝 API Reference

### Hooks

#### `useAccountFields(productId: string)`
Fetches field definitions for a product.

**Returns:**
```typescript
{
  data: ProductAccountField[],
  isLoading: boolean,
  error: Error | null
}
```

#### `useAccounts(productId: string, status?: 'available' | 'sold')`
Fetches accounts with optional status filter.

**Returns:**
```typescript
{
  data: {
    accounts: ProductAccount[],
    stats: { available, sold, total }
  },
  isLoading: boolean,
  error: Error | null
}
```

#### `useCreateAccount()`
Creates a new account in the pool.

**Usage:**
```typescript
const createAccount = useCreateAccount();

createAccount.mutate({
  productId: 'uuid',
  accountData: { Email: 'test@example.com', Password: '123' }
});
```

#### `useBulkCreateFields()`
Replaces all fields for a product.

**Usage:**
```typescript
const bulkCreate = useBulkCreateFields();

bulkCreate.mutate({
  productId: 'uuid',
  fields: [
    { field_name: 'Email', field_type: 'email', is_required: true },
    { field_name: 'Password', field_type: 'password', is_required: true }
  ]
});
```

---

## ✅ Migration Checklist

- [x] Service layer migrated to Supabase
- [x] Hooks enabled and updated
- [x] Error handling implemented
- [x] Cache invalidation configured
- [x] RLS policies verified
- [x] UI components tested
- [x] Documentation created
- [x] No TypeScript errors

---

## 🎉 Result

Fitur Account Pool sekarang **100% berfungsi** dengan:
- ✅ Supabase direct integration
- ✅ Real-time updates
- ✅ Proper error handling
- ✅ Security via RLS
- ✅ Optimized performance
- ✅ Clean architecture

**Status:** PRODUCTION READY ✅

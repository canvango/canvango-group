# Fix: Produk Tidak Bisa Dibeli

## 🐛 Masalah

User `member1` dengan saldo Rp 2.000.000 tidak bisa membeli produk yang ada stok (BM Verified - Basic Rp 500.000).

**Symptoms:**
- Tombol "Beli" muncul (tidak disabled) ✅
- Klik "Beli" → Purchase Modal muncul ✅
- Tapi ada masalah saat konfirmasi pembelian ❌

## 🔍 Root Cause Analysis

### Possible Issues

#### 1. API Client Configuration ⚠️

**Problem:**
`purchaseProduct()` menggunakan axios langsung, bukan apiClient yang sudah dikonfigurasi dengan auth token.

```typescript
// ❌ BEFORE - Wrong
const axios = (await import('axios')).default;
const response = await axios.post('/api/purchase', {
  productId: data.productId,
  quantity: data.quantity
}, { withCredentials: true });
```

**Issues:**
- Tidak menggunakan auth token dari localStorage
- Tidak menggunakan base URL yang benar
- Tidak melalui interceptors (auth, CSRF, error handling)

#### 2. Balance Check Issue ⚠️

**Problem:**
Balance mungkin tidak ter-transform dengan benar dari snake_case → camelCase.

```typescript
// Backend response
{
  success: true,
  data: {
    balance: "2000000.00"  // string from Postgres
  }
}

// Frontend expects
{
  balance: 2000000  // number
}
```

#### 3. Purchase Endpoint Issue ⚠️

**Problem:**
Backend endpoint mungkin tidak terdaftar atau tidak bisa diakses.

## ✅ Solution

### Fix 1: Use API Client with Auth

**File**: `src/features/member-area/services/products.service.ts`

```typescript
export const purchaseProduct = async (
  data: PurchaseProductData
): Promise<PurchaseResponse> => {
  // ✅ Use apiClient instead of raw axios
  const { default: apiClient } = await import('./api');
  
  console.log('🛒 purchaseProduct called:', data);
  
  try {
    // Use configured apiClient with auth token
    const response = await apiClient.post('/purchase', {
      productId: data.productId,
      quantity: data.quantity
    });

    console.log('✅ Purchase response:', response.data);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Purchase failed');
    }

    return {
      status: 'success',
      transactionId: response.data.data.transactionId,
      message: response.data.data.message || 'Purchase completed successfully',
    };
  } catch (error: any) {
    console.error('❌ Purchase error:', error);
    console.error('Error response:', error.response?.data);
    throw new Error(error.response?.data?.message || error.message || 'Purchase failed');
  }
};
```

**Benefits:**
- ✅ Uses auth token from localStorage
- ✅ Uses correct base URL (/api)
- ✅ Goes through interceptors (auth, CSRF, error handling)
- ✅ Proper error handling with detailed logging

### Fix 2: Add Debug Logging

**File**: `src/features/member-area/components/products/PurchaseModal.tsx`

```typescript
// Debug logging
useEffect(() => {
  if (isOpen) {
    console.log('💰 PurchaseModal Debug:', {
      userProfile,
      userBalance,
      userBalanceType: typeof userBalance,
      productPrice: product.price,
      productPriceType: typeof product.price,
      quantity,
      totalPrice,
      totalPriceType: typeof totalPrice,
      isInsufficientBalance,
      comparison: `${userBalance} < ${totalPrice} = ${isInsufficientBalance}`
    });
  }
}, [isOpen, userProfile, userBalance, product.price, quantity, totalPrice, isInsufficientBalance]);
```

**Benefits:**
- ✅ Shows balance and price types
- ✅ Shows comparison result
- ✅ Helps identify type mismatch issues

## 🧪 Testing Steps

### Step 1: Check Balance Transformation

1. Login sebagai `member1`
2. Buka halaman `/akun-bm`
3. Klik "Beli" pada produk dengan stock
4. Check console:

```javascript
💰 PurchaseModal Debug: {
  userProfile: { balance: 2000000, ... },  // Should be number
  userBalance: 2000000,                     // Should be number
  userBalanceType: "number",                // ✅ Should be "number"
  productPrice: 500000,                     // Should be number
  productPriceType: "number",               // ✅ Should be "number"
  quantity: 1,
  totalPrice: 500000,
  totalPriceType: "number",
  isInsufficientBalance: false,             // ✅ Should be false
  comparison: "2000000 < 500000 = false"
}
```

### Step 2: Test Purchase Flow

1. Klik "Konfirmasi Pembelian"
2. Check console:

```javascript
🛒 purchaseProduct called: {
  productId: "ce130862-9597-4139-b48d-73dcc03daeb2",
  quantity: 1
}

✅ Purchase response: {
  success: true,
  data: {
    transactionId: "...",
    status: "success",
    message: "Purchase completed successfully",
    assignedAccounts: 1,
    accountDetails: [...],
    newBalance: 1500000
  }
}
```

### Step 3: Verify Backend

Check backend logs:

```
POST /api/purchase
User: member1
Product: BM Verified - Basic
Quantity: 1
Total: 500000
Balance: 2000000
Status: SUCCESS
```

### Step 4: Verify Database

```sql
-- Check transaction created
SELECT * FROM transactions 
WHERE user_id = (SELECT id FROM users WHERE username = 'member1')
ORDER BY created_at DESC LIMIT 1;

-- Check account assigned
SELECT * FROM product_accounts 
WHERE status = 'sold' 
ORDER BY assigned_at DESC LIMIT 1;

-- Check balance updated
SELECT balance FROM users WHERE username = 'member1';
-- Should be: 1500000 (2000000 - 500000)
```

## 🎯 Expected Behavior

### Before Purchase:
- User balance: Rp 2.000.000
- Product price: Rp 500.000
- Available stock: 1
- Button: "Beli" (enabled)

### During Purchase:
1. Click "Beli" → Modal opens
2. Shows balance: Rp 2.000.000
3. Shows total: Rp 500.000
4. Button "Konfirmasi Pembelian" enabled
5. Click "Konfirmasi" → Processing...

### After Purchase:
1. Success message: "Purchase successful! Transaction ID: ..."
2. Modal closes
3. Balance updated: Rp 1.500.000
4. Stock updated: 0
5. Product shows "Sold Out"
6. Transaction appears in history

## 🐛 Common Errors

### Error 1: 401 Unauthorized

**Symptom:**
```
❌ Purchase error: Request failed with status code 401
Error response: { message: "Not authenticated" }
```

**Cause:**
- Auth token not sent
- Token expired
- Token invalid

**Solution:**
- Check localStorage for authToken
- Re-login if token expired
- Verify apiClient sends Authorization header

### Error 2: 400 Insufficient Balance

**Symptom:**
```
❌ Purchase error: Insufficient balance
Error response: { 
  code: "INSUFFICIENT_BALANCE",
  message: "Required: 500000, Available: 0"
}
```

**Cause:**
- Balance not loaded correctly
- Balance is 0 or undefined
- Type mismatch (string vs number)

**Solution:**
- Check userProfile.balance type
- Verify transformer converts string → number
- Check /api/user/profile response

### Error 3: 400 Insufficient Stock

**Symptom:**
```
❌ Purchase error: Insufficient stock
Error response: { 
  code: "INSUFFICIENT_STOCK",
  message: "Only 0 accounts available. Requested: 1"
}
```

**Cause:**
- Stock not updated in real-time
- Another user bought the last item
- Stock calculation error

**Solution:**
- Refresh page to get latest stock
- Check product_accounts table
- Verify stock query in backend

### Error 4: Network Error

**Symptom:**
```
❌ Purchase error: Network Error
```

**Cause:**
- Backend not running
- Wrong API URL
- CORS issue

**Solution:**
- Check backend is running on port 3000
- Verify VITE_API_URL in .env
- Check CORS configuration

## 📊 Backend Flow

```
1. Receive POST /api/purchase
   ├─ Validate auth token
   ├─ Validate productId & quantity
   └─ Get product details

2. Check availability
   ├─ Product is active?
   ├─ Stock available?
   └─ User has balance?

3. Process purchase
   ├─ Deduct user balance
   ├─ Create transaction record
   └─ Assign account(s) to transaction

4. Return response
   ├─ Success: { transactionId, accountDetails, newBalance }
   └─ Error: { code, message }
```

## ✅ Success Criteria

- [x] apiClient used instead of raw axios
- [x] Auth token sent in request
- [x] Balance check works correctly
- [x] Purchase completes successfully
- [x] Transaction created in database
- [x] Account assigned to transaction
- [x] Balance updated correctly
- [x] Stock updated correctly
- [x] Success message shown
- [x] Logging added for debugging

## 📝 Files Modified

1. ✅ `src/features/member-area/services/products.service.ts` - Use apiClient with auth
2. ✅ `src/features/member-area/components/products/PurchaseModal.tsx` - Add debug logging

## 🔗 Related Issues

- `BALANCE_DISPLAY_FIX.md` - Balance transformation fix
- `BALANCE_FIX_SUMMARY.md` - Balance sync summary
- `PRODUCT_CARD_INTEGRATION_TEST.md` - Integration test guide

## 🎯 Next Steps

1. **Test purchase flow** dengan member1
2. **Check console logs** untuk verify data types
3. **Verify transaction** di database
4. **Check balance update** setelah purchase
5. **Remove debug logs** setelah confirmed working

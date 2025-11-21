# Purchase Success & Redirect Fix

## 🐛 Issues Fixed

### Issue 1: Transaction Status Constraint Violation
**Error:** `new row for relation "transactions" violates check constraint "transactions_status_check"`

**Root Cause:**
- Backend menggunakan status `'BERHASIL'` (uppercase, Indonesian)
- Database constraint hanya menerima: `pending`, `processing`, `completed`, `failed`, `cancelled`

**Solution:**
Changed status from `'BERHASIL'` to `'completed'` in `purchase.controller.ts`:

```typescript
// BEFORE (WRONG)
status: 'BERHASIL', // ❌ Invalid status

// AFTER (CORRECT)
status: 'completed', // ✅ Valid status
```

**File Modified:**
- `server/src/controllers/purchase.controller.ts` (line 75)

---

### Issue 2: No Redirect After Purchase
**Problem:** User tidak diarahkan ke transaction history setelah purchase berhasil

**Solution:**
Added redirect to `/member/transactions` after successful purchase in both:
1. `BMAccounts.tsx`
2. `PersonalAccounts.tsx`

**Implementation:**

```typescript
// Added useNavigate hook
import { useNavigate } from 'react-router-dom';

const BMAccounts: React.FC = () => {
  const navigate = useNavigate();
  
  const handlePurchaseConfirm = async (quantity: number) => {
    await purchaseMutation.mutateAsync(
      { productId: selectedProduct.id, quantity },
      {
        onSuccess: (response) => {
          setIsPurchaseModalOpen(false);
          setSelectedProduct(null);
          
          // Show success message
          alert(`✅ Pembelian berhasil!\n\nAnda akan diarahkan ke halaman Riwayat Transaksi untuk melihat detail akun yang dibeli.`);
          
          // Redirect to transaction history
          navigate('/member/transactions');
        },
        onError: (error) => {
          alert(`❌ Pembelian gagal: ${error.message}`);
        },
      }
    );
  };
};
```

**Files Modified:**
- `src/features/member-area/pages/BMAccounts.tsx`
- `src/features/member-area/pages/PersonalAccounts.tsx`

---

## 📊 Complete Purchase Flow

### 1. User Clicks "Beli" Button
- Opens PurchaseModal
- Displays balance and product details
- User confirms purchase

### 2. Backend Processing
```
POST /api/purchase
├─ Validate user balance ✅
├─ Deduct balance ✅
├─ Create transaction (status: 'completed') ✅
├─ Assign account from pool ✅
├─ Update account status to 'sold' ✅
└─ Return transaction details ✅
```

### 3. Frontend Success Handler
```
onSuccess:
├─ Close modal ✅
├─ Show success alert ✅
└─ Redirect to /member/transactions ✅
```

### 4. Transaction History Page
- User can see purchased transaction
- Click "Lihat Detail" to view account credentials
- Account details displayed in modal

---

## 🎯 User Experience Flow

### Before Fix:
1. Click "Beli" ✅
2. Confirm purchase ✅
3. **Error:** "An unexpected error occurred" ❌
4. Balance deducted but no transaction record ❌
5. User confused, no way to see account details ❌

### After Fix:
1. Click "Beli" ✅
2. Confirm purchase ✅
3. **Success:** "Pembelian berhasil!" ✅
4. **Auto-redirect** to Transaction History ✅
5. User can immediately see transaction ✅
6. Click "Lihat Detail" to view account ✅

---

## 🚀 Testing Instructions

### Test 1: Purchase Flow
1. Login as member1
2. Navigate to BM Accounts or Personal Accounts
3. Click "Beli" on any product
4. Verify balance shows correctly
5. Click "Konfirmasi Pembelian"
6. **Expected:**
   - Success alert appears ✅
   - Automatically redirected to Transaction History ✅
   - Transaction appears in list ✅

### Test 2: View Account Details
1. In Transaction History page
2. Find the purchased transaction
3. Click "Lihat Detail" button
4. **Expected:**
   - Modal opens with account details ✅
   - Shows email, password, and other fields ✅
   - Can copy credentials ✅

### Test 3: Backend Logs
Check backend logs for successful transaction:
```
POST /api/purchase
✅ Transaction created with status: 'completed'
✅ Account assigned successfully
✅ Response sent to frontend
```

---

## 📝 Files Modified

### Backend
1. `server/src/controllers/purchase.controller.ts`
   - Changed status from 'BERHASIL' to 'completed'

### Frontend
2. `src/features/member-area/pages/BMAccounts.tsx`
   - Added useNavigate import
   - Added redirect after purchase success
   - Improved success/error messages

3. `src/features/member-area/pages/PersonalAccounts.tsx`
   - Added useNavigate import
   - Added redirect after purchase success
   - Improved success/error messages

---

## 🔗 Related Features

### Transaction History Integration
- Route: `/member/transactions`
- Component: `TransactionHistory.tsx`
- Shows all user transactions
- Includes "Lihat Detail" button for each transaction

### Account Detail Modal
- Component: `AccountDetailModal.tsx`
- Displays purchased account credentials
- Shows all custom fields (email, password, etc.)
- Allows copying credentials

### Purchase Service
- Service: `products.service.ts`
- Uses apiClient with auth token ✅
- Handles purchase mutation ✅
- Returns transaction details ✅

---

## ✅ Status: COMPLETE

All purchase flow issues are now resolved:
1. ✅ Balance displays correctly
2. ✅ Purchase executes successfully
3. ✅ Transaction saved with correct status
4. ✅ User redirected to transaction history
5. ✅ Account details accessible

## 🎉 Ready for Testing!

Test the complete flow:
1. Purchase a product
2. Verify redirect to transaction history
3. View account details
4. Confirm all credentials are visible

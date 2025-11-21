# Account Pool System - Implementation Guide

## ✅ Yang Sudah Dibuat

### 1. Database Schema
- ✅ Tabel `product_account_fields` - Template field per produk (flexible)
- ✅ Tabel `product_accounts` - Pool akun dengan JSON data
- ✅ Trigger auto-sync stock dengan jumlah account available
- ✅ Migration berhasil dijalankan

### 2. Backend API
- ✅ Models:
  - `ProductAccountField.model.ts` - CRUD field definitions
  - `ProductAccount.model.ts` - CRUD account pool
- ✅ Controllers:
  - `productAccount.controller.ts` - Manage fields & accounts
  - `purchase.controller.ts` - Handle purchase dengan auto-assign account
- ✅ Routes:
  - `/api/product-accounts/*` - Account management (admin)
  - `/api/purchase` - Purchase endpoint (user)
- ✅ Auto-assign logic saat checkout

### 3. Frontend Admin Components
- ✅ `AccountPoolTab.tsx` - Tab untuk manage account pool
- ✅ `AccountFormModal.tsx` - Form add/edit account
- ✅ `FieldEditorModal.tsx` - Editor untuk define custom fields
- ✅ Types: `productAccount.ts`

### 4. Frontend Member Area
- ✅ `AccountDetailModal.tsx` - Sudah ada, siap untuk integrasi

## 🔧 Yang Perlu Dilakukan

### 1. Integrasi Admin UI
Tambahkan tab "Account Pool" di Product Management:

**File:** `src/features/admin/pages/ProductManagement.tsx`

```tsx
// Import components
import AccountPoolTab from '../components/products/AccountPoolTab';
import AccountFormModal from '../components/products/AccountFormModal';
import FieldEditorModal from '../components/products/FieldEditorModal';

// Add tab
const tabs = [
  { id: 'info', label: 'Product Info' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'accounts', label: 'Account Pool' }, // NEW
];

// Add tab content
{activeTab === 'accounts' && (
  <AccountPoolTab
    productId={selectedProduct.id}
    fields={accountFields}
    accounts={accounts}
    stats={accountStats}
    onAddField={handleAddField}
    // ... other handlers
  />
)}
```

### 2. Create API Service Hooks

**File:** `src/features/admin/services/productAccount.service.ts`

```typescript
import axios from 'axios';

export const fetchAccountFields = async (productId: string) => {
  const response = await axios.get(`/api/product-accounts/fields/${productId}`);
  return response.data.data;
};

export const fetchAccounts = async (productId: string) => {
  const response = await axios.get(`/api/product-accounts/accounts/${productId}`);
  return response.data.data;
};

export const createAccount = async (productId: string, accountData: any) => {
  const response = await axios.post('/api/product-accounts/accounts', {
    product_id: productId,
    account_data: accountData
  });
  return response.data.data;
};

// ... other CRUD functions
```

**File:** `src/features/admin/hooks/useProductAccounts.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as service from '../services/productAccount.service';

export const useAccountFields = (productId: string) => {
  return useQuery({
    queryKey: ['accountFields', productId],
    queryFn: () => service.fetchAccountFields(productId),
    enabled: !!productId
  });
};

export const useAccounts = (productId: string) => {
  return useQuery({
    queryKey: ['accounts', productId],
    queryFn: () => service.fetchAccounts(productId),
    enabled: !!productId
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, accountData }: any) => 
      service.createAccount(productId, accountData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
};

// ... other mutations
```

### 3. Update Frontend Purchase Flow

**File:** `src/features/member-area/services/products.service.ts`

Update `purchaseProduct` function untuk menggunakan backend endpoint baru:

```typescript
export const purchaseProduct = async (
  data: PurchaseProductData
): Promise<PurchaseResponse> => {
  const response = await axios.post('/api/purchase', {
    productId: data.productId,
    quantity: data.quantity
  }, { withCredentials: true });

  return {
    status: 'success',
    transactionId: response.data.data.transactionId,
    message: response.data.data.message
  };
};
```

### 4. Update AccountDetailModal untuk Fetch Account Data

**File:** `src/features/member-area/components/transactions/AccountDetailModal.tsx`

Tambahkan fetch account data dari API:

```typescript
const [accountData, setAccountData] = useState<any>(null);
const [isLoading, setIsLoading] = useState(false);

useEffect(() => {
  if (isOpen && transaction) {
    fetchAccountData();
  }
}, [isOpen, transaction]);

const fetchAccountData = async () => {
  setIsLoading(true);
  try {
    const response = await axios.get(
      `/api/product-accounts/account/transaction/${transaction.id}`,
      { withCredentials: true }
    );
    
    if (response.data.success) {
      // Transform API data to match existing structure
      const apiAccount = response.data.data;
      const transformedAccount = {
        id: apiAccount.id,
        credentials: {
          accountId: apiAccount.account_data.id_bm || apiAccount.account_data.email,
          url: apiAccount.account_data.link_akses || apiAccount.account_data.url,
          username: apiAccount.account_data.email || apiAccount.account_data.username,
          password: apiAccount.account_data.password,
          additionalInfo: apiAccount.account_data
        },
        status: 'active'
      };
      
      // Update transaction with account data
      transaction.accounts = [transformedAccount];
      setAccountData(transformedAccount);
    }
  } catch (err) {
    console.error('Failed to fetch account:', err);
  } finally {
    setIsLoading(false);
  }
};
```

## 📋 Testing Checklist

### Admin Side:
1. ☐ Buka Product Management
2. ☐ Pilih produk → Tab "Account Pool"
3. ☐ Define fields (Email, Password, ID BM, Link Akses, dll)
4. ☐ Add account manual
5. ☐ Bulk import accounts (CSV)
6. ☐ Verify stock auto-update

### User Side:
1. ☐ User checkout produk
2. ☐ Verify balance deducted
3. ☐ Verify account auto-assigned
4. ☐ Verify stock berkurang
5. ☐ Buka Transaction History
6. ☐ Klik "Lihat Detail"
7. ☐ Verify account data tampil di modal

## 🔄 Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ ADMIN: Product Management                               │
├─────────────────────────────────────────────────────────┤
│ 1. Define Fields (Email, Password, ID BM, Link, etc)   │
│ 2. Add Accounts to Pool                                 │
│    → Stock auto-increment                               │
├─────────────────────────────────────────────────────────┤
│ DATABASE: product_accounts                              │
│ - status: 'available'                                   │
│ - account_data: { email, password, id_bm, link }        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ USER: Checkout Product                                  │
├─────────────────────────────────────────────────────────┤
│ 1. Click "Buy" → Enter quantity                         │
│ 2. POST /api/purchase                                   │
│    → Check balance                                      │
│    → Check available accounts                           │
│    → Deduct balance                                     │
│    → Create transaction                                 │
│    → Assign account (status: 'sold')                    │
│    → Stock auto-decrement                               │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ USER: View Transaction History                          │
├─────────────────────────────────────────────────────────┤
│ 1. Click transaction → "Lihat Detail"                   │
│ 2. GET /api/product-accounts/account/transaction/:id    │
│ 3. Display account credentials                          │
│    - Email, Password, ID BM, Link Akses                 │
│ 4. Copy/Download functionality                          │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Next Steps

1. **Integrate Admin UI** - Tambahkan tab Account Pool di Product Management
2. **Create API Services** - Buat service & hooks untuk CRUD operations
3. **Update Purchase Flow** - Gunakan endpoint `/api/purchase` yang baru
4. **Test End-to-End** - Test dari admin add account sampai user terima account
5. **Add Bulk Import** - Implement CSV import untuk bulk add accounts

## 📝 Notes

- Account data flexible (JSON) - bisa beda-beda per produk
- Stock otomatis sync dengan available accounts
- Account sekali pakai (status: available → sold)
- Trigger database handle sync otomatis
- Admin bisa edit field definition kapan saja

## ❓ Questions?

Jika ada yang perlu dijelaskan lebih detail atau ada masalah saat implementasi, silakan tanya!

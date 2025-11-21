# Active/Inactive Filter Feature - Product Management

## ✅ Feature Complete

Fitur filter Active/Inactive telah ditambahkan untuk memudahkan admin manage produk berdasarkan status.

---

## 🎯 Features Added

### 1. Status Filter Dropdown

**Location**: Filter bar (kolom kedua)

**Options**:
- **All Status** - Show semua produk
- **✅ Active Only** - Show produk aktif saja
- **⭕ Inactive Only** - Show produk inactive saja

### 2. Quick Toggle Button

**Location**: Action column di table

**Function**: Toggle active/inactive status dengan 1 klik

**Icons**:
- 🟢 **CheckCircle** (green) - Untuk activate produk inactive
- 🟠 **XCircle** (orange) - Untuk deactivate produk active

### 3. Info Banner

**Location**: Above table (hanya muncul saat filter = Inactive)

**Content**: Warning message yang menjelaskan:
- Produk inactive hidden dari users
- Tidak bisa dibeli
- Mungkin punya purchase history
- Tidak bisa dihapus
- Bisa diaktifkan kembali

### 4. Enhanced Error Messages

**Delete Error**: Jika produk punya purchase history
```
Cannot delete: Product has purchase history. 
Please deactivate it instead.
```

---

## 🎨 UI/UX Improvements

### Filter Layout
```
┌─────────────┬──────────────┬──────────────┬──────────────┐
│   Search    │    Status    │  Product Type│  Stock Status│
│   🔍        │  ✅ Active   │  BM Account  │  Available   │
└─────────────┴──────────────┴──────────────┴──────────────┘
```

**Responsive**:
- Mobile: 1 column (stacked)
- Tablet: 2 columns
- Desktop: 4 columns

### Action Buttons Order
```
👁️ View → ⭕/✅ Toggle → ✏️ Edit → 📋 Duplicate → 🗑️ Delete
```

**Color Coding**:
- 🔵 View (Indigo)
- 🟢 Activate (Green)
- 🟠 Deactivate (Orange)
- 🔵 Edit (Blue)
- 🟣 Duplicate (Purple)
- 🔴 Delete (Red)

---

## 📊 Use Cases

### Use Case 1: View Only Active Products
```
1. Select "✅ Active Only" from Status filter
2. See only products that are visible to users
3. Manage active catalog
```

### Use Case 2: Manage Inactive Products
```
1. Select "⭕ Inactive Only" from Status filter
2. See warning banner about inactive products
3. Review products that are hidden
4. Reactivate if needed with toggle button
```

### Use Case 3: Quick Deactivate
```
1. Find product in table
2. Click orange XCircle icon
3. Product instantly deactivated
4. No need to open edit modal
```

### Use Case 4: Quick Activate
```
1. Filter by "Inactive Only"
2. Find product to reactivate
3. Click green CheckCircle icon
4. Product instantly activated
```

### Use Case 5: Bulk Activate/Deactivate
```
1. Filter by status
2. Select multiple products
3. Choose "Activate" or "Deactivate" from bulk actions
4. Apply
```

---

## 🔧 Technical Implementation

### Frontend Changes

**File**: `src/features/member-area/pages/admin/ProductManagement.tsx`

#### 1. New State
```typescript
const [activeStatusFilter, setActiveStatusFilter] = useState('all');
```

#### 2. Updated fetchProducts
```typescript
if (activeStatusFilter !== 'all') {
  params.is_active = activeStatusFilter === 'active';
}
```

#### 3. Quick Toggle Function
```typescript
const handleQuickToggleActive = async (product: Product) => {
  await api.put(`/admin/products/${product.id}`, {
    is_active: !product.is_active
  });
  toast.success(`Product ${!product.is_active ? 'activated' : 'deactivated'}`);
  fetchProducts();
};
```

#### 4. Enhanced Delete Error Handling
```typescript
if (error.response?.data?.error?.code === 'PRODUCT_IN_USE') {
  toast.error(
    'Cannot delete: Product has purchase history. Please deactivate it instead.',
    { duration: 5000 }
  );
}
```

### Backend Changes

**File**: `server/src/controllers/admin.product.controller.ts`

#### Foreign Key Error Handling
```typescript
catch (error: any) {
  if (error.code === '23503') {
    res.status(400).json(errorResponse(
      'PRODUCT_IN_USE',
      'Cannot delete product because it has been purchased by users. Please deactivate it instead.'
    ));
  }
}
```

---

## 🎯 Benefits

### For Admin:
1. **Easy Filtering** - Quickly find active or inactive products
2. **Quick Toggle** - Change status with 1 click
3. **Clear Feedback** - Visual indicators and messages
4. **Bulk Operations** - Activate/deactivate multiple products
5. **Better Understanding** - Info banner explains inactive products

### For System:
1. **Data Integrity** - Products with purchases cannot be deleted
2. **Audit Trail** - All status changes logged
3. **Reversible** - Can always reactivate products
4. **Safe** - No accidental data loss

---

## 📱 Responsive Design

### Mobile (< 768px)
- Filters: 1 column (stacked)
- Table: Horizontal scroll
- Actions: Icon buttons only

### Tablet (768px - 1024px)
- Filters: 2 columns
- Table: Full width
- Actions: Icon buttons with tooltips

### Desktop (> 1024px)
- Filters: 4 columns
- Table: Full width with spacing
- Actions: Icon buttons with tooltips

---

## 🧪 Testing Checklist

### Filter Testing
- [ ] "All Status" shows all products
- [ ] "Active Only" shows only active products
- [ ] "Inactive Only" shows only inactive products
- [ ] Filter persists during pagination
- [ ] Filter works with other filters (type, stock)

### Toggle Testing
- [ ] Click XCircle deactivates active product
- [ ] Click CheckCircle activates inactive product
- [ ] Toast notification shows correct message
- [ ] Table refreshes after toggle
- [ ] Status badge updates correctly

### Bulk Action Testing
- [ ] Bulk activate works on inactive products
- [ ] Bulk deactivate works on active products
- [ ] Selection cleared after action
- [ ] Toast shows success/failure count

### Error Handling Testing
- [ ] Delete product with purchases shows correct error
- [ ] Error message suggests deactivate
- [ ] Error toast duration is 5 seconds
- [ ] Modal closes after error

### UI/UX Testing
- [ ] Info banner shows for inactive filter
- [ ] Banner has correct styling (yellow)
- [ ] Icons are correct colors
- [ ] Tooltips show on hover
- [ ] Responsive layout works

---

## 📚 Related Documentation

- `PRODUCT_DELETE_CONSTRAINT.md` - Why products can't be deleted
- `BULK_ACTION_IMPLEMENTATION.md` - Bulk actions feature
- `BULK_ACTION_FIX.md` - SQL injection fix

---

## 🎉 Summary

Fitur Active/Inactive filter memberikan admin kontrol yang lebih baik untuk manage produk:

✅ **Filter dropdown** untuk quick access ke active/inactive products
✅ **Quick toggle button** untuk instant activate/deactivate
✅ **Info banner** untuk explain inactive products
✅ **Enhanced error messages** untuk guide admin
✅ **Responsive design** untuk semua device sizes

Admin sekarang tidak perlu bingung dengan produk yang tidak bisa dihapus - tinggal deactivate saja!

# Product Delete Constraint - Foreign Key Protection

## 🔒 Database Constraint

Produk yang sudah pernah dibeli oleh user **tidak bisa dihapus** karena dilindungi oleh foreign key constraint di database.

### Error Message:
```
Cannot delete product because it has been purchased by users. 
Please deactivate it instead.
```

### Technical Details:
```sql
Foreign Key Constraint: purchases_product_id_fkey
Table: purchases → products
Constraint Type: ON DELETE RESTRICT
```

---

## 🎯 Why This Constraint Exists

### Data Integrity
- **Purchase History**: User purchase history harus tetap valid
- **Transaction Records**: Transaksi harus tetap bisa dilacak
- **Audit Trail**: Riwayat pembelian tidak boleh hilang
- **Reporting**: Laporan penjualan harus akurat

### Business Logic
- Produk yang sudah dibeli adalah bagian dari historical data
- Menghapus produk akan membuat purchase records invalid
- User perlu melihat riwayat pembelian mereka

---

## ✅ Solution: Deactivate Instead of Delete

### Untuk Individual Product:

**Jangan Delete**, tapi **Deactivate**:

1. **Edit Product** (icon pensil)
2. **Uncheck "Active"** checkbox
3. **Save**

Result:
- ✅ Produk tidak muncul di katalog user
- ✅ Purchase history tetap valid
- ✅ Bisa diaktifkan kembali kapan saja

### Untuk Bulk Action:

1. **Select products** yang ingin dinonaktifkan
2. **Choose "Deactivate"** dari dropdown
3. **Click "Apply"**

Result:
- ✅ Semua produk terpilih jadi inactive
- ✅ Tidak muncul di katalog
- ✅ Data tetap aman

---

## 🔍 How to Check if Product Can Be Deleted

### Query untuk cek apakah produk punya purchases:

```sql
SELECT 
  p.id,
  p.product_name,
  COUNT(pu.id) as purchase_count
FROM products p
LEFT JOIN purchases pu ON pu.product_id = p.id
WHERE p.id = 'PRODUCT_ID_HERE'
GROUP BY p.id, p.product_name;
```

**Result**:
- `purchase_count = 0` → Bisa dihapus
- `purchase_count > 0` → Tidak bisa dihapus (harus deactivate)

---

## 📊 Product Status Flow

```
New Product (Active)
    ↓
Has Purchases
    ↓
Cannot Delete ❌
    ↓
Deactivate Instead ✅
    ↓
Inactive (Hidden from catalog)
    ↓
Can Reactivate Anytime ✅
```

---

## 🛠️ Implementation Details

### Backend Error Handling

```typescript
// server/src/controllers/admin.product.controller.ts
catch (error: any) {
  // Check if error is foreign key constraint violation
  if (error.code === '23503') {
    res.status(400).json(errorResponse(
      'PRODUCT_IN_USE',
      'Cannot delete product because it has been purchased by users. Please deactivate it instead.',
      { 
        constraint: error.constraint,
        detail: 'This product is referenced in purchase history'
      }
    ));
    return;
  }
}
```

### Error Codes:
- `23503` - Foreign key violation (PostgreSQL)
- `PRODUCT_IN_USE` - Custom error code for frontend

---

## 💡 Best Practices

### When to Delete:
- ✅ Test products (no purchases)
- ✅ Duplicate products (no purchases)
- ✅ Products created by mistake (no purchases)

### When to Deactivate:
- ✅ Products with purchase history
- ✅ Out of stock products
- ✅ Discontinued products
- ✅ Seasonal products

### Benefits of Deactivate:
1. **Reversible** - Can reactivate anytime
2. **Safe** - No data loss
3. **Audit-friendly** - Complete history preserved
4. **User-friendly** - Purchase history remains intact

---

## 🔄 Reactivating Products

To reactivate a deactivated product:

1. **Filter by Status**: "Inactive"
2. **Find the product**
3. **Edit** (icon pensil)
4. **Check "Active"** checkbox
5. **Save**

Or use bulk action:
1. **Filter by Status**: "Inactive"
2. **Select products**
3. **Choose "Activate"**
4. **Apply**

---

## 📝 Summary

| Action | Product with Purchases | Product without Purchases |
|--------|----------------------|--------------------------|
| Delete | ❌ Not allowed | ✅ Allowed |
| Deactivate | ✅ Recommended | ✅ Allowed |
| Edit | ✅ Allowed | ✅ Allowed |
| Duplicate | ✅ Allowed | ✅ Allowed |

**Recommendation**: Always use **Deactivate** instead of **Delete** for products that might have been purchased.

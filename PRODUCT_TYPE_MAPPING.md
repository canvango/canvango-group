# Product Type to Page Mapping

## 🗺️ Current Mapping (After Simplification)

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCT TYPE MAPPING                      │
└─────────────────────────────────────────────────────────────┘

Product Type         →  Page URL              →  Component
─────────────────────────────────────────────────────────────
bm_account          →  /akun-bm              →  BMAccounts.tsx
                                                 ✅ Shows product cards
                                                 ✅ Purchase functionality

personal_account    →  /akun-personal        →  PersonalAccounts.tsx
                                                 ✅ Shows product cards
                                                 ✅ Purchase functionality
```

## ❌ Removed from Dropdown (No Product Catalog)

```
Product Type         →  Page URL              →  Component
─────────────────────────────────────────────────────────────
verified_bm         →  /jasa-verified-bm     →  VerifiedBMService.tsx
(REMOVED)                                        ❌ Order form page
                                                 ❌ NOT a product catalog

api                 →  /api                  →  APIDocumentation.tsx
(REMOVED)                                        ❌ Documentation page
                                                 ❌ NOT a product catalog
```

## 📋 Admin Product Management UI

### Filter Dropdown (Product List)
```
┌─────────────────────────────┐
│ All Product Types        ▼  │
├─────────────────────────────┤
│ All Product Types           │
│ BM Account                  │
│ Personal Account            │
└─────────────────────────────┘
```

### Create/Edit Product Form
```
┌─────────────────────────────────────────────────────┐
│ Product Type *                                      │
├─────────────────────────────────────────────────────┤
│ BM Account                                       ▼  │
├─────────────────────────────────────────────────────┤
│ BM Account                                          │
│ Personal Account                                    │
└─────────────────────────────────────────────────────┘
  ℹ️ Product type determines which page displays 
     this product (/akun-bm or /akun-personal)
```

## 🎯 How It Works

### 1. Admin Creates Product
```
Admin Panel → Create Product
├─ Product Name: "BM Account Limit $250"
├─ Product Type: "BM Account" ✅
├─ Category: "limit_250"
└─ Price: 150000
```

### 2. Product Appears on Catalog Page
```
User visits: /akun-bm
└─ Fetches products WHERE product_type = 'bm_account'
   └─ Shows: "BM Account Limit $250" card
```

### 3. User Can Purchase
```
User clicks "Beli Sekarang"
└─ Purchase flow initiated
   └─ Transaction created
      └─ Account delivered
```

## 🔄 Product Differentiation Strategy

Use **Category** field to create product variants:

### BM Account Products (product_type = 'bm_account')
```
Category          Description
─────────────────────────────────────────
limit_250      →  BM Account with $250/day limit
limit_500      →  BM Account with $500/day limit
limit_1500     →  BM Account with $1500/day limit
bm_verified    →  Verified BM Account
bm_premium     →  Premium BM Account
```

### Personal Account Products (product_type = 'personal_account')
```
Category          Description
─────────────────────────────────────────
personal_250   →  Personal Account $250 limit
personal_500   →  Personal Account $500 limit
personal_aged  →  Aged Personal Account
personal_warm  →  Warmed Personal Account
```

## 📊 Database Schema

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  product_name VARCHAR NOT NULL,
  product_type VARCHAR NOT NULL,  -- 'bm_account' or 'personal_account'
  category VARCHAR NOT NULL,       -- 'limit_250', 'limit_500', etc.
  description TEXT,
  price NUMERIC NOT NULL,
  stock_status VARCHAR NOT NULL,
  is_active BOOLEAN NOT NULL,
  -- ... other fields
);
```

## ✅ Validation Rules

1. **Product Type** must be one of:
   - `bm_account`
   - `personal_account`

2. **Category** must exist in `categories` table

3. **Product Type + Category** combination should be unique for clarity

## 🚀 Future Expansion

If you need to add new product types in the future:

1. **Create the catalog page first:**
   ```tsx
   // src/features/member-area/pages/NewProductType.tsx
   const NewProductType = () => {
     // Fetch products WHERE product_type = 'new_type'
     // Display product cards
   };
   ```

2. **Add route:**
   ```tsx
   // src/features/member-area/routes.tsx
   <Route path="new-product-type" element={<NewProductType />} />
   ```

3. **Then add to dropdown:**
   ```tsx
   <option value="new_type">New Product Type</option>
   ```

## 📝 Summary

- ✅ Product Type now maps 1:1 to catalog pages
- ✅ Clearer admin experience
- ✅ No orphaned products
- ✅ Use Category for product variants
- ✅ Scalable for future expansion

---

**Last Updated:** 2025-11-25

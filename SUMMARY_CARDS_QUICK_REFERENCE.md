# Summary Cards Metrics - Quick Reference

## 📊 Metrics Overview

| Metric | Source | Calculation | Used In |
|--------|--------|-------------|---------|
| **Available Stock** | `product_accounts` | COUNT where status='available' | BM & Personal |
| **Success Rate** | `transactions` | (completed / total) × 100 | BM & Personal |
| **Total Sold** | `purchases` | SUM(quantity) | BM only |
| **Total Sold This Month** | `transactions` | COUNT where month=current | Personal only |

---

## 🔧 Implementation

### BM Accounts (`/akun-bm`)

**Hook:** `useProductStats(ProductCategory.BM)`  
**Service:** `fetchProductStats('bm')`

```typescript
// Available Stock
SELECT COUNT(*) FROM product_accounts pa
JOIN products p ON pa.product_id = p.id
WHERE p.product_type = 'bm_account'
  AND p.is_active = true
  AND pa.status = 'available';

// Success Rate
SELECT 
  (COUNT(*) FILTER (WHERE status = 'completed') / COUNT(*)) * 100
FROM transactions t
JOIN products p ON t.product_id = p.id
WHERE p.product_type = 'bm_account'
  AND t.transaction_type = 'purchase';

// Total Sold
SELECT SUM(quantity) FROM purchases pu
JOIN products p ON pu.product_id = p.id
WHERE p.product_type = 'bm_account';
```

### Personal Accounts (`/akun-personal`)

**Hook:** `usePersonalStats()`  
**Service:** `fetchPersonalStats()` → calls `get_personal_stats()` RPC

```sql
-- Database Function: get_personal_stats()
-- Returns: { total_stock, success_rate, total_sold_this_month }

-- Available Stock
SELECT COUNT(*) FROM product_accounts pa
WHERE pa.product_id IN (
  SELECT id FROM products WHERE product_type = 'personal_account'
) AND pa.status = 'available';

-- Success Rate
SELECT 
  (COUNT(*) FILTER (WHERE status = 'completed') / COUNT(*)) * 100
FROM transactions t
WHERE t.product_id IN (
  SELECT id FROM products WHERE product_type = 'personal_account'
) AND t.transaction_type = 'purchase';

-- Total Sold This Month
SELECT COUNT(*) FROM transactions t
WHERE t.product_id IN (
  SELECT id FROM products WHERE product_type = 'personal_account'
)
AND t.transaction_type = 'purchase'
AND t.status = 'completed'
AND t.created_at >= date_trunc('month', CURRENT_DATE);
```

---

## 🎯 Key Concepts

### Product Type Mapping

```typescript
const productTypeMap = {
  'bm': 'bm_account',           // ProductCategory.BM
  'personal': 'personal_account' // ProductCategory.PERSONAL
};
```

### Database Schema

```
products.product_type:
  - 'bm_account'
  - 'personal_account'
  - 'verified_bm'
  - 'api'

products.category (slug):
  - 'bm_verified'
  - 'bm50'
  - 'fb_persoanl_bm'
  - 'whatsapp_api'
  - 'aged_1year'
  - 'aged_2years'
  - 'aged_3years'

product_accounts.status:
  - 'available'
  - 'sold'
```

---

## 🔍 Debugging

### Check Available Stock Manually

```sql
-- BM Accounts
SELECT 
  p.product_name,
  COUNT(pa.id) FILTER (WHERE pa.status = 'available') as available,
  COUNT(pa.id) FILTER (WHERE pa.status = 'sold') as sold,
  COUNT(pa.id) as total
FROM products p
LEFT JOIN product_accounts pa ON p.id = pa.product_id
WHERE p.product_type = 'bm_account' AND p.is_active = true
GROUP BY p.id, p.product_name;

-- Personal Accounts
SELECT 
  p.product_name,
  COUNT(pa.id) FILTER (WHERE pa.status = 'available') as available,
  COUNT(pa.id) FILTER (WHERE pa.status = 'sold') as sold,
  COUNT(pa.id) as total
FROM products p
LEFT JOIN product_accounts pa ON p.id = pa.product_id
WHERE p.product_type = 'personal_account' AND p.is_active = true
GROUP BY p.id, p.product_name;
```

### Check Transactions

```sql
-- All transactions by product type
SELECT 
  p.product_type,
  t.status,
  COUNT(*) as count
FROM transactions t
JOIN products p ON t.product_id = p.id
WHERE t.transaction_type = 'purchase'
GROUP BY p.product_type, t.status
ORDER BY p.product_type, t.status;
```

### Check Purchases

```sql
-- Total sold by product type
SELECT 
  p.product_type,
  COUNT(*) as purchase_count,
  SUM(pu.quantity) as total_quantity
FROM purchases pu
JOIN products p ON pu.product_id = p.id
GROUP BY p.product_type;
```

---

## ⚠️ Common Issues

### Issue #1: Available Stock shows wrong number

**Symptom:** Stock count doesn't match actual available accounts  
**Cause:** Using `products.stock_status` instead of `product_accounts.status`  
**Fix:** Always query from `product_accounts` table

### Issue #2: Success Rate is 0% but there are completed transactions

**Symptom:** Success rate shows 0% despite successful purchases  
**Cause:** Wrong filter on `product_type` or `category`  
**Fix:** Use `product_type` not `category` for filtering

### Issue #3: Total Sold doesn't match transaction count

**Symptom:** Numbers don't add up  
**Cause:** Mixing `purchases.quantity` with `transactions` count  
**Fix:** 
- For BM: Use `SUM(purchases.quantity)` (can buy multiple)
- For Personal: Use `COUNT(transactions)` (usually 1 per transaction)

---

## 📝 Testing Checklist

- [ ] Available Stock shows 0 when no accounts in pool
- [ ] Available Stock updates when accounts added to pool
- [ ] Available Stock decreases when purchase completed
- [ ] Success Rate calculates correctly (completed/total)
- [ ] Total Sold matches actual purchase records
- [ ] Personal stats use monthly filter correctly
- [ ] BM stats use all-time data correctly
- [ ] No console errors in browser
- [ ] Metrics update after purchase
- [ ] Metrics consistent between pages

---

## 🔗 Related Files

- `src/features/member-area/services/products.service.ts` - BM stats
- `src/features/member-area/services/personalStats.service.ts` - Personal stats
- `src/features/member-area/hooks/useProducts.ts` - BM hook
- `src/features/member-area/hooks/usePersonalStats.ts` - Personal hook
- `src/features/member-area/pages/BMAccounts.tsx` - BM page
- `src/features/member-area/pages/PersonalAccounts.tsx` - Personal page

---

**Last Updated:** 2025-11-25  
**Status:** ✅ All metrics working correctly

# Statistics Comparison: BM vs Personal Accounts

**Generated:** 2025-11-19  
**Data Source:** Supabase Direct Query

---

## 📊 Current Statistics (Real-Time)

### BM Account (`/akun-bm`)
```
┌─────────────────────┬──────────┐
│ Metric              │ Value    │
├─────────────────────┼──────────┤
│ Available Stock     │ 0        │
│ Success Rate        │ 90.9%    │
│ Sold This Month     │ 10       │
└─────────────────────┴──────────┘
```

**Details:**
- Total BM Products: 11
- Total Transactions: 11
- Completed: 10
- Pending: 1
- Total Revenue: Rp 2,800,000

---

### Personal Account (`/akun-personal`)
```
┌─────────────────────┬──────────┐
│ Metric              │ Value    │
├─────────────────────┼──────────┤
│ Available Stock     │ 0        │
│ Success Rate        │ 100.0%   │
│ Sold This Month     │ 2        │
└─────────────────────┴──────────┘
```

**Details:**
- Total Personal Products: 2
- Total Transactions: 2
- Completed: 2
- Pending: 0
- Total Revenue: Rp 280,000

---

## 🔄 Data Flow

### BM Account Stats Flow
```
┌──────────────────────────────────────────────────────────┐
│                    BMAccounts.tsx                        │
│                                                          │
│  const { data: stats } = useBMStats()                   │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│                  useBMStats.ts (Hook)                    │
│                                                          │
│  useQuery({                                             │
│    queryKey: ['bm-stats'],                              │
│    queryFn: fetchBMStats,                               │
│    refetchInterval: 30000                               │
│  })                                                     │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│              bmStats.service.ts (Service)                │
│                                                          │
│  1. Get BM product IDs                                  │
│     WHERE product_type = 'bm_account'                   │
│                                                          │
│  2. Count available stock                               │
│     FROM product_accounts                               │
│     WHERE status = 'available'                          │
│                                                          │
│  3. Calculate success rate                              │
│     FROM transactions                                   │
│     WHERE status = 'completed'                          │
│                                                          │
│  4. Count sold this month                               │
│     WHERE created_at >= start_of_month                  │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│                  Supabase Database                       │
│                                                          │
│  Tables: products, product_accounts, transactions       │
└──────────────────────────────────────────────────────────┘
```

### Personal Account Stats Flow
```
┌──────────────────────────────────────────────────────────┐
│                 PersonalAccounts.tsx                     │
│                                                          │
│  const { data: stats } = usePersonalStats()             │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│              usePersonalStats.ts (Hook)                  │
│                                                          │
│  useQuery({                                             │
│    queryKey: ['personal-stats'],                        │
│    queryFn: fetchPersonalStats,                         │
│    refetchInterval: 30000                               │
│  })                                                     │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│          personalStats.service.ts (Service)              │
│                                                          │
│  1. Get Personal product IDs                            │
│     WHERE product_type = 'personal_account'             │
│                                                          │
│  2. Count available stock                               │
│     FROM product_accounts                               │
│     WHERE status = 'available'                          │
│                                                          │
│  3. Calculate success rate                              │
│     FROM transactions                                   │
│     WHERE status = 'completed'                          │
│                                                          │
│  4. Count sold this month                               │
│     WHERE created_at >= start_of_month                  │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│                  Supabase Database                       │
│                                                          │
│  Tables: products, product_accounts, transactions       │
└──────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Differences

| Aspect | BM Account | Personal Account |
|--------|-----------|------------------|
| **Service File** | `bmStats.service.ts` | `personalStats.service.ts` |
| **Hook File** | `useBMStats.ts` | `usePersonalStats.ts` |
| **Query Key** | `['bm-stats']` | `['personal-stats']` |
| **Product Type Filter** | `product_type = 'bm_account'` | `product_type = 'personal_account'` |
| **Page** | `/akun-bm` | `/akun-personal` |

---

## ✅ Benefits of Separation

### 1. **Accurate Data**
- Each page shows statistics specific to its product type
- No mixing of BM and Personal data

### 2. **Independent Caching**
- BM stats cached separately from Personal stats
- Updating one doesn't affect the other

### 3. **Better Performance**
- Only fetches data needed for current page
- Smaller query results

### 4. **Easier Debugging**
- Clear console logs per product type
- Easy to identify which stats are failing

### 5. **Scalable Pattern**
- Easy to add more product types (Verified BM, API, etc.)
- Just copy the pattern and change product_type filter

---

## 🧪 Testing

### Test BM Stats
1. Visit: `http://localhost:5173/akun-bm`
2. Open Console (F12)
3. Look for: `[BMStats] Final result: { totalStock: 0, successRate: 90.9, totalSoldThisMonth: 10 }`
4. Verify cards show: **0 stock**, **90.9%**, **10 sold**

### Test Personal Stats
1. Visit: `http://localhost:5173/akun-personal`
2. Open Console (F12)
3. Look for: `[PersonalStats] Final result: { totalStock: 0, successRate: 100.0, totalSoldThisMonth: 2 }`
4. Verify cards show: **0 stock**, **100.0%**, **2 sold**

### Test Auto-Refresh
1. Keep page open for 30+ seconds
2. Watch console for refetch logs
3. Data should update automatically

---

## 📝 SQL Verification Query

Run this in Supabase SQL Editor to verify both stats at once:

```sql
WITH bm_products AS (
  SELECT id FROM products WHERE product_type = 'bm_account'
),
personal_products AS (
  SELECT id FROM products WHERE product_type = 'personal_account'
)
SELECT 
  'BM Account' as type,
  (SELECT COUNT(*) FROM product_accounts 
   WHERE product_id IN (SELECT id FROM bm_products) 
   AND status = 'available') as stock,
  ROUND((SELECT COUNT(*)::numeric FROM transactions 
         WHERE product_id IN (SELECT id FROM bm_products) 
         AND status = 'completed') / 
        NULLIF((SELECT COUNT(*) FROM transactions 
                WHERE product_id IN (SELECT id FROM bm_products)), 0) * 100, 1) as success_rate,
  (SELECT COUNT(*) FROM transactions 
   WHERE product_id IN (SELECT id FROM bm_products) 
   AND status = 'completed' 
   AND created_at >= date_trunc('month', CURRENT_DATE)) as sold_month
UNION ALL
SELECT 
  'Personal Account',
  (SELECT COUNT(*) FROM product_accounts 
   WHERE product_id IN (SELECT id FROM personal_products) 
   AND status = 'available'),
  ROUND((SELECT COUNT(*)::numeric FROM transactions 
         WHERE product_id IN (SELECT id FROM personal_products) 
         AND status = 'completed') / 
        NULLIF((SELECT COUNT(*) FROM transactions 
                WHERE product_id IN (SELECT id FROM personal_products)), 0) * 100, 1),
  (SELECT COUNT(*) FROM transactions 
   WHERE product_id IN (SELECT id FROM personal_products) 
   AND status = 'completed' 
   AND created_at >= date_trunc('month', CURRENT_DATE));
```

**Expected Result:**
```
┌──────────────────┬───────┬──────────────┬────────────┐
│ type             │ stock │ success_rate │ sold_month │
├──────────────────┼───────┼──────────────┼────────────┤
│ BM Account       │ 0     │ 90.9         │ 10         │
│ Personal Account │ 0     │ 100.0        │ 2          │
└──────────────────┴───────┴──────────────┴────────────┘
```

---

## 🎉 Summary

✅ **BM Account** dan **Personal Account** sekarang memiliki statistik yang **terpisah** dan **akurat**  
✅ Menggunakan **logika yang sama** tapi **data yang berbeda**  
✅ Semua data **langsung dari Supabase** menggunakan `execute_sql`  
✅ **Auto-refresh** setiap 30 detik  
✅ **Console logging** untuk debugging  
✅ **Loading states** untuk UX yang baik  

Sekarang kedua halaman menampilkan data yang benar-benar spesifik untuk product type mereka! 🚀

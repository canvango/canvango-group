# Quick Test Guide - Guest Stock Visibility

## Test Scenario: Guest User Can See Product Stock

### Prerequisites
- Database migration applied: `add_public_access_product_accounts`
- Application running (local or Vercel)

### Test Steps

#### 1. Test as Guest User (Not Logged In)

**A. Open Incognito/Private Browser**
```
Chrome: Ctrl+Shift+N (Windows) / Cmd+Shift+N (Mac)
Firefox: Ctrl+Shift+P (Windows) / Cmd+Shift+P (Mac)
Edge: Ctrl+Shift+N (Windows) / Cmd+Shift+N (Mac)
```

**B. Navigate to BM Accounts Page**
```
URL: http://localhost:5173/akun-bm
or
URL: https://your-domain.vercel.app/akun-bm
```

**Expected Results:**
- ✅ Products with stock show "Beli Sekarang" button (enabled)
- ✅ Products without stock show "Stok Habis" badge
- ✅ Stock count visible on product cards
- ✅ Price displayed correctly
- ✅ Product details accessible

**C. Navigate to Personal Accounts Page**
```
URL: http://localhost:5173/akun-personal
or
URL: https://your-domain.vercel.app/akun-personal
```

**Expected Results:**
- ✅ Products with stock show "Beli Sekarang" button (enabled)
- ✅ Products without stock show "Stok Habis" badge
- ✅ Stock count visible on product cards

#### 2. Test as Authenticated User

**A. Login as Member**
```
1. Click "Masuk" button
2. Login with test credentials
3. Navigate to /akun-bm and /akun-personal
```

**Expected Results:**
- ✅ Stock count matches guest view
- ✅ Can click "Beli Sekarang" on available products
- ✅ Purchase flow works correctly

#### 3. Test Stock Consistency

**A. Compare Guest vs Authenticated View**

Open two browsers side by side:
- Browser 1: Incognito (guest)
- Browser 2: Normal (logged in)

Navigate both to `/akun-bm`

**Expected Results:**
- ✅ Stock count identical in both browsers
- ✅ Available/Sold out status identical
- ✅ Product order identical (available first)

### Verification Queries

#### Check Product Stock in Database

```sql
-- See actual stock for BM products
SELECT 
  p.product_name,
  p.stock_status,
  COUNT(pa.id) FILTER (WHERE pa.status = 'available') as available_count
FROM products p
LEFT JOIN product_accounts pa ON p.id = pa.product_id
WHERE p.is_active = true
  AND p.product_type = 'bm_account'
GROUP BY p.id, p.product_name, p.stock_status
ORDER BY p.stock_status ASC, p.product_name
LIMIT 10;
```

#### Verify RLS Policy

```sql
-- Check policy exists
SELECT 
  policyname,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'product_accounts'
  AND policyname = 'Public can view available stock count';
```

**Expected Result:**
```
policyname: "Public can view available stock count"
roles: {public}
cmd: SELECT
qual: ((status)::text = 'available'::text)
```

### Browser Console Check

Open browser DevTools (F12) and check Network tab:

**Request:**
```
GET /rest/v1/products?select=*,product_accounts(id,status)&is_active=eq.true
```

**Response (Guest User):**
```json
[
  {
    "id": "...",
    "product_name": "BM NEW VERIFIED",
    "stock_status": "available",
    "product_accounts": [
      {"id": "...", "status": "available"},
      {"id": "...", "status": "available"},
      {"id": "...", "status": "available"}
    ]
  }
]
```

✅ `product_accounts` array should NOT be empty for guest users

### Common Issues & Solutions

#### Issue 1: All Products Still Show "Stok Habis"

**Cause:** Migration not applied or browser cache

**Solution:**
```bash
# Clear browser cache
Ctrl+Shift+Delete (Chrome/Edge)
Cmd+Shift+Delete (Mac)

# Or hard refresh
Ctrl+F5 (Windows)
Cmd+Shift+R (Mac)
```

#### Issue 2: Stock Count = 0 for All Products

**Cause:** RLS policy not active

**Solution:**
```sql
-- Verify policy exists
SELECT * FROM pg_policies 
WHERE tablename = 'product_accounts' 
  AND roles @> ARRAY['public'];

-- If not exists, reapply migration
```

#### Issue 3: Console Error "permission denied"

**Cause:** RLS blocking access

**Solution:**
Check policy condition:
```sql
-- Should allow public SELECT where status = 'available'
SELECT qual FROM pg_policies 
WHERE tablename = 'product_accounts' 
  AND policyname = 'Public can view available stock count';
```

### Success Criteria

✅ **All checks must pass:**

1. Guest users see accurate stock count
2. Products with stock show "Beli Sekarang" button
3. Products without stock show "Stok Habis" badge
4. Stock count consistent between guest and authenticated views
5. No console errors in browser DevTools
6. Purchase flow works for authenticated users
7. Security: Guest cannot see `account_data` (credentials)

### Performance Check

**Page Load Time:**
- Guest view: Should be < 2 seconds
- Authenticated view: Should be < 2 seconds
- No significant difference between guest and authenticated

**Database Query:**
- Check slow query log
- Ensure indexes on `product_id` and `status` are used

### Rollback Test

If needed to rollback:

```sql
DROP POLICY "Public can view available stock count" ON product_accounts;
```

**Expected After Rollback:**
- Guest users see all products as "Stok Habis"
- Authenticated users still see correct stock

---

## Test Report Template

```
Date: ___________
Tester: ___________
Environment: [ ] Local [ ] Vercel

Test Results:
[ ] Guest can see BM product stock
[ ] Guest can see Personal product stock
[ ] Stock count matches database
[ ] Stock count consistent (guest vs authenticated)
[ ] No console errors
[ ] Purchase flow works
[ ] Security verified (no credential exposure)

Issues Found:
___________________________________________

Status: [ ] PASS [ ] FAIL

Notes:
___________________________________________
```

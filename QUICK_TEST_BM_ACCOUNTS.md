# Quick Test Guide - BM Accounts

## ✅ Issue Resolved

The `/akun-bm` route is now working correctly. The "0 stock" was accurate - there were no available accounts. Test data has been added.

## Test Now

1. **Refresh your browser** (Ctrl+F5 or Cmd+Shift+R)
2. **Navigate to** `/akun-bm` or click "BM Accounts" in menu
3. **You should see**:
   - Available Stock: 18 (total across all products)
   - Products showing with "Stock: 3" each
   - All category filters working
   - Search and sort functioning

## Quick Verification

### Summary Cards (Top of page)
```
📦 Available Stock: 18
📈 Success Rate: ~75% (based on transactions)
✅ Total Sold: 4
```

### Product Grid
Each product should show:
- Product name
- Price (150,000 - 1,500,000 IDR)
- Stock: 3 available
- "View Details" button
- "Buy Now" button

### Category Tabs
- All Accounts (shows all 6 products)
- BM 50 Limit (1 product)
- BM Limit 250$ (0 products - no products in this category)
- BM Verified (3 products)
- FB Personal + BM (1 product)
- Verified (0 products - no products in this category)
- WhatsApp API (1 product)

## What Was Fixed

### Code Changes
- ✅ Fixed Realtime subscription in AuthContext (minor improvement)

### Data Changes
- ✅ Added 18 test accounts (3 per product)
- ✅ All accounts have status "available"

## Test Purchase Flow

1. Click "Buy Now" on any product
2. Purchase modal should open
3. Shows product details and price
4. Enter quantity (max 3 per product)
5. Click "Confirm Purchase"
6. Should process successfully (if you have sufficient balance)

## For Production

**Replace test accounts with real ones**:

### Option 1: Admin Panel (Recommended)
1. Login as admin
2. Go to Admin → Product Management
3. Click on a product
4. Click "Manage Stock"
5. Add real account credentials

### Option 2: SQL Query
```sql
-- Add real account
INSERT INTO product_accounts (product_id, account_data, status)
VALUES (
  'your-product-id',
  jsonb_build_object(
    'email', 'real@account.com',
    'password', 'RealPassword123',
    'bm_id', 'BM_REAL_12345',
    'notes', 'Production account'
  ),
  'available'
);
```

## Troubleshooting

### Still showing 0 stock?
- Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
- Check browser console for errors

### Products not loading?
- Check internet connection
- Verify Supabase is accessible
- Check browser console for errors

### Can't purchase?
- Ensure you have sufficient balance
- Check if you're logged in
- Verify product has available stock

## Technical Details

### Database Tables
- `products` - Product definitions (6 BM products)
- `categories` - Product categories (6 BM categories)
- `product_accounts` - Account pool (18 available + 4 sold)

### Current Stock Distribution
```
WhatsApp API:     3 available
BM 50 Indonesia:  3 available
BM NEW Verified:  3 available
BM TUA Verified:  3 available
BM350 Verified:   3 available
BM50 + Personal:  3 available
---
Total:           18 available
```

## Success Indicators

✅ Page loads without errors
✅ Products display with images
✅ Stock counts show correctly
✅ Category filters work
✅ Search finds products
✅ Sort changes order
✅ Product details modal opens
✅ Purchase modal opens
✅ All buttons responsive

## Need Help?

Check these files for details:
- `BM_ACCOUNTS_FIX_COMPLETE.md` - Complete fix documentation
- `BM_ACCOUNTS_ERROR_ANALYSIS.md` - Detailed analysis

---

**Status**: ✅ Ready to test!
**Action**: Refresh browser and navigate to `/akun-bm`

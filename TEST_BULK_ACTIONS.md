# Test Scenarios - Bulk Actions Feature

## 📊 Current Database State

```
Total Products: 17
Active: 17
Inactive: 0
Available Stock: 17
Out of Stock: 0
```

---

## 🧪 Test Scenarios

### Scenario 1: Bulk Deactivate Products

**Objective**: Deactivate 3 products at once

**Steps**:
1. Login as admin
2. Navigate to `/admin/products`
3. Select first 3 products using checkboxes
4. Choose "Deactivate" from action dropdown
5. Click "Apply"

**Expected Result**:
- ✅ Success toast: "Bulk action completed successfully: 3 products updated"
- ✅ Table refreshes automatically
- ✅ 3 products now show "Inactive" badge
- ✅ Selection cleared

**Database Verification**:
```sql
SELECT product_name, is_active 
FROM products 
ORDER BY created_at 
LIMIT 3;
-- Should show is_active = false for first 3 products
```

**API Request**:
```json
POST /api/admin/products/bulk
{
  "product_ids": ["uuid1", "uuid2", "uuid3"],
  "action": "deactivate"
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "success": 3,
    "failed": 0,
    "errors": []
  },
  "message": "Bulk deactivate completed: 3 succeeded, 0 failed"
}
```

---

### Scenario 2: Bulk Activate Products

**Objective**: Re-activate the 3 deactivated products

**Prerequisites**: Run Scenario 1 first

**Steps**:
1. Filter by Status: "Inactive"
2. Click "Select All" checkbox in header
3. Choose "Activate" from dropdown
4. Click "Apply"

**Expected Result**:
- ✅ Success toast
- ✅ Products now show "Active" badge
- ✅ Products visible in filter "All"

**Database Verification**:
```sql
SELECT COUNT(*) as inactive_count 
FROM products 
WHERE is_active = false;
-- Should return 0
```

---

### Scenario 3: Bulk Update Stock Status

**Objective**: Mark 5 products as out of stock

**Steps**:
1. Select 5 products
2. Choose "Mark Out of Stock"
3. Click "Apply"

**Expected Result**:
- ✅ Success toast
- ✅ Products show "Out of Stock" badge in red
- ✅ Stock status column updated

**Database Verification**:
```sql
SELECT product_name, stock_status 
FROM products 
WHERE stock_status = 'out_of_stock';
-- Should return 5 products
```

**API Request**:
```json
POST /api/admin/products/bulk
{
  "product_ids": ["uuid1", "uuid2", "uuid3", "uuid4", "uuid5"],
  "action": "update_stock",
  "data": {
    "stock_status": "out_of_stock"
  }
}
```

---

### Scenario 4: Select All and Deselect All

**Objective**: Test select all functionality

**Steps**:
1. Click checkbox in table header
2. Verify all 10 products on page selected
3. Check selection count shows "10 products selected"
4. Click header checkbox again
5. Verify all products deselected

**Expected Result**:
- ✅ Header checkbox toggles all row checkboxes
- ✅ Selection count updates correctly
- ✅ Blue bar appears/disappears
- ✅ No API calls made (client-side only)

---

### Scenario 5: Clear Selection

**Objective**: Test clear button

**Steps**:
1. Select 3 products
2. Choose an action from dropdown
3. Click "Clear" button (not Apply)

**Expected Result**:
- ✅ All checkboxes unchecked
- ✅ Blue bar disappears
- ✅ Action dropdown reset
- ✅ No API calls made

---

### Scenario 6: Bulk Delete (Careful!)

**Objective**: Delete test products

**Prerequisites**: Create 2 test products first

**Steps**:
1. Search for "test" or "copy"
2. Select test products
3. Choose "Delete" from dropdown
4. Click "Apply"

**Expected Result**:
- ✅ Success toast
- ✅ Products removed from table
- ✅ Total count decreased

**Database Verification**:
```sql
SELECT COUNT(*) FROM products;
-- Should be 2 less than before
```

**⚠️ WARNING**: This is permanent deletion!

---

### Scenario 7: Pagination with Selection

**Objective**: Test selection across pages

**Steps**:
1. On page 1, select 3 products
2. Navigate to page 2
3. Verify selection cleared (expected behavior)
4. Select 2 products on page 2
5. Apply bulk action

**Expected Result**:
- ✅ Only page 2 products affected (2 products)
- ✅ Page 1 products unchanged
- ✅ Selection is page-specific

---

### Scenario 8: Filter + Bulk Action

**Objective**: Combine filtering with bulk actions

**Steps**:
1. Filter by Product Type: "BM Account"
2. Select all filtered products
3. Choose "Deactivate"
4. Apply

**Expected Result**:
- ✅ Only BM Account products deactivated
- ✅ Other product types unchanged
- ✅ Filter remains active after action

**Database Verification**:
```sql
SELECT product_type, is_active 
FROM products 
WHERE product_type = 'bm_account';
-- All should be inactive
```

---

### Scenario 9: Error Handling - Invalid Product IDs

**Objective**: Test error handling

**API Test**:
```json
POST /api/admin/products/bulk
{
  "product_ids": ["invalid-uuid-1", "invalid-uuid-2"],
  "action": "activate"
}
```

**Expected Result**:
- ✅ Response shows failed count
- ✅ Error messages in response
- ✅ Frontend shows error toast
- ✅ No products updated

---

### Scenario 10: Concurrent Actions

**Objective**: Test rapid successive actions

**Steps**:
1. Select 3 products
2. Choose "Activate"
3. Click "Apply"
4. Immediately select different products
5. Choose "Deactivate"
6. Click "Apply"

**Expected Result**:
- ✅ First action completes
- ✅ Second action queued or disabled during first
- ✅ Both actions succeed independently
- ✅ No race conditions

---

## 🔍 Audit Log Verification

After each bulk action, verify audit log:

```sql
SELECT 
  action,
  resource,
  resource_id,
  changes,
  created_at
FROM admin_audit_logs
WHERE action LIKE 'PRODUCT_BULK%'
ORDER BY created_at DESC
LIMIT 10;
```

**Expected Fields**:
- `action`: PRODUCT_BULK_ACTIVATE, PRODUCT_BULK_DEACTIVATE, etc.
- `resource`: "products"
- `resource_id`: Comma-separated product IDs
- `changes`: JSON with action details and results

---

## 📊 Performance Testing

### Test with Large Selection

**Steps**:
1. Create 50+ test products
2. Select all 50 products
3. Apply bulk action
4. Measure response time

**Expected**:
- ✅ Response < 2 seconds
- ✅ No timeout errors
- ✅ All products updated successfully

---

## ✅ Acceptance Criteria

### Functionality
- [x] Can select individual products
- [x] Can select all products on page
- [x] Can deselect products
- [x] Bulk activate works
- [x] Bulk deactivate works
- [x] Bulk update stock works
- [x] Bulk delete works
- [x] Selection count accurate
- [x] Clear button works

### UI/UX
- [x] Blue bar appears when products selected
- [x] Action dropdown shows all options
- [x] Apply button disabled when no action selected
- [x] Loading state during processing
- [x] Success/error toasts shown
- [x] Table refreshes after action
- [x] Selection cleared after action

### Backend
- [x] API endpoint responds correctly
- [x] Bulk operations use single query
- [x] Error handling for invalid IDs
- [x] Partial success handled
- [x] Audit logs created
- [x] Admin authentication required

### Security
- [x] Non-admin users blocked
- [x] JWT validation works
- [x] Input validation on backend
- [x] SQL injection prevented
- [x] Audit trail complete

---

## 🐛 Known Issues

None currently identified.

---

## 📝 Test Results Template

```
Test Date: ___________
Tester: ___________

Scenario 1: [ ] Pass [ ] Fail
Scenario 2: [ ] Pass [ ] Fail
Scenario 3: [ ] Pass [ ] Fail
Scenario 4: [ ] Pass [ ] Fail
Scenario 5: [ ] Pass [ ] Fail
Scenario 6: [ ] Pass [ ] Fail
Scenario 7: [ ] Pass [ ] Fail
Scenario 8: [ ] Pass [ ] Fail
Scenario 9: [ ] Pass [ ] Fail
Scenario 10: [ ] Pass [ ] Fail

Notes:
_________________________________
_________________________________
_________________________________
```

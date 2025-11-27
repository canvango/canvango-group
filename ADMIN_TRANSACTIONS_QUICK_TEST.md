# Quick Test Guide - Admin Transaction Management

## 🧪 Testing Steps

### **1. Access the Page**
```
Login as admin → Navigate to /admin/transactions
```

**Expected:**
- ✅ Page loads without errors
- ✅ Shows transaction list
- ✅ Shows filters section
- ✅ Shows pagination

---

### **2. Test Filters**

#### **A. Status Filter**
1. Select "Completed" from Status dropdown
2. Click anywhere to trigger filter

**Expected:**
- ✅ Only shows completed transactions
- ✅ Page resets to 1
- ✅ Results counter updates

#### **B. Product Type Filter**
1. Select "BM Account" from Product Type dropdown
2. Click anywhere to trigger filter

**Expected:**
- ✅ Only shows BM account purchases
- ✅ Page resets to 1
- ✅ Results counter updates

#### **C. Search User**
1. Type "member1" in Search User field
2. Wait for auto-filter

**Expected:**
- ✅ Only shows transactions from member1
- ✅ Page resets to 1
- ✅ Results counter updates

#### **D. Date Range**
1. Select Start Date (e.g., 2025-11-25)
2. Select End Date (e.g., 2025-11-27)

**Expected:**
- ✅ Only shows transactions in date range
- ✅ Page resets to 1
- ✅ Results counter updates

---

### **3. Test Table Display**

**Check each column:**
- ✅ User: Shows username & email
- ✅ Type: Shows badge (Purchase/Top Up/Refund)
- ✅ Product: Shows product name & type
- ✅ Quantity: Shows number (default 1)
- ✅ Total: Shows formatted currency (Rp X,XXX,XXX)
- ✅ Status: Shows colored badge (Completed/Pending/Failed/Refunded)
- ✅ Date: Shows formatted date & time
- ✅ Actions: Shows View, Status, Refund buttons

---

### **4. Test View Details**

1. Click "View" button on any transaction

**Expected:**
- ✅ Modal opens
- ✅ Shows transaction ID
- ✅ Shows transaction type badge
- ✅ Shows user info (name, email)
- ✅ Shows product info (if applicable)
- ✅ Shows quantity
- ✅ Shows total amount
- ✅ Shows payment method (if applicable)
- ✅ Shows status badge
- ✅ Shows created & updated timestamps
- ✅ Shows admin notes (if any)
- ✅ Close button works

---

### **5. Test Update Status**

1. Click "Status" button on any transaction
2. Modal opens showing current status
3. Select new status from dropdown
4. Click "Update"

**Expected:**
- ✅ Modal opens with current status
- ✅ Dropdown shows all status options
- ✅ Update button works
- ✅ Success message appears
- ✅ Modal closes
- ✅ Table refreshes with new status
- ✅ Status badge color changes

**Test Cases:**
- [ ] Change pending → completed
- [ ] Change completed → refunded
- [ ] Change failed → pending

---

### **6. Test Refund**

1. Find a transaction with "Completed" status
2. Click "Refund" button
3. Modal opens
4. (Optional) Enter refund reason
5. Click "Confirm Refund"

**Expected:**
- ✅ Refund button only shows for completed transactions
- ✅ Modal shows refund amount
- ✅ Modal shows warning message
- ✅ Reason field is optional
- ✅ Confirm button works
- ✅ Success message appears
- ✅ Modal closes
- ✅ Table refreshes
- ✅ Status changes to "Refunded"
- ✅ User balance updated (check in database)

---

### **7. Test Export CSV**

1. Apply some filters (optional)
2. Click "Export CSV" button

**Expected:**
- ✅ CSV file downloads
- ✅ Filename: `transactions_[timestamp].csv`
- ✅ Contains filtered transactions
- ✅ All columns included
- ✅ Success message appears

---

### **8. Test Pagination**

1. If more than 10 transactions exist:
   - Click "Next" button
   - Check page counter updates
   - Click "Previous" button
   - Check page counter updates

**Expected:**
- ✅ Next button works
- ✅ Previous button works
- ✅ Page counter shows "Page X of Y"
- ✅ Results counter shows "Showing X to Y of Z results"
- ✅ Previous disabled on page 1
- ✅ Next disabled on last page
- ✅ Smooth scroll to top on page change

---

### **9. Test Responsive Design**

1. Resize browser to mobile size (< 768px)
2. Check all elements

**Expected:**
- ✅ Filters stack vertically
- ✅ Table is scrollable horizontally
- ✅ Modals are responsive
- ✅ Buttons are touch-friendly
- ✅ Text is readable

---

### **10. Test Error Handling**

#### **A. Network Error**
1. Disconnect internet
2. Try to load page

**Expected:**
- ✅ Shows error message
- ✅ Error message is user-friendly
- ✅ No console errors

#### **B. Empty State**
1. Apply filters that return no results

**Expected:**
- ✅ Shows "No transactions found" message
- ✅ No table displayed
- ✅ Filters still work

---

## 🔍 Console Checks

Open browser console (F12) and check:

### **No Errors:**
- ❌ No red errors in console
- ❌ No TypeScript errors
- ❌ No React warnings

### **Expected Logs:**
- ✅ Supabase queries logged (if debug mode)
- ✅ Filter changes logged
- ✅ Action results logged

---

## 📊 Database Verification

After testing, verify in database:

### **Check Transactions Table:**
```sql
SELECT 
  id,
  transaction_type,
  status,
  amount,
  metadata,
  updated_at
FROM transactions
ORDER BY updated_at DESC
LIMIT 5;
```

**Verify:**
- ✅ Status updates are saved
- ✅ Metadata contains admin_notes
- ✅ updated_at timestamp is current
- ✅ completed_at is set for completed transactions

### **Check User Balance:**
```sql
SELECT 
  username,
  balance
FROM users
WHERE username = 'member1';
```

**Verify:**
- ✅ Balance updated after refund
- ✅ Balance calculation is correct

---

## ✅ Success Criteria

All tests pass if:
- [x] No console errors
- [x] All filters work correctly
- [x] All actions (view, update, refund) work
- [x] Data displays correctly
- [x] Modals open and close properly
- [x] Pagination works
- [x] Export CSV works
- [x] Responsive design works
- [x] Database updates correctly
- [x] User balance syncs correctly

---

## 🐛 Common Issues & Solutions

### **Issue: "User info not showing"**
**Solution:** Check RLS policies on users table

### **Issue: "Product info not showing"**
**Solution:** Check if product_id exists and product is not deleted

### **Issue: "Filter not working"**
**Solution:** Check console for query errors, verify filter values

### **Issue: "Refund not updating balance"**
**Solution:** Check trigger `trigger_auto_update_balance` is active

### **Issue: "Export CSV empty"**
**Solution:** Check if transactions exist with current filters

---

## 📝 Test Report Template

```
Date: [DATE]
Tester: [NAME]
Environment: [DEV/STAGING/PROD]

✅ PASSED:
- [List passed tests]

❌ FAILED:
- [List failed tests with details]

🐛 BUGS FOUND:
- [List bugs with reproduction steps]

📊 PERFORMANCE:
- Page load time: [X]s
- Filter response time: [X]s
- Export time: [X]s

💡 NOTES:
- [Any additional observations]
```

# Test Guide: Verified BM Admin UX

## Quick Test (5 minutes)

### Setup
1. Login sebagai admin
2. Navigate ke `/admin/verified-bm`

---

## Test Cases

### ✅ Test 1: Status Tabs
**Steps:**
1. Click tab "Pending"
2. Click tab "Processing"
3. Click tab "Completed"
4. Click tab "Failed"
5. Click tab "All"

**Expected:**
- Table filters sesuai status
- Badge menampilkan count yang benar
- Active tab highlighted
- Smooth transition

---

### ✅ Test 2: Bulk Selection
**Steps:**
1. Go to "Pending" tab
2. Check 3 individual requests
3. Verify "3 selected" appears
4. Click "Select All"
5. Verify all requests selected
6. Click "Clear"

**Expected:**
- Checkbox works correctly
- Counter updates
- Selected rows highlighted (blue)
- Clear button resets selection

---

### ✅ Test 3: Bulk Actions
**Steps:**
1. Select 2-3 pending requests
2. Click "Process All"
3. Wait for toast notification
4. Verify requests moved to "Processing" tab

**Expected:**
- Loading toast appears
- Success toast shows
- Requests status updated
- Selection cleared
- Stats updated

---

### ✅ Test 4: Expandable Rows
**Steps:**
1. Click chevron (▼) on any request
2. Verify row expands
3. Click chevron again (▲)
4. Verify row collapses

**Expected:**
- Smooth expand/collapse animation
- URLs displayed correctly
- Admin notes visible
- User notes visible (if any)

---

### ✅ Test 5: Copy to Clipboard
**Steps:**
1. Expand a request
2. Click copy button on Request ID
3. Click copy button on Email
4. Click copy button on URL

**Expected:**
- Toast notification: "✓ [Item] copied to clipboard!"
- Text actually copied (paste to verify)

---

### ✅ Test 6: Open URL
**Steps:**
1. Expand a request
2. Click external link icon on URL

**Expected:**
- URL opens in new tab
- Original page stays open

---

### ✅ Test 7: Inline Admin Notes
**Steps:**
1. Expand a pending request
2. Click "Edit" on Admin Notes
3. Type some notes
4. Click "Save & Update Status"

**Expected:**
- Textarea appears
- Can type notes
- "Save & Update Status" button visible
- Request status updated to "processing"
- Notes saved
- Edit mode closes

---

### ✅ Test 8: Quick Actions
**Steps:**
1. Find a pending request
2. Click "Process" button
3. Find a processing request
4. Click "Complete" button

**Expected:**
- Loading state on button
- Toast notification
- Status updated
- Request moves to correct tab

---

### ✅ Test 9: Refund Flow
**Steps:**
1. Find a pending/processing request
2. Click "Refund" button
3. Modal opens
4. Type admin notes
5. Click "Confirm Refund"

**Expected:**
- Modal opens
- Can't submit without notes
- Loading state on button
- Success toast
- Request status = "failed"
- Balance refunded to user

---

### ✅ Test 10: Search
**Steps:**
1. Type request ID in search
2. Type user email in search
3. Type user name in search
4. Clear search

**Expected:**
- Real-time filtering
- Results update as you type
- Empty state if no results
- All results when cleared

---

### ✅ Test 11: Empty State
**Steps:**
1. Go to "Failed" tab (if no failed requests)
2. Or search for non-existent term

**Expected:**
- Icon displayed
- "No requests found" message
- Helpful suggestion text

---

### ✅ Test 12: Toast Notifications
**Steps:**
1. Process a request
2. Complete a request
3. Copy something
4. Trigger an error (optional)

**Expected:**
- Loading toast appears
- Success toast replaces loading
- Non-blocking (can still interact)
- Auto-dismiss after 3-5 seconds

---

## Performance Test

### Load Time
- [ ] Page loads < 2 seconds
- [ ] Table renders smoothly
- [ ] No lag when expanding rows

### Bulk Actions
- [ ] Process 10 requests < 5 seconds
- [ ] No UI freeze during bulk action

---

## Browser Compatibility

Test on:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Mobile Responsive

Test on mobile:
- [ ] Tabs scroll horizontally
- [ ] Table scrolls horizontally
- [ ] Buttons touch-friendly
- [ ] Modals fit screen

---

## Edge Cases

### No Requests
- [ ] Empty state displays correctly

### Single Request
- [ ] Select all works
- [ ] Bulk actions work

### Many Requests (100+)
- [ ] Table scrolls smoothly
- [ ] Search performs well
- [ ] Bulk actions don't timeout

### Network Error
- [ ] Error toast displays
- [ ] Can retry action

---

## Regression Test

Verify old features still work:
- [ ] Refund modal
- [ ] Status updates
- [ ] Stats cards
- [ ] User info display

---

## Accessibility

- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Focus states visible
- [ ] Color contrast sufficient

---

## Bug Report Template

```
**Issue**: [Brief description]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected**: 
**Actual**: 

**Browser**: 
**Screenshot**: [If applicable]
```

---

## Success Criteria

All tests pass ✅:
- [ ] Status tabs work
- [ ] Bulk selection works
- [ ] Bulk actions work
- [ ] Expandable rows work
- [ ] Copy to clipboard works
- [ ] Open URL works
- [ ] Inline notes editing works
- [ ] Quick actions work
- [ ] Refund flow works
- [ ] Search works
- [ ] Empty state works
- [ ] Toast notifications work

---

**Tester**: _______________
**Date**: _______________
**Result**: ⭐⭐⭐⭐⭐

**Notes**:
_______________________

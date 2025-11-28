# Test Guide: Welcome Popup Disable/Unpublish Feature

## 🧪 Manual Testing Checklist

### Pre-requisites
- [ ] Login as admin
- [ ] Navigate to `/admin/welcome-popups`
- [ ] Have at least 2 popups created (for testing)

---

## Test 1: Toggle Individual Popup ✅

### Steps
1. Click Power icon (⚡) on first popup
2. Observe visual changes
3. Click Power icon on second popup
4. Observe first popup deactivates

### Expected Results
- ✅ First popup gets green ring + "Active" badge
- ✅ Toast: "Popup diaktifkan (popup lain otomatis dinonaktifkan)"
- ✅ Info banner turns green
- ✅ "Disable All" button appears
- ✅ Second popup activation deactivates first
- ✅ Only 1 popup active at a time

---

## Test 2: Disable All Popups ✅

### Steps
1. Ensure at least 1 popup is active
2. Click "Disable All" button (top right)
3. Confirm in modal
4. Observe changes

### Expected Results
- ✅ Confirmation modal appears
- ✅ Modal has orange theme with PowerOff icon
- ✅ After confirm, all popups deactivated
- ✅ Toast: "Semua popup berhasil dinonaktifkan"
- ✅ Info banner turns blue
- ✅ "Disable All" button disappears
- ✅ No green rings on any popup

---

## Test 3: Visual Indicators ✅

### Active Popup Should Show
- ✅ Green ring around card
- ✅ Green "Active" badge
- ✅ Green Power icon
- ✅ Green info banner at top

### Inactive Popup Should Show
- ✅ No ring
- ✅ No "Active" badge
- ✅ Gray Power icon
- ✅ Blue info banner (if no active popups)

---

## Test 4: Mobile Responsiveness ✅

### Steps
1. Resize browser to mobile width (< 640px)
2. Check header buttons
3. Check popup cards
4. Check modals

### Expected Results
- ✅ "Disable All" shows icon only (no text)
- ✅ "Buat Popup" shows "Buat" (shortened)
- ✅ Popup cards stack properly
- ✅ Action buttons remain accessible
- ✅ Modals are centered and readable

---

## Test 5: Error Handling ✅

### Steps
1. Disconnect internet
2. Try to toggle popup
3. Reconnect
4. Try again

### Expected Results
- ✅ Toast error message appears
- ✅ UI doesn't break
- ✅ After reconnect, works normally

---

## Test 6: Database Constraint ✅

### SQL Test
```sql
-- Try to activate 2 popups manually
UPDATE welcome_popups SET is_active = true WHERE id = 'popup-1';
UPDATE welcome_popups SET is_active = true WHERE id = 'popup-2';

-- Check result
SELECT id, title, is_active FROM welcome_popups;
```

### Expected Results
- ✅ Only popup-2 is active
- ✅ popup-1 auto-deactivated by trigger
- ✅ No error thrown

---

## Test 7: Visitor Experience ✅

### Steps
1. Activate a popup in admin
2. Open site in incognito/private window
3. Observe popup appears
4. Check "Don't show again"
5. Refresh page

### Expected Results
- ✅ Popup appears on first visit
- ✅ Checkbox works
- ✅ After refresh, popup doesn't show
- ✅ localStorage has flag

### Steps (No Active Popup)
1. Disable all popups in admin
2. Open site in incognito
3. Observe no popup

### Expected Results
- ✅ No popup appears
- ✅ No errors in console

---

## Test 8: Create & Activate Flow ✅

### Steps
1. Click "Buat Popup"
2. Fill form (title, content, etc.)
3. Save (popup is inactive by default)
4. Click Power icon to activate
5. Observe other popups deactivate

### Expected Results
- ✅ New popup created inactive
- ✅ Can activate immediately
- ✅ Other popups auto-deactivate
- ✅ Toast notifications work

---

## Test 9: Edit Active Popup ✅

### Steps
1. Activate a popup
2. Click Edit icon
3. Change title/content
4. Save
5. Return to list

### Expected Results
- ✅ Popup remains active after edit
- ✅ Changes saved
- ✅ Green ring still visible
- ✅ No other popups activated

---

## Test 10: Delete Active Popup ✅

### Steps
1. Activate a popup
2. Click Delete icon
3. Confirm deletion
4. Observe changes

### Expected Results
- ✅ Confirmation modal appears
- ✅ After delete, popup removed
- ✅ Info banner turns blue (no active)
- ✅ "Disable All" button disappears
- ✅ Toast: "Popup berhasil dihapus"

---

## Performance Tests ✅

### Load Time
- ✅ Page loads in < 2 seconds
- ✅ No layout shift
- ✅ Smooth animations

### Interaction
- ✅ Toggle responds instantly
- ✅ Modal opens smoothly
- ✅ Toast appears without delay

---

## Accessibility Tests ✅

### Keyboard Navigation
- ✅ Can tab through buttons
- ✅ Enter/Space activates buttons
- ✅ Escape closes modals

### Screen Reader
- ✅ Buttons have proper labels
- ✅ Status announced correctly
- ✅ Modals have proper ARIA

---

## Browser Compatibility ✅

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## SQL Verification Queries

### Check Active Popups
```sql
SELECT id, title, is_active, created_at 
FROM welcome_popups 
ORDER BY created_at DESC;
```

### Count Active (Should be 0 or 1)
```sql
SELECT COUNT(*) as active_count 
FROM welcome_popups 
WHERE is_active = true;
```

### Check Trigger Exists
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_ensure_single_active_welcome_popup';
```

### Check Index Exists
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE indexname = 'idx_welcome_popups_single_active';
```

---

## Common Issues & Solutions

### Issue: Multiple Popups Active
**Solution**: Run `UPDATE welcome_popups SET is_active = false;` then activate one

### Issue: "Disable All" Not Showing
**Solution**: Check if any popup is active. Button only shows when needed.

### Issue: Popup Not Showing to Visitors
**Solution**: 
1. Check popup is active (green ring)
2. Clear localStorage
3. Use incognito window

### Issue: Toast Not Appearing
**Solution**: Check browser console for errors, ensure react-hot-toast is working

---

## Success Criteria

All tests should pass:
- ✅ Only 1 popup active at a time (enforced)
- ✅ Visual indicators accurate
- ✅ "Disable All" works correctly
- ✅ Mobile responsive
- ✅ No console errors
- ✅ Database constraint working
- ✅ Trigger auto-deactivates
- ✅ Toast notifications informative
- ✅ Visitor experience correct

---

## Report Template

```
Test Date: [DATE]
Tester: [NAME]
Browser: [BROWSER + VERSION]
Device: [DESKTOP/MOBILE]

Test Results:
- Test 1 (Toggle): [PASS/FAIL]
- Test 2 (Disable All): [PASS/FAIL]
- Test 3 (Visual): [PASS/FAIL]
- Test 4 (Mobile): [PASS/FAIL]
- Test 5 (Error): [PASS/FAIL]
- Test 6 (Database): [PASS/FAIL]
- Test 7 (Visitor): [PASS/FAIL]
- Test 8 (Create): [PASS/FAIL]
- Test 9 (Edit): [PASS/FAIL]
- Test 10 (Delete): [PASS/FAIL]

Issues Found: [NONE/LIST]
Notes: [ANY OBSERVATIONS]
```

---

**Status**: Ready for Testing ✅
**Last Updated**: 2025-11-28

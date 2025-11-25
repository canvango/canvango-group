# Real-time Updates - Testing Guide

## 🧪 COMPREHENSIVE TESTING GUIDE

Panduan lengkap untuk testing real-time updates pada fitur `/claim-garansi`.

---

## 📋 PRE-TESTING CHECKLIST

### 1. Verify Implementation
```bash
# Check all files exist
ls src/features/member-area/hooks/useWarrantyRealtime.ts
ls src/shared/components/Toast.tsx
ls src/shared/components/ToastContainer.tsx
ls src/shared/hooks/useToast.ts

# Check no TypeScript errors
npm run type-check
# or
tsc --noEmit
```

### 2. Verify Database Migration
```sql
-- Check realtime is enabled
SELECT * FROM pg_publication_tables 
WHERE tablename = 'warranty_claims';

-- Should return 1 row with:
-- pubname: supabase_realtime
-- tablename: warranty_claims
```

### 3. Start Development Server
```bash
npm run dev
# Server should start on http://localhost:5174
```

---

## 🎯 TEST SCENARIOS

### Test 1: Basic Real-time Update ⭐ CRITICAL

**Objective**: Verify real-time updates work

**Steps**:
1. Open browser window 1 (Member)
   - Login as: `member@canvango.com` / `member123`
   - Navigate to: `/claim-garansi`
   - Keep page open

2. Open browser window 2 (Admin)
   - Login as: `admin@canvango.com` / `admin123`
   - Navigate to: `/admin/claims`
   - Find a pending claim

3. Update claim status (Admin window)
   - Change status from "pending" to "approved"
   - Click save

4. Check member window (Window 1)
   - **Expected**:
     - ✅ Toast notification appears: "Klaim #xxx telah disetujui!"
     - ✅ Table row updates to show "Approved" badge
     - ✅ Status card "Pending" count decreases by 1
     - ✅ Status card "Approved" count increases by 1
     - ✅ No page refresh needed

**Result**: ⬜ Pass / ⬜ Fail

**Notes**:
```
_______________________________________________________
_______________________________________________________
_______________________________________________________
```

---

### Test 2: Multiple Status Changes

**Objective**: Verify multiple sequential updates

**Steps**:
1. Member opens `/claim-garansi` (keep open)

2. Admin changes status: `pending` → `reviewing`
   - **Expected**: Info toast (blue) appears
   - Message: "Klaim #xxx sedang direview oleh tim kami."

3. Wait 2 seconds

4. Admin changes status: `reviewing` → `approved`
   - **Expected**: Success toast (green) appears
   - Message: "Klaim #xxx telah disetujui!"

5. Verify both toasts appeared
   - **Expected**: 2 separate toasts (stacked)

**Result**: ⬜ Pass / ⬜ Fail

**Notes**:
```
_______________________________________________________
_______________________________________________________
```

---

### Test 3: Toast Variants

**Objective**: Verify all toast types work

**Test 3a: Success Toast (Green)**
- Admin changes status to: `approved`
- **Expected**: Green toast with checkmark icon

**Test 3b: Error Toast (Red)**
- Admin changes status to: `rejected`
- **Expected**: Red toast with X icon

**Test 3c: Info Toast (Blue)**
- Admin changes status to: `reviewing`
- **Expected**: Blue toast with info icon

**Test 3d: Completed Toast (Green)**
- Admin changes status to: `completed`
- **Expected**: Green toast with checkmark icon

**Result**: ⬜ Pass / ⬜ Fail

**Notes**:
```
_______________________________________________________
_______________________________________________________
```

---

### Test 4: Toast Auto-dismiss

**Objective**: Verify toasts auto-dismiss after duration

**Steps**:
1. Trigger a status change
2. Observe toast appears
3. Wait 5-7 seconds
4. **Expected**: Toast fades out and disappears

**Result**: ⬜ Pass / ⬜ Fail

---

### Test 5: Toast Manual Close

**Objective**: Verify manual close button works

**Steps**:
1. Trigger a status change
2. Toast appears
3. Click X button on toast
4. **Expected**: Toast disappears immediately

**Result**: ⬜ Pass / ⬜ Fail

---

### Test 6: Multiple Toasts Stacking

**Objective**: Verify multiple toasts can stack

**Steps**:
1. Trigger 3 status changes quickly (within 2 seconds)
2. **Expected**: 3 toasts appear, stacked vertically
3. Each toast should be visible
4. Each toast should auto-dismiss independently

**Result**: ⬜ Pass / ⬜ Fail

---

### Test 7: Connection Resilience

**Objective**: Verify reconnection after disconnect

**Steps**:
1. Member opens `/claim-garansi`
2. Check console: "🔌 [Realtime] Subscription status: SUBSCRIBED"
3. Disconnect internet (turn off WiFi)
4. Wait 5 seconds
5. Reconnect internet
6. Check console: Should see reconnection logs
7. Admin updates claim
8. **Expected**: Member receives update after reconnection

**Result**: ⬜ Pass / ⬜ Fail

---

### Test 8: Page Refresh Behavior

**Objective**: Verify subscription re-establishes after refresh

**Steps**:
1. Member opens `/claim-garansi`
2. Verify subscription active (check console)
3. Refresh page (F5)
4. Check console: New subscription should be created
5. Admin updates claim
6. **Expected**: Member receives update

**Result**: ⬜ Pass / ⬜ Fail

---

### Test 9: Multiple Tabs

**Objective**: Verify each tab has independent subscription

**Steps**:
1. Open `/claim-garansi` in Tab 1
2. Open `/claim-garansi` in Tab 2
3. Check console in both tabs
4. **Expected**: Each tab has its own subscription
5. Admin updates claim
6. **Expected**: Both tabs receive update

**Result**: ⬜ Pass / ⬜ Fail

---

### Test 10: Security - User Isolation

**Objective**: Verify users only see their own updates

**Steps**:
1. Login as Member A in Window 1
2. Login as Member B in Window 2
3. Both open `/claim-garansi`
4. Admin updates Member A's claim
5. **Expected**:
   - ✅ Member A receives update
   - ❌ Member B does NOT receive update

**Result**: ⬜ Pass / ⬜ Fail

---

### Test 11: Performance - No Memory Leaks

**Objective**: Verify proper cleanup

**Steps**:
1. Open `/claim-garansi`
2. Open Chrome DevTools → Performance → Memory
3. Take heap snapshot
4. Navigate away from page
5. Navigate back to `/claim-garansi`
6. Repeat 10 times
7. Take another heap snapshot
8. **Expected**: Memory usage should be stable (no significant increase)

**Result**: ⬜ Pass / ⬜ Fail

---

### Test 12: Mobile Responsiveness

**Objective**: Verify toasts work on mobile

**Steps**:
1. Open on mobile device or use DevTools mobile emulation
2. Login and open `/claim-garansi`
3. Admin updates claim
4. **Expected**:
   - ✅ Toast appears
   - ✅ Toast is readable (not cut off)
   - ✅ Toast is properly positioned
   - ✅ Close button is tappable

**Result**: ⬜ Pass / ⬜ Fail

---

### Test 13: Browser Compatibility

**Objective**: Verify works across browsers

**Test on each browser**:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**For each browser**:
1. Open `/claim-garansi`
2. Admin updates claim
3. **Expected**: Real-time update works

**Result**: ⬜ Pass / ⬜ Fail

---

### Test 14: Network Throttling

**Objective**: Verify works on slow connections

**Steps**:
1. Open Chrome DevTools → Network
2. Set throttling to "Slow 3G"
3. Open `/claim-garansi`
4. Admin updates claim
5. **Expected**: Update still arrives (may be delayed)

**Result**: ⬜ Pass / ⬜ Fail

---

### Test 15: Console Logs Verification

**Objective**: Verify proper logging

**Steps**:
1. Open `/claim-garansi`
2. Check console for these logs:

**Expected logs**:
```
✅ 🔌 [Realtime] Subscribing to warranty_claims changes for user: xxx
✅ 🔌 [Realtime] Subscription status: SUBSCRIBED
```

**When status changes**:
```
✅ 🔔 [Realtime] Warranty claim updated: {...}
```

**On unmount**:
```
✅ 🔌 [Realtime] Unsubscribing from warranty_claims changes
```

**Result**: ⬜ Pass / ⬜ Fail

---

## 🐛 DEBUGGING CHECKLIST

### If Real-time Not Working

**Step 1: Check Database**
```sql
SELECT * FROM pg_publication_tables 
WHERE tablename = 'warranty_claims';
```
- ⬜ Returns 1 row

**Step 2: Check Console**
```
Look for:
🔌 [Realtime] Subscription status: SUBSCRIBED
```
- ⬜ Status is SUBSCRIBED (not CHANNEL_ERROR)

**Step 3: Check Network**
```
DevTools → Network → WS (WebSocket)
```
- ⬜ WebSocket connection established
- ⬜ No connection errors

**Step 4: Check User ID**
```
Console should show:
🔌 [Realtime] Subscribing to warranty_claims changes for user: xxx
```
- ⬜ User ID is correct (not undefined)

**Step 5: Check RLS Policies**
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'warranty_claims';
```
- ⬜ Policies exist and are correct

---

### If Toast Not Appearing

**Step 1: Check ToastContainer**
```tsx
// Should be in ClaimWarranty.tsx
<ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
```
- ⬜ ToastContainer is rendered

**Step 2: Check Callback**
```typescript
useWarrantyRealtime(user?.id, {
  onStatusChange: handleStatusChange // ← Should be passed
});
```
- ⬜ Callback is passed

**Step 3: Check Console**
```
Should see:
🔔 [Realtime] Warranty claim updated: {...}
```
- ⬜ Event is received

**Step 4: Check Toast Hook**
```typescript
const toast = useToast(); // ← Should be called
```
- ⬜ useToast is called

---

## 📊 TEST RESULTS SUMMARY

### Critical Tests (Must Pass)
- [ ] Test 1: Basic Real-time Update
- [ ] Test 2: Multiple Status Changes
- [ ] Test 3: Toast Variants
- [ ] Test 10: Security - User Isolation

### Important Tests (Should Pass)
- [ ] Test 4: Toast Auto-dismiss
- [ ] Test 5: Toast Manual Close
- [ ] Test 7: Connection Resilience
- [ ] Test 8: Page Refresh Behavior

### Nice-to-Have Tests (Optional)
- [ ] Test 9: Multiple Tabs
- [ ] Test 11: Performance - No Memory Leaks
- [ ] Test 12: Mobile Responsiveness
- [ ] Test 13: Browser Compatibility
- [ ] Test 14: Network Throttling

---

## ✅ SIGN-OFF

**Tester Name**: _______________________
**Date**: _______________________
**Overall Result**: ⬜ Pass / ⬜ Fail

**Critical Issues Found**:
```
_______________________________________________________
_______________________________________________________
_______________________________________________________
```

**Minor Issues Found**:
```
_______________________________________________________
_______________________________________________________
_______________________________________________________
```

**Recommendations**:
```
_______________________________________________________
_______________________________________________________
_______________________________________________________
```

**Approved for Production**: ⬜ Yes / ⬜ No

**Signature**: _______________________

---

## 📞 SUPPORT

If you encounter issues during testing:

1. Check `CLAIM_WARRANTY_REALTIME_IMPLEMENTATION.md` → Troubleshooting section
2. Check browser console for error messages
3. Verify all pre-testing checklist items
4. Review debugging checklist above

---

**Last Updated**: November 25, 2025
**Version**: 1.0.0

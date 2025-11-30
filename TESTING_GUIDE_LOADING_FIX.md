# 🧪 TESTING GUIDE: Loading Stuck Bug Fix

**Tanggal:** 30 November 2025  
**Status:** Ready for Testing  
**Tester:** QA Team / Developer

---

## 📋 OVERVIEW

Panduan testing untuk memverifikasi bahwa bug "loading terus" telah diperbaiki.

---

## 🎯 TEST SCENARIOS

### Test 1: Token Expiration During Idle

**Objective:** Verify auto token refresh when token expires during idle

**Steps:**
1. Login ke aplikasi
2. Biarkan browser terbuka selama 65 menit (token expires after 60 min)
3. Klik menu lain (misalnya: Riwayat Transaksi)
4. Observe behavior

**Expected Result:**
- ✅ Loading muncul sebentar
- ✅ Token auto-refresh di background
- ✅ Data berhasil dimuat
- ✅ Tidak stuck di loading
- ✅ Tidak perlu manual refresh

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

**Console Logs to Check:**
```
🔐 Session status: ...
🔄 Token expiring soon, refreshing session...
✅ Session refreshed successfully
```

---

### Test 2: Tab Background/Foreground

**Objective:** Verify session check when tab becomes active again

**Steps:**
1. Login ke aplikasi
2. Switch ke tab lain selama 30 menit
3. Kembali ke tab aplikasi
4. Klik menu lain
5. Observe behavior

**Expected Result:**
- ✅ Console log: "👁️ Tab became visible"
- ✅ Session check triggered
- ✅ Token refreshed if needed
- ✅ Data berhasil dimuat
- ✅ Tidak stuck di loading

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

**Console Logs to Check:**
```
👁️ Tab became visible (30 minutes since last check)
🔐 Checking session (source: visibility-change)...
```

---

### Test 3: Network Disconnect/Reconnect

**Objective:** Verify auto-refetch when network reconnects

**Steps:**
1. Login ke aplikasi
2. Disconnect network (WiFi off atau Airplane mode)
3. Observe offline notification
4. Reconnect network
5. Observe behavior

**Expected Result:**
- ✅ Offline notification muncul
- ✅ Online notification muncul saat reconnect
- ✅ Session check triggered
- ✅ Queries auto-refetch
- ✅ Data berhasil dimuat

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

**Console Logs to Check:**
```
🌐 Network connection lost
🌐 Network connection restored
🔄 Refreshing session after reconnect...
🔄 Refetching queries after reconnect...
✅ Queries refetched successfully
```

---

### Test 4: Mobile Browser Sleep/Wake

**Objective:** Verify session check when mobile browser wakes up

**Steps:**
1. Login ke aplikasi di mobile browser
2. Lock screen selama 30 menit
3. Unlock screen
4. Klik menu lain
5. Observe behavior

**Expected Result:**
- ✅ Console log: "🎯 Window focused after long idle"
- ✅ Session check triggered
- ✅ Token refreshed if needed
- ✅ Data berhasil dimuat

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

**Console Logs to Check:**
```
🎯 Window focused after long idle
🔐 Checking session (source: focus)...
```

---

### Test 5: Query Timeout Handling

**Objective:** Verify retry button appears on slow queries

**Steps:**
1. Login ke aplikasi
2. Throttle network to "Slow 3G" (Chrome DevTools)
3. Navigate ke halaman dengan banyak data
4. Wait 15 seconds
5. Observe behavior

**Expected Result:**
- ✅ Loading spinner muncul
- ✅ Elapsed time counter muncul (after 5s)
- ✅ Retry button muncul (after 15s)
- ✅ Warning message: "Memuat Terlalu Lama"
- ✅ User bisa klik "Coba Lagi"

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

---

### Test 6: Auth Error Handling

**Objective:** Verify global error handler for auth errors

**Steps:**
1. Login ke aplikasi
2. Manually expire token (via DevTools → Application → Local Storage → delete authToken)
3. Klik menu lain
4. Observe behavior

**Expected Result:**
- ✅ Query fails with 401
- ✅ Global error handler triggered
- ✅ Notification: "Sesi diperpanjang otomatis" atau "Sesi berakhir"
- ✅ Auto-logout if refresh fails
- ✅ Redirect to login page

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

**Console Logs to Check:**
```
🔐 Auth error detected, attempting token refresh...
✅ Token refreshed successfully
OR
❌ Token refresh failed
```

---

### Test 7: Multiple Concurrent Queries

**Objective:** Verify no race conditions with multiple queries

**Steps:**
1. Login ke aplikasi
2. Navigate ke Dashboard (loads multiple queries)
3. Immediately navigate to another page
4. Observe behavior

**Expected Result:**
- ✅ All queries load successfully
- ✅ No duplicate token refresh attempts
- ✅ No console errors
- ✅ Smooth navigation

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

---

### Test 8: Page Refresh from bfcache

**Objective:** Verify session check when page restored from cache

**Steps:**
1. Login ke aplikasi
2. Navigate to another page
3. Click browser back button
4. Observe behavior

**Expected Result:**
- ✅ Console log: "📄 Page restored from bfcache"
- ✅ Session check triggered
- ✅ Data loads correctly

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

---

## 🔍 PERFORMANCE TESTING

### Query Performance

**Objective:** Verify improved query performance

**Steps:**
1. Open Chrome DevTools → Network tab
2. Login ke aplikasi
3. Navigate to different pages
4. Measure query response times

**Expected Result:**
- ✅ Average query time: 200-400ms
- ✅ No queries > 1000ms
- ✅ Database indexes working

**Actual Result:**
- Average time: _____ ms
- Slowest query: _____ ms
- [ ] Pass
- [ ] Fail

---

### Token Refresh Frequency

**Objective:** Verify token refresh not too frequent

**Steps:**
1. Login ke aplikasi
2. Use app normally for 1 hour
3. Count token refresh attempts in console

**Expected Result:**
- ✅ Token refresh: 0-2 times per hour
- ✅ Only when needed (< 10 min expiry)
- ✅ No unnecessary refreshes

**Actual Result:**
- Refresh count: _____ times
- [ ] Pass
- [ ] Fail

---

## 🐛 EDGE CASES

### Edge Case 1: Rapid Tab Switching

**Steps:**
1. Login ke aplikasi
2. Rapidly switch between tabs (10 times in 10 seconds)
3. Observe behavior

**Expected Result:**
- ✅ No duplicate session checks
- ✅ No console errors
- ✅ App remains stable

---

### Edge Case 2: Network Flapping

**Steps:**
1. Login ke aplikasi
2. Rapidly toggle network on/off (5 times)
3. Observe behavior

**Expected Result:**
- ✅ Notifications appear/disappear correctly
- ✅ No duplicate refetch attempts
- ✅ App recovers when stable

---

### Edge Case 3: Expired Refresh Token

**Steps:**
1. Login ke aplikasi
2. Manually expire refresh token (DevTools)
3. Wait for auto-refresh attempt
4. Observe behavior

**Expected Result:**
- ✅ Refresh fails gracefully
- ✅ User logged out
- ✅ Redirect to login
- ✅ Clear error message

---

## 📊 METRICS TO COLLECT

### Success Metrics:
- [ ] Zero "stuck loading" reports
- [ ] < 1% manual refresh needed
- [ ] 95%+ auto-recovery rate
- [ ] < 500ms average query time

### User Experience:
- [ ] No user complaints about loading
- [ ] Positive feedback on auto-recovery
- [ ] Reduced support tickets

### Technical:
- [ ] No console errors
- [ ] No memory leaks
- [ ] Stable performance over time

---

## 🚨 FAILURE CRITERIA

**Test fails if:**
- ❌ Stuck di loading > 30 seconds
- ❌ Manual refresh required
- ❌ Console errors appear
- ❌ Token refresh fails silently
- ❌ Data tidak dimuat setelah retry
- ❌ App crashes or freezes

---

## 📝 TEST REPORT TEMPLATE

```
Test Date: _______________
Tester: _______________
Environment: [ ] Development [ ] Staging [ ] Production
Browser: _______________
Device: _______________

Test Results:
- Test 1: [ ] Pass [ ] Fail
- Test 2: [ ] Pass [ ] Fail
- Test 3: [ ] Pass [ ] Fail
- Test 4: [ ] Pass [ ] Fail
- Test 5: [ ] Pass [ ] Fail
- Test 6: [ ] Pass [ ] Fail
- Test 7: [ ] Pass [ ] Fail
- Test 8: [ ] Pass [ ] Fail

Performance:
- Average query time: _____ ms
- Token refresh count: _____ times/hour
- Memory usage: _____ MB

Issues Found:
1. _______________
2. _______________
3. _______________

Overall Status: [ ] PASS [ ] FAIL

Notes:
_______________
_______________
```

---

## 🎯 ACCEPTANCE CRITERIA

**Fix is considered successful if:**
- ✅ All 8 test scenarios pass
- ✅ No edge case failures
- ✅ Performance metrics met
- ✅ Zero critical bugs found
- ✅ User experience improved

---

## 📞 SUPPORT

**If tests fail:**
1. Capture console logs
2. Take screenshots
3. Note exact steps to reproduce
4. Report to development team

**Contact:**
- Developer: [Your Name]
- Slack: #dev-support
- Email: dev@company.com

---

**Happy Testing!** 🧪✨

# 🧪 Quick Test Guide - Infinite Loading Fix

## 🎯 Test Scenarios

### **Test 1: Idle Session (3+ Minutes)**

**Steps:**
1. Login ke aplikasi
2. Biarkan idle selama 3-5 menit (jangan sentuh apapun)
3. Klik menu navigasi (misal: "Riwayat Transaksi")
4. Observe behavior

**Expected Result:**
- ✅ Loading spinner muncul max 5-10 detik
- ✅ Muncul notification: "Sesi Anda telah berakhir. Silakan login kembali."
- ✅ Auto-redirect ke halaman login
- ✅ Tidak stuck di loading selamanya

**Console Logs to Watch:**
```
⚠️ Role check timeout - allowing access with fallback
⚠️ Auth error detected - clearing tokens
🔐 Auth error detected, attempting token refresh...
❌ Token refresh failed
```

---

### **Test 2: Manual Token Expiration**

**Steps:**
1. Login ke aplikasi
2. Open browser DevTools → Application → Local Storage
3. Hapus `authToken` atau ubah valuenya jadi random string
4. Klik menu navigasi
5. Observe behavior

**Expected Result:**
- ✅ Loading spinner muncul max 5 detik
- ✅ Token invalid terdeteksi dan dihapus
- ✅ Auto-redirect ke login
- ✅ Console log: "⚠️ Token exists but no user data - clearing invalid token"

---

### **Test 3: Network Timeout Simulation**

**Steps:**
1. Login ke aplikasi
2. Open browser DevTools → Network tab
3. Set throttling ke "Slow 3G" atau "Offline"
4. Klik menu navigasi
5. Observe behavior

**Expected Result:**
- ✅ Loading spinner muncul max 10 detik
- ✅ Muncul notification offline (jika offline)
- ✅ Fallback ke cached data atau redirect
- ✅ Tidak stuck selamanya

---

### **Test 4: Page Refresh After Idle**

**Steps:**
1. Login ke aplikasi
2. Biarkan idle 3-5 menit
3. Refresh browser (F5)
4. Observe behavior

**Expected Result:**
- ✅ Loading max 10 detik
- ✅ Jika token expired: redirect ke login
- ✅ Jika token valid: load dashboard normal
- ✅ Console log: "✅ Supabase client initialized successfully"

---

### **Test 5: Network Reconnect**

**Steps:**
1. Login ke aplikasi
2. Disconnect network (matikan WiFi)
3. Tunggu notification "Tidak Ada Koneksi"
4. Reconnect network (nyalakan WiFi)
5. Observe behavior

**Expected Result:**
- ✅ Muncul notification "Kembali Online"
- ✅ Auto-refetch data
- ✅ Console log: "✅ Queries refetched successfully"
- ✅ Tidak stuck di loading

---

### **Test 6: Protected Route Access**

**Steps:**
1. Login sebagai member (bukan admin)
2. Biarkan idle 3 menit
3. Coba akses admin route: `/admin/dashboard`
4. Observe behavior

**Expected Result:**
- ✅ Loading max 5 detik
- ✅ Role check timeout atau berhasil
- ✅ Redirect ke `/unauthorized` (jika role tidak match)
- ✅ Atau redirect ke login (jika token expired)

---

### **Test 7: Multiple Tab Scenario**

**Steps:**
1. Login di Tab 1
2. Buka Tab 2 dengan aplikasi yang sama
3. Logout di Tab 1
4. Klik navigasi di Tab 2
5. Observe behavior

**Expected Result:**
- ✅ Tab 2 detect session expired
- ✅ Auto-redirect ke login
- ✅ Tidak stuck di loading

---

## 🔍 Console Monitoring

### **Success Indicators:**
```
✅ Supabase client initialized successfully
✅ Login successful, user ID: xxx
✅ Profile fetched successfully: username
✅ Session refreshed successfully
✅ Queries refetched successfully
```

### **Warning Indicators (Expected):**
```
⚠️ Role check timeout - allowing access with fallback
⚠️ Token exists but no user data - clearing invalid token
⚠️ Auth error detected - clearing tokens
⚠️ Auth initialization timeout - setting loading to false
⚠️ Session expired
⚠️ Session refresh failed - token invalid or expired
```

### **Error Indicators (Should Not Appear):**
```
❌ Infinite loop detected
❌ Maximum update depth exceeded
❌ Cannot update component while rendering
```

---

## 📊 Performance Metrics

### **Loading Times:**
- Auth initialization: < 10 seconds
- Role check: < 5 seconds
- Session refresh: < 5 seconds
- Network reconnect: < 10 seconds

### **Timeout Values:**
- ProtectedRoute role check: 5 seconds
- AuthContext profile fetch: 5 seconds
- auth.service session check: 3 seconds
- Global error handler refresh: 5 seconds
- useSessionRefresh operations: 5 seconds
- OfflineDetector refetch: 10 seconds

---

## ✅ Verification Checklist

**Before Testing:**
- [ ] Clear browser cache
- [ ] Clear localStorage
- [ ] Open browser console
- [ ] Enable "Preserve log" di console

**During Testing:**
- [ ] Monitor console logs
- [ ] Check network tab
- [ ] Verify localStorage changes
- [ ] Note loading times

**After Testing:**
- [ ] No infinite loading observed
- [ ] All timeouts working correctly
- [ ] Token cleanup working
- [ ] Notifications showing properly
- [ ] No console errors

---

## 🐛 Known Issues (Should Be Fixed)

### **Before Fix:**
- ❌ Infinite loading setelah idle 3+ menit
- ❌ Stuck di ProtectedRoute 'checking' state
- ❌ Token expired tidak di-cleanup
- ❌ Harus manual refresh browser

### **After Fix:**
- ✅ Max 5-10 detik loading
- ✅ Auto-redirect ke login
- ✅ Token cleanup otomatis
- ✅ Tidak perlu refresh browser

---

## 🚨 Red Flags (Report if Found)

1. **Loading lebih dari 15 detik**
   - Check console untuk timeout logs
   - Verify network connection

2. **Stuck di loading selamanya**
   - Check console untuk errors
   - Verify timeout implementation

3. **Token tidak di-cleanup**
   - Check localStorage
   - Verify error handling

4. **Redirect loop**
   - Check auth state
   - Verify route guards

---

## 📝 Test Report Template

```
Test Date: [DATE]
Tester: [NAME]
Browser: [Chrome/Firefox/Safari]
OS: [Windows/Mac/Linux]

Test 1 - Idle Session:
- Status: [PASS/FAIL]
- Loading Time: [X seconds]
- Notes: [Any observations]

Test 2 - Manual Token Expiration:
- Status: [PASS/FAIL]
- Loading Time: [X seconds]
- Notes: [Any observations]

Test 3 - Network Timeout:
- Status: [PASS/FAIL]
- Loading Time: [X seconds]
- Notes: [Any observations]

Test 4 - Page Refresh:
- Status: [PASS/FAIL]
- Loading Time: [X seconds]
- Notes: [Any observations]

Test 5 - Network Reconnect:
- Status: [PASS/FAIL]
- Loading Time: [X seconds]
- Notes: [Any observations]

Test 6 - Protected Route:
- Status: [PASS/FAIL]
- Loading Time: [X seconds]
- Notes: [Any observations]

Test 7 - Multiple Tabs:
- Status: [PASS/FAIL]
- Loading Time: [X seconds]
- Notes: [Any observations]

Overall Result: [PASS/FAIL]
Issues Found: [List any issues]
Recommendations: [Any suggestions]
```

---

## 🎯 Success Criteria

**All tests must:**
- ✅ Complete within timeout limits
- ✅ Show proper notifications
- ✅ Cleanup tokens on error
- ✅ No infinite loading
- ✅ No console errors
- ✅ Smooth user experience

**If any test fails:**
1. Check console logs
2. Verify network connection
3. Clear cache and retry
4. Report issue with details

---

**Ready to Test:** ✅
**Estimated Time:** 15-20 minutes
**Difficulty:** Easy

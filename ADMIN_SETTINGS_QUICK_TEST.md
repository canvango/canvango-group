# 🧪 Admin Settings - Quick Test Guide

## ⚡ 5-Minute Test Checklist

### Prerequisites
- ✅ Login sebagai admin
- ✅ Navigate to: `/member/admin/settings`

---

## Test 1: Payment Methods (30 seconds)

```
1. Scroll to "Payment Methods" section
2. Type "LinkAja" in input field
3. Click "Add" button
4. Verify "LinkAja" muncul di list
5. Click "Remove" pada "LinkAja"
6. Verify "LinkAja" hilang dari list
7. Click "Save Settings" button
8. Wait for success message: "Settings updated successfully"
```

**Expected Result:**
- ✅ Payment method bisa ditambah/dihapus
- ✅ Success message muncul
- ✅ Changes tersimpan (refresh page untuk verify)

---

## Test 2: Notification Settings (30 seconds)

```
1. Scroll to "Notification Settings" section
2. Toggle "Enable email notifications" OFF
3. Update "Admin Email" to: test@example.com
4. Toggle "Enable system notifications" OFF
5. Click "Save Settings" button
6. Wait for success message
7. Refresh page
8. Verify all toggles masih OFF dan email masih "test@example.com"
```

**Expected Result:**
- ✅ Toggles berfungsi
- ✅ Email field bisa diupdate
- ✅ Changes persisted setelah refresh

---

## Test 3: Maintenance Mode (1 minute)

```
1. Scroll to "Maintenance Mode" section
2. Toggle "Enable maintenance mode" ON
3. Update message to: "Sistem sedang maintenance, kembali jam 10 malam"
4. Click "Save Settings" button
5. Wait for success message
6. Open new incognito window
7. Try to access /member/dashboard as regular user
8. Verify maintenance message muncul (if middleware implemented)
9. Back to admin window
10. Toggle maintenance mode OFF
11. Click "Save Settings"
```

**Expected Result:**
- ✅ Maintenance mode bisa diaktifkan
- ✅ Custom message tersimpan
- ✅ User tidak bisa akses saat maintenance (if middleware exists)
- ✅ Admin tetap bisa akses

---

## Test 4: Audit Logs Tab (1 minute)

```
1. Click "Audit Logs" tab
2. Verify table muncul dengan data
3. Check columns: Timestamp, Action, Resource, Admin ID, IP Address
4. Test filter: Select "settings" from dropdown
5. Verify hanya logs dengan resource "settings" yang muncul
6. Test filter: Select "tutorials" from dropdown
7. Verify hanya logs dengan resource "tutorials" yang muncul
8. Test pagination: Click "Next" button
9. Verify page number berubah
10. Click "Previous" button
11. Verify kembali ke page 1
```

**Expected Result:**
- ✅ Audit logs tampil dalam table
- ✅ Filter by resource berfungsi
- ✅ Pagination berfungsi
- ✅ Data sorted by created_at DESC (newest first)

---

## Test 5: Database Verification (1 minute)

Open Supabase SQL Editor dan run:

```sql
-- Test 1: Verify settings exist
SELECT 
  payment_methods,
  notification_email,
  maintenance_mode,
  updated_at
FROM system_settings;

-- Test 2: Verify audit logs recorded
SELECT 
  action,
  resource,
  details,
  created_at
FROM audit_logs
WHERE resource = 'settings'
ORDER BY created_at DESC
LIMIT 5;

-- Test 3: Test log_admin_action function
SELECT log_admin_action(
  'UPDATE',
  'settings',
  NULL,
  '{"test": "Quick test from SQL"}'::jsonb
);

-- Test 4: Verify new log inserted
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 1;
```

**Expected Result:**
- ✅ Settings data ada dan sesuai dengan UI
- ✅ Audit logs terekam dengan benar
- ✅ log_admin_action function berfungsi
- ✅ New log muncul di table

---

## Test 6: RLS Security (1 minute)

```sql
-- Test as non-admin user (should fail or return empty)
-- Switch to non-admin user in Supabase dashboard
-- Or use service_role key to bypass RLS for testing

-- This should return empty or error for non-admin
SELECT * FROM system_settings;

-- This should return empty or error for non-admin
SELECT * FROM audit_logs;
```

**Expected Result:**
- ✅ Non-admin tidak bisa akses system_settings
- ✅ Non-admin tidak bisa akses audit_logs
- ✅ Admin bisa akses semua data

---

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to fetch settings"
**Solution:**
```sql
-- Check if settings exist
SELECT COUNT(*) FROM system_settings;

-- If 0, insert default settings
INSERT INTO system_settings (payment_methods, notification_email, notification_system, maintenance_mode)
VALUES (
  '["BCA", "Mandiri", "BRI"]'::jsonb,
  '{"enabled": true, "admin_email": "admin@example.com"}'::jsonb,
  '{"enabled": true, "show_alerts": true}'::jsonb,
  '{"enabled": false, "message": ""}'::jsonb
);
```

### Issue 2: "Failed to update settings"
**Solution:**
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'system_settings';

-- Verify user is admin
SELECT role FROM users WHERE auth_id = auth.uid();
```

### Issue 3: Audit logs not showing
**Solution:**
```sql
-- Check if audit_logs table exists
SELECT COUNT(*) FROM audit_logs;

-- Insert sample log
INSERT INTO audit_logs (admin_id, action, resource, details)
VALUES (auth.uid(), 'UPDATE', 'settings', '{"test": true}'::jsonb);
```

### Issue 4: Pagination not working
**Solution:**
- Check browser console for errors
- Verify `totalPages` calculation in component
- Check if `count: 'exact'` is used in Supabase query

---

## ✅ Success Criteria

All tests passed if:

- [x] Payment methods bisa add/remove/save
- [x] Notification settings bisa toggle/update/save
- [x] Maintenance mode bisa enable/disable/save
- [x] Audit logs tampil dengan data
- [x] Filter by resource berfungsi
- [x] Pagination berfungsi
- [x] Database queries return correct data
- [x] RLS policies enforce admin-only access
- [x] Success messages muncul setelah save
- [x] Changes persisted setelah refresh

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

Test 1 - Payment Methods:        [ ] PASS  [ ] FAIL
Test 2 - Notification Settings:  [ ] PASS  [ ] FAIL
Test 3 - Maintenance Mode:       [ ] PASS  [ ] FAIL
Test 4 - Audit Logs Tab:         [ ] PASS  [ ] FAIL
Test 5 - Database Verification:  [ ] PASS  [ ] FAIL
Test 6 - RLS Security:           [ ] PASS  [ ] FAIL

Overall Status: [ ] ALL PASS  [ ] NEEDS FIX

Notes:
_________________________________________________
_________________________________________________
_________________________________________________
```

---

**Total Test Time:** ~5 minutes
**Status:** Ready for testing

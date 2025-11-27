# 🧪 Audit Logs - Quick Test Guide

## Test Scenario 1: View Existing Logs

1. Login sebagai admin
2. Navigate ke `/admin/audit-logs`
3. **Expected:** Melihat list audit logs yang sudah ada
4. **Check:** 
   - ✅ Logs ditampilkan dengan admin info (username, email)
   - ✅ Action badges berwarna (green=CREATE, blue=UPDATE, red=DELETE)
   - ✅ Timestamp formatted dengan benar
   - ✅ IP address ditampilkan

---

## Test Scenario 2: Create Audit Log via Transaction Update

1. Navigate ke `/admin/transactions`
2. Pilih transaction dengan status "pending"
3. Update status ke "completed"
4. Navigate ke `/admin/audit-logs`
5. **Expected:** Melihat log baru dengan:
   - Action: UPDATE
   - Resource: transactions
   - Details: old_status, new_status

---

## Test Scenario 3: Create Audit Log via Tutorial Management

### Create Tutorial
1. Navigate ke `/admin/tutorials`
2. Click "Add Tutorial"
3. Fill form dan save
4. Check `/admin/audit-logs`
5. **Expected:** Log dengan action CREATE, resource tutorials

### Update Tutorial
1. Edit tutorial yang baru dibuat
2. Change title atau content
3. Save
4. Check `/admin/audit-logs`
5. **Expected:** Log dengan action UPDATE

### Delete Tutorial
1. Delete tutorial
2. Check `/admin/audit-logs`
3. **Expected:** Log dengan action DELETE

---

## Test Scenario 4: Create Audit Log via Settings Update

1. Navigate ke `/admin/settings`
2. Toggle maintenance mode atau update payment methods
3. Save changes
4. Navigate ke `/admin/audit-logs`
5. **Expected:** Log dengan:
   - Action: UPDATE
   - Resource: settings
   - Details: updated_fields, changes

---

## Test Scenario 5: Filter Logs

### Filter by Action
1. Go to `/admin/audit-logs`
2. Select "UPDATE" from action dropdown
3. **Expected:** Only UPDATE logs shown

### Filter by Resource
1. Select "transactions" from entity dropdown
2. **Expected:** Only transaction logs shown

### Filter by Date Range
1. Set start date = today
2. Set end date = today
3. **Expected:** Only today's logs shown

### Combined Filters
1. Action = UPDATE
2. Entity = tutorials
3. Date range = last 7 days
4. **Expected:** Only tutorial UPDATE logs from last 7 days

---

## Test Scenario 6: View Log Details

1. Click "View Details" on any log
2. **Expected:** Modal opens showing:
   - ✅ Timestamp
   - ✅ Action badge
   - ✅ Admin info (username, email)
   - ✅ Entity/Resource
   - ✅ Resource ID
   - ✅ IP Address
   - ✅ User Agent
   - ✅ Details (JSON formatted)

---

## Test Scenario 7: Pagination

1. If more than 20 logs exist:
2. Check pagination controls appear
3. Click "Next"
4. **Expected:** Next page of logs loads
5. Click "Previous"
6. **Expected:** Previous page loads

---

## Test Scenario 8: Admin Info Display

1. View logs
2. **Expected:** Each log shows:
   - Admin username (bold)
   - Admin email (smaller, gray)
   - If admin deleted: Shows admin_id instead

---

## Quick SQL Verification

```sql
-- Check if logs are being created
SELECT 
  action,
  resource,
  details,
  created_at
FROM audit_logs
ORDER BY created_at DESC
LIMIT 5;

-- Check admin info is joined correctly
SELECT 
  al.action,
  al.resource,
  u.username,
  u.email,
  al.created_at
FROM audit_logs al
LEFT JOIN users u ON al.admin_id = u.id
ORDER BY al.created_at DESC
LIMIT 5;

-- Check IP addresses are captured
SELECT 
  ip_address,
  COUNT(*) as count
FROM audit_logs
WHERE ip_address IS NOT NULL
GROUP BY ip_address;
```

---

## Expected Results Summary

✅ **Logs Created Automatically** when:
- Transaction status updated
- Tutorial created/updated/deleted
- Settings updated

✅ **Logs Display:**
- Admin username & email
- Color-coded action badges
- Formatted timestamps
- IP addresses
- Full details in modal

✅ **Filters Work:**
- By action (CREATE, UPDATE, DELETE, etc)
- By resource (transactions, tutorials, settings, etc)
- By date range
- Combined filters

✅ **Pagination:**
- 20 logs per page
- Previous/Next navigation
- Page counter

✅ **Security:**
- Only admins can access
- Logs are immutable (can't be edited/deleted)
- IP tracking works

---

## Troubleshooting

### No logs appearing?
- Check if you're logged in as admin
- Verify RLS policies are active
- Check browser console for errors

### Admin info not showing?
- Verify foreign key relationship exists
- Check if admin user still exists in users table

### IP address is null?
- Normal in local development
- Will work in production with real IP

### Filters not working?
- Check if data exists for selected filters
- Try "All" option first
- Check browser console for errors

---

## Success Criteria

✅ All admin actions are logged  
✅ Logs display with complete information  
✅ Filters work correctly  
✅ Pagination works  
✅ Detail modal shows full info  
✅ No errors in console  
✅ Performance is good (queries are fast)  

If all tests pass, audit logging system is working perfectly! 🎉

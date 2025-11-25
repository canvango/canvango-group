# Admin Guide - Role Management

## Overview

This guide explains how to manage user roles in the new Supabase native authentication system. The key improvement: **users no longer need to logout after role changes**.

## Key Changes

### Before Migration
- ❌ Users had to logout and login after role change
- ❌ Login would fail if they didn't logout first
- ❌ Confusing user experience
- ❌ Support tickets for "can't login" issues

### After Migration
- ✅ Users see role change within 5 seconds
- ✅ Automatic notification shown to user
- ✅ Auto-redirect to appropriate dashboard
- ✅ No logout required
- ✅ Seamless user experience

## How It Works

```
1. Admin changes role in database
         ↓
2. System detects change (≤5 seconds)
         ↓
3. User sees notification
         ↓
4. User auto-redirected to new dashboard
         ↓
5. User continues with new role
```

## Managing User Roles

### Method 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to your project dashboard
   - Navigate to Table Editor

2. **Find the User**
   - Click on `users` table
   - Search for user by username or email
   - Or use filters to find specific users

3. **Change Role**
   - Click on the role cell for the user
   - Select new role from dropdown:
     - `guest` - Limited access
     - `member` - Standard user access
     - `admin` - Full administrative access
   - Click save or press Enter

4. **Verify Change**
   - Role is updated immediately in database
   - User will see change within 5 seconds
   - No further action needed

### Method 2: SQL Query

```sql
-- Change single user role
UPDATE users
SET role = 'admin'
WHERE username = 'john_doe';

-- Change role by email
UPDATE users
SET role = 'member'
WHERE email = 'user@example.com';

-- Change role by user ID
UPDATE users
SET role = 'admin'
WHERE id = '00000000-0000-0000-0000-000000000000';
```

### Method 3: Admin Dashboard (If Implemented)

If your application has an admin dashboard with user management:

1. Navigate to User Management
2. Find the user in the list
3. Click "Edit" or role dropdown
4. Select new role
5. Click "Save"

The system handles the database update automatically.

## Role Types

### Guest
- **Access:** Very limited
- **Permissions:** View public content only
- **Use Case:** Unverified or trial users

### Member
- **Access:** Standard user features
- **Permissions:** 
  - View and purchase products
  - Manage own profile
  - View own transactions
  - Submit warranty claims
- **Use Case:** Regular users

### Admin
- **Access:** Full system access
- **Permissions:**
  - All member permissions
  - Manage all users
  - Manage products
  - View all transactions
  - Manage warranty claims
  - Access admin dashboard
- **Use Case:** Administrators and staff

## User Experience After Role Change

### Upgrade: Member → Admin

**What the user sees:**
1. Notification: "Your role has been updated to admin"
2. Automatic redirect to Admin Dashboard
3. New admin menu items appear
4. Access to admin features

**Timeline:**
- Detection: ≤5 seconds
- Notification: Immediate
- Redirect: Immediate
- Full access: Immediate

### Downgrade: Admin → Member

**What the user sees:**
1. Notification: "Your role has been updated to member"
2. Automatic redirect to Member Dashboard
3. Admin menu items disappear
4. Admin features become inaccessible

**Timeline:**
- Detection: ≤5 seconds
- Notification: Immediate
- Redirect: Immediate
- Access revoked: Immediate

### Multiple Tabs

If user has multiple tabs open:
- Each tab detects change independently
- Each tab shows notification
- Each tab redirects appropriately
- All tabs sync to new role

## Best Practices

### ✅ Do's

1. **Communicate with users**
   - Inform users before changing their role
   - Explain what the change means
   - Provide documentation for new features

2. **Verify before changing**
   - Double-check you're changing the right user
   - Confirm the new role is correct
   - Consider the impact on user's work

3. **Monitor after changes**
   - Check if user successfully transitioned
   - Verify they can access new features
   - Be available for questions

4. **Document changes**
   - Keep records of role changes
   - Note reason for change
   - Track who made the change

5. **Test in staging first**
   - Test role changes in staging environment
   - Verify notifications work
   - Confirm redirects are correct

### ❌ Don'ts

1. **Don't change roles during active sessions**
   - Avoid changing roles when user is actively working
   - Wait for off-peak hours if possible
   - Warn users in advance

2. **Don't change multiple users at once**
   - Change roles one at a time
   - Verify each change before proceeding
   - Monitor for issues

3. **Don't forget to inform users**
   - Always communicate role changes
   - Explain new permissions
   - Provide support if needed

4. **Don't change roles without reason**
   - Document why role is being changed
   - Follow approval process
   - Keep audit trail

## Troubleshooting

### User doesn't see role change

**Possible causes:**
1. User is not logged in
2. Polling is disabled
3. Network issues
4. Browser cache issues

**Solutions:**
1. Ask user to refresh page
2. Check if user is logged in
3. Verify polling is enabled
4. Check browser console for errors

### User sees notification but no redirect

**Possible causes:**
1. Navigation error
2. Route guard issue
3. JavaScript error

**Solutions:**
1. Ask user to manually navigate
2. Check browser console for errors
3. Verify routes are configured correctly

### Role change takes longer than 5 seconds

**Possible causes:**
1. High server load
2. Network latency
3. Database performance issues

**Solutions:**
1. Check Supabase Dashboard for issues
2. Verify database performance
3. Check network connectivity

### User can't access new features after upgrade

**Possible causes:**
1. RLS policies not updated
2. Frontend not checking role correctly
3. Cache issues

**Solutions:**
1. Verify RLS policies are correct
2. Check role in database matches UI
3. Clear browser cache
4. Ask user to logout and login

## Monitoring Role Changes

### Check Current Roles

```sql
-- View all users and their roles
SELECT username, email, role, created_at, updated_at
FROM users
ORDER BY updated_at DESC;

-- Count users by role
SELECT role, COUNT(*) as count
FROM users
GROUP BY role;

-- Find recently changed roles (if audit log exists)
SELECT 
  u.username,
  ral.old_role,
  ral.new_role,
  ral.created_at,
  admin.username as changed_by
FROM role_audit_logs ral
JOIN users u ON u.id = ral.user_id
JOIN users admin ON admin.id = ral.changed_by
ORDER BY ral.created_at DESC
LIMIT 20;
```

### Audit Logging

If audit logging is implemented:

```sql
-- View audit log for specific user
SELECT *
FROM role_audit_logs
WHERE user_id = '00000000-0000-0000-0000-000000000000'
ORDER BY created_at DESC;

-- View all role changes today
SELECT 
  u.username,
  ral.old_role,
  ral.new_role,
  ral.created_at
FROM role_audit_logs ral
JOIN users u ON u.id = ral.user_id
WHERE ral.created_at >= CURRENT_DATE
ORDER BY ral.created_at DESC;
```

### Create Audit Log Table

If not already implemented:

```sql
CREATE TABLE IF NOT EXISTS role_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  old_role text NOT NULL,
  new_role text NOT NULL,
  changed_by uuid REFERENCES users(id) NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_role_audit_logs_user_id ON role_audit_logs(user_id);
CREATE INDEX idx_role_audit_logs_created_at ON role_audit_logs(created_at);

-- Create trigger to automatically log changes
CREATE OR REPLACE FUNCTION log_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO role_audit_logs (user_id, old_role, new_role, changed_by)
    VALUES (NEW.id, OLD.role, NEW.role, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER role_change_audit
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION log_role_change();
```

## Bulk Role Changes

### Scenario: Promote multiple users to admin

```sql
-- Promote specific users
UPDATE users
SET role = 'admin'
WHERE username IN ('user1', 'user2', 'user3');

-- Promote users by criteria
UPDATE users
SET role = 'admin'
WHERE created_at < '2024-01-01'
  AND role = 'member';

-- Verify changes
SELECT username, role
FROM users
WHERE username IN ('user1', 'user2', 'user3');
```

### Scenario: Downgrade inactive admins

```sql
-- Find inactive admins (no login in 30 days)
SELECT username, email, role, last_sign_in_at
FROM users
WHERE role = 'admin'
  AND last_sign_in_at < NOW() - INTERVAL '30 days';

-- Downgrade to member
UPDATE users
SET role = 'member'
WHERE role = 'admin'
  AND last_sign_in_at < NOW() - INTERVAL '30 days';
```

### Best Practices for Bulk Changes

1. **Test query first**
   ```sql
   -- Use SELECT to preview changes
   SELECT username, role
   FROM users
   WHERE <your_criteria>;
   ```

2. **Backup before bulk changes**
   ```sql
   -- Create backup table
   CREATE TABLE users_backup AS
   SELECT * FROM users;
   ```

3. **Change in batches**
   ```sql
   -- Change 10 users at a time
   UPDATE users
   SET role = 'admin'
   WHERE id IN (
     SELECT id FROM users
     WHERE role = 'member'
     LIMIT 10
   );
   ```

4. **Monitor after changes**
   - Check for errors in logs
   - Verify users can access features
   - Be ready to rollback if needed

## Security Considerations

### Principle of Least Privilege

- Only grant admin role when necessary
- Regularly review admin users
- Downgrade when admin access no longer needed

### Regular Audits

```sql
-- Review all admins
SELECT username, email, created_at, last_sign_in_at
FROM users
WHERE role = 'admin'
ORDER BY last_sign_in_at DESC;

-- Find admins who haven't logged in recently
SELECT username, email, last_sign_in_at
FROM users
WHERE role = 'admin'
  AND (last_sign_in_at IS NULL OR last_sign_in_at < NOW() - INTERVAL '30 days');
```

### Access Control

- Limit who can change roles
- Require approval for admin promotions
- Log all role changes
- Review audit logs regularly

## Emergency Procedures

### Revoke Admin Access Immediately

```sql
-- Downgrade specific user
UPDATE users
SET role = 'member'
WHERE username = 'compromised_user';

-- Verify change
SELECT username, role FROM users WHERE username = 'compromised_user';
```

### Restore User Access

```sql
-- If user was accidentally downgraded
UPDATE users
SET role = 'admin'
WHERE username = 'legitimate_admin';
```

### Lock Account

```sql
-- Set role to guest to restrict access
UPDATE users
SET role = 'guest'
WHERE username = 'suspicious_user';
```

## Support Scenarios

### User reports: "I can't access admin features"

**Steps:**
1. Verify user's current role:
   ```sql
   SELECT username, role FROM users WHERE username = 'user';
   ```

2. Check if role should be admin:
   - Review user's job role
   - Check approval records
   - Verify with management

3. If role should be admin:
   ```sql
   UPDATE users SET role = 'admin' WHERE username = 'user';
   ```

4. Ask user to wait 5 seconds and refresh

5. Verify user can now access admin features

### User reports: "I see admin menu but can't access pages"

**Steps:**
1. Check RLS policies are updated
2. Verify role in database matches UI
3. Ask user to logout and login
4. Check browser console for errors
5. Verify Supabase connection

### User reports: "Role changed but I didn't get notification"

**Steps:**
1. Verify polling is enabled
2. Check browser console for errors
3. Verify user was logged in when change occurred
4. Check notification system is working
5. Role change still took effect, just notification failed

## FAQ for Admins

**Q: Do I need to tell users to logout after changing their role?**  
A: No! Users will see the change automatically within 5 seconds.

**Q: What if user doesn't see the change?**  
A: Ask them to refresh the page. If still not working, check troubleshooting section.

**Q: Can I change multiple users at once?**  
A: Yes, but do it carefully. Test with one user first, then proceed with bulk changes.

**Q: How do I know if role change was successful?**  
A: Check the database to verify role is updated. User should see notification within 5 seconds.

**Q: What if I accidentally change the wrong user's role?**  
A: Change it back immediately. The system will detect the change and update the user's session.

**Q: Can users see their own role?**  
A: Yes, users can see their role in their profile or account settings.

**Q: How do I prevent unauthorized role changes?**  
A: Use RLS policies to restrict who can update the role column. Only admins should have this permission.

## Additional Resources

- [Migration Guide](./MIGRATION_GUIDE.md) - Technical migration details
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common issues and solutions
- [FAQ](./FAQ.md) - Frequently asked questions
- [README](./README.md) - System overview

## Support

For technical issues:
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review Supabase Dashboard logs
3. Check browser console for errors
4. Contact technical support with details

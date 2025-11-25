# Real-time Updates - Quick Reference

## 🎯 Quick Start

### For Developers

**Enable real-time in your component:**
```typescript
import { useWarrantyRealtime } from '../hooks/useWarrantyRealtime';
import { useAuth } from '../contexts/AuthContext';

const { user } = useAuth();

useWarrantyRealtime(user?.id, {
  onStatusChange: (claim, oldStatus, newStatus) => {
    console.log(`Status changed: ${oldStatus} → ${newStatus}`);
  }
});
```

**Show toast notifications:**
```typescript
import { useToast } from '../../../shared/hooks/useToast';
import ToastContainer from '../../../shared/components/ToastContainer';

const toast = useToast();

// Show notifications
toast.success('Success message!');
toast.error('Error message!');
toast.info('Info message!');
toast.warning('Warning message!');

// Render container
<ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
```

---

## 🧪 Testing

### Quick Test (2 minutes)

1. **Open two browser windows**
   - Window 1: Login as member → `/claim-garansi`
   - Window 2: Login as admin → `/admin/claims`

2. **Update claim status in admin window**
   - Change status from "pending" to "approved"

3. **Check member window**
   - ✅ Toast notification should appear
   - ✅ Table should update automatically
   - ✅ Status cards should update

---

## 🔍 Debugging

### Check Real-time Connection

**Browser Console:**
```
✅ Good:
🔌 [Realtime] Subscribing to warranty_claims changes for user: xxx
🔌 [Realtime] Subscription status: SUBSCRIBED

❌ Bad:
🔌 [Realtime] Subscription status: CHANNEL_ERROR
```

### Check Database

```sql
-- Verify realtime is enabled
SELECT * FROM pg_publication_tables 
WHERE tablename = 'warranty_claims';
-- Should return 1 row
```

### Check Events

**Browser Console:**
```
✅ When status changes:
🔔 [Realtime] Warranty claim updated: {...}
```

---

## 📊 Status Change Messages

| Old Status | New Status | Toast Type | Message |
|-----------|-----------|-----------|---------|
| pending | reviewing | Info (blue) | "Klaim #xxx sedang direview oleh tim kami." |
| reviewing | approved | Success (green) | "Klaim #xxx telah disetujui! Akun pengganti akan segera dikirimkan." |
| reviewing | rejected | Error (red) | "Klaim #xxx ditolak. Silakan lihat detail untuk informasi lebih lanjut." |
| approved | completed | Success (green) | "Klaim #xxx selesai diproses!" |

---

## 🚨 Common Issues

### Issue: No toast appearing

**Solution:**
1. Check ToastContainer is rendered
2. Check callback is passed to useWarrantyRealtime
3. Check browser console for errors

### Issue: Multiple toasts for same event

**Solution:**
- Already handled by useEffect cleanup
- If persists, check for duplicate subscriptions

### Issue: Real-time not working

**Solution:**
1. Check database migration applied
2. Check WebSocket connection in Network tab
3. Check user ID is passed correctly

---

## 📁 Key Files

```
Realtime Hook:
src/features/member-area/hooks/useWarrantyRealtime.ts

Toast System:
src/shared/components/Toast.tsx
src/shared/components/ToastContainer.tsx
src/shared/hooks/useToast.ts

Integration:
src/features/member-area/pages/ClaimWarranty.tsx

Migration:
supabase/migrations/[timestamp]_enable_realtime_warranty_claims.sql
```

---

## 🎯 Quick Commands

```bash
# Check if migration applied
npm run supabase:status

# View realtime logs (if available)
npm run supabase:logs

# Restart dev server
npm run dev
```

---

**Last Updated**: November 25, 2025
**Status**: ✅ Production Ready

# Welcome Popup - Quick Reference Guide

## 🎯 Quick Actions

### Activate a Popup
```
Admin Panel → Welcome Popups → Click Power icon (⚡)
```
- Popup becomes active
- Other popups auto-deactivate
- Green ring + badge appears

### Disable All Popups
```
Admin Panel → Welcome Popups → Click "Disable All" button
```
- All popups deactivated
- No popup shown to visitors
- Can re-activate anytime

### Create New Popup
```
Admin Panel → Welcome Popups → "Buat Popup" button
```
- Fill form (title, content, bullet points)
- Choose type (welcome/security/promo)
- Save (inactive by default)

---

## 🎨 Visual Indicators

| Indicator | Meaning |
|-----------|---------|
| 🟢 Green ring | Popup is active |
| ✅ "Active" badge | Currently published |
| 🟢 Green info banner | Has active popup |
| 🔵 Blue info banner | No active popup |
| ⚡ Green power icon | Active (click to disable) |
| ⚡ Gray power icon | Inactive (click to enable) |

---

## 🔧 Database Rules

1. **Only 1 popup active** at a time (enforced by database)
2. **Auto-deactivation** when activating another
3. **Trigger-based** (automatic, no manual intervention)

---

## 📱 User Flow

### Admin
1. Create popup → Inactive by default
2. Click Power icon → Activate
3. Other popups auto-deactivate
4. Click "Disable All" → All inactive

### Visitor
1. First visit → See active popup (if any)
2. Check "Don't show again" → Saved in localStorage
3. No active popup → No popup shown

---

## 🚨 Common Scenarios

### Urgent Security Alert
```
1. Create security popup
2. Activate immediately
3. Previous popup auto-deactivates
```

### Maintenance Mode
```
1. Click "Disable All"
2. Confirm
3. All popups hidden from visitors
```

### Switch Promo
```
1. Activate new promo popup
2. Old promo auto-deactivates
3. No manual cleanup needed
```

---

## 🔍 Troubleshooting

### Popup not showing to visitors?
- Check if popup is active (green ring)
- Check visitor hasn't clicked "Don't show again"
- Clear localStorage to test

### Can't activate 2 popups?
- By design! Only 1 active at a time
- Database constraint prevents this

### "Disable All" button not showing?
- Button only appears when there's an active popup
- Check if any popup has green ring

---

## 📊 Status Check

### Quick SQL Check
```sql
-- See all popups and their status
SELECT id, title, type, is_active 
FROM welcome_popups 
ORDER BY created_at DESC;

-- Count active popups (should be 0 or 1)
SELECT COUNT(*) FROM welcome_popups WHERE is_active = true;
```

---

## 🎯 Best Practices

1. **Test before activating**: Use Preview button
2. **One at a time**: Don't try to activate multiple
3. **Disable during maintenance**: Use "Disable All"
4. **Clear messaging**: Write clear, concise content
5. **Mobile-friendly**: Test on mobile devices

---

## 🔗 Related Files

- Hook: `src/hooks/useWelcomePopups.ts`
- Admin UI: `src/features/admin/components/welcome-popups/WelcomePopupList.tsx`
- Visitor UI: `src/components/WelcomePopup.tsx`
- Migration: `add_welcome_popup_single_active_constraint`

---

## ✅ Feature Status

| Feature | Status |
|---------|--------|
| Single active constraint | ✅ Working |
| Auto-deactivation | ✅ Working |
| Disable All | ✅ Working |
| Visual indicators | ✅ Working |
| Mobile responsive | ✅ Working |
| Error handling | ✅ Working |

**Last Updated**: 2025-11-28

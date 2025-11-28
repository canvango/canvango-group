# Welcome Popup Disable/Unpublish Feature

## ✅ Implementation Complete

Fitur disable/unpublish Welcome Popups telah diimplementasikan secara sistematis dengan database constraints, triggers, dan UI yang terintegrasi.

---

## 🎯 Features Implemented

### 1. **Database Constraints**
- ✅ Unique partial index untuk memastikan hanya 1 popup aktif
- ✅ Trigger otomatis untuk menonaktifkan popup lain saat ada yang diaktifkan
- ✅ Updated_at timestamp otomatis

### 2. **Backend Logic**
- ✅ Hook `useToggleWelcomePopupActive` - toggle individual popup
- ✅ Hook `useDisableAllWelcomePopups` - disable semua popup sekaligus
- ✅ React Query cache invalidation otomatis

### 3. **UI/UX Enhancements**
- ✅ Tombol "Disable All" di header (hanya muncul jika ada popup aktif)
- ✅ Visual indicator untuk popup aktif (green ring + badge)
- ✅ Info banner dinamis (hijau jika ada aktif, biru jika tidak ada)
- ✅ Toggle button per popup dengan icon Power
- ✅ Confirmation modal untuk Disable All
- ✅ Toast notifications informatif
- ✅ Responsive design (mobile-friendly)

---

## 📊 Database Schema

### Migration Applied
```sql
-- Unique partial index
CREATE UNIQUE INDEX idx_welcome_popups_single_active 
ON welcome_popups (is_active) 
WHERE is_active = true;

-- Trigger function
CREATE OR REPLACE FUNCTION ensure_single_active_welcome_popup()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE welcome_popups 
    SET is_active = false, updated_at = now()
    WHERE id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_ensure_single_active_welcome_popup
  BEFORE INSERT OR UPDATE OF is_active ON welcome_popups
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_active_welcome_popup();
```

### How It Works
1. **Partial Unique Index**: Database-level constraint mencegah 2 popup aktif bersamaan
2. **Trigger**: Otomatis menonaktifkan popup lain saat ada yang diaktifkan
3. **Updated_at**: Timestamp otomatis update untuk audit trail

---

## 🔧 API/Hooks

### Individual Toggle
```typescript
import { useToggleWelcomePopupActive } from '@/hooks/useWelcomePopups';

const toggleActive = useToggleWelcomePopupActive();

// Toggle popup
await toggleActive.mutateAsync({ 
  id: 'popup-id', 
  is_active: true 
});
```

### Disable All
```typescript
import { useDisableAllWelcomePopups } from '@/hooks/useWelcomePopups';

const disableAll = useDisableAllWelcomePopups();

// Disable all active popups
await disableAll.mutateAsync();
```

---

## 🎨 UI Components

### Header Actions
```tsx
<div className="flex items-center gap-2">
  {hasActivePopup && (
    <button className="btn-secondary text-red-600">
      <PowerOff /> Disable All
    </button>
  )}
  <button className="btn-primary">
    <Plus /> Buat Popup
  </button>
</div>
```

### Info Banner (Dynamic)
- **Green**: Ada popup aktif
- **Blue**: Tidak ada popup aktif

### Popup Card Actions
- **Eye icon**: Preview popup
- **Power icon**: Toggle active/inactive (green when active)
- **Edit icon**: Edit popup
- **Trash icon**: Delete popup

---

## 🧪 Testing Results

### Test 1: Single Active Constraint
```sql
-- Activate first popup
UPDATE welcome_popups SET is_active = true WHERE id = 'popup-1';
-- Result: ✅ popup-1 active

-- Activate second popup
UPDATE welcome_popups SET is_active = true WHERE id = 'popup-2';
-- Result: ✅ popup-2 active, popup-1 auto-deactivated
```

### Test 2: Disable All
```sql
UPDATE welcome_popups SET is_active = false WHERE is_active = true;
-- Result: ✅ All popups deactivated
```

### Test 3: UI Flow
1. ✅ "Disable All" button hanya muncul jika ada popup aktif
2. ✅ Confirmation modal muncul sebelum disable all
3. ✅ Toast notification informatif
4. ✅ Info banner berubah warna sesuai status
5. ✅ Visual indicator (green ring) pada popup aktif

---

## 📱 User Experience

### Admin Flow
1. **View List**: Lihat semua popup dengan status aktif/tidak
2. **Toggle Individual**: Klik icon Power untuk toggle
3. **Disable All**: Klik "Disable All" untuk nonaktifkan semua
4. **Visual Feedback**: 
   - Green ring pada popup aktif
   - Green badge "Active"
   - Info banner dinamis
   - Toast notifications

### Visitor Experience
- Hanya melihat popup yang `is_active = true`
- Jika tidak ada popup aktif, tidak ada yang ditampilkan
- Popup muncul sekali per session (localStorage)

---

## 🔒 Security & Validation

### Database Level
- ✅ Unique constraint mencegah multiple active popups
- ✅ Trigger otomatis enforce business logic
- ✅ RLS policies (existing)

### Application Level
- ✅ React Query cache invalidation
- ✅ Error handling dengan toast
- ✅ Loading states untuk UX
- ✅ Confirmation modals untuk destructive actions

---

## 📝 Files Modified

### Hooks
- `src/hooks/useWelcomePopups.ts`
  - Added `useDisableAllWelcomePopups()`
  - Enhanced error handling

### Components
- `src/features/admin/components/welcome-popups/WelcomePopupList.tsx`
  - Added "Disable All" button
  - Added confirmation modal
  - Enhanced visual indicators
  - Dynamic info banner
  - Improved toast messages

### Database
- Migration: `add_welcome_popup_single_active_constraint`
  - Unique partial index
  - Trigger function
  - Trigger

---

## 🚀 Usage Guide

### For Admins

#### Activate a Popup
1. Go to `/admin/welcome-popups`
2. Click Power icon on desired popup
3. Popup becomes active (others auto-deactivate)
4. Toast: "Popup diaktifkan (popup lain otomatis dinonaktifkan)"

#### Disable All Popups
1. Click "Disable All" button (top right)
2. Confirm in modal
3. All popups deactivated
4. Toast: "Semua popup berhasil dinonaktifkan"

#### Re-activate
1. Click Power icon on any popup
2. That popup becomes active again

---

## 🎯 Business Logic

### Rules
1. **Only 1 active popup** at any time (enforced by database)
2. **Auto-deactivation** when activating another popup
3. **Disable All** for quick unpublish (e.g., during maintenance)
4. **Re-activation** anytime without data loss

### Use Cases
- **Security Alert**: Activate urgent security popup
- **Maintenance**: Disable all during maintenance
- **Promo**: Switch between welcome and promo popups
- **Testing**: Disable all for testing without deleting

---

## ✅ Verification Checklist

- [x] Database constraint prevents multiple active popups
- [x] Trigger auto-deactivates other popups
- [x] UI shows "Disable All" button when needed
- [x] Confirmation modal works
- [x] Toast notifications informative
- [x] Visual indicators clear (green ring, badge)
- [x] Info banner dynamic
- [x] Mobile responsive
- [x] Error handling robust
- [x] Cache invalidation works
- [x] No console errors
- [x] Tested with multiple popups

---

## 🎉 Summary

Fitur disable/unpublish Welcome Popups telah diimplementasikan dengan:

1. **Database-level enforcement** (constraint + trigger)
2. **Clean API** (React Query hooks)
3. **Intuitive UI** (visual indicators, confirmation modals)
4. **Robust error handling** (toast notifications)
5. **Mobile-friendly** (responsive design)

Aplikasi sekarang memiliki kontrol penuh atas popup visibility dengan UX yang smooth dan business logic yang solid.

**Status**: ✅ Production Ready

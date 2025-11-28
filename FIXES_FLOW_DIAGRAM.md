# Fixes Flow Diagram

## 🔄 Tripay Payment Flow

### Before Fix (❌ 405 Error)

```
User clicks "Bayar"
       ↓
TripayPaymentModal.tsx
       ↓
tripay.service.ts
       ↓
axios.post(`${undefined}/functions/v1/tripay-create-payment`)
       ↓
❌ 405 Method Not Allowed
```

### After Fix (✅ Working)

```
User clicks "Bayar"
       ↓
TripayPaymentModal.tsx
       ↓
tripay.service.ts
       ↓
Validate VITE_SUPABASE_URL
       ↓
axios.post(`${supabaseUrl}/functions/v1/tripay-create-payment`)
       ↓
Edge Function processes request
       ↓
✅ 200 OK - Payment created
       ↓
Modal shows QR code/instructions
```

---

## 🔓 Welcome Popup Access Flow

### Before Fix (❌ 406 Error)

```
Anonymous user visits homepage
       ↓
useWelcomePopup hook
       ↓
supabase.from('welcome_popups').select('*').eq('is_active', true)
       ↓
RLS Policy: "Anyone can view active welcome popups"
       ↓
Policy requires: EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid())
       ↓
❌ 406 Not Acceptable (no auth.uid() for anonymous)
```

### After Fix (✅ Working)

```
Anonymous user visits homepage
       ↓
useWelcomePopup hook
       ↓
supabase.from('welcome_popups').select('*').eq('is_active', true)
       ↓
RLS Policy: "allow_public_read_active_popups"
       ↓
Policy allows: TO public USING (is_active = true)
       ↓
✅ 200 OK - Popup data returned
       ↓
Popup displays on homepage
```

---

## ⚛️ React Props Flow

### Before Fix (⚠️ Warning)

```
<Input leftAddon="Rp" placeholder="50000" />
       ↓
Input component receives props
       ↓
const Input = ({ label, error, ...props }, ref) => {
  // leftAddon NOT destructured
       ↓
<input {...props} />  // leftAddon spread to DOM
       ↓
⚠️ React Warning: leftAddon not recognized
```

### After Fix (✅ Clean)

```
<Input leftAddon="Rp" placeholder="50000" />
       ↓
Input component receives props
       ↓
const Input = ({ label, error, leftAddon, rightAddon, ...props }, ref) => {
  // leftAddon properly destructured
       ↓
{leftAddon && <span>{leftAddon}</span>}
<input {...props} />  // leftAddon NOT spread to DOM
       ↓
✅ No warnings - Proper rendering
```

---

## 🔌 WebSocket Subscription Flow

### Before Fix (🔄 Rapid Reconnects)

```
User logs in
       ↓
AuthContext useEffect runs
       ↓
Dependencies: [user?.id, user?.role, user?.balance, notification]
       ↓
Create Realtime channel
       ↓
Subscribe to user changes
       ↓
User balance updates
       ↓
useEffect dependencies change (user.balance)
       ↓
Cleanup: channel.unsubscribe().then(() => removeChannel())
       ↓
useEffect runs again (new subscription)
       ↓
🔄 Repeat every state change
       ↓
❌ WebSocket closed before connection established
```

### After Fix (✅ Stable)

```
User logs in
       ↓
AuthContext useEffect runs
       ↓
Dependencies: [user?.id, notification]  ← Minimal
       ↓
Create Realtime channel
       ↓
Subscribe to user changes
       ↓
User balance updates
       ↓
setUser((prevUser) => ({ ...prevUser, balance: newBalance }))
       ↓
useEffect dependencies unchanged (user.id same)
       ↓
✅ No re-subscription
       ↓
Channel stays open
       ↓
✅ Stable WebSocket connection
```

---

## 🎨 Input Addon Rendering

### Component Structure

```
<Input leftAddon="Rp" placeholder="50000" />
       ↓
┌─────────────────────────────────────┐
│ <div className="w-full">           │
│   <label>Label</label>              │
│                                     │
│   <div className="flex">            │
│     ┌────┬──────────────────────┐  │
│     │ Rp │ [Input Field]        │  │
│     └────┴──────────────────────┘  │
│     ↑         ↑                     │
│   leftAddon  input                  │
│   </div>                            │
│                                     │
│   <p>Helper text</p>                │
│ </div>                              │
└─────────────────────────────────────┘
```

### Styling Flow

```
leftAddon present?
       ↓
    Yes ─────────────────┐
       ↓                 ↓
Render addon span    Input gets:
- bg-gray-50         - rounded-l-none
- border-gray-300    - pl-3
- rounded-l-lg       
- px-3               
       ↓                 ↓
    ┌────┬──────────────┐
    │ Rp │ Input        │
    └────┴──────────────┘
```

---

## 🔄 Complete User Journey

### Top-Up Flow (End-to-End)

```
1. User Login
   ↓
2. Navigate to /top-up
   ↓
3. See payment methods (QRIS, BCA, etc.)
   ↓
4. Enter amount in input with "Rp" prefix
   ├─ Input component renders leftAddon ✅
   └─ No React warnings ✅
   ↓
5. Click "Bayar Sekarang"
   ↓
6. TripayPaymentModal opens
   ↓
7. Service validates VITE_SUPABASE_URL ✅
   ↓
8. POST to Edge Function
   ├─ URL: https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-create-payment ✅
   └─ No 405 error ✅
   ↓
9. Edge Function creates payment
   ↓
10. Response with QR code/instructions
    ↓
11. Modal displays payment details
    ↓
12. User completes payment
    ↓
13. Webhook updates transaction
    ↓
14. Realtime updates balance
    ├─ WebSocket stable ✅
    └─ No reconnects ✅
    ↓
15. User sees updated balance
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │   Homepage   │    │   Top-Up     │                  │
│  │              │    │              │                  │
│  │ Welcome      │    │ Input with   │                  │
│  │ Popup ✅     │    │ Addon ✅     │                  │
│  └──────┬───────┘    └──────┬───────┘                  │
│         │                   │                           │
│         │                   │                           │
│  ┌──────▼───────────────────▼───────┐                  │
│  │      Supabase Client              │                  │
│  │  - Auth                           │                  │
│  │  - Database (RLS ✅)              │                  │
│  │  - Realtime (Optimized ✅)        │                  │
│  │  - Edge Functions (URL Fixed ✅)  │                  │
│  └───────────────────────────────────┘                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
                         │
                         │
┌────────────────────────▼─────────────────────────────────┐
│                  Supabase Backend                         │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  Database   │  │ Edge         │  │  Realtime      │  │
│  │             │  │ Functions    │  │  WebSocket     │  │
│  │ - RLS ✅    │  │              │  │                │  │
│  │ - Policies  │  │ - Tripay ✅  │  │ - Stable ✅    │  │
│  └─────────────┘  └──────────────┘  └────────────────┘  │
│                                                           │
└───────────────────────────────────────────────────────────┘
                         │
                         │
┌────────────────────────▼─────────────────────────────────┐
│              External Services                            │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Tripay Payment Gateway                             │ │
│  │  - Sandbox Mode                                     │ │
│  │  - Payment Methods                                  │ │
│  │  - Webhooks                                         │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 🔍 Error Detection Flow

### Console Error Monitoring

```
Browser Console
       ↓
Error detected
       ↓
┌─────────────────────────────────────┐
│ Error Type?                         │
├─────────────────────────────────────┤
│                                     │
│ 405 → Check Tripay URL              │
│ 406 → Check RLS Policy              │
│ React Warning → Check Props         │
│ WebSocket → Check Subscription      │
│                                     │
└─────────────────────────────────────┘
       ↓
Apply appropriate fix
       ↓
Verify in console
       ↓
✅ Error resolved
```

---

## 📊 State Management Flow

### User State with Realtime

```
Initial State
       ↓
{ id: 'xxx', balance: 50000, role: 'member' }
       ↓
Realtime subscription active
       ↓
Database update: balance = 60000
       ↓
Realtime event received
       ↓
setUser((prevUser) => ({
  ...prevUser,
  balance: 60000  ← Updated
}))
       ↓
Component re-renders
       ↓
UI shows new balance
       ↓
useEffect dependencies: [user?.id, notification]
       ↓
✅ No re-subscription (user.id unchanged)
```

---

**Diagram Version:** 1.0  
**Last Updated:** 2025-11-28  
**Purpose:** Visual understanding of fixes

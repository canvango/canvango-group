# Login UX - Visual Guide

## 🎨 Before & After Comparison

### Before Implementation ❌

```
┌─────────────────────────────────────┐
│  Login Form                         │
├─────────────────────────────────────┤
│                                     │
│  Username: [________________]       │
│                                     │
│  Password: [________________]       │
│                                     │
│  [x] Remember me   Forgot password? │
│                                     │
│  [ Login Button ]                   │
│                                     │
│  (No error message shown)           │
│  (Form clears on error)             │
│                                     │
└─────────────────────────────────────┘

Problems:
- No visual feedback when login fails
- Form becomes empty after error
- User must retype everything
- Frustrating experience
```

### After Implementation ✅

```
┌─────────────────────────────────────┐
│  Login Form                         │
├─────────────────────────────────────┤
│                                     │
│  Username: [wronguser_______]       │
│                                     │
│  Password: [wrongpass_______]       │
│                                     │
│  ╔═══════════════════════════════╗ │
│  ║ ⚠️ Username atau password     ║ │
│  ║    salah. Silakan coba lagi.  ║ │
│  ╚═══════════════════════════════╝ │
│  (Red box with shake animation)     │
│                                     │
│  [x] Remember me   Forgot password? │
│                                     │
│  [ Login Button ]                   │
│                                     │
└─────────────────────────────────────┘

Improvements:
✅ Clear error message in red box
✅ Shake animation draws attention
✅ Form values preserved
✅ User can immediately correct input
```

## 🎬 Animation Flow

### Shake Animation Sequence

```
Frame 1 (0ms):     [Error Box]
                        ↓
Frame 2 (50ms):   [Error Box]  ← moves left
                        ↓
Frame 3 (100ms):    [Error Box]  → moves right
                        ↓
Frame 4 (150ms):  [Error Box]  ← moves left
                        ↓
Frame 5 (200ms):    [Error Box]  → moves right
                        ↓
Frame 6 (250ms):  [Error Box]  ← moves left
                        ↓
Frame 7 (300ms):    [Error Box]  → moves right
                        ↓
Frame 8 (350ms):  [Error Box]  ← moves left
                        ↓
Frame 9 (400ms):    [Error Box]  → moves right
                        ↓
Frame 10 (500ms):   [Error Box]  ← back to center

Total duration: 0.5 seconds
Movement: ±4px horizontal
Easing: ease-in-out
```

## 🎨 Error Message Styling

### Color Palette

```css
Background:  #FEF2F2  (bg-red-50)   - Very light red
Border:      #FECACA  (border-red-200) - Light red
Text:        #991B1B  (text-red-700)   - Dark red
Icon:        #EF4444  (text-red-500)   - Medium red
```

### Layout Structure

```
┌─────────────────────────────────────────────┐
│ ┌─────┐                                     │
│ │  ⚠️  │  Username atau password salah.     │
│ │     │  Silakan coba lagi.                 │
│ └─────┘                                     │
└─────────────────────────────────────────────┘
  Icon     Error Message Text
  (20px)   (14px, font-medium)
  
Padding: 12px (p-3)
Gap: 8px (gap-2)
Border Radius: 12px (rounded-xl)
Border Width: 1px
```

## 📱 Responsive Behavior

### Mobile View (< 768px)

```
┌───────────────────────┐
│  Login Form           │
├───────────────────────┤
│                       │
│  Username:            │
│  [_________________]  │
│                       │
│  Password:            │
│  [_________________]  │
│                       │
│  ┌─────────────────┐  │
│  │ ⚠️ Error here   │  │
│  │ Full width box  │  │
│  └─────────────────┘  │
│                       │
│  [ Login Button ]     │
│                       │
└───────────────────────┘

- Full width error box
- Smaller text (text-sm)
- Adequate touch targets
- Proper spacing
```

### Desktop View (≥ 768px)

```
┌─────────────────────────────────────┐
│  Login Form                         │
├─────────────────────────────────────┤
│                                     │
│  Username: [________________]       │
│                                     │
│  Password: [________________]       │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ ⚠️ Error message here         │  │
│  │ Wider box, same styling       │  │
│  └───────────────────────────────┘  │
│                                     │
│  [ Login Button ]                   │
│                                     │
└─────────────────────────────────────┘

- Max-width container
- Larger text
- Better spacing
- Centered layout
```

## 🔄 User Interaction Flow

### Scenario 1: Wrong Password

```
Step 1: User fills form
┌─────────────────────┐
│ Username: admin     │
│ Password: wrong123  │
│ [ Login ]           │
└─────────────────────┘

Step 2: Click Login
        ↓
    [Loading...]

Step 3: Error appears
┌─────────────────────┐
│ Username: admin     │ ← Still filled
│ Password: wrong123  │ ← Still filled
│ ⚠️ Username atau    │ ← Shake animation
│    password salah   │
│ [ Login ]           │
└─────────────────────┘

Step 4: User corrects
┌─────────────────────┐
│ Username: admin     │ ← Unchanged
│ Password: correct   │ ← Only this changed
│ [ Login ]           │
└─────────────────────┘

Step 5: Success!
        ↓
   Redirect to Dashboard
```

### Scenario 2: Empty Fields

```
Step 1: User clicks Login without filling
┌─────────────────────┐
│ Username: [_____]   │
│ Password: [_____]   │
│ [ Login ]           │
└─────────────────────┘

Step 2: Validation errors appear
┌─────────────────────┐
│ Username: [_____]   │
│ ⚠️ Required         │ ← Field-level error
│                     │
│ Password: [_____]   │
│ ⚠️ Required         │ ← Field-level error
│                     │
│ [ Login ]           │
└─────────────────────┘

(No API call made - client-side validation)
```

## 🎯 Error Message Types

### 1. Invalid Credentials
```
┌─────────────────────────────────────┐
│ ⚠️ Username atau password salah.    │
│    Silakan coba lagi.               │
└─────────────────────────────────────┘
```

### 2. Email Not Verified
```
┌─────────────────────────────────────┐
│ ⚠️ Email belum diverifikasi.        │
│    Silakan cek email Anda.          │
└─────────────────────────────────────┘
```

### 3. Rate Limiting
```
┌─────────────────────────────────────┐
│ ⚠️ Terlalu banyak percobaan login.  │
│    Silakan coba lagi nanti.         │
└─────────────────────────────────────┘
```

### 4. Generic Error
```
┌─────────────────────────────────────┐
│ ⚠️ Login gagal.                     │
│    Silakan coba lagi.               │
└─────────────────────────────────────┘
```

## 🎨 CSS Implementation

### Shake Animation Keyframes

```css
@keyframes shake {
  0%, 100% { 
    transform: translateX(0); 
  }
  10%, 30%, 50%, 70%, 90% { 
    transform: translateX(-4px); 
  }
  20%, 40%, 60%, 80% { 
    transform: translateX(4px); 
  }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}
```

### Usage in Component

```tsx
<div className="animate-shake">
  {/* Error content */}
</div>
```

## 📊 Visual Metrics

### Spacing
- Error box padding: 12px (p-3)
- Gap between icon and text: 8px (gap-2)
- Margin below error: 0 (integrated in form flow)

### Typography
- Error text size: 14px (text-sm)
- Font weight: 500 (font-medium)
- Line height: 1.5

### Colors
- Background opacity: 100% (solid)
- Border opacity: 100% (solid)
- Text contrast ratio: 7:1 (WCAG AAA)

### Animation
- Duration: 500ms
- Timing: ease-in-out
- Movement: ±4px
- Frequency: 5 shakes

## 🎭 State Transitions

```
Initial State
     ↓
User Input
     ↓
Validation
     ↓
Submit (Loading)
     ↓
  ┌──┴──┐
  ↓     ↓
Error  Success
  ↓     ↓
Show   Redirect
Error
  ↓
Preserve
Form
  ↓
User
Corrects
  ↓
Try Again
```

## ✅ Accessibility Features

### Visual
- High contrast colors
- Clear error icon
- Readable font size
- Proper spacing

### Interaction
- Keyboard navigation works
- Focus states visible
- Error announced to screen readers
- Touch targets adequate (44px min)

### Content
- Clear error messages
- Indonesian language
- No jargon
- Actionable guidance

---

**Visual Guide Complete**
**Status:** Ready for Implementation Review
**Date:** 2025-11-26

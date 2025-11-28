# Turnstile Homepage Protection - UI Preview

## Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│                     [Full Page - Gray BG]                     │
│                                                               │
│    ┌───────────────────────────────────────────────────┐    │
│    │                                                     │    │
│    │  ┌─────────────────────────────────────────────┐  │    │
│    │  │  [Logo]  CANVANGO GROUP                     │  │    │
│    │  │  (White rounded background with shadow)     │  │    │
│    │  └─────────────────────────────────────────────┘  │    │
│    │                                                     │    │
│    │              canvango.com                           │    │
│    │         (Large, bold, gray-900)                     │    │
│    │                                                     │    │
│    │    Verify you are human by completing              │    │
│    │           the action below.                         │    │
│    │         (Small, gray-700)                           │    │
│    │                                                     │    │
│    │         ┌─────────────────────────┐                │    │
│    │         │                         │                │    │
│    │         │  [Turnstile Widget]     │                │    │
│    │         │   (Cloudflare CAPTCHA)  │                │    │
│    │         │                         │                │    │
│    │         └─────────────────────────┘                │    │
│    │                                                     │    │
│    │         [Loading Spinner] Memverifikasi...         │    │
│    │         (Only shown during verification)           │    │
│    │                                                     │    │
│    │    canvango.com needs to review the security       │    │
│    │       of your connection before proceeding.        │    │
│    │              (Tiny, gray-500)                       │    │
│    │                                                     │    │
│    │  ─────────────────────────────────────────────────  │    │
│    │                                                     │    │
│    │    Performance & security by Cloudflare            │    │
│    │              (Link, blue-600)                       │    │
│    │                                                     │    │
│    └───────────────────────────────────────────────────┘    │
│                                                               │
│                  [White Card - rounded-3xl]                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Color Scheme

### Background
- Page: `bg-gray-50` (#F9FAFB)
- Card: `bg-white` (#FFFFFF)
- Logo container: `bg-white` with shadow

### Text Colors (sesuai standards)
- Title "canvango.com": `text-gray-900` (#111827)
- Description: `text-gray-700` (#374151)
- Security notice: `text-gray-500` (#6B7280)
- Cloudflare link: `text-blue-600` (#2563EB)

### Brand Color
- "CANVANGO GROUP" text: `#5271ff` (custom blue)

## Typography (sesuai standards)

### Headings
```css
/* Logo text */
font-size: 20px (text-xl)
font-weight: 700 (font-bold)
color: #5271ff

/* Main title */
font-size: 24px → 30px (text-2xl md:text-3xl)
font-weight: 600 (font-semibold)
color: text-gray-900
```

### Body Text
```css
/* Description */
font-size: 14px (text-sm)
color: text-gray-700
line-height: 1.625 (leading-relaxed)

/* Security notice */
font-size: 12px (text-xs)
color: text-gray-500
line-height: 1.625 (leading-relaxed)
```

## Spacing & Layout

### Card
```css
max-width: 28rem (max-w-md)
padding: 2rem (p-8)
border-radius: 1.5rem (rounded-3xl)
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
```

### Logo Container
```css
padding: 0.75rem 1.5rem (px-6 py-3)
border-radius: 9999px (rounded-full)
gap: 0.75rem (gap-3)
```

### Spacing Between Elements
```css
Logo → Title: 1.5rem (mb-6)
Title → Description: 0.5rem (mb-2)
Description → Turnstile: 1.5rem (mb-6)
Turnstile → Loading: 1rem (mb-4)
Loading → Notice: 1.5rem (mt-6)
Notice → Footer: 2rem (mt-8, pt-6)
```

## Responsive Behavior

### Mobile (< 768px)
- Title: `text-2xl` (24px)
- Logo height: `h-10` (40px)
- Card padding: `p-8` (32px)
- Horizontal padding: `px-4` (16px)

### Desktop (≥ 768px)
- Title: `text-3xl` (30px)
- Logo height: `h-10` (40px)
- Card padding: `p-8` (32px)
- Horizontal padding: `px-4` (16px)

## Interactive States

### Turnstile Widget
- **Idle:** Waiting for user interaction
- **Active:** User completing challenge
- **Success:** Auto-verify, show loading spinner
- **Error:** Reset widget, show error message

### Loading State
```
[Spinner Icon] Memverifikasi...
```
- Spinner: Rotating animation
- Text: `text-sm text-gray-600`
- Display: `flex items-center justify-center gap-2`

## Accessibility

### Semantic HTML
```html
<div role="main" aria-label="Security verification">
  <h1>canvango.com</h1>
  <p>Verify you are human...</p>
  <!-- Turnstile widget -->
</div>
```

### Focus States
- Turnstile widget: Keyboard accessible
- Cloudflare link: Focus ring visible

### Screen Reader
- Logo: `alt="Canvango Group"`
- Loading: `aria-live="polite"`

## Animation

### Loading Spinner
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

### Card Entrance (optional)
```css
/* Fade in animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

## Comparison with tripay.co.id

### Similarities ✅
- Full page overlay
- Centered card layout
- Turnstile widget centered
- Security notice text
- Cloudflare branding

### Differences
- **Logo:** Canvango Group (vs tripay.co.id)
- **Colors:** Blue `#5271ff` (vs tripay colors)
- **Border radius:** `rounded-3xl` (vs tripay's radius)
- **Session storage:** 5 min expiry (custom feature)

## Dark Mode Support (Future)

```css
/* Dark mode classes (not implemented yet) */
.dark .bg-gray-50 { background: #111827; }
.dark .bg-white { background: #1F2937; }
.dark .text-gray-900 { color: #F9FAFB; }
.dark .text-gray-700 { color: #D1D5DB; }
```

---

**Design Status:** ✅ Complete
**Follows Standards:** Typography, Colors, Border Radius
**Responsive:** Mobile & Desktop
**Accessible:** WCAG AA compliant

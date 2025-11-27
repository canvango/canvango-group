---
inclusion: always
---

# Typography Standards

## Prinsip Dasar

Aplikasi ini menggunakan **hierarki typography yang konsisten** untuk memastikan UX yang rapi dan mudah dibaca di semua perangkat.

## Font Family

```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

## Hierarki Typography

### Headings (Judul)

| Element | Class | Size | Usage |
|---------|-------|------|-------|
| H1 | `text-2xl md:text-3xl` | 24px → 30px | Page titles |
| H2 | `text-xl md:text-2xl` | 20px → 24px | Section titles |
| H3 | `text-lg md:text-xl` | 18px → 20px | Card headers, subsections |
| H4 | `text-base md:text-lg` | 16px → 18px | Small headers |

### Body Text

| Type | Class | Size | Usage |
|------|-------|------|-------|
| Large | `text-base` | 16px | Emphasis, important content |
| Normal | `text-sm` | 14px | Default body text, paragraphs |
| Small | `text-xs` | 12px | Metadata, timestamps, captions |

### UI Components

| Component | Text Size | Class |
|-----------|-----------|-------|
| **Buttons** | 14px | `text-sm` |
| **Inputs** | 14px | `text-sm` |
| **Labels** | 14px | `text-sm` |
| **Badges** | 12px | `text-xs` |
| **Tooltips** | 12px | `text-xs` |
| **Toast/Notifications** | 14px (title), 12px (desc) | `text-sm`, `text-xs` |
| **Modal Title** | 20px | `text-xl` |
| **Modal Body** | 14px | `text-sm` |
| **Table Headers** | 12px | `text-xs uppercase` |
| **Table Cells** | 14px | `text-sm` |
| **Dropdown Items** | 14px | `text-sm` |
| **Menu Items** | 14px | `text-sm` |

## Line Height Standards

| Context | Class | Value |
|---------|-------|-------|
| Headings | `leading-tight` | 1.25 |
| Body Text | `leading-normal` | 1.5 |
| Relaxed | `leading-relaxed` | 1.625 |
| Loose | `leading-loose` | 1.75 |

## Font Weight Standards

| Weight | Class | Value | Usage |
|--------|-------|-------|-------|
| Normal | `font-normal` | 400 | Body text |
| Medium | `font-medium` | 500 | Buttons, labels, emphasis |
| Semibold | `font-semibold` | 600 | Headings, important text |
| Bold | `font-bold` | 700 | Strong emphasis |

## Responsive Typography

### Mobile-First Approach

```tsx
// ✅ CORRECT - Responsive heading
<h1 className="text-2xl md:text-3xl font-semibold">
  Page Title
</h1>

// ✅ CORRECT - Responsive body text
<p className="text-sm md:text-base leading-relaxed">
  Content text
</p>
```

### Breakpoints

- Mobile: `text-sm` (14px)
- Tablet (md): `text-base` (16px)
- Desktop (lg): Same as tablet or larger

## Implementation Rules

### ✅ DO

```tsx
// Use consistent text sizes
<button className="text-sm">Submit</button>
<input className="text-sm" />
<label className="text-sm">Name</label>

// Use responsive headings
<h2 className="text-xl md:text-2xl font-semibold">Section Title</h2>

// Use proper line heights
<p className="text-sm leading-relaxed">Paragraph text</p>

// Use semantic HTML with proper classes
<h1 className="text-2xl md:text-3xl font-semibold">Main Title</h1>
```

### ❌ DON'T

```tsx
// ❌ Inconsistent sizes
<button className="text-base">Submit</button>
<input className="text-xs" />
<label className="text-lg">Name</label>

// ❌ Non-responsive headings
<h2 className="text-3xl">Section Title</h2>

// ❌ Missing line heights
<p className="text-sm">Paragraph text</p>

// ❌ Wrong semantic HTML
<div className="text-2xl font-bold">Title</div>
```

## Component-Specific Standards

### Buttons

```tsx
<button className="text-sm font-medium">
  Button Text
</button>
```

### Badges

```tsx
<span className="text-xs font-medium">
  Badge Text
</span>
```

### Toast Notifications

```tsx
<div>
  <div className="text-sm font-medium">Title</div>
  <div className="text-xs opacity-80">Description</div>
</div>
```

### Modal

```tsx
<div>
  <h2 className="text-xl font-semibold">Modal Title</h2>
  <div className="text-sm leading-relaxed">Modal content</div>
</div>
```

### Tables

```tsx
<thead>
  <th className="text-xs font-medium uppercase">Header</th>
</thead>
<tbody>
  <td className="text-sm">Cell content</td>
</tbody>
```

### Forms

```tsx
<label className="text-sm font-medium">Label</label>
<input className="text-sm" />
<span className="text-xs text-gray-500">Helper text</span>
<span className="text-xs text-red-600">Error message</span>
```

## Accessibility Requirements

1. **Minimum font size**: 14px (text-sm) untuk body text
2. **Line height**: Minimum 1.5 untuk body text
3. **Contrast ratio**: Minimum 4.5:1 untuk normal text, 3:1 untuk large text
4. **Responsive**: Text harus readable di semua ukuran layar

## Verification Checklist

Sebelum commit, pastikan:

- [ ] Semua buttons menggunakan `text-sm`
- [ ] Semua inputs menggunakan `text-sm`
- [ ] Semua badges menggunakan `text-xs`
- [ ] Semua headings responsive (text-xl md:text-2xl)
- [ ] Semua body text menggunakan `text-sm` dengan `leading-relaxed`
- [ ] Tidak ada text lebih kecil dari `text-xs` (12px)
- [ ] Semua modal titles menggunakan `text-xl`
- [ ] Semua toast notifications konsisten (text-sm untuk title, text-xs untuk description)

## Migration Guide

Jika menemukan komponen dengan typography tidak konsisten:

1. Identifikasi komponen type (button, badge, modal, etc)
2. Lihat standards di atas
3. Update class sesuai standards
4. Test di berbagai ukuran layar
5. Verify accessibility (contrast, readability)

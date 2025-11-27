---
inclusion: always
---

# Text Color Standards

## Prinsip Dasar

Gunakan **gray scale** untuk teks, bukan hitam pekat (#000000). Ini memberikan kontras yang lebih nyaman untuk mata dan menciptakan hierarki visual yang jelas.

## Color Hierarchy

### Primary Text (Teks Utama)
- **Class:** `text-gray-900`
- **Color:** #111827
- **Usage:** Headings (H1-H4), judul card, judul modal, navigation items
- **Contrast:** Sangat tinggi, mudah dibaca

### Secondary Text (Teks Body)
- **Class:** `text-gray-700`
- **Color:** #374151
- **Usage:** Body text, paragraphs, descriptions, form labels, button text
- **Contrast:** Tinggi, nyaman untuk dibaca dalam jumlah banyak

### Tertiary Text (Teks Pendukung)
- **Class:** `text-gray-600`
- **Color:** #4b5563
- **Usage:** Helper text, placeholders, secondary information
- **Contrast:** Medium-high, untuk informasi pendukung

### Muted Text (Metadata)
- **Class:** `text-gray-500`
- **Color:** #6b7280
- **Usage:** Timestamps, captions, metadata, disabled text
- **Contrast:** Medium, untuk informasi yang kurang penting

### Subtle Text (Sangat Halus)
- **Class:** `text-gray-400`
- **Color:** #9ca3af
- **Usage:** Placeholders, very subtle hints, decorative text
- **Contrast:** Low-medium, gunakan dengan hati-hati

## Component-Specific Standards

### Headings
```tsx
<h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Page Title</h1>
<h2 className="text-xl md:text-2xl font-semibold text-gray-900">Section Title</h2>
<h3 className="text-lg md:text-xl font-semibold text-gray-900">Card Header</h3>
```

### Body Text
```tsx
<p className="text-sm text-gray-700 leading-relaxed">Paragraph content</p>
<div className="text-sm text-gray-700">Body content</div>
```

### Labels & Forms
```tsx
<label className="text-sm font-medium text-gray-700">Field Label</label>
<input className="text-sm text-gray-900 placeholder:text-gray-400" placeholder="Enter text" />
<span className="text-xs text-gray-500">Helper text</span>
<span className="text-xs text-red-600">Error message</span>
```

### Buttons
```tsx
// Primary button - white text on colored background
<button className="text-sm font-medium text-white bg-blue-600">Submit</button>

// Secondary button - colored text
<button className="text-sm font-medium text-gray-700">Cancel</button>
```

### Badges
```tsx
<span className="text-xs font-medium text-gray-700">Badge Text</span>
```

### Tables
```tsx
<thead>
  <th className="text-xs font-medium uppercase text-gray-600">Header</th>
</thead>
<tbody>
  <td className="text-sm text-gray-700">Cell content</td>
  <td className="text-xs text-gray-500">Metadata</td>
</tbody>
```

### Cards
```tsx
<div className="card">
  <div className="card-header">
    <h3 className="text-lg font-semibold text-gray-900">Card Title</h3>
  </div>
  <div className="card-body">
    <p className="text-sm text-gray-700">Card content</p>
    <span className="text-xs text-gray-500">Timestamp</span>
  </div>
</div>
```

### Navigation
```tsx
<nav>
  <a className="text-sm font-medium text-gray-700 hover:text-gray-900">Menu Item</a>
  <a className="text-sm font-medium text-blue-600">Active Item</a>
</nav>
```

### Toast/Notifications
```tsx
<div>
  <div className="text-sm font-medium text-gray-900">Notification Title</div>
  <div className="text-xs text-gray-600">Notification description</div>
</div>
```

### Modal
```tsx
<div>
  <h2 className="text-xl font-semibold text-gray-900">Modal Title</h2>
  <p className="text-sm text-gray-700">Modal content</p>
</div>
```

## Implementation Rules

### ✅ DO
```tsx
// Use gray scale for text hierarchy
<h1 className="text-gray-900">Title</h1>
<p className="text-gray-700">Body text</p>
<span className="text-gray-500">Metadata</span>

// Use proper contrast for readability
<div className="bg-white">
  <p className="text-gray-700">Good contrast</p>
</div>

// Use semantic colors for status
<span className="text-green-600">Success</span>
<span className="text-red-600">Error</span>
<span className="text-yellow-600">Warning</span>
```

### ❌ DON'T
```tsx
// ❌ Never use pure black
<p className="text-black">Text</p>

// ❌ Don't use text-gray-900 for everything
<p className="text-gray-900">Body text</p>
<span className="text-gray-900">Metadata</span>

// ❌ Don't use too light colors for important text
<h1 className="text-gray-400">Title</h1>

// ❌ Don't mix inconsistent colors
<p className="text-gray-800">Some text</p>
<p className="text-gray-700">Other text</p>
<p className="text-gray-600">More text</p>
```

## Status & Semantic Colors

Untuk status, gunakan warna semantic (bukan gray):

| Status | Class | Usage |
|--------|-------|-------|
| Success | `text-green-600` | Success messages, completed status |
| Error | `text-red-600` | Error messages, failed status |
| Warning | `text-yellow-600` | Warning messages, pending status |
| Info | `text-blue-600` | Info messages, links, active states |

## Accessibility Requirements

1. **Minimum contrast ratio:** 4.5:1 untuk normal text, 3:1 untuk large text
2. **text-gray-900** dan **text-gray-700** memenuhi WCAG AA pada background putih
3. **text-gray-500** dan lebih terang hanya untuk non-critical text
4. Gunakan **font-medium** atau **font-semibold** untuk meningkatkan readability

## Migration Checklist

Saat update komponen:

- [ ] Headings menggunakan `text-gray-900`
- [ ] Body text menggunakan `text-gray-700`
- [ ] Metadata/timestamps menggunakan `text-gray-500`
- [ ] Labels menggunakan `text-gray-700`
- [ ] Placeholders menggunakan `text-gray-400`
- [ ] Tidak ada `text-black` di manapun
- [ ] Status colors (green/red/yellow/blue) hanya untuk semantic meaning
- [ ] Contrast ratio memenuhi WCAG AA

## Quick Reference

```tsx
// Hierarchy template
<div>
  <h2 className="text-xl font-semibold text-gray-900">Title</h2>
  <p className="text-sm text-gray-700">Main content</p>
  <span className="text-xs text-gray-500">Metadata</span>
</div>
```

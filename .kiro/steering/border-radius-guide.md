---
inclusion: always
---

# Border Radius Quick Reference

## 🎯 Standar Lengkungan Sudut

Gunakan hierarki border-radius yang konsisten untuk semua komponen baru:

### Large Containers → rounded-3xl (24px)
```tsx
// Cards, Modals, Tables
<div className="bg-white rounded-3xl shadow p-6">
  {/* content */}
</div>
```

### Medium Elements → rounded-2xl (16px)
```tsx
// Badges, Pills, Icon Containers
<span className="inline-flex items-center px-3 py-1.5 rounded-2xl bg-green-100">
  Active
</span>
```

### Small Elements → rounded-xl (12px)
```tsx
// Buttons, Inputs, Dropdowns
<button className="px-4 py-2 rounded-xl bg-indigo-600 text-white">
  Submit
</button>
```

## 🚀 Global Classes (Preferred)

Gunakan class global yang sudah didefinisikan di `src/index.css`:

```tsx
// ✅ RECOMMENDED - Uses global classes
<div className="card">
  <div className="card-header">
    <h2>Title</h2>
  </div>
  <div className="card-body">
    <p>Content</p>
  </div>
</div>

<button className="btn-primary">Submit</button>
<button className="btn-secondary">Cancel</button>

<span className="badge badge-success">Active</span>
<span className="badge badge-warning">Pending</span>

<input className="input" type="text" />
```

## ❌ Avoid

```tsx
// ❌ DON'T - Inconsistent radius
<div className="rounded-lg">  // Deprecated
<div className="rounded-md">  // Too small
<div className="rounded-sm">  // Too small

// ❌ DON'T - Override without reason
<div className="card rounded-sm">  // Breaks consistency
```

## 📋 Quick Reference Table

| Element | Class | Size | Example |
|---------|-------|------|---------|
| Card | `rounded-3xl` | 24px | Product cards, modals |
| Badge | `rounded-2xl` | 16px | Status, category |
| Button | `rounded-xl` | 12px | All buttons |
| Input | `rounded-xl` | 12px | Text inputs |
| Dropdown | `rounded-2xl` | 16px | Select menus |
| Tooltip | `rounded-2xl` | 16px | Hover tooltips |
| Icon Box | `rounded-2xl` | 16px | Icon containers |
| Circular | `rounded-full` | 50% | Avatars, dots |

## 🔗 Full Documentation

See `BORDER_RADIUS_STANDARDS.md` for complete guidelines.

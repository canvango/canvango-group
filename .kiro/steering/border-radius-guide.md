---
inclusion: always
---

# Border Radius Standards

## Hierarchy

Use consistent border-radius for all components:

**Large Containers** → `rounded-3xl` (24px)
- Cards, modals, tables

**Medium Elements** → `rounded-2xl` (16px)
- Badges, pills, icon containers, dropdowns, tooltips

**Small Elements** → `rounded-xl` (12px)
- Buttons, inputs

**Circular** → `rounded-full` (50%)
- Avatars, dots

## Preferred: Global Classes

Use global classes from `src/index.css`:

```tsx
// ✅ CORRECT - Global classes
<div className="card">
  <div className="card-header"><h2>Title</h2></div>
  <div className="card-body"><p>Content</p></div>
</div>

<button className="btn-primary">Submit</button>
<button className="btn-secondary">Cancel</button>

<span className="badge badge-success">Active</span>
<input className="input" type="text" />
```

## Direct Tailwind Usage

```tsx
// ✅ CORRECT - Consistent hierarchy
<div className="rounded-3xl">  // Large containers
<span className="rounded-2xl"> // Medium elements
<button className="rounded-xl"> // Small elements
```

## Anti-Patterns

```tsx
// ❌ WRONG - Inconsistent/deprecated
<div className="rounded-lg">  // Deprecated
<div className="rounded-md">  // Too small
<div className="rounded-sm">  // Too small
<div className="card rounded-sm">  // Breaks consistency
```

## Quick Reference

| Element | Class | Size |
|---------|-------|------|
| Card/Modal/Table | `rounded-3xl` | 24px |
| Badge/Dropdown/Tooltip | `rounded-2xl` | 16px |
| Button/Input | `rounded-xl` | 12px |
| Avatar/Dot | `rounded-full` | 50% |

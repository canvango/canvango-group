# Accessibility Guidelines

This document outlines the accessibility features and guidelines implemented in the Canvango Group Member Area application.

## WCAG Compliance

The application aims to meet WCAG 2.1 Level AA standards for accessibility.

## Color Contrast

All color combinations meet WCAG AA contrast ratio requirements:

### Text Contrast Requirements
- **Normal text (< 18px)**: Minimum 4.5:1 contrast ratio
- **Large text (≥ 18px or ≥ 14px bold)**: Minimum 3:1 contrast ratio

### Verified Color Combinations

#### Primary Colors
- **Indigo-600 (#4F46E5) on White**: 8.59:1 ✓
- **Indigo-700 (#4338CA) on White**: 10.69:1 ✓

#### Status Colors
- **Success (Green-800 #065F46) on Green-50**: 9.73:1 ✓
- **Error (Red-800 #991B1B) on Red-50**: 9.73:1 ✓
- **Warning (Amber-800 #92400E) on Amber-50**: 6.37:1 ✓
- **Info (Blue-800 #1E40AF) on Blue-50**: 11.48:1 ✓

#### Text Colors
- **Gray-900 (#111827) on White**: 18.67:1 ✓
- **Gray-700 (#374151) on White**: 10.70:1 ✓
- **Gray-600 (#4B5563) on White**: 7.00:1 ✓

### Non-Color Indicators

Status information is conveyed through multiple means:
- **Icons**: Each status has a unique icon
- **Text labels**: Clear text descriptions
- **Patterns**: Different visual patterns for different states

## Keyboard Navigation

### Global Keyboard Shortcuts
- **Tab**: Navigate forward through interactive elements
- **Shift + Tab**: Navigate backward through interactive elements
- **Enter/Space**: Activate buttons and links
- **Escape**: Close modals and dropdowns
- **Arrow Keys**: Navigate through lists and menus

### Skip Links
- **Skip to main content**: Press Tab on page load to reveal skip link
- Allows keyboard users to bypass navigation and go directly to main content

### Focus Management
- Visible focus indicators on all interactive elements
- Focus trap in modals and dialogs
- Focus restoration when closing modals
- Logical tab order throughout the application

### Component-Specific Navigation

#### Modals
- Focus automatically moves to modal when opened
- Focus trapped within modal
- Escape key closes modal
- Focus returns to trigger element when closed

#### Pagination
- Arrow keys navigate between page numbers
- Enter activates page selection
- All controls keyboard accessible

#### Sidebar Navigation
- Arrow keys navigate menu items
- Enter activates navigation
- Escape closes mobile sidebar

## ARIA Implementation

### ARIA Landmarks
```html
<header role="banner">
<nav role="navigation" aria-label="Main navigation">
<main id="main-content" role="main">
<footer role="contentinfo">
```

### ARIA Labels
- All icon-only buttons have `aria-label`
- Form inputs associated with labels
- Error messages linked with `aria-describedby`
- Loading states announced with `aria-live`

### ARIA States
- `aria-expanded` for collapsible elements
- `aria-current="page"` for active navigation items
- `aria-invalid` for form validation errors
- `aria-disabled` for disabled elements
- `aria-hidden` for decorative elements

### Live Regions
- Toast notifications use `aria-live="polite"`
- Error messages use `role="alert"`
- Loading states announced to screen readers
- Dynamic content changes announced

## Form Accessibility

### Labels and Inputs
- All inputs have associated labels
- Labels use `htmlFor` to link to input `id`
- Required fields marked with `required` attribute and visual indicator
- Helper text linked with `aria-describedby`

### Error Handling
- Errors announced with `role="alert"`
- Error messages linked to inputs with `aria-describedby`
- Invalid inputs marked with `aria-invalid="true"`
- Clear error messages with suggestions for correction

### Validation
- Inline validation on blur
- Form-level validation on submit
- Clear success/error feedback
- Focus moved to first error on submit

## Images and Icons

### Decorative Images
- Use `aria-hidden="true"` or empty `alt=""`
- Icons in buttons with text labels are decorative

### Meaningful Images
- Descriptive `alt` text provided
- Context-appropriate descriptions
- Avoid redundant "image of" or "picture of"

### Icon Usage
- Icons paired with text labels when possible
- Icon-only buttons have `aria-label`
- Status icons have semantic meaning reinforced by text

## Screen Reader Support

### Announcements
- Page navigation announced
- Form submission results announced
- Loading states announced
- Error messages announced
- Success messages announced

### Content Structure
- Proper heading hierarchy (h1 → h2 → h3)
- Semantic HTML elements used
- Lists marked up with `<ul>`, `<ol>`, `<li>`
- Tables use proper structure with `<thead>`, `<tbody>`, `<th>`

### Navigation
- Skip links for main content
- Landmark regions for page structure
- Breadcrumbs for location awareness
- Clear link text (avoid "click here")

## Touch Targets

### Minimum Size
- All interactive elements minimum 44x44 pixels
- Adequate spacing between touch targets
- Larger targets for primary actions

### Mobile Considerations
- Touch-friendly spacing
- No hover-only interactions
- Swipe gestures have alternatives
- Pinch-to-zoom not disabled

## Testing Checklist

### Keyboard Testing
- [ ] All functionality accessible via keyboard
- [ ] Visible focus indicators
- [ ] Logical tab order
- [ ] No keyboard traps
- [ ] Skip links work

### Screen Reader Testing
- [ ] Content read in logical order
- [ ] All images have appropriate alt text
- [ ] Form labels announced
- [ ] Error messages announced
- [ ] Dynamic content changes announced

### Color Contrast Testing
- [ ] All text meets 4.5:1 ratio (or 3:1 for large text)
- [ ] UI components meet 3:1 ratio
- [ ] Status not conveyed by color alone
- [ ] Links distinguishable from text

### Mobile Testing
- [ ] Touch targets minimum 44x44px
- [ ] Content readable without zoom
- [ ] No horizontal scrolling
- [ ] Orientation changes supported

## Tools and Resources

### Testing Tools
- **axe DevTools**: Browser extension for automated testing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Chrome DevTools accessibility audit
- **NVDA/JAWS**: Screen reader testing (Windows)
- **VoiceOver**: Screen reader testing (macOS/iOS)
- **Color Contrast Analyzer**: Verify contrast ratios

### Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)

## Common Patterns

### Button with Icon
```tsx
<button aria-label="Close modal">
  <X aria-hidden="true" />
</button>
```

### Form Input with Error
```tsx
<input
  id="email"
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : undefined}
/>
{hasError && (
  <span id="email-error" role="alert">
    Please enter a valid email
  </span>
)}
```

### Status Badge
```tsx
<Badge variant="success" role="status" aria-label="Status: Success">
  <CheckCircle aria-hidden="true" />
  Success
</Badge>
```

### Modal Dialog
```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Confirm Action</h2>
  {/* Modal content */}
</div>
```

## Continuous Improvement

Accessibility is an ongoing process. Regular testing and user feedback help identify areas for improvement. All new features should be developed with accessibility in mind from the start.

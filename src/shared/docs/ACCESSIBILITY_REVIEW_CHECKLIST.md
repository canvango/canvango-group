# Accessibility Review Checklist

Comprehensive checklist for ensuring WCAG 2.1 Level AA compliance.

## Automated Testing

### ✅ Run Automated Tests

```bash
# Install axe-core
npm install --save-dev @axe-core/react

# Run accessibility tests
npm run test:a11y
```

### Tools

- **axe DevTools**: Browser extension for automated testing
- **Lighthouse**: Built into Chrome DevTools
- **WAVE**: Web accessibility evaluation tool
- **Pa11y**: Command-line accessibility testing

## Keyboard Navigation

### ✅ Keyboard Navigation Checklist

- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical and follows visual flow
- [ ] Focus indicators are visible on all elements
- [ ] No keyboard traps (can navigate in and out)
- [ ] Skip links are available for main content
- [ ] Dropdown menus work with arrow keys
- [ ] Modals trap focus appropriately
- [ ] ESC key closes modals and dropdowns

### Testing Steps

1. **Tab through entire page**
   - Start from top
   - Tab through all interactive elements
   - Verify focus is visible
   - Check tab order is logical

2. **Test keyboard shortcuts**
   - ESC to close modals
   - Enter to submit forms
   - Space to toggle checkboxes
   - Arrow keys for navigation

3. **Test without mouse**
   - Complete all tasks using only keyboard
   - Verify all functionality is accessible

### Common Issues

```tsx
// ❌ Bad: No keyboard access
<div onClick={handleClick}>Click me</div>

// ✅ Good: Keyboard accessible
<button onClick={handleClick}>Click me</button>

// ❌ Bad: No visible focus
<button className="focus:outline-none">Click me</button>

// ✅ Good: Visible focus
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500">
  Click me
</button>
```

## Screen Reader Testing

### ✅ Screen Reader Checklist

- [ ] All images have descriptive alt text
- [ ] Form inputs have associated labels
- [ ] Buttons have descriptive text or aria-label
- [ ] Links have descriptive text
- [ ] Headings follow proper hierarchy (h1 → h2 → h3)
- [ ] ARIA labels are used appropriately
- [ ] Dynamic content changes are announced
- [ ] Error messages are announced
- [ ] Loading states are announced

### Testing with Screen Readers

**Windows**: NVDA (free) or JAWS
**Mac**: VoiceOver (built-in)
**Linux**: Orca

### VoiceOver Commands (Mac)

- **Start**: Cmd + F5
- **Navigate**: VO + Arrow keys
- **Read**: VO + A
- **Stop**: Control
- **Interact**: VO + Shift + Down Arrow

### Testing Steps

1. **Navigate with screen reader**
   - Listen to page structure
   - Verify all content is announced
   - Check heading hierarchy

2. **Test forms**
   - Verify labels are announced
   - Check error messages are read
   - Test required field indicators

3. **Test interactive elements**
   - Verify button purposes are clear
   - Check link destinations are descriptive
   - Test modal announcements

### Common Issues

```tsx
// ❌ Bad: No alt text
<img src="/product.jpg" />

// ✅ Good: Descriptive alt text
<img src="/product.jpg" alt="Blue widget with chrome finish" />

// ❌ Bad: No label
<input type="text" placeholder="Email" />

// ✅ Good: Associated label
<label htmlFor="email">Email</label>
<input id="email" type="text" />

// ❌ Bad: Generic link text
<a href="/products/1">Click here</a>

// ✅ Good: Descriptive link text
<a href="/products/1">View Blue Widget details</a>
```

## ARIA Labels and Roles

### ✅ ARIA Checklist

- [ ] ARIA labels are used for icon buttons
- [ ] ARIA roles are appropriate
- [ ] ARIA live regions for dynamic content
- [ ] ARIA expanded for dropdowns
- [ ] ARIA selected for tabs
- [ ] ARIA hidden for decorative elements
- [ ] ARIA describedby for additional context

### ARIA Best Practices

```tsx
// Icon button with aria-label
<button aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>

// Dropdown with aria-expanded
<button
  aria-expanded={isOpen}
  aria-haspopup="true"
  onClick={toggleDropdown}
>
  Menu
</button>

// Tab with aria-selected
<button
  role="tab"
  aria-selected={isActive}
  aria-controls="panel-1"
>
  Tab 1
</button>

// Live region for announcements
<div role="status" aria-live="polite">
  {message}
</div>

// Decorative image
<img src="/decoration.svg" alt="" aria-hidden="true" />
```

### Common ARIA Roles

- **navigation**: Navigation landmarks
- **main**: Main content area
- **complementary**: Sidebar content
- **search**: Search form
- **alert**: Important messages
- **status**: Status updates
- **dialog**: Modal dialogs
- **tab**: Tab interface
- **tabpanel**: Tab content

## Color Contrast

### ✅ Color Contrast Checklist

- [ ] Normal text has 4.5:1 contrast ratio
- [ ] Large text has 3:1 contrast ratio
- [ ] UI components have 3:1 contrast ratio
- [ ] Focus indicators have 3:1 contrast ratio
- [ ] Non-text content has sufficient contrast

### Testing Tools

- **Chrome DevTools**: Inspect element → Accessibility pane
- **Contrast Checker**: WebAIM Contrast Checker
- **Color Oracle**: Simulate color blindness

### Testing Steps

1. **Check text contrast**
   - Use DevTools to check all text
   - Verify 4.5:1 for normal text
   - Verify 3:1 for large text (18px+ or 14px+ bold)

2. **Check UI components**
   - Buttons, borders, icons
   - Verify 3:1 contrast ratio

3. **Test with color blindness simulation**
   - Use Color Oracle or similar tool
   - Verify information isn't conveyed by color alone

### Common Issues

```tsx
// ❌ Bad: Low contrast (2.5:1)
<p className="text-gray-400">Important text</p>

// ✅ Good: High contrast (7:1)
<p className="text-gray-700">Important text</p>

// ❌ Bad: Color only indicator
<span className="text-red-500">Error</span>

// ✅ Good: Color + icon + text
<span className="text-red-500">
  <AlertIcon aria-hidden="true" />
  Error: Invalid input
</span>
```

## Forms Accessibility

### ✅ Form Checklist

- [ ] All inputs have associated labels
- [ ] Required fields are marked
- [ ] Error messages are clear and associated
- [ ] Fieldsets group related inputs
- [ ] Legends describe fieldset purpose
- [ ] Autocomplete attributes are used
- [ ] Input types are semantic (email, tel, etc.)

### Accessible Form Patterns

```tsx
// Text input with label
<div>
  <label htmlFor="name" className="block mb-2">
    Name <span className="text-red-500" aria-label="required">*</span>
  </label>
  <input
    id="name"
    type="text"
    required
    aria-required="true"
    aria-invalid={hasError}
    aria-describedby={hasError ? "name-error" : undefined}
  />
  {hasError && (
    <p id="name-error" className="text-red-600 mt-1" role="alert">
      Please enter your name
    </p>
  )}
</div>

// Radio group
<fieldset>
  <legend>Choose account type</legend>
  <div>
    <input type="radio" id="personal" name="type" value="personal" />
    <label htmlFor="personal">Personal</label>
  </div>
  <div>
    <input type="radio" id="business" name="type" value="business" />
    <label htmlFor="business">Business</label>
  </div>
</fieldset>

// Checkbox with description
<div>
  <input
    type="checkbox"
    id="terms"
    aria-describedby="terms-description"
  />
  <label htmlFor="terms">I agree to the terms</label>
  <p id="terms-description" className="text-sm text-gray-600">
    By checking this box, you agree to our terms and conditions
  </p>
</div>
```

## Images and Media

### ✅ Image Checklist

- [ ] All meaningful images have alt text
- [ ] Decorative images have empty alt or aria-hidden
- [ ] Complex images have long descriptions
- [ ] Icons have appropriate labels
- [ ] Image buttons have descriptive text

### Alt Text Guidelines

```tsx
// Informative image
<img
  src="/product.jpg"
  alt="Blue ceramic vase with floral pattern, 12 inches tall"
/>

// Decorative image
<img src="/decoration.svg" alt="" aria-hidden="true" />

// Functional image (button)
<button>
  <img src="/search.svg" alt="Search" />
</button>

// Complex image with long description
<img
  src="/chart.png"
  alt="Sales chart showing 20% increase"
  aria-describedby="chart-description"
/>
<div id="chart-description" className="sr-only">
  Detailed description of the sales chart...
</div>
```

## Modal Accessibility

### ✅ Modal Checklist

- [ ] Focus is trapped within modal
- [ ] Focus returns to trigger on close
- [ ] ESC key closes modal
- [ ] Modal has role="dialog"
- [ ] Modal has aria-modal="true"
- [ ] Modal has aria-labelledby
- [ ] Backdrop prevents interaction with background

### Accessible Modal Pattern

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Confirm Action</h2>
  <p id="modal-description">
    Are you sure you want to proceed?
  </p>
  <button onClick={onConfirm}>Confirm</button>
  <button onClick={onClose}>Cancel</button>
</div>
```

## Tables

### ✅ Table Checklist

- [ ] Tables have captions or aria-label
- [ ] Header cells use <th>
- [ ] Data cells use <td>
- [ ] Complex tables use scope attribute
- [ ] Tables are responsive

### Accessible Table Pattern

```tsx
<table aria-label="Transaction history">
  <caption className="sr-only">Recent transactions</caption>
  <thead>
    <tr>
      <th scope="col">Date</th>
      <th scope="col">Description</th>
      <th scope="col">Amount</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>2024-01-15</td>
      <td>Product purchase</td>
      <td>$50.00</td>
    </tr>
  </tbody>
</table>
```

## Dynamic Content

### ✅ Dynamic Content Checklist

- [ ] Loading states are announced
- [ ] Success messages are announced
- [ ] Error messages are announced
- [ ] Content updates are announced
- [ ] ARIA live regions are used appropriately

### Live Region Patterns

```tsx
// Polite announcement (non-urgent)
<div role="status" aria-live="polite" aria-atomic="true">
  {successMessage}
</div>

// Assertive announcement (urgent)
<div role="alert" aria-live="assertive" aria-atomic="true">
  {errorMessage}
</div>

// Loading state
<div role="status" aria-live="polite">
  {isLoading ? 'Loading...' : null}
</div>
```

## Testing Checklist

### Manual Testing

- [ ] Tab through entire application
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Test with keyboard only
- [ ] Check color contrast
- [ ] Verify focus indicators
- [ ] Test form validation
- [ ] Test modal interactions
- [ ] Verify skip links work

### Automated Testing

- [ ] Run axe DevTools
- [ ] Run Lighthouse audit
- [ ] Run WAVE evaluation
- [ ] Check HTML validation
- [ ] Test with Pa11y

### Browser Testing

- [ ] Chrome with VoiceOver (Mac)
- [ ] Safari with VoiceOver (Mac)
- [ ] Firefox with NVDA (Windows)
- [ ] Edge with NVDA (Windows)

## Common Issues and Fixes

### Issue: Missing Alt Text

```tsx
// ❌ Bad
<img src="/image.jpg" />

// ✅ Good
<img src="/image.jpg" alt="Description of image" />
```

### Issue: No Keyboard Access

```tsx
// ❌ Bad
<div onClick={handleClick}>Click me</div>

// ✅ Good
<button onClick={handleClick}>Click me</button>
```

### Issue: No Focus Indicator

```tsx
// ❌ Bad
<button className="focus:outline-none">Click me</button>

// ✅ Good
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500">
  Click me
</button>
```

### Issue: Missing Form Labels

```tsx
// ❌ Bad
<input type="text" placeholder="Email" />

// ✅ Good
<label htmlFor="email">Email</label>
<input id="email" type="text" />
```

### Issue: Low Color Contrast

```tsx
// ❌ Bad
<p className="text-gray-300">Important text</p>

// ✅ Good
<p className="text-gray-700">Important text</p>
```

## Resources

- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **WebAIM**: https://webaim.org/
- **A11y Project**: https://www.a11yproject.com/
- **MDN Accessibility**: https://developer.mozilla.org/en-US/docs/Web/Accessibility
- **Inclusive Components**: https://inclusive-components.design/

## Summary

Accessibility ensures:
- **Everyone can use the application**
- **Keyboard navigation works**
- **Screen readers can access content**
- **Color contrast is sufficient**
- **Forms are properly labeled**
- **Dynamic content is announced**
- **WCAG 2.1 Level AA compliance**

Test regularly and fix issues early!

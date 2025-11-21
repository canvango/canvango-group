# Accessibility Testing Quick Guide

Quick reference for testing accessibility in the Member Area.

## Automated Testing

### Run Tests

```bash
# Install dependencies
npm install --save-dev @axe-core/puppeteer puppeteer

# Run accessibility tests
node scripts/test-accessibility.js

# Or add to package.json
npm run test:a11y
```

### Browser Extensions

1. **axe DevTools** (Chrome/Firefox)
   - Install from browser store
   - Open DevTools → axe tab
   - Click "Scan ALL of my page"

2. **WAVE** (Chrome/Firefox/Edge)
   - Install from browser store
   - Click extension icon
   - Review issues

3. **Lighthouse** (Chrome)
   - Open DevTools → Lighthouse tab
   - Select "Accessibility"
   - Click "Generate report"

## Manual Testing

### Keyboard Navigation (5 minutes)

1. **Tab through page**
   - Press Tab repeatedly
   - Verify focus is visible
   - Check tab order is logical

2. **Test interactions**
   - Enter to submit forms
   - Space to toggle checkboxes
   - ESC to close modals
   - Arrow keys for dropdowns

3. **Complete a task**
   - Navigate to products
   - Select a product
   - Add to cart
   - Complete purchase
   - All using keyboard only

### Screen Reader Testing (10 minutes)

**Mac (VoiceOver)**:
```
1. Start: Cmd + F5
2. Navigate: VO + Arrow keys
3. Read: VO + A
4. Stop: Control
```

**Windows (NVDA)**:
```
1. Start: Ctrl + Alt + N
2. Navigate: Arrow keys
3. Read: Insert + Down Arrow
4. Stop: Insert + Q
```

**Test checklist**:
- [ ] Page title is announced
- [ ] Headings are announced
- [ ] Form labels are read
- [ ] Button purposes are clear
- [ ] Links are descriptive
- [ ] Images have alt text
- [ ] Errors are announced

### Color Contrast (2 minutes)

1. **Use DevTools**
   - Inspect element
   - Check Accessibility pane
   - Look for contrast ratio

2. **Check critical elements**
   - Body text (4.5:1)
   - Headings (4.5:1)
   - Buttons (3:1)
   - Links (4.5:1)
   - Icons (3:1)

## Common Issues

### Issue: No Focus Indicator

**Test**: Tab through page
**Fix**:
```tsx
<button className="focus:ring-2 focus:ring-blue-500">
  Click me
</button>
```

### Issue: Missing Alt Text

**Test**: Use screen reader
**Fix**:
```tsx
<img src="/image.jpg" alt="Description" />
```

### Issue: No Form Labels

**Test**: Use screen reader on form
**Fix**:
```tsx
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

### Issue: Low Contrast

**Test**: Use DevTools contrast checker
**Fix**:
```tsx
// Change from text-gray-400 to text-gray-700
<p className="text-gray-700">Text</p>
```

### Issue: Keyboard Trap

**Test**: Tab through modal
**Fix**: Implement focus trap with return focus

## Quick Checks

### Before Committing

- [ ] Tab through new features
- [ ] Run axe DevTools scan
- [ ] Check color contrast
- [ ] Verify alt text on images
- [ ] Test with keyboard only

### Before Deploying

- [ ] Run automated tests
- [ ] Test with screen reader
- [ ] Run Lighthouse audit
- [ ] Test on mobile
- [ ] Verify WCAG AA compliance

## Testing Schedule

### Daily
- Tab through new features
- Run axe DevTools on changes

### Weekly
- Full keyboard navigation test
- Screen reader spot check
- Contrast audit

### Before Release
- Complete automated test suite
- Full screen reader test
- Cross-browser testing
- Mobile accessibility test

## Tools Reference

| Tool | Purpose | Time |
|------|---------|------|
| axe DevTools | Automated testing | 2 min |
| Lighthouse | Overall audit | 1 min |
| WAVE | Visual feedback | 2 min |
| Keyboard | Navigation test | 5 min |
| Screen reader | Content test | 10 min |
| Contrast checker | Color test | 2 min |

## Resources

- **WCAG Quick Ref**: https://www.w3.org/WAI/WCAG21/quickref/
- **WebAIM**: https://webaim.org/
- **axe Rules**: https://dequeuniversity.com/rules/axe/
- **A11y Project**: https://www.a11yproject.com/

## Summary

1. **Run automated tests** (axe, Lighthouse)
2. **Test with keyboard** (Tab, Enter, ESC)
3. **Test with screen reader** (VoiceOver, NVDA)
4. **Check color contrast** (DevTools)
5. **Fix issues immediately**

Quick testing = Better accessibility!

# Accessibility Quick Reference

Quick reference guide for implementing accessible components in the Canvango Group application.

## Common Patterns

### Button with Icon Only
```tsx
<button aria-label="Close modal">
  <X aria-hidden="true" />
</button>
```

### Form Input
```tsx
<Input
  id="email"
  label="Email Address"
  required
  error={errors.email}
  helperText="We'll never share your email"
/>
```

### Select Dropdown
```tsx
<Select
  label="Payment Method"
  options={paymentMethods}
  value={selected}
  onChange={setSelected}
  required
/>
```

### Radio Group
```tsx
<RadioGroup
  name="account-type"
  label="Account Type"
  options={[
    { value: 'bm', label: 'Business Manager' },
    { value: 'personal', label: 'Personal Account' }
  ]}
  value={type}
  onChange={setType}
/>
```

### Checkbox
```tsx
<Checkbox
  label="I agree to the terms"
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
  required
/>
```

### Modal Dialog
```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Confirm Action"
>
  {/* Modal content */}
</Modal>
```

### Status Badge
```tsx
<Badge variant="success" role="status" aria-label="Status: Success">
  <CheckCircle aria-hidden="true" />
  Success
</Badge>
```

### Skip Link
```tsx
<SkipLink />
{/* Automatically added in MemberAreaLayout */}
```

## Keyboard Navigation

### Essential Keys
- **Tab**: Next element
- **Shift + Tab**: Previous element
- **Enter/Space**: Activate
- **Escape**: Close/Cancel
- **Arrow Keys**: Navigate lists

### Focus Management
```tsx
import { useFocusTrap } from '@/shared/hooks/useKeyboardNavigation';

const modalRef = useRef<HTMLDivElement>(null);
useFocusTrap(modalRef, isOpen);
```

## ARIA Attributes

### Common ARIA Labels
```tsx
import { ariaLabel } from '@/shared/utils/aria';

// Icon button
<button aria-label={ariaLabel.close('modal')}>

// Navigation
<button aria-label={ariaLabel.navigation('Dashboard')}>

// Loading
<div aria-label={ariaLabel.loading('products')}>
```

### Live Regions
```tsx
import { useAnnouncer } from '@/shared/hooks/useAnnouncer';

const { announcePolite, announceAssertive } = useAnnouncer();

// Polite announcement (waits)
announcePolite('Product added to cart');

// Assertive announcement (interrupts)
announceAssertive('Error: Payment failed');
```

### Route Announcements
```tsx
import { useRouteAnnouncer } from '@/shared/hooks/useAnnouncer';

// In page component
useRouteAnnouncer('Dashboard');
```

## Color Contrast

### Using Accessible Colors
```tsx
import { accessibleColors } from '@/shared/utils/color-contrast';

// Primary button
className="bg-primary-DEFAULT text-white"

// Success message
className="bg-success-light text-success-text"

// Status badge
className="bg-success-100 text-success-800"
```

### Checking Contrast
```tsx
import { validateColorCombination } from '@/shared/utils/color-contrast';

const result = validateColorCombination('#4F46E5', '#FFFFFF');
// { ratio: 8.59, meetsAA: true, meetsAAA: true }
```

## Images and Icons

### Decorative Icons
```tsx
<Icon aria-hidden="true" />
```

### Meaningful Images
```tsx
import { productImageAlt } from '@/shared/utils/alt-text';

<img 
  src={product.image} 
  alt={productImageAlt(product.name, product.category)}
/>
```

### Avatar Images
```tsx
import { avatarAlt } from '@/shared/utils/alt-text';

<img 
  src={user.avatar} 
  alt={avatarAlt(user.username)}
/>
```

## Form Validation

### Input with Error
```tsx
<Input
  label="Email"
  value={email}
  onChange={setEmail}
  error={errors.email}
  aria-invalid={!!errors.email}
/>
```

### Fieldset for Grouped Inputs
```tsx
<Fieldset
  legend="Payment Information"
  description="Enter your payment details"
  required
>
  <Input label="Card Number" />
  <Input label="CVV" />
</Fieldset>
```

## Touch Targets

### Minimum Size
All interactive elements should be at least 44x44 pixels:

```tsx
// Button with minimum height
<Button className="min-h-[44px]">Click Me</Button>

// Icon button with padding
<button className="p-2.5 min-w-[44px] min-h-[44px]">
  <Icon className="w-5 h-5" />
</button>
```

## Testing

### Development Audit
```tsx
import { useAccessibilityAudit } from '@/shared/utils/accessibility-testing';

const MyComponent = () => {
  const ref = useRef<HTMLDivElement>(null);
  useAccessibilityAudit(ref, 'MyComponent');
  
  return <div ref={ref}>{/* content */}</div>;
};
```

### Manual Checks
```tsx
import { 
  hasMinimumTouchTarget,
  hasAssociatedLabel,
  auditAccessibility 
} from '@/shared/utils/accessibility-testing';

// Check touch target
const isValid = hasMinimumTouchTarget(buttonElement);

// Check label
const hasLabel = hasAssociatedLabel(inputElement);

// Full audit
const audit = auditAccessibility(containerElement);
```

## Common Mistakes to Avoid

❌ **Don't:**
```tsx
// Missing label
<input type="text" placeholder="Email" />

// Icon without label
<button><X /></button>

// Decorative image with alt text
<img src="decoration.png" alt="Decorative image" />

// Color-only status
<span className="text-green-500">Success</span>

// Small touch target
<button className="p-1"><Icon /></button>
```

✅ **Do:**
```tsx
// Proper label
<Input label="Email" placeholder="Enter your email" />

// Icon with label
<button aria-label="Close"><X aria-hidden="true" /></button>

// Decorative image
<img src="decoration.png" alt="" aria-hidden="true" />

// Status with icon and text
<Badge variant="success">
  <CheckCircle aria-hidden="true" />
  Success
</Badge>

// Proper touch target
<button className="p-2.5 min-h-[44px]"><Icon /></button>
```

## Checklist

### Before Committing
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] ARIA labels on icon-only buttons
- [ ] Form inputs have labels
- [ ] Error messages announced
- [ ] Images have alt text (or empty for decorative)
- [ ] Color contrast meets WCAG AA
- [ ] Touch targets minimum 44x44px
- [ ] Modals trap focus
- [ ] No keyboard traps

### Testing Tools
- **Browser**: axe DevTools extension
- **Keyboard**: Tab through entire page
- **Screen Reader**: Test with NVDA/VoiceOver
- **Contrast**: Use color contrast analyzer
- **Mobile**: Test touch targets on device

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)
- Full documentation: `src/shared/docs/ACCESSIBILITY.md`

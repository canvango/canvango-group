# SelectDropdown Integration Guide

## Overview

This guide shows how to integrate the SelectDropdown component into existing member area pages, replacing or enhancing current select implementations.

## Quick Start

### 1. Import the Component

```tsx
import { SelectDropdown } from '@/shared/components';
import type { SelectOption } from '@/shared/components';
```

### 2. Define Your Options

```tsx
const options: SelectOption[] = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];
```

### 3. Use the Component

```tsx
const [value, setValue] = useState('');

<SelectDropdown
  label="Choose an option"
  options={options}
  value={value}
  onChange={setValue}
/>
```

## Integration Examples

### Transaction History Page

Replace the warranty filter dropdown:

**Before:**
```tsx
<select
  value={warrantyFilter}
  onChange={(e) => setWarrantyFilter(e.target.value)}
>
  <option value="">Semua Garansi</option>
  <option value="active">Garansi Aktif</option>
  <option value="expired">Garansi Habis</option>
</select>
```

**After:**
```tsx
import { SelectDropdown } from '@/shared/components';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const warrantyOptions: SelectOption[] = [
  { value: '', label: 'Semua Garansi' },
  { 
    value: 'active', 
    label: 'Garansi Aktif',
    icon: <CheckCircle className="w-4 h-4 text-green-500" />
  },
  { 
    value: 'expired', 
    label: 'Garansi Habis',
    icon: <XCircle className="w-4 h-4 text-red-500" />
  },
  { 
    value: 'expiring-soon', 
    label: 'Akan Habis',
    icon: <Clock className="w-4 h-4 text-orange-500" />
  },
];

<SelectDropdown
  label="Filter Garansi"
  options={warrantyOptions}
  value={warrantyFilter}
  onChange={setWarrantyFilter}
  clearable
  onClear={() => setWarrantyFilter('')}
  placeholder="Pilih status garansi"
/>
```

### Product Pages (BM Accounts, Personal Accounts)

Add a sort dropdown:

```tsx
// In SearchSortBar component
import { SelectDropdown } from '@/shared/components';
import { TrendingUp } from 'lucide-react';

const sortOptions: SelectOption[] = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
  { value: 'price-low', label: 'Harga Terendah' },
  { value: 'price-high', label: 'Harga Tertinggi' },
  { value: 'name-asc', label: 'Nama (A-Z)' },
  { value: 'name-desc', label: 'Nama (Z-A)' },
];

<SelectDropdown
  label="Urutkan"
  options={sortOptions}
  value={sortBy}
  onChange={setSortBy}
  className="w-48"
/>
```

### Top Up Page

Enhance payment method selection:

```tsx
import { SelectDropdown } from '@/shared/components';

const paymentMethodOptions: SelectOption[] = [
  {
    value: 'qris',
    label: 'QRIS',
    description: 'Scan QR untuk bayar',
    icon: <QRIcon />,
  },
  {
    value: 'bca',
    label: 'BCA Virtual Account',
    description: 'Transfer ke VA BCA',
    icon: <BCAIcon />,
  },
  // ... more options
];

const renderPaymentOption = (option: SelectOption) => (
  <div className="flex items-center gap-3">
    {option.icon}
    <div>
      <div className="font-medium">{option.label}</div>
      <div className="text-xs text-gray-500">{option.description}</div>
    </div>
  </div>
);

<SelectDropdown
  label="Metode Pembayaran"
  options={paymentMethodOptions}
  value={paymentMethod}
  onChange={setPaymentMethod}
  renderOption={renderPaymentOption}
  required
/>
```

### Verified BM Service Page

Add quantity selector with validation:

```tsx
import { SelectDropdown } from '@/shared/components';

const quantityOptions: SelectOption[] = Array.from({ length: 100 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1} Akun`,
}));

<SelectDropdown
  label="Jumlah Akun"
  options={quantityOptions}
  value={quantity}
  onChange={setQuantity}
  searchable
  placeholder="Pilih jumlah akun"
  helperText="Minimal 1, maksimal 100 akun"
  required
  error={quantityError}
/>
```

### Warranty Claim Page

Add reason selector:

```tsx
import { SelectDropdown } from '@/shared/components';
import { AlertCircle, Ban, HelpCircle } from 'lucide-react';

const claimReasonOptions: SelectOption[] = [
  {
    value: 'disabled',
    label: 'Akun Disabled',
    description: 'Akun tidak bisa diakses',
    icon: <Ban className="w-4 h-4 text-red-500" />,
  },
  {
    value: 'invalid',
    label: 'Kredensial Invalid',
    description: 'Username/password salah',
    icon: <AlertCircle className="w-4 h-4 text-orange-500" />,
  },
  {
    value: 'other',
    label: 'Lainnya',
    description: 'Masalah lain',
    icon: <HelpCircle className="w-4 h-4 text-gray-500" />,
  },
];

<SelectDropdown
  label="Alasan Klaim"
  options={claimReasonOptions}
  value={reason}
  onChange={setReason}
  required
  error={reasonError}
/>
```

### API Documentation Page

Add endpoint filter:

```tsx
import { SelectDropdown } from '@/shared/components';

const methodOptions: SelectOption[] = [
  { value: 'all', label: 'All Methods' },
  { value: 'GET', label: 'GET', icon: <span className="text-green-600 font-mono">GET</span> },
  { value: 'POST', label: 'POST', icon: <span className="text-blue-600 font-mono">POST</span> },
  { value: 'PUT', label: 'PUT', icon: <span className="text-orange-600 font-mono">PUT</span> },
  { value: 'DELETE', label: 'DELETE', icon: <span className="text-red-600 font-mono">DELETE</span> },
];

<SelectDropdown
  label="Filter by Method"
  options={methodOptions}
  value={methodFilter}
  onChange={setMethodFilter}
  clearable
/>
```

### Tutorial Center Page

Enhance category filter:

```tsx
import { SelectDropdown } from '@/shared/components';
import { BookOpen, User, CreditCard, Code, AlertTriangle } from 'lucide-react';

const categoryOptions: SelectOption[] = [
  { value: 'all', label: 'Semua Tutorial' },
  { 
    value: 'getting-started', 
    label: 'Getting Started',
    icon: <BookOpen className="w-4 h-4" />
  },
  { 
    value: 'account', 
    label: 'Account',
    icon: <User className="w-4 h-4" />
  },
  { 
    value: 'transaction', 
    label: 'Transaction',
    icon: <CreditCard className="w-4 h-4" />
  },
  { 
    value: 'api', 
    label: 'API',
    icon: <Code className="w-4 h-4" />
  },
  { 
    value: 'troubleshoot', 
    label: 'Troubleshoot',
    icon: <AlertTriangle className="w-4 h-4" />
  },
];

<SelectDropdown
  label="Kategori"
  options={categoryOptions}
  value={category}
  onChange={setCategory}
  clearable
/>
```

## Migration from Native Select

### Step 1: Identify Current Selects

Find all `<select>` elements in your components:

```bash
# Search for select elements
grep -r "<select" src/features/member-area/
```

### Step 2: Evaluate Each Select

For each select, decide:
- **Keep native**: Simple, < 5 options, no special features needed
- **Upgrade to SelectDropdown**: Long lists, needs search, custom styling, or icons

### Step 3: Replace Gradually

Replace one select at a time, testing thoroughly:

1. Import SelectDropdown
2. Convert options array
3. Update state handling
4. Add any custom features (search, icons, etc.)
5. Test keyboard navigation
6. Test accessibility
7. Deploy and monitor

### Step 4: Update Tests

Update component tests to work with SelectDropdown:

```tsx
// Before
const select = screen.getByRole('combobox');
fireEvent.change(select, { target: { value: 'option1' } });

// After
const button = screen.getByRole('button', { name: /label/i });
fireEvent.click(button);
const option = screen.getByText('Option 1');
fireEvent.click(option);
```

## Best Practices

### 1. Use Appropriate Features

```tsx
// Good - Search for long lists
<SelectDropdown
  options={manyCountries}
  searchable
  ...
/>

// Avoid - Search for short lists
<SelectDropdown
  options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
  searchable  // Unnecessary
  ...
/>
```

### 2. Provide Clear Labels

```tsx
// Good
<SelectDropdown label="Negara Pengiriman" ... />

// Avoid
<SelectDropdown label="Negara" ... />
```

### 3. Use Icons Meaningfully

```tsx
// Good - Icons add context
const statusOptions = [
  { value: 'active', label: 'Active', icon: <CheckCircle /> },
  { value: 'inactive', label: 'Inactive', icon: <XCircle /> },
];

// Avoid - Icons are decorative only
const colorOptions = [
  { value: 'red', label: 'Red', icon: <Star /> },
  { value: 'blue', label: 'Blue', icon: <Heart /> },
];
```

### 4. Handle Errors Properly

```tsx
// Good
<SelectDropdown
  error={touched && !value ? 'Field is required' : undefined}
  ...
/>

// Avoid
<SelectDropdown
  error={!value ? 'Error' : undefined}  // Shows error immediately
  ...
/>
```

### 5. Memoize Options

```tsx
// Good
const options = useMemo(() => [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
], []);

// Avoid
const options = [  // Recreated on every render
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
];
```

## Common Patterns

### Filter + Sort Combination

```tsx
<div className="flex gap-4">
  <SelectDropdown
    label="Filter"
    options={filterOptions}
    value={filter}
    onChange={setFilter}
    clearable
    className="flex-1"
  />
  
  <SelectDropdown
    label="Sort"
    options={sortOptions}
    value={sort}
    onChange={setSort}
    className="flex-1"
  />
</div>
```

### Dependent Dropdowns

```tsx
// Country selector
<SelectDropdown
  label="Country"
  options={countryOptions}
  value={country}
  onChange={(value) => {
    setCountry(value);
    setState(''); // Reset dependent field
  }}
  searchable
/>

// State selector (depends on country)
<SelectDropdown
  label="State/Province"
  options={getStatesForCountry(country)}
  value={state}
  onChange={setState}
  disabled={!country}
  searchable
/>
```

### Form Integration

```tsx
// With React Hook Form
<Controller
  name="category"
  control={control}
  rules={{ required: 'Category is required' }}
  render={({ field, fieldState }) => (
    <SelectDropdown
      label="Category"
      options={categoryOptions}
      value={field.value}
      onChange={field.onChange}
      error={fieldState.error?.message}
      required
    />
  )}
/>
```

## Troubleshooting

### Issue: Dropdown Not Opening

**Solution:** Check if disabled prop is set or if there are JavaScript errors.

### Issue: Options Not Filtering

**Solution:** Ensure `searchable` prop is set to `true`.

### Issue: Keyboard Navigation Not Working

**Solution:** Verify the dropdown has focus and no other handlers are interfering.

### Issue: Styling Conflicts

**Solution:** Check for CSS conflicts and ensure Tailwind is properly configured.

### Issue: Performance with Large Lists

**Solution:** Enable search and consider memoizing options.

## Testing Checklist

When integrating SelectDropdown:

- [ ] Component renders correctly
- [ ] Options display properly
- [ ] Selection works
- [ ] Keyboard navigation works
- [ ] Search works (if enabled)
- [ ] Clear button works (if enabled)
- [ ] Error states display correctly
- [ ] Required field indication shows
- [ ] Disabled state works
- [ ] Mobile/touch works
- [ ] Screen reader announces correctly
- [ ] Focus management works
- [ ] Form submission works

## Performance Tips

1. **Memoize options** to prevent unnecessary re-renders
2. **Use search** for lists with 10+ options
3. **Lazy load** options if fetching from API
4. **Debounce** onChange handlers if they trigger expensive operations
5. **Virtual scrolling** for 1000+ options (future enhancement)

## Accessibility Checklist

- [ ] Label is properly associated
- [ ] ARIA attributes are correct
- [ ] Keyboard navigation works
- [ ] Focus indicators are visible
- [ ] Screen reader announces states
- [ ] Error messages are announced
- [ ] Touch targets are 44x44px minimum
- [ ] Color contrast meets WCAG AA

## Support

For questions or issues:
1. Check the [Complete Guide](./SELECT_DROPDOWN_GUIDE.md)
2. Review [Quick Reference](./SELECT_DROPDOWN_QUICK_REFERENCE.md)
3. See [Usage Examples](../components/SelectDropdownUsageExample.tsx)
4. Create an issue with the `component` label

## Next Steps

1. Identify selects to upgrade in your pages
2. Start with non-critical pages
3. Test thoroughly
4. Gather user feedback
5. Iterate and improve

The SelectDropdown component is production-ready and can significantly improve the user experience in your member area pages.

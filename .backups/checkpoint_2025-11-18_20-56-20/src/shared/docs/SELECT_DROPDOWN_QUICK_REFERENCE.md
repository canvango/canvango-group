# SelectDropdown Quick Reference

## Import

```tsx
import { SelectDropdown } from '@/shared/components';
import type { SelectOption } from '@/shared/components';
```

## Basic Example

```tsx
const [value, setValue] = useState('');

const options: SelectOption[] = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
];

<SelectDropdown
  label="Choose"
  options={options}
  value={value}
  onChange={setValue}
/>
```

## Common Patterns

### Searchable

```tsx
<SelectDropdown
  options={manyOptions}
  value={value}
  onChange={setValue}
  searchable
/>
```

### Clearable

```tsx
<SelectDropdown
  options={options}
  value={value}
  onChange={setValue}
  clearable
  onClear={() => setValue('')}
/>
```

### With Icons

```tsx
const options = [
  { value: '1', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  { value: '2', label: 'Phone', icon: <Phone className="w-4 h-4" /> },
];
```

### With Descriptions

```tsx
const options = [
  { 
    value: 'free', 
    label: 'Free Plan',
    description: 'Perfect for getting started'
  },
];
```

### Custom Rendering

```tsx
const renderOption = (option: SelectOption) => (
  <div className="flex items-center gap-2">
    {option.icon}
    <div>
      <div className="font-medium">{option.label}</div>
      <div className="text-xs text-gray-500">{option.description}</div>
    </div>
  </div>
);

<SelectDropdown
  options={options}
  renderOption={renderOption}
  ...
/>
```

### With Validation

```tsx
<SelectDropdown
  label="Category"
  options={options}
  value={value}
  onChange={setValue}
  required
  error={!value ? 'Required' : undefined}
/>
```

### Disabled Options

```tsx
const options = [
  { value: '1', label: 'Available' },
  { value: '2', label: 'Unavailable', disabled: true },
];
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter`/`Space` | Open/Select |
| `Escape` | Close |
| `↑` `↓` | Navigate |
| `Home`/`End` | First/Last |
| `A-Z` | Type-ahead |

## Props Cheatsheet

```tsx
interface SelectDropdownProps {
  // Required
  options: SelectOption[];
  
  // Common
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  
  // Features
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  required?: boolean;
  
  // Validation
  error?: string;
  helperText?: string;
  
  // Customization
  renderOption?: (option: SelectOption) => ReactNode;
  className?: string;
  id?: string;
  
  // Callbacks
  onClear?: () => void;
}

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
  description?: string;
}
```

## React Hook Form

```tsx
<Controller
  name="field"
  control={control}
  render={({ field, fieldState }) => (
    <SelectDropdown
      options={options}
      value={field.value}
      onChange={field.onChange}
      error={fieldState.error?.message}
    />
  )}
/>
```

## Formik

```tsx
<SelectDropdown
  options={options}
  value={formik.values.field}
  onChange={(value) => formik.setFieldValue('field', value)}
  error={formik.touched.field && formik.errors.field}
/>
```

## Accessibility

- ✅ Full keyboard navigation
- ✅ ARIA labels and roles
- ✅ Screen reader support
- ✅ Focus management
- ✅ 44x44px touch targets
- ✅ Error announcements

## When to Use

| Use SelectDropdown | Use Select (native) |
|-------------------|---------------------|
| Long option lists | Short lists (< 5) |
| Need search | Simple selection |
| Custom styling | Native look preferred |
| Icons/descriptions | Plain text only |
| Advanced features | Basic functionality |

## Tips

1. **Enable search** for 10+ options
2. **Use icons** to add visual context
3. **Provide helper text** for clarity
4. **Memoize options** for performance
5. **Handle errors** gracefully
6. **Test keyboard navigation**
7. **Verify accessibility** with screen readers

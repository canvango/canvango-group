# SelectDropdown Component Guide

## Overview

The `SelectDropdown` component is an advanced, accessible dropdown select component with search functionality, custom option rendering, full keyboard navigation, and comprehensive accessibility features. It provides a better user experience than native HTML select elements while maintaining full accessibility compliance.

## Features

- ✅ **Searchable**: Optional search functionality to filter options
- ✅ **Clearable**: Optional clear button to reset selection
- ✅ **Custom Rendering**: Support for custom option rendering with icons and descriptions
- ✅ **Keyboard Navigation**: Full keyboard support with arrow keys, Home, End, and type-ahead
- ✅ **Accessibility**: WCAG AA compliant with proper ARIA labels and roles
- ✅ **Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- ✅ **Touch-Friendly**: Minimum 44x44px touch targets
- ✅ **Disabled Options**: Support for disabled options within the list
- ✅ **Error States**: Built-in error handling and validation display
- ✅ **Focus Management**: Proper focus handling and visible focus indicators

## Basic Usage

```tsx
import { SelectDropdown } from '@/shared/components';

function MyComponent() {
  const [value, setValue] = useState('');

  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  return (
    <SelectDropdown
      label="Choose an option"
      options={options}
      value={value}
      onChange={setValue}
      placeholder="Select..."
    />
  );
}
```

## Props

### SelectDropdownProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text displayed above the select |
| `options` | `SelectOption[]` | **required** | Array of options to display |
| `value` | `string` | - | Currently selected value |
| `onChange` | `(value: string) => void` | - | Callback when selection changes |
| `placeholder` | `string` | `'Select an option'` | Placeholder text when no option is selected |
| `searchable` | `boolean` | `false` | Enable search functionality |
| `clearable` | `boolean` | `false` | Show clear button when option is selected |
| `disabled` | `boolean` | `false` | Disable the select |
| `required` | `boolean` | `false` | Mark as required field |
| `error` | `string` | - | Error message to display |
| `helperText` | `string` | - | Helper text displayed below the select |
| `className` | `string` | `''` | Additional CSS classes |
| `id` | `string` | auto-generated | HTML id attribute |
| `onClear` | `() => void` | - | Callback when clear button is clicked |
| `renderOption` | `(option: SelectOption) => ReactNode` | - | Custom option renderer |

### SelectOption

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `value` | `string` | ✓ | Unique value for the option |
| `label` | `string` | ✓ | Display text for the option |
| `disabled` | `boolean` | - | Whether the option is disabled |
| `icon` | `ReactNode` | - | Icon to display with the option |
| `description` | `string` | - | Additional description text |

## Examples

### Searchable Select

Perfect for long lists of options:

```tsx
<SelectDropdown
  label="Country"
  options={countryOptions}
  value={country}
  onChange={setCountry}
  searchable
  placeholder="Search for a country"
  helperText="Type to search through options"
/>
```

### Clearable Select

Allow users to clear their selection:

```tsx
<SelectDropdown
  label="Category"
  options={categoryOptions}
  value={category}
  onChange={setCategory}
  onClear={() => setCategory('')}
  clearable
  placeholder="Choose a category"
/>
```

### Select with Icons

Add visual context with icons:

```tsx
const options = [
  { 
    value: 'email', 
    label: 'Email', 
    icon: <Mail className="w-4 h-4 text-blue-500" /> 
  },
  { 
    value: 'phone', 
    label: 'Phone', 
    icon: <Phone className="w-4 h-4 text-green-500" /> 
  },
];

<SelectDropdown
  label="Contact Method"
  options={options}
  value={method}
  onChange={setMethod}
/>
```

### Custom Option Rendering

Full control over option appearance:

```tsx
const planOptions = [
  {
    value: 'free',
    label: 'Free Plan',
    description: 'Perfect for getting started',
    icon: <Star className="w-4 h-4" />,
  },
  {
    value: 'pro',
    label: 'Pro Plan',
    description: 'For professional users',
    icon: <Heart className="w-4 h-4" />,
  },
];

const renderOption = (option) => (
  <div className="flex items-center gap-3">
    {option.icon}
    <div>
      <div className="font-medium">{option.label}</div>
      <div className="text-xs text-gray-500">{option.description}</div>
    </div>
  </div>
);

<SelectDropdown
  label="Subscription Plan"
  options={planOptions}
  value={plan}
  onChange={setPlan}
  renderOption={renderOption}
/>
```

### With Validation

Display error states:

```tsx
<SelectDropdown
  label="Required Field"
  options={options}
  value={value}
  onChange={setValue}
  required
  error={!value ? 'Please select an option' : undefined}
/>
```

### Disabled Options

Some options can be disabled:

```tsx
const options = [
  { value: 'available', label: 'Available Option' },
  { value: 'unavailable', label: 'Unavailable Option', disabled: true },
  { value: 'coming-soon', label: 'Coming Soon', disabled: true },
];

<SelectDropdown
  label="Select an option"
  options={options}
  value={value}
  onChange={setValue}
/>
```

## Keyboard Navigation

The SelectDropdown component supports full keyboard navigation:

| Key | Action |
|-----|--------|
| `Enter` or `Space` | Open dropdown or select highlighted option |
| `Escape` | Close dropdown |
| `↑` `↓` | Navigate through options (skips disabled options) |
| `Home` | Jump to first enabled option |
| `End` | Jump to last enabled option |
| `Tab` | Close dropdown and move to next element |
| `A-Z` | Type-ahead search (when not searchable) |

## Accessibility Features

### ARIA Attributes

The component automatically includes:

- `role="listbox"` on the dropdown
- `role="option"` on each option
- `aria-haspopup="listbox"` on the button
- `aria-expanded` to indicate dropdown state
- `aria-selected` on selected option
- `aria-disabled` on disabled options
- `aria-invalid` when there's an error
- `aria-required` for required fields
- `aria-describedby` for error and helper text
- `aria-labelledby` for proper labeling

### Screen Reader Support

- Announces current selection
- Announces when dropdown opens/closes
- Announces highlighted option as user navigates
- Announces error messages
- Announces required field status

### Focus Management

- Visible focus indicators on all interactive elements
- Focus trap within dropdown when open
- Returns focus to button when dropdown closes
- Scrolls highlighted option into view

### Touch Targets

- Minimum 44x44px touch targets for mobile
- Adequate spacing between interactive elements
- Touch-friendly clear button

## Best Practices

### 1. Use Appropriate Labels

Always provide clear, descriptive labels:

```tsx
// Good
<SelectDropdown label="Shipping Country" ... />

// Avoid
<SelectDropdown label="Country" ... />
```

### 2. Provide Helper Text

Help users understand what to select:

```tsx
<SelectDropdown
  label="Payment Method"
  helperText="Choose how you'd like to pay"
  ...
/>
```

### 3. Use Search for Long Lists

Enable search when you have more than 10 options:

```tsx
<SelectDropdown
  options={manyOptions}
  searchable
  ...
/>
```

### 4. Handle Errors Gracefully

Provide clear error messages:

```tsx
<SelectDropdown
  error={errors.category}
  ...
/>
```

### 5. Use Icons Meaningfully

Icons should add clarity, not decoration:

```tsx
// Good - Icons add meaning
const statusOptions = [
  { value: 'active', label: 'Active', icon: <CheckCircle /> },
  { value: 'inactive', label: 'Inactive', icon: <XCircle /> },
];

// Avoid - Icons don't add value
const colorOptions = [
  { value: 'red', label: 'Red', icon: <Star /> },
  { value: 'blue', label: 'Blue', icon: <Heart /> },
];
```

## Integration with Forms

### React Hook Form

```tsx
import { Controller } from 'react-hook-form';

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

### Formik

```tsx
import { useFormik } from 'formik';

const formik = useFormik({
  initialValues: { category: '' },
  onSubmit: (values) => console.log(values),
});

<SelectDropdown
  label="Category"
  options={categoryOptions}
  value={formik.values.category}
  onChange={(value) => formik.setFieldValue('category', value)}
  error={formik.touched.category && formik.errors.category}
/>
```

## Performance Considerations

### Large Option Lists

For very large lists (100+ options), consider:

1. **Enable search**: Helps users find options quickly
2. **Virtual scrolling**: For 1000+ options (future enhancement)
3. **Lazy loading**: Load options on demand

```tsx
// Good for large lists
<SelectDropdown
  options={largeOptionList}
  searchable
  placeholder="Search to find..."
/>
```

### Memoization

Memoize option arrays to prevent unnecessary re-renders:

```tsx
const options = useMemo(() => [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
], []);
```

## Styling

### Custom Styling

Add custom classes:

```tsx
<SelectDropdown
  className="max-w-md"
  ...
/>
```

### Theming

The component uses Tailwind CSS classes and can be customized through your Tailwind configuration.

## Common Patterns

### Filter Dropdown

```tsx
<SelectDropdown
  label="Filter by Status"
  options={statusOptions}
  value={filter}
  onChange={setFilter}
  clearable
  onClear={() => setFilter('')}
  placeholder="All statuses"
/>
```

### Sort Dropdown

```tsx
<SelectDropdown
  label="Sort by"
  options={[
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'date-new', label: 'Newest First' },
    { value: 'date-old', label: 'Oldest First' },
  ]}
  value={sortBy}
  onChange={setSortBy}
/>
```

### Multi-Step Form

```tsx
// Step 1
<SelectDropdown
  label="Country"
  options={countryOptions}
  value={country}
  onChange={setCountry}
  required
  searchable
/>

// Step 2 - Dependent on Step 1
<SelectDropdown
  label="State/Province"
  options={getStatesForCountry(country)}
  value={state}
  onChange={setState}
  disabled={!country}
  required
/>
```

## Troubleshooting

### Dropdown Not Opening

- Check if `disabled` prop is set
- Verify options array is not empty
- Check for JavaScript errors in console

### Search Not Working

- Ensure `searchable` prop is set to `true`
- Verify options have `label` property

### Keyboard Navigation Issues

- Check if dropdown is properly focused
- Verify no other keyboard event handlers are interfering
- Test in different browsers

### Styling Issues

- Ensure Tailwind CSS is properly configured
- Check for CSS conflicts with other components
- Verify z-index values if dropdown is hidden

## Related Components

- **Select**: Simple native HTML select wrapper
- **RadioGroup**: For mutually exclusive options with visible choices
- **Checkbox**: For multiple selections
- **Autocomplete**: For free-text input with suggestions (future)

## Requirements Met

This component satisfies the following requirements:

- ✅ **3.4**: Warranty status filter dropdown in Transaction History
- ✅ **13.8**: Form validation with inline error messages
- ✅ **15.1**: Keyboard navigation support for all interactive elements
- ✅ **15.2**: Logical tab order and visible focus indicators

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- Virtual scrolling for very large lists
- Multi-select support
- Grouped options
- Async option loading
- Custom positioning (top, bottom, auto)
- Portal rendering for better z-index handling

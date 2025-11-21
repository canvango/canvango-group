# Copy to Clipboard - Quick Reference

## Import

```tsx
// Hook
import { useCopyToClipboard } from '@/shared/hooks';

// Component
import { CopyButton } from '@/shared/components';
```

## useCopyToClipboard Hook

```tsx
const { copied, copyToClipboard, reset } = useCopyToClipboard(2000);

// Copy text
await copyToClipboard('text to copy');

// Check if copied
if (copied) {
  // Show success state
}

// Manual reset
reset();
```

## CopyButton Component

### Basic

```tsx
<CopyButton text="Copy me" />
```

### Icon Only

```tsx
<CopyButton text="Copy me" iconOnly />
```

### With Label

```tsx
<CopyButton 
  text="Copy me"
  label="Copy"
  copiedLabel="Copied!"
/>
```

### Variants

```tsx
<CopyButton text="Copy me" variant="primary" />
<CopyButton text="Copy me" variant="secondary" />
<CopyButton text="Copy me" variant="outline" />
<CopyButton text="Copy me" variant="ghost" />
```

### Sizes

```tsx
<CopyButton text="Copy me" size="sm" />
<CopyButton text="Copy me" size="md" />
<CopyButton text="Copy me" size="lg" />
```

### With Callbacks

```tsx
<CopyButton 
  text="Copy me"
  onCopy={() => console.log('Copied!')}
  onError={(err) => console.error(err)}
/>
```

## Common Patterns

### API Key

```tsx
<div className="flex items-center gap-2">
  <code className="flex-1">{apiKey}</code>
  <CopyButton text={apiKey} variant="outline" />
</div>
```

### Credentials Field

```tsx
<div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
  <span className="flex-1 font-mono">{credential}</span>
  <CopyButton text={credential} iconOnly ariaLabel="Copy credential" />
</div>
```

### With Toast

```tsx
const { copyToClipboard } = useCopyToClipboard();
const { showToast } = useToast();

const handleCopy = async () => {
  const success = await copyToClipboard(text);
  showToast({
    type: success ? 'success' : 'error',
    message: success ? 'Copied!' : 'Failed to copy'
  });
};
```

## Props Reference

### useCopyToClipboard

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| resetDelay | number | 2000 | Auto-reset delay in ms |

**Returns:**
- `copied: boolean` - Copy success state
- `copyToClipboard: (text: string) => Promise<boolean>` - Copy function
- `reset: () => void` - Manual reset

### CopyButton

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| text* | string | - | Text to copy |
| variant | string | 'outline' | Button variant |
| size | string | 'md' | Button size |
| label | string | 'Copy' | Button label |
| copiedLabel | string | 'Copied!' | Success label |
| iconOnly | boolean | false | Icon only mode |
| ariaLabel | string | - | Custom aria-label |
| className | string | '' | Additional classes |
| onCopy | function | - | Success callback |
| onError | function | - | Error callback |

*Required prop

## Browser Support

- ✅ Modern browsers (Clipboard API)
- ✅ Older browsers (execCommand fallback)
- ✅ HTTP and HTTPS contexts
- ✅ Mobile browsers

## Accessibility

- ✅ Keyboard accessible
- ✅ Screen reader support
- ✅ ARIA labels
- ✅ Visual feedback
- ✅ Focus management

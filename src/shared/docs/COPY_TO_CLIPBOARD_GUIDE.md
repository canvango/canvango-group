# Copy to Clipboard Guide

This guide explains how to use the copy-to-clipboard functionality in the application.

## Overview

The application provides two ways to implement copy-to-clipboard functionality:

1. **`useCopyToClipboard` hook** - For custom implementations
2. **`CopyButton` component** - Pre-built button component

Both use the modern Clipboard API with automatic fallback for older browsers.

## useCopyToClipboard Hook

### Basic Usage

```tsx
import { useCopyToClipboard } from '@/shared/hooks';

function MyComponent() {
  const { copied, copyToClipboard } = useCopyToClipboard();

  return (
    <div>
      <button onClick={() => copyToClipboard('Hello World')}>
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}
```

### With Custom Reset Delay

```tsx
const { copied, copyToClipboard, reset } = useCopyToClipboard(3000); // 3 seconds

// Manual reset
const handleCopy = async () => {
  await copyToClipboard('Text to copy');
  // Do something else
  reset(); // Manually reset if needed
};
```

### API Reference

```typescript
interface UseCopyToClipboardReturn {
  copied: boolean;              // Whether text was successfully copied
  copyToClipboard: (text: string) => Promise<boolean>;  // Copy function
  reset: () => void;            // Manual reset function
}

useCopyToClipboard(resetDelay?: number): UseCopyToClipboardReturn
```

**Parameters:**
- `resetDelay` (optional): Time in milliseconds before auto-resetting copied state (default: 2000)

**Returns:**
- `copied`: Boolean indicating if text was successfully copied
- `copyToClipboard`: Async function to copy text to clipboard
- `reset`: Function to manually reset the copied state

## CopyButton Component

### Basic Usage

```tsx
import { CopyButton } from '@/shared/components';

function MyComponent() {
  return (
    <CopyButton 
      text="Text to copy"
      label="Copy"
    />
  );
}
```

### Icon Only Button

```tsx
<CopyButton 
  text="API_KEY_12345"
  iconOnly
  ariaLabel="Copy API key"
/>
```

### With Callbacks

```tsx
<CopyButton 
  text="Important data"
  label="Copy Data"
  onCopy={() => console.log('Copied successfully!')}
  onError={(error) => console.error('Copy failed:', error)}
/>
```

### Different Variants and Sizes

```tsx
// Outline variant, small size
<CopyButton 
  text="Copy me"
  variant="outline"
  size="sm"
  label="Copy"
/>

// Primary variant, large size
<CopyButton 
  text="Copy me"
  variant="primary"
  size="lg"
  label="Copy to Clipboard"
/>

// Ghost variant (minimal styling)
<CopyButton 
  text="Copy me"
  variant="ghost"
  iconOnly
/>
```

### API Reference

```typescript
interface CopyButtonProps {
  text: string;                    // Text to copy (required)
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  label?: string;                  // Label when not copied (default: 'Copy')
  copiedLabel?: string;            // Label when copied (default: 'Copied!')
  iconOnly?: boolean;              // Show icon only, no text (default: false)
  ariaLabel?: string;              // Custom aria-label
  className?: string;              // Additional CSS classes
  onCopy?: () => void;            // Callback on successful copy
  onError?: (error: Error) => void; // Callback on copy error
}
```

## Real-World Examples

### API Key Display

```tsx
import { CopyButton } from '@/shared/components';

function APIKeyDisplay({ apiKey }: { apiKey: string }) {
  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 bg-gray-100 p-2 rounded">
        {apiKey}
      </code>
      <CopyButton 
        text={apiKey}
        variant="outline"
        size="md"
        label="Copy Key"
      />
    </div>
  );
}
```

### Transaction Credentials

```tsx
import { CopyButton } from '@/shared/components';

function CredentialField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-sm text-gray-500">{label}</label>
      <div className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2">
        <span className="flex-1 font-mono text-sm">{value}</span>
        <CopyButton 
          text={value}
          iconOnly
          ariaLabel={`Copy ${label}`}
        />
      </div>
    </div>
  );
}
```

### Custom Implementation with Hook

```tsx
import { useCopyToClipboard } from '@/shared/hooks';
import { Copy, Check } from 'lucide-react';

function CustomCopyButton({ text }: { text: string }) {
  const { copied, copyToClipboard } = useCopyToClipboard();

  return (
    <button
      onClick={() => copyToClipboard(text)}
      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}
```

## Browser Compatibility

The implementation uses the modern Clipboard API with automatic fallback:

1. **Modern browsers** (Chrome 63+, Firefox 53+, Safari 13.1+):
   - Uses `navigator.clipboard.writeText()`
   - Requires HTTPS or localhost

2. **Older browsers**:
   - Falls back to `document.execCommand('copy')`
   - Works in HTTP contexts

3. **Error handling**:
   - Gracefully handles permission denials
   - Logs errors to console
   - Returns boolean success status

## Accessibility

Both the hook and component are built with accessibility in mind:

- **Keyboard accessible**: All buttons are keyboard navigable
- **Screen reader support**: Proper ARIA labels and announcements
- **Visual feedback**: Clear visual indication of copy success
- **Focus management**: Maintains proper focus states

### ARIA Labels

```tsx
// Descriptive aria-label
<CopyButton 
  text="API_KEY_123"
  ariaLabel="Copy API key to clipboard"
  iconOnly
/>

// Dynamic aria-label based on state
const { copied, copyToClipboard } = useCopyToClipboard();
<button aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}>
  {/* ... */}
</button>
```

## Best Practices

1. **Provide visual feedback**: Always show when copy is successful
2. **Use descriptive labels**: Make it clear what will be copied
3. **Handle errors gracefully**: Show error messages if copy fails
4. **Consider context**: Use icon-only buttons in tight spaces, full buttons elsewhere
5. **Accessibility first**: Always provide proper ARIA labels
6. **Auto-reset**: Let the copied state reset automatically (default 2 seconds)

## Common Patterns

### Copy with Toast Notification

```tsx
import { useCopyToClipboard } from '@/shared/hooks';
import { useToast } from '@/shared/contexts/ToastContext';

function CopyWithToast({ text }: { text: string }) {
  const { copyToClipboard } = useCopyToClipboard();
  const { showToast } = useToast();

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      showToast({
        type: 'success',
        message: 'Copied to clipboard!',
      });
    } else {
      showToast({
        type: 'error',
        message: 'Failed to copy',
      });
    }
  };

  return <button onClick={handleCopy}>Copy</button>;
}
```

### Copy Multiple Fields

```tsx
function MultiFieldCopy({ fields }: { fields: Record<string, string> }) {
  return (
    <div className="space-y-2">
      {Object.entries(fields).map(([key, value]) => (
        <div key={key} className="flex items-center gap-2">
          <span className="flex-1">{key}: {value}</span>
          <CopyButton 
            text={value}
            iconOnly
            ariaLabel={`Copy ${key}`}
          />
        </div>
      ))}
    </div>
  );
}
```

## Troubleshooting

### Copy not working in development

**Issue**: Clipboard API requires HTTPS or localhost

**Solution**: 
- Use `localhost` instead of `127.0.0.1`
- The fallback method will work in HTTP contexts

### Copy not working in older browsers

**Issue**: Browser doesn't support Clipboard API

**Solution**: The implementation automatically falls back to `execCommand`, which works in older browsers

### Permission denied error

**Issue**: User denied clipboard permission

**Solution**: The error is caught and logged. Consider showing a message to the user explaining they need to grant clipboard permission.

## Related Components

- **Button**: Base button component used by CopyButton
- **Toast**: For showing copy success notifications
- **Tooltip**: Can be combined with CopyButton for additional context

## Migration Guide

If you're using the old `copyToClipboard` utility function from `helpers.ts`, migrate to the new hook:

### Before

```tsx
import { copyToClipboard } from '@/features/member-area/utils/helpers';

const handleCopy = async () => {
  const success = await copyToClipboard(text);
  if (success) {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
};
```

### After

```tsx
import { useCopyToClipboard } from '@/shared/hooks';

const { copied, copyToClipboard } = useCopyToClipboard();

const handleCopy = () => copyToClipboard(text);
```

Or use the CopyButton component directly:

```tsx
import { CopyButton } from '@/shared/components';

<CopyButton text={text} label="Copy" />
```

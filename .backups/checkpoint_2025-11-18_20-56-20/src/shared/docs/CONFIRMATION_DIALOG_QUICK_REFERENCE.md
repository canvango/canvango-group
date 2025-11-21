# Confirmation Dialog - Quick Reference

## Import

```typescript
import { useConfirmDialog } from '@/shared/components/ConfirmDialog';
```

## Basic Setup

```typescript
const { confirm, ConfirmDialog } = useConfirmDialog();

// In JSX
<ConfirmDialog />
```

## Usage

```typescript
confirm({
  title: 'Action Title',
  message: 'Detailed explanation',
  variant: 'warning',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  onConfirm: async () => {
    await performAction();
  },
});
```

## Variants

| Variant | Color | Use Case | Example |
|---------|-------|----------|---------|
| `danger` | Red | Destructive actions | Delete account, invalidate key |
| `warning` | Orange | Important actions | Purchase, submit claim |
| `info` | Blue | Informational | Export data, send notification |
| `default` | Gray | General | Close without saving |

## Props

```typescript
{
  title: string;              // Required
  message: string;            // Required
  variant?: 'danger' | 'warning' | 'info' | 'default';
  confirmLabel?: string;      // Default: 'Confirm'
  cancelLabel?: string;       // Default: 'Cancel'
  onConfirm: () => void | Promise<void>;  // Required
}
```

## Examples

### Purchase Confirmation
```typescript
confirm({
  title: 'Confirm Purchase',
  message: `Purchase "${product.title}" for ${formatCurrency(product.price)}?`,
  variant: 'warning',
  confirmLabel: 'Purchase',
  onConfirm: async () => await purchaseProduct(productId),
});
```

### Delete Confirmation
```typescript
confirm({
  title: 'Delete Item',
  message: 'This action cannot be undone.',
  variant: 'danger',
  confirmLabel: 'Delete',
  onConfirm: async () => await deleteItem(itemId),
});
```

### API Key Regeneration
```typescript
confirm({
  title: 'Generate New API Key',
  message: 'Current key will be invalidated. Applications using it will stop working.',
  variant: 'danger',
  confirmLabel: 'Generate New Key',
  onConfirm: async () => await generateAPIKey(),
});
```

## Keyboard Shortcuts

- **Tab**: Navigate between buttons
- **Enter**: Confirm action
- **Escape**: Cancel action

## Best Practices

✅ **Do**:
- Use specific, clear messages
- Include relevant details (names, prices)
- Choose appropriate variant
- Use action-oriented button labels
- Handle async operations properly

❌ **Don't**:
- Use for non-destructive actions
- Use generic messages like "Are you sure?"
- Overuse danger variant
- Use "Yes/No" as button labels

## Common Pattern

```typescript
const MyComponent = () => {
  const { confirm, ConfirmDialog } = useConfirmDialog();
  
  const handleAction = (item) => {
    confirm({
      title: 'Confirm Action',
      message: `Perform action on "${item.name}"?`,
      variant: 'warning',
      confirmLabel: 'Confirm',
      onConfirm: async () => {
        try {
          await performAction(item.id);
          showSuccessToast('Success!');
        } catch (error) {
          showErrorToast('Failed!');
        }
      },
    });
  };
  
  return (
    <>
      <button onClick={() => handleAction(item)}>Action</button>
      <ConfirmDialog />
    </>
  );
};
```

## Files

- **Component**: `src/shared/components/ConfirmDialog.tsx`
- **Full Guide**: `src/shared/docs/CONFIRMATION_DIALOG_GUIDE.md`
- **Examples**: See pages in `src/features/member-area/pages/`

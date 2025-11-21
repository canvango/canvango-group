# Confirmation Dialog Guide

## Overview

The `ConfirmDialog` component provides a consistent way to confirm destructive or important actions across the application. It prevents accidental actions by requiring explicit user confirmation.

## When to Use

Use confirmation dialogs for:
- **Destructive actions**: Deleting data, invalidating keys, canceling orders
- **Financial transactions**: Purchases, refunds, transfers
- **Irreversible operations**: Submissions that can't be undone
- **High-impact changes**: Actions that significantly affect user data or settings

## Basic Usage

### 1. Import the Hook

```typescript
import { useConfirmDialog } from '@/shared/components/ConfirmDialog';
```

### 2. Initialize in Component

```typescript
const MyComponent = () => {
  const { confirm, ConfirmDialog } = useConfirmDialog();
  
  // ... rest of component
};
```

### 3. Use in Event Handler

```typescript
const handleDelete = () => {
  confirm({
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item? This action cannot be undone.',
    variant: 'danger',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    onConfirm: async () => {
      await deleteItem();
    },
  });
};
```

### 4. Render the Dialog

```typescript
return (
  <div>
    <button onClick={handleDelete}>Delete</button>
    <ConfirmDialog />
  </div>
);
```

## Variants

Choose the appropriate variant based on action severity:

### Danger (Red)
Use for destructive actions that can't be undone:
```typescript
variant: 'danger'
```
**Examples**: Delete account, invalidate API key, cancel subscription

### Warning (Orange)
Use for important actions with significant consequences:
```typescript
variant: 'warning'
```
**Examples**: Purchase products, submit claims, update critical settings

### Info (Blue)
Use for informational confirmations:
```typescript
variant: 'info'
```
**Examples**: Save draft, export data, send notifications

### Default (Gray)
Use for general confirmations:
```typescript
variant: 'default'
```
**Examples**: Close without saving, navigate away, refresh data

## Configuration Options

```typescript
interface ConfirmOptions {
  title: string;              // Dialog title
  message: string;            // Explanation of action and consequences
  variant?: 'danger' | 'warning' | 'info' | 'default';
  confirmLabel?: string;      // Confirm button text (default: 'Confirm')
  cancelLabel?: string;       // Cancel button text (default: 'Cancel')
  onConfirm: () => void | Promise<void>;  // Action to perform
}
```

## Real-World Examples

### Product Purchase

```typescript
const handleBuy = (productId: string) => {
  const product = products.find(p => p.id === productId);
  
  confirm({
    title: 'Confirm Purchase',
    message: `Are you sure you want to purchase "${product.title}" for ${formatCurrency(product.price)}? This action cannot be undone.`,
    variant: 'warning',
    confirmLabel: 'Purchase',
    cancelLabel: 'Cancel',
    onConfirm: async () => {
      await purchaseProduct(productId);
      showSuccessToast('Purchase successful!');
    },
  });
};
```

### API Key Regeneration

```typescript
const handleGenerateKey = () => {
  confirm({
    title: 'Generate New API Key',
    message: 'Your current API key will be invalidated and any applications using it will stop working. This action cannot be undone.',
    variant: 'danger',
    confirmLabel: 'Generate New Key',
    cancelLabel: 'Cancel',
    onConfirm: async () => {
      await generateNewAPIKey();
      showSuccessToast('New API key generated');
    },
  });
};
```

### Warranty Claim Submission

```typescript
const handleSubmitClaim = (data: ClaimData) => {
  confirm({
    title: 'Confirm Warranty Claim',
    message: `Submit warranty claim for ${data.accountInfo}? This will be reviewed by our team.`,
    variant: 'warning',
    confirmLabel: 'Submit Claim',
    cancelLabel: 'Cancel',
    onConfirm: async () => {
      await submitClaim(data);
      showSuccessToast('Claim submitted successfully');
    },
  });
};
```

### Account Deletion

```typescript
const handleDeleteAccount = () => {
  confirm({
    title: 'Delete Account',
    message: 'This will permanently delete your account and all associated data. This action cannot be undone.',
    variant: 'danger',
    confirmLabel: 'Delete Account',
    cancelLabel: 'Keep Account',
    onConfirm: async () => {
      await deleteAccount();
      navigate('/goodbye');
    },
  });
};
```

## Best Practices

### 1. Clear Messaging
- **Be specific**: Explain exactly what will happen
- **Show consequences**: Mention if action is irreversible
- **Include details**: Show relevant data (product name, price, etc.)

```typescript
// ❌ Bad
message: 'Are you sure?'

// ✅ Good
message: 'Are you sure you want to purchase "BM Verified Account" for Rp 500,000? This action cannot be undone.'
```

### 2. Appropriate Variants
- Use `danger` for destructive actions
- Use `warning` for important confirmations
- Don't overuse danger variant (causes alert fatigue)

```typescript
// ❌ Bad - Using danger for a purchase
variant: 'danger'

// ✅ Good - Using warning for a purchase
variant: 'warning'
```

### 3. Action-Oriented Labels
- Use verbs that describe the action
- Match the action being confirmed

```typescript
// ❌ Bad
confirmLabel: 'Yes'

// ✅ Good
confirmLabel: 'Purchase'
confirmLabel: 'Delete'
confirmLabel: 'Submit Claim'
```

### 4. Async Operations
- Always use async/await for API calls
- Handle errors appropriately
- Show loading state (handled automatically)

```typescript
onConfirm: async () => {
  try {
    await performAction();
    showSuccessToast('Action completed');
  } catch (error) {
    showErrorToast('Action failed');
  }
}
```

### 5. Context-Aware Messages
- Include relevant data in the message
- Help users understand what they're confirming

```typescript
const product = products.find(p => p.id === productId);
message: `Purchase "${product.title}" for ${formatCurrency(product.price)}?`
```

## Accessibility

The ConfirmDialog component is fully accessible:

### Keyboard Navigation
- **Tab**: Move between Cancel and Confirm buttons
- **Enter**: Confirm action (when Confirm button focused)
- **Escape**: Cancel and close dialog

### Screen Reader Support
- Proper ARIA roles and labels
- Focus management (trapped in dialog)
- Descriptive button labels

### Visual Indicators
- Color-coded variants
- Icons for quick recognition
- High contrast text

## Common Patterns

### With Loading State

The dialog automatically shows loading state during async operations:

```typescript
onConfirm: async () => {
  // Loading state shown automatically
  await longRunningOperation();
  // Dialog closes automatically on success
}
```

### With Error Handling

```typescript
onConfirm: async () => {
  try {
    await riskyOperation();
  } catch (error) {
    // Dialog stays open on error
    showErrorToast(error.message);
    throw error; // Re-throw to keep dialog open
  }
}
```

### With Success Feedback

```typescript
onConfirm: async () => {
  await performAction();
  showSuccessToast('Action completed successfully!');
  // Dialog closes automatically
}
```

### Multiple Confirmations

```typescript
const { confirm: confirm1, ConfirmDialog: Dialog1 } = useConfirmDialog();
const { confirm: confirm2, ConfirmDialog: Dialog2 } = useConfirmDialog();

return (
  <>
    <button onClick={() => confirm1({...})}>Action 1</button>
    <button onClick={() => confirm2({...})}>Action 2</button>
    <Dialog1 />
    <Dialog2 />
  </>
);
```

## Anti-Patterns

### ❌ Don't Use for Non-Destructive Actions

```typescript
// Bad - Confirmation not needed
confirm({
  title: 'View Details',
  message: 'Do you want to view details?',
  onConfirm: () => navigate('/details')
});
```

### ❌ Don't Use Generic Messages

```typescript
// Bad - Not specific enough
message: 'Are you sure you want to continue?'

// Good - Specific and clear
message: 'Are you sure you want to delete this account? This action cannot be undone.'
```

### ❌ Don't Overuse Danger Variant

```typescript
// Bad - Causes alert fatigue
variant: 'danger' // for every action

// Good - Reserve for truly destructive actions
variant: 'warning' // for purchases
variant: 'danger'  // for deletions
```

## Testing

### Manual Testing Checklist
- [ ] Dialog appears on action trigger
- [ ] Cancel button closes dialog without action
- [ ] Confirm button executes action
- [ ] Loading state shows during async operations
- [ ] Dialog closes after successful action
- [ ] Escape key cancels action
- [ ] Enter key confirms action
- [ ] Focus is trapped in dialog
- [ ] Focus returns to trigger on close

### Unit Testing Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { useConfirmDialog } from '@/shared/components/ConfirmDialog';

test('shows confirmation dialog and executes action', async () => {
  const mockAction = jest.fn();
  
  const TestComponent = () => {
    const { confirm, ConfirmDialog } = useConfirmDialog();
    
    return (
      <>
        <button onClick={() => confirm({
          title: 'Test',
          message: 'Test message',
          onConfirm: mockAction
        })}>
          Trigger
        </button>
        <ConfirmDialog />
      </>
    );
  };
  
  render(<TestComponent />);
  
  // Trigger dialog
  fireEvent.click(screen.getByText('Trigger'));
  
  // Verify dialog appears
  expect(screen.getByText('Test')).toBeInTheDocument();
  
  // Confirm action
  fireEvent.click(screen.getByText('Confirm'));
  
  // Verify action executed
  expect(mockAction).toHaveBeenCalled();
});
```

## Related Components

- **Modal**: Base component for ConfirmDialog
- **Button**: Used for Cancel and Confirm actions
- **Toast**: For success/error feedback after confirmation

## Support

For questions or issues with the ConfirmDialog component:
1. Check this guide for common patterns
2. Review existing implementations in the codebase
3. Consult the component source code: `src/shared/components/ConfirmDialog.tsx`

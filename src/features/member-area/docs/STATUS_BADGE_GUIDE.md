# StatusBadge Component Guide

## Overview

The `StatusBadge` component provides a consistent way to display status indicators throughout the Member Area. It uses color-coded badges with appropriate icons to communicate status information clearly to users.

## Requirements Coverage

This component satisfies the following requirements:

- **2.6**: Display recent transactions table with status badges
- **3.3**: Display transaction table with status badges  
- **8.7**: Display green success badge for "Approved" claims
- **8.8**: Display red rejection badge for "Rejected" claims
- **8.9**: Display yellow pending badge for "Pending" claims
- **12.6**: Use color-coded badges with appropriate icons

## Features

✅ **Multiple Status Types**: Supports 10 different status types
✅ **Color Variants**: Automatic color coding based on status
✅ **Optional Icons**: Icons can be shown or hidden
✅ **Size Configurable**: Three sizes (sm, md, lg)
✅ **Accessible**: Includes proper ARIA labels
✅ **Consistent Design**: Uses Canvango Group brand colors

## API

### Props

```typescript
interface StatusBadgeProps {
  status: Status;           // Required: The status to display
  size?: 'sm' | 'md' | 'lg'; // Optional: Badge size (default: 'md')
  showIcon?: boolean;       // Optional: Show/hide icon (default: true)
  className?: string;       // Optional: Additional CSS classes
}

type Status = 
  | 'success'      // Green - Successful operations
  | 'failed'       // Red - Failed operations
  | 'pending'      // Yellow - Awaiting action
  | 'processing'   // Blue - Currently processing
  | 'approved'     // Green - Approved items
  | 'rejected'     // Red - Rejected items
  | 'completed'    // Green - Completed tasks
  | 'cancelled'    // Gray - Cancelled operations
  | 'active'       // Green - Active items
  | 'expired';     // Red - Expired items
```

## Usage Examples

### Basic Usage

```tsx
import { StatusBadge } from '@/features/member-area/components/shared';

// Simple status badge
<StatusBadge status="success" />

// With custom size
<StatusBadge status="pending" size="sm" />

// Without icon
<StatusBadge status="failed" showIcon={false} />
```

### In Transaction Tables (Requirements 2.6, 3.3)

```tsx
import { StatusBadge } from '@/features/member-area/components/shared';

const TransactionRow = ({ transaction }) => (
  <tr>
    <td>{transaction.id}</td>
    <td>
      <StatusBadge 
        status={transaction.status} 
        size="sm" 
      />
    </td>
  </tr>
);
```

### In Warranty Claims (Requirements 8.7, 8.8, 8.9)

```tsx
import { StatusBadge } from '@/features/member-area/components/shared';

const ClaimRow = ({ claim }) => (
  <tr>
    <td>{claim.id}</td>
    <td>
      {/* Green badge for approved (8.7) */}
      {/* Red badge for rejected (8.8) */}
      {/* Yellow badge for pending (8.9) */}
      <StatusBadge 
        status={claim.status} 
        size="sm" 
      />
    </td>
  </tr>
);
```

### All Status Types

```tsx
// Transaction statuses
<StatusBadge status="success" />   // Successful transaction
<StatusBadge status="pending" />   // Pending transaction
<StatusBadge status="failed" />    // Failed transaction

// Warranty claim statuses
<StatusBadge status="approved" />  // Approved claim
<StatusBadge status="rejected" />  // Rejected claim
<StatusBadge status="pending" />   // Pending claim

// Order statuses
<StatusBadge status="processing" /> // Order being processed
<StatusBadge status="completed" />  // Order completed
<StatusBadge status="cancelled" />  // Order cancelled

// Account statuses
<StatusBadge status="active" />    // Active account
<StatusBadge status="expired" />   // Expired account
```

## Status Type Mapping

| Status | Color | Icon | Use Case |
|--------|-------|------|----------|
| `success` | Green | CheckCircle | Successful transactions |
| `failed` | Red | XCircle | Failed transactions |
| `pending` | Yellow | Clock | Pending transactions/claims |
| `processing` | Blue | Loader (animated) | Processing orders |
| `approved` | Green | CheckCircle | Approved warranty claims |
| `rejected` | Red | XCircle | Rejected warranty claims |
| `completed` | Green | CheckCircle | Completed orders |
| `cancelled` | Gray | XCircle | Cancelled orders |
| `active` | Green | CheckCircle | Active accounts |
| `expired` | Red | AlertCircle | Expired accounts/warranties |

## Size Guide

```tsx
// Small - Use in dense tables
<StatusBadge status="success" size="sm" />

// Medium (default) - Use in most contexts
<StatusBadge status="success" size="md" />

// Large - Use in prominent displays
<StatusBadge status="success" size="lg" />
```

## Accessibility

The StatusBadge component includes proper accessibility features:

- **ARIA Role**: `role="status"` for status indicators
- **ARIA Label**: `aria-label="Status: {status}"` for screen readers
- **Color + Icon**: Uses both color and icons (not color alone)
- **Keyboard Accessible**: Can be focused and read by screen readers

## Design System Integration

The component uses the Canvango Group design system:

- **Colors**: Primary blue (#4F46E5), success green (#10B981), warning orange (#F59E0B), error red (#EF4444)
- **Icons**: Lucide React icon library
- **Typography**: Consistent font sizes and weights
- **Spacing**: Standard padding and gap values

## Best Practices

### ✅ Do

- Use consistent status types across the application
- Show icons for better visual recognition
- Use appropriate sizes for context (sm in tables, md elsewhere)
- Provide meaningful status labels

### ❌ Don't

- Don't create custom status types - use the predefined ones
- Don't hide icons unless space is extremely limited
- Don't use large badges in dense layouts
- Don't rely on color alone (icons provide additional context)

## Migration from Badge Component

If you're currently using the base `Badge` component for status indicators, migrate to `StatusBadge`:

```tsx
// Before
<Badge variant="success" size="sm">
  <CheckCircle className="w-4 h-4" />
  Success
</Badge>

// After
<StatusBadge status="success" size="sm" />
```

Benefits:
- Consistent status labels
- Automatic icon selection
- Standardized color mapping
- Less code to maintain

## Error Handling

The component handles unknown status types gracefully:

```tsx
// Unknown status will log a warning and display with default styling
<StatusBadge status="unknown" /> // Logs: "Unknown status: unknown"
```

## Related Components

- **Badge**: Base component used by StatusBadge
- **WarrantyBadge**: Specialized badge for warranty status
- **EmptyState**: Used when no status data is available

## Examples

See `StatusBadgeExample.tsx` for a comprehensive demonstration of all features.

## Support

For questions or issues with the StatusBadge component, refer to:
- Design document: `.kiro/specs/member-area-content-framework/design.md`
- Requirements: `.kiro/specs/member-area-content-framework/requirements.md`
- Component source: `src/features/member-area/components/shared/StatusBadge.tsx`

# StatusBadge Quick Reference

## Import

```tsx
import { StatusBadge } from '@/features/member-area/components/shared';
```

## Basic Usage

```tsx
<StatusBadge status="success" />
<StatusBadge status="pending" size="sm" />
<StatusBadge status="failed" showIcon={false} />
```

## Status Types

| Status | Color | Use For |
|--------|-------|---------|
| `success` | 🟢 Green | Successful transactions |
| `failed` | 🔴 Red | Failed transactions |
| `pending` | 🟡 Yellow | Pending items |
| `processing` | 🔵 Blue | Processing orders |
| `approved` | 🟢 Green | Approved claims |
| `rejected` | 🔴 Red | Rejected claims |
| `completed` | 🟢 Green | Completed tasks |
| `cancelled` | ⚪ Gray | Cancelled items |
| `active` | 🟢 Green | Active accounts |
| `expired` | 🔴 Red | Expired items |

## Props

```typescript
status: Status          // Required
size?: 'sm'|'md'|'lg'  // Default: 'md'
showIcon?: boolean      // Default: true
className?: string      // Optional
```

## Common Patterns

### Transaction Table
```tsx
<StatusBadge status={transaction.status} size="sm" />
```

### Warranty Claims
```tsx
<StatusBadge status={claim.status} size="sm" />
// Automatically shows:
// - Green for "approved" (Req 8.7)
// - Red for "rejected" (Req 8.8)
// - Yellow for "pending" (Req 8.9)
```

### Order Status
```tsx
<StatusBadge status="processing" />
<StatusBadge status="completed" />
```

## Requirements Coverage

✅ 2.6 - Transaction table status badges
✅ 3.3 - Transaction history status badges
✅ 8.7 - Green badge for approved claims
✅ 8.8 - Red badge for rejected claims
✅ 8.9 - Yellow badge for pending claims
✅ 12.6 - Color-coded badges with icons

## See Also

- Full Guide: `STATUS_BADGE_GUIDE.md`
- Example: `StatusBadgeExample.tsx`
- Source: `StatusBadge.tsx`

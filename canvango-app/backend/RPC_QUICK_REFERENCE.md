# RPC Functions Quick Reference

Quick reference guide for using database RPC functions in the Canvango backend.

## Available Functions

### 1. update_user_balance

**Purpose**: Atomically update user balance

**Model Method**: `UserModel.updateBalance(userId, amount)`

**Usage**:
```typescript
import { UserModel } from '../models/User.model';

// Add funds
const user = await UserModel.updateBalance(userId, 100.00);

// Deduct funds
const user = await UserModel.updateBalance(userId, -50.00);
```

**Common Use Cases**:
- Processing top-ups
- Deducting transaction fees
- Refunding users
- Admin balance adjustments

**Error Handling**:
```typescript
const user = await UserModel.updateBalance(userId, -100);
if (!user) {
  // Handle error (insufficient balance or user not found)
  throw new Error('Failed to update balance');
}
```

---

### 2. increment_tutorial_views

**Purpose**: Atomically increment tutorial view count

**Model Method**: `TutorialModel.incrementViewCount(tutorialId)`

**Usage**:
```typescript
import { TutorialModel } from '../models/Tutorial.model';

// Increment view count
const tutorial = await TutorialModel.incrementViewCount(tutorialId);
```

**Common Use Cases**:
- Recording tutorial views
- Tracking popular content
- Analytics

**Error Handling**:
```typescript
try {
  const tutorial = await TutorialModel.incrementViewCount(tutorialId);
} catch (error) {
  // Handle error (tutorial not found)
  console.error('Failed to increment view count:', error);
}
```

---

## Controller Examples

### Top-Up Controller

```typescript
// Process top-up and add funds to user balance
async function processTopUp(req: AuthRequest, res: Response) {
  const { amount } = req.body;
  const userId = req.user!.userId;

  try {
    // Add funds using RPC function
    const user = await UserModel.updateBalance(userId, amount);
    
    if (!user) {
      return res.status(400).json(
        errorResponse('BALANCE_UPDATE_FAILED', 'Failed to update balance')
      );
    }

    res.json(successResponse({ balance: user.balance }));
  } catch (error) {
    console.error('Top-up error:', error);
    res.status(500).json(errorResponse('INTERNAL_ERROR', 'Top-up failed'));
  }
}
```

### Transaction Controller

```typescript
// Process transaction and deduct funds
async function createTransaction(req: AuthRequest, res: Response) {
  const { amount, type } = req.body;
  const userId = req.user!.userId;

  try {
    // Deduct funds using RPC function
    const user = await UserModel.updateBalance(userId, -amount);
    
    if (!user) {
      return res.status(400).json(
        errorResponse('INSUFFICIENT_BALANCE', 'Insufficient balance')
      );
    }

    // Create transaction record
    const transaction = await TransactionModel.create({
      user_id: userId,
      amount,
      type,
      status: 'completed'
    });

    res.json(successResponse({ transaction, balance: user.balance }));
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json(errorResponse('INTERNAL_ERROR', 'Transaction failed'));
  }
}
```

### Tutorial Controller

```typescript
// Get tutorial and increment view count
async function getTutorial(req: Request, res: Response) {
  const { id } = req.params;

  try {
    // Get tutorial
    const tutorial = await TutorialModel.findById(id);
    
    if (!tutorial) {
      return res.status(404).json(
        errorResponse('TUTORIAL_NOT_FOUND', 'Tutorial not found')
      );
    }

    // Increment view count (non-blocking)
    TutorialModel.incrementViewCount(id).catch(error => {
      console.error('Failed to increment view count:', error);
      // Don't fail the request if view count update fails
    });

    res.json(successResponse(tutorial));
  } catch (error) {
    console.error('Get tutorial error:', error);
    res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to get tutorial'));
  }
}
```

---

## Best Practices

### 1. Always Handle Errors

```typescript
// ❌ Bad
const user = await UserModel.updateBalance(userId, amount);
console.log(user.balance); // May crash if user is null

// ✅ Good
const user = await UserModel.updateBalance(userId, amount);
if (!user) {
  throw new Error('Failed to update balance');
}
console.log(user.balance);
```

### 2. Use Transactions for Multiple Operations

```typescript
// When combining balance update with other operations
try {
  // Update balance
  const user = await UserModel.updateBalance(userId, -amount);
  if (!user) throw new Error('Insufficient balance');

  // Create transaction record
  const transaction = await TransactionModel.create({...});
  
  // Both succeed or both fail
} catch (error) {
  // Handle rollback if needed
}
```

### 3. Non-Critical Operations

```typescript
// For non-critical operations like view counts
// Don't block the response
TutorialModel.incrementViewCount(id).catch(error => {
  console.error('View count update failed:', error);
  // Log but don't fail the request
});
```

### 4. Validate Before Calling

```typescript
// Validate inputs before calling RPC functions
if (amount <= 0) {
  return res.status(400).json(
    errorResponse('INVALID_AMOUNT', 'Amount must be positive')
  );
}

const user = await UserModel.updateBalance(userId, amount);
```

---

## Testing

### Unit Tests

```typescript
import { UserModel } from '../models/User.model';
import { getSupabaseClient } from '../config/supabase';

jest.mock('../config/supabase');

describe('UserModel.updateBalance', () => {
  it('should update balance successfully', async () => {
    const mockSupabase = {
      rpc: jest.fn().mockResolvedValue({ error: null }),
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: '123', balance: 150 },
              error: null
            })
          })
        })
      })
    };

    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

    const user = await UserModel.updateBalance('123', 50);
    
    expect(user).toBeTruthy();
    expect(user?.balance).toBe(150);
    expect(mockSupabase.rpc).toHaveBeenCalledWith('update_user_balance', {
      user_id: '123',
      amount_change: 50
    });
  });
});
```

### Integration Tests

```typescript
describe('Balance Update Integration', () => {
  it('should prevent negative balance', async () => {
    const user = await UserModel.updateBalance(testUserId, -1000000);
    
    // Should return null on insufficient balance
    expect(user).toBeNull();
  });

  it('should handle concurrent updates', async () => {
    // Multiple simultaneous updates
    const updates = await Promise.all([
      UserModel.updateBalance(testUserId, 10),
      UserModel.updateBalance(testUserId, 20),
      UserModel.updateBalance(testUserId, 30)
    ]);

    // All should succeed
    expect(updates.every(u => u !== null)).toBe(true);
    
    // Final balance should be correct
    const user = await UserModel.findById(testUserId);
    expect(user?.balance).toBe(initialBalance + 60);
  });
});
```

---

## Troubleshooting

### Function Not Found

**Error**: `function update_user_balance(uuid, numeric) does not exist`

**Solution**: Deploy the functions to your database
```bash
# See DEPLOY_FUNCTIONS.md for deployment instructions
```

### Insufficient Balance

**Error**: `Insufficient balance. Current: 50, Change: -100, Result: -50`

**Solution**: This is expected behavior. Check user balance before attempting deduction:
```typescript
const user = await UserModel.findById(userId);
if (user.balance < amount) {
  return res.status(400).json(
    errorResponse('INSUFFICIENT_BALANCE', 'Insufficient balance')
  );
}
```

### Tutorial Not Found

**Error**: `Tutorial with ID ... not found`

**Solution**: Verify tutorial exists before incrementing views:
```typescript
const tutorial = await TutorialModel.findById(id);
if (!tutorial) {
  return res.status(404).json(
    errorResponse('TUTORIAL_NOT_FOUND', 'Tutorial not found')
  );
}
```

---

## Related Documentation

- [DATABASE_FUNCTIONS.md](./DATABASE_FUNCTIONS.md) - Detailed function documentation
- [DEPLOY_FUNCTIONS.md](./DEPLOY_FUNCTIONS.md) - Deployment guide
- [User Model](./src/models/User.model.ts) - User model implementation
- [Tutorial Model](./src/models/Tutorial.model.ts) - Tutorial model implementation

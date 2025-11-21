# Database Functions Documentation

This document describes the PostgreSQL functions (RPC) used in the Canvango backend for atomic operations and complex database logic.

## Overview

Database functions are used for operations that require:
- **Atomicity**: Ensuring operations complete fully or not at all
- **Race condition prevention**: Using row-level locking
- **Complex logic**: Business rules enforced at the database level
- **Performance**: Reducing round-trips between application and database

## Functions

### 1. update_user_balance

Atomically updates a user's balance with validation to prevent negative balances and race conditions.

#### Signature

```sql
update_user_balance(
  user_id UUID,
  amount_change DECIMAL
) RETURNS VOID
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `user_id` | UUID | The unique identifier of the user |
| `amount_change` | DECIMAL | Amount to add (positive) or subtract (negative) from balance |

#### Behavior

1. Locks the user row to prevent concurrent modifications
2. Validates that the user exists
3. Calculates the new balance
4. Validates that the new balance is not negative
5. Updates the balance and `updated_at` timestamp
6. Logs the balance change for audit purposes

#### Error Handling

- **User not found**: Raises exception with message `User with ID {user_id} not found`
- **Insufficient balance**: Raises exception with message `Insufficient balance. Current: {current}, Change: {change}, Result: {result}`

#### Usage Example (TypeScript)

```typescript
import { getSupabaseClient } from '../config/supabase';

// Add funds to user balance
async function addFunds(userId: string, amount: number) {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase.rpc('update_user_balance', {
    user_id: userId,
    amount_change: amount
  });
  
  if (error) {
    console.error('Failed to add funds:', error);
    throw new Error('Failed to update balance');
  }
}

// Deduct funds from user balance
async function deductFunds(userId: string, amount: number) {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase.rpc('update_user_balance', {
    user_id: userId,
    amount_change: -amount // Negative for deduction
  });
  
  if (error) {
    if (error.message.includes('Insufficient balance')) {
      throw new Error('Insufficient balance');
    }
    throw new Error('Failed to update balance');
  }
}
```

#### Usage in Model

```typescript
// In User.model.ts
static async updateBalance(id: string, amount: number): Promise<User | null> {
  const { error } = await this.supabase.rpc('update_user_balance', {
    user_id: id,
    amount_change: amount
  });

  if (error) {
    console.error('Error updating balance:', error);
    return null;
  }

  return this.findById(id);
}
```

#### Security

- Granted to `authenticated` and `service_role` roles
- Row-level locking prevents race conditions
- Validation prevents negative balances

---

### 2. increment_tutorial_views

Atomically increments a tutorial's view count by 1, preventing race conditions when multiple users view the same tutorial simultaneously.

#### Signature

```sql
increment_tutorial_views(
  tutorial_id UUID
) RETURNS VOID
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `tutorial_id` | UUID | The unique identifier of the tutorial |

#### Behavior

1. Locks the tutorial row to prevent concurrent modifications
2. Validates that the tutorial exists
3. Increments the view count by 1
4. Updates the `updated_at` timestamp
5. Logs the view count change for monitoring

#### Error Handling

- **Tutorial not found**: Raises exception with message `Tutorial with ID {tutorial_id} not found`

#### Usage Example (TypeScript)

```typescript
import { getSupabaseClient } from '../config/supabase';

// Increment view count when user views a tutorial
async function recordTutorialView(tutorialId: string) {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase.rpc('increment_tutorial_views', {
    tutorial_id: tutorialId
  });
  
  if (error) {
    console.error('Failed to increment view count:', error);
    // Non-critical error, can continue showing tutorial
  }
}
```

#### Usage in Model

```typescript
// In Tutorial.model.ts
static async incrementViewCount(id: string): Promise<Tutorial | null> {
  const { error } = await this.supabase.rpc('increment_tutorial_views', {
    tutorial_id: id
  });

  if (error) {
    console.error('Error incrementing view count:', error);
    throw new Error(`Failed to increment view count: ${error.message}`);
  }

  return this.findById(id);
}
```

#### Security

- Granted to `authenticated`, `service_role`, and `anon` roles
- Anonymous users can increment view counts (public tutorials)
- Row-level locking prevents race conditions

---

### 3. get_transaction_statistics

Efficiently calculates transaction statistics using database-level aggregations. Returns comprehensive statistics including totals and breakdowns by status and product type.

#### Signature

```sql
get_transaction_statistics(
  p_user_id UUID DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
) RETURNS JSON
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `p_user_id` | UUID (optional) | Filter by specific user ID. NULL for all users |
| `p_start_date` | TIMESTAMPTZ (optional) | Filter transactions from this date. NULL for no start limit |
| `p_end_date` | TIMESTAMPTZ (optional) | Filter transactions until this date. NULL for no end limit |

#### Return Value

Returns a JSON object with the following structure:

```json
{
  "total_transactions": 150,
  "total_amount": 45000.00,
  "by_status": [
    {
      "status": "BERHASIL",
      "count": 120,
      "total_amount": 40000.00
    },
    {
      "status": "PENDING",
      "count": 20,
      "total_amount": 4000.00
    },
    {
      "status": "GAGAL",
      "count": 10,
      "total_amount": 1000.00
    }
  ],
  "by_product_type": [
    {
      "product_type": "RMSO_NEW",
      "count": 50,
      "total_amount": 15000.00
    },
    {
      "product_type": "PERSONAL_TUA",
      "count": 40,
      "total_amount": 12000.00
    }
  ]
}
```

#### Behavior

1. Filters transactions based on provided parameters
2. Calculates total transaction count and sum of amounts
3. Groups transactions by status with counts and totals
4. Groups transactions by product type with counts and totals
5. Returns all statistics in a single JSON object

#### Performance Benefits

- **Single database query**: All aggregations done in one call
- **Database-level computation**: Faster than fetching all rows and computing in application
- **Reduced network traffic**: Only summary data returned, not all transaction records
- **Optimized for large datasets**: Efficient even with thousands of transactions

#### Usage Example (TypeScript)

```typescript
import { getSupabaseClient } from '../config/supabase';

// Get all transaction statistics
async function getAllStatistics() {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase.rpc('get_transaction_statistics', {
    p_user_id: null,
    p_start_date: null,
    p_end_date: null
  });
  
  if (error) {
    console.error('Failed to get statistics:', error);
    throw new Error('Failed to get statistics');
  }
  
  return data;
}

// Get statistics for specific user
async function getUserStatistics(userId: string) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase.rpc('get_transaction_statistics', {
    p_user_id: userId,
    p_start_date: null,
    p_end_date: null
  });
  
  if (error) {
    console.error('Failed to get user statistics:', error);
    throw new Error('Failed to get statistics');
  }
  
  return data;
}

// Get statistics for date range
async function getStatisticsForDateRange(startDate: Date, endDate: Date) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase.rpc('get_transaction_statistics', {
    p_user_id: null,
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString()
  });
  
  if (error) {
    console.error('Failed to get statistics:', error);
    throw new Error('Failed to get statistics');
  }
  
  return data;
}
```

#### Usage in Model

```typescript
// In Transaction.model.ts
static async getStatistics(filters?: {
  user_id?: string;
  start_date?: Date;
  end_date?: Date;
}): Promise<{
  total_transactions: number;
  total_amount: number;
  by_status: { status: TransactionStatus; count: number; total_amount: number }[];
  by_product_type: { product_type: ProductType; count: number; total_amount: number }[];
}> {
  const { data, error } = await this.supabase.rpc('get_transaction_statistics', {
    p_user_id: filters?.user_id || null,
    p_start_date: filters?.start_date?.toISOString() || null,
    p_end_date: filters?.end_date?.toISOString() || null
  });

  if (error) {
    console.error('Error getting transaction statistics:', error);
    return {
      total_transactions: 0,
      total_amount: 0,
      by_status: [],
      by_product_type: []
    };
  }

  return {
    total_transactions: data.total_transactions || 0,
    total_amount: Number(data.total_amount) || 0,
    by_status: data.by_status || [],
    by_product_type: data.by_product_type || []
  };
}
```

#### Security

- Granted to `authenticated` and `service_role` roles
- Marked as `STABLE` for query optimization
- No data modification, read-only operation

---

## Deployment

### Option 1: Deploy via Supabase SQL Editor

1. Navigate to your Supabase project dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy the contents of the SQL file from `src/database/functions/`
5. Execute the query
6. Verify the function was created successfully

### Option 2: Deploy via Migration

Create a new migration file:

```bash
# Create migration file
touch src/database/migrations/008_create_database_functions.sql
```

Add both functions to the migration file:

```sql
-- Migration: Create database functions
-- Created: 2024-XX-XX

-- Include update_user_balance function
\i src/database/functions/update_user_balance.sql

-- Include increment_tutorial_views function
\i src/database/functions/increment_tutorial_views.sql
```

Run the migration:

```bash
npm run migrate
```

### Option 3: Deploy via Supabase CLI

If using Supabase CLI locally:

```bash
# Apply the functions
supabase db push

# Or run specific SQL files
psql $DATABASE_URL -f src/database/functions/update_user_balance.sql
psql $DATABASE_URL -f src/database/functions/increment_tutorial_views.sql
```

---

## Testing

### Testing update_user_balance

```sql
-- Test 1: Add funds to user
SELECT update_user_balance('user-uuid-here', 100.00);

-- Verify balance increased
SELECT id, username, balance FROM users WHERE id = 'user-uuid-here';

-- Test 2: Deduct funds
SELECT update_user_balance('user-uuid-here', -50.00);

-- Verify balance decreased
SELECT id, username, balance FROM users WHERE id = 'user-uuid-here';

-- Test 3: Try to create negative balance (should fail)
SELECT update_user_balance('user-uuid-here', -1000.00);
-- Expected: ERROR: Insufficient balance

-- Test 4: Non-existent user (should fail)
SELECT update_user_balance('00000000-0000-0000-0000-000000000000', 10.00);
-- Expected: ERROR: User with ID ... not found
```

### Testing increment_tutorial_views

```sql
-- Test 1: Increment view count
SELECT increment_tutorial_views('tutorial-uuid-here');

-- Verify view count increased
SELECT id, title, view_count FROM tutorials WHERE id = 'tutorial-uuid-here';

-- Test 2: Multiple increments
SELECT increment_tutorial_views('tutorial-uuid-here');
SELECT increment_tutorial_views('tutorial-uuid-here');
SELECT increment_tutorial_views('tutorial-uuid-here');

-- Verify view count increased by 3
SELECT id, title, view_count FROM tutorials WHERE id = 'tutorial-uuid-here';

-- Test 3: Non-existent tutorial (should fail)
SELECT increment_tutorial_views('00000000-0000-0000-0000-000000000000');
-- Expected: ERROR: Tutorial with ID ... not found
```

### Testing get_transaction_statistics

```sql
-- Test 1: Get all transaction statistics
SELECT get_transaction_statistics(NULL, NULL, NULL);

-- Test 2: Get statistics for specific user
SELECT get_transaction_statistics('user-uuid-here', NULL, NULL);

-- Test 3: Get statistics for date range
SELECT get_transaction_statistics(
  NULL,
  '2024-01-01T00:00:00Z'::TIMESTAMPTZ,
  '2024-12-31T23:59:59Z'::TIMESTAMPTZ
);

-- Test 4: Get statistics for specific user and date range
SELECT get_transaction_statistics(
  'user-uuid-here',
  '2024-01-01T00:00:00Z'::TIMESTAMPTZ,
  '2024-12-31T23:59:59Z'::TIMESTAMPTZ
);

-- Test 5: Verify JSON structure
SELECT 
  (get_transaction_statistics(NULL, NULL, NULL))->>'total_transactions' as total_count,
  (get_transaction_statistics(NULL, NULL, NULL))->>'total_amount' as total_amount,
  jsonb_pretty((get_transaction_statistics(NULL, NULL, NULL))::jsonb) as formatted_result;

-- Test 6: Empty result (no transactions)
SELECT get_transaction_statistics(
  '00000000-0000-0000-0000-000000000000',
  NULL,
  NULL
);
-- Expected: {"total_transactions": 0, "total_amount": 0, "by_status": [], "by_product_type": []}
```

---

## Performance Considerations

### Row-Level Locking

Both functions use `FOR UPDATE` to lock rows during updates. This:
- **Prevents race conditions**: Ensures atomic operations
- **May cause contention**: High concurrent access to the same row will queue operations
- **Is necessary**: For financial operations (balance) and accurate counting (views)

### Optimization Tips

1. **Keep transactions short**: Functions execute quickly to minimize lock time
2. **Monitor lock waits**: Use PostgreSQL's `pg_stat_activity` to monitor
3. **Consider caching**: For view counts, consider eventual consistency with caching
4. **Batch operations**: For bulk balance updates, consider batching

### Monitoring

```sql
-- Check for lock waits
SELECT 
  pid,
  usename,
  application_name,
  state,
  wait_event_type,
  wait_event,
  query
FROM pg_stat_activity
WHERE wait_event_type = 'Lock';

-- Check function execution stats
SELECT 
  funcname,
  calls,
  total_time,
  self_time,
  avg_time
FROM pg_stat_user_functions
WHERE funcname IN ('update_user_balance', 'increment_tutorial_views');
```

---

## Troubleshooting

### Function Not Found

**Error**: `function update_user_balance(uuid, numeric) does not exist`

**Solution**:
1. Verify function was deployed: `\df update_user_balance` in psql
2. Check function signature matches call
3. Redeploy function if needed

### Permission Denied

**Error**: `permission denied for function update_user_balance`

**Solution**:
1. Grant execute permission:
```sql
GRANT EXECUTE ON FUNCTION update_user_balance(UUID, DECIMAL) TO authenticated;
```

### Insufficient Balance Error

**Error**: `Insufficient balance. Current: 50, Change: -100, Result: -50`

**Solution**: This is expected behavior. Ensure user has sufficient balance before calling the function.

### Deadlock Detected

**Error**: `deadlock detected`

**Solution**: 
1. This is rare but can happen with complex transactions
2. Implement retry logic in application code
3. Review transaction order to prevent circular dependencies

---

## Best Practices

1. **Always handle errors**: RPC calls can fail, handle them gracefully
2. **Use transactions**: When combining RPC with other operations
3. **Validate inputs**: Check parameters before calling functions
4. **Log operations**: Keep audit trail of balance changes
5. **Test thoroughly**: Test edge cases (negative balance, non-existent IDs)
6. **Monitor performance**: Track function execution time and lock waits
7. **Document changes**: Update this file when modifying functions

---

## Future Enhancements

Potential improvements to consider:

1. **Batch balance updates**: Function to update multiple users at once
2. **Balance history**: Automatic logging of all balance changes
3. **View analytics**: Track view sources and user engagement
4. **Rate limiting**: Prevent view count manipulation
5. **Soft deletes**: Handle deleted users/tutorials gracefully
6. **Audit logging**: Integrate with admin_audit_logs table
7. **Real-time statistics**: Add support for real-time statistics updates
8. **Advanced filtering**: Add more filter options to statistics function (e.g., by multiple statuses)

---

## Related Documentation

- [Database Schema](./DATABASE.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Supabase Integration Guide](./SUPABASE_INTEGRATION_GUIDE.md)
- [User Model](./src/models/User.model.ts)
- [Tutorial Model](./src/models/Tutorial.model.ts)

# Database Functions

This directory contains PostgreSQL functions that should be deployed to your Supabase database.

## Functions

### update_user_balance.sql

Atomically updates a user's balance with validation to prevent negative balances.

**Parameters:**
- `user_id` (UUID): The ID of the user
- `amount_change` (DECIMAL): The amount to add (positive) or subtract (negative) from the balance

**Usage in code:**
```typescript
await supabase.rpc('update_user_balance', {
  user_id: 'user-uuid-here',
  amount_change: 100.50
});
```

**Deployment:**

To deploy this function to your Supabase database, you have two options:

1. **Via Supabase SQL Editor:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `update_user_balance.sql`
   - Run the query

2. **Via Migration:**
   - Create a new migration file in `src/database/migrations/`
   - Copy the function definition into the migration
   - Run the migration script

**Error Handling:**

The function will raise exceptions in the following cases:
- User not found
- Insufficient balance (would result in negative balance)

These exceptions will be caught by the Supabase client and returned as errors.

### increment_tutorial_views.sql

Atomically increments the view count for a tutorial.

**Parameters:**
- `tutorial_id` (UUID): The ID of the tutorial

**Usage in code:**
```typescript
await supabase.rpc('increment_tutorial_views', {
  tutorial_id: 'tutorial-uuid-here'
});
```

**Deployment:**

To deploy this function to your Supabase database, you have two options:

1. **Via Supabase SQL Editor:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `increment_tutorial_views.sql`
   - Run the query

2. **Via Migration:**
   - Create a new migration file in `src/database/migrations/`
   - Copy the function definition into the migration
   - Run the migration script

**Error Handling:**

The function will raise an exception if the tutorial is not found.

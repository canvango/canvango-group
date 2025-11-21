-- Migration: Create database functions for atomic operations
-- Created: 2024-11-15
-- Description: Creates PostgreSQL functions for atomic balance updates and view count increments

-- ============================================================================
-- Function: update_user_balance
-- ============================================================================
-- Atomically updates user balance with validation
-- Prevents negative balances and race conditions

CREATE OR REPLACE FUNCTION update_user_balance(
  user_id UUID,
  amount_change DECIMAL
)
RETURNS VOID AS $$
DECLARE
  current_balance DECIMAL;
  new_balance DECIMAL;
BEGIN
  -- Lock the user row for update to prevent race conditions
  SELECT balance INTO current_balance
  FROM users
  WHERE id = user_id
  FOR UPDATE;
  
  -- Check if user exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User with ID % not found', user_id;
  END IF;
  
  -- Calculate new balance
  new_balance := current_balance + amount_change;
  
  -- Ensure balance doesn't go negative
  IF new_balance < 0 THEN
    RAISE EXCEPTION 'Insufficient balance. Current: %, Change: %, Result: %', 
      current_balance, amount_change, new_balance;
  END IF;
  
  -- Update the balance
  UPDATE users
  SET 
    balance = new_balance,
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Log the balance change for audit purposes
  RAISE NOTICE 'Balance updated for user %: % -> % (change: %)', 
    user_id, current_balance, new_balance, amount_change;
    
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_user_balance(UUID, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_balance(UUID, DECIMAL) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION update_user_balance(UUID, DECIMAL) IS 
'Atomically updates user balance with validation. Prevents negative balances and race conditions.
Parameters:
  - user_id: UUID of the user
  - amount_change: Amount to add (positive) or subtract (negative) from balance
Raises exception if user not found or insufficient balance.';

-- ============================================================================
-- Function: increment_tutorial_views
-- ============================================================================
-- Atomically increments tutorial view count
-- Prevents race conditions when multiple users view the same tutorial

CREATE OR REPLACE FUNCTION increment_tutorial_views(
  tutorial_id UUID
)
RETURNS VOID AS $$
DECLARE
  old_count INTEGER;
  new_count INTEGER;
BEGIN
  -- Lock the tutorial row for update to prevent race conditions
  SELECT view_count INTO old_count
  FROM tutorials
  WHERE id = tutorial_id
  FOR UPDATE;
  
  -- Check if tutorial exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tutorial with ID % not found', tutorial_id;
  END IF;
  
  -- Calculate new view count
  new_count := old_count + 1;
  
  -- Update the view count
  UPDATE tutorials
  SET 
    view_count = new_count,
    updated_at = NOW()
  WHERE id = tutorial_id;
  
  -- Log the view count increment for monitoring
  RAISE NOTICE 'View count incremented for tutorial %: % -> %', 
    tutorial_id, old_count, new_count;
    
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_tutorial_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_tutorial_views(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION increment_tutorial_views(UUID) TO anon;

-- Add comment for documentation
COMMENT ON FUNCTION increment_tutorial_views(UUID) IS 
'Atomically increments tutorial view count by 1. Prevents race conditions.
Parameters:
  - tutorial_id: UUID of the tutorial
Raises exception if tutorial not found.';

-- ============================================================================
-- Function: get_transaction_statistics
-- ============================================================================
-- Efficiently calculates transaction statistics with aggregations
-- Returns JSON with total counts, amounts, and breakdowns by status and product type

CREATE OR REPLACE FUNCTION get_transaction_statistics(
  p_user_id UUID DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSON AS $
DECLARE
  v_result JSON;
BEGIN
  WITH filtered_transactions AS (
    SELECT *
    FROM transactions
    WHERE 
      (p_user_id IS NULL OR user_id = p_user_id)
      AND (p_start_date IS NULL OR created_at >= p_start_date)
      AND (p_end_date IS NULL OR created_at <= p_end_date)
  ),
  status_stats AS (
    SELECT 
      status,
      COUNT(*)::INTEGER as count,
      COALESCE(SUM(total_amount), 0)::NUMERIC as total_amount
    FROM filtered_transactions
    GROUP BY status
  ),
  product_stats AS (
    SELECT 
      product_type,
      COUNT(*)::INTEGER as count,
      COALESCE(SUM(total_amount), 0)::NUMERIC as total_amount
    FROM filtered_transactions
    GROUP BY product_type
  ),
  overall_stats AS (
    SELECT 
      COUNT(*)::INTEGER as total_transactions,
      COALESCE(SUM(total_amount), 0)::NUMERIC as total_amount
    FROM filtered_transactions
  )
  SELECT json_build_object(
    'total_transactions', (SELECT total_transactions FROM overall_stats),
    'total_amount', (SELECT total_amount FROM overall_stats),
    'by_status', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'status', status,
          'count', count,
          'total_amount', total_amount
        )
      ), '[]'::json)
      FROM status_stats
    ),
    'by_product_type', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'product_type', product_type,
          'count', count,
          'total_amount', total_amount
        )
      ), '[]'::json)
      FROM product_stats
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$ LANGUAGE plpgsql STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_transaction_statistics(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION get_transaction_statistics(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION get_transaction_statistics(UUID, TIMESTAMPTZ, TIMESTAMPTZ) IS 
'Calculates transaction statistics with efficient database-level aggregations.
Parameters:
  - p_user_id: Optional UUID to filter by user (NULL for all users)
  - p_start_date: Optional start date filter (NULL for no start limit)
  - p_end_date: Optional end date filter (NULL for no end limit)
Returns JSON with:
  - total_transactions: Total count of transactions
  - total_amount: Sum of all transaction amounts
  - by_status: Array of {status, count, total_amount} grouped by status
  - by_product_type: Array of {product_type, count, total_amount} grouped by product type';

-- ============================================================================
-- Migration complete
-- ============================================================================

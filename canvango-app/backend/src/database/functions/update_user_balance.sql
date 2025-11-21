-- Function to atomically update user balance
-- This function ensures atomic balance updates with validation
-- to prevent race conditions and negative balances

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
  -- This assumes you have an audit log or want to track balance changes
  -- You can remove this if not needed
  RAISE NOTICE 'Balance updated for user %: % -> % (change: %)', 
    user_id, current_balance, new_balance, amount_change;
    
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
-- Adjust this based on your security requirements
GRANT EXECUTE ON FUNCTION update_user_balance(UUID, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_balance(UUID, DECIMAL) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION update_user_balance(UUID, DECIMAL) IS 
'Atomically updates user balance with validation. Prevents negative balances and race conditions.
Parameters:
  - user_id: UUID of the user
  - amount_change: Amount to add (positive) or subtract (negative) from balance
Raises exception if user not found or insufficient balance.';

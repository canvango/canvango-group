-- Function to atomically increment tutorial view count
-- This function ensures atomic view count updates to prevent race conditions

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

-- Grant execute permission to authenticated users
-- Adjust this based on your security requirements
GRANT EXECUTE ON FUNCTION increment_tutorial_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_tutorial_views(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION increment_tutorial_views(UUID) TO anon;

-- Add comment for documentation
COMMENT ON FUNCTION increment_tutorial_views(UUID) IS 
'Atomically increments tutorial view count by 1. Prevents race conditions.
Parameters:
  - tutorial_id: UUID of the tutorial
Raises exception if tutorial not found.';

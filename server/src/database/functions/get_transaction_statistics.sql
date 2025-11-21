-- Function to get transaction statistics with aggregations
-- This function provides efficient statistics calculation at the database level
CREATE OR REPLACE FUNCTION get_transaction_statistics(
  p_user_id UUID DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSON AS $$
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
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_transaction_statistics(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION get_transaction_statistics(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO service_role;

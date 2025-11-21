-- ============================================
-- Test Warranty Edit Feature
-- ============================================

-- 1. Verify all products have warranty fields
SELECT 
  '1. All Products Warranty Status' as test_name,
  COUNT(*) as total_products,
  COUNT(warranty_duration) as has_warranty_duration,
  COUNT(warranty_enabled) as has_warranty_enabled,
  CASE 
    WHEN COUNT(*) = COUNT(warranty_duration) 
     AND COUNT(*) = COUNT(warranty_enabled) 
    THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM products;

-- 2. Verify warranty duration ranges
SELECT 
  '2. Warranty Duration Range' as test_name,
  MIN(warranty_duration) as min_duration,
  MAX(warranty_duration) as max_duration,
  AVG(warranty_duration)::numeric(10,2) as avg_duration,
  CASE 
    WHEN MIN(warranty_duration) >= 0 
     AND MAX(warranty_duration) <= 365 
    THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM products;

-- 3. Verify warranty by product type
SELECT 
  '3. Warranty by Product Type' as test_name,
  product_type,
  COUNT(*) as total,
  AVG(warranty_duration)::numeric(10,2) as avg_duration,
  COUNT(CASE WHEN warranty_enabled THEN 1 END) as enabled_count,
  CASE 
    WHEN product_type = 'bm_account' AND AVG(warranty_duration) = 30 THEN '✅ PASS'
    WHEN product_type = 'personal_account' AND AVG(warranty_duration) = 7 THEN '✅ PASS'
    WHEN product_type IN ('verified_bm', 'api') AND AVG(warranty_duration) = 30 THEN '✅ PASS'
    ELSE '⚠️ CHECK'
  END as status
FROM products
GROUP BY product_type
ORDER BY product_type;

-- 4. List all products with warranty details
SELECT 
  '4. Product Warranty Details' as test_name,
  product_name,
  product_type,
  warranty_duration || ' days' as warranty,
  CASE WHEN warranty_enabled THEN '✅ Enabled' ELSE '❌ Disabled' END as status,
  price
FROM products
ORDER BY product_type, product_name;

-- 5. Verify warranty enabled status
SELECT 
  '5. Warranty Enabled Status' as test_name,
  COUNT(*) as total_products,
  COUNT(CASE WHEN warranty_enabled THEN 1 END) as enabled,
  COUNT(CASE WHEN NOT warranty_enabled THEN 1 END) as disabled,
  CASE 
    WHEN COUNT(CASE WHEN warranty_enabled THEN 1 END) = COUNT(*) 
    THEN '✅ PASS - All enabled'
    ELSE '⚠️ CHECK - Some disabled'
  END as status
FROM products;

-- 6. Test warranty constraints
SELECT 
  '6. Warranty Constraints Test' as test_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM products 
      WHERE warranty_duration < 0 OR warranty_duration > 365
    ) THEN '❌ FAIL - Invalid duration found'
    ELSE '✅ PASS - All durations valid'
  END as status;

-- 7. Summary report
SELECT 
  '7. Summary Report' as test_name,
  'Total Products: ' || COUNT(*) as info,
  'BM Accounts: ' || COUNT(CASE WHEN product_type = 'bm_account' THEN 1 END) as bm_count,
  'Personal Accounts: ' || COUNT(CASE WHEN product_type = 'personal_account' THEN 1 END) as personal_count,
  'Avg Warranty: ' || AVG(warranty_duration)::numeric(10,2) || ' days' as avg_warranty,
  '✅ READY' as status
FROM products;

-- ============================================
-- Expected Results:
-- ============================================
-- Test 1: ✅ PASS - All products have warranty fields
-- Test 2: ✅ PASS - Duration range 0-365
-- Test 3: ✅ PASS - Correct duration by type
-- Test 4: List of all products with warranty
-- Test 5: ✅ PASS - All enabled (or check if some disabled)
-- Test 6: ✅ PASS - No invalid durations
-- Test 7: ✅ READY - Summary statistics
-- ============================================

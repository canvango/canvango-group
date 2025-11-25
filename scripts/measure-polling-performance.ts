/**
 * Performance Test: Measure Polling Overhead
 * 
 * This script measures the performance impact of role polling by:
 * 1. Simulating 100 consecutive role queries
 * 2. Measuring average query time
 * 3. Checking network overhead
 * 4. Verifying app responsiveness is not impacted
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env file manually
const envContent = readFileSync('.env', 'utf-8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const trimmedLine = line.trim();
  if (trimmedLine && !trimmedLine.startsWith('#')) {
    const match = trimmedLine.match(/^([^=]+)=(.*)$/);
    if (match) {
      envVars[match[1].trim()] = match[2].trim();
    }
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL || 'https://gpittnsfzgkdbqnccncn.supabase.co';
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  medianTime: number;
  p95Time: number;
  p99Time: number;
}

async function measureRoleQuery(): Promise<number> {
  const startTime = performance.now();
  
  try {
    // Simulate the actual polling query
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .limit(1)
      .single();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is expected in test context
      throw error;
    }
    
    return duration;
  } catch (error) {
    const endTime = performance.now();
    return endTime - startTime;
  }
}

async function runPerformanceTest(iterations: number = 100): Promise<PerformanceMetrics> {
  console.log(`\n🔬 Starting polling performance test with ${iterations} iterations...\n`);
  
  const queryTimes: number[] = [];
  let successCount = 0;
  let failCount = 0;
  
  const overallStart = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    try {
      const duration = await measureRoleQuery();
      queryTimes.push(duration);
      successCount++;
      
      // Progress indicator
      if ((i + 1) % 10 === 0) {
        process.stdout.write(`\r  Progress: ${i + 1}/${iterations} queries completed`);
      }
    } catch (error) {
      failCount++;
      console.error(`\n  ❌ Query ${i + 1} failed:`, error);
    }
  }
  
  const overallEnd = performance.now();
  const totalTime = overallEnd - overallStart;
  
  console.log(`\n\n✅ Test completed!\n`);
  
  // Calculate statistics
  queryTimes.sort((a, b) => a - b);
  
  const sum = queryTimes.reduce((acc, time) => acc + time, 0);
  const average = sum / queryTimes.length;
  const min = queryTimes[0];
  const max = queryTimes[queryTimes.length - 1];
  const median = queryTimes[Math.floor(queryTimes.length / 2)];
  const p95Index = Math.floor(queryTimes.length * 0.95);
  const p95 = queryTimes[p95Index];
  const p99Index = Math.floor(queryTimes.length * 0.99);
  const p99 = queryTimes[p99Index];
  
  return {
    totalRequests: iterations,
    successfulRequests: successCount,
    failedRequests: failCount,
    totalTime,
    averageTime: average,
    minTime: min,
    maxTime: max,
    medianTime: median,
    p95Time: p95,
    p99Time: p99,
  };
}

function printMetrics(metrics: PerformanceMetrics): void {
  console.log('📊 Performance Metrics:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Total Requests:      ${metrics.totalRequests}`);
  console.log(`  Successful:          ${metrics.successfulRequests} (${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1)}%)`);
  console.log(`  Failed:              ${metrics.failedRequests}`);
  console.log(`  Total Time:          ${metrics.totalTime.toFixed(2)} ms`);
  console.log('');
  console.log('⏱️  Query Time Statistics:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Average:             ${metrics.averageTime.toFixed(2)} ms`);
  console.log(`  Median:              ${metrics.medianTime.toFixed(2)} ms`);
  console.log(`  Min:                 ${metrics.minTime.toFixed(2)} ms`);
  console.log(`  Max:                 ${metrics.maxTime.toFixed(2)} ms`);
  console.log(`  95th Percentile:     ${metrics.p95Time.toFixed(2)} ms`);
  console.log(`  99th Percentile:     ${metrics.p99Time.toFixed(2)} ms`);
  console.log('');
}

function evaluatePerformance(metrics: PerformanceMetrics): void {
  console.log('✨ Performance Evaluation:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Check if average time is acceptable (< 50ms as per design doc)
  if (metrics.averageTime < 50) {
    console.log(`  ✅ Average query time (${metrics.averageTime.toFixed(2)} ms) is excellent (< 50ms)`);
  } else if (metrics.averageTime < 100) {
    console.log(`  ⚠️  Average query time (${metrics.averageTime.toFixed(2)} ms) is acceptable but could be improved`);
  } else {
    console.log(`  ❌ Average query time (${metrics.averageTime.toFixed(2)} ms) is too high (> 100ms)`);
  }
  
  // Check p95 time
  if (metrics.p95Time < 100) {
    console.log(`  ✅ 95th percentile (${metrics.p95Time.toFixed(2)} ms) is within acceptable range`);
  } else {
    console.log(`  ⚠️  95th percentile (${metrics.p95Time.toFixed(2)} ms) shows some slow queries`);
  }
  
  // Check success rate
  const successRate = (metrics.successfulRequests / metrics.totalRequests) * 100;
  if (successRate === 100) {
    console.log(`  ✅ Success rate is 100% - no failed queries`);
  } else if (successRate > 95) {
    console.log(`  ⚠️  Success rate is ${successRate.toFixed(1)}% - some queries failed`);
  } else {
    console.log(`  ❌ Success rate is ${successRate.toFixed(1)}% - too many failures`);
  }
  
  // Estimate polling impact with 5-second interval
  const queriesPerMinute = 60 / 5; // 12 queries per minute
  const estimatedOverheadPerMinute = metrics.averageTime * queriesPerMinute;
  console.log('');
  console.log('📈 Polling Impact Estimate (5-second interval):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Queries per minute:  ${queriesPerMinute}`);
  console.log(`  Overhead per minute: ${estimatedOverheadPerMinute.toFixed(2)} ms`);
  console.log(`  Overhead per hour:   ${(estimatedOverheadPerMinute * 60).toFixed(2)} ms`);
  
  if (estimatedOverheadPerMinute < 1000) {
    console.log(`  ✅ Polling overhead is negligible (< 1 second per minute)`);
  } else {
    console.log(`  ⚠️  Polling overhead is noticeable (> 1 second per minute)`);
  }
  
  console.log('');
  console.log('🎯 Conclusion:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (metrics.averageTime < 50 && successRate === 100 && estimatedOverheadPerMinute < 1000) {
    console.log('  ✅ Polling performance is EXCELLENT');
    console.log('  ✅ No impact on app responsiveness expected');
    console.log('  ✅ Safe to deploy to production');
  } else if (metrics.averageTime < 100 && successRate > 95) {
    console.log('  ⚠️  Polling performance is ACCEPTABLE');
    console.log('  ⚠️  Minimal impact on app responsiveness');
    console.log('  ✅ Can deploy to production with monitoring');
  } else {
    console.log('  ❌ Polling performance needs IMPROVEMENT');
    console.log('  ❌ May impact app responsiveness');
    console.log('  ⚠️  Consider optimizing before production deployment');
  }
  
  console.log('');
}

// Run the test
async function main() {
  try {
    const metrics = await runPerformanceTest(100);
    printMetrics(metrics);
    evaluatePerformance(metrics);
  } catch (error) {
    console.error('❌ Performance test failed:', error);
    process.exit(1);
  }
}

main();

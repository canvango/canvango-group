/**
 * BM Statistics Service
 * 
 * @module services/bmStats
 * @description
 * Provides API functions for fetching real-time statistics for BM Accounts
 * from Supabase database. All statistics are aggregated across all users.
 * 
 * @example
 * ```typescript
 * import { fetchBMStats } from './services/bmStats.service';
 * 
 * const stats = await fetchBMStats();
 * console.log(stats.totalStock); // Total available BM products
 * console.log(stats.successRate); // Success rate percentage
 * console.log(stats.totalSoldThisMonth); // Total sold this month
 * ```
 */

import { supabase } from './supabase';

/**
 * BM Account statistics
 * 
 * @interface BMStats
 * @property {number} totalStock - Total available BM products (all active products)
 * @property {number} successRate - Success rate percentage based on completed transactions
 * @property {number} totalSoldThisMonth - Total completed purchases this month (resets monthly)
 */
export interface BMStats {
  totalStock: number;
  successRate: number;
  totalSoldThisMonth: number;
}

/**
 * Fetch BM Account statistics from Supabase
 * 
 * @async
 * @function fetchBMStats
 * @returns {Promise<BMStats>} Real-time statistics for BM Accounts
 * 
 * @throws {Error} When database query fails
 * 
 * @description
 * Fetches three key metrics:
 * 1. Total Stock: Count of all active BM products with available stock
 * 2. Success Rate: Percentage of completed transactions vs total transactions
 * 3. Total Sold This Month: Count of completed purchases in current month
 * 
 * All statistics are aggregated across all users (not per-user).
 * 
 * @example
 * ```typescript
 * const stats = await fetchBMStats();
 * // stats = { totalStock: 11, successRate: 90.9, totalSoldThisMonth: 10 }
 * ```
 */
export const fetchBMStats = async (): Promise<BMStats> => {
  try {
    console.log('[BMStats] Starting to fetch statistics using database function...');

    // Use database function to get statistics (bypasses RLS for aggregate data)
    const { data, error } = await supabase
      .rpc('get_bm_stats');

    if (error) {
      console.error('[BMStats] Error fetching stats from function:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('[BMStats] No data returned from function');
      return {
        totalStock: 0,
        successRate: 0,
        totalSoldThisMonth: 0,
      };
    }

    const stats = data[0];
    const result = {
      totalStock: Number(stats.total_stock) || 0,
      successRate: Number(stats.success_rate) || 0,
      totalSoldThisMonth: Number(stats.total_sold_this_month) || 0,
    };

    console.log('[BMStats] Final result from database function:', result);
    return result;
  } catch (error) {
    console.error('[BMStats] Error in fetchBMStats:', error);
    throw error;
  }
};

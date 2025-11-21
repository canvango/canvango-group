/**
 * Personal Account Statistics Service
 * 
 * @module services/personalStats
 * @description
 * Provides API functions for fetching real-time statistics for Personal Accounts
 * from Supabase database. All statistics are aggregated across all users.
 * 
 * @example
 * ```typescript
 * import { fetchPersonalStats } from './services/personalStats.service';
 * 
 * const stats = await fetchPersonalStats();
 * console.log(stats.totalStock); // Total available Personal products
 * console.log(stats.successRate); // Success rate percentage
 * console.log(stats.totalSoldThisMonth); // Total sold this month
 * ```
 */

import { supabase } from './supabase';

/**
 * Personal Account statistics
 * 
 * @interface PersonalStats
 * @property {number} totalStock - Total available Personal products (all active products)
 * @property {number} successRate - Success rate percentage based on completed transactions
 * @property {number} totalSoldThisMonth - Total completed purchases this month (resets monthly)
 */
export interface PersonalStats {
  totalStock: number;
  successRate: number;
  totalSoldThisMonth: number;
}

/**
 * Fetch Personal Account statistics from Supabase
 * 
 * @async
 * @function fetchPersonalStats
 * @returns {Promise<PersonalStats>} Real-time statistics for Personal Accounts
 * 
 * @throws {Error} When database query fails
 * 
 * @description
 * Fetches three key metrics:
 * 1. Total Stock: Count of all active Personal products with available stock
 * 2. Success Rate: Percentage of completed transactions vs total transactions
 * 3. Total Sold This Month: Count of completed purchases in current month
 * 
 * All statistics are aggregated across all users (not per-user).
 * 
 * @example
 * ```typescript
 * const stats = await fetchPersonalStats();
 * // stats = { totalStock: 0, successRate: 100.0, totalSoldThisMonth: 2 }
 * ```
 */
export const fetchPersonalStats = async (): Promise<PersonalStats> => {
  try {
    console.log('[PersonalStats] Starting to fetch statistics using database function...');

    // Use database function to get statistics (bypasses RLS for aggregate data)
    const { data, error } = await supabase
      .rpc('get_personal_stats');

    if (error) {
      console.error('[PersonalStats] Error fetching stats from function:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('[PersonalStats] No data returned from function');
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

    console.log('[PersonalStats] Final result from database function:', result);
    return result;
  } catch (error) {
    console.error('[PersonalStats] Error in fetchPersonalStats:', error);
    throw error;
  }
};

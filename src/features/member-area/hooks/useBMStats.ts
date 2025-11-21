/**
 * BM Statistics Hook
 * 
 * @module hooks/useBMStats
 * @description
 * React Query hook for fetching and caching BM Account statistics.
 * Automatically refetches data every 30 seconds to keep stats up-to-date.
 * 
 * @example
 * ```typescript
 * import { useBMStats } from '../hooks/useBMStats';
 * 
 * function BMAccountsPage() {
 *   const { data: stats, isLoading, error } = useBMStats();
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error loading stats</div>;
 *   
 *   return (
 *     <div>
 *       <p>Total Stock: {stats.totalStock}</p>
 *       <p>Success Rate: {stats.successRate}%</p>
 *       <p>Sold This Month: {stats.totalSoldThisMonth}</p>
 *     </div>
 *   );
 * }
 * ```
 */

import { useQuery } from '@tanstack/react-query';
import { fetchBMStats, BMStats } from '../services/bmStats.service';

/**
 * Hook for fetching BM Account statistics
 * 
 * @function useBMStats
 * @returns {UseQueryResult<BMStats>} React Query result with BM statistics
 * 
 * @description
 * Fetches real-time statistics for BM Accounts:
 * - Total available stock
 * - Success rate percentage
 * - Total sold this month
 * 
 * Features:
 * - Automatic caching with React Query
 * - Auto-refetch every 30 seconds
 * - Stale time: 20 seconds
 * - Error handling and retry logic
 * 
 * @example
 * ```typescript
 * const { data, isLoading, error, refetch } = useBMStats();
 * 
 * // Manual refetch
 * refetch();
 * 
 * // Access data
 * console.log(data?.totalStock);
 * console.log(data?.successRate);
 * console.log(data?.totalSoldThisMonth);
 * ```
 */
export const useBMStats = () => {
  const query = useQuery<BMStats, Error>({
    queryKey: ['bm-stats'],
    queryFn: async () => {
      console.log('[useBMStats] Fetching BM statistics...');
      try {
        const result = await fetchBMStats();
        console.log('[useBMStats] Successfully fetched:', result);
        return result;
      } catch (error) {
        console.error('[useBMStats] Error fetching stats:', error);
        throw error;
      }
    },
    staleTime: 20000, // Consider data stale after 20 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true, // Refetch when window regains focus
    retry: 2, // Retry failed requests twice
  });

  // Log query state changes
  if (query.error) {
    console.error('[useBMStats] Query error:', query.error);
  }
  if (query.data) {
    console.log('[useBMStats] Current data:', query.data);
  }

  return query;
};

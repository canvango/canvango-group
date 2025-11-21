/**
 * Personal Account Statistics Hook
 * 
 * @module hooks/usePersonalStats
 * @description
 * React Query hook for fetching and caching Personal Account statistics.
 * Automatically refetches data every 30 seconds to keep stats up-to-date.
 * 
 * @example
 * ```typescript
 * import { usePersonalStats } from '../hooks/usePersonalStats';
 * 
 * function PersonalAccountsPage() {
 *   const { data: stats, isLoading, error } = usePersonalStats();
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
import { fetchPersonalStats, PersonalStats } from '../services/personalStats.service';

/**
 * Hook for fetching Personal Account statistics
 * 
 * @function usePersonalStats
 * @returns {UseQueryResult<PersonalStats>} React Query result with Personal statistics
 * 
 * @description
 * Fetches real-time statistics for Personal Accounts:
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
 * const { data, isLoading, error, refetch } = usePersonalStats();
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
export const usePersonalStats = () => {
  const query = useQuery<PersonalStats, Error>({
    queryKey: ['personal-stats'],
    queryFn: async () => {
      console.log('[usePersonalStats] Fetching Personal statistics...');
      try {
        const result = await fetchPersonalStats();
        console.log('[usePersonalStats] Successfully fetched:', result);
        return result;
      } catch (error) {
        console.error('[usePersonalStats] Error fetching stats:', error);
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
    console.error('[usePersonalStats] Query error:', query.error);
  }
  if (query.data) {
    console.log('[usePersonalStats] Current data:', query.data);
  }

  return query;
};

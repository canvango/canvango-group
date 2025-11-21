/**
 * Query performance logger for Supabase operations
 */

interface QueryLogOptions {
  table: string;
  operation: string;
  filters?: Record<string, any>;
  startTime: number;
  error?: any;
  rowCount?: number;
}

/**
 * Log query performance
 */
export function logQueryPerformance(options: QueryLogOptions): void {
  const duration = Date.now() - options.startTime;
  const logLevel = duration > 1000 ? 'warn' : 'info';
  
  const logData = {
    table: options.table,
    operation: options.operation,
    duration: `${duration}ms`,
    filters: options.filters,
    rowCount: options.rowCount,
    error: options.error?.message,
  };

  if (process.env.NODE_ENV !== 'production' || duration > 1000) {
    if (logLevel === 'warn') {
      console.warn('⚠️ Slow query detected:', logData);
    } else {
      console.log('📊 Query executed:', logData);
    }
  }
}

/**
 * Wrapper for Supabase queries with performance logging
 */
export async function withQueryLogging<T>(
  table: string,
  operation: string,
  queryFn: () => Promise<{ data: T | null; error: any; count?: number | null }>,
  filters?: Record<string, any>
): Promise<{ data: T | null; error: any; count?: number | null }> {
  const startTime = Date.now();
  
  try {
    const result = await queryFn();
    
    logQueryPerformance({
      table,
      operation,
      filters,
      startTime,
      error: result.error,
      rowCount: result.count ?? (Array.isArray(result.data) ? result.data.length : result.data ? 1 : 0),
    });
    
    return result;
  } catch (error) {
    logQueryPerformance({
      table,
      operation,
      filters,
      startTime,
      error,
    });
    throw error;
  }
}

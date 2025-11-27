/**
 * Audit Logs Hooks
 * React Query hooks for audit log operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchAuditLogs, 
  fetchResourceAuditLogs,
  fetchAuditLogStats,
  createAuditLog 
} from '../services/auditLogService';
import { AuditLogFilters, CreateAuditLogParams } from '@/types/auditLog';

/**
 * Hook to fetch audit logs with filters
 */
export const useAuditLogs = (filters: AuditLogFilters = {}) => {
  return useQuery({
    queryKey: ['auditLogs', filters],
    queryFn: () => fetchAuditLogs(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook to fetch audit logs for a specific resource
 */
export const useResourceAuditLogs = (resource: string, resourceId: string) => {
  return useQuery({
    queryKey: ['auditLogs', 'resource', resource, resourceId],
    queryFn: () => fetchResourceAuditLogs(resource, resourceId),
    enabled: !!resource && !!resourceId,
  });
};

/**
 * Hook to fetch audit log statistics
 */
export const useAuditLogStats = () => {
  return useQuery({
    queryKey: ['auditLogs', 'stats'],
    queryFn: fetchAuditLogStats,
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Hook to create audit log
 * Note: This is typically called automatically by other services
 */
export const useCreateAuditLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateAuditLogParams) => createAuditLog(params),
    onSuccess: () => {
      // Invalidate audit logs queries
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
    onError: (error: Error) => {
      console.error('Failed to create audit log:', error);
      // Don't show toast - audit logging should be silent
    }
  });
};

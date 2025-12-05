import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import {
  getAccessPointStatuses,
  getSecurityLogs,
  getOffHoursConfig,
  updateOffHoursConfig,
  getRecentMotionEvents,
} from '@/lib/api';
import type { SecurityEvent, AccessPointStatus, OffHoursConfig, SecurityLogQuery } from '@/types';

/**
 * Hook to fetch access point statuses
 * Refetches every 2 seconds for real-time updates
 */
export function useAccessPointStatuses(): UseQueryResult<AccessPointStatus[], Error> {
  return useQuery({
    queryKey: ['security', 'access-points'],
    queryFn: getAccessPointStatuses,
    refetchInterval: 2000, // Refetch every 2 seconds
  });
}

/**
 * Hook to fetch security event logs with filtering
 */
export function useSecurityLogs(query?: SecurityLogQuery): UseQueryResult<SecurityEvent[], Error> {
  return useQuery({
    queryKey: ['security', 'logs', query],
    queryFn: () => getSecurityLogs(query),
    staleTime: 10000, // Cache for 10 seconds
  });
}

/**
 * Hook to fetch recent motion events
 */
export function useRecentMotionEvents(limit?: number): UseQueryResult<SecurityEvent[], Error> {
  return useQuery({
    queryKey: ['security', 'motion', limit],
    queryFn: () => getRecentMotionEvents(limit),
    refetchInterval: 5000,
  });
}

/**
 * Hook to fetch off-hours configuration
 */
export function useOffHoursConfig(): UseQueryResult<OffHoursConfig, Error> {
  return useQuery({
    queryKey: ['security', 'off-hours'],
    queryFn: getOffHoursConfig,
  });
}

/**
 * Hook to update off-hours configuration with optimistic updates
 */
export function useUpdateOffHoursConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: OffHoursConfig) => updateOffHoursConfig(config),
    onMutate: async (newConfig) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['security', 'off-hours'] });

      // Snapshot previous value
      const previousConfig = queryClient.getQueryData<OffHoursConfig>(['security', 'off-hours']);

      // Optimistically update cache
      queryClient.setQueryData(['security', 'off-hours'], newConfig);

      return { previousConfig };
    },
    onError: (err, newConfig, context) => {
      // Rollback on error
      if (context?.previousConfig) {
        queryClient.setQueryData(['security', 'off-hours'], context.previousConfig);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['security', 'off-hours'] });
    },
  });
}

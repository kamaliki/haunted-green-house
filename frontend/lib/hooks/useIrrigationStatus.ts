import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import {
  getIrrigationStatus,
  startIrrigation,
  stopIrrigation,
  getReservoirLevel,
} from '@/lib/api';
import type { IrrigationStatus, StartIrrigationRequest } from '@/types';

/**
 * Hook to fetch irrigation status for a specific zone
 * Refetches every 5 seconds for real-time updates
 */
export function useIrrigationStatus(zoneId: string): UseQueryResult<IrrigationStatus, Error> {
  return useQuery({
    queryKey: ['irrigation', 'status', zoneId],
    queryFn: () => getIrrigationStatus(zoneId),
    refetchInterval: 5000,
    enabled: !!zoneId,
  });
}

/**
 * Hook to fetch reservoir level for a specific zone
 */
export function useReservoirLevel(zoneId: string): UseQueryResult<number, Error> {
  return useQuery({
    queryKey: ['irrigation', 'reservoir', zoneId],
    queryFn: () => getReservoirLevel(zoneId),
    refetchInterval: 10000, // Refetch every 10 seconds
    enabled: !!zoneId,
  });
}

/**
 * Hook to start irrigation with optimistic updates for a specific zone
 */
export function useStartIrrigation(zoneId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request?: StartIrrigationRequest) => startIrrigation(zoneId, request),
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['irrigation', 'status', zoneId] });

      // Snapshot previous value
      const previousStatus = queryClient.getQueryData<IrrigationStatus>(['irrigation', 'status', zoneId]);

      // Optimistically update to active state
      queryClient.setQueryData<IrrigationStatus>(['irrigation', 'status', zoneId], (old) => {
        if (!old) return old;
        return {
          ...old,
          active: true,
          lastStarted: new Date(),
        };
      });

      return { previousStatus };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousStatus) {
        queryClient.setQueryData(['irrigation', 'status', zoneId], context.previousStatus);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['irrigation', 'status', zoneId] });
      queryClient.invalidateQueries({ queryKey: ['irrigation', 'reservoir', zoneId] });
    },
  });
}

/**
 * Hook to stop irrigation with optimistic updates for a specific zone
 */
export function useStopIrrigation(zoneId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => stopIrrigation(zoneId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['irrigation', 'status', zoneId] });

      const previousStatus = queryClient.getQueryData<IrrigationStatus>(['irrigation', 'status', zoneId]);

      // Optimistically update to inactive state
      queryClient.setQueryData<IrrigationStatus>(['irrigation', 'status', zoneId], (old) => {
        if (!old) return old;
        return {
          ...old,
          active: false,
        };
      });

      return { previousStatus };
    },
    onError: (err, variables, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(['irrigation', 'status', zoneId], context.previousStatus);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['irrigation', 'status', zoneId] });
      queryClient.invalidateQueries({ queryKey: ['irrigation', 'reservoir', zoneId] });
    },
  });
}

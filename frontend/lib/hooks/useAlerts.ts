import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAlertStore } from '@/lib/store/alertStore';
import { getAlerts, acknowledgeAlert, acknowledgeAllAlerts } from '@/lib/api/alerts';
import type { Alert } from '@/types';

/**
 * Hook for managing alerts
 */
export function useAlerts() {
  const queryClient = useQueryClient();
  const { setAlerts, acknowledgeAlert: acknowledgeAlertInStore } = useAlertStore();

  // Fetch alerts
  const { data: alerts = [], isLoading, error, refetch } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const data = await getAlerts();
      setAlerts(data);
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Acknowledge single alert mutation
  const acknowledgeMutation = useMutation({
    mutationFn: acknowledgeAlert,
    onMutate: async (alertId) => {
      // Optimistic update
      acknowledgeAlertInStore(alertId);
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['alerts'] });
      
      // Snapshot previous value
      const previousAlerts = queryClient.getQueryData<Alert[]>(['alerts']);
      
      // Optimistically update cache
      queryClient.setQueryData<Alert[]>(['alerts'], (old) =>
        old?.map((alert) =>
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
      );
      
      return { previousAlerts };
    },
    onError: (err, alertId, context) => {
      // Rollback on error
      if (context?.previousAlerts) {
        queryClient.setQueryData(['alerts'], context.previousAlerts);
        setAlerts(context.previousAlerts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  // Acknowledge all alerts mutation
  const acknowledgeAllMutation = useMutation({
    mutationFn: acknowledgeAllAlerts,
    onMutate: async () => {
      // Optimistic update
      useAlertStore.getState().acknowledgeAll();
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['alerts'] });
      
      // Snapshot previous value
      const previousAlerts = queryClient.getQueryData<Alert[]>(['alerts']);
      
      // Optimistically update cache
      queryClient.setQueryData<Alert[]>(['alerts'], (old) =>
        old?.map((alert) => ({ ...alert, acknowledged: true }))
      );
      
      return { previousAlerts };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousAlerts) {
        queryClient.setQueryData(['alerts'], context.previousAlerts);
        setAlerts(context.previousAlerts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  return {
    alerts,
    isLoading,
    error,
    refetch,
    acknowledgeAlert: acknowledgeMutation.mutate,
    acknowledgeAll: acknowledgeAllMutation.mutate,
    isAcknowledging: acknowledgeMutation.isPending || acknowledgeAllMutation.isPending,
  };
}

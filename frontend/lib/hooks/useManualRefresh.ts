import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

/**
 * Hook to provide manual refresh functionality for zone-specific data
 * Invalidates cache and forces fresh data fetch for the current zone
 * 
 * @param zoneId - The zone ID to refresh data for (optional, if not provided refreshes all data)
 * @returns Object with refresh function and loading state
 */
export function useManualRefresh(zoneId?: string) {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      if (zoneId) {
        // Invalidate zone-specific queries
        await Promise.all([
          // Zone dashboard data (real-time sensor data)
          queryClient.invalidateQueries({ 
            queryKey: ['environment', 'zone', zoneId],
            refetchType: 'active' // Only refetch active queries
          }),
          // Historical data for the zone
          queryClient.invalidateQueries({ 
            queryKey: ['environment', 'historical', zoneId],
            refetchType: 'active'
          }),
          // Predictions for the zone
          queryClient.invalidateQueries({ 
            queryKey: ['analytics', 'predictions', zoneId],
            refetchType: 'active'
          }),
          // Recommendations for the zone
          queryClient.invalidateQueries({ 
            queryKey: ['analytics', 'recommendations', zoneId],
            refetchType: 'active'
          }),
          // Irrigation status for the zone
          queryClient.invalidateQueries({ 
            queryKey: ['irrigation', 'status', zoneId],
            refetchType: 'active'
          }),
          // Reservoir level for the zone
          queryClient.invalidateQueries({ 
            queryKey: ['irrigation', 'reservoir', zoneId],
            refetchType: 'active'
          }),
          // Plant health data for the zone
          queryClient.invalidateQueries({ 
            queryKey: ['plant-health', zoneId],
            refetchType: 'active'
          }),
          // Growth tracking for the zone
          queryClient.invalidateQueries({ 
            queryKey: ['growth', zoneId],
            refetchType: 'active'
          }),
        ]);
      } else {
        // Invalidate all queries (global refresh)
        await Promise.all([
          // Zone summaries
          queryClient.invalidateQueries({ 
            queryKey: ['zones', 'summaries'],
            refetchType: 'active'
          }),
          // All zones
          queryClient.invalidateQueries({ 
            queryKey: ['zones'],
            refetchType: 'active'
          }),
          // Security events (cross-zone)
          queryClient.invalidateQueries({ 
            queryKey: ['security'],
            refetchType: 'active'
          }),
          // Alerts (cross-zone)
          queryClient.invalidateQueries({ 
            queryKey: ['alerts'],
            refetchType: 'active'
          }),
        ]);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, zoneId]);

  return {
    refresh,
    isRefreshing,
  };
}
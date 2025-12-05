import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getZones, getZoneSummaries, getZone } from '@/lib/api/greenhouse';
import type { Zone, ZoneSummary } from '@/types';

/**
 * Hook to fetch all zones
 */
export function useZones(): UseQueryResult<Zone[], Error> {
  return useQuery({
    queryKey: ['zones'],
    queryFn: getZones,
    staleTime: 60000, // Cache for 60 seconds
  });
}

/**
 * Hook to fetch zone summaries with current status
 * Refetches every 5 seconds for real-time updates
 */
export function useZoneSummaries(): UseQueryResult<ZoneSummary[], Error> {
  return useQuery({
    queryKey: ['zones', 'summaries'],
    queryFn: getZoneSummaries,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    staleTime: 0, // Always consider stale
  });
}

/**
 * Hook to fetch a specific zone by ID
 */
export function useZone(zoneId: string): UseQueryResult<Zone | null, Error> {
  return useQuery({
    queryKey: ['zones', zoneId],
    queryFn: () => getZone(zoneId),
    enabled: !!zoneId,
    staleTime: 60000,
  });
}

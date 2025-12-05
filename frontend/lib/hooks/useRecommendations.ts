import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getZoneRecommendations } from '@/lib/api/analytics';
import type { Recommendation } from '@/types';

/**
 * Hook to fetch zone-specific optimization recommendations
 * Refetches every 6 hours as per requirements
 */
export function useZoneRecommendations(
  zoneId: string
): UseQueryResult<Recommendation[], Error> {
  return useQuery({
    queryKey: ['analytics', 'recommendations', zoneId],
    queryFn: () => getZoneRecommendations(zoneId),
    enabled: !!zoneId,
    staleTime: 6 * 60 * 60 * 1000, // 6 hours in milliseconds
    refetchInterval: 6 * 60 * 60 * 1000, // Auto-refresh every 6 hours
  });
}

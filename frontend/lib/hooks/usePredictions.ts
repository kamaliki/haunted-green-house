import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getZonePredictions } from '@/lib/api/analytics';
import type { Prediction, GetPredictionsQuery } from '@/types';

/**
 * Hook to fetch zone-specific predictions
 * Refetches every 6 hours as per requirements
 */
export function useZonePredictions(
  zoneId: string,
  query?: GetPredictionsQuery
): UseQueryResult<Prediction[], Error> {
  return useQuery({
    queryKey: ['analytics', 'predictions', zoneId, query],
    queryFn: () => getZonePredictions(zoneId, query),
    enabled: !!zoneId,
    staleTime: 6 * 60 * 60 * 1000, // 6 hours in milliseconds
    refetchInterval: 6 * 60 * 60 * 1000, // Auto-refresh every 6 hours
  });
}

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getCurrentEnvironmentData, getHistoricalData, getSensorReading, getZoneEnvironmentData, getZoneHistoricalData } from '@/lib/api';
import type { EnvironmentData, HistoricalDataQuery, TimeSeriesData } from '@/types';

/**
 * Hook to fetch current environmental sensor data
 * Refetches every 5 seconds to maintain real-time updates
 */
export function useSensorData(): UseQueryResult<EnvironmentData, Error> {
  return useQuery({
    queryKey: ['environment', 'current'],
    queryFn: getCurrentEnvironmentData,
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 0, // Always consider stale to ensure fresh data
  });
}

/**
 * Hook to fetch current environmental sensor data for a specific zone
 * Refetches every 5 seconds to maintain real-time updates
 */
export function useZoneSensorData(zoneId: string): UseQueryResult<EnvironmentData, Error> {
  return useQuery({
    queryKey: ['environment', 'zone', zoneId],
    queryFn: () => getZoneEnvironmentData(zoneId),
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 0, // Always consider stale to ensure fresh data
    enabled: !!zoneId,
  });
}

/**
 * Hook to fetch historical environmental data
 * Caches results for 60 seconds
 */
export function useHistoricalData(
  query: HistoricalDataQuery,
  zoneId?: string
): UseQueryResult<TimeSeriesData[], Error> {
  return useQuery({
    queryKey: ['environment', 'historical', zoneId || 'global', query],
    queryFn: () => zoneId ? getZoneHistoricalData(zoneId, query) : getHistoricalData(query),
    staleTime: 60000, // Cache for 60 seconds
    enabled: query.metrics.length > 0, // Only fetch if metrics are selected
  });
}

/**
 * Hook to fetch a specific sensor reading
 */
export function useSpecificSensor(metric: string): UseQueryResult<number, Error> {
  return useQuery({
    queryKey: ['environment', 'sensor', metric],
    queryFn: () => getSensorReading(metric),
    refetchInterval: 5000,
    enabled: !!metric,
  });
}

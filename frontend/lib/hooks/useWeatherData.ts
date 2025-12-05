import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getWeatherData } from '@/lib/api';
import type { WeatherData } from '@/types';

/**
 * Hook to fetch weather data
 * Refetches every hour to keep data fresh
 */
export function useWeatherData(): UseQueryResult<WeatherData, Error> {
  return useQuery({
    queryKey: ['weather', 'current'],
    queryFn: getWeatherData,
    refetchInterval:  2 * 60 * 60 * 1000, // Refetch every hour
    staleTime: 30 * 60 * 1000, // Consider stale after 30 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
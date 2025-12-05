'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

/**
 * React Query Provider with zone-aware caching configuration
 * Implements stale-while-revalidate pattern with different cache times per data type
 * 
 * Cache Strategy (Requirements 14.1-14.5):
 * - Zone dashboard data: 5 second refetch interval (real-time) - Req 14.1
 * - Historical data: 60 second cache per zone - Req 14.2
 * - Predictions: 6 hour cache per zone - Req 14.3
 * - Zone summaries: 5 second refetch interval (real-time)
 * - Manual refresh: bypasses cache for current zone - Req 14.5
 * - Optimistic updates: for user actions (irrigation, alerts, config) - Req 14.4
 * 
 * Stale-While-Revalidate Pattern:
 * - Shows cached data immediately while fetching fresh data in background
 * - Provides instant UI feedback while ensuring data freshness
 * - Reduces perceived latency and improves user experience
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default stale time: 5 seconds for dashboard data
            // This implements the stale-while-revalidate pattern:
            // - Data is considered fresh for 5 seconds
            // - After 5 seconds, it's stale but still shown while refetching
            staleTime: 5000,
            
            // Cache time (gcTime): how long inactive data stays in cache
            // Set to 10 minutes to preserve data when navigating between zones
            gcTime: 10 * 60 * 1000, // 10 minutes
            
            // Retry failed requests with smart logic
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors (client errors like auth failures)
              if (error?.statusCode >= 400 && error?.statusCode < 500) {
                return false;
              }
              // Retry up to 3 times for network/server errors
              return failureCount < 3;
            },
            
            // Exponential backoff for retries (1s, 2s, 4s, max 30s)
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            
            // Refetch on window focus for fresh data
            // Ensures data is current when user returns to the app
            refetchOnWindowFocus: true,
            
            // Refetch on reconnect after network loss
            refetchOnReconnect: true,
            
            // Enable stale-while-revalidate pattern
            // Always refetch on mount but show cached data immediately
            refetchOnMount: 'always',
            
            // Network mode: online-first with offline support
            // Queries will fail if offline but cached data remains available
            networkMode: 'online',
          },
          mutations: {
            // Retry mutations once for transient failures
            retry: 1,
            retryDelay: 1000,
            
            // Network mode for mutations
            networkMode: 'online',
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

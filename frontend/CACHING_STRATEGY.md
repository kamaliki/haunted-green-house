# Zone-Aware Data Refresh and Caching Strategy

## Overview

This document describes the comprehensive caching and data refresh strategy implemented for the Haunted Greenhouse frontend application. The strategy is zone-aware, meaning different zones maintain separate caches and can be refreshed independently.

## Requirements Mapping

### Requirement 14.1: Zone Dashboard Data Refetch Interval ✅
**Implementation**: 5-second refetch interval for real-time zone dashboard data

**Location**: 
- `frontend/lib/hooks/useSensorData.ts` - `useZoneSensorData()`
- `frontend/lib/hooks/useZones.ts` - `useZoneSummaries()`
- `frontend/lib/hooks/useIrrigationStatus.ts` - `useIrrigationStatus()`

**Configuration**:
```typescript
refetchInterval: 5000, // 5 seconds
staleTime: 0, // Always consider stale for fresh data
```

### Requirement 14.2: Historical Data Cache ✅
**Implementation**: 60-second cache for zone-specific historical data

**Location**: 
- `frontend/lib/hooks/useSensorData.ts` - `useHistoricalData()`

**Configuration**:
```typescript
staleTime: 60000, // 60 seconds cache
```

### Requirement 14.3: Predictions Cache ✅
**Implementation**: 6-hour cache for zone-specific predictions

**Location**: 
- `frontend/lib/hooks/usePredictions.ts` - `useZonePredictions()`
- `frontend/lib/hooks/useRecommendations.ts` - `useZoneRecommendations()`

**Configuration**:
```typescript
staleTime: 6 * 60 * 60 * 1000, // 6 hours
refetchInterval: 6 * 60 * 60 * 1000, // Auto-refresh every 6 hours
```

### Requirement 14.4: Optimistic Updates ✅
**Implementation**: Optimistic updates for all user actions

**Locations**:
- `frontend/lib/hooks/useIrrigationStatus.ts` - Start/stop irrigation
- `frontend/lib/hooks/useAlerts.ts` - Acknowledge alerts
- `frontend/lib/hooks/useSecurityEvents.ts` - Update off-hours config

**Pattern**:
```typescript
onMutate: async (newData) => {
  // Cancel outgoing refetches
  await queryClient.cancelQueries({ queryKey: [...] });
  
  // Snapshot previous value
  const previousData = queryClient.getQueryData([...]);
  
  // Optimistically update cache
  queryClient.setQueryData([...], newData);
  
  return { previousData };
},
onError: (err, newData, context) => {
  // Rollback on error
  if (context?.previousData) {
    queryClient.setQueryData([...], context.previousData);
  }
},
onSettled: () => {
  // Refetch to ensure consistency
  queryClient.invalidateQueries({ queryKey: [...] });
}
```

### Requirement 14.5: Manual Refresh with Cache Invalidation ✅
**Implementation**: Manual refresh functionality that bypasses cache for current zone

**Location**: 
- `frontend/lib/hooks/useManualRefresh.ts`

**Usage**:
```typescript
const { refresh, isRefreshing } = useManualRefresh(zoneId);

// Refresh zone-specific data
await refresh();

// Or refresh all data (no zoneId)
const { refresh: refreshAll } = useManualRefresh();
await refreshAll();
```

**Invalidated Queries**:
- Zone-specific: environment, historical, predictions, recommendations, irrigation, plant-health, growth
- Global: zones, summaries, security, alerts

## Stale-While-Revalidate Pattern

The application implements the stale-while-revalidate pattern throughout:

1. **Immediate Display**: Cached data is shown immediately when available
2. **Background Refresh**: Fresh data is fetched in the background
3. **Seamless Update**: UI updates smoothly when fresh data arrives
4. **Reduced Latency**: Users see instant feedback without waiting for network requests

**Configuration** (`frontend/components/providers/QueryProvider.tsx`):
```typescript
{
  staleTime: 5000, // Data fresh for 5 seconds
  gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  refetchOnMount: 'always', // Always refetch but show cached data first
  refetchOnWindowFocus: true, // Refresh when user returns to app
  refetchOnReconnect: true, // Refresh after network reconnection
}
```

## Query Key Structure

### Zone-Specific Queries
```typescript
['environment', 'zone', zoneId]           // Current sensor data
['environment', 'historical', zoneId, query] // Historical data
['analytics', 'predictions', zoneId, query]  // Predictions
['analytics', 'recommendations', zoneId]     // Recommendations
['irrigation', 'status', zoneId]             // Irrigation status
['irrigation', 'reservoir', zoneId]          // Reservoir level
['plant-health', zoneId]                     // Plant health data
['growth', zoneId]                           // Growth tracking
```

### Global Queries
```typescript
['zones']                    // All zones
['zones', 'summaries']       // Zone summaries with status
['zones', zoneId]            // Specific zone details
['security', 'access-points'] // Access point statuses
['security', 'logs', query]   // Security event logs
['security', 'motion', limit] // Recent motion events
['security', 'off-hours']     // Off-hours configuration
['alerts']                    // All alerts
```

## Error Handling and Retry Logic

### Retry Strategy
```typescript
retry: (failureCount, error) => {
  // Don't retry client errors (4xx)
  if (error?.statusCode >= 400 && error?.statusCode < 500) {
    return false;
  }
  // Retry up to 3 times for network/server errors
  return failureCount < 3;
}
```

### Exponential Backoff
```typescript
retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
// Delays: 1s, 2s, 4s, 8s, 16s, max 30s
```

## Cache Invalidation Strategies

### Automatic Invalidation
- **On Mutation Success**: Related queries are invalidated automatically
- **On Window Focus**: All active queries refetch
- **On Reconnect**: All active queries refetch
- **On Interval**: Queries with `refetchInterval` refetch automatically

### Manual Invalidation
- **User-Triggered Refresh**: `useManualRefresh` hook
- **Zone-Specific**: Invalidates only queries for the current zone
- **Global**: Invalidates cross-zone queries (zones, security, alerts)

## Performance Optimizations

1. **Selective Refetching**: Only active queries are refetched on invalidation
2. **Cache Preservation**: Inactive data stays in cache for 10 minutes
3. **Request Deduplication**: React Query automatically deduplicates simultaneous requests
4. **Background Refetching**: Doesn't block UI while fetching fresh data
5. **Zone Isolation**: Each zone's data is cached independently

## Testing

All caching functionality is tested in:
- `frontend/lib/hooks/__tests__/useManualRefresh.test.tsx`
- `frontend/lib/hooks/__tests__/useSensorData.test.tsx`
- `frontend/lib/hooks/__tests__/useIrrigationStatus.test.tsx`

## Usage Examples

### Zone Dashboard
```typescript
// Automatically refetches every 5 seconds
const { data: sensorData } = useZoneSensorData(zoneId);
const { data: irrigationStatus } = useIrrigationStatus(zoneId);
```

### Historical Data
```typescript
// Cached for 60 seconds
const { data: historicalData } = useHistoricalData(query, zoneId);
```

### Predictions
```typescript
// Cached for 6 hours, auto-refreshes every 6 hours
const { data: predictions } = useZonePredictions(zoneId);
```

### Manual Refresh
```typescript
const { refresh, isRefreshing } = useManualRefresh(zoneId);

// In a button click handler
const handleRefresh = async () => {
  await refresh();
  // All zone data is now fresh
};
```

### Optimistic Updates
```typescript
const startIrrigation = useStartIrrigation(zoneId);

// UI updates immediately, rolls back on error
startIrrigation.mutate(request);
```

## Summary

The caching strategy successfully implements all requirements:
- ✅ 5-second refetch for real-time data
- ✅ 60-second cache for historical data
- ✅ 6-hour cache for predictions
- ✅ Optimistic updates for user actions
- ✅ Manual refresh with cache invalidation
- ✅ Stale-while-revalidate pattern
- ✅ Zone-aware caching
- ✅ Comprehensive error handling
- ✅ Performance optimizations

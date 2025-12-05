'use client';

import { cn } from '@/lib/utils/cn';

/**
 * Base Skeleton Component
 */
interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export function Skeleton({ className, animate = true }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-bg-medium border-2 border-ghost-green/30 rounded',
        animate && 'animate-pulse',
        className
      )}
    />
  );
}

/**
 * Zone Card Skeleton
 * Loading state for zone cards in the zone management grid
 */
export function ZoneCardSkeleton() {
  return (
    <div className="retro-card fog-overlay border-ghost-green/30">
      {/* Zone name */}
      <Skeleton className="h-6 w-3/4 mb-4" />
      
      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      
      {/* Status indicator */}
      <Skeleton className="h-4 w-full mb-2" />
      
      {/* Last update */}
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

/**
 * Zone Grid Skeleton
 * Loading state for the entire zone management grid
 */
export function ZoneGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ZoneCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Sensor Card Skeleton
 * Loading state for sensor cards in zone dashboard
 */
export function SensorCardSkeleton() {
  return (
    <div className="retro-card fog-overlay border-ghost-green/30">
      {/* Icon and label */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </div>
      
      {/* Value */}
      <Skeleton className="h-12 w-24 mb-2" />
      
      {/* Trend indicator */}
      <Skeleton className="h-4 w-16 mb-3" />
      
      {/* Threshold bar */}
      <Skeleton className="h-2 w-full" />
    </div>
  );
}

/**
 * Sensor Grid Skeleton
 * Loading state for sensor card grid in zone dashboard
 */
export function SensorGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SensorCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Chart Skeleton
 * Loading state for historical data charts
 */
export function ChartSkeleton() {
  return (
    <div className="retro-card fog-overlay border-ghost-green/30">
      {/* Chart header */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-32" />
      </div>
      
      {/* Chart area */}
      <div className="relative h-64 md:h-80">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-12" />
          ))}
        </div>
        
        {/* Chart lines */}
        <div className="ml-16 h-full flex items-end gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1"
              style={{ height: `${Math.random() * 80 + 20}%` }}
            />
          ))}
        </div>
        
        {/* X-axis labels */}
        <div className="ml-16 mt-2 flex justify-between">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-16" />
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex gap-4 mt-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Table Skeleton
 * Loading state for data tables (security logs, etc.)
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="retro-card fog-overlay border-ghost-green/30 overflow-hidden">
      {/* Table header */}
      <div className="grid gap-4 p-4 border-b-2 border-ghost-green/30" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
      
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4 p-4 border-b border-ghost-green/10"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Form Skeleton
 * Loading state for forms
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="retro-card fog-overlay border-ghost-green/30">
      <Skeleton className="h-8 w-48 mb-6" />
      
      <div className="space-y-6">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
      
      <div className="flex gap-4 mt-8">
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-12 w-32" />
      </div>
    </div>
  );
}

/**
 * Card List Skeleton
 * Loading state for lists of cards (recommendations, alerts, etc.)
 */
export function CardListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="retro-card fog-overlay border-ghost-green/30">
          <div className="flex items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Page Header Skeleton
 * Loading state for page headers
 */
export function PageHeaderSkeleton() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-10 w-64" />
      </div>
      <Skeleton className="h-5 w-96" />
    </div>
  );
}

/**
 * Full Page Skeleton
 * Complete loading state for entire pages
 */
export function FullPageSkeleton({ type = 'dashboard' }: { type?: 'dashboard' | 'list' | 'form' | 'chart' }) {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeaderSkeleton />
      
      {type === 'dashboard' && <SensorGridSkeleton />}
      {type === 'list' && <CardListSkeleton count={5} />}
      {type === 'form' && <FormSkeleton />}
      {type === 'chart' && <ChartSkeleton />}
    </div>
  );
}

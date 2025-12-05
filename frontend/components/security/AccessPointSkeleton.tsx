'use client';

import { Skeleton } from '@/components/ui/LoadingSkeletons';
import { cn } from '@/lib/utils/cn';

/**
 * Access Point Card Skeleton
 * Loading state for individual access point cards
 */
export function AccessPointCardSkeleton() {
  return (
    <div className="retro-card fog-overlay border-ghost-green/30 animate-pulse">
      <div className="space-y-3 sm:space-y-4">
        {/* Header with icon and name */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-1">
            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 sm:h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full flex-shrink-0" />
        </div>

        {/* Location */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full flex-shrink-0" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full flex-shrink-0" />
          <Skeleton className="h-3 w-1/2" />
        </div>

        {/* Monitoring status (optional) */}
        <Skeleton className="h-8 w-full rounded pixel-corners" />

        {/* Action buttons */}
        <div className="flex gap-2 pt-2 border-t-2 border-ghost-green/20">
          <Skeleton className="h-10 flex-1 rounded pixel-corners" />
          <Skeleton className="h-10 flex-1 rounded pixel-corners" />
        </div>
      </div>
    </div>
  );
}

/**
 * Access Point Grid Skeleton
 * Loading state for the grid of access point cards
 */
export function AccessPointGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Doors Section */}
      <div className="space-y-3 sm:space-y-4">
        <Skeleton className="h-8 sm:h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: Math.ceil(count / 2) }).map((_, i) => (
            <AccessPointCardSkeleton key={`door-${i}`} />
          ))}
        </div>
      </div>

      {/* Windows Section */}
      <div className="space-y-3 sm:space-y-4">
        <Skeleton className="h-8 sm:h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: Math.floor(count / 2) }).map((_, i) => (
            <AccessPointCardSkeleton key={`window-${i}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Access Point Form Skeleton
 * Loading state for the access point form
 */
export function AccessPointFormSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Name field */}
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-12 w-full rounded pixel-corners" />
      </div>

      {/* Type field */}
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Skeleton className="h-12 flex-1 rounded pixel-corners" />
          <Skeleton className="h-12 flex-1 rounded pixel-corners" />
        </div>
      </div>

      {/* Location field */}
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-12 w-full rounded pixel-corners" />
      </div>

      {/* Status field */}
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-12 w-full rounded pixel-corners" />
      </div>

      {/* Monitoring section */}
      <div className="border-2 border-toxic-purple/30 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-12 w-full rounded" />
        <Skeleton className="h-12 w-full rounded pixel-corners" />
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4 border-t-2 border-ghost-green/20">
        <Skeleton className="h-12 flex-1 rounded pixel-corners" />
        <Skeleton className="h-12 flex-1 rounded pixel-corners" />
      </div>
    </div>
  );
}

/**
 * Access Point List Loading State
 * Complete loading state for the access point list page
 */
interface AccessPointListSkeletonProps {
  count?: number;
  className?: string;
}

export function AccessPointListSkeleton({ count = 6, className }: AccessPointListSkeletonProps) {
  return (
    <div className={cn('animate-fade-in', className)}>
      <AccessPointGridSkeleton count={count} />
    </div>
  );
}

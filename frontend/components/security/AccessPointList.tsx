import React, { useMemo } from 'react';
import { AccessPointCard } from './AccessPointCard';
import { AccessPointGridSkeleton } from './AccessPointSkeleton';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import type { AccessPoint } from '@/types';
import { cn } from '@/lib/utils/cn';

interface AccessPointListProps {
  accessPoints: AccessPoint[];
  onEdit: (accessPoint: AccessPoint) => void;
  onDelete: (accessPoint: AccessPoint) => void;
  isLoading?: boolean;
  error?: Error | null;
  highlightThreshold?: number; // seconds - highlight if open longer than this
  className?: string;
}

interface GroupedAccessPoints {
  doors: AccessPoint[];
  windows: AccessPoint[];
}

export const AccessPointList: React.FC<AccessPointListProps> = ({
  accessPoints,
  onEdit,
  onDelete,
  isLoading = false,
  error = null,
  highlightThreshold = 300,
  className,
}) => {
  // Group access points by type
  const groupedAccessPoints = useMemo<GroupedAccessPoints>(() => {
    return accessPoints.reduce(
      (acc, accessPoint) => {
        if (accessPoint.type === 'door') {
          acc.doors.push(accessPoint);
        } else {
          acc.windows.push(accessPoint);
        }
        return acc;
      },
      { doors: [], windows: [] } as GroupedAccessPoints
    );
  }, [accessPoints]);

  // Check if access point should be highlighted
  const shouldHighlight = (accessPoint: AccessPoint): boolean => {
    if (accessPoint.status !== 'open' || !accessPoint.monitoringEnabled) {
      return false;
    }

    const now = new Date();
    const openDuration = (now.getTime() - accessPoint.lastStatusChange.getTime()) / 1000;
    return openDuration > highlightThreshold;
  };

  // Loading state
  if (isLoading) {
    return <AccessPointGridSkeleton count={6} />;
  }

  // Error state
  if (error) {
    return (
      <ErrorDisplay
        title="Failed to load access points"
        message={error.message}
        className="my-8"
      />
    );
  }

  // Empty state
  if (accessPoints.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 space-y-4 sm:space-y-6 animate-fade-in">
        <div className="text-5xl sm:text-6xl animate-float">👻</div>
        <h3 className="text-lg sm:text-xl font-bold text-ghost-green font-vt323 text-glow">
          No Access Points Configured
        </h3>
        <p className="text-sm sm:text-base text-text-secondary font-vt323 px-4">
          Add your first access point to start monitoring doors and windows
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6 sm:space-y-8', className)}>
      {/* Doors Section */}
      {groupedAccessPoints.doors.length > 0 && (
        <div className="space-y-3 sm:space-y-4 animate-fade-in">
          <h2 className="text-xl sm:text-2xl font-bold text-ghost-green font-creepster flex items-center gap-2 text-glow hover:text-slime-green transition-colors">
            <span className="animate-float">🚪</span>
            <span>Doors ({groupedAccessPoints.doors.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {groupedAccessPoints.doors.map((accessPoint, index) => (
              <div
                key={accessPoint.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <AccessPointCard
                  accessPoint={accessPoint}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isHighlighted={shouldHighlight(accessPoint)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Windows Section */}
      {groupedAccessPoints.windows.length > 0 && (
        <div className="space-y-3 sm:space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <h2 className="text-xl sm:text-2xl font-bold text-ghost-green font-creepster flex items-center gap-2 text-glow hover:text-slime-green transition-colors">
            <span className="animate-float" style={{ animationDelay: '0.5s' }}>🪟</span>
            <span>Windows ({groupedAccessPoints.windows.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {groupedAccessPoints.windows.map((accessPoint, index) => (
              <div
                key={accessPoint.id}
                className="animate-fade-in"
                style={{ animationDelay: `${(index + groupedAccessPoints.doors.length) * 50}ms` }}
              >
                <AccessPointCard
                  accessPoint={accessPoint}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isHighlighted={shouldHighlight(accessPoint)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

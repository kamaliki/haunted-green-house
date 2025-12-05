import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import type { AccessPoint } from '@/types';
import { cn } from '@/lib/utils/cn';

interface AccessPointCardProps {
  accessPoint: AccessPoint;
  onEdit: (accessPoint: AccessPoint) => void;
  onDelete: (accessPoint: AccessPoint) => void;
  isHighlighted?: boolean;
  className?: string;
}

export const AccessPointCard: React.FC<AccessPointCardProps> = ({
  accessPoint,
  onEdit,
  onDelete,
  isHighlighted = false,
  className,
}) => {
  // Map access point status to StatusIndicator status
  const getStatusIndicatorStatus = (
    status: AccessPoint['status']
  ): 'success' | 'warning' | 'danger' | 'info' => {
    switch (status) {
      case 'closed':
      case 'locked':
        return 'success';
      case 'open':
        // Use danger if highlighted (exceeding threshold), otherwise warning
        return isHighlighted ? 'danger' : 'warning';
      case 'unlocked':
        return 'info';
      default:
        return 'info';
    }
  };

  // Get icon for access point type
  const getTypeIcon = (type: AccessPoint['type']): string => {
    return type === 'door' ? '🚪' : '🪟';
  };

  // Format timestamp
  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <Card
      className={cn(
        'relative transition-all duration-300 hover:scale-105 cursor-pointer',
        isHighlighted && 'border-blood-red shadow-glow-red animate-pulse-glow',
        className
      )}
      floating={true}
      glow={!isHighlighted}
    >
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {/* Header with type icon and name */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <span className="text-2xl sm:text-3xl flex-shrink-0 animate-float">
                {getTypeIcon(accessPoint.type)}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-bold text-ghost-green font-vt323 truncate hover:text-slime-green transition-colors">
                  {accessPoint.name}
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary font-vt323 capitalize">
                  {accessPoint.type}
                </p>
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="flex-shrink-0">
              <StatusIndicator
                status={getStatusIndicatorStatus(accessPoint.status)}
                label={accessPoint.status.toUpperCase()}
                pulse={accessPoint.status === 'open'}
              />
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-text-primary hover:text-ghost-green transition-colors">
            <span className="text-base sm:text-lg flex-shrink-0">📍</span>
            <span className="text-xs sm:text-sm font-vt323 truncate">{accessPoint.location}</span>
          </div>

          {/* Last status change timestamp */}
          <div className="flex items-center gap-2 text-text-secondary">
            <span className="text-base sm:text-lg flex-shrink-0">🕐</span>
            <span className="text-xs font-vt323">
              Last changed: {formatTimestamp(accessPoint.lastStatusChange)}
            </span>
          </div>

          {/* Monitoring status */}
          {accessPoint.monitoringEnabled && (
            <div className="flex items-center gap-2 text-toxic-purple text-xs font-vt323 bg-toxic-purple/10 p-2 rounded pixel-corners animate-fade-in">
              <span className="flex-shrink-0">👁️</span>
              <span className="truncate">Monitoring enabled (Alert after {accessPoint.alertThreshold}s)</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2 border-t-2 border-ghost-green/20">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(accessPoint);
              }}
              className="flex-1 hover:scale-110 transition-transform"
            >
              <span className="hidden sm:inline">✏️ Edit</span>
              <span className="sm:hidden">✏️</span>
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(accessPoint);
              }}
              className="flex-1 hover:scale-110 transition-transform"
            >
              <span className="hidden sm:inline">🗑️ Delete</span>
              <span className="sm:hidden">🗑️</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

import React from 'react';
import { cn } from '@/lib/utils/cn';

interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'danger' | 'info' | 'offline';
  label?: string;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  pulse = true,
  size = 'md',
  className,
}) => {
  const statusConfig = {
    success: {
      color: 'bg-slime-green',
      glow: 'shadow-glow-green',
      text: 'text-slime-green',
      icon: '✓',
    },
    warning: {
      color: 'bg-pumpkin-orange',
      glow: 'shadow-[0_0_15px_rgba(251,86,7,0.6)]',
      text: 'text-pumpkin-orange',
      icon: '⚠',
    },
    danger: {
      color: 'bg-blood-red',
      glow: 'shadow-glow-red',
      text: 'text-blood-red',
      icon: '✕',
    },
    info: {
      color: 'bg-toxic-purple',
      glow: 'shadow-glow-purple',
      text: 'text-toxic-purple',
      icon: 'ℹ',
    },
    offline: {
      color: 'bg-text-secondary',
      glow: 'shadow-none',
      text: 'text-text-secondary',
      icon: '○',
    },
  };

  const sizeMap = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const config = statusConfig[status];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'rounded-full',
          config.color,
          config.glow,
          sizeMap[size],
          pulse && 'animate-pulse-glow'
        )}
      />
      {label && (
        <span className={cn('text-sm font-bold font-vt323', config.text)}>
          {label}
        </span>
      )}
    </div>
  );
};

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  children,
  className,
}) => {
  const statusStyles = {
    success: 'bg-slime-green/20 text-slime-green border-slime-green',
    warning: 'bg-pumpkin-orange/20 text-pumpkin-orange border-pumpkin-orange',
    danger: 'bg-blood-red/20 text-blood-red border-blood-red',
    info: 'bg-toxic-purple/20 text-toxic-purple border-toxic-purple',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 text-xs font-bold border-2 rounded font-vt323',
        statusStyles[status],
        className
      )}
    >
      {children}
    </span>
  );
};

import React from 'react';
import { cn } from '@/lib/utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  type?: 'ghost' | 'skull' | 'bat';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  type = 'ghost',
  className,
}) => {
  const sizeMap = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  const iconMap = {
    ghost: '👻',
    skull: '💀',
    bat: '🦇',
  };

  const animationMap = {
    ghost: 'animate-spin-ghost',
    skull: 'animate-float-skull',
    bat: 'animate-spin',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          animationMap[type],
          sizeMap[size],
          'filter drop-shadow-[0_0_10px_rgba(57,255,20,0.6)]'
        )}
      >
        {iconMap[type]}
      </div>
    </div>
  );
};

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  lines = 3,
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-bg-medium border-2 border-ghost-green/30 rounded animate-pulse"
          style={{ width: `${100 - i * 10}%` }}
        />
      ))}
    </div>
  );
};

interface LoadingOverlayProps {
  message?: string;
  type?: 'ghost' | 'skull' | 'bat';
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Loading...',
  type = 'ghost',
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="text-center">
        <LoadingSpinner size="lg" type={type} />
        <p className="mt-4 text-xl text-ghost-green font-vt323 animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
};

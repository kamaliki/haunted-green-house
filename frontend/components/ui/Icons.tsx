import React from 'react';
import { cn } from '@/lib/utils/cn';

interface IconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

const sizeMap = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-3xl',
  xl: 'text-5xl',
};

export const GhostIcon: React.FC<IconProps> = ({ size = 'md', className, animate = false }) => {
  return (
    <span
      className={cn(
        sizeMap[size],
        animate && 'animate-float',
        'inline-block filter drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]',
        className
      )}
    >
      👻
    </span>
  );
};

export const SkullIcon: React.FC<IconProps> = ({ size = 'md', className, animate = false }) => {
  return (
    <span
      className={cn(
        sizeMap[size],
        animate && 'animate-pulse',
        'inline-block filter drop-shadow-[0_0_8px_rgba(255,0,110,0.6)]',
        className
      )}
    >
      💀
    </span>
  );
};

export const BatIcon: React.FC<IconProps> = ({ size = 'md', className, animate = false }) => {
  return (
    <span
      className={cn(
        sizeMap[size],
        animate && 'animate-float',
        'inline-block filter drop-shadow-[0_0_8px_rgba(157,78,221,0.5)]',
        className
      )}
    >
      🦇
    </span>
  );
};

export const SpiderIcon: React.FC<IconProps> = ({ size = 'md', className, animate = false }) => {
  return (
    <span
      className={cn(
        sizeMap[size],
        animate && 'animate-bounce',
        'inline-block filter drop-shadow-[0_0_8px_rgba(157,78,221,0.5)]',
        className
      )}
    >
      🕷️
    </span>
  );
};

export const CobwebIcon: React.FC<IconProps> = ({ size = 'md', className }) => {
  return (
    <span
      className={cn(
        sizeMap[size],
        'inline-block opacity-30',
        className
      )}
    >
      🕸️
    </span>
  );
};

export const PumpkinIcon: React.FC<IconProps> = ({ size = 'md', className, animate = false }) => {
  return (
    <span
      className={cn(
        sizeMap[size],
        animate && 'animate-pulse',
        'inline-block filter drop-shadow-[0_0_8px_rgba(251,86,7,0.6)]',
        className
      )}
    >
      🎃
    </span>
  );
};

export const TombstoneIcon: React.FC<IconProps> = ({ size = 'md', className }) => {
  return (
    <span
      className={cn(
        sizeMap[size],
        'inline-block filter drop-shadow-[0_0_8px_rgba(157,78,221,0.5)]',
        className
      )}
    >
      🪦
    </span>
  );
};

export const CandleIcon: React.FC<IconProps> = ({ size = 'md', className, animate = false }) => {
  return (
    <span
      className={cn(
        sizeMap[size],
        animate && 'animate-flicker',
        'inline-block filter drop-shadow-[0_0_8px_rgba(251,86,7,0.6)]',
        className
      )}
    >
      🕯️
    </span>
  );
};

export const EyeIcon: React.FC<IconProps> = ({ size = 'md', className, animate = false }) => {
  return (
    <span
      className={cn(
        sizeMap[size],
        animate && 'animate-pulse',
        'inline-block filter drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]',
        className
      )}
    >
      👁️
    </span>
  );
};

export const ZombieIcon: React.FC<IconProps> = ({ size = 'md', className, animate = false }) => {
  return (
    <span
      className={cn(
        sizeMap[size],
        animate && 'animate-float',
        'inline-block filter drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]',
        className
      )}
    >
      🧟
    </span>
  );
};

'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

export interface SensorThreshold {
  min: number;
  max: number;
  unit: string;
}

export interface SensorCardProps {
  zoneId: string;
  metric: string;
  value: number;
  unit: string;
  threshold?: SensorThreshold;
  trend?: 'up' | 'down' | 'stable';
  lastUpdate: Date;
  icon?: string;
  label: string;
}

/**
 * Sensor card component with spooky retro styling
 * Displays sensor value with threshold-based color coding and animations
 * Zone-aware component for displaying zone-specific sensor data
 */
export function SensorCard({
  zoneId,
  metric,
  value,
  unit,
  threshold,
  trend,
  lastUpdate,
  icon = '📊',
  label,
}: SensorCardProps) {
  // Determine threshold status and colors
  const thresholdStatus = useMemo(() => {
    if (!threshold) return 'normal';
    
    if (value < threshold.min || value > threshold.max) {
      return 'critical';
    }
    
    // Warning zone: within 10% of threshold
    const warningMargin = 0.1;
    const minWarning = threshold.min + (threshold.max - threshold.min) * warningMargin;
    const maxWarning = threshold.max - (threshold.max - threshold.min) * warningMargin;
    
    if (value <= minWarning || value >= maxWarning) {
      return 'warning';
    }
    
    return 'normal';
  }, [value, threshold]);

  // Get colors based on threshold status
  const colors = useMemo(() => {
    switch (thresholdStatus) {
      case 'critical':
        return {
          text: 'text-blood-red',
          border: 'border-blood-red',
          glow: 'shadow-[0_0_20px_rgba(255,0,110,0.6)]',
          progress: 'bg-blood-red',
          progressGlow: 'shadow-[0_0_15px_rgba(255,0,110,0.6)]',
        };
      case 'warning':
        return {
          text: 'text-pumpkin-orange',
          border: 'border-pumpkin-orange',
          glow: 'shadow-[0_0_20px_rgba(251,86,7,0.6)]',
          progress: 'bg-pumpkin-orange',
          progressGlow: 'shadow-[0_0_15px_rgba(251,86,7,0.6)]',
        };
      default:
        return {
          text: 'text-ghost-green',
          border: 'border-ghost-green',
          glow: 'shadow-[0_0_20px_rgba(57,255,20,0.6)]',
          progress: 'bg-ghost-green',
          progressGlow: 'shadow-glow-green',
        };
    }
  }, [thresholdStatus]);

  // Calculate progress percentage for visual indicator
  const progressPercentage = useMemo(() => {
    if (!threshold) return 50; // Default to 50% if no threshold
    
    const range = threshold.max - threshold.min;
    const normalizedValue = Math.max(0, Math.min(range, value - threshold.min));
    return (normalizedValue / range) * 100;
  }, [value, threshold]);

  // Get trend icon
  const trendIcon = useMemo(() => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  }, [trend]);

  // Format timestamp
  const timeAgo = useMemo(() => {
    const now = new Date();
    const diffMs = now.getTime() - lastUpdate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return `${Math.floor(diffSeconds / 3600)}h ago`;
  }, [lastUpdate]);

  return (
    <motion.div
      className={`
        retro-card fog-overlay
        ${colors.border}
        ${thresholdStatus === 'critical' ? 'animate-flicker-intense' : ''}
        ${colors.glow}
        transition-all duration-300
        hover:scale-105
        hover:animate-float
        hover:shadow-glow-intense
        touch-manipulation
        p-4 sm:p-5 md:p-6
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className={`font-press-start text-xs sm:text-xs ${colors.text}`}>
          {label.toUpperCase()}
        </h3>
        <span className="text-xl sm:text-2xl">{icon}</span>
      </div>

      {/* Value Display */}
      <div className="space-y-2 sm:space-y-3">
        <motion.div
          key={value} // Re-animate when value changes
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <p className={`font-vt323 text-3xl sm:text-4xl ${colors.text}`}>
            {typeof value === 'number' ? value.toFixed(1) : value}{unit}
          </p>
        </motion.div>

        {/* Progress Bar */}
        {threshold && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>{threshold.min}{threshold.unit}</span>
              <span>{threshold.max}{threshold.unit}</span>
            </div>
            <div className="h-2 bg-bg-darkest rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${colors.progress} ${colors.progressGlow}`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Status Info */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-text-secondary">Status:</span>
            <span className={`font-vt323 ${colors.text}`}>
              {thresholdStatus.toUpperCase()}
            </span>
          </div>
          
          {trend && (
            <div className="flex items-center gap-1">
              <span>{trendIcon}</span>
              <span className="text-text-secondary font-vt323">
                {trend.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Last Update */}
        <div className="text-xs text-text-secondary font-vt323">
          Updated: {timeAgo}
        </div>
      </div>

      {/* Cobweb decoration for spooky effect */}
      <div className="absolute top-0 right-0 text-lg opacity-20 pointer-events-none animate-cobweb-sway">
        🕸️
      </div>
    </motion.div>
  );
}